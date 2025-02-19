import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TournamentAdminGuard } from '../guards/tournament-admin.guard';
import { TournamentService } from '../tournament.service';
import { GroupMembershipService } from '../../group-membership/group-membership.service';
import { userRoleEnum } from '@tournament-app/types';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ITournamentWithRelations } from '../types';

jest.mock('../../auth/guards/jwt-auth.guard');

describe('TournamentAdminGuard', () => {
  let guard: TournamentAdminGuard;
  let tournamentService: jest.Mocked<TournamentService>;
  let groupMembershipService: jest.Mocked<GroupMembershipService>;

  const mockTournament: ITournamentWithRelations = {
    id: 1,
    name: 'Test Tournament',
    categoryId: 1,
    affiliatedGroupId: 1,
    creatorId: 2,
    parentTournamentId: null,
  };

  beforeEach(async () => {
    const mockTournamentService = {
      findOne: jest.fn(),
    };

    const mockGroupMembershipService = {
      isAdmin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentAdminGuard,
        {
          provide: TournamentService,
          useValue: mockTournamentService,
        },
        {
          provide: GroupMembershipService,
          useValue: mockGroupMembershipService,
        },
      ],
    }).compile();

    guard = module.get<TournamentAdminGuard>(TournamentAdminGuard);
    tournamentService = module.get(TournamentService);
    groupMembershipService = module.get(GroupMembershipService);

    // Mock JwtAuthGuard's canActivate to return true by default
    (JwtAuthGuard.prototype.canActivate as jest.Mock).mockResolvedValue(true);
  });

  const createMockExecutionContext = (
    userId: number,
    tournamentId?: number,
    role: userRoleEnum = userRoleEnum.USER,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId, role },
          params: { tournamentId },
          body: {},
          query: {},
        }),
      }),
    } as ExecutionContext;
  };

  describe('JWT Authentication', () => {
    it('should deny access when JWT authentication fails', async () => {
      (JwtAuthGuard.prototype.canActivate as jest.Mock).mockResolvedValue(
        false,
      );
      const context = createMockExecutionContext(1, 1);

      const result = await guard.canActivate(context);

      expect(result).toBeFalsy();
    });
  });

  describe('Admin Role Access', () => {
    it('should allow access for users with ADMIN role', async () => {
      const context = createMockExecutionContext(1, 1, userRoleEnum.ADMIN);

      const result = await guard.canActivate(context);

      expect(result).toBeTruthy();
      expect(tournamentService.findOne).not.toHaveBeenCalled();
    });
  });

  describe('Tournament Creator Access', () => {
    it('should allow access for tournament creator', async () => {
      const userId = 2; // Same as mockTournament.creatorId
      const context = createMockExecutionContext(userId, 1);

      tournamentService.findOne.mockResolvedValue(mockTournament);

      const result = await guard.canActivate(context);

      expect(result).toBeTruthy();
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
    });

    it('should get tournamentId from request body if not in params', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 2, role: userRoleEnum.USER },
            params: {},
            body: { tournamentId: 1 },
            query: {},
          }),
        }),
      } as ExecutionContext;

      tournamentService.findOne.mockResolvedValue(mockTournament);

      const result = await guard.canActivate(context);

      expect(result).toBeTruthy();
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
    });

    it('should get tournamentId from query if not in params or body', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 2, role: userRoleEnum.USER },
            params: {},
            body: {},
            query: { tournamentId: 1 },
          }),
        }),
      } as ExecutionContext;

      tournamentService.findOne.mockResolvedValue(mockTournament);

      const result = await guard.canActivate(context);

      expect(result).toBeTruthy();
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('Group Admin Access', () => {
    it('should allow access for group admin', async () => {
      const context = createMockExecutionContext(3, 1);

      tournamentService.findOne.mockResolvedValue(mockTournament);
      groupMembershipService.isAdmin.mockResolvedValue(true);

      const result = await guard.canActivate(context);

      expect(result).toBeTruthy();
      expect(tournamentService.findOne).toHaveBeenCalledWith(1);
      expect(groupMembershipService.isAdmin).toHaveBeenCalledWith(
        mockTournament.affiliatedGroupId,
        3,
      );
    });

    it('should deny access if tournament has no affiliated group', async () => {
      const context = createMockExecutionContext(3, 1);

      tournamentService.findOne.mockResolvedValue({
        ...mockTournament,
        affiliatedGroupId: null,
      });

      const result = await guard.canActivate(context);

      expect(result).toBeFalsy();
      expect(groupMembershipService.isAdmin).not.toHaveBeenCalled();
    });

    it('should deny access if user is not group admin', async () => {
      const context = createMockExecutionContext(3, 1);

      tournamentService.findOne.mockResolvedValue(mockTournament);
      groupMembershipService.isAdmin.mockResolvedValue(false);

      const result = await guard.canActivate(context);

      expect(result).toBeFalsy();
      expect(groupMembershipService.isAdmin).toHaveBeenCalledWith(
        mockTournament.affiliatedGroupId,
        3,
      );
    });
  });

  describe('Failed Access Scenarios', () => {
    it('should deny access when tournamentId is not provided', async () => {
      const context = createMockExecutionContext(1);

      const result = await guard.canActivate(context);

      expect(result).toBeFalsy();
      expect(tournamentService.findOne).toHaveBeenCalledWith(null);
    });

    it('should deny access when user is not creator and not group admin', async () => {
      const context = createMockExecutionContext(4, 1);

      tournamentService.findOne.mockResolvedValue(mockTournament);
      groupMembershipService.isAdmin.mockResolvedValue(false);

      const result = await guard.canActivate(context);

      expect(result).toBeFalsy();
    });
  });
});
