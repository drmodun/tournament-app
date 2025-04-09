import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from '../matches.controller';
import { MatchesService } from '../matches.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CanEditMatchupGuard } from '../guards/can-edit-matchup.guard';
import { EndMatchupRequestDto, QueryMatchupRequestDto } from '../dto/requests';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { userRoleEnum, userRoleEnumType } from '@tournament-app/types';
describe('MatchesController', () => {
  let controller: MatchesController;
  let service: jest.Mocked<MatchesService>;

  const mockMatchup = {
    id: 1,
    stageId: 1,
    round: 1,
    isFinished: false,
    results: [],
    scores: [],
  };

  const mockMatchupWithResults = {
    ...mockMatchup,
    results: [
      { rosterId: 1, isWinner: true },
      { rosterId: 2, isWinner: false },
    ],
  };

  const mockMatchupWithResultsAndScores = {
    ...mockMatchupWithResults,
    scores: [
      {
        roundNumber: 1,
        scores: [
          { rosterId: 1, points: 3, isWinner: true },
          { rosterId: 2, points: 1, isWinner: false },
        ],
      },
    ],
  };

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

      service.createMatchScore.mockResolvedValue(
        mockMatchupWithResultsAndScores as any,
      );

      const result = await controller.createScore(matchupId, createScoreDto);

      expect(result).toEqual(mockMatchupWithResultsAndScores);
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

      const updatedMatchup = {
        ...mockMatchupWithResultsAndScores,
        scores: [
          {
            roundNumber: 1,
            scores: [
              { rosterId: 1, points: 5, isWinner: true },
              { rosterId: 2, points: 2, isWinner: false },
            ],
          },
        ],
      };

      service.updateMatchScore.mockResolvedValue(updatedMatchup as any);

      const result = await controller.updateScore(matchupId, updateScoreDto);

      expect(result).toEqual(updatedMatchup);
      expect(service.updateMatchScore).toHaveBeenCalledWith(
        matchupId,
        updateScoreDto,
      );
    });
  });

  describe('deleteMatchScore', () => {
    it('should delete a score for a matchup', async () => {
      const matchupId = 1;

      service.deleteMatchScore.mockResolvedValue({ success: true } as any);

      const result = await controller.deleteMatchScore(matchupId);

      expect(result).toEqual(mockMatchup);
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

      expect(result).toEqual([mockMatchupWithResults]);
      expect(service.getMatchupsWithResults).toHaveBeenCalledWith(query);
    });
  });

  describe('getMatchupWithResultsAndScores', () => {
    it('should return a matchup with results and scores', async () => {
      const matchupId = 1;

      service.getMatchupWithResultsAndScores.mockResolvedValue(
        mockMatchupWithResultsAndScores as any,
      );

      const result = await controller.getMatchupWithResultsAndScores(matchupId);

      expect(result).toEqual(mockMatchupWithResultsAndScores);
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

      expect(result).toEqual([mockMatchupWithResults]);
      expect(service.getResultsForUser).toHaveBeenCalledWith(userId, query);
    });
  });

  describe('getResultsForRoster', () => {
    it('should return results for a roster', async () => {
      const rosterId = 1;
      const query: PaginationOnly = { page: 1, pageSize: 10 };

      service.getResultsForRoster.mockResolvedValue([mockMatchupWithResults]);

      const result = await controller.getResultsForRoster(rosterId, query);

      expect(result).toEqual([mockMatchupWithResults]);
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

      service.getManagedMatchups.mockResolvedValue([
        mockMatchupWithResults as any,
      ]);

      const result = await controller.getManagedMatchups(user, query);

      expect(result).toEqual([mockMatchupWithResults]);
      expect(service.getManagedMatchups).toHaveBeenCalledWith(user.id, query);
    });
  });

  describe('getResultsForGroup', () => {
    it('should return results for a group', async () => {
      const groupId = 1;
      const query: PaginationOnly = { page: 1, pageSize: 10 };

      service.getResultsForGroup.mockResolvedValue([mockMatchupWithResults]);

      const result = await controller.getResultsForGroup(groupId, query);

      expect(result).toEqual([mockMatchupWithResults]);
      expect(service.getResultsForGroup).toHaveBeenCalledWith(groupId, query);
    });
  });
});
