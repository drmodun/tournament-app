import {
  stageStatusEnum,
  stageTypeEnum,
  tournamentLocationEnumType,
} from "src/enums";

export interface ICreateStageDto {
  tournamentId: number;
  stageStatus?: stageStatusEnum;
  stageType?: stageTypeEnum;
  name: string;
  stageLocation?: tournamentLocationEnumType;
  locationId?: number;
  description?: string;
  logo?: string;
  startDate: Date;
  endDate?: Date;
  minPlayersPerTeam?: number;
  maxPlayersPerTeam?: number;
  maxChanges?: number;
  maxSubstitutes?: number;
}

export interface IUpdateStageDto {
  tournamentId?: number;
  stageStatus?: stageStatusEnum;
  stageType?: stageTypeEnum;
  name?: string;
  stageLocation?: tournamentLocationEnumType;
  locationId?: number;
  description?: string;
  logo?: string;
  startDate?: Date;
  endDate?: Date;
  minPlayersPerTeam?: number;
  maxPlayersPerTeam?: number;
  maxChanges?: number;
}
