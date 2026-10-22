import {
  apiTokenScopeEnum,
  apiTokenScopeEnumType,
} from '@tournament-app/types';
import { createHash, randomBytes } from 'crypto';

// `wsh_` + 32 random bytes in base64url. The prefix makes tokens easy to recognise in logs and
// for secret scanners.
export const API_TOKEN_PREFIX = 'wsh_';
const DISPLAY_PREFIX_LENGTH = 8;

export const MAX_ACTIVE_TOKENS = 10;
export const DEFAULT_EXPIRY_DAYS = 90;
export const MAX_EXPIRY_DAYS = 365;
export const USAGE_HISTORY_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export const isApiToken = (value: unknown): value is string =>
  typeof value === 'string' && value.startsWith(API_TOKEN_PREFIX);

export const generateApiToken = () => {
  const token = API_TOKEN_PREFIX + randomBytes(32).toString('base64url');
  return {
    token,
    tokenHash: hashApiToken(token),
    prefix: token.slice(
      API_TOKEN_PREFIX.length,
      API_TOKEN_PREFIX.length + DISPLAY_PREFIX_LENGTH,
    ),
  };
};

// A plain SHA-256 is enough: the token has 256 bits of entropy, so there is nothing to
// brute-force, and the lookup stays one indexed query.
export const hashApiToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

// Null: the token never expires
export const expiryFrom = (now: Date, days: number | null) =>
  days === null ? null : new Date(now.getTime() + days * DAY_MS);

export const isActive = (
  token: { revokedAt: Date | null; expiresAt: Date | null },
  now = new Date(),
) =>
  !token.revokedAt &&
  (!token.expiresAt || token.expiresAt.getTime() > now.getTime());

// WRITE implies READ, so it is stored with it
export const normaliseScopes = (
  scopes: apiTokenScopeEnumType[],
): apiTokenScopeEnumType[] =>
  scopes.includes(apiTokenScopeEnum.WRITE)
    ? [apiTokenScopeEnum.READ, apiTokenScopeEnum.WRITE]
    : [apiTokenScopeEnum.READ];

const READ_METHODS = ['GET', 'HEAD'];

export const canUseMethod = (scopes: apiTokenScopeEnumType[], method: string) =>
  scopes.includes(apiTokenScopeEnum.WRITE) ||
  (scopes.includes(apiTokenScopeEnum.READ) &&
    READ_METHODS.includes(method.toUpperCase()));

// The UTC day (YYYY-MM-DD) a usage row counts requests for
export const usageDay = (now: Date) => now.toISOString().slice(0, 10);

export const daysAgo = (now: Date, days: number) =>
  usageDay(new Date(now.getTime() - days * DAY_MS));
