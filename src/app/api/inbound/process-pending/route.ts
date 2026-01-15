import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isStrongCandidate,
  parseTransfermarkt,
  resolvePlayerCandidates,
  type PlayerCandidate,
} from "@/lib/inbound/resolveTransfermarkt";
import { sendMessage } from "@/lib/whatsapp/provider";
import { getPlayer } from "@/lib/sportmonks/players";
import { getCurrentTeam } from "@/lib/utils";

const MAX_BATCH = 10;

type InboundTargetRow = {
  id: string;
  club_id: string;
  source_url: string;
  status: string;
  updated_at?: string | null;
  resolve_attempts?: number | null;
  sportmonks_player_id?: number | null;
  fetch_attempts?: number | null;
};

function formatCandidateLine(candidate: PlayerCandidate, index: number) {
  const club = candidate.current_team_name ? ` - ${candidate.current_team_name}` : "";
  return `${index}) ${candidate.name}${club}`;
}

async function getLatestFromPhone(
  supabase: ReturnType<typeof createAdminClient>,
  clubId: string,
  sourceUrl: string
) {
  const { data } = await supabase
    .from("inbound_messages")
    .select("from_phone")
    .eq("club_id", clubId)
    .eq("transfermarkt_url", sourceUrl)
    .order("received_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.from_phone ?? null;
}

async function processTargets(request: NextRequest) {
  const expectedSecret = process.env.INTERNAL_JOB_SECRET;
  const providedSecret = request.headers.get("x-skoutex-secret");
  const authHeader = request.headers.get("authorization");

  // Also check query parameter for manual testing
  const url = new URL(request.url);
  const secretParam = url.searchParams.get("secret");

  // Check if this is a Vercel Cron request
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

  // Allow either Vercel Cron auth OR internal secret (header or query param)
  if (!isVercelCron) {
    if (!expectedSecret) {
      return NextResponse.json(
        { error: "Internal job secret not configured" },
        { status: 500 }
      );
    }

    const validSecret = providedSecret === expectedSecret || secretParam === expectedSecret;
    if (!validSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const staleThreshold = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: targets, error } = await supabase
    .from("inbound_targets")
    .select(
      "id, club_id, source_url, status, updated_at, resolve_attempts, sportmonks_player_id, fetch_attempts"
    )
    .or(
      `status.eq.RECEIVED,` +
        `and(status.eq.RESOLVING,updated_at.lt.${staleThreshold},resolve_attempts.lt.3),` +
        `and(status.eq.READY_FOR_FETCH,fetch_attempts.lt.3)`
    )
    .order("created_at", { ascending: true })
    .limit(MAX_BATCH);

  if (error) {
    return NextResponse.json(
      { error: "Failed to load inbound targets" },
      { status: 500 }
    );
  }

  for (const target of (targets ?? []) as InboundTargetRow[]) {
    if (target.status === "READY_FOR_FETCH") {
      const attempts = (target.fetch_attempts ?? 0) + 1;
      if (attempts >= 3) {
        await supabase
          .from("inbound_targets")
          .update({
            status: "FAILED",
            last_error: "Fetch attempts exceeded",
          })
          .eq("id", target.id);
        continue;
      }

      await supabase
        .from("inbound_targets")
        .update({
          fetch_attempts: attempts,
          last_fetch_attempt_at: new Date().toISOString(),
        })
        .eq("id", target.id);

      if (!target.sportmonks_player_id) {
        await supabase
          .from("inbound_targets")
          .update({
            status: "FAILED",
            last_error: "Missing Sportmonks player id",
          })
          .eq("id", target.id);
        continue;
      }

      try {
        const player = await getPlayer(target.sportmonks_player_id);
        const currentTeam = getCurrentTeam(player)?.name ?? null;
        const payload = {
          club_id: target.club_id,
          sportmonks_player_id: player.id,
          name: player.name,
          current_team: currentTeam,
          position: player.position?.name ?? null,
          nationality: player.nationality?.name ?? null,
          dob: player.date_of_birth ?? null,
          data: player,
          last_fetched_at: new Date().toISOString(),
        };

        const { data: saved, error: saveError } = await supabase
          .from("players")
          .upsert(payload, { onConflict: "club_id,sportmonks_player_id" })
          .select("id")
          .single();

        if (saveError || !saved?.id) {
          throw saveError || new Error("Failed to save player");
        }

        await supabase
          .from("inbound_targets")
          .update({
            player_id: saved.id,
            status: "READY",
            last_error: null,
          })
          .eq("id", target.id);
      } catch (fetchError) {
        await supabase
          .from("inbound_targets")
          .update({
            status: "FAILED",
            last_error: "Failed to fetch Sportmonks player",
          })
          .eq("id", target.id);
      }

      continue;
    }

    const attempts = (target.resolve_attempts ?? 0) + 1;
    if (attempts >= 3) {
      await supabase
        .from("inbound_targets")
        .update({
          status: "FAILED",
          last_error: "Resolution attempts exceeded",
        })
        .eq("id", target.id);
      continue;
    }

    await supabase
      .from("inbound_targets")
      .update({
        status: "RESOLVING",
        last_error: null,
        resolve_attempts: attempts,
        last_attempt_at: new Date().toISOString(),
      })
      .eq("id", target.id);

    const parsed = parseTransfermarkt(target.source_url);
    if (parsed.kind !== "player") {
      await supabase
        .from("inbound_targets")
        .update({ status: "FAILED", last_error: "Unsupported URL" })
        .eq("id", target.id);
      continue;
    }

    const { candidates, queryName, error: resolveError } =
      await resolvePlayerCandidates({ url: target.source_url });

    if (resolveError || candidates.length === 0 || !queryName) {
      await supabase
        .from("inbound_targets")
        .update({
          status: "FAILED",
          last_error: resolveError ?? "No candidates found",
        })
        .eq("id", target.id);

      const fromPhone = await getLatestFromPhone(
        supabase,
        target.club_id,
        target.source_url
      );
      if (fromPhone) {
        try {
          await sendMessage(
            fromPhone,
            "Could not match this player. Reply with full name + current club."
          );
        } catch (sendError) {
          console.error("[whatsapp:send] failed", {
            targetId: target.id,
            fromPhone,
            error: sendError,
          });
        }
      }
      continue;
    }

    const strong = candidates.find((candidate) =>
      isStrongCandidate(queryName, candidate)
    );

    if (strong || candidates.length === 1) {
      const chosen = strong ?? candidates[0];
      await supabase
        .from("inbound_targets")
        .update({
          status: "READY_FOR_FETCH",
          sportmonks_player_id: chosen.id,
          player_name: chosen.name,
        })
        .eq("id", target.id);
      continue;
    }

    await supabase
      .from("inbound_targets")
      .update({
        status: "NEEDS_CONFIRMATION",
        resolution_candidates: candidates,
        last_error: null,
      })
      .eq("id", target.id);

    const fromPhone = await getLatestFromPhone(
      supabase,
      target.club_id,
      target.source_url
    );
    if (fromPhone) {
      const code = target.id.slice(0, 6).toUpperCase();
      const lines = candidates
        .slice(0, 5)
        .map((candidate, index) => formatCandidateLine(candidate, index + 1))
        .join("\n");
      try {
        await sendMessage(
          fromPhone,
          `Multiple matches for ${queryName}. Reply with: ${code} 1 (or ${code} 2, ${code} 3)\n${lines}`
        );
      } catch (sendError) {
        console.error("[whatsapp:send] failed", {
          targetId: target.id,
          fromPhone,
          error: sendError,
        });
      }
    }
  }

  return NextResponse.json({ ok: true, processed: targets?.length ?? 0 });
}

export async function POST(request: NextRequest) {
  return processTargets(request);
}

export async function GET(request: NextRequest) {
  return processTargets(request);
}
