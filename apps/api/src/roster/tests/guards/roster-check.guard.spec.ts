import {
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CanRosterBeUsedGuard } from '../../guards/roster-check.guard';
import { ParticipationService } from 'src/participation/participation.service';
import { RosterService } from '../../roster.service';
import { StageService } from 'src/stage/stage.service';
import { GroupMembershipService } from 'src/group-membership/group-membership.service';
import {
  tournamentTeamTypeEnum,
  userRoleEnum,
  StageResponsesEnum,
  ICreateRosterMemberRequest,
  stageTypeEnum,
  tournamentTypeEnum,
  stageStatusEnum,
} from '@tournament-app/types';

describe('CanRosterBeUsedGuard', () => {
  let guard: CanRosterBeUsedGuard;
  let participationService: jest.Mocked<ParticipationService>;
  let rosterService: jest.Mocked<RosterService>;
  let stageService: jest.Mocked<StageService>;
  let groupMembershipService: jest.Mocked<GroupMembershipService>;

  const createMockExecutionContext = (
    rosterId?: number,
    participationId?: number,
    stageId?: number,
    members: ICreateRosterMemberRequest[] = [],
    stage?: any,
    user?: any,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          params: { rosterId, participationId, stageId },
          body: {
            members,
            rosterId,
            participationId,
            stageId,
          },
          query: {},
          stage: stage || {
            id: stageId,
            tournamentId: 1,
            tournamentType: tournamentTeamTypeEnum.TEAM,
          },
          user: user || {
            id: 1,
            role: userRoleEnum.USER,
          },
        }),
      }),
    }) as ExecutionContext;

  beforeEach(async () => {
    const mockParticipationService = {
      findOne: jest.fn(),
    };

    const mockRosterService = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      isAnyMemberInAnotherRoster: jest.fn(),
      isEachMemberTournamentEligible: jest.fn(),
    };

    const mockStageService = {
      findOne: jest.fn(),
    };

    const mockGroupMembershipService = {
      isAdmin: jest.fn(),
      isMember: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanRosterBeUsedGuard,
        {
          provide: ParticipationService,
          useValue: mockParticipationService,
        },
        {
          provide: RosterService,
          useValue: mockRosterService,
        },
        {
          provide: StageService,
          useValue: mockStageService,
        },
        {
          provide: GroupMembershipService,
          useValue: mockGroupMembershipService,
        },
      ],
    }).compile();

    guard = module.get<CanRosterBeUsedGuard>(CanRosterBeUsedGuard);
    participationService = module.get(
      ParticipationService,
    ) as jest.Mocked<ParticipationService>;
    rosterService = module.get(RosterService) as jest.Mocked<RosterService>;
    stageService = module.get(StageService) as jest.Mocked<StageService>;
    groupMembershipService = module.get(
      GroupMembershipService,
    ) as jest.Mocked<GroupMembershipService>;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for admin user regardless of other conditions', async () => {
      const context = createMockExecutionContext(
        1,
        1,
        1,
        [{ userId: 1, isSubstitute: false }],
        undefined,
        { id: 1, role: userRoleEnum.ADMIN },
      );

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      // No service methods should be called for admin users
      expect(rosterService.findOne).not.toHaveBeenCalled();
      expect(participationService.findOne).not.toHaveBeenCalled();
      expect(stageService.findOne).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if rosterId is provided but roster not found', async () => {
      const context = createMockExecutionContext(1, undefined, undefined, [
        { userId: 1, isSubstitute: false },
      ]);
      rosterService.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      expect(rosterService.findOne).toHaveBeenCalledWith(1);
    });

    it('should use roster participationId and stageId if rosterId is provided', async () => {
      const context = createMockExecutionContext(1, undefined, undefined, [
        { userId: 1, isSubstitute: false },
      ]);

      rosterService.findOne.mockResolvedValue({
        id: 1,
        participationId: 2,
        stageId: 3,
        players: [],
      });

      participationService.findOne.mockResolvedValue({
        id: 2,
        tournamentId: 1,
        userId: 1,
      });

      stageService.findOne.mockResolvedValue({
        id: 3,
        tournamentId: 1,
        tournament: {
          category: {
            id: 1,
            name: 'Test Category',
            logo: 'https://test.com/logo.png',
          },
          id: 1,
          name: 'Test Tournament',
          description: 'Test Description',
          teamType: tournamentTeamTypeEnum.TEAM,
          creator: {
            id: 1,
            username: 'Test Creator',
            isFake: false,
          },
          maxParticipants: 10,
          currentParticipants: 0,
          isPublic: true,
          endDate: new Date(),
          startDate: new Date(),
          links: '',
          logo: 'https://test.com/logo.png',
          country: 'Test Country',
          type: tournamentTypeEnum.COMPETITION,
        },
        minPlayersPerTeam: 1,
        stageType: stageTypeEnum.GROUP,
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(),
        name: 'Test Stage',
        stageStatus: stageStatusEnum.FINISHED,
      });

      rosterService.isAnyMemberInAnotherRoster.mockResolvedValue(false);
      rosterService.isEachMemberTournamentEligible.mockResolvedValue(true);

      await guard.canActivate(context);

      expect(participationService.findOne).toHaveBeenCalledWith(2);
      expect(stageService.findOne).toHaveBeenCalledWith(
        3,
        StageResponsesEnum.EXTENDED,
      );
    });

    it('should throw BadRequestException if participationId and stageId are missing', async () => {
      const context = createMockExecutionContext(
        undefined,
        undefined,
        undefined,
        [{ userId: 1, isSubstitute: false }],
      );

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if members are missing or empty', async () => {
      const context = createMockExecutionContext(undefined, 1, 1, []);

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException if participation does not exist', async () => {
      const context = createMockExecutionContext(undefined, 1, 1, [
        { userId: 1, isSubstitute: false },
      ]);

      participationService.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      expect(participationService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw ForbiddenException if stage does not exist', async () => {
      const context = createMockExecutionContext(undefined, 1, 1, [
        { userId: 1, isSubstitute: false },
      ]);

      participationService.findOne.mockResolvedValue({
        id: 1,
        tournamentId: 1,
        userId: 1,
      });

      stageService.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      expect(stageService.findOne).toHaveBeenCalledWith(
        1,
        StageResponsesEnum.EXTENDED,
      );
    });

    it('should throw ForbiddenException if stage tournamentId does not match participation tournamentId', async () => {
      const context = createMockExecutionContext(undefined, 1, 1, [
        { userId: 1, isSubstitute: false },
      ]);

      participationService.findOne.mockResolvedValue({
        id: 1,
        tournamentId: 1,
        userId: 1,
      });

      stageService.findOne.mockResolvedValue({
        id: 3,
        tournamentId: 2,
        tournament: {
          category: {
            id: 1,
            name: 'Test Category',
            logo: 'https://test.com/logo.png',
          },
          id: 2,
          name: 'Test Tournament',
          description: 'Test Description',
          teamType: tournamentTeamTypeEnum.TEAM,
          creator: {
            id: 1,
            username: 'Test Creator',
            isFake: false,
          },
          maxParticipants: 10,
          currentParticipants: 0,
          isPublic: true,
          endDate: new Date(),
          startDate: new Date(),
          links: '',
          logo: 'https://test.com/logo.png',
          country: 'Test Country',
          type: tournamentTypeEnum.COMPETITION,
        },
        minPlayersPerTeam: 1,
        stageType: stageTypeEnum.GROUP,
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(),
        name: 'Test Stage',
        stageStatus: stageStatusEnum.FINISHED,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should validate solo participation (user is the only member)', async () => {
      const context = createMockExecutionContext(undefined, 1, 1, [
        { userId: 1, isSubstitute: false },
      ]);

      participationService.findOne.mockResolvedValue({
        id: 1,
        tournamentId: 1,
        userId: 1, // Same as the user ID in the member
      });

      stageService.findOne.mockResolvedValue({
        id: 3,
        tournamentId: 1,
        tournament: {
          category: {
            id: 1,
            name: 'Test Category',
            logo: 'https://test.com/logo.png',
          },
          id: 1,
          name: 'Test Tournament',
          description: 'Test Description',
          teamType: tournamentTeamTypeEnum.TEAM,
          creator: {
            id: 1,
            username: 'Test Creator',
            isFake: false,
          },
          maxParticipants: 10,
          currentParticipants: 0,
          isPublic: true,
          endDate: new Date(),
          startDate: new Date(),
          links: '',
          logo: 'https://test.com/logo.png',
          country: 'Test Country',
          type: tournamentTypeEnum.COMPETITION,
        },
        minPlayersPerTeam: 1,
        stageType: stageTypeEnum.GROUP,
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(),
        name: 'Test Stage',
        stageStatus: stageStatusEnum.FINISHED,
      });

      rosterService.isAnyMemberInAnotherRoster.mockResolvedValue(false);
      rosterService.isEachMemberTournamentEligible.mockResolvedValue(true);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException for solo participation with different user', async () => {
      const context = createMockExecutionContext(
        undefined,
        1,
        1,
        [{ userId: 2, isSubstitute: false }], // Different user ID
      );

      participationService.findOne.mockResolvedValue({
        id: 1,
        tournamentId: 1,
        userId: 1,
      });

      stageService.findOne.mockResolvedValue({
        id: 3,
        tournamentId: 1,
        tournament: {
          category: {
            id: 1,
            name: 'Test Category',
            logo: 'https://test.com/logo.png',
          },
          id: 1,
          name: 'Test Tournament',
          description: 'Test Description',
          teamType: tournamentTeamTypeEnum.TEAM,
          creator: {
            id: 1,
            username: 'Test Creator',
            isFake: false,
          },
          maxParticipants: 10,
          currentParticipants: 0,
          isPublic: true,
          endDate: new Date(),
          startDate: new Date(),
          links: '',
          logo: 'https://test.com/logo.png',
          country: 'Test Country',
          type: tournamentTypeEnum.COMPETITION,
        },
        minPlayersPerTeam: 1,
        stageType: stageTypeEnum.GROUP,
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(),
        name: 'Test Stage',
        stageStatus: stageStatusEnum.FINISHED,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should validate team participation (user is admin and all members are in group)', async () => {
      const members = [
        { userId: 1, isSubstitute: false },
        { userId: 2, isSubstitute: false },
      ];

      const context = createMockExecutionContext(undefined, 1, 1, members);

      participationService.findOne.mockResolvedValue({
        id: 1,
        tournamentId: 1,
        groupId: 1,
      });

      stageService.findOne.mockResolvedValue({
        id: 3,
        tournamentId: 1,
        tournament: {
          category: {
            id: 1,
            name: 'Test Category',
            logo: 'https://test.com/logo.png',
          },
          id: 1,
          name: 'Test Tournament',
          description: 'Test Description',
          teamType: tournamentTeamTypeEnum.TEAM,
          creator: {
            id: 1,
            username: 'Test Creator',
            isFake: false,
          },
          maxParticipants: 10,
          currentParticipants: 0,
          isPublic: true,
          endDate: new Date(),
          startDate: new Date(),
          links: '',
          logo: 'https://test.com/logo.png',
          country: 'Test Country',
          type: tournamentTypeEnum.COMPETITION,
        },
        minPlayersPerTeam: 1,
        stageType: stageTypeEnum.GROUP,
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(),
        name: 'Test Stage',
        stageStatus: stageStatusEnum.FINISHED,
      });

      groupMembershipService.isAdmin.mockResolvedValue(true);
      groupMembershipService.isMember.mockResolvedValue(true);
      rosterService.isAnyMemberInAnotherRoster.mockResolvedValue(false);
      rosterService.isEachMemberTournamentEligible.mockResolvedValue(true);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(groupMembershipService.isAdmin).toHaveBeenCalledWith(1, 1);
      expect(groupMembershipService.isMember).toHaveBeenCalledTimes(2);
    });

    it('should throw ForbiddenException if user is not admin of the group', async () => {
      const context = createMockExecutionContext(undefined, 1, 1, [
        { userId: 1, isSubstitute: false },
      ]);

      participationService.findOne.mockResolvedValue({
        id: 1,
        tournamentId: 1,
        groupId: 1,
      });

      stageService.findOne.mockResolvedValue({
        id: 3,
        tournamentId: 1,
        tournament: {
          category: {
            id: 1,
            name: 'Test Category',
            logo: 'https://test.com/logo.png',
          },
          id: 1,
          name: 'Test Tournament',
          description: 'Test Description',
          teamType: tournamentTeamTypeEnum.TEAM,
          creator: {
            id: 1,
            username: 'Test Creator',
            isFake: false,
          },
          maxParticipants: 10,
          currentParticipants: 0,
          isPublic: true,
          endDate: new Date(),
          startDate: new Date(),
          links: '',
          logo: 'https://test.com/logo.png',
          country: 'Test Country',
          type: tournamentTypeEnum.COMPETITION,
        },
        minPlayersPerTeam: 1,
        stageType: stageTypeEnum.GROUP,
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(),
        name: 'Test Stage',
        stageStatus: stageStatusEnum.FINISHED,
      });

      groupMembershipService.isAdmin.mockResolvedValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      expect(groupMembershipService.isAdmin).toHaveBeenCalledWith(1, 1);
    });

    it('should throw ForbiddenException if any member is not in the group', async () => {
      const members = [
        { userId: 1, isSubstitute: false },
        { userId: 2, isSubstitute: false },
      ];

      const context = createMockExecutionContext(undefined, 1, 1, members);

      participationService.findOne.mockResolvedValue({
        id: 1,
        tournamentId: 1,
        groupId: 1,
      });

      stageService.findOne.mockResolvedValue({
        id: 3,
        tournamentId: 1,
        tournament: {
          category: {
            id: 1,
            name: 'Test Category',
            logo: 'https://test.com/logo.png',
          },
          id: 1,
          name: 'Test Tournament',
          description: 'Test Description',
          teamType: tournamentTeamTypeEnum.TEAM,
          creator: {
            id: 1,
            username: 'Test Creator',
            isFake: false,
          },
          maxParticipants: 10,
          currentParticipants: 0,
          isPublic: true,
          endDate: new Date(),
          startDate: new Date(),
          links: '',
          logo: 'https://test.com/logo.png',
          country: 'Test Country',
          type: tournamentTypeEnum.COMPETITION,
        },
        minPlayersPerTeam: 1,
        stageType: stageTypeEnum.GROUP,
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(),
        name: 'Test Stage',
        stageStatus: stageStatusEnum.FINISHED,
      });

      groupMembershipService.isAdmin.mockResolvedValue(true);
      // First call returns true, second call returns false
      groupMembershipService.isMember
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      expect(groupMembershipService.isMember).toHaveBeenCalledTimes(2);
    });

    it('should throw ForbiddenException if any member is already in another roster', async () => {
      const context = createMockExecutionContext(undefined, 1, 1, [
        { userId: 1, isSubstitute: false },
      ]);

      participationService.findOne.mockResolvedValue({
        id: 1,
        tournamentId: 1,
        userId: 1,
      });

      stageService.findOne.mockResolvedValue({
        id: 3,
        tournamentId: 1,
        tournament: {
          category: {
            id: 1,
            name: 'Test Category',
            logo: 'https://test.com/logo.png',
          },
          id: 1,
          name: 'Test Tournament',
          description: 'Test Description',
          teamType: tournamentTeamTypeEnum.TEAM,
          creator: {
            id: 1,
            username: 'Test Creator',
            isFake: false,
          },
          maxParticipants: 10,
          currentParticipants: 0,
          isPublic: true,
          endDate: new Date(),
          startDate: new Date(),
          links: '',
          logo: 'https://test.com/logo.png',
          country: 'Test Country',
          type: tournamentTypeEnum.COMPETITION,
        },
        minPlayersPerTeam: 1,
        stageType: stageTypeEnum.GROUP,
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(),
        name: 'Test Stage',
        stageStatus: stageStatusEnum.FINISHED,
      });

      rosterService.isAnyMemberInAnotherRoster.mockResolvedValue(true);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      expect(rosterService.isAnyMemberInAnotherRoster).toHaveBeenCalledWith(
        [1],
        1,
        null,
      );
    });

    it('should throw ForbiddenException if any member is not tournament eligible', async () => {
      const context = createMockExecutionContext(undefined, 1, 1, [
        { userId: 1, isSubstitute: false },
      ]);

      participationService.findOne.mockResolvedValue({
        id: 1,
        tournamentId: 1,
        userId: 1,
      });

      stageService.findOne.mockResolvedValue({
        id: 3,
        tournamentId: 1,
        tournament: {
          category: {
            id: 1,
            name: 'Test Category',
            logo: 'https://test.com/logo.png',
          },
          id: 1,
          name: 'Test Tournament',
          description: 'Test Description',
          teamType: tournamentTeamTypeEnum.TEAM,
          creator: {
            id: 1,
            username: 'Test Creator',
            isFake: false,
          },
          maxParticipants: 10,
          currentParticipants: 0,
          isPublic: true,
          endDate: new Date(),
          startDate: new Date(),
          links: '',
          logo: 'https://test.com/logo.png',
          country: 'Test Country',
          type: tournamentTypeEnum.COMPETITION,
        },
        minPlayersPerTeam: 1,
        stageType: stageTypeEnum.GROUP,
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(),
        name: 'Test Stage',
        stageStatus: stageStatusEnum.FINISHED,
      });

      rosterService.isAnyMemberInAnotherRoster.mockResolvedValue(false);
      rosterService.isEachMemberTournamentEligible.mockResolvedValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      expect(rosterService.isEachMemberTournamentEligible).toHaveBeenCalledWith(
        [1],
        expect.anything(),
      );
    });
  });
});
