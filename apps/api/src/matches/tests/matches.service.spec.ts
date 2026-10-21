import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from '../matches.service';
import { MatchesDrizzleRepository } from '../matches.repository';
import { ChallongeService } from '../../challonge/challonge.service';
import { RosterService } from '../../roster/roster.service';
import { CareerService } from '../../career/career.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IChallongeMatch, IEndMatchupRequest } from '@tournament-app/types';
import { QueryMatchupRequestDto } from '../dto/requests';
import { PaginationOnly } from 'src/base/query/baseQuery';

describe('MatchesService', () => {
  let service: MatchesService;
  let eventEmitter: { emitAsync: jest.Mock };
  let matchesRepository: jest.Mocked<MatchesDrizzleRepository>;
  let challongeService: jest.Mocked<ChallongeService>;
  let rosterService: jest.Mocked<RosterService>;
  let careerService: {
    applyMatchResult: jest.Mock;
    revertMatchResult: jest.Mock;
  };

  // The Challonge paths are what these tests cover
  beforeAll(() => {
    process.env.CHALLONGE_ENABLED = 'true';
  });

  afterAll(() => {
    delete process.env.CHALLONGE_ENABLED;
  });

  beforeEach(async () => {
    const mockMatchesRepository = {
      getMatchupById: jest.fn(),
      insertMatchScore: jest.fn(),
      updateMatchScore: jest.fn(),
      deleteMatchScore: jest.fn(),
      deleteScore: jest.fn(),
      getStageById: jest.fn(),
      getWithResults: jest.fn(),
      getWithResultsAndScores: jest.fn(),
      getResultsForUser: jest.fn(),
      getResultsForRoster: jest.fn(),
      getResultsForGroupIds: jest.fn(),
      importChallongeMatchesToStage: jest.fn(),
      getManagedMatchups: jest.fn(),
      canUserEditMatchup: jest.fn(),
      isMatchupInTournament: jest.fn(),
      getResultsForGroup: jest.fn(),
      getRostersBySeed: jest.fn(),
      insertLocalRound: jest.fn(),
      getLocalMatchups: jest.fn().mockResolvedValue([]),
      getCarriedPoints: jest.fn().mockResolvedValue(new Map()),
      hasRound: jest.fn(),
      hasChallongeMatchups: jest.fn().mockResolvedValue(false),
      finishStage: jest.fn(),
    };

    const mockChallongeService = {
      updateMatchup: jest.fn(),
      getTournamentMatches: jest.fn().mockResolvedValue([]),
    };

    const mockRosterService = {
      findOne: jest.fn(),
    };

    eventEmitter = { emitAsync: jest.fn().mockResolvedValue([]) };

    careerService = {
      applyMatchResult: jest.fn().mockResolvedValue([]),
      revertMatchResult: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        {
          provide: MatchesDrizzleRepository,
          useValue: mockMatchesRepository,
        },
        {
          provide: ChallongeService,
          useValue: mockChallongeService,
        },
        {
          provide: RosterService,
          useValue: mockRosterService,
        },
        {
          provide: CareerService,
          useValue: careerService,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    matchesRepository = module.get(
      MatchesDrizzleRepository,
    ) as jest.Mocked<MatchesDrizzleRepository>;
    challongeService = module.get(
      ChallongeService,
    ) as jest.Mocked<ChallongeService>;
    rosterService = module.get(RosterService) as jest.Mocked<RosterService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMatchScore', () => {
    const result: IEndMatchupRequest = {
      scores: [
        {
          roundNumber: 1,
          scores: [
            { rosterId: 1, points: 3, isWinner: true },
            { rosterId: 2, points: 1, isWinner: false },
          ],
        },
      ],
      results: [
        { rosterId: 1, isWinner: true },
        { rosterId: 2, isWinner: false },
      ],
    };

    it('should update ratings once the result is saved', async () => {
      matchesRepository.getMatchupById.mockResolvedValue({
        matchup: { id: 1, stageId: 5, challongeMatchupId: null },
      } as any);
      matchesRepository.insertMatchScore.mockResolvedValue([] as any);

      await service.createMatchScore(1, result);

      expect(careerService.applyMatchResult).toHaveBeenCalledWith(1);
    });

    it('should re-rate a corrected result: revert first, then apply', async () => {
      matchesRepository.getMatchupById.mockResolvedValue({
        matchup: { id: 1, stageId: 5, challongeMatchupId: null },
      } as any);
      matchesRepository.updateMatchScore.mockResolvedValue([] as any);
      const calls: string[] = [];
      careerService.revertMatchResult.mockImplementation(async () => {
        calls.push('revert');
      });
      careerService.applyMatchResult.mockImplementation(async () => {
        calls.push('apply');
      });

      await service.updateMatchScore(1, result);

      expect(calls).toEqual(['revert', 'apply']);
    });

    it('should revert ratings when a result is deleted', async () => {
      matchesRepository.getMatchupById.mockResolvedValue({
        matchup: { id: 1, stageId: 5, challongeMatchupId: null },
      } as any);
      matchesRepository.deleteMatchScore.mockResolvedValue(undefined as any);

      await service.deleteMatchScore(1);

      expect(careerService.revertMatchResult).toHaveBeenCalledWith(1);
      expect(careerService.applyMatchResult).not.toHaveBeenCalled();
    });

    it('should keep the result when updating ratings fails', async () => {
      matchesRepository.getMatchupById.mockResolvedValue({
        matchup: { id: 1, stageId: 5, challongeMatchupId: null },
      } as any);
      matchesRepository.insertMatchScore.mockResolvedValue([{ id: 9 }] as any);
      careerService.applyMatchResult.mockRejectedValueOnce(new Error('db'));

      await expect(service.createMatchScore(1, result)).resolves.toEqual([
        { id: 9 },
      ]);
    });

    it('should create match score and update Challonge if the matchup has a Challonge ID', async () => {
      // Arrange
      const matchupId = 1;
      const endMatchupRequest: IEndMatchupRequest = {
        scores: [
          {
            roundNumber: 1,
            scores: [
              { rosterId: 1, points: 3, isWinner: true },
              { rosterId: 2, points: 1, isWinner: false },
            ],
          },
        ],
        results: [
          { rosterId: 1, isWinner: true },
          { rosterId: 2, isWinner: false },
        ],
      };

      matchesRepository.getMatchupById.mockResolvedValue({
        matchup: {
          id: 1,
          stageId: 5,
          challongeMatchupId: '123',
        },
        rosterToMatchup: [
          { rosterId: 1, matchupId: 1, isWinner: false },
          { rosterId: 2, matchupId: 1, isWinner: false },
        ],
      });

      matchesRepository.getStageById.mockResolvedValue({
        id: 5,
        name: 'Stage 1',
        challongeTournamentId: '456',
        stageType: 'single elimination',
        tournamentId: 1,
      } as any);

      matchesRepository.insertMatchScore.mockResolvedValue([
        { id: 10, matchupId: 1, roundNumber: 1 } as any,
      ]);

      rosterService.findOne.mockImplementation(async (rosterId) => {
        return {
          id: rosterId,
          stageId: 5,
          challongeParticipantId: rosterId === 1 ? '111' : '222',
        } as any;
      });

      challongeService.updateMatchup.mockResolvedValue(undefined);

      // Act
      const result = await service.createMatchScore(
        matchupId,
        endMatchupRequest,
      );

      // Assert
      expect(matchesRepository.getMatchupById).toHaveBeenCalledWith(matchupId);
      expect(matchesRepository.insertMatchScore).toHaveBeenCalledWith(
        matchupId,
        endMatchupRequest,
      );
      expect(matchesRepository.getStageById).toHaveBeenCalledWith(5);
      expect(rosterService.findOne).toHaveBeenCalledTimes(2);
      expect(challongeService.updateMatchup).toHaveBeenCalled();
      expect(result).toMatchObject([{ id: 10, matchupId: 1, roundNumber: 1 }]);
    });

    describe('when the stage runs on Challonge', () => {
      const result: IEndMatchupRequest = {
        scores: [],
        results: [
          { rosterId: 1, isWinner: true },
          { rosterId: 2, isWinner: false },
        ],
      };

      beforeEach(() => {
        matchesRepository.getMatchupById.mockResolvedValue({
          matchup: { id: 1, stageId: 5, round: 1, challongeMatchupId: '123' },
          rosterToMatchup: [],
        } as any);
        matchesRepository.getStageById.mockResolvedValue({
          id: 5,
          challongeTournamentId: '456',
          stageStatus: 'ongoing',
        } as any);
        matchesRepository.insertMatchScore.mockResolvedValue([] as any);
        matchesRepository.getMatchupsByRound = jest.fn().mockResolvedValue([]);
        rosterService.findOne.mockResolvedValue({ id: 1 } as any);
        challongeService.updateMatchup.mockResolvedValue(undefined);
      });

      // A state, or a state with the number of players assigned and the round
      const withMatches = (
        ...matches: (
          string | { state: string; players: number; round?: number }
        )[]
      ) =>
        challongeService.getTournamentMatches.mockResolvedValue(
          matches.map((match) => {
            const { state, players, round } =
              typeof match === 'string'
                ? { state: match, players: 2, round: 1 }
                : { round: 1, ...match };

            return {
              id: `${Math.random()}`,
              attributes: { state, round },
              relationships: {
                player1: { data: players > 0 ? { id: '1' } : null },
                player2: { data: players > 1 ? { id: '2' } : null },
              },
            };
          }) as any,
        );

      it('finishes the stage and lets its rules apply once every match is complete', async () => {
        withMatches('complete', 'complete');

        await service.createMatchScore(1, result);

        expect(matchesRepository.finishStage).toHaveBeenCalledWith(5);
        expect(eventEmitter.emitAsync).toHaveBeenCalledWith('stage.finished', {
          stageId: 5,
        });
      });

      it('keeps the stage going while a match is still open', async () => {
        withMatches('complete', 'open');

        await service.createMatchScore(1, result);

        expect(matchesRepository.finishStage).not.toHaveBeenCalled();
      });

      it('finishes the stage when only an unneeded grand-final reset is left waiting', async () => {
        withMatches('complete', 'complete', { state: 'pending', players: 0 });

        await service.createMatchScore(1, result);

        expect(matchesRepository.finishStage).toHaveBeenCalledWith(5);
      });

      it('keeps the stage going while a pending match already has both players', async () => {
        withMatches('complete', { state: 'pending', players: 2 });

        await service.createMatchScore(1, result);

        expect(matchesRepository.finishStage).not.toHaveBeenCalled();
      });

      it('keeps the stage going while pending matches wait for a result that is not in yet', async () => {
        withMatches('complete', { state: 'pending', players: 1 }, 'open');

        await service.createMatchScore(1, result);

        expect(matchesRepository.finishStage).not.toHaveBeenCalled();
      });

      it('brings in the next round from the same look at Challonge, once the round is done', async () => {
        matchesRepository.getMatchupsByRound.mockResolvedValue([
          { isFinished: true },
        ] as any);
        withMatches('complete', { state: 'open', players: 2, round: 2 });

        await service.createMatchScore(1, result);

        expect(challongeService.getTournamentMatches).toHaveBeenCalledTimes(1);
        expect(
          matchesRepository.importChallongeMatchesToStage,
        ).toHaveBeenCalledWith(5, [
          expect.objectContaining({ attributes: { state: 'open', round: 2 } }),
        ]);
      });

      it('does not bring in the next round while the current one has unfinished matchups', async () => {
        matchesRepository.getMatchupsByRound.mockResolvedValue([
          { isFinished: true },
          { isFinished: false },
        ] as any);
        withMatches('complete', { state: 'open', players: 2, round: 2 });

        await service.createMatchScore(1, result);

        expect(
          matchesRepository.importChallongeMatchesToStage,
        ).not.toHaveBeenCalled();
      });

      it('leaves Challonge alone while the feature is disabled', async () => {
        withMatches('complete');
        process.env.CHALLONGE_ENABLED = 'false';

        try {
          await service.createMatchScore(1, result);
        } finally {
          process.env.CHALLONGE_ENABLED = 'true';
        }

        expect(challongeService.updateMatchup).not.toHaveBeenCalled();
        expect(matchesRepository.finishStage).not.toHaveBeenCalled();
      });

      it('freezes the results of a finished Challonge stage, whose rules have already run', async () => {
        matchesRepository.getStageById.mockResolvedValue({
          id: 5,
          challongeTournamentId: '456',
          stageStatus: 'finished',
        } as any);

        await expect(service.updateMatchScore(1, result)).rejects.toThrow(
          'The stage is finished',
        );
        await expect(service.deleteMatchScore(1)).rejects.toThrow(
          'The stage is finished',
        );
        expect(challongeService.updateMatchup).not.toHaveBeenCalled();
      });

      it('does not finish a stage that is already finished', async () => {
        withMatches('complete');
        matchesRepository.getStageById.mockResolvedValue({
          id: 5,
          challongeTournamentId: '456',
          stageStatus: 'finished',
        } as any);

        await service.createMatchScore(1, result);

        expect(matchesRepository.finishStage).not.toHaveBeenCalled();
      });
    });

    it('should create match score without updating Challonge if no Challonge ID', async () => {
      // Arrange
      const matchupId = 1;
      const endMatchupRequest: IEndMatchupRequest = {
        scores: [
          {
            roundNumber: 1,
            scores: [
              { rosterId: 1, points: 3, isWinner: true },
              { rosterId: 2, points: 1, isWinner: false },
            ],
          },
        ],
        results: [
          { rosterId: 1, isWinner: true },
          { rosterId: 2, isWinner: false },
        ],
      };

      matchesRepository.getMatchupById.mockResolvedValue({
        matchup: {
          id: 1,
          stageId: 5,
          challongeMatchupId: null,
        },
        rosterToMatchup: [
          { rosterId: 1, matchupId: 1, isWinner: false },
          { rosterId: 2, matchupId: 1, isWinner: false },
        ],
      });

      matchesRepository.insertMatchScore.mockResolvedValue([
        { id: 10, matchupId: 1, roundNumber: 1 } as any,
      ]);

      // Act
      const result = await service.createMatchScore(
        matchupId,
        endMatchupRequest,
      );

      // Assert
      expect(matchesRepository.getMatchupById).toHaveBeenCalledWith(matchupId);
      expect(matchesRepository.insertMatchScore).toHaveBeenCalledWith(
        matchupId,
        endMatchupRequest,
      );
      expect(rosterService.findOne).not.toHaveBeenCalled();
      expect(challongeService.updateMatchup).not.toHaveBeenCalled();
      expect(result).toMatchObject([{ id: 10, matchupId: 1, roundNumber: 1 }]);
    });
  });

  describe('getMatchupsWithResults', () => {
    it('should return matchups with results', async () => {
      // Arrange
      const query: QueryMatchupRequestDto = { stageId: 5 };
      const expectedResults = [
        {
          id: 1,
          stageId: 5,
          round: 1,
          isFinished: true,
          matchupType: 'standard',
          results: [],
          startDate: expect.any(Array),
        },
      ];

      matchesRepository.getWithResults.mockResolvedValue(
        expectedResults as any,
      );

      const result = await service.getMatchupsWithResults(query);

      expect(matchesRepository.getWithResults).toHaveBeenCalledWith(query);
      expect(result).toMatchObject(expectedResults);
    });
  });

  describe('getMatchupWithResultsAndScores', () => {
    it('should return a matchup with results and scores', async () => {
      // Arrange
      const matchupId = 1;
      const expectedResult = {
        id: 1,
        stageId: 5,
        round: 1,
        isFinished: true,
      };

      matchesRepository.getWithResultsAndScores.mockResolvedValue(
        expectedResult as any,
      );

      const result = await service.getMatchupWithResultsAndScores(matchupId);

      expect(matchesRepository.getWithResultsAndScores).toHaveBeenCalledWith(
        matchupId,
      );
      expect(result).toMatchObject({
        ...expectedResult,
        matchupType: 'standard',
        results: expect.any(Array),
      });
    });
  });

  describe('getResultsForUser', () => {
    it('should return matchups with results for a user', async () => {
      // Arrange
      const userId = 1;
      const pagination: PaginationOnly = { page: 1, pageSize: 10 };
      const expectedResults = [
        {
          id: 1,
          stageId: 5,
          round: 1,
          isFinished: true,
          results: [],
          matchupType: 'standard',
          startDate: new Date(),
        },
      ];

      // Mock the repository method
      matchesRepository.getResultsForUser.mockResolvedValue(
        expectedResults as any,
      );

      // Act
      const result = await service.getResultsForUser(userId, pagination);

      // Assert
      expect(matchesRepository.getResultsForUser).toHaveBeenCalledWith(
        userId,
        pagination,
      );
      expect(result).toMatchObject(expectedResults);
    });
  });

  describe('getResultsForRoster', () => {
    it('should return results for a roster', async () => {
      // Arrange
      const rosterId = 1;
      const expectedResults = [
        {
          id: 1,
          stageId: 5,
          round: 1,
          isFinished: true,
          startDate: new Date(),
        },
      ];

      matchesRepository.getResultsForRoster.mockResolvedValue(
        expectedResults as any,
      );

      // Act
      const result = await service.getResultsForRoster(rosterId);

      // Assert
      expect(matchesRepository.getResultsForRoster).toHaveBeenCalledWith(
        rosterId,
        undefined,
      );
      expect(result).toMatchObject(expectedResults);
    });
  });

  describe('getResultsForGroup', () => {
    it('should return results for a group with pagination', async () => {
      // Arrange
      const groupId = 1;
      const pagination: PaginationOnly = { page: 1, pageSize: 10 };

      // Repository response structure
      const repositoryResults = [
        {
          id: 1,
          stageId: 5,
          round: 1,
          isFinished: true,
          challongeMatchupId: null,
          rosterToMatchup: [
            {
              isWinner: true,
              matchupId: 1,
              score: 3,
              roster: {
                id: 1,
                stageId: 5,
                participation: {
                  id: 10,
                  group: { id: 1, name: 'Group A' },
                },
              },
            },
          ],
        },
      ];

      // Expected mapped result from the service
      const mappedResults = [
        {
          id: 1,
          stageId: 5,
          round: 1,
          isFinished: true,
          matchupType: 'standard',
          startDate: expect.any(Date),
          results: [
            {
              id: 1,
              matchupId: 1,
              score: 3,
              isWinner: true,
              roster: {
                id: 1,
                stageId: 5,
                participation: {
                  id: 10,
                  group: { id: 1, name: 'Group A' },
                },
              },
            },
          ],
        },
      ];

      // Mock the repository method to return the test data
      matchesRepository.getResultsForGroup.mockResolvedValue(
        repositoryResults as any,
      );

      // Act
      const result = await service.getResultsForGroup(groupId, pagination);

      // Assert
      expect(matchesRepository.getResultsForGroup).toHaveBeenCalledWith(
        groupId,
        pagination,
      );
      expect(result).toMatchObject(mappedResults);
    });
  });

  describe('importChallongeMatchesToStage', () => {
    it('should import Challonge matches to stage', async () => {
      // Arrange
      const stageId = 5;
      const challongeMatches: IChallongeMatch[] = [
        {
          id: '123',
          attributes: {
            round: 1,
            timestamps: {
              starts_at: '2023-01-01T12:00:00Z',
            },
          },
          relationships: {
            player1: {
              data: {
                id: '111',
              },
            },
            player2: {
              data: {
                id: '222',
              },
            },
          },
        } as any,
      ];
      const expectedResults = [
        {
          id: 1,
          stageId: 5,
          round: 1,
          challongeMatchupId: '123',
        },
      ];

      matchesRepository.importChallongeMatchesToStage.mockResolvedValue(
        expectedResults,
      );

      // Act
      const result = await service.importChallongeMatchesToStage(
        stageId,
        challongeMatches,
      );

      // Assert
      expect(
        matchesRepository.importChallongeMatchesToStage,
      ).toHaveBeenCalledWith(stageId, challongeMatches);
      expect(result).toMatchObject(expectedResults);
    });
  });

  describe('getManagedMatchups', () => {
    it('should return managed matchups for a user', async () => {
      // Arrange
      const userId = 1;
      const query: PaginationOnly = { page: 1, pageSize: 10 };
      const expectedResults = [
        {
          id: 1,
          stageId: 5,
          round: 1,
          isFinished: true,
        },
      ];

      matchesRepository.getManagedMatchups.mockResolvedValue(
        expectedResults as any,
      );

      // Act
      const result = await service.getManagedMatchups(userId, query);

      // Assert
      expect(matchesRepository.getManagedMatchups).toHaveBeenCalledWith(
        userId,
        query,
      );
      expect(result).toMatchObject(expectedResults);
    });
  });

  describe('canUserEditMatchup', () => {
    it('should check if a user can edit a matchup', async () => {
      // Arrange
      const matchupId = 1;
      const userId = 1;

      matchesRepository.canUserEditMatchup.mockResolvedValue(true);

      // Act
      const result = await service.canUserEditMatchup(matchupId, userId);

      // Assert
      expect(matchesRepository.canUserEditMatchup).toHaveBeenCalledWith(
        matchupId,
        userId,
      );
      expect(result).toBe(true);
    });
  });

  describe('isMatchupInTournament', () => {
    it('should check if a matchup is in a tournament', async () => {
      // Arrange
      const matchupId = 1;
      const tournamentId = 5;

      matchesRepository.isMatchupInTournament.mockResolvedValue({
        belongsToTournament: true,
      } as any);

      // Act
      const result = await service.isMatchupInTournament(
        matchupId,
        tournamentId,
      );

      // Assert
      expect(matchesRepository.isMatchupInTournament).toHaveBeenCalledWith(
        matchupId,
        tournamentId,
      );
      expect(result).toBe(true);
    });
  });

  describe('updateMatchScore', () => {
    it('should update match score and update Challonge if the matchup has a Challonge ID', async () => {
      // Arrange
      const matchupId = 1;
      const updateMatchupRequest: IEndMatchupRequest = {
        scores: [
          {
            roundNumber: 1,
            scores: [
              { rosterId: 1, points: 5, isWinner: true },
              { rosterId: 2, points: 2, isWinner: false },
            ],
          },
        ],
        results: [
          { rosterId: 1, isWinner: true },
          { rosterId: 2, isWinner: false },
        ],
      };

      matchesRepository.getMatchupById.mockResolvedValue({
        matchup: {
          id: 1,
          stageId: 5,
          challongeMatchupId: '123',
        },
        rosterToMatchup: [
          { rosterId: 1, matchupId: 1, isWinner: false },
          { rosterId: 2, matchupId: 1, isWinner: false },
        ],
      });

      matchesRepository.getStageById.mockResolvedValue({
        id: 5,
        name: 'Stage 1',
        challongeTournamentId: '456',
        stageType: 'single elimination',
        tournamentId: 1,
      } as any);

      matchesRepository.updateMatchScore.mockResolvedValue([
        { id: 10, matchupId: 1, roundNumber: 1 } as any,
      ]);

      rosterService.findOne.mockImplementation(async (rosterId) => {
        return {
          id: rosterId,
          stageId: 5,
          challongeParticipantId: rosterId === 1 ? '111' : '222',
        } as any;
      });

      challongeService.updateMatchup.mockResolvedValue(undefined);

      // Act
      const result = await service.updateMatchScore(
        matchupId,
        updateMatchupRequest,
      );

      // Assert
      expect(matchesRepository.getMatchupById).toHaveBeenCalledWith(matchupId);
      expect(matchesRepository.updateMatchScore).toHaveBeenCalledWith(
        matchupId,
        updateMatchupRequest,
      );
      expect(matchesRepository.getStageById).toHaveBeenCalledWith(5);
      expect(rosterService.findOne).toHaveBeenCalledTimes(2);
      expect(challongeService.updateMatchup).toHaveBeenCalled();
      expect(result).toMatchObject([{ id: 10, matchupId: 1, roundNumber: 1 }]);
    });

    it('should update match score without updating Challonge if no Challonge ID', async () => {
      // Arrange
      const matchupId = 1;
      const updateMatchupRequest: IEndMatchupRequest = {
        scores: [
          {
            roundNumber: 1,
            scores: [
              { rosterId: 1, points: 5, isWinner: true },
              { rosterId: 2, points: 2, isWinner: false },
            ],
          },
        ],
        results: [
          { rosterId: 1, isWinner: true },
          { rosterId: 2, isWinner: false },
        ],
      };

      matchesRepository.getMatchupById.mockResolvedValue({
        matchup: {
          id: 1,
          stageId: 5,
          challongeMatchupId: null,
        },
        rosterToMatchup: [
          { rosterId: 1, matchupId: 1, isWinner: false },
          { rosterId: 2, matchupId: 1, isWinner: false },
        ],
      });

      matchesRepository.updateMatchScore.mockResolvedValue([
        { id: 10, matchupId: 1, roundNumber: 1 } as any,
      ]);

      // Act
      const result = await service.updateMatchScore(
        matchupId,
        updateMatchupRequest,
      );

      // Assert
      expect(matchesRepository.getMatchupById).toHaveBeenCalledWith(matchupId);
      expect(matchesRepository.updateMatchScore).toHaveBeenCalledWith(
        matchupId,
        updateMatchupRequest,
      );
      expect(rosterService.findOne).not.toHaveBeenCalled();
      expect(challongeService.updateMatchup).not.toHaveBeenCalled();
      expect(result).toMatchObject([{ id: 10, matchupId: 1, roundNumber: 1 }]);
    });
  });

  describe('deleteMatchScore', () => {
    it('should delete match score and update Challonge if the matchup has a Challonge ID', async () => {
      // Arrange
      const matchupId = 1;

      matchesRepository.getMatchupById.mockResolvedValue({
        matchup: {
          id: 1,
          stageId: 5,
          challongeMatchupId: '123',
        },
        rosterToMatchup: [
          { rosterId: 1, matchupId: 1, isWinner: true },
          { rosterId: 2, matchupId: 1, isWinner: false },
        ],
      });

      matchesRepository.getStageById.mockResolvedValue({
        id: 5,
        name: 'Stage 1',
        challongeTournamentId: '456',
        stageType: 'single elimination',
        tournamentId: 1,
      } as any);

      matchesRepository.deleteScore.mockResolvedValue({
        id: 1,
        stageId: 5,
        challongeMatchupId: '123',
      } as any);

      rosterService.findOne.mockImplementation(async (rosterId) => {
        return {
          id: rosterId,
          stageId: 5,
          challongeParticipantId: rosterId === 1 ? '111' : '222',
        } as any;
      });

      challongeService.updateMatchup.mockResolvedValue(undefined);

      // Act
      await service.deleteMatchScore(matchupId);

      // Assert
      expect(matchesRepository.getMatchupById).toHaveBeenCalledWith(matchupId);
      expect(matchesRepository.getStageById).toHaveBeenCalledWith(5);
      expect(challongeService.updateMatchup).toHaveBeenCalled();
    });

    it('should delete match score without updating Challonge if no Challonge ID', async () => {
      // Arrange
      const matchupId = 1;

      matchesRepository.getMatchupById.mockResolvedValue({
        matchup: {
          id: 1,
          stageId: 5,
          challongeMatchupId: null,
        },
        rosterToMatchup: [
          { rosterId: 1, matchupId: 1, isWinner: true },
          { rosterId: 2, matchupId: 1, isWinner: false },
        ],
      });

      matchesRepository.deleteScore.mockResolvedValue({
        id: 1,
        stageId: 5,
        challongeMatchupId: null,
      } as any);

      // Act
      await service.deleteMatchScore(matchupId);

      // Assert
      expect(matchesRepository.getMatchupById).toHaveBeenCalledWith(matchupId);
      expect(challongeService.updateMatchup).not.toHaveBeenCalled();
    });
  });

  describe('getResultsForRoster', () => {
    it('should return matchups with results for a roster', async () => {
      // Arrange
      const rosterId = 1;
      const pagination: PaginationOnly = { page: 1, pageSize: 10 };
      const expectedResults = [
        {
          id: 1,
          stageId: 5,
          round: 1,
          isFinished: true,
        },
      ];

      matchesRepository.getResultsForRoster.mockResolvedValue(
        expectedResults as any,
      );

      // Act
      const result = await service.getResultsForRoster(rosterId, pagination);

      // Assert
      expect(matchesRepository.getResultsForRoster).toHaveBeenCalledWith(
        rosterId,
        pagination,
      );
      expect(result).toMatchObject(expectedResults);
    });
  });

  describe('getManagedMatchups', () => {
    it('should return matchups managed by the user', async () => {
      // Arrange
      const userId = 1;
      const query: QueryMatchupRequestDto = { stageId: 5 };
      const expectedResults = [
        {
          id: 1,
          stageId: 5,
          round: 1,
          isFinished: true,
          rosterToMatchup: [
            {
              isWinner: true,
              matchupId: 1,
              score: 3,
              roster: {
                id: 1,
                stageId: 5,
              },
            },
          ],
        },
      ];

      matchesRepository.getManagedMatchups.mockResolvedValue(
        expectedResults as any,
      );

      // Act
      const result = await service.getManagedMatchups(userId, query);

      // Assert
      expect(matchesRepository.getManagedMatchups).toHaveBeenCalledWith(
        userId,
        query,
      );
      expect(result).toMatchObject(expectedResults);
    });
  });

  describe('local brackets', () => {
    const localMatchup = {
      matchup: { id: 3, stageId: 5, round: 1, challongeMatchupId: null },
    } as any;

    const played = (
      id: number,
      round: number,
      rosterIds: number[],
      winners: number[],
      bracket: string | null = null,
    ) => ({ id, round, bracket, isFinished: true, rosterIds, winners });

    const pending = (id: number, round: number, rosterIds: number[]) => ({
      id,
      round,
      bracket: null,
      isFinished: false,
      rosterIds,
      winners: [],
    });

    const stageOfType = (stageType: string, stageStatus = 'ongoing') =>
      matchesRepository.getStageById.mockResolvedValue({
        id: 5,
        stageType,
        stageStatus,
      } as any);

    beforeEach(() => stageOfType('knockout'));

    it('draws round 1 of a knockout stage from the seeded rosters', async () => {
      matchesRepository.getRostersBySeed.mockResolvedValue([10, 11, 12, 13]);
      const startDate = new Date();

      await service.startLocalBracket(5, startDate);

      expect(matchesRepository.insertLocalRound).toHaveBeenCalledWith(
        5,
        1,
        [{ rosterIds: [10, 13] }, { rosterIds: [11, 12] }],
        startDate,
      );
    });

    it('refuses to start without rosters', async () => {
      matchesRepository.getRostersBySeed.mockResolvedValue([]);

      await expect(service.startLocalBracket(5, new Date())).rejects.toThrow(
        'No rosters found',
      );
    });

    it('draws the next knockout round once every matchup has a winner', async () => {
      matchesRepository.getLocalMatchups
        .mockResolvedValueOnce([
          played(1, 1, [10, 13], [10]),
          played(2, 1, [11, 12], [12]),
        ])
        .mockResolvedValueOnce([pending(3, 2, [10, 12])]);

      await service.advanceLocalBracket(5, 1);

      expect(matchesRepository.insertLocalRound).toHaveBeenCalledWith(
        5,
        2,
        [{ rosterIds: [10, 12] }],
        expect.any(Date),
      );
    });

    it('waits while a matchup of the round is unfinished', async () => {
      matchesRepository.getLocalMatchups.mockResolvedValue([
        played(1, 1, [10, 13], [10]),
        pending(2, 1, [11, 12]),
      ]);

      await service.advanceLocalBracket(5, 1);

      expect(matchesRepository.insertLocalRound).not.toHaveBeenCalled();
    });

    it('finishes the stage after the final and announces it', async () => {
      matchesRepository.getLocalMatchups.mockResolvedValue([
        played(7, 3, [10, 12], [10]),
      ]);

      await service.advanceLocalBracket(5, 3);

      expect(matchesRepository.finishStage).toHaveBeenCalledWith(5);
      expect(matchesRepository.insertLocalRound).not.toHaveBeenCalled();
      expect(eventEmitter.emitAsync).toHaveBeenCalledWith('stage.finished', {
        stageId: 5,
      });
    });

    it('does not draw a round twice', async () => {
      matchesRepository.getLocalMatchups.mockResolvedValue([
        played(1, 1, [10, 13], [10]),
        played(2, 1, [11, 12], [12]),
        pending(3, 2, [10, 12]),
      ]);

      await service.advanceLocalBracket(5, 1);

      expect(matchesRepository.insertLocalRound).not.toHaveBeenCalled();
    });

    it('does nothing for a finished stage', async () => {
      stageOfType('knockout', 'finished');
      matchesRepository.getLocalMatchups.mockResolvedValue([
        played(7, 3, [10, 12], [10]),
      ]);

      await service.advanceLocalBracket(5, 3);

      expect(matchesRepository.finishStage).not.toHaveBeenCalled();
    });

    it('draws every round of a round robin at the start', async () => {
      stageOfType('round_robin');
      matchesRepository.getRostersBySeed.mockResolvedValue([10, 11, 12, 13]);
      matchesRepository.getLocalMatchups.mockResolvedValue([
        pending(1, 1, [10, 13]),
      ]);

      await service.startLocalBracket(5, new Date());

      expect(matchesRepository.insertLocalRound).toHaveBeenCalledTimes(3);
      expect(matchesRepository.finishStage).not.toHaveBeenCalled();
    });

    it('finishes a round robin once every matchup is played, in any order', async () => {
      stageOfType('round_robin');
      matchesRepository.getLocalMatchups.mockResolvedValue([
        played(1, 1, [10, 11], [10]),
        played(2, 2, [10, 12], []),
        played(3, 3, [11, 12], [12]),
      ]);

      await service.advanceLocalBracket(5, 1);

      expect(matchesRepository.finishStage).toHaveBeenCalledWith(5);
    });

    it('does not advance a knockout round with a drawn matchup', async () => {
      matchesRepository.getLocalMatchups.mockResolvedValue([
        played(1, 1, [10, 11], []),
      ]);

      await service.advanceLocalBracket(5, 1);

      expect(matchesRepository.finishStage).not.toHaveBeenCalled();
      expect(matchesRepository.insertLocalRound).not.toHaveBeenCalled();
    });

    it('pairs a Swiss round by standings and stops after its last round', async () => {
      stageOfType('swiss');
      matchesRepository.getRostersBySeed.mockResolvedValue([10, 11, 12, 13]);
      matchesRepository.getLocalMatchups
        .mockResolvedValueOnce([
          played(1, 1, [10, 12], [10]),
          played(2, 1, [11, 13], [11]),
        ])
        .mockResolvedValueOnce([pending(3, 2, [10, 11])]);

      await service.advanceLocalBracket(5, 1);

      expect(matchesRepository.insertLocalRound).toHaveBeenCalledWith(
        5,
        2,
        [{ rosterIds: [10, 11] }, { rosterIds: [12, 13] }],
        expect.any(Date),
      );

      jest.clearAllMocks();
      matchesRepository.getLocalMatchups.mockResolvedValue([
        played(1, 1, [10, 12], [10]),
        played(2, 1, [11, 13], [11]),
        played(3, 2, [10, 11], [10]),
        played(4, 2, [12, 13], [13]),
      ]);

      await service.advanceLocalBracket(5, 2);

      expect(matchesRepository.finishStage).toHaveBeenCalledWith(5);
    });

    it('sends double-elimination losers to the losers bracket', async () => {
      stageOfType('double_elimination');
      matchesRepository.getRostersBySeed.mockResolvedValue([10, 11, 12, 13]);
      matchesRepository.getLocalMatchups
        .mockResolvedValueOnce([
          played(1, 1, [10, 13], [10], 'winners'),
          played(2, 1, [11, 12], [11], 'winners'),
        ])
        .mockResolvedValueOnce([pending(3, 2, [10, 11])]);

      await service.advanceLocalBracket(5, 1);

      expect(matchesRepository.insertLocalRound).toHaveBeenCalledWith(
        5,
        2,
        [
          { rosterIds: [10, 11], bracket: 'winners' },
          { rosterIds: [12, 13], bracket: 'losers' },
        ],
        expect.any(Date),
      );
    });

    it('returns standings for the stage format', async () => {
      stageOfType('round_robin');
      matchesRepository.getRostersBySeed.mockResolvedValue([10, 11]);
      matchesRepository.getLocalMatchups.mockResolvedValue([
        played(1, 1, [10, 11], [11]),
      ]);

      const result = await service.getStandings(5);

      expect(result).toMatchObject({
        stageId: 5,
        format: 'round_robin',
        isFinished: false,
        standings: [
          { rosterId: 11, place: 1, wins: 1, points: 3 },
          { rosterId: 10, place: 2, losses: 1, points: 0 },
        ],
      });
    });

    it('says whether the stage runs on Challonge', async () => {
      const standings = async (setup: {
        id: string | null;
        enabled: boolean;
        matchups: boolean;
        hasChallongeMatchups: boolean;
        stageType?: string;
      }) => {
        const stageType = setup.stageType ?? 'compass';
        stageOfType(stageType);
        matchesRepository.getStageById.mockResolvedValue({
          id: 5,
          stageType,
          stageStatus: 'ongoing',
          challongeTournamentId: setup.id,
        } as any);
        matchesRepository.getRostersBySeed.mockResolvedValue([10, 11]);
        matchesRepository.getLocalMatchups.mockResolvedValue(
          setup.matchups ? [played(1, 1, [10, 11], [10], 'east')] : [],
        );
        matchesRepository.hasChallongeMatchups.mockResolvedValue(
          setup.hasChallongeMatchups,
        );
        process.env.CHALLONGE_ENABLED = String(setup.enabled);

        try {
          return await service.getStandings(5);
        } finally {
          process.env.CHALLONGE_ENABLED = 'true';
        }
      };

      // Never had a Challonge tournament
      expect(
        await standings({
          id: null,
          enabled: true,
          matchups: true,
          hasChallongeMatchups: false,
        }),
      ).toMatchObject({ runsOnChallonge: false, format: 'compass' });

      // Has one, but the API started it (Challonge was off): its own bracket, in its own format
      expect(
        await standings({
          id: '9',
          enabled: false,
          matchups: true,
          hasChallongeMatchups: false,
        }),
      ).toMatchObject({ runsOnChallonge: false, format: 'compass' });

      // Imported from Challonge before compass stages ran in the API: run there as double elimination
      expect(
        await standings({
          id: '9',
          enabled: true,
          matchups: true,
          hasChallongeMatchups: true,
        }),
      ).toMatchObject({ runsOnChallonge: true, format: 'double_elimination' });

      // Still to be started, with Challonge on: it will run there; with it off it will not
      expect(
        await standings({
          id: '9',
          enabled: true,
          matchups: false,
          hasChallongeMatchups: false,
          stageType: 'knockout',
        }),
      ).toMatchObject({ runsOnChallonge: true });

      // Challonge has no compass bracket, so the API runs it even with Challonge on
      expect(
        await standings({
          id: '9',
          enabled: true,
          matchups: false,
          hasChallongeMatchups: false,
        }),
      ).toMatchObject({ runsOnChallonge: false, format: 'compass' });
      expect(
        await standings({
          id: '9',
          enabled: false,
          matchups: false,
          hasChallongeMatchups: false,
        }),
      ).toMatchObject({ runsOnChallonge: false });
    });

    it('advances the bracket after a local result is recorded', async () => {
      matchesRepository.getMatchupById.mockResolvedValue(localMatchup);
      matchesRepository.insertMatchScore.mockResolvedValue([] as any);

      await service.createMatchScore(3, { scores: [], results: [] });

      expect(matchesRepository.getLocalMatchups).toHaveBeenCalledWith(5);
    });

    it('freezes a local result once the next round is drawn', async () => {
      matchesRepository.getMatchupById.mockResolvedValue(localMatchup);
      matchesRepository.hasRound.mockResolvedValue(true);

      await expect(
        service.updateMatchScore(3, { scores: [], results: [] }),
      ).rejects.toThrow('The next round has already been drawn');
      await expect(service.deleteMatchScore(3)).rejects.toThrow(
        'The next round has already been drawn',
      );
      expect(matchesRepository.updateMatchScore).not.toHaveBeenCalled();
      expect(matchesRepository.deleteMatchScore).not.toHaveBeenCalled();
    });

    it('freezes every local result once the stage is finished', async () => {
      stageOfType('round_robin', 'finished');
      matchesRepository.getMatchupById.mockResolvedValue(localMatchup);

      await expect(service.deleteMatchScore(3)).rejects.toThrow(
        'The stage is finished',
      );
    });

    it('lets round robin results change while later rounds exist', async () => {
      stageOfType('round_robin');
      matchesRepository.getMatchupById.mockResolvedValue(localMatchup);
      matchesRepository.hasRound.mockResolvedValue(true);
      matchesRepository.deleteMatchScore.mockResolvedValue({ success: true });

      await expect(service.deleteMatchScore(3)).resolves.toEqual({
        success: true,
      });
    });
  });
});
