import { matchupBracketEnumType } from "../enums";
import { IGroupInviteWithUserResponse } from "src/groupInvites";
import {
  IExtendedRosterResponse,
  IMiniRosterResponse,
  IMiniRosterResponseWithChallongeId,
  IRosterResponse,
} from "src/roster/responses.dto";

export interface IMatchupResponse {
  id: number;
  stageId: number;
  round: number;
  // Set for matchups of a double-elimination stage run by the API
  bracket?: matchupBracketEnumType | null;
  matchupType: string;
  startDate: Date;
  isFinished: boolean;
}

export interface IMatchupResponseWithChallongeId extends IMatchupResponse {
  challongeId: string;
}

export interface IMatchupResponseWithRosters extends IMatchupResponse {
  rosters: IRosterResponse[];
}

export interface IResultsResponse {
  id: number;
  matchupId: number;
  score: number;
  isWinner: boolean;
  roster: IRosterResponse;
}

export interface ICompactResultsResponse {
  id: number;
  matchupId: number;
  score: number;
  isWinner: boolean;
  roster: IMiniRosterResponse;
}

export interface IScoreResponse {
  matchupId: number;
  roundNumber: number;
  points: number;
  isWinner: boolean;
}

export interface IMatchupsWithMiniRostersResponse extends IMatchupResponse {
  rosters: IRosterResponse[];
}

export interface IResultsResponseWithScores extends IMatchupResponse {
  scores: IScoreResponse[];
}

export interface IMatchupResponseWithResults extends IMatchupResponse {
  results: IResultsResponse[];
}

export interface IMatchupResponseWithResultsAndScores extends IMatchupResponse {
  results: IResultsResponseWithScores[];
}

export enum MatchupResponsesEnum {
  BASE = "BASE",
  WITH_CHALLONGE_ID = "WITH_CHALLONGE_ID",
  WITH_ROSTERS = "WITH_ROSTERS",
  WITH_RESULTS = "WITH_RESULTS",
  WITH_RESULTS_AND_SCORES = "WITH_RESULTS_AND_SCORES",
}

export type MatchupResponseEnumType =
  (typeof MatchupResponsesEnum)[keyof typeof MatchupResponsesEnum];

export enum MatchupSortingEnum {
  ROUND_NUMBER = "ROUND_NUMBER",
  START_DATE = "START_DATE",
  IS_FINISHED = "IS_FINISHED",
}

// One roster's line in a stage's standings, best first
export interface IStageStandingResponse {
  rosterId: number;
  place: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  byes: number;
  // Points brought in from an earlier stage by a conversion rule
  carriedPoints: number;
  // carriedPoints plus 3 per win or bye and 1 per draw
  points: number;
  // Sum of the opponents' points, the Swiss tie-breaker
  buchholz: number;
  // Elimination formats: the round of the roster's last allowed loss, or null while still in
  eliminatedInRound: number | null;
}

export interface IStageStandingsResponse {
  stageId: number;
  format:
    | "single_elimination"
    | "double_elimination"
    | "triple_elimination"
    | "compass"
    | "round_robin"
    | "swiss";
  isFinished: boolean;
  // Whether the stage's matches are Challonge's (its bracket page is theirs) rather than the API's own
  runsOnChallonge: boolean;
  standings: IStageStandingResponse[];
}
