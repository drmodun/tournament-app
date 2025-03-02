import {
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CanCreateRosterGuard } from '../../guards/can-create-roster.guard';
import { StageService } from 'src/stage/stage.service';
import { RosterService } from '../../roster.service';
import { RosterResponsesEnum } from '@tournament-app/types';

describe('CanCreateRosterGuard', () => {
  let guard: CanCreateRosterGuard;
  let stageService: jest.Mocked<StageService>;
  let rosterService: jest.Mocked<RosterService>;

  const createMockExecutionContext = (
    participationId?: number,
    stageId?: number,
    members?: any[],
    stage?: any,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          params: { participationId, stageId },
          body: { members },
          stage: stage || {
            id: stageId,
            tournamentId: 1,
          },
        }),
      }),
    }) as ExecutionContext;

  beforeEach(async () => {
    const mockStageService: jest.Mocked<Partial<StageService>> = {
      isFirstStage: jest.fn(),
    };
    const mockRosterService = {
      findAll: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanCreateRosterGuard,
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

    guard = module.get<CanCreateRosterGuard>(CanCreateRosterGuard);
    stageService = module.get(StageService);
    rosterService = module.get(RosterService) as jest.Mocked<RosterService>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should throw BadRequestException if stageId is missing', async () => {
      const context = createMockExecutionContext(1, undefined, [
        { userId: 1, isSubstitute: false },
      ]);
      rosterService.findAll.mockResolvedValue([]);

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      expect(rosterService.findAll).toHaveBeenCalled();
    });

    it('should throw BadRequestException if participationId is missing', async () => {
      const context = createMockExecutionContext(undefined, 1, [
        { userId: 1, isSubstitute: false },
      ]);

      rosterService.findAll.mockResolvedValue([]);

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      expect(rosterService.findAll).toHaveBeenCalled();
    });

    it('should throw BadRequestException if members are missing', async () => {
      const context = createMockExecutionContext(1, 1, undefined);
      rosterService.findAll.mockResolvedValue([]);

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      expect(rosterService.findAll).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if roster already exists', async () => {
      const context = createMockExecutionContext(1, 1, [
        { userId: 1, isSubstitute: false },
      ]);

      const mockRosterWithPlayers = {
        id: 1,
        players: [{ id: 1, userId: 1, isSubstitute: false }],
        createdAt: new Date(),
        stageId: 1,
        participationId: 1,
      };

      rosterService.findAll.mockResolvedValue([mockRosterWithPlayers]);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      expect(rosterService.findAll).toHaveBeenCalledWith({
        participationId: 1,
        stageId: 1,
        responseType: RosterResponsesEnum.MINI,
      });
    });

    it('should throw ForbiddenException if stage is not the first stage', async () => {
      const context = createMockExecutionContext(1, 1, [
        { userId: 1, isSubstitute: false },
      ]);
      rosterService.findAll.mockResolvedValue([]);
      stageService.isFirstStage.mockResolvedValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      expect(stageService.isFirstStage).toHaveBeenCalledWith(1, 1);
    });

    it('should return true if all conditions are met', async () => {
      const context = createMockExecutionContext(1, 1, [
        { userId: 1, isSubstitute: false },
      ]);
      rosterService.findAll.mockResolvedValue([]);
      stageService.isFirstStage.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(rosterService.findAll).toHaveBeenCalledWith({
        participationId: 1,
        stageId: 1,
        responseType: RosterResponsesEnum.MINI,
      });
      expect(stageService.isFirstStage).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('checkIfRosterAlreadyExists', () => {
    it('should throw ForbiddenException if roster already exists', async () => {
      const mockRosterWithPlayers = {
        id: 1,
        players: [{ id: 1, userId: 1, isSubstitute: false }],
        createdAt: new Date(),
        stageId: 1,
        participationId: 1,
      };

      rosterService.findAll.mockResolvedValue([mockRosterWithPlayers]);

      await expect(guard.checkIfRosterAlreadyExists(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
      expect(rosterService.findAll).toHaveBeenCalledWith({
        participationId: 1,
        stageId: 1,
        responseType: RosterResponsesEnum.MINI,
      });
    });

    it('should not throw if roster does not exist', async () => {
      rosterService.findAll.mockResolvedValue([]);

      await expect(
        guard.checkIfRosterAlreadyExists(1, 1),
      ).resolves.not.toThrow();
      expect(rosterService.findAll).toHaveBeenCalledWith({
        participationId: 1,
        stageId: 1,
        responseType: RosterResponsesEnum.MINI,
      });
    });
  });
});
