import { ICategoryMiniResponseWithLogo } from "src/category";
import {
  tournamentTypeEnum,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
} from "../enums";
import { IMiniUserResponse } from "../user/responses.dto";
import { IMiniGroupResponse } from "src/group";
import { ILocationResponse } from "src/location/responses.dto";

export interface IMiniTournamentResponse {
  id: number;
  name: string;
  type: tournamentTypeEnum;
  startDate: Date;
  locationId?: number;
}

export interface IMiniTournamentResponseWithLogo
  extends IMiniTournamentResponse {
  location?: tournamentLocationEnum;
  logo: string;
  country: string;
}

export interface ITournamentResponse extends IMiniTournamentResponseWithLogo {
  description: string;
  actualLocation?: ILocationResponse;
  teamType: tournamentTeamTypeEnum;
  creator: IMiniUserResponse;
  affiliatedGroup?: IMiniGroupResponse;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  isPublic: boolean;
  category: ICategoryMiniResponseWithLogo;
  links: string;
}

export interface IExtendedTournamentResponse extends ITournamentResponse {
  createdAt: Date;
  updatedAt: Date;
  isMultipleTeamsPerGroupAllowed: boolean;
  isFakePlayersAllowed: boolean;
  parentTournament?: IMiniTournamentResponseWithLogo;
  conversionRuleId: number; 
  isRanked: boolean;
  maximumMMR?: number;
  minimumMMR?: number;
}

export type BaseTournamentResponseType =
  | IMiniTournamentResponse
  | IMiniTournamentResponseWithLogo
  | ITournamentResponse
  | IExtendedTournamentResponse;

export enum TournamentResponsesEnum {
  MINI = "mini",
  MINI_WITH_LOGO = "mini-with-logo",
  BASE = "base",
  EXTENDED = "extended",
}

export type TournamentResponseEnumType =
  (typeof TournamentResponsesEnum)[keyof typeof TournamentResponsesEnum];

export enum TournamentSortingEnum {
  NAME = "name",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  PARTICIPANT_COUNT = "participant-count",
  CATEGORY = "category",
  MINIMUM_MMR = "minimumMMR",
  MAXIMUM_MMR = "maximumMMR",
  MAXIMUM_PARTICIPANTS = "maximumParticipants",
  TOURNAMENT_TYPE = "tournamentType",
  TOURNAMENT_LOCATION = "tournamentLocation",
  COUNTRY = "country",

}

export interface TournamentQueryType {
  name?: string;
  type?: tournamentTypeEnum;
  location?: tournamentLocationEnum;
  teamType?: tournamentTeamTypeEnum;
  startDate?: Date;
  endDate?: Date;
  isRanked?: boolean;
  minimumMMR?: number;
  maximumMMR?: number;
  isMultipleTeamsPerGroupAllowed?: boolean;
  categoryId?: number;
  affiliatedGroupId?: number;
  creatorId?: number;
  minParticipants?: number;
  maxParticipants?: number;
  isPublic?: boolean;
  locationId?: number;
}
