import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TournamentManagerGuard } from '../guards/tournament-manager.guard';

describe('TournamentManagerGuard', () => {
  let guard: TournamentManagerGuard;

  const contextFor = (user: object) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    guard = new TournamentManagerGuard();
    jest
      .spyOn(JwtAuthGuard.prototype, 'canActivate')
      .mockResolvedValue(true as never);
  });

  afterEach(() => jest.restoreAllMocks());

  it('lets site admins through without a lookup', async () => {
    const lookup = jest.spyOn(guard, 'managesAnyTournament');

    await expect(
      guard.canActivate(contextFor({ id: 1, role: 'admin' })),
    ).resolves.toBe(true);
    expect(lookup).not.toHaveBeenCalled();
  });

  it('lets tournament organisers through', async () => {
    jest.spyOn(guard, 'managesAnyTournament').mockResolvedValue(true);

    await expect(
      guard.canActivate(contextFor({ id: 2, role: 'user' })),
    ).resolves.toBe(true);
  });

  it('refuses users who manage no tournament', async () => {
    jest.spyOn(guard, 'managesAnyTournament').mockResolvedValue(false);

    await expect(
      guard.canActivate(contextFor({ id: 3, role: 'user' })),
    ).rejects.toThrow(ForbiddenException);
  });

  it('refuses requests without a valid token', async () => {
    jest
      .spyOn(JwtAuthGuard.prototype, 'canActivate')
      .mockResolvedValue(false as never);

    await expect(guard.canActivate(contextFor({}))).resolves.toBe(false);
  });
});
