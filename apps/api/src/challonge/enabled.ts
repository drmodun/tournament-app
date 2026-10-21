import { stageTypeEnum } from '@tournament-app/types';

// Challonge is off unless CHALLONGE_ENABLED=true; stages then run their brackets in the API itself
export const isChallongeEnabled = () =>
  process.env.CHALLONGE_ENABLED?.toLowerCase() === 'true';

// Challonge has no compass or triple-elimination bracket, so those stages always run in the API
export const canRunOnChallonge = (stageType?: string | null) =>
  stageType !== stageTypeEnum.COMPASS &&
  stageType !== stageTypeEnum.TRIPLE_ELIMINATION;
