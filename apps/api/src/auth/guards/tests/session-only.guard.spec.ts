import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { userRoleEnum } from '@tournament-app/types';
import { AdminAuthGuard, ADMIN_NEEDS_LOGIN_MESSAGE } from '../admin-auth.guard';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { SESSION_ONLY_MESSAGE, SessionOnlyGuard } from '../session-only.guard';

describe('guards refusing API tokens', () => {
  const contextFor = (user: object) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    jest
      .spyOn(JwtAuthGuard.prototype, 'canActivate')
      .mockResolvedValue(true as never);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('SessionOnlyGuard', () => {
    it('lets logins through', async () => {
      await expect(
        new SessionOnlyGuard().canActivate(contextFor({ id: 1 })),
      ).resolves.toBe(true);
    });

    it('refuses API tokens', async () => {
      await expect(
        new SessionOnlyGuard().canActivate(contextFor({ id: 1, tokenId: 5 })),
      ).rejects.toThrow(new ForbiddenException(SESSION_ONLY_MESSAGE));
    });
  });

  describe('AdminAuthGuard', () => {
    it('lets admin logins through', async () => {
      await expect(
        new AdminAuthGuard().canActivate(
          contextFor({ id: 1, role: userRoleEnum.ADMIN }),
        ),
      ).resolves.toBe(true);
    });

    it('refuses API tokens with a message saying why', async () => {
      await expect(
        new AdminAuthGuard().canActivate(
          contextFor({ id: 1, role: userRoleEnum.ADMIN, tokenId: 5 }),
        ),
      ).rejects.toThrow(new ForbiddenException(ADMIN_NEEDS_LOGIN_MESSAGE));
    });

    it('refuses users who are not admins', async () => {
      await expect(
        new AdminAuthGuard().canActivate(
          contextFor({ id: 1, role: userRoleEnum.USER }),
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
