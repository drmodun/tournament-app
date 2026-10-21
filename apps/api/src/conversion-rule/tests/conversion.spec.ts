import {
  isInRange,
  placingsByPoints,
  planConversion,
  pointsForPlace,
} from '../conversion';

describe('conversion', () => {
  const placings = [
    { id: 10, place: 1 },
    { id: 11, place: 2 },
    { id: 12, place: 3 },
    { id: 13, place: 3 },
    { id: 14, place: 5 },
  ];

  describe('isInRange', () => {
    it('is open-ended without from or to', () => {
      expect(isInRange({ strategy: 'ranking' }, 99)).toBe(true);
      expect(isInRange({ strategy: 'ranking', from: 2, to: 3 }, 1)).toBe(false);
      expect(isInRange({ strategy: 'ranking', from: 2, to: 3 }, 3)).toBe(true);
    });
  });

  describe('pointsForPlace', () => {
    it('gives the same points to every place without pointsPerPlace', () => {
      expect(pointsForPlace({ strategy: 'ranking', points: 5 }, 4)).toBe(5);
    });

    it('counts down from maxPoints, never below minPoints', () => {
      const rule = {
        strategy: 'ranking',
        maxPoints: 10,
        pointsPerPlace: 3,
        minPoints: 2,
      };

      expect([1, 2, 3, 4, 5].map((p) => pointsForPlace(rule, p))).toEqual([
        10, 7, 4, 2, 2,
      ]);
    });

    it('counts from the first place in range and gives nothing outside it', () => {
      const rule = {
        strategy: 'ranking',
        maxPoints: 10,
        pointsPerPlace: 1,
        from: 3,
        to: 4,
      };

      expect([2, 3, 4, 5].map((p) => pointsForPlace(rule, p))).toEqual([
        0, 10, 9, 0,
      ]);
    });
  });

  describe('planConversion', () => {
    it('ranking awards points without qualifying anyone', () => {
      const plan = planConversion(
        { strategy: 'ranking', maxPoints: 5, pointsPerPlace: 2 },
        placings,
      );

      expect(plan.map((o) => [o.id, o.points, o.qualifies])).toEqual([
        [10, 5, false],
        [11, 3, false],
        [12, 1, false],
        [13, 1, false],
        [14, 0, false],
      ]);
    });

    it('qualification takes the places in range, shared places included', () => {
      const plan = planConversion(
        { strategy: 'qualification', to: 3 },
        placings,
      );

      expect(plan.filter((o) => o.qualifies).map((o) => o.id)).toEqual([
        10, 11, 12, 13,
      ]);
      expect(plan.every((o) => o.points === 0 && !o.isRemoved)).toBe(true);
    });

    it('elimination also removes the rest', () => {
      const plan = planConversion({ strategy: 'elimination', to: 2 }, placings);

      expect(plan.filter((o) => o.isRemoved).map((o) => o.id)).toEqual([
        12, 13, 14,
      ]);
    });

    it('seeding numbers the qualifiers by place', () => {
      const plan = planConversion({ strategy: 'seed', to: 3 }, placings);

      expect(plan.map((o) => o.seed)).toEqual([1, 2, 3, 4, null]);
    });

    it('hybrid qualifies and awards points', () => {
      const plan = planConversion(
        { strategy: 'hybrid', to: 1, points: 7 },
        placings,
      );

      expect(plan[0]).toMatchObject({ id: 10, qualifies: true, points: 7 });
      expect(plan[1]).toMatchObject({ id: 11, qualifies: false, points: 0 });
    });

    it('tie-breaker qualifies only the entries in range that share a place', () => {
      expect(
        planConversion({ strategy: 'tie_breaker' }, placings)
          .filter((o) => o.qualifies)
          .map((o) => o.id),
      ).toEqual([12, 13]);
      expect(
        planConversion({ strategy: 'tie_breaker', to: 2 }, placings).some(
          (o) => o.qualifies,
        ),
      ).toBe(false);
    });

    it('qualification with a last-chance qualifier sends the places after the range there', () => {
      const plan = planConversion(
        { strategy: 'qualification_with_lcq', to: 2 },
        placings,
      );

      expect(plan.filter((o) => o.qualifies).map((o) => o.id)).toEqual([
        10, 11,
      ]);
      expect(plan.filter((o) => o.toLastChance).map((o) => o.id)).toEqual([
        12, 13, 14,
      ]);
    });

    it('sends nobody to a last chance without the other strategies', () => {
      expect(
        planConversion({ strategy: 'qualification', to: 2 }, placings).some(
          (o) => o.toLastChance,
        ),
      ).toBe(false);
    });
  });

  describe('placingsByPoints', () => {
    it('places by points, sharing places on equal points', () => {
      expect(
        placingsByPoints([
          { id: 1, points: 3 },
          { id: 2, points: 9 },
          { id: 3, points: 3 },
          { id: 4, points: 0 },
        ]),
      ).toEqual([
        { id: 2, place: 1 },
        { id: 1, place: 2 },
        { id: 3, place: 2 },
        { id: 4, place: 4 },
      ]);
    });
  });
});
