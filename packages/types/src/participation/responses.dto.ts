import { IMiniUserResponse } from "../user/responses.dto";
import { IMiniTournamentResponse } from "../tournament/responses.dto";
import { participationStatusEnum } from "../enums";

export interface IMiniParticipationResponse {
  id: number;
  userId: number;
  tournamentId: number;
  status: participationStatusEnum;
}

export interface IParticipationResponse extends IMiniParticipationResponse {
  user: IMiniUserResponse;
  tournament: IMiniTournamentResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExtendedParticipationResponse extends IParticipationResponse {
  placement?: number;
  pointsEarned?: number;
  matchesPlayed: number;
  matchesWon: number;
}

export type BaseParticipationResponseType =
  | IMiniParticipationResponse
  | IParticipationResponse
  | IExtendedParticipationResponse;

export enum ParticipationResponsesEnum {
  MINI = "mini",
  BASE = "base",
  EXTENDED = "extended",
}

export type ParticipationResponseEnumType =
  (typeof ParticipationResponsesEnum)[keyof typeof ParticipationResponsesEnum];
