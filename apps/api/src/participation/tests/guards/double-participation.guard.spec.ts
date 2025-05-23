import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DoubleParticipationGuard } from '../../guards/double-participation.guard';
import { ParticipationService } from '../../participation.service';
import { GroupMembershipService } from '../../../group-membership/group-membership.service';
import { tournamentTeamTypeEnum } from '^tournament-app/types';
import { TeamTypeExtractor } from 'src/base/static/teamTypeExtractor';

describe('DoubleParticipationGuard', () => {
  let guard: DoubleParticipationGuard;
  let participationService: jest.Mocked<ParticipationService>;
  const mockTournament = {
    id: 1,
    name: 'Test Tournament',
    teamType: tournamentTeamTypeEnum.SOLO,
  };

  const createMockExecutionContext = (
    userId: number,
    groupId?: number,
    originalUrl = '/tournaments/1/apply-solo',
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId },
          params: { groupId },
          tournament: mockTournament,
          originalUrl,
        }),
      }),
    }) as ExecutionContext;

  beforeEach(async () => {
    const mockParticipationService = {
      isParticipant: jest.fn(),
    };

    const mockGroupMembershipService = {
      findOne: jest.fn(),
    };

    // Mock the static method before each test
    jest.spyOn(TeamTypeExtractor, 'getTeamTypeFromUrl');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoubleParticipationGuard,
        {
          provide: ParticipationService,
          useValue: mockParticipationService,
        },
        {
          provide: GroupMembershipService,
          useValue: mockGroupMembershipService,
        },
      ],
    }).compile();

    guard = module.get<DoubleParticipationGuard>(DoubleParticipationGuard);
    participationService = module.get(ParticipationService);
  });

  describe('canActivate', () => {
    it('should allow participation when user has not participated before', async () => {
      const context = createMockExecutionContext(1);
      (TeamTypeExtractor.getTeamTypeFromUrl as jest.Mock).mockReturnValue(
        tournamentTeamTypeEnum.SOLO,
      );
      participationService.isParticipant.mockResolvedValue(false);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(participationService.isParticipant).toHaveBeenCalledWith(1, {
        userId: 1,
        groupId: undefined,
      });
    });

    it('should deny participation when user has already participated', async () => {
      const context = createMockExecutionContext(1);
      (TeamTypeExtractor.getTeamTypeFromUrl as jest.Mock).mockReturnValue(
        tournamentTeamTypeEnum.SOLO,
      );
      participationService.isParticipant.mockResolvedValue(true);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      expect(participationService.isParticipant).toHaveBeenCalledWith(1, {
        userId: 1,
        groupId: undefined,
      });
    });

    it('should allow group participation when group has not participated before', async () => {
      const context = createMockExecutionContext(
        1,
        1,
        '/tournaments/1/apply-group',
      );
      (TeamTypeExtractor.getTeamTypeFromUrl as jest.Mock).mockReturnValue(
        tournamentTeamTypeEnum.TEAM,
      );

      participationService.isParticipant.mockResolvedValue(false);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(participationService.isParticipant).toHaveBeenCalledWith(1, {
        userId: 1,
        groupId: 1,
      });
    });

    it('should deny group participation when group has already participated', async () => {
      const context = createMockExecutionContext(
        1,
        1,
        '/tournaments/1/apply-group',
      );
      (TeamTypeExtractor.getTeamTypeFromUrl as jest.Mock).mockReturnValue(
        tournamentTeamTypeEnum.TEAM,
      );
      participationService.isParticipant.mockResolvedValue(true);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      expect(participationService.isParticipant).toHaveBeenCalledWith(1, {
        userId: 1,
        groupId: 1,
      });
    });
  });
});
