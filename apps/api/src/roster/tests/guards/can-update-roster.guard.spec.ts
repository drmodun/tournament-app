import {
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CanUpdateRosterGuard } from '../../guards/can-update-roster.guard';
import { StageService } from 'src/stage/stage.service';
import { RosterService } from '../../roster.service';
import { ICreateRosterMemberRequest } from '@tournament-app/types';

describe('CanUpdateRosterGuard', () => {
  let guard: CanUpdateRosterGuard;
  let stageService: jest.Mocked<StageService>;
  let rosterService: jest.Mocked<RosterService>;

  const createMockExecutionContext = (
    rosterId?: number,
    stageId?: number,
    members: ICreateRosterMemberRequest[] = [],
    stage?: any,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          params: { rosterId, stageId },
          body: { members, rosterId, stageId },
          stage: stage || {
            id: stageId,
            tournamentId: 1,
            maxChanges: 3,
          },
        }),
      }),
    }) as ExecutionContext;

  beforeEach(async () => {
    const mockStageService = {
      getStagesSortedByStartDate: jest.fn(),
    };

    const mockRosterService = {
      getChangeAmount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanUpdateRosterGuard,
        {
          provide: StageService,
          useValue: mockStageService,
        },
        {
          provide: RosterService,
          useValue: mockRosterService,
        },
      ],
    }).compile();

    guard = module.get<CanUpdateRosterGuard>(CanUpdateRosterGuard);
    stageService = module.get(StageService) as jest.Mocked<StageService>;
    rosterService = module.get(RosterService) as jest.Mocked<RosterService>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw BadRequestException if stageId is missing', async () => {
      const context = createMockExecutionContext(1, undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      expect(stageService.getStagesSortedByStartDate).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if rosterId is missing', async () => {
      const context = createMockExecutionContext(undefined, 1);

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      expect(stageService.getStagesSortedByStartDate).not.toHaveBeenCalled();
    });

    it('should return false if current stage is the first stage', async () => {
      const members = [{ userId: 1, isSubstitute: false }];
      const context = createMockExecutionContext(1, 1, members);

      stageService.getStagesSortedByStartDate.mockResolvedValue([
        { id: 1, startDate: new Date() },
        { id: 2, startDate: new Date() },
      ]);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(stageService.getStagesSortedByStartDate).toHaveBeenCalledWith(1);
      expect(rosterService.getChangeAmount).not.toHaveBeenCalled();
    });

    it('should return true if current stage is not the first stage and changes are within limit', async () => {
      const members = [
        { userId: 1, isSubstitute: false },
        { userId: 2, isSubstitute: true },
      ];
      const context = createMockExecutionContext(1, 2, members, {
        id: 2,
        tournamentId: 1,
        maxChanges: 3,
      });

      stageService.getStagesSortedByStartDate.mockResolvedValue([
        { id: 1, startDate: new Date() },
        { id: 2, startDate: new Date() },
      ]);

      rosterService.getChangeAmount.mockResolvedValue(2);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(stageService.getStagesSortedByStartDate).toHaveBeenCalledWith(1);
      expect(rosterService.getChangeAmount).toHaveBeenCalledWith(1, [1, 2]);
    });

    it('should return false if changes exceed the limit', async () => {
      const members = [
        { userId: 1, isSubstitute: false },
        { userId: 2, isSubstitute: false },
        { userId: 3, isSubstitute: true },
        { userId: 4, isSubstitute: true },
      ];
      const context = createMockExecutionContext(1, 2, members, {
        id: 2,
        tournamentId: 1,
        maxChanges: 2,
      });

      stageService.getStagesSortedByStartDate.mockResolvedValue([
        { id: 1, startDate: new Date() },
        { id: 2, startDate: new Date() },
      ]);

      rosterService.getChangeAmount.mockResolvedValue(4);

      const result = await guard.canActivate(context);

      expect(result).toBe(false);
      expect(stageService.getStagesSortedByStartDate).toHaveBeenCalledWith(1);
      expect(rosterService.getChangeAmount).toHaveBeenCalledWith(
        1,
        [1, 2, 3, 4],
      );
    });
  });
});
