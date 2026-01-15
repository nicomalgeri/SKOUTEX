import type {
  SportmonksFixture,
  SportmonksLeague,
  SportmonksPlayer,
  SportmonksSeason,
  SportmonksTeam,
  SportmonksTeamPlayer,
  SportmonksTransfer,
} from "./types";
import { ALLOWED_LEAGUE_IDS } from "./allowedLeagues";

export function isAllowedLeagueId(id: number | null | undefined): boolean {
  if (typeof id !== "number") return false;
  return ALLOWED_LEAGUE_IDS.has(id);
}

export function mergeIncludes(
  ...includes: Array<string | null | undefined>
): string {
  const items = new Set<string>();
  includes.forEach((value) => {
    if (!value) return;
    value
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => items.add(part));
  });
  return Array.from(items).join(";");
}

export function getTeamActiveSeasons(
  team?: SportmonksTeam | null
): SportmonksSeason[] {
  if (!team) return [];
  const seasons =
    team.activeSeasons ||
    (team as SportmonksTeam & { activeseasons?: SportmonksSeason[] })
      .activeseasons;
  return Array.isArray(seasons) ? seasons : [];
}

export function getTeamActiveLeagueIds(
  team?: SportmonksTeam | null
): number[] {
  return getTeamActiveSeasons(team)
    .map((season) => season.league_id)
    .filter((id): id is number => typeof id === "number");
}

export function isTeamAllowed(team?: SportmonksTeam | null): boolean {
  const leagueIds = getTeamActiveLeagueIds(team);
  return leagueIds.some((id) => isAllowedLeagueId(id));
}

export function filterLeaguesByAllowed(
  leagues: SportmonksLeague[]
): SportmonksLeague[] {
  return leagues.filter((league) => isAllowedLeagueId(league.id));
}

export function filterFixturesByAllowed(
  fixtures: SportmonksFixture[]
): SportmonksFixture[] {
  return fixtures.filter((fixture) =>
    isAllowedLeagueId(fixture.league_id || fixture.league?.id)
  );
}

export function filterTeamsByAllowed<T extends SportmonksTeam | SportmonksTeamPlayer>(
  teams: T[]
): T[] {
  return teams.filter((team) =>
    isTeamAllowed((team as SportmonksTeamPlayer).team ?? (team as SportmonksTeam))
  );
}

export function isPlayerAllowed(player?: SportmonksPlayer | null): boolean {
  const teams = (player?.teams || []) as SportmonksTeamPlayer[];
  if (!Array.isArray(teams) || teams.length === 0) return false;
  return teams.some((team) => isTeamAllowed(team.team ?? (team as SportmonksTeam)));
}

export function filterPlayersByAllowed(
  players: SportmonksPlayer[]
): SportmonksPlayer[] {
  return players.filter(isPlayerAllowed).map((player) => ({
    ...player,
    teams: player.teams ? filterTeamsByAllowed(player.teams) : player.teams,
  }));
}

export function isTransferAllowed(
  transfer: SportmonksTransfer,
  teamLeagueIds?: Map<number, number[]>
): boolean {
  const fromTeam = transfer.fromTeam || transfer.fromteam || transfer.from_team;
  const toTeam = transfer.toTeam || transfer.toteam || transfer.to_team;

  const fromTeamIds =
    teamLeagueIds?.get(transfer.from_team_id) ||
    teamLeagueIds?.get(fromTeam?.id || -1) ||
    getTeamActiveLeagueIds(fromTeam);
  const toTeamIds =
    teamLeagueIds?.get(transfer.to_team_id) ||
    teamLeagueIds?.get(toTeam?.id || -1) ||
    getTeamActiveLeagueIds(toTeam);

  return (
    fromTeamIds.some((id) => isAllowedLeagueId(id)) ||
    toTeamIds.some((id) => isAllowedLeagueId(id))
  );
}
