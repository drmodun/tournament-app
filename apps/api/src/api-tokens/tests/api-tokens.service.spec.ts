import { apiTokenScopeEnum } from '@tournament-app/types';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { hashApiToken } from '../api-token';
import { ApiTokensRepository } from '../api-tokens.repository';
import { ApiTokensService } from '../api-tokens.service';

describe('ApiTokensService', () => {
  const DAY = 24 * 60 * 60 * 1000;
  let repository: jest.Mocked<ApiTokensRepository>;
  let notifications: { createWithUsers: jest.Mock };
  let templates: { fill: jest.Mock };
  let service: ApiTokensService;

  beforeEach(() => {
    repository = {
      create: jest.fn(async (values) => ({
        id: 1,
        name: values.name,
        prefix: values.prefix,
        scopes: values.scopes,
        createdAt: new Date(),
        expiresAt: values.expiresAt,
        lastUsedAt: null,
        revokedAt: null,
      })),
      findAllForUser: jest.fn(),
      findOwn: jest.fn(),
      countActive: jest.fn().mockResolvedValue(0),
      revoke: jest.fn(),
      revokeAllActive: jest.fn(),
      usageSince: jest.fn(),
      findByHash: jest.fn(),
      recordUse: jest.fn(),
      claimRateLimitNotice: jest.fn(),
    } as unknown as jest.Mocked<ApiTokensRepository>;
    notifications = { createWithUsers: jest.fn() };
    templates = { fill: jest.fn().mockReturnValue('message') };
    service = new ApiTokensService(
      repository,
      notifications as any,
      templates as any,
    );
  });

  describe('create', () => {
    const created = () => repository.create.mock.calls[0][0];

    it('returns the token once and stores only its hash', async () => {
      const result = await service.create(1, {
        name: ' Discord bot ',
        scopes: [apiTokenScopeEnum.READ],
      });

      expect(result.token).toMatch(/^wsh_/);
      expect(created()).toMatchObject({ userId: 1, name: 'Discord bot' });
      expect(created().tokenHash).toBe(hashApiToken(result.token));
      expect(created()).not.toHaveProperty('token');
      expect(created().prefix).toBe(result.token.slice(4, 12));
    });

    it('expires after 90 days unless told otherwise', async () => {
      const before = Date.now();
      await service.create(1, { name: 'a', scopes: [apiTokenScopeEnum.READ] });
      const expiresAt = created().expiresAt!.getTime();
      expect(expiresAt).toBeGreaterThanOrEqual(before + 90 * DAY);
      expect(expiresAt).toBeLessThanOrEqual(Date.now() + 90 * DAY);
    });

    it('takes a custom expiry, or none at all', async () => {
      const before = Date.now();
      await service.create(1, {
        name: 'a',
        scopes: [apiTokenScopeEnum.READ],
        expiresInDays: 7,
      });
      expect(created().expiresAt!.getTime()).toBeGreaterThanOrEqual(
        before + 7 * DAY,
      );

      repository.create.mockClear();
      await service.create(1, {
        name: 'a',
        scopes: [apiTokenScopeEnum.READ],
        expiresInDays: null,
      });
      expect(created().expiresAt).toBeNull();
    });

    it('stores write together with read', async () => {
      await service.create(1, { name: 'a', scopes: [apiTokenScopeEnum.WRITE] });
      expect(created().scopes).toEqual(['read', 'write']);
    });

    it('refuses blank names and an 11th active token', async () => {
      await expect(
        service.create(1, { name: '   ', scopes: [apiTokenScopeEnum.READ] }),
      ).rejects.toThrow(BadRequestException);

      repository.countActive.mockResolvedValue(10);
      await expect(
        service.create(1, { name: 'a', scopes: [apiTokenScopeEnum.READ] }),
      ).rejects.toThrow('You can have at most 10 active API tokens');
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('revoke', () => {
    it('answers someone else’s token with 404', async () => {
      repository.findOwn.mockResolvedValue(undefined);
      await expect(service.revoke(1, 5)).rejects.toThrow(NotFoundException);
      expect(repository.findOwn).toHaveBeenCalledWith(1, 5);
      expect(repository.revoke).not.toHaveBeenCalled();
    });

    it('keeps the first revocation time', async () => {
      const token = { id: 5, revokedAt: new Date(0) } as any;
      repository.findOwn.mockResolvedValue(token);
      await expect(service.revoke(1, 5)).resolves.toBe(token);
      expect(repository.revoke).not.toHaveBeenCalled();
    });

    it('revokes an active token', async () => {
      repository.findOwn.mockResolvedValue({ id: 5, revokedAt: null } as any);
      await service.revoke(1, 5);
      expect(repository.revoke).toHaveBeenCalledWith(5);
    });

    it('revokes every active token of the user at once', async () => {
      repository.revokeAllActive.mockResolvedValue(3);
      await expect(service.revokeAll(1)).resolves.toEqual({ revoked: 3 });
    });
  });

  it('gives usage for the last 30 days of an own token', async () => {
    repository.findOwn.mockResolvedValue({ id: 5 } as any);
    repository.usageSince.mockResolvedValue([
      { day: '2026-10-21', requests: 4 },
    ]);
    await expect(service.usage(1, 5)).resolves.toEqual([
      { day: '2026-10-21', requests: 4 },
    ]);
    const [tokenId, since] = repository.usageSince.mock.calls[0];
    expect(tokenId).toBe(5);
    const days = (Date.now() - new Date(since).getTime()) / DAY;
    expect(days).toBeGreaterThan(28);
    expect(days).toBeLessThanOrEqual(30);
  });

  it('looks tokens up by hash', async () => {
    await service.findByToken('wsh_x');
    expect(repository.findByHash).toHaveBeenCalledWith(hashApiToken('wsh_x'));
  });

  it('only logs failures to record use', async () => {
    repository.recordUse.mockRejectedValue(new Error('db down'));
    const log = jest
      .spyOn((service as any).logger, 'error')
      .mockImplementation();
    await expect(service.recordUse(5)).resolves.toBeUndefined();
    expect(log).toHaveBeenCalled();
  });

  describe('notifyRateLimit', () => {
    const token = { id: 5, userId: 1, name: 'Discord bot' };
    const usage = { used: 96, limit: 120 };

    it('notifies the owner the first time in a day', async () => {
      repository.claimRateLimitNotice.mockResolvedValue(true);
      const now = new Date('2026-10-22T12:00:00Z');
      await service.notifyRateLimit(token, 'warning', usage, now);

      expect(repository.claimRateLimitNotice).toHaveBeenCalledWith(
        5,
        'rateLimitWarnedAt',
        now,
        new Date('2026-10-21T12:00:00Z'),
      );
      expect(templates.fill).toHaveBeenCalledWith(
        'api-token-rate-limit-warning',
        { name: 'Discord bot', used: '96', limit: '120' },
      );
      expect(notifications.createWithUsers).toHaveBeenCalledWith(
        {
          type: 'api-token-rate-limit-warning',
          message: 'message',
          link: '/user',
        },
        [1],
      );
    });

    it('stays quiet when the owner was told in the last day', async () => {
      repository.claimRateLimitNotice.mockResolvedValue(false);
      await service.notifyRateLimit(token, 'reached', usage);
      expect(repository.claimRateLimitNotice.mock.calls[0][1]).toBe(
        'rateLimitReachedAt',
      );
      expect(notifications.createWithUsers).not.toHaveBeenCalled();
    });

    it('only logs failures', async () => {
      repository.claimRateLimitNotice.mockResolvedValue(true);
      notifications.createWithUsers.mockRejectedValue(new Error('nope'));
      jest.spyOn((service as any).logger, 'error').mockImplementation();
      await expect(
        service.notifyRateLimit(token, 'reached', usage),
      ).resolves.toBeUndefined();
    });
  });
});
