import { NextResponse } from "next/server";
import { getClubForUserOrCreate } from "@/lib/auth/getUserAndClub";
import { getSportmonksClient } from "@/lib/sportmonks";
import { ALLOWED_LEAGUES } from "@/lib/sportmonks/allowedLeagues";
import { getTeamActiveLeagueIds, mergeIncludes } from "@/lib/sportmonks/leagueFilters";
import { getPositionCode } from "@/lib/utils";

const CACHE_TTL_MS = 5 * 60 * 1000;

type FiltersPayload = {
  leagues: string[];
  positions: string[];
  targetRelatedOnly: boolean;
};

type TransferResponse = {
  id: string;
  playerId: number | null;
  playerName: string;
  fromClub: string;
  toClub: string;
  feeDisplay: string;
  position: string;
  league: string;
  timestamp: string;
  nationality: string;
  age: string;
  contract: string;
  seasonStats: string;
};

type CacheEntry = {
  expiresAt: number;
  data: {
    filters: FiltersPayload | null;
    transfers: TransferResponse[];
  };
};

const transferCache = new Map<string, CacheEntry>();
const leagueNameById: Map<number, string> = new Map(
  ALLOWED_LEAGUES.map((league) => [league.id, league.name] as [number, string])
);

function isValidFilters(payload: any): payload is FiltersPayload {
  if (!payload || typeof payload !== "object") return false;
  if (!Array.isArray(payload.leagues) || !Array.isArray(payload.positions)) return false;
  if (payload.leagues.length > 20 || payload.positions.length > 20) return false;
  if (typeof payload.targetRelatedOnly !== "boolean") return false;
  return (
    payload.leagues.every((item: unknown) => typeof item === "string") &&
    payload.positions.every((item: unknown) => typeof item === "string")
  );
}

function formatFee(amount: number | null | undefined, typeName?: string | null): string {
  if (typeName && typeName.toLowerCase().includes("loan")) return "Loan";
  if (amount === null || amount === undefined) return "Undisclosed";
  if (amount === 0) return "Free";
  if (amount >= 1_000_000) return `€${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `€${Math.round(amount / 1_000)}K`;
  return `€${amount}`;
}

function formatAge(dateOfBirth?: string | null): string {
  if (!dateOfBirth) return "N/A";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "N/A";
  const ageDiff = Date.now() - dob.getTime();
  const ageDate = new Date(ageDiff);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
  return age ? String(age) : "N/A";
}

async function resolveLeagueName(
  teamId: number | null | undefined,
  cache: Map<number, string>
): Promise<string> {
  if (!teamId) return "Unknown League";
  const cached = cache.get(teamId);
  if (cached) return cached;
  const client = getSportmonksClient();
  const teamResponse = await client.getTeamById(teamId, "activeSeasons");
  const leagueIds = getTeamActiveLeagueIds(teamResponse.data);
  const leagueId = leagueIds[0];
  const leagueName = leagueId ? leagueNameById.get(leagueId) || "Unknown League" : "Unknown League";
  cache.set(teamId, leagueName);
  return leagueName;
}

export async function GET() {
  try {
    const { club, supabase } = await getClubForUserOrCreate();
    const clubId = club.id;

    const cached = transferCache.get(clubId);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const { data: clubRow, error: clubError } = await supabase
      .from("clubs")
      .select("transfer_filters")
      .eq("id", clubId)
      .maybeSingle();

    if (clubError) {
      return NextResponse.json({ error: "Unable to load transfers" }, { status: 500 });
    }

    const filters = (clubRow as { transfer_filters?: FiltersPayload | null })
      ?.transfer_filters ?? null;

    const client = getSportmonksClient();
    const include = mergeIncludes(
      "player;player.position;player.detailedPosition;player.nationality;fromTeam;toTeam;type"
    );
    const response = await client.getLatestTransfers(include);
    const transfers = response.data || [];

    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const teamLeagueCache = new Map<number, string>();
    const normalized = await Promise.all(
      transfers
        .filter((transfer) => {
          if (!transfer.date) return false;
          return new Date(transfer.date).getTime() >= cutoff;
        })
        .slice(0, 25)
        .map(async (transfer) => {
          const fromTeam = transfer.fromTeam || transfer.fromteam || transfer.from_team;
          const toTeam = transfer.toTeam || transfer.toteam || transfer.to_team;
          const player = transfer.player;

          const leagueName = await resolveLeagueName(
            transfer.to_team_id || toTeam?.id,
            teamLeagueCache
          );
          const position =
            getPositionCode(
              player?.detailedPosition?.name || player?.position?.name || player?.position?.code
            ) || "?";

          return {
            id: String(transfer.id),
            playerId: transfer.player_id ?? player?.id ?? null,
            playerName: player?.name || transfer.player?.display_name || "Unknown Player",
            fromClub: fromTeam?.name || "Unknown club",
            toClub: toTeam?.name || "Unknown club",
            feeDisplay: formatFee(transfer.amount, transfer.type?.name || transfer.type?.developer_name),
            position: position || "?",
            league: leagueName,
            timestamp: transfer.date || new Date().toISOString(),
            nationality: player?.nationality?.name || "Unknown",
            age: formatAge(player?.date_of_birth),
            contract: "N/A",
            seasonStats: "2023/24 Season: N/A",
          } satisfies TransferResponse;
        })
    );

    const data = {
      filters,
      transfers: normalized.slice(0, 8),
    };

    transferCache.set(clubId, { expiresAt: Date.now() + CACHE_TTL_MS, data });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to load transfers:", error);
    return NextResponse.json({ error: "Unable to load transfers" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { club, supabase } = await getClubForUserOrCreate();
    const body = await request.json();

    if (!isValidFilters(body)) {
      return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
    }

    const { error } = await supabase
      .from("clubs")
      .update({ transfer_filters: body })
      .eq("id", club.id);

    if (error) {
      return NextResponse.json({ error: "Unable to save filters" }, { status: 500 });
    }

    const cached = transferCache.get(club.id);
    if (cached) {
      transferCache.set(club.id, {
        expiresAt: cached.expiresAt,
        data: { ...cached.data, filters: body },
      });
    }

    return NextResponse.json({ filters: body });
  } catch (error) {
    console.error("Failed to save filters:", error);
    return NextResponse.json({ error: "Unable to save filters" }, { status: 500 });
  }
}
