import {
  ForbiddenException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTokenRateLimiter } from 'src/api-tokens/api-token-rate-limiter';
import { ApiTokensService } from 'src/api-tokens/api-tokens.service';
import { ApiTokenStrategy, INVALID_API_TOKEN } from '../apiToken.strategy';

describe('ApiTokenStrategy', () => {
  let tokens: jest.Mocked<
    Pick<ApiTokensService, 'findByToken' | 'recordUse' | 'notifyRateLimit'>
  >;
  let strategy: ApiTokenStrategy;

  const found = (overrides = {}) => ({
    id: 5,
    userId: 1,
    name: 'Discord bot',
    scopes: ['read', 'write'] as ('read' | 'write')[],
    expiresAt: null,
    revokedAt: null,
    user: {
      id: 1,
      email: 'a@b.c',
      role: 'admin',
      isEmailVerified: true,
    },
    ...overrides,
  });

  const request = (method = 'GET') =>
    ({ method, res: { setHeader: jest.fn() } }) as any;

  beforeEach(() => {
    tokens = {
      findByToken: jest.fn(),
      recordUse: jest.fn().mockResolvedValue(undefined),
      notifyRateLimit: jest.fn().mockResolvedValue(undefined),
    };
    strategy = new ApiTokenStrategy(
      tokens as unknown as ApiTokensService,
      new ApiTokenRateLimiter(3, 60_000),
    );
  });

  it('acts as the token’s user, never as a site admin', async () => {
    tokens.findByToken.mockResolvedValue(found() as any);

    await expect(strategy.validate(request(), 'wsh_x')).resolves.toEqual({
      id: 1,
      email: 'a@b.c',
      role: 'user',
      tokenId: 5,
      scopes: ['read', 'write'],
    });
    expect(tokens.recordUse).toHaveBeenCalledWith(5, expect.any(Date));
  });

  it.each([
    ['unknown', undefined],
    ['revoked', found({ revokedAt: new Date(0) })],
    ['expired', found({ expiresAt: new Date(0) })],
    [
      'of an unverified user',
      found({
        user: { id: 1, email: 'a', role: 'user', isEmailVerified: false },
      }),
    ],
  ])('refuses a token that is %s', async (_, token) => {
    tokens.findByToken.mockResolvedValue(token as any);

    await expect(strategy.validate(request(), 'wsh_x')).rejects.toThrow(
      new UnauthorizedException(INVALID_API_TOKEN),
    );
    expect(tokens.recordUse).not.toHaveBeenCalled();
  });

  it('lets read-only tokens only read', async () => {
    tokens.findByToken.mockResolvedValue(found({ scopes: ['read'] }) as any);

    await expect(
      strategy.validate(request('GET'), 'wsh_x'),
    ).resolves.toBeTruthy();
    await expect(strategy.validate(request('POST'), 'wsh_x')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('answers 429 over the rate limit and tells the owner once per crossing', async () => {
    tokens.findByToken.mockResolvedValue(found() as any);
    const req = request();

    for (let i = 0; i < 3; i++) await strategy.validate(req, 'wsh_x');
    const refused = strategy.validate(req, 'wsh_x');

    await expect(refused).rejects.toThrow(HttpException);
    await expect(refused).rejects.toMatchObject({ status: 429 });
    expect(req.res.setHeader).toHaveBeenCalledWith('Retry-After', 60);
    expect(tokens.notifyRateLimit.mock.calls.map((call) => call[1])).toEqual([
      'warning',
      'reached',
    ]);
  });
});
