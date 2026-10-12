// Pure mapping from repository rows to the matchup shapes the API returns.

type RawScoreToRoster = {
  id: number;
  scoreId: number;
  rosterId: number;
  points: number;
  isWinner: boolean;
};

type RawRosterToMatchup = {
  isWinner: boolean;
  matchupId: number;
  score: number;
  roster?: any;
};

export type RawMatchupWithScores = {
  id: number;
  stageId: number;
  round: number;
  isFinished: boolean;
  challongeMatchupId?: string;
  score?: Array<{
    id: number;
    roundNumber: number;
    matchupId: number;
    isWinner?: boolean;
    scoreToRoster?: RawScoreToRoster[];
  }>;
  rosterToMatchup?: RawRosterToMatchup[];
};

type RosterRoundScore = {
  matchupId: number;
  roundNumber: number;
  points: number;
  isWinner: boolean;
  rosterId: number;
};

function groupScoresByRound(
  scores: RawMatchupWithScores['score'],
): Map<number, RosterRoundScore[]> {
  const scoresByRound = new Map<number, RosterRoundScore[]>();

  if (!Array.isArray(scores)) {
    return scoresByRound;
  }

  for (const scoreEntry of scores) {
    if (!scoresByRound.has(scoreEntry.roundNumber)) {
      scoresByRound.set(scoreEntry.roundNumber, []);
    }

    if (!Array.isArray(scoreEntry.scoreToRoster)) {
      continue;
    }

    for (const scoreToRoster of scoreEntry.scoreToRoster) {
      scoresByRound.get(scoreEntry.roundNumber).push({
        matchupId: scoreEntry.matchupId,
        roundNumber: scoreEntry.roundNumber,
        points: scoreToRoster.points,
        isWinner: scoreToRoster.isWinner,
        rosterId: scoreToRoster.rosterId,
      });
    }
  }

  return scoresByRound;
}

function mapRosterResultWithScores(
  matchupId: number,
  rosterToMatchup: RawRosterToMatchup,
  scoresByRound: Map<number, RosterRoundScore[]>,
) {
  const scores = [];

  scoresByRound.forEach((roundScores, roundNumber) => {
    const rosterScore = roundScores.find(
      (score) => score.rosterId === rosterToMatchup.roster?.id,
    );

    if (rosterScore) {
      scores.push({
        matchupId,
        roundNumber,
        points: rosterScore.points,
        isWinner: rosterScore.isWinner,
      });
    }
  });

  return {
    id: rosterToMatchup.roster?.id || 0,
    matchupId: rosterToMatchup.matchupId,
    score: rosterToMatchup.score,
    isWinner: rosterToMatchup.isWinner,
    roster: rosterToMatchup.roster || null,
    scores,
  };
}

export function mapMatchupWithResultsAndScores(
  rawMatchup: RawMatchupWithScores | null,
) {
  if (!rawMatchup) {
    return null;
  }

  const scoresByRound = groupScoresByRound(rawMatchup.score);

  const results = Array.isArray(rawMatchup.rosterToMatchup)
    ? rawMatchup.rosterToMatchup.map((rosterToMatchup) =>
        mapRosterResultWithScores(
          rawMatchup.id,
          rosterToMatchup,
          scoresByRound,
        ),
      )
    : [];

  return {
    id: rawMatchup.id,
    stageId: rawMatchup.stageId,
    round: rawMatchup.round,
    matchupType: 'standard',
    startDate: new Date(),
    isFinished: rawMatchup.isFinished,
    results,
  };
}

function mapMatchupWithResults(rawMatch: any) {
  if (!rawMatch) {
    return null;
  }

  const results = Array.isArray(rawMatch.rosterToMatchup)
    ? rawMatch.rosterToMatchup.map((rtm) => ({
        id: rtm?.roster?.id || 0,
        matchupId: rtm?.matchupId || rawMatch.id || 0,
        score: rtm?.score || 0,
        isWinner: !!rtm?.isWinner,
        roster: rtm?.roster || null,
      }))
    : [];

  return {
    id: rawMatch.id || 0,
    stageId: rawMatch.stageId || 0,
    round: rawMatch.round || 0,
    matchupType: rawMatch.matchupType || 'standard',
    startDate: rawMatch.startDate || new Date(),
    isFinished: !!rawMatch.isFinished,
    results,
  };
}

export function mapMatchupsWithResults(repositoryResults: any[] | null): any[] {
  if (!repositoryResults || !Array.isArray(repositoryResults)) {
    return [];
  }

  return repositoryResults.map(mapMatchupWithResults).filter(Boolean);
}
