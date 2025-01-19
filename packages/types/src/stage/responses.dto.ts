import { stageStatusEnumType, stageTypeEnumType } from "src/enums";
import {
  IMiniTournamentResponse,
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
  logo?: string;
}

export interface IStageResponseWithTournament extends IStageResponse {
  tournament: IMiniTournamentResponseWithLogo;
}

export interface IExtendedStageResponse extends IStageResponse {
  endDate: Date;
  startDate: Date;
  minPlayersPerTeam: number;
  maxPlayersPerTeam: number;
}

export interface IExtendedStageResponseWithTournament
  extends IExtendedStageResponse {
  tournament: ITournamentResponse;
}
