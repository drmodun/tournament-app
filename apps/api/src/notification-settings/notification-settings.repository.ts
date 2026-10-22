import { Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { IUpdateNotificationSettingsRequest } from '@tournament-app/types';
import { db } from '../db/db';
import {
  userNotificationSettings,
  userToNotificationTokens,
} from '../db/schema';

const settingsColumns = {
  userId: userNotificationSettings.userId,
  emailNotifications: userNotificationSettings.emailNotifications,
  pushNotifications: userNotificationSettings.pushNotifications,
  inAppNotifications: userNotificationSettings.inAppNotifications,
};

const tokenColumns = {
  id: userToNotificationTokens.id,
  token: userToNotificationTokens.token,
  createdAt: userToNotificationTokens.createdAt,
};

@Injectable()
export class NotificationSettingsRepository {
  // Users without a settings row have the defaults, so the row is created when first read
  async getOrCreateSettings(userId: number) {
    await db
      .insert(userNotificationSettings)
      .values({ userId })
      .onConflictDoNothing();

    const [settings] = await db
      .select(settingsColumns)
      .from(userNotificationSettings)
      .where(eq(userNotificationSettings.userId, userId));

    return settings;
  }

  async upsertSettings(
    userId: number,
    settings: IUpdateNotificationSettingsRequest,
  ) {
    const [updated] = await db
      .insert(userNotificationSettings)
      .values({ userId, ...settings })
      .onConflictDoUpdate({
        target: userNotificationSettings.userId,
        set: { ...settings, updatedAt: new Date() },
      })
      .returning(settingsColumns);

    return updated;
  }

  // The users among userIds that turned in-app notifications off
  async getUsersWithoutInApp(userIds: number[]) {
    if (!userIds.length) {
      return [];
    }

    const rows = await db
      .select({ userId: userNotificationSettings.userId })
      .from(userNotificationSettings)
      .where(
        and(
          inArray(userNotificationSettings.userId, userIds),
          eq(userNotificationSettings.inAppNotifications, false),
        ),
      );

    return rows.map((row) => row.userId);
  }

  async getTokens(userId: number) {
    return db
      .select(tokenColumns)
      .from(userToNotificationTokens)
      .where(eq(userToNotificationTokens.userId, userId))
      .orderBy(desc(userToNotificationTokens.createdAt));
  }

  // A token already registered moves to this user, since it now belongs to their device
  async upsertToken(userId: number, token: string) {
    const [registered] = await db
      .insert(userToNotificationTokens)
      .values({ userId, token })
      .onConflictDoUpdate({
        target: userToNotificationTokens.token,
        set: { userId, createdAt: sql`now()` },
      })
      .returning(tokenColumns);

    return registered;
  }

  async deleteToken(userId: number, id: number) {
    return db
      .delete(userToNotificationTokens)
      .where(
        and(
          eq(userToNotificationTokens.id, id),
          eq(userToNotificationTokens.userId, userId),
        ),
      )
      .returning({ id: userToNotificationTokens.id });
  }
}
