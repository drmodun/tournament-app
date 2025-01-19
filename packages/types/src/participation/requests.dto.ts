import { participationStatusEnum } from "../enums";

export interface ICreateSingleParticipationRequest {
  userId: number;
  tournamentId: number;
  status?: participationStatusEnum;
}

export interface IUpdateParticipationRequest {
  status?: participationStatusEnum;
  placement?: number;
  pointsEarned?: number;
  matchesPlayed?: number;
  matchesWon?: number;
}

export interface IParticipationQuery {
  userId?: number;
  tournamentId?: number;
  status?: participationStatusEnum;
  minPointsEarned?: number;
  maxPointsEarned?: number;
  minMatchesPlayed?: number;
  maxMatchesPlayed?: number;
  minMatchesWon?: number;
  maxMatchesWon?: number;
  minPlacement?: number;
  maxPlacement?: number;
}
