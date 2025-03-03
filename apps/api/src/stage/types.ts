import { IStageResponse } from '@tournament-app/types';

export interface StagesWithDates {
  id: number;
  startDate: Date;
  endDate?: Date;
}

export interface IStageWithChallongeTournament extends IStageResponse {
  challongeTournamentId: string;
}
