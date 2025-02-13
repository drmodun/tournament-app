import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CanCancelParticipationGuard } from '../../guards/can-cancel-participation.guard';
import { ParticipationService } from '../../participation.service';
import { GroupMembershipService } from 'src/group-membership/group-membership.service';
import {
  ParticipationResponsesEnum,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from '@tournament-app/types';
import { TournamentService } from 'src/tournament/tournament.service';

describe('CanCancelParticipationGuard', () => {
  let guard: CanCancelParticipationGuard;
  let participationService: jest.Mocked<ParticipationService>;
  let groupMembershipService: jest.Mocked<GroupMembershipService>;
  let tournamentService: jest.Mocked<TournamentService>;

  const mockDate = new Date('2025-01-01');
  const futureDate = new Date('2025-12-31');

  const createMockExecutionContext = (
    participationId: number,
    tournamentId: number,
    user: any,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          params: { participationId, tournamentId },
          user,
        }),
      }),
    }) as ExecutionContext;

  beforeEach(async () => {
    const mockParticipationService = {
      findOne: jest.fn(),
    };

    const mockGroupMembershipService = {
      isAdmin: jest.fn(),
    };

    const mockTournamentService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanCancelParticipationGuard,
        {
          provide: ParticipationService,
          useValue: mockParticipationService,
        },
        {
          provide: GroupMembershipService,
          useValue: mockGroupMembershipService,
        },
        {
          provide: TournamentService,
          useValue: mockTournamentService,
        },
      ],
    }).compile();

    guard = module.get<CanCancelParticipationGuard>(
      CanCancelParticipationGuard,
    );
    participationService = module.get(ParticipationService);
    groupMembershipService = module.get(GroupMembershipService);
    tournamentService = module.get(TournamentService);

    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('canActivate', () => {
    it('should allow tournament creator to cancel any participation', async () => {
      const tournament = {
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: futureDate,
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 1,
        maxParticipants: 1,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      };

      const context = createMockExecutionContext(1, 1, { id: 999 });

      tournamentService.findOne.mockResolvedValue(tournament);
      participationService.findOne.mockResolvedValue({
        id: 1,
        userId: 2,
        tournamentId: 1,
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(participationService.findOne).toHaveBeenCalledWith(
        1,
        ParticipationResponsesEnum.PARTICIPANT,
      );
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
    });

    it('should allow user to cancel their own solo participation', async () => {
      const context = createMockExecutionContext(1, 1, { id: 1 });

      tournamentService.findOne.mockResolvedValue({
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: futureDate,
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 1,
        maxParticipants: 1,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      });
      participationService.findOne.mockResolvedValue({
        id: 1,
        userId: 1,
        tournamentId: 1,
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
    });

    it('should allow group admin to cancel group participation', async () => {
      const context = createMockExecutionContext(1, 1, { id: 1 });

      tournamentService.findOne.mockResolvedValue({
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: futureDate,
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 1,
        maxParticipants: 1,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      });
      participationService.findOne.mockResolvedValue({
        id: 1,
        groupId: 1,
        tournamentId: 1,
      });

      groupMembershipService.isAdmin.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(groupMembershipService.isAdmin).toHaveBeenCalledWith(1, 1);
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
    });

    it('should allow affiliated group admin to cancel any participation', async () => {
      const tournament = {
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: futureDate,
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 1,
        maxParticipants: 1,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      };

      const context = createMockExecutionContext(1, 1, { id: 1 });

      tournamentService.findOne.mockResolvedValue(tournament);
      participationService.findOne.mockResolvedValue({
        id: 1,
        userId: 2,
        tournamentId: 1,
      });

      groupMembershipService.isAdmin.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(groupMembershipService.isAdmin).toHaveBeenCalledWith(1, 1);
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
    });

    it('should deny non-admin user canceling other user participation', async () => {
      const context = createMockExecutionContext(1, 1, { id: 1 });

      tournamentService.findOne.mockResolvedValue({
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: futureDate,
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 1,
        maxParticipants: 1,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      });
      participationService.findOne.mockResolvedValue({
        id: 1,
        userId: 2,
        tournamentId: 1,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'You are not allowed to cancel this participation',
        ),
      );
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
    });

    it('should deny non-admin user canceling group participation', async () => {
      const context = createMockExecutionContext(1, 1, { id: 23 });

      tournamentService.findOne.mockResolvedValue({
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: futureDate,
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 1,
        maxParticipants: 1,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      });
      participationService.findOne.mockResolvedValue({
        id: 1,
        userId: 1,
        tournamentId: 1,
      });

      groupMembershipService.isAdmin.mockResolvedValue(false);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'You are not allowed to cancel this participation',
        ),
      );
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
    });

    it('should deny cancellation if tournament has ended', async () => {
      const tournament = {
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 1,
        maxParticipants: 1,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      };

      const context = createMockExecutionContext(1, 1, { id: 1 });

      tournamentService.findOne.mockResolvedValue(tournament);
      participationService.findOne.mockResolvedValue({
        id: 1,
        userId: 1,
        tournamentId: 1,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'Cannot cancel participation in a tournament that has already finished',
        ),
      );
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw error if participation not found', async () => {
      const context = createMockExecutionContext(1, 1, { id: 1 });

      tournamentService.findOne.mockResolvedValue({
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: futureDate,
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 1,
        maxParticipants: 1,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      });
      participationService.findOne.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Participation not found'),
      );
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
    });

    it('should handle missing tournament gracefully', async () => {
      const context = createMockExecutionContext(1, 1, { id: 1 });

      tournamentService.findOne.mockResolvedValue(null);
      participationService.findOne.mockResolvedValue({
        id: 1,
        userId: 1,
        tournamentId: 1,
      });

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
    });
  });
});
