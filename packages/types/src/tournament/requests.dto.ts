import {
  tournamentTypeEnum,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
} from "../enums";

export interface ICreateTournamentRequest {
  name: string;
  description: string;
  country: string;
  tournamentType: tournamentTypeEnum;
  location: tournamentLocationEnum;
  locationId?: number;
  tournamentTeamType: tournamentTeamTypeEnum;
  isMultipleTeamsPerGroupAllowed?: boolean;
  isFakePlayersAllowed?: boolean;
  parentTournamentId?: number;
  conversionRuleId?: number;
  maxParticipants: number;
  startDate: Date;
  endDate: Date;
  isPublic: boolean;
  isRanked: boolean;
  categoryId: number;
  maximumMMR?: number;
  minimumMMR?: number;
  creatorId: number;
  affiliatedGroupId?: number;
  links?: string;
}

export interface IUpdateTournamentRequest {
  name?: string;
  description?: string;
  country?: string;
  tournamentType?: tournamentTypeEnum;
  location?: tournamentLocationEnum;
  locationId?: number;
  tournamentTeamType?: tournamentTeamTypeEnum;
  isMultipleTeamsPerGroupAllowed?: boolean;
  isFakePlayersAllowed?: boolean;
  parentTournamentId?: number;
  conversionRuleId?: number;
  startDate?: Date;
  endDate?: Date;
  maxParticipants?: number;
  isPublic?: boolean;
  isRanked?: boolean;
  categoryId?: number;
  maximumMMR?: number;
  minimumMMR?: number;
  creatorId?: number;
  affiliatedGroupId?: number;
  links?: string;
}

export type BaseTournamentUpdateRequest =
  | IUpdateTournamentRequest
  | ICreateTournamentRequest;

export interface TournamentParticipationRequest {
  tournamentId: number;
  userId: number;
}
