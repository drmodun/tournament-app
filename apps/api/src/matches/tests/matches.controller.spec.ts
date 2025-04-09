import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from '../matches.controller';
import { MatchesService } from '../matches.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CanEditMatchupGuard } from '../guards/can-edit-matchup.guard';
import { EndMatchupRequestDto, QueryMatchupRequestDto } from '../dto/requests';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { userRoleEnum } from '@tournament-app/types';

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: jest.Mocked<MatchesService>;

  const mockMatchup = {
    id: 1,
    stageId: 1,
    round: 1,
    isFinished: false,
    matchupType: 'standard',
    startDate: new Date(),
    results: [],
    challongeMatchupId: null,
  };

  const mockMatchupWithResults = {
    ...mockMatchup,
    rosters: [
      {
        id: 1,
        name: 'Team 1',
        stageId: 1,
        participationId: 1,
        createdAt: new Date(),
        players: [],
      },
      {
        id: 2,
        name: 'Team 2',
        stageId: 1,
        participationId: 2,
        createdAt: new Date(),
        players: [],
      },
    ],
    results: [
      {
        id: 1,
        matchupId: 1,
        score: 3,
        isWinner: true,
        scores: [],
        roster: {
          id: 1,
          stageId: 1,
          participation: {
            id: 1,
            group: { id: 1, name: 'Group A' },
          },
        },
      },
      {
        id: 2,
        matchupId: 1,
        score: 1,
        isWinner: false,
        scores: [],
        roster: {
          id: 2,
          stageId: 1,
          participation: {
            id: 2,
            group: { id: 1, name: 'Group A' },
          },
        },
      },
    ],
  };

  const mockScoreResponse = [
    {
      id: 1,
      matchupId: 1,
      roundNumber: 1,
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const mockService = {
      createMatchScore: jest.fn(),
      updateMatchScore: jest.fn(),
      deleteMatchScore: jest.fn(),
      getMatchupsWithResults: jest.fn(),
      getMatchupWithResultsAndScores: jest.fn(),
      getResultsForUser: jest.fn(),
      getResultsForRoster: jest.fn(),
      getManagedMatchups: jest.fn(),
      getResultsForGroup: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        {
          provide: MatchesService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(CanEditMatchupGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get(MatchesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createScore', () => {
    it('should create a score for a matchup', async () => {
      const matchupId = 1;
      const createScoreDto: EndMatchupRequestDto = {
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

      service.createMatchScore.mockResolvedValue(mockScoreResponse);

      const result = await controller.createScore(matchupId, createScoreDto);

      expect(result).toMatchObject(mockScoreResponse);
      expect(service.createMatchScore).toHaveBeenCalledWith(
        matchupId,
        createScoreDto,
      );
    });
  });

  describe('updateScore', () => {
    it('should update a score for a matchup', async () => {
      const matchupId = 1;
      const updateScoreDto: EndMatchupRequestDto = {
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

      service.updateMatchScore.mockResolvedValue(mockScoreResponse);

      const result = await controller.updateScore(matchupId, updateScoreDto);

      expect(result).toMatchObject(mockScoreResponse);
      expect(service.updateMatchScore).toHaveBeenCalledWith(
        matchupId,
        updateScoreDto,
      );
    });
  });

  describe('deleteMatchScore', () => {
    it('should delete a score for a matchup', async () => {
      const matchupId = 1;

      service.deleteMatchScore.mockResolvedValue({ success: true });

      const result = await controller.deleteMatchScore(matchupId);

      expect(result).toMatchObject({ success: true });
      expect(service.deleteMatchScore).toHaveBeenCalledWith(matchupId);
    });
  });

  describe('getMatchupsWithResults', () => {
    it('should return matchups with results', async () => {
      const query: QueryMatchupRequestDto = { stageId: 1 };

      service.getMatchupsWithResults.mockResolvedValue([
        mockMatchupWithResults,
      ]);

      const result = await controller.getMatchupsWithResults(query);

      expect(result).toMatchObject([mockMatchupWithResults]);
      expect(service.getMatchupsWithResults).toHaveBeenCalledWith(query);
    });
  });

  describe('getMatchupWithResultsAndScores', () => {
    it('should return a matchup with results and scores', async () => {
      const matchupId = 1;

      service.getMatchupWithResultsAndScores.mockResolvedValue(
        mockMatchupWithResults,
      );

      const result = await controller.getMatchupWithResultsAndScores(matchupId);

      expect(result).toMatchObject(mockMatchupWithResults);
      expect(service.getMatchupWithResultsAndScores).toHaveBeenCalledWith(
        matchupId,
      );
    });
  });

  describe('getResultsForUser', () => {
    it('should return results for a user', async () => {
      const userId = 1;
      const query: PaginationOnly = { page: 1, pageSize: 10 };

      service.getResultsForUser.mockResolvedValue([mockMatchupWithResults]);

      const result = await controller.getResultsForUser(userId, query);

      expect(result).toMatchObject([mockMatchupWithResults]);
      expect(service.getResultsForUser).toHaveBeenCalledWith(userId, query);
    });
  });

  describe('getResultsForRoster', () => {
    it('should return results for a roster', async () => {
      const rosterId = 1;
      const query: PaginationOnly = { page: 1, pageSize: 10 };

      service.getResultsForRoster.mockResolvedValue([mockMatchupWithResults]);

      const result = await controller.getResultsForRoster(rosterId, query);

      expect(result).toMatchObject([mockMatchupWithResults]);
      expect(service.getResultsForRoster).toHaveBeenCalledWith(rosterId, query);
    });
  });

  describe('getManagedMatchups', () => {
    it('should return matchups managed by the user', async () => {
      const user: ValidatedUserDto = {
        id: 1,
        email: 'test@example.com',
        role: userRoleEnum.USER,
      };
      const query: QueryMatchupRequestDto = { stageId: 1 };

      service.getManagedMatchups.mockResolvedValue([mockMatchupWithResults]);

      const result = await controller.getManagedMatchups(user, query);

      expect(result).toMatchObject([mockMatchupWithResults]);
      expect(service.getManagedMatchups).toHaveBeenCalledWith(user.id, query);
    });
  });

  describe('getResultsForGroup', () => {
    it('should return results for a group', async () => {
      const groupId = 1;
      const query: PaginationOnly = { page: 1, pageSize: 10 };

      // Create a valid mock result that matches the expected structure
      const mockResults = [
        {
          id: 1,
          stageId: 5,
          round: 1,
          isFinished: true,
          matchupType: 'standard',
          startDate: new Date(),
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

      service.getResultsForGroup.mockResolvedValue(mockResults);

      const result = await controller.getResultsForGroup(groupId, query);

      expect(result).toMatchObject(mockResults);
      expect(service.getResultsForGroup).toHaveBeenCalledWith(groupId, query);
    });
  });
});
