import {
  HIGH_VOLATILITY_K,
  HIGH_VOLATILITY_MATCH_COUNT,
  LOW_VOLATILITY_K,
  MEDIUM_VOLATILITY_K,
  MEDIUM_VOLATILITY_MATCH_COUNT,
} from '@tournament-app/types';

export class EloHelper {
  static expectedScore(playerRating, opponentRating) {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  static getKFactor(matchesPlayed: number) {
    if (matchesPlayed < HIGH_VOLATILITY_MATCH_COUNT) {
      return HIGH_VOLATILITY_K;
    } else if (matchesPlayed < MEDIUM_VOLATILITY_MATCH_COUNT) {
      return MEDIUM_VOLATILITY_K;
    } else {
      return LOW_VOLATILITY_K;
    }
  }

  static updateRating(
    playerRating: number,
    opponentRating: number,
    actualScore: number,
    matchesPlayed: number,
  ) {
    const k = this.getKFactor(matchesPlayed);
    const expected = this.expectedScore(playerRating, opponentRating);
    const newRating = playerRating + k * (actualScore - expected);
    return Math.max(0, Math.round(newRating));
  }
}
