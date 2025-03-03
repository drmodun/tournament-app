import { IMiniUserResponse, IUserResponse } from "../user/responses.dto";
import { IMiniTournamentResponse } from "../tournament/responses.dto";
import {
  IGroupResponse,
  IMiniGroupResponse,
  IMiniGroupResponseWithLogo,
} from "src/group";

export interface IMiniParticipationResponse {
  id: number;
  userId?: number;
  groupId?: number;
  tournamentId: number;
}

export interface IMiniParticipationResponseWithGroup
  extends IMiniParticipationResponse {
  group: IMiniGroupResponseWithLogo;
}

export interface IMiniParticipationResponseWithUser
  extends IMiniParticipationResponse {
  user: IMiniUserResponse;
}

export interface IParticipationResponse extends IMiniParticipationResponse {
  tournament: IMiniTournamentResponse;
  group?: IMiniGroupResponse;
  user?: IMiniUserResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExtendedParticipationResponse {
  // TODO: add roster and match data later here
}

export type BaseParticipationResponseType =
  | IMiniParticipationResponse
  | IParticipationResponse
  | IUserResponse
  | IGroupResponse
  | IExtendedParticipationResponse;

export enum ParticipationResponsesEnum {
  MINI = "mini",
  BASE = "base",
  PARTICIPANT = "participant", // either IGroupResponse or IUserResponse
  EXTENDED = "extended",
}

export enum ParticipationSortingEnum {
  CREATED_AT = "createdAt",
  NAME = "name",
  IS_FAKE = "isFake",
  PLACEMENT = "placement",
}

export type ParticipationResponseEnumType =
  (typeof ParticipationResponsesEnum)[keyof typeof ParticipationResponsesEnum];
