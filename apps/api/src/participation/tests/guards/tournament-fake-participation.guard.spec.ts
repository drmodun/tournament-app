import {
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TournamentIsFakePlayersAllowedGuard } from '../../guards/tournament-fake-participation.guard';
import { TeamTypeExtractor } from 'src/base/static/teamTypeExtractor';
import { UsersService } from '../../../users/users.service';
import { GroupService } from '../../../group/group.service';
import { tournamentTeamTypeEnum, groupTypeEnum } from '^tournament-app/types';

describe('TournamentIsFakePlayersAllowedGuard', () => {
  let guard: TournamentIsFakePlayersAllowedGuard;
  let userService: jest.Mocked<UsersService>;
  let groupService: jest.Mocked<GroupService>;

  const createMockExecutionContext = (
    isFakePlayersAllowed: boolean,
    isRanked: boolean,
    userId?: number,
    groupId?: number,
    originalUrl = '/participations/apply-solo/1',
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          tournament: {
            id: 1,
            name: 'Test Tournament',
            isFakePlayersAllowed,
            isRanked,
          },
          params: {
            userId,
            groupId,
          },
          originalUrl,
        }),
      }),
    }) as ExecutionContext;

  beforeEach(async () => {
    // Mock the static method before each test
    jest.spyOn(TeamTypeExtractor, 'getTeamTypeFromUrl');

    const mockUserService = {
      findOne: jest.fn(),
      findOneIncludingFake: jest.fn(),
    };

    const mockGroupService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentIsFakePlayersAllowedGuard,
        {
          provide: UsersService,
          useValue: mockUserService,
        },
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
      ],
    }).compile();

    guard = module.get<TournamentIsFakePlayersAllowedGuard>(
      TournamentIsFakePlayersAllowedGuard,
    );

    userService = module.get(UsersService);
    groupService = module.get(GroupService);
  });

  describe('canActivate - Solo Player', () => {
    beforeEach(() => {
      (TeamTypeExtractor.getTeamTypeFromUrl as jest.Mock).mockReturnValue(
        tournamentTeamTypeEnum.SOLO,
      );
    });

    it('should allow real player participation', async () => {
      const context = createMockExecutionContext(false, false, 1);
      userService.findOneIncludingFake.mockResolvedValue({
        username: 'user',
        id: 1,
        isFake: false,
      });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should allow fake player in unranked tournament that allows fake players', async () => {
      const context = createMockExecutionContext(true, false, 1);
      userService.findOneIncludingFake.mockResolvedValue({
        username: 'user',
        id: 1,
        isFake: true,
      });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should deny fake player in tournament that does not allow fake players', async () => {
      const context = createMockExecutionContext(false, false, 1);
      userService.findOneIncludingFake.mockResolvedValue({
        username: 'user',
        id: 1,
        isFake: true,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'Fake players are not allowed to participate in this tournament',
        ),
      );
    });

    it('should deny fake player in ranked tournament', async () => {
      const context = createMockExecutionContext(true, true, 1);
      userService.findOneIncludingFake.mockResolvedValue({
        username: 'user',
        id: 1,
        isFake: true,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'Fake players are not allowed to participate in this tournament',
        ),
      );
    });

    it('should throw BadRequestException when userId is not provided', async () => {
      const context = createMockExecutionContext(true, false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new BadRequestException('User id is not provided'),
      );
    });
  });

  describe('canActivate - Team', () => {
    beforeEach(() => {
      (TeamTypeExtractor.getTeamTypeFromUrl as jest.Mock).mockReturnValue(
        tournamentTeamTypeEnum.TEAM,
      );
    });

    it('should allow real group participation', async () => {
      const context = createMockExecutionContext(
        false,
        false,
        undefined,
        1,
        '/participations/apply-group/1/1',
      );
      groupService.findOne.mockResolvedValue({
        id: 1,
        type: groupTypeEnum.PUBLIC,
      });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should allow fake group in unranked tournament that allows fake players', async () => {
      const context = createMockExecutionContext(
        true,
        false,
        undefined,
        1,
        '/participations/apply-group/1/1',
      );
      groupService.findOne.mockResolvedValue({
        id: 1,
        type: groupTypeEnum.FAKE,
      });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should deny fake group in tournament that does not allow fake players', async () => {
      const context = createMockExecutionContext(
        false,
        false,
        undefined,
        1,
        '/participations/apply-group/1/1',
      );
      groupService.findOne.mockResolvedValue({
        id: 1,
        type: groupTypeEnum.FAKE,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'Fake players are not allowed to participate in this tournament',
        ),
      );
    });

    it('should deny fake group in ranked tournament', async () => {
      const context = createMockExecutionContext(
        true,
        true,
        undefined,
        1,
        '/participations/apply-group/1/1',
      );

      groupService.findOne.mockResolvedValue({
        id: 1,
        type: groupTypeEnum.FAKE,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'Fake players are not allowed to participate in this tournament',
        ),
      );
    });

    it('should throw BadRequestException when groupId is not provided', async () => {
      const context = createMockExecutionContext(
        true,
        false,
        undefined,
        undefined,
        '/participations/apply-group/1',
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        new BadRequestException('Group id is not provided'),
      );
    });
  });
});
