import {
  firstRoundPairings,
  nextRoundPairings,
  standardBracketOrder,
} from '../localBracket';

describe('localBracket', () => {
  describe('standardBracketOrder', () => {
    it('keeps the top seeds apart until the final', () => {
      expect(standardBracketOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
      expect(standardBracketOrder(4)).toEqual([1, 4, 2, 3]);
    });
  });

  describe('firstRoundPairings', () => {
    it('pairs a full bracket by seed', () => {
      expect(firstRoundPairings([11, 12, 13, 14])).toEqual([
        [11, 14],
        [12, 13],
      ]);
    });

    it('gives byes to the top seeds when the bracket is not full', () => {
      // 5 rosters fill an 8-slot bracket: seeds 1-3 get byes
      expect(firstRoundPairings([1, 2, 3, 4, 5])).toEqual([
        [1],
        [4, 5],
        [2],
        [3],
      ]);
    });

    it('handles a single roster and no rosters', () => {
      expect(firstRoundPairings([7])).toEqual([[7]]);
      expect(firstRoundPairings([])).toEqual([]);
    });
  });

  describe('nextRoundPairings', () => {
    it('pairs consecutive winners and gives the odd one out a bye', () => {
      expect(nextRoundPairings([1, 2, 3, 4])).toEqual([
        [1, 2],
        [3, 4],
      ]);
      expect(nextRoundPairings([1, 2, 3])).toEqual([[1, 2], [3]]);
    });
  });
});
