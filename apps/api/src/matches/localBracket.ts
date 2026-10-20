// Single-elimination brackets run by the API itself, for stages without a Challonge tournament.

/**
 * Seed numbers in bracket order, so that consecutive pairs are the first-round matches and
 * the top seeds can only meet late: for 8 slots, 1 v 8, 4 v 5, 2 v 7, 3 v 6.
 */
export function standardBracketOrder(size: number): number[] {
  let order = [1];

  while (order.length < size) {
    const doubled = order.length * 2;
    order = order.flatMap((seed) => [seed, doubled + 1 - seed]);
  }

  return order;
}

/**
 * First-round pairings for rosters listed from the top seed down. The bracket is padded to a
 * power of two; a seed without an opponent gets a bye and appears alone.
 */
export function firstRoundPairings(rosterIdsBySeed: number[]): number[][] {
  if (rosterIdsBySeed.length === 0) {
    return [];
  }

  const size = Math.max(2, 2 ** Math.ceil(Math.log2(rosterIdsBySeed.length)));
  const order = standardBracketOrder(size);
  const pairings: number[][] = [];

  for (let i = 0; i < order.length; i += 2) {
    const pairing = [order[i], order[i + 1]]
      .filter((seed) => seed <= rosterIdsBySeed.length)
      .map((seed) => rosterIdsBySeed[seed - 1]);

    if (pairing.length) {
      pairings.push(pairing);
    }
  }

  return pairings;
}

/** Pairs the winners of a round in bracket order; an odd one out gets a bye. */
export function nextRoundPairings(winnerRosterIds: number[]): number[][] {
  const pairings: number[][] = [];

  for (let i = 0; i < winnerRosterIds.length; i += 2) {
    pairings.push(winnerRosterIds.slice(i, i + 2));
  }

  return pairings;
}
