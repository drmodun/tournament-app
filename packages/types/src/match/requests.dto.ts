export interface ICreateTeamScore {
  rosterId: number;
  points: number;
  isWinner: boolean;
}

export interface ICreateScoreRequest {
  roundNumber: number;
  scores: ICreateTeamScore[];
}

export interface ICreateMatchResult {
  roundNumber: number;
  scores: ICreateTeamScore[];
}

export interface ISetTeamResult {
  rosterId: number;
  isWinner: boolean;
}

export interface IEndMatchupRequest {
  scores: ICreateScoreRequest[];
  results: ISetTeamResult[];
}

export interface IQueryMatchupRequest {
  matchupId: number;
  rosterId?: number;
  groupId?: number;
  userId?: number;
  stageId?: number;
}
