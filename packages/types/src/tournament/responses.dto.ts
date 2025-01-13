import { ICategoryMiniResponse } from "src/category";
import {
  tournamentTypeEnum,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
} from "../enums";
import { IMiniUserResponse } from "../user/responses.dto";
import { IMiniGroupResponse } from "src/group";

export interface IMiniTournamentResponse {
  id: number;
  name: string;
  type: tournamentTypeEnum;
  startDate: Date;
}

export interface IMiniTournamentResponseWithLogo
  extends IMiniTournamentResponse {
  location: tournamentLocationEnum;
  logo: string;
  country: string;
}

export interface ITournamentResponse extends IMiniTournamentResponseWithLogo {
  description: string;
  teamType: tournamentTeamTypeEnum;
  creator: IMiniUserResponse;
  affiliatedGroup?: IMiniGroupResponse;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  isPublic: boolean;
  category: ICategoryMiniResponse;
  links: string;
}

export interface IExtendedTournamentResponse extends ITournamentResponse {
  createdAt: Date;
  updatedAt: Date;
  links: string;
  isMultipleTeamsPerGroupAllowed: boolean;
  isFakePlayersAllowed: boolean;
  parentTournament: IMiniTournamentResponseWithLogo;
  conversionRuleId: number; // TODO: replace with a conversion rule entity later
  prize: number;
  isRanked: boolean;
  maximumMMR: number;
  minimumMMR: number;
  rules: string;
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

export type TournamentResponseEnumType = keyof typeof TournamentResponsesEnum;

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
}
