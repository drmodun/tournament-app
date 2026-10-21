// Challonge is off unless CHALLONGE_ENABLED=true; stages then run their brackets in the API itself
export const isChallongeEnabled = () =>
  process.env.CHALLONGE_ENABLED?.toLowerCase() === 'true';
