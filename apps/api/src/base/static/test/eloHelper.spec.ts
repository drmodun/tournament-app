import { EloHelper } from '../eloHelper';
import {
  HIGH_VOLATILITY_K,
  HIGH_VOLATILITY_MATCH_COUNT,
  LOW_VOLATILITY_K,
  MEDIUM_VOLATILITY_K,
  MEDIUM_VOLATILITY_MATCH_COUNT,
} from '@tournament-app/types';

describe('EloHelper', () => {
  describe('expectedScore', () => {
    it('should calculate expected score correctly for equal ratings', () => {
      const result = EloHelper.expectedScore(1000, 1000);
      expect(result).toBe(0.5);
    });

    it('should calculate expected score correctly for higher rated player', () => {
      const result = EloHelper.expectedScore(1200, 1000);
      expect(result).toBeCloseTo(0.76, 2);
    });

    it('should calculate expected score correctly for lower rated player', () => {
      const result = EloHelper.expectedScore(1000, 1200);
      expect(result).toBeCloseTo(0.24, 2);
    });
  });

  describe('getKFactor', () => {
    it('should return HIGH_VOLATILITY_K for new players', () => {
      const result = EloHelper.getKFactor(0);
      expect(result).toBe(HIGH_VOLATILITY_K);
    });

    it('should return HIGH_VOLATILITY_K for players under high volatility threshold', () => {
      const result = EloHelper.getKFactor(HIGH_VOLATILITY_MATCH_COUNT - 1);
      expect(result).toBe(HIGH_VOLATILITY_K);
    });

    it('should return MEDIUM_VOLATILITY_K for players in medium range', () => {
      const result = EloHelper.getKFactor(HIGH_VOLATILITY_MATCH_COUNT + 1);
      expect(result).toBe(MEDIUM_VOLATILITY_K);
    });

    it('should return LOW_VOLATILITY_K for experienced players', () => {
      const result = EloHelper.getKFactor(MEDIUM_VOLATILITY_MATCH_COUNT + 1);
      expect(result).toBe(LOW_VOLATILITY_K);
    });
  });

  describe('updateRating', () => {
    it('should increase rating for a win against equal opponent', () => {
      const result = EloHelper.updateRating(1000, 1000, 1, 0);
      expect(result).toBeGreaterThan(1000);
    });

    it('should decrease rating for a loss against equal opponent', () => {
      const result = EloHelper.updateRating(1000, 1000, 0, 0);
      expect(result).toBeLessThan(1000);
    });

    it('should increase rating more for winning against higher rated opponent', () => {
      const winAgainstEqual = EloHelper.updateRating(1000, 1000, 1, 0) - 1000;
      const winAgainstStronger =
        EloHelper.updateRating(1000, 1200, 1, 0) - 1000;
      expect(winAgainstStronger).toBeGreaterThan(winAgainstEqual);
    });

    it('should decrease rating less for losing against higher rated opponent', () => {
      const lossAgainstEqual = 1000 - EloHelper.updateRating(1000, 1000, 0, 0);
      const lossAgainstStronger =
        1000 - EloHelper.updateRating(1000, 1200, 0, 0);
      expect(lossAgainstStronger).toBeLessThan(lossAgainstEqual);
    });

    it('should never return a negative rating', () => {
      const result = EloHelper.updateRating(0, 2000, 0, 0);
      expect(result).toBe(0);
    });

    it('should return rounded integers', () => {
      const result = EloHelper.updateRating(1000, 1000, 1, 0);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('should apply different K factors based on matches played', () => {
      const newPlayerChange = Math.abs(
        EloHelper.updateRating(1000, 1000, 1, 0) - 1000,
      );
      const experiencedPlayerChange = Math.abs(
        EloHelper.updateRating(
          1000,
          1000,
          1,
          MEDIUM_VOLATILITY_MATCH_COUNT + 1,
        ) - 1000,
      );
      expect(newPlayerChange).toBeGreaterThan(experiencedPlayerChange);
    });
  });
});
