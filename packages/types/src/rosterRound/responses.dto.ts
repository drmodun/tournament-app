// How a roster did in one round of a stage, derived from the results of its matchups in that round
export interface IRosterRoundResponse {
  rosterId: number;
  roundId: number;
  stageId: number;
  roundNumber: number;
  // Points the roster scored across its matchups in the round
  score: number;
  // It won every matchup it played in the round (a bye counts as a win)
  isWinner: boolean;
  createdAt: Date;
}

export enum RosterRoundSortingEnum {
  ROUND_NUMBER = "roundNumber",
  SCORE = "score",
}
