import { IGroupInviteWithUserResponse } from "src/groupInvites";
import {
  IMiniRosterResponse,
  IMiniRosterResponseWithChallongeId,
  IRosterResponse,
} from "src/roster/responses.dto";

export interface IMatchupResponse {
  id: number;
  stageId: number;
  round: number;
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
  rosters: IMiniRosterResponse[];
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
