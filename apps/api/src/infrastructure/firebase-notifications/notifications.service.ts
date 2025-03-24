import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationTemplatesFiller } from './templates';
import * as admin from 'firebase-admin';
import { db } from 'src/db/db';
import { userToNotificationTokens } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';
import { FirebaseAdminFactory } from './firebase-admin.factory';

@Injectable()
export class NotificationsService {
  messaging: admin.messaging.Messaging;

  constructor(
    private readonly templatesFiller: NotificationTemplatesFiller,
    private readonly firebaseAdminFactory: FirebaseAdminFactory,
  ) {
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_PRIVATE_KEY ||
      !process.env.FIREBASE_CLIENT_EMAIL
    ) {
      throw new Error('Firebase credentials are not set');
    }

    this.messaging = this.firebaseAdminFactory.getInstance();
  }

  async sendNotificationToUser(
    userId: number,
    templateName: string,
    data: Record<string, string>,
    options?: admin.messaging.NotificationMessagePayload,
  ): Promise<BatchResponse> {
    const tokens = await db
      .select({
        token: userToNotificationTokens.token,
      })
      .from(userToNotificationTokens)
      .where(eq(userToNotificationTokens.userId, userId));

    const parsedTokens = tokens.map((t) => t.token);

    // Works up to 500 tokens for single user

    return await this.sendMulticastNotification(
      parsedTokens,
      templateName,
      data,
      options,
    );
  }

  async sendNotification(
    fcmToken: string,
    templateName: string,
    data: Record<string, string>,
    options?: admin.messaging.NotificationMessagePayload,
  ): Promise<string> {
    const message = this.templatesFiller.fill(templateName, data);

    try {
      const notification: admin.messaging.NotificationMessagePayload = {
        body: message,
        ...options,
      };

      return await this.messaging.send({
        token: fcmToken,
        notification,
      });
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('Failed to send notification');
    }
  }

  async sendMulticastNotification(
    fcmTokens: string[], // Array of tokens
    templateName: string,
    data: Record<string, string>,
    options?: admin.messaging.NotificationMessagePayload,
  ): Promise<admin.messaging.BatchResponse> {
    try {
      const message = this.templatesFiller.fill(templateName, data);

      return await this.messaging.sendEachForMulticast({
        tokens: fcmTokens,
        notification: {
          body: message,
          ...options,
        },
      });
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException('Failed to send notification');
    }
  }
}
