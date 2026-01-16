export type CompetitionFilter =
  | "All"
  | "League"
  | "Cup"
  | "Europe"
  | "International";

type StatDetail = {
  type_id?: number;
  value?: {
    total?: number | string;
    goals?: number | string;
    penalties?: number | string;
    average?: number | string;
    home?: number | string;
    away?: number | string;
    all?: number | string;
    percentage?: number | string;
    won?: number | string;
    lost?: number | string;
  };
  type?: {
    name?: string;
    developer_name?: string;
    stat_group?: string;
  };
};

type PlayerStatistic = {
  season_id?: number;
  season?: { id?: number; name?: string; league?: { type?: string; sub_type?: string; name?: string } };
  team?: { name?: string };
  details?: StatDetail[];
};

type Transfer = {
  id?: number;
  date?: string;
  amount?: number | null;
  fromTeam?: { name?: string };
  toTeam?: { name?: string };
  fromteam?: { name?: string };
  toteam?: { name?: string };
  from_team?: { name?: string };
  to_team?: { name?: string };
  type?: { name?: string };
};

type Sidelined = {
  start_date?: string;
  end_date?: string;
  type?: { name?: string; developer_name?: string };
  completed?: boolean;
};

type Lineup = {
  fixture?: {
    name?: string;
    starting_at?: string;
    result_info?: string;
    league?: { name?: string };
  };
  details?: Array<{ type?: { name?: string }; data?: { value?: number | string } }>;
  team?: { name?: string };
};

const STAT_IDS = {
  appearances: 321,
  goals: 52,
  assists: 79,
  minutes: 119,
  passAccuracy: 83,
  keyPasses: 117,
  duelsWon: 98,
  tacklesWon: 90,
  interceptions: 91,
  clearances: 92,
  aerialWon: 88,
  shotsOnTarget: 85,
  dribblesWon: 86,
  progressivePasses: 171,
  progressiveCarries: 172,
  cleanSheets: 194,
  saves: 94,
};

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.\-]/g, "");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeText(value?: string): string {
  return value?.toLowerCase() ?? "";
}

function detailMatchesHint(detail: StatDetail, hints: string[]): boolean {
  if (!detail.type) return false;
  const haystack = `${detail.type.name ?? ""} ${detail.type.developer_name ?? ""}`.toLowerCase();
  return hints.some((hint) => haystack.includes(hint));
}

function getDetailValue(details: StatDetail[] | undefined, typeId: number, hints: string[] = []): number | null {
  if (!details || details.length === 0) return null;
  const byId = details.find((detail) => detail.type_id === typeId);
  if (byId?.value) {
    return (
      toNumber(byId.value.total) ??
      toNumber(byId.value.average) ??
      toNumber(byId.value.percentage) ??
      toNumber(byId.value.all)
    );
  }
  if (hints.length > 0) {
    const byName = details.find((detail) => detailMatchesHint(detail, hints));
    if (byName?.value) {
      return (
        toNumber(byName.value.total) ??
        toNumber(byName.value.average) ??
        toNumber(byName.value.percentage) ??
        toNumber(byName.value.all)
      );
    }
  }
  return null;
}

function average(values: Array<number | null>): number | null {
  const filtered = values.filter((value): value is number => value !== null);
  if (filtered.length === 0) return null;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function sum(values: Array<number | null>): number | null {
  const filtered = values.filter((value): value is number => value !== null);
  if (filtered.length === 0) return null;
  return filtered.reduce((sum, value) => sum + value, 0);
}

function matchesCompetition(stat: PlayerStatistic, filter: CompetitionFilter): boolean {
  if (filter === "All") return true;
  const subType = normalizeText(stat.season?.league?.sub_type || stat.season?.league?.type);
  if (!subType) return true;
  if (filter === "League") return subType.includes("league");
  if (filter === "Cup") return subType.includes("cup");
  if (filter === "Europe") {
    return subType.includes("europe") || subType.includes("continental") || subType.includes("uefa");
  }
  return subType.includes("international");
}

function collectSeasonKey(stat: PlayerStatistic): string | null {
  const seasonName = stat.season?.name;
  if (seasonName) return seasonName;
  if (stat.season_id) return String(stat.season_id);
  return null;
}

function parseSeasonYear(seasonName: string): number {
  const match = seasonName.match(/(\d{4})/);
  return match ? Number(match[1]) : 0;
}

export function getSeasonList(data: any): string[] {
  const stats = (data?.statistics ?? []) as PlayerStatistic[];
  const seasons = new Set<string>();
  for (const stat of stats) {
    const key = collectSeasonKey(stat);
    if (key) seasons.add(key);
  }
  const sorted = Array.from(seasons).sort((a, b) => parseSeasonYear(b) - parseSeasonYear(a));
  return ["Career Total", ...sorted];
}

export function getSeasonSummary(
  data: any,
  season: string,
  competitionFilter: CompetitionFilter
): {
  appearances: number | null;
  goals: number | null;
  assists: number | null;
  minutes: number | null;
  kpis: Array<{ label: string; value: number | null; format: "percent" | "number" | "per90" }>;
} | null {
  const stats = (data?.statistics ?? []) as PlayerStatistic[];
  if (stats.length === 0) return null;

  const filtered = stats.filter((stat) => {
    if (!matchesCompetition(stat, competitionFilter)) return false;
    if (season === "Career Total") return true;
    const key = collectSeasonKey(stat);
    return key === season;
  });

  if (filtered.length === 0) return null;

  const appearances = sum(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.appearances, ["appearance", "apps"])
    )
  );
  const goals = sum(
    filtered.map((stat) => getDetailValue(stat.details, STAT_IDS.goals, ["goal"]))
  );
  const assists = sum(
    filtered.map((stat) => getDetailValue(stat.details, STAT_IDS.assists, ["assist"]))
  );
  const minutes = sum(
    filtered.map((stat) => getDetailValue(stat.details, STAT_IDS.minutes, ["minute"]))
  );

  const passAccuracy = average(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.passAccuracy, ["pass accuracy", "pass completion"])
    )
  );
  const progressivePasses = average(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.progressivePasses, ["progressive pass"])
    )
  );
  const keyPasses = average(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.keyPasses, ["key pass"])
    )
  );
  const duelsWon = average(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.duelsWon, ["duel won", "duels won"])
    )
  );

  const tacklesWon = average(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.tacklesWon, ["tackle"])
    )
  );
  const interceptions = average(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.interceptions, ["interception"])
    )
  );
  const clearances = average(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.clearances, ["clearance"])
    )
  );
  const aerialWon = average(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.aerialWon, ["aerial", "aerial won"])
    )
  );

  const shotConversion = average(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.shotsOnTarget, ["shot on target", "shot accuracy"])
    )
  );
  const dribblesWon = average(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.dribblesWon, ["dribble", "dribbles won"])
    )
  );
  const progressiveCarries = average(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.progressiveCarries, ["progressive carry"])
    )
  );

  const saves = average(
    filtered.map((stat) => getDetailValue(stat.details, STAT_IDS.saves, ["save"]))
  );
  const cleanSheets = sum(
    filtered.map((stat) =>
      getDetailValue(stat.details, STAT_IDS.cleanSheets, ["clean sheet"])
    )
  );

  const positionName =
    data?.detailedPosition?.name || data?.position?.name || data?.position || "";
  const lowerPosition = String(positionName).toLowerCase();

  let kpis: Array<{ label: string; value: number | null; format: "percent" | "number" | "per90" }> = [];

  if (lowerPosition.includes("goal")) {
    kpis = [
      { label: "Save %", value: saves, format: "percent" },
      { label: "Clean Sheets", value: cleanSheets, format: "number" },
      { label: "Pass Completion", value: passAccuracy, format: "percent" },
      { label: "Duels Won %", value: duelsWon, format: "percent" },
    ];
  } else if (lowerPosition.includes("back") || lowerPosition.includes("defend")) {
    kpis = [
      { label: "Tackles Won %", value: tacklesWon, format: "percent" },
      { label: "Interceptions", value: interceptions, format: "number" },
      { label: "Clearances", value: clearances, format: "number" },
      { label: "Aerial %", value: aerialWon, format: "percent" },
    ];
  } else if (lowerPosition.includes("mid")) {
    kpis = [
      { label: "Pass Completion", value: passAccuracy, format: "percent" },
      { label: "Progressive Passes", value: progressivePasses, format: "per90" },
      { label: "Key Passes", value: keyPasses, format: "per90" },
      { label: "Duels Won %", value: duelsWon, format: "percent" },
    ];
  } else {
    kpis = [
      { label: "Shot Conversion", value: shotConversion, format: "percent" },
      { label: "xG Overperformance", value: null, format: "number" },
      { label: "Dribbles Won", value: dribblesWon, format: "per90" },
      { label: "Progressive Carries", value: progressiveCarries, format: "per90" },
    ];
  }

  return {
    appearances,
    goals,
    assists,
    minutes,
    kpis,
  };
}

export function getTransfersTimeline(data: any): Transfer[] {
  const transfers = (data?.transfers ?? []) as Transfer[];
  if (!Array.isArray(transfers)) return [];
  return [...transfers]
    .filter((transfer) => transfer.date)
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime());
}

function isSuspension(item: Sidelined): boolean {
  const label = `${item.type?.name ?? ""} ${item.type?.developer_name ?? ""}`.toLowerCase();
  return label.includes("suspension") || label.includes("red") || label.includes("yellow");
}

export function getInjuries(data: any): Sidelined[] {
  const sidelined = (data?.sidelined ?? []) as Sidelined[];
  if (!Array.isArray(sidelined)) return [];
  return sidelined.filter((item) => !isSuspension(item));
}

export function getSuspensions(data: any): Sidelined[] {
  const sidelined = (data?.sidelined ?? []) as Sidelined[];
  if (!Array.isArray(sidelined)) return [];
  return sidelined.filter((item) => isSuspension(item));
}

export function getLastMatches(data: any): Lineup[] {
  const lineups = (data?.lineups ?? data?.recentLineups ?? []) as Lineup[];
  if (!Array.isArray(lineups)) return [];
  return lineups
    .filter((lineup) => lineup.fixture?.starting_at)
    .sort(
      (a, b) =>
        new Date(b.fixture?.starting_at ?? 0).getTime() -
        new Date(a.fixture?.starting_at ?? 0).getTime()
    )
    .slice(0, 5);
}

export function getVideoLinks(data: any): string[] {
  const urls: string[] = [];
  const candidates = [data?.video_urls, data?.videos, data?.highlights];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        if (typeof item === "string") urls.push(item);
        if (typeof item?.url === "string") urls.push(item.url);
      }
    }
  }
  return Array.from(new Set(urls));
}

export function getSeasonStatsTable(data: any):
  | Array<{
      season: string;
      team?: string;
      appearances: number | null;
      goals: number | null;
      assists: number | null;
      minutes: number | null;
    }>
  | null {
  const stats = (data?.statistics ?? []) as PlayerStatistic[];
  if (stats.length === 0) return null;
  const rows: Array<{
    season: string;
    team?: string;
    appearances: number | null;
    goals: number | null;
    assists: number | null;
    minutes: number | null;
  }> = [];

  const seasonMap = new Map<string, PlayerStatistic[]>();
  for (const stat of stats) {
    const key = collectSeasonKey(stat);
    if (!key) continue;
    const list = seasonMap.get(key) ?? [];
    list.push(stat);
    seasonMap.set(key, list);
  }

  for (const [season, seasonStats] of seasonMap.entries()) {
    const appearances = sum(
      seasonStats.map((stat) =>
        getDetailValue(stat.details, STAT_IDS.appearances, ["appearance", "apps"])
      )
    );
    const goals = sum(
      seasonStats.map((stat) => getDetailValue(stat.details, STAT_IDS.goals, ["goal"]))
    );
    const assists = sum(
      seasonStats.map((stat) => getDetailValue(stat.details, STAT_IDS.assists, ["assist"]))
    );
    const minutes = sum(
      seasonStats.map((stat) => getDetailValue(stat.details, STAT_IDS.minutes, ["minute"]))
    );

    rows.push({
      season,
      team: seasonStats[0]?.team?.name,
      appearances,
      goals,
      assists,
      minutes,
    });
  }

  return rows.sort((a, b) => parseSeasonYear(b.season) - parseSeasonYear(a.season));
}
