import { stageStatusEnumType, stageTypeEnumType } from "src/enums";
import {
  IMiniTournamentResponseWithLogo,
  ITournamentResponse,
} from "src/tournament";

export interface IMiniStageResponse {
  id: number;
  name: string;
  tournamentId: number;
  stageStatus: stageStatusEnumType;
}

export interface IStageResponse extends IMiniStageResponse {
  stageType: stageTypeEnumType;
  description: string;
  rostersParticipating: number;
  startDate: Date;
  endDate: Date;
  logo?: string;
}

export interface IStageResponseWithTournament extends IStageResponse {
  tournament: IMiniTournamentResponseWithLogo;
}

export interface IExtendedStageResponse extends IStageResponse {
  minPlayersPerTeam: number;
  maxPlayersPerTeam: number;
}

export interface IExtendedStageResponseWithTournament
  extends IExtendedStageResponse {
  tournament: ITournamentResponse;
}

export type BaseStageResponseType =
  | IMiniStageResponse
  | IStageResponse
  | IExtendedStageResponse
  | IStageResponseWithTournament
  | IExtendedStageResponseWithTournament;

export enum StageResponsesEnum {
  MINI = "mini",
  BASE = "base",
  EXTENDED = "extended",
  WITH_TOURNAMENT = "withTournament",
  WITH_EXTENDED_TOURNAMENT = "withExtendedTournament",
}

export enum StageSortingEnum {
  NAME = "name",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  START_DATE = "startDate",
  END_DATE = "endDate",
}
