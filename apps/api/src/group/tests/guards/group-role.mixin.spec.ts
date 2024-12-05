import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { GroupRoleGuardMixin } from '../../guards/group-role.mixin';
import { GroupMembershipService } from '../../../group-membership/group-membership.service';
import { userRoleEnum } from '@tournament-app/types';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

describe('GroupRoleGuardMixin', () => {
  const roles = ['isOwner', 'isAdmin', 'isMember'] as const;

  roles.forEach((role) => {
    describe(`${role} Guard`, () => {
      const Guard = GroupRoleGuardMixin(role);
      let guard: InstanceType<typeof Guard>;
      const mockGroupMembershipService = {
        isOwner: jest.fn(),
        isAdmin: jest.fn(),
        isMember: jest.fn(),
      };

      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            Guard,
            {
              provide: GroupMembershipService,
              useValue: mockGroupMembershipService,
            },
          ],
        }).compile();

        guard = module.get<InstanceType<typeof Guard>>(Guard);
        guard['groupMembershipService'] = mockGroupMembershipService;

        jest
          .spyOn(JwtAuthGuard.prototype, 'canActivate')
          .mockResolvedValue(true);
      });

      it('should be defined', () => {
        expect(guard).toBeDefined();
      });

      describe('canActivate', () => {
        const mockRequestBase = {
          user: {
            id: 1,
            role: userRoleEnum.USER,
          },
          params: {
            groupId: '1',
          },
          body: {},
          query: {},
        };

        let mockContext: ExecutionContext;

        beforeEach(() => {
          mockContext = {
            switchToHttp: () => ({
              getRequest: () => ({ ...mockRequestBase }),
            }),
          } as ExecutionContext;

          // Reset all role checks to false by default
          mockGroupMembershipService.isOwner.mockResolvedValue(false);
          mockGroupMembershipService.isAdmin.mockResolvedValue(false);
          mockGroupMembershipService.isMember.mockResolvedValue(false);
        });

        it('should return false if JWT authentication fails', async () => {
          jest
            .spyOn(JwtAuthGuard.prototype, 'canActivate')
            .mockResolvedValueOnce(false);
          const result = await guard.canActivate(mockContext);
          expect(result).toBe(false);
          expect(mockGroupMembershipService[role]).not.toHaveBeenCalled();
        });

        it('should return false if no groupId is provided', async () => {
          const request = {
            ...mockRequestBase,
            params: {},
          };

          mockContext = {
            switchToHttp: () => ({
              getRequest: () => request,
            }),
          } as ExecutionContext;

          const result = await guard.canActivate(mockContext);
          expect(result).toBe(false);
          expect(mockGroupMembershipService[role]).not.toHaveBeenCalled();
        });

        it('should return false if groupId is not a number', async () => {
          const request = {
            ...mockRequestBase,
            params: { groupId: 'not-a-number' },
          };

          mockContext = {
            switchToHttp: () => ({
              getRequest: () => request,
            }),
          } as ExecutionContext;

          const result = await guard.canActivate(mockContext);
          expect(result).toBe(false);
          expect(mockGroupMembershipService[role]).not.toHaveBeenCalled();
        });

        it('should return false if no user is provided', async () => {
          const request = {
            ...mockRequestBase,
            user: undefined,
          };

          mockContext = {
            switchToHttp: () => ({
              getRequest: () => request,
            }),
          } as ExecutionContext;

          const result = await guard.canActivate(mockContext);
          expect(result).toBe(false);
          expect(mockGroupMembershipService[role]).not.toHaveBeenCalled();
        });

        it('should return true if user is an admin', async () => {
          const request = {
            ...mockRequestBase,
            user: {
              ...mockRequestBase.user,
              role: userRoleEnum.ADMIN,
            },
          };

          mockContext = {
            switchToHttp: () => ({
              getRequest: () => request,
            }),
          } as ExecutionContext;

          const result = await guard.canActivate(mockContext);
          expect(result).toBe(true);
          expect(mockGroupMembershipService[role]).not.toHaveBeenCalled();
        });

        it(`should return true if user has ${role} role`, async () => {
          const request = {
            ...mockRequestBase,
            user: {
              ...mockRequestBase.user,
              role: userRoleEnum.USER,
            },
          };

          mockContext = {
            switchToHttp: () => ({
              getRequest: () => request,
            }),
          } as ExecutionContext;

          mockGroupMembershipService[role].mockResolvedValue(true);
          const result = await guard.canActivate(mockContext);
          expect(result).toBe(true);
          expect(mockGroupMembershipService[role]).toHaveBeenCalledWith(1, 1);
        });

        it(`should return false if user does not have ${role} role`, async () => {
          const request = {
            ...mockRequestBase,
            user: {
              ...mockRequestBase.user,
              role: userRoleEnum.USER,
            },
          };

          mockContext = {
            switchToHttp: () => ({
              getRequest: () => request,
            }),
          } as ExecutionContext;

          mockGroupMembershipService[role].mockResolvedValue(false);
          const result = await guard.canActivate(mockContext);
          expect(result).toBe(false);
          expect(mockGroupMembershipService[role]).toHaveBeenCalledWith(1, 1);
        });
      });
    });
  });
});
