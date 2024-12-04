import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { GroupRoleGuardMixin } from '../../guards/group-role.mixin';
import { GroupMembershipService } from '../../../group-membership/group-membership.service';
import { userRoleEnum } from '@tournament-app/types';

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

        // Reset all role checks to false by default
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
            user: null,
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

        it('should return true if user is system admin', async () => {
          const request = {
            ...mockRequestBase,
            user: { id: 1, role: userRoleEnum.ADMIN },
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

        describe('Role Hierarchy', () => {
          if (role === 'isAdmin') {
            it('should not allow member access to admin guard', async () => {
              mockGroupMembershipService.isMember.mockResolvedValue(true);
              const result = await guard.canActivate(mockContext);
              expect(result).toBe(false);
            });
          }

          if (role === 'isOwner') {
            it('should not allow admin access to owner guard', async () => {
              mockGroupMembershipService.isAdmin.mockResolvedValue(true);
              const result = await guard.canActivate(mockContext);
              expect(result).toBe(false);
            });

            it('should not allow member access to owner guard', async () => {
              mockGroupMembershipService.isMember.mockResolvedValue(true);
              const result = await guard.canActivate(mockContext);
              expect(result).toBe(false);
            });
          }
        });

        it(`should check role through params`, async () => {
          mockGroupMembershipService[role].mockResolvedValue(true);
          const result = await guard.canActivate(mockContext);
          expect(result).toBe(true);
          expect(mockGroupMembershipService[role]).toHaveBeenCalledWith(1, 1);
        });

        it(`should check role through body`, async () => {
          const request = {
            ...mockRequestBase,
            params: {},
            body: { groupId: '1' },
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

        it(`should check role through query`, async () => {
          const request = {
            ...mockRequestBase,
            params: {},
            query: { groupId: '1' },
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
