import {
  IMiniRosterResponseWithChallongeId,
  IRosterResponse,
} from "src/roster/responses.dto";

export interface IMatchupResponse {
  id: number;
  stageId: number;
  roundId: number;
  matchupType: string;
  startDate: Date;
  isFinished: boolean;
}

export interface IMatchupResponseWithChallongeId extends IMatchupResponse {
  challongeId: string;
}

export interface IMatchupResponseWithRosters extends IMatchupResponse {
  rosters: IMiniRosterResponseWithChallongeId[];
}

export interface IResultsResponse {
  id: number;
  matchupId: number;
  roundNumber: number;
  score: number;
  isWinner: boolean;
  roster: IMiniRosterResponseWithChallongeId;
}

export interface IScoreResponse {
  matchupId: number;
  roundNumber: number;
  points: number;
  isWinner: boolean;
}

export interface IResultsResponseWithScores extends IResultsResponse {
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

export type MatchupResponse =
  (typeof MatchupResponsesEnum)[keyof typeof MatchupResponsesEnum];

export enum MatchupSortingEnum {
  CREATED_AT = "CREATED_AT",
  START_DATE = "START_DATE",
  IS_FINISHED = "IS_FINISHED",
}
