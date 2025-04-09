import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from '../matches.service';
import { MatchesDrizzleRepository } from '../matches.repository';
import { ChallongeService } from '../../challonge/challonge.service';
import { RosterService } from '../../roster/roster.service';
import { IChallongeMatch, IEndMatchupRequest } from '@tournament-app/types';
import { QueryMatchupRequestDto } from '../dto/requests';
import { PaginationOnly } from 'src/base/query/baseQuery';

describe('MatchesService', () => {
  let service: MatchesService;
  let matchesRepository: jest.Mocked<MatchesDrizzleRepository>;
  let challongeService: jest.Mocked<ChallongeService>;
  let rosterService: jest.Mocked<RosterService>;

  beforeEach(async () => {
    const mockMatchesRepository = {
      getMatchupById: jest.fn(),
      insertMatchScore: jest.fn(),
      updateMatchScore: jest.fn(),
      deleteMatchScore: jest.fn(),
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
      deleteScore: jest.fn(),
    };

    const mockChallongeService = {
      updateMatchup: jest.fn(),
    };

    const mockRosterService = {
      findOne: jest.fn(),
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
      expect(result).toEqual([{ id: 10, matchupId: 1, roundNumber: 1 }]);
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
      expect(matchesRepository.getStageById).not.toHaveBeenCalled();
      expect(rosterService.findOne).not.toHaveBeenCalled();
      expect(challongeService.updateMatchup).not.toHaveBeenCalled();
      expect(result).toEqual([{ id: 10, matchupId: 1, roundNumber: 1 }]);
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
                  group: { id: 20, name: 'Team A' },
                },
              },
            },
          ],
        },
      ];

      matchesRepository.getWithResults.mockResolvedValue(
        expectedResults as any,
      );

      const result = await service.getMatchupsWithResults(query);

      expect(matchesRepository.getWithResults).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResults);
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
        scoreToRoster: [
          {
            id: 101,
            scoreId: 201,
            rosterId: 1,
            points: 3,
            isWinner: true,
            score: { id: 201, roundNumber: 1, matchupId: 1 },
          },
        ],
        rosterToMatchup: [
          {
            isWinner: true,
            matchupId: 1,
            score: 3,
            roster: {
              participation: {
                id: 10,
                group: { id: 20, name: 'Team A' },
              },
            },
          },
        ],
      };

      matchesRepository.getWithResultsAndScores.mockResolvedValue(
        expectedResult as any,
      );

      const result = await service.getMatchupWithResultsAndScores(matchupId);

      expect(matchesRepository.getWithResultsAndScores).toHaveBeenCalledWith({
        matchupId,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getResultsForUser', () => {
    it('should return results for a user', async () => {
      // Arrange
      const userId = 1;
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
                participation: {
                  id: 10,
                  group: { id: 20, name: 'Team A' },
                },
              },
            },
          ],
        },
      ];

      matchesRepository.getResultsForUser.mockResolvedValue(
        expectedResults as any,
      );

      const result = await service.getResultsForUser(userId);

      expect(matchesRepository.getResultsForUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResults);
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
                  group: { id: 20, name: 'Team A' },
                },
              },
            },
          ],
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
      );
      expect(result).toEqual(expectedResults);
    });
  });

  describe('getResultsForGroup', () => {
    it('should return results for a group', async () => {
      // Arrange
      const groupId = 20;
      const matchupIds = [{ id: 1 }, { id: 2 }];
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
                participation: {
                  id: 10,
                  group: { id: 20, name: 'Team A' },
                },
              },
            },
          ],
        },
      ];

      matchesRepository.getResultsForGroupIds.mockResolvedValue(matchupIds);
      matchesRepository.getWithResults.mockResolvedValue(
        expectedResults as any,
      );

      // Act
      const result = await service.getResultsForGroup(groupId);

      // Assert
      expect(matchesRepository.getResultsForGroupIds).toHaveBeenCalledWith(
        groupId,
      );
      expect(matchesRepository.getWithResults).toHaveBeenCalledWith({
        ids: [1, 2],
      });
      expect(result).toEqual(expectedResults);
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
      expect(result).toEqual(expectedResults);
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
      expect(result).toEqual(expectedResults);
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
      expect(result).toEqual([{ id: 10, matchupId: 1, roundNumber: 1 }]);
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
      expect(matchesRepository.getStageById).not.toHaveBeenCalled();
      expect(rosterService.findOne).not.toHaveBeenCalled();
      expect(challongeService.updateMatchup).not.toHaveBeenCalled();
      expect(result).toEqual([{ id: 10, matchupId: 1, roundNumber: 1 }]);
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
      const result = await service.deleteMatchScore(matchupId);

      // Assert
      expect(matchesRepository.getMatchupById).toHaveBeenCalledWith(matchupId);
      expect(matchesRepository.deleteScore).toHaveBeenCalledWith(matchupId);
      expect(matchesRepository.getStageById).toHaveBeenCalledWith(5);
      expect(challongeService.updateMatchup).toHaveBeenCalled();
      expect(result).toEqual({
        id: 1,
        stageId: 5,
        challongeMatchupId: '123',
      });
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
      const result = await service.deleteMatchScore(matchupId);

      // Assert
      expect(matchesRepository.getMatchupById).toHaveBeenCalledWith(matchupId);
      expect(matchesRepository.deleteScore).toHaveBeenCalledWith(matchupId);
      expect(matchesRepository.getStageById).not.toHaveBeenCalled();
      expect(challongeService.updateMatchup).not.toHaveBeenCalled();
      expect(result).toEqual({
        id: 1,
        stageId: 5,
        challongeMatchupId: null,
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
          rosterToMatchup: [
            {
              isWinner: true,
              matchupId: 1,
              score: 3,
              roster: {
                id: 1,
                stageId: 5,
                players: [
                  {
                    userId: 1,
                    rosterId: 1,
                  },
                ],
              },
            },
          ],
        },
      ];

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
      expect(result).toEqual(expectedResults);
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
      expect(result).toEqual(expectedResults);
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
      expect(result).toEqual(expectedResults);
    });
  });

  describe('getResultsForGroup', () => {
    it('should return matchups with results for a group', async () => {
      // Arrange
      const groupId = 1;
      const pagination: PaginationOnly = { page: 1, pageSize: 10 };
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
                participation: {
                  id: 10,
                  group: { id: 1, name: 'Group A' },
                },
              },
            },
          ],
        },
      ];

      matchesRepository.getResultsForGroup.mockResolvedValue(
        expectedResults as any,
      );

      // Act
      const result = await service.getResultsForGroup(groupId, pagination);

      // Assert
      expect(matchesRepository.getResultsForGroupIds).toHaveBeenCalledWith(
        [groupId],
        pagination,
      );
      expect(result).toEqual(expectedResults);
    });
  });
});
