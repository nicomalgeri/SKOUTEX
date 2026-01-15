import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMessage } from "@/lib/whatsapp/provider";

type ParsedInbound = {
  fromPhone: string | null;
  text: string;
};

const RESPONSE_TEXT = "Received. Fetching player into SKOUTEX.";
const CONFIRM_TEXT = "Confirmed. Fetching player into SKOUTEX now.";
const DUPLICATE_TEXT = "Already received. Check Inbound Targets in SKOUTEX.";
const AMBIGUOUS_REPLY_TEXT =
  "Multiple pending confirmations. Reply with the code shown in the message, e.g. ABC123 1";
const REPLY_REGEX = /^[1-5]$/;
const CODE_REPLY_REGEX = /^([A-Za-z0-9]{6})\s+([1-5])$/;

function parseInbound(body: Record<string, unknown>): ParsedInbound | null {
  if (typeof body.Body === "string" && typeof body.From === "string") {
    return {
      fromPhone: body.From,
      text: body.Body,
    };
  }

  const metaMessage =
    (body as any)?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (metaMessage) {
    return {
      fromPhone: metaMessage.from ?? null,
      text: metaMessage.text?.body ?? "",
    };
  }

  if (typeof body.from === "string" && typeof body.text === "string") {
    return {
      fromPhone: body.from,
      text: body.text,
    };
  }

  return null;
}

function extractTransfermarktUrl(text: string): string | null {
  const tmRegex =
    /((?:https?:\/\/)?(?:www\.)?[^ \n]*transfermarkt\.[^ \n/]+[^ \n]*(?:\/profil\/|\/spieler\/)[^ \n]*)/i;
  const match = text.match(tmRegex);
  if (!match?.[1]) return null;

  let url = match[1].trim();
  url = url.replace(/[)\].,!?]+$/g, "");
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
}

async function resolveClubId(supabase: ReturnType<typeof createAdminClient>) {
  const defaultClubId = process.env.DEFAULT_CLUB_ID?.trim();
  if (defaultClubId) {
    return defaultClubId;
  }

  // TODO: Map inbound phone number to club id (Implemented in STEP 8).
  return null;
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
  const providedSecret = request.headers.get("x-skoutex-secret");

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseInbound(body);
  if (!parsed || !parsed.text.trim()) {
    return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const clubId = await resolveClubId(supabase);
  if (!clubId) {
    return NextResponse.json(
      { error: "DEFAULT_CLUB_ID not configured" },
      { status: 500 }
    );
  }

  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("id, whatsapp_ingest_enabled")
    .eq("id", clubId)
    .maybeSingle();

  if (clubError || !club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  if (!club.whatsapp_ingest_enabled) {
    return NextResponse.json(
      { error: "WhatsApp ingest disabled" },
      { status: 403 }
    );
  }

  const trimmedText = parsed.text.trim();
  const codeMatch = trimmedText.match(CODE_REPLY_REGEX);
  const isLegacyReply = REPLY_REGEX.test(trimmedText);

  if (codeMatch || isLegacyReply) {
    const replyChoice = codeMatch ? codeMatch[2] : trimmedText;
    const choiceIndex = Number(replyChoice) - 1;
    let pendingTarget:
      | { id: string; resolution_candidates: unknown }
      | null = null;

    if (codeMatch) {
      const code = codeMatch[1].toLowerCase();
      const { data: targets, error: targetError } = await supabase
        .from("inbound_targets")
        .select("id, resolution_candidates")
        .eq("club_id", clubId)
        .eq("status", "NEEDS_CONFIRMATION")
        .ilike("id", `${code}%`)
        .limit(2);
      if (targetError || !targets || targets.length === 0) {
        return NextResponse.json(
          { error: "No matching confirmation target" },
          { status: 404 }
        );
      }
      if (targets.length > 1) {
        if (parsed.fromPhone) {
          try {
            await sendMessage(parsed.fromPhone, AMBIGUOUS_REPLY_TEXT);
          } catch (sendError) {
            console.error("[whatsapp:send] failed", {
              targetId: "unknown",
              fromPhone: parsed.fromPhone,
              error: sendError,
            });
          }
        }
        return NextResponse.json({
          ok: true,
          detected: false,
          transfermarkt_url: null,
        });
      }
      pendingTarget = targets[0] ?? null;
    } else {
      const { data: pendingTargets, error: pendingError } = await supabase
        .from("inbound_targets")
        .select("id, resolution_candidates")
        .eq("club_id", clubId)
        .eq("status", "NEEDS_CONFIRMATION")
        .order("updated_at", { ascending: false })
        .limit(2);

      if (pendingError || !pendingTargets || pendingTargets.length === 0) {
        return NextResponse.json(
          { error: "No pending confirmation target" },
          { status: 404 }
        );
      }

      if (pendingTargets.length > 1) {
        if (parsed.fromPhone) {
          try {
            await sendMessage(parsed.fromPhone, AMBIGUOUS_REPLY_TEXT);
          } catch (sendError) {
            console.error("[whatsapp:send] failed", {
              targetId: "unknown",
              fromPhone: parsed.fromPhone,
              error: sendError,
            });
          }
        }
        return NextResponse.json({
          ok: true,
          detected: false,
          transfermarkt_url: null,
        });
      }

      pendingTarget = pendingTargets[0] ?? null;
    }

    if (!pendingTarget) {
      return NextResponse.json(
        { error: "No pending confirmation target" },
        { status: 404 }
      );
    }

    const candidates = Array.isArray(pendingTarget.resolution_candidates)
      ? pendingTarget.resolution_candidates
      : [];
    const chosen = candidates[choiceIndex] as
      | { id?: number; name?: string }
      | undefined;

    if (!chosen?.id || !chosen?.name) {
      return NextResponse.json({ error: "Invalid selection" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("inbound_targets")
      .update({
        sportmonks_player_id: chosen.id,
        player_name: chosen.name,
        status: "READY_FOR_FETCH",
      })
      .eq("id", pendingTarget.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to confirm inbound target" },
        { status: 500 }
      );
    }

    const { error: replyError } = await supabase.from("inbound_messages").insert({
      club_id: clubId,
      from_phone: parsed.fromPhone,
      raw_text: parsed.text,
      transfermarkt_url: null,
      reply_to_target_id: pendingTarget.id,
      parsed_reply: trimmedText,
    });

    if (replyError) {
      return NextResponse.json(
        { error: "Failed to save inbound reply" },
        { status: 500 }
      );
    }

    if (parsed.fromPhone) {
      try {
        await sendMessage(parsed.fromPhone, CONFIRM_TEXT);
      } catch (sendError) {
        console.error("[whatsapp:send] failed", {
          targetId: pendingTarget.id,
          fromPhone: parsed.fromPhone,
          error: sendError,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      detected: false,
      transfermarkt_url: null,
    });
  }

  const transfermarktUrl = extractTransfermarktUrl(parsed.text);
  const detected = Boolean(transfermarktUrl);

  const { error: inboundError } = await supabase.from("inbound_messages").insert({
    club_id: clubId,
    from_phone: parsed.fromPhone,
    raw_text: parsed.text,
    transfermarkt_url: transfermarktUrl,
  });

  if (inboundError) {
    return NextResponse.json(
      { error: "Failed to save inbound message" },
      { status: 500 }
    );
  }

  if (transfermarktUrl) {
    const { data: existingTarget } = await supabase
      .from("inbound_targets")
      .select("id")
      .eq("club_id", clubId)
      .eq("source_url", transfermarktUrl)
      .in("status", [
        "RECEIVED",
        "RESOLVING",
        "NEEDS_CONFIRMATION",
        "READY_FOR_FETCH",
      ])
      .maybeSingle();

    if (existingTarget) {
      if (parsed.fromPhone) {
        try {
          await sendMessage(parsed.fromPhone, DUPLICATE_TEXT);
        } catch (sendError) {
          console.error("[whatsapp:send] failed", {
            targetId: existingTarget.id,
            fromPhone: parsed.fromPhone,
            error: sendError,
          });
        }
      }
      return NextResponse.json({
        ok: true,
        detected: true,
        transfermarkt_url: transfermarktUrl,
      });
    }

    const { error: targetError } = await supabase.from("inbound_targets").insert({
      club_id: clubId,
      source: "whatsapp_transfermarkt",
      source_url: transfermarktUrl,
      status: "RECEIVED",
    });

    if (targetError) {
      return NextResponse.json(
        { error: "Failed to create inbound target" },
        { status: 500 }
      );
    }
  }

  if (parsed.fromPhone) {
    try {
      await sendMessage(parsed.fromPhone, RESPONSE_TEXT);
    } catch (sendError) {
      console.error("[whatsapp:send] failed", {
        targetId: "unknown",
        fromPhone: parsed.fromPhone,
        error: sendError,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    detected,
    transfermarkt_url: transfermarktUrl,
  });
}
