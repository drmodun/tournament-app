import { Test, TestingModule } from '@nestjs/testing';
import { CareerService, computeRatingChanges } from '../career.service';
import { CareerDrizzleRepository } from '../career.repository';
import { UserDrizzleRepository } from 'src/users/user.repository';

const player = (userId: number, isFake = false) => ({ userId, isFake });

describe('computeRatingChanges', () => {
  it('moves the winner up and the loser down by the same amount for equal ratings', () => {
    const changes = computeRatingChanges(
      [
        { rosterId: 1, isWinner: true, players: [player(1)] },
        { rosterId: 2, isWinner: false, players: [player(2)] },
      ],
      new Map([
        [1, 1000],
        [2, 1000],
      ]),
      new Map([
        [1, 30],
        [2, 30],
      ]),
    );

    // K is 20 after 20 matches, expected score 0.5
    expect(changes).toEqual([
      { userId: 1, elo: 1010 },
      { userId: 2, elo: 990 },
    ]);
  });

  it('uses the base rating and a high K-factor for new players', () => {
    const changes = computeRatingChanges(
      [
        { rosterId: 1, isWinner: false, players: [player(1)] },
        { rosterId: 2, isWinner: true, players: [player(2)] },
      ],
      new Map(),
      new Map(),
    );

    expect(changes).toEqual([
      { userId: 1, elo: 975 },
      { userId: 2, elo: 1025 },
    ]);
  });

  it('rates each player against the opposing roster average', () => {
    const changes = computeRatingChanges(
      [
        { rosterId: 1, isWinner: true, players: [player(1), player(2)] },
        { rosterId: 2, isWinner: false, players: [player(3)] },
      ],
      new Map([
        [1, 1100],
        [2, 900],
        [3, 1000],
      ]),
      new Map([
        [1, 30],
        [2, 30],
        [3, 30],
      ]),
    );

    const byUser = new Map(changes.map((c) => [c.userId, c.elo]));
    // The weaker teammate gains more than the stronger one against the same opponent
    expect(byUser.get(2)! - 900).toBeGreaterThan(byUser.get(1)! - 1100);
    expect(byUser.get(3)).toBe(990);
  });

  it('treats a matchup without a winner as a draw', () => {
    const changes = computeRatingChanges(
      [
        { rosterId: 1, isWinner: false, players: [player(1)] },
        { rosterId: 2, isWinner: false, players: [player(2)] },
      ],
      new Map([
        [1, 1000],
        [2, 1000],
      ]),
      new Map(),
    );

    expect(changes).toEqual([
      { userId: 1, elo: 1000 },
      { userId: 2, elo: 1000 },
    ]);
  });

  it('leaves fake players out', () => {
    const changes = computeRatingChanges(
      [
        { rosterId: 1, isWinner: true, players: [player(1), player(5, true)] },
        { rosterId: 2, isWinner: false, players: [player(2)] },
      ],
      new Map(),
      new Map(),
    );

    expect(changes.map((c) => c.userId)).toEqual([1, 2]);
  });

  it('does nothing unless exactly two rosters played', () => {
    expect(
      computeRatingChanges(
        [{ rosterId: 1, isWinner: true, players: [player(1)] }],
        new Map(),
        new Map(),
      ),
    ).toEqual([]);
  });
});

describe('CareerService.applyMatchResult', () => {
  let service: CareerService;
  const repository = {
    getMatchupRatingContext: jest.fn(),
    getRatings: jest.fn(),
    getFinishedMatchCounts: jest.fn(),
    saveRatings: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CareerService,
        { provide: CareerDrizzleRepository, useValue: repository },
        { provide: UserDrizzleRepository, useValue: {} },
      ],
    }).compile();

    service = module.get(CareerService);
  });

  it('does not change ratings in unranked tournaments', async () => {
    repository.getMatchupRatingContext.mockResolvedValue({
      categoryId: 3,
      isRanked: false,
      rosters: [],
    });

    await expect(service.applyMatchResult(1)).resolves.toEqual([]);
    expect(repository.saveRatings).not.toHaveBeenCalled();
  });

  it('saves new ratings for a ranked matchup, counting matches before this one', async () => {
    repository.getMatchupRatingContext.mockResolvedValue({
      categoryId: 3,
      isRanked: true,
      rosters: [
        { rosterId: 1, isWinner: true, players: [player(1)] },
        { rosterId: 2, isWinner: false, players: [player(2)] },
      ],
    });
    repository.getRatings.mockResolvedValue([
      { userId: 1, elo: 1000 },
      { userId: 2, elo: 1000 },
    ]);
    // 21 finished including this one, so 20 before it: K = 20
    repository.getFinishedMatchCounts.mockResolvedValue([
      { userId: 1, matches: 21 },
      { userId: 2, matches: 21 },
    ]);

    const changes = await service.applyMatchResult(1);

    expect(changes).toEqual([
      { userId: 1, elo: 1010 },
      { userId: 2, elo: 990 },
    ]);
    expect(repository.saveRatings).toHaveBeenCalledWith(changes, 3);
  });
});
