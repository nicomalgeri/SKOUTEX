// Sportmonks API Response Types

export interface SportmonksResponse<T> {
  data: T;
  pagination?: SportmonksPagination;
  subscription?: SportmonksSubscription[];
  rate_limit?: SportmonksRateLimit;
  timezone?: string;
}

export interface SportmonksPagination {
  count: number;
  per_page: number;
  current_page: number;
  next_page?: string;
  has_more: boolean;
}

export interface SportmonksSubscription {
  meta: {
    trial_ends_at?: string;
    ends_at?: string;
    current_timestamp: number;
  };
  plans: SportmonksPlan[];
  add_ons: unknown[];
  widgets: unknown[];
}

export interface SportmonksPlan {
  plan: string;
  sport: string;
  category: string;
}

export interface SportmonksRateLimit {
  resets_in_seconds: number;
  remaining: number;
  requested_entity: string;
}

// Core Entities

export interface SportmonksPlayer {
  id: number;
  sport_id: number;
  country_id: number;
  nationality_id: number;
  city_id?: number;
  position_id: number;
  detailed_position_id?: number;
  type_id: number;
  common_name: string;
  firstname: string;
  lastname: string;
  name: string;
  display_name: string;
  image_path: string;
  height?: number;
  weight?: number;
  date_of_birth: string;
  gender: string;
  market_value?: number;
  // Included relations
  country?: SportmonksCountry;
  nationality?: SportmonksCountry;
  position?: SportmonksPosition;
  detailedPosition?: SportmonksDetailedPosition;
  currentTeam?: SportmonksTeam;
  teams?: SportmonksTeamPlayer[];
  statistics?: SportmonksPlayerStatistic[];
  transfers?: SportmonksTransfer[];
  latest?: SportmonksPlayerStatistic;
  metadata?: SportmonksMetadata[];
  lineups?: SportmonksLineup[];
  trophies?: SportmonksTrophy[];
  sidelined?: SportmonksSidelined[];
}

export interface SportmonksSidelined {
  id: number;
  player_id: number;
  type_id: number;
  team_id?: number;
  season_id?: number;
  start_date: string;
  end_date?: string;
  completed?: boolean;
  type?: {
    id: number;
    name: string;
    code: string;
    developer_name: string;
    model_type: string;
  };
}

export interface SportmonksCountry {
  id: number;
  continent_id: number;
  name: string;
  official_name: string;
  fifa_name?: string;
  iso2: string;
  iso3: string;
  latitude?: string;
  longitude?: string;
  borders?: string[];
  image_path: string;
}

export interface SportmonksPosition {
  id: number;
  name: string;
  code: string;
  developer_name: string;
  model_type: string;
  stat_group?: string;
}

export interface SportmonksDetailedPosition {
  id: number;
  name: string;
  code: string;
  developer_name: string;
  model_type: string;
}

export interface SportmonksTeam {
  id: number;
  sport_id: number;
  country_id: number;
  venue_id?: number;
  gender: string;
  name: string;
  short_code?: string;
  image_path: string;
  founded?: number;
  type: string;
  placeholder: boolean;
  last_played_at?: string;
  // Included relations
  country?: SportmonksCountry;
  venue?: SportmonksVenue;
  players?: SportmonksTeamPlayer[];
  coaches?: SportmonksCoach[];
  seasons?: SportmonksSeason[];
  activeSeasons?: SportmonksSeason[];
  activeseasons?: SportmonksSeason[];
  statistics?: SportmonksTeamStatistic[];
  latest?: SportmonksFixture[];
  upcoming?: SportmonksFixture[];
}

export interface SportmonksTeamPlayer extends SportmonksTeam {
  pivot?: {
    player_id: number;
    team_id: number;
    start?: string;
    end?: string | null;
    captain?: boolean;
    jersey_number?: number;
  };
  transfer_id?: number;
  player_id?: number;
  position_id?: number;
  detailed_position_id?: number;
  start?: string;
  end?: string;
  captain?: boolean;
  jersey_number?: number;
  // Included relations
  player?: SportmonksPlayer;
  team?: SportmonksTeam;
  position?: SportmonksPosition;
}

export interface SportmonksVenue {
  id: number;
  country_id: number;
  city_id?: number;
  name: string;
  address?: string;
  zipcode?: string;
  latitude?: string;
  longitude?: string;
  capacity?: number;
  image_path?: string;
  city_name?: string;
  surface?: string;
  national_team: boolean;
}

export interface SportmonksLeague {
  id: number;
  sport_id: number;
  country_id: number;
  name: string;
  active: boolean;
  short_code?: string;
  image_path: string;
  type: string;
  sub_type: string;
  last_played_at?: string;
  category: number;
  has_jerseys: boolean;
  // Included relations
  country?: SportmonksCountry;
  currentSeason?: SportmonksSeason;
  seasons?: SportmonksSeason[];
}

export interface SportmonksSeason {
  id: number;
  sport_id: number;
  league_id: number;
  tie_breaker_rule_id?: number;
  name: string;
  finished: boolean;
  pending: boolean;
  is_current: boolean;
  starting_at?: string;
  ending_at?: string;
  standings_recalculated_at?: string;
  games_in_current_week: boolean;
  // Included relations
  league?: SportmonksLeague;
  stages?: SportmonksStage[];
}

export interface SportmonksStage {
  id: number;
  sport_id: number;
  league_id: number;
  season_id: number;
  type_id: number;
  name: string;
  sort_order: number;
  finished: boolean;
  is_current: boolean;
  starting_at?: string;
  ending_at?: string;
  games_in_current_week: boolean;
}

export interface SportmonksFixture {
  id: number;
  sport_id: number;
  league_id: number;
  season_id: number;
  stage_id: number;
  group_id?: number;
  aggregate_id?: number;
  round_id?: number;
  state_id: number;
  venue_id?: number;
  name: string;
  starting_at: string;
  result_info?: string;
  leg: string;
  details?: string;
  length?: number;
  placeholder: boolean;
  has_odds: boolean;
  starting_at_timestamp: number;
  // Included relations
  league?: SportmonksLeague;
  season?: SportmonksSeason;
  stage?: SportmonksStage;
  venue?: SportmonksVenue;
  state?: SportmonksState;
  participants?: SportmonksParticipant[];
  scores?: SportmonksScore[];
  events?: SportmonksEvent[];
  lineups?: SportmonksLineup[];
  statistics?: SportmonksFixtureStatistic[];
  timeline?: SportmonksTimeline[];
}

export interface SportmonksState {
  id: number;
  state: string;
  name: string;
  short_name: string;
  developer_name: string;
}

export interface SportmonksParticipant {
  id: number;
  sport_id: number;
  country_id: number;
  venue_id?: number;
  gender: string;
  name: string;
  short_code?: string;
  image_path: string;
  founded?: number;
  type: string;
  placeholder: boolean;
  last_played_at?: string;
  meta: {
    location: "home" | "away";
    winner?: boolean;
    position?: number;
  };
}

export interface SportmonksScore {
  id: number;
  fixture_id: number;
  type_id: number;
  participant_id: number;
  score: {
    goals: number;
    participant: string;
  };
  description: string;
}

export interface SportmonksEvent {
  id: number;
  fixture_id: number;
  period_id: number;
  participant_id: number;
  type_id: number;
  section: string;
  player_id?: number;
  related_player_id?: number;
  player_name?: string;
  related_player_name?: string;
  result?: string;
  info?: string;
  addition?: string;
  minute: number;
  extra_minute?: number;
  injured?: boolean;
  on_bench: boolean;
  coach_id?: number;
  sub_type_id?: number;
}

export interface SportmonksLineup {
  id: number;
  sport_id: number;
  fixture_id: number;
  player_id: number;
  team_id: number;
  position_id: number;
  formation_field?: string;
  type_id: number;
  formation_position?: number;
  player_name: string;
  jersey_number: number;
  // Included relations
  player?: SportmonksPlayer;
  team?: SportmonksTeam;
  position?: SportmonksPosition;
  details?: SportmonksLineupDetail[];
}

export interface SportmonksLineupDetail {
  id: number;
  fixture_id: number;
  player_id: number;
  team_id: number;
  lineup_id: number;
  type_id: number;
  data: {
    value: number | string;
  };
  type?: SportmonksType;
}

export interface SportmonksType {
  id: number;
  name: string;
  code: string;
  developer_name: string;
  model_type: string;
  stat_group?: string;
}

export interface SportmonksPlayerStatistic {
  id: number;
  player_id: number;
  team_id: number;
  season_id: number;
  has_values: boolean;
  position_id?: number;
  jersey_number?: number;
  details?: SportmonksStatisticDetail[];
  // Included relations
  season?: SportmonksSeason;
  team?: SportmonksTeam;
}

export interface SportmonksStatisticDetail {
  id: number;
  player_statistic_id: number;
  type_id: number;
  value: {
    total?: number;
    goals?: number;
    penalties?: number;
    average?: number;
    home?: number;
    away?: number;
    all?: number;
    percentage?: number;
    won?: number;
    lost?: number;
  };
  type?: SportmonksType;
}

export interface SportmonksTeamStatistic {
  id: number;
  team_id: number;
  season_id: number;
  has_values: boolean;
  details?: SportmonksStatisticDetail[];
}

export interface SportmonksFixtureStatistic {
  id: number;
  fixture_id: number;
  type_id: number;
  participant_id: number;
  data: {
    value: number | string;
  };
  location: "home" | "away";
  type?: SportmonksType;
}

export interface SportmonksTransfer {
  id: number;
  sport_id: number;
  player_id: number;
  type_id: number;
  from_team_id: number;
  to_team_id: number;
  position_id?: number;
  detailed_position_id?: number;
  date: string;
  career_ended: boolean;
  completed: boolean;
  amount?: number;
  // Included relations
  player?: SportmonksPlayer;
  fromTeam?: SportmonksTeam;
  toTeam?: SportmonksTeam;
  fromteam?: SportmonksTeam;
  toteam?: SportmonksTeam;
  from_team?: SportmonksTeam;
  to_team?: SportmonksTeam;
  type?: SportmonksType;
}

export interface SportmonksCoach {
  id: number;
  sport_id: number;
  country_id: number;
  nationality_id?: number;
  city_id?: number;
  common_name: string;
  firstname: string;
  lastname: string;
  name: string;
  display_name: string;
  image_path: string;
  height?: number;
  weight?: number;
  date_of_birth?: string;
  gender: string;
}

export interface SportmonksStanding {
  id: number;
  participant_id: number;
  sport_id: number;
  league_id: number;
  season_id: number;
  stage_id: number;
  group_id?: number;
  round_id?: number;
  standing_rule_id?: number;
  position: number;
  result?: string;
  points: number;
  // Included relations
  participant?: SportmonksTeam;
  form?: SportmonksForm[];
  details?: SportmonksStandingDetail[];
}

export interface SportmonksStandingDetail {
  id: number;
  standing_id: number;
  standing_rule_id: number;
  type_id: number;
  value: number;
  type?: SportmonksType;
}

export interface SportmonksForm {
  fixture_id: number;
  fixture?: SportmonksFixture;
  result: string;
}

export interface SportmonksMetadata {
  id: number;
  metadatable_id: number;
  type_id: number;
  value_type: string;
  values: unknown;
  type?: SportmonksType;
}

export interface SportmonksTrophy {
  id: number;
  sport_id: number;
  player_id?: number;
  coach_id?: number;
  team_id?: number;
  league_id: number;
  season_id: number;
  name: string;
  status: string;
  place?: number;
  // Included relations
  league?: SportmonksLeague;
  season?: SportmonksSeason;
}

export interface SportmonksTimeline {
  id: number;
  fixture_id: number;
  type_id: number;
  participant_id?: number;
  period_id: number;
  timestamp: string;
  sort_order: number;
  minute: number;
  extra_minute?: number;
  info?: string;
  addition?: string;
  player_id?: number;
  related_player_id?: number;
  result?: string;
  type?: SportmonksType;
}
