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

const inOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
    it('should skip the checks for an admin user but still put the stage on the request', async () => {
      const request = {
        params: { participationId: 1, stageId: 7 },
        body: { members: [{ userId: 1, isSubstitute: false }] },
        query: {},
        user: { id: 1, role: userRoleEnum.ADMIN },
      } as any;
      const context = {
        switchToHttp: () => ({ getRequest: () => request }),
      } as ExecutionContext;
      const stage = { id: 7, tournamentId: 3 };
      stageService.findOne.mockResolvedValue(stage as any);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      // The guards after this one read the stage from the request
      expect(stageService.findOne).toHaveBeenCalledWith(
        7,
        StageResponsesEnum.EXTENDED,
      );
      expect(request.stage).toBe(stage);
      expect(participationService.findOne).not.toHaveBeenCalled();
    });

    it("should use the roster's own stage for an admin when a roster is given", async () => {
      const request = {
        params: { rosterId: 5 },
        body: { members: [] },
        query: {},
        user: { id: 1, role: userRoleEnum.ADMIN },
      } as any;
      const context = {
        switchToHttp: () => ({ getRequest: () => request }),
      } as ExecutionContext;
      rosterService.findOne.mockResolvedValue({ stageId: 9 } as any);
      stageService.findOne.mockResolvedValue({ id: 9 } as any);

      await guard.canActivate(context);

      expect(stageService.findOne).toHaveBeenCalledWith(
        9,
        StageResponsesEnum.EXTENDED,
      );
      expect(request.stage).toEqual({ id: 9 });
    });

    it('should refuse a player listed twice', async () => {
      const context = createMockExecutionContext(undefined, 1, 1, [
        { userId: 2, isSubstitute: false },
        { userId: 2, isSubstitute: true },
      ]);

      await expect(guard.canActivate(context)).rejects.toThrow(
        BadRequestException,
      );
      expect(participationService.findOne).not.toHaveBeenCalled();
    });

    it('should find the roster by the :id of PATCH /roster/:id and pass its stage and participation on', async () => {
      const request = {
        params: { id: '5' },
        body: { members: [{ userId: 1, isSubstitute: false }] },
        query: {},
        user: { id: 1, role: userRoleEnum.USER },
      } as any;
      const context = {
        switchToHttp: () => ({ getRequest: () => request }),
      } as ExecutionContext;
      rosterService.findOne.mockResolvedValue({
        participationId: 8,
        stageId: 9,
      } as any);
      participationService.findOne.mockResolvedValue(undefined as any);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );

      expect(rosterService.findOne).toHaveBeenCalledWith(5);
      expect(participationService.findOne).toHaveBeenCalledWith(8);
      expect(request.params).toMatchObject({ participationId: 8, stageId: 9 });
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
        startDate: inOneDay,
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
        startDate: inOneDay,
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
        startDate: inOneDay,
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
        startDate: inOneDay,
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
        startDate: inOneDay,
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
        startDate: inOneDay,
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
        startDate: inOneDay,
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
        startDate: inOneDay,
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
        startDate: inOneDay,
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

  describe('checkIfMembersAreEligibleForStage', () => {
    const baseStage = {
      id: 3,
      tournamentId: 1,
      startDate: inOneDay,
      minPlayersPerTeam: 2,
      maxPlayersPerTeam: 3,
      maxSubstitutes: 1,
    } as any;

    const membersOf = (count: number, substitutes = 0) =>
      Array.from({ length: count }, (_, i) => ({
        userId: i + 1,
        isSubstitute: i < substitutes,
      }));

    it('accepts a roster within the limits', () => {
      expect(() =>
        guard.checkIfMembersAreEligibleForStage(membersOf(3, 1), baseStage),
      ).not.toThrow();
    });

    it('rejects a roster for a stage that has started', () => {
      expect(() =>
        guard.checkIfMembersAreEligibleForStage(membersOf(2), {
          ...baseStage,
          startDate: new Date(Date.now() - 1000),
        }),
      ).toThrow('Stage has already started');
    });

    it('rejects too many players', () => {
      expect(() =>
        guard.checkIfMembersAreEligibleForStage(membersOf(4), baseStage),
      ).toThrow('Roster size is too large');
    });

    it('rejects too few players', () => {
      expect(() =>
        guard.checkIfMembersAreEligibleForStage(membersOf(1), baseStage),
      ).toThrow('Roster size is too small');
    });

    it('rejects too many substitutes', () => {
      expect(() =>
        guard.checkIfMembersAreEligibleForStage(membersOf(3, 2), baseStage),
      ).toThrow('Substitute amount is too large');
    });

    it('does not limit substitutes when the stage sets no limit', () => {
      expect(() =>
        guard.checkIfMembersAreEligibleForStage(membersOf(3, 3), {
          ...baseStage,
          maxSubstitutes: null,
        }),
      ).not.toThrow();
    });
  });
});
