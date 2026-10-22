import { Injectable } from '@nestjs/common';
import { apiTokenScopeEnumType } from '@tournament-app/types';
import { and, asc, desc, eq, gt, gte, isNull, lt, or, sql } from 'drizzle-orm';
import { db } from '../db/db';
import { apiToken, apiTokenUsage, user } from '../db/schema';

// Everything about a token except its hash
const publicColumns = {
  id: apiToken.id,
  name: apiToken.name,
  prefix: apiToken.prefix,
  scopes: apiToken.scopes,
  createdAt: apiToken.createdAt,
  expiresAt: apiToken.expiresAt,
  lastUsedAt: apiToken.lastUsedAt,
  revokedAt: apiToken.revokedAt,
};

// Tokens that are neither revoked nor expired
const isActiveAt = (now: Date) =>
  and(
    isNull(apiToken.revokedAt),
    or(isNull(apiToken.expiresAt), gt(apiToken.expiresAt, now)),
  );

export type RateLimitNoticeField = 'rateLimitWarnedAt' | 'rateLimitReachedAt';

@Injectable()
export class ApiTokensRepository {
  async create(values: {
    userId: number;
    name: string;
    tokenHash: string;
    prefix: string;
    scopes: apiTokenScopeEnumType[];
    expiresAt: Date | null;
  }) {
    const [created] = await db
      .insert(apiToken)
      .values(values)
      .returning(publicColumns);

    return created;
  }

  async findAllForUser(userId: number) {
    return db
      .select(publicColumns)
      .from(apiToken)
      .where(eq(apiToken.userId, userId))
      .orderBy(desc(apiToken.createdAt), desc(apiToken.id));
  }

  async findOwn(userId: number, id: number) {
    const [token] = await db
      .select(publicColumns)
      .from(apiToken)
      .where(and(eq(apiToken.id, id), eq(apiToken.userId, userId)));

    return token;
  }

  async countActive(userId: number, now = new Date()) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(apiToken)
      .where(and(eq(apiToken.userId, userId), isActiveAt(now)));

    return count;
  }

  async revoke(id: number, now = new Date()) {
    const [revoked] = await db
      .update(apiToken)
      .set({ revokedAt: now })
      .where(eq(apiToken.id, id))
      .returning(publicColumns);

    return revoked;
  }

  async revokeAllActive(userId: number, now = new Date()) {
    const revoked = await db
      .update(apiToken)
      .set({ revokedAt: now })
      .where(and(eq(apiToken.userId, userId), isActiveAt(now)))
      .returning({ id: apiToken.id });

    return revoked.length;
  }

  // Requests per day since `since`, oldest first
  async usageSince(tokenId: number, since: string) {
    return db
      .select({ day: apiTokenUsage.day, requests: apiTokenUsage.requests })
      .from(apiTokenUsage)
      .where(
        and(eq(apiTokenUsage.tokenId, tokenId), gte(apiTokenUsage.day, since)),
      )
      .orderBy(asc(apiTokenUsage.day));
  }

  // The token with the user it acts for
  async findByHash(tokenHash: string) {
    const [found] = await db
      .select({
        id: apiToken.id,
        userId: apiToken.userId,
        name: apiToken.name,
        scopes: apiToken.scopes,
        expiresAt: apiToken.expiresAt,
        revokedAt: apiToken.revokedAt,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
      })
      .from(apiToken)
      .innerJoin(user, eq(apiToken.userId, user.id))
      .where(eq(apiToken.tokenHash, tokenHash));

    return found;
  }

  async recordUse(tokenId: number, day: string, now: Date) {
    await Promise.all([
      db
        .insert(apiTokenUsage)
        .values({ tokenId, day, requests: 1 })
        .onConflictDoUpdate({
          target: [apiTokenUsage.tokenId, apiTokenUsage.day],
          set: { requests: sql`${apiTokenUsage.requests} + 1` },
        }),
      db
        .update(apiToken)
        .set({ lastUsedAt: now })
        .where(eq(apiToken.id, tokenId)),
    ]);
  }

  // Sets the notice time unless it is more recent than `notBefore`. The conditional update claims
  // the notice, so concurrent requests (or API instances) send it once.
  async claimRateLimitNotice(
    tokenId: number,
    field: RateLimitNoticeField,
    now: Date,
    notBefore: Date,
  ) {
    const claimed = await db
      .update(apiToken)
      .set({ [field]: now })
      .where(
        and(
          eq(apiToken.id, tokenId),
          or(isNull(apiToken[field]), lt(apiToken[field], notBefore)),
        ),
      )
      .returning({ id: apiToken.id });

    return claimed.length > 0;
  }
}
