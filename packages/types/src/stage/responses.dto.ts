import { stageStatusEnumType, stageTypeEnumType } from "src/enums";
import { ILocationResponse } from "src/location/responses.dto";
import {
  IMiniTournamentResponseWithLogo,
  ITournamentResponse,
} from "src/tournament";

export interface IMiniStageResponse {
  id: number;
  name: string;
  tournamentId: number;
  stageStatus: stageStatusEnumType;
  locationId?: number;
}

export interface IStageResponse extends IMiniStageResponse {
  stageType: stageTypeEnumType;
  description: string;
  rostersParticipating: number;
  startDate: Date;
  endDate: Date;
  location?: ILocationResponse;
  logo?: string;
}

export interface IStageResponseWithTournament extends IStageResponse {
  tournament: IMiniTournamentResponseWithLogo;
}

export interface IExtendedStageResponse extends IStageResponse {
  minPlayersPerTeam: number;
  maxPlayersPerTeam?: number;
  maxSubstitutes?: number;
  maxChanges?: number;
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
