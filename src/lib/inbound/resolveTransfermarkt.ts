import { getSportmonksClient } from "@/lib/sportmonks";
import type { SportmonksPlayer } from "@/lib/sportmonks/types";
import { getCurrentTeam } from "@/lib/utils";

type TransfermarktHint = {
  slug?: string;
  tmId?: string;
};

export type TransfermarktParseResult = {
  kind: "player" | "unknown";
  hint?: TransfermarktHint;
};

export type PlayerCandidate = {
  id: number;
  name: string;
  current_team_name?: string | null;
};

export type ResolveCandidatesResult = {
  candidates: PlayerCandidate[];
  queryName?: string;
  error?: string;
};

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugToName(slug?: string | null): string | null {
  if (!slug) return null;
  const cleaned = slug
    .replace(/\d+/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || null;
}

export function parseTransfermarkt(url: string): TransfermarktParseResult {
  const match = url.match(
    /transfermarkt\.[^/]+\/(?:profil\/|spieler\/)([^/?#]+)?\/?(\d+)?/i
  );

  if (!match) {
    return { kind: "unknown" };
  }

  const slug = match[1] ?? undefined;
  const tmId = match[2] ?? undefined;

  return {
    kind: "player",
    hint: { slug, tmId },
  };
}

export async function resolvePlayerCandidates(
  input: { url: string }
): Promise<ResolveCandidatesResult> {
  const parsed = parseTransfermarkt(input.url);
  if (parsed.kind !== "player") {
    return { candidates: [], error: "Unsupported Transfermarkt URL" };
  }

  const queryName = slugToName(parsed.hint?.slug);
  if (!queryName) {
    return { candidates: [], error: "Missing player name in Transfermarkt URL" };
  }

  const client = getSportmonksClient();
  const response = await client.searchPlayers(queryName, "teams.team");
  const players = response?.data ?? [];

  const candidates = players.slice(0, 5).map((player: SportmonksPlayer) => {
    const team =
      getCurrentTeam(player)?.name ?? player.currentTeam?.name ?? null;
    return { id: player.id, name: player.name, current_team_name: team };
  });

  return { candidates, queryName };
}

export function isStrongCandidate(
  queryName: string,
  candidate: PlayerCandidate
): boolean {
  return normalizeName(candidate.name) === normalizeName(queryName);
}
