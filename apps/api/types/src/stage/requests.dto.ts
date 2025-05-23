import {
  stageStatusEnum,
  stageTypeEnum,
  tournamentLocationEnumType,
} from "src/enums";

export interface ICreateStageDto {
  tournamentId: number;
  conversionRuleId?: number;
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
}

export interface IUpdateStageDto {
  tournamentId?: number;
  conversionRuleId?: number;
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
