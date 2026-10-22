import { apiTokenScopeEnum } from '@tournament-app/types';
import {
  canUseMethod,
  daysAgo,
  expiryFrom,
  generateApiToken,
  hashApiToken,
  isActive,
  isApiToken,
  normaliseScopes,
  usageDay,
} from '../api-token';

describe('API token helpers', () => {
  it('generates wsh_ tokens with 32 random bytes and keeps only their hash', () => {
    const { token, tokenHash, prefix } = generateApiToken();
    expect(token).toMatch(/^wsh_[A-Za-z0-9_-]{43}$/);
    expect(prefix).toBe(token.slice(4, 12));
    expect(tokenHash).toBe(hashApiToken(token));
    expect(tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(generateApiToken().token).not.toBe(token);
  });

  it('recognises tokens by their prefix', () => {
    expect(isApiToken('wsh_abc')).toBe(true);
    expect(isApiToken('eyJhbGciOi.x.y')).toBe(false);
    expect(isApiToken(undefined)).toBe(false);
  });

  it('expires after the given days, or never', () => {
    const now = new Date('2026-10-22T10:00:00Z');
    expect(expiryFrom(now, 90)).toEqual(new Date('2027-01-20T10:00:00Z'));
    expect(expiryFrom(now, null)).toBeNull();
  });

  it('is active while neither revoked nor expired', () => {
    const now = new Date('2026-10-22T10:00:00Z');
    const later = new Date('2026-10-23T00:00:00Z');
    const earlier = new Date('2026-10-21T00:00:00Z');
    expect(isActive({ revokedAt: null, expiresAt: null }, now)).toBe(true);
    expect(isActive({ revokedAt: null, expiresAt: later }, now)).toBe(true);
    expect(isActive({ revokedAt: null, expiresAt: earlier }, now)).toBe(false);
    expect(isActive({ revokedAt: earlier, expiresAt: null }, now)).toBe(false);
  });

  it('stores write together with read', () => {
    expect(normaliseScopes([apiTokenScopeEnum.WRITE])).toEqual([
      'read',
      'write',
    ]);
    expect(normaliseScopes([apiTokenScopeEnum.READ])).toEqual(['read']);
  });

  it('lets read-only tokens make only GET and HEAD requests', () => {
    expect(canUseMethod([apiTokenScopeEnum.READ], 'GET')).toBe(true);
    expect(canUseMethod([apiTokenScopeEnum.READ], 'head')).toBe(true);
    expect(canUseMethod([apiTokenScopeEnum.READ], 'POST')).toBe(false);
    expect(canUseMethod([apiTokenScopeEnum.READ], 'DELETE')).toBe(false);
    expect(
      canUseMethod([apiTokenScopeEnum.READ, apiTokenScopeEnum.WRITE], 'PATCH'),
    ).toBe(true);
    expect(canUseMethod([], 'GET')).toBe(false);
  });

  it('counts usage per UTC day', () => {
    const now = new Date('2026-10-22T23:30:00+02:00');
    expect(usageDay(now)).toBe('2026-10-22');
    expect(daysAgo(now, 29)).toBe('2026-09-23');
  });
});
