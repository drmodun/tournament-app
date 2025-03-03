export type TournamentType =
  | "single_elimination"
  | "double_elimination"
  | "round_robin"
  | "swiss"
  | "free_for_all"
  | "time_trail"
  | "grand_prix";
export type TournamentState = "pending" | "in_progress" | "ended";
export type MatchState = "pending" | "open" | "complete";
export type RoundRobinRanking =
  | ""
  | "match wins"
  | "game wins"
  | "game win percentage"
  | "points scored"
  | "points difference"
  | "custom";
export type GrandFinalsModifier = "" | "skip" | "single match";

export interface ITimestamps {
  created_at: string;
  updated_at: string;
  starts_at?: string;
  completed_at?: string;
}

export interface INotificationOptions {
  upon_matches_open: boolean;
  upon_tournament_ends: boolean;
}

export interface IRegistrationOptions {
  open_signup: boolean;
  signup_cap?: number;
  check_in_duration?: number;
}

export interface ISeedingOptions {
  hide_seeds: boolean;
  sequential_pairings: boolean;
}

export interface IStationOptions {
  auto_assign: boolean;
  only_start_matches_with_assigned_stations: boolean;
}

export interface IGroupStageOptions {
  stage_type: "round_robin" | "single_elimination" | "double_elimination";
  group_size: number;
  participant_count_to_advance_per_group: number;
  rr_iterations: number;
  ranked_by: RoundRobinRanking;
  rr_pts_for_match_win: number;
  rr_pts_for_match_tie: number;
  rr_pts_for_game_win: number;
  rr_pts_for_game_tie: number;
  split_participants: boolean;
}

export interface IDoubleEliminationOptions {
  split_participants: boolean;
  grand_finals_modifier: GrandFinalsModifier;
}

export interface IRoundRobinOptions {
  iterations: number;
  ranking: RoundRobinRanking;
  pts_for_game_win: number;
  pts_for_game_tie: number;
  pts_for_match_win: number;
  pts_for_match_tie: number;
}

export interface ISwissOptions {
  rounds: number;
  pts_for_game_win: number;
  pts_for_game_tie: number;
  pts_for_match_win: number;
  pts_for_match_tie: number;
}

export interface IFreeForAllOptions {
  max_participants: number;
}

export interface IMatchPoints {
  participant_id: number;
  scores: number[];
}

export interface IRelationshipData {
  id: string;
  type: string;
}

export interface IRelationship {
  data: IRelationshipData;
  links?: {
    related: string;
  };
}

export interface ILinks {
  self: string;
}
