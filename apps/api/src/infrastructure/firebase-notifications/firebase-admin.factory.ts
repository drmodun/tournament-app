import admin from 'firebase-admin';

import { Injectable, Logger } from '@nestjs/common';
import { Messaging } from 'firebase-admin/lib/messaging';

@Injectable()
export class FirebaseAdminFactory {
  private readonly logger = new Logger(FirebaseAdminFactory.name);
  private instance: Messaging | null = null;

  constructor() {}

  public getInstance(): Messaging {
    if (this.instance || process.env.MODE === 'test') {
      return this.instance;
    }

    try {
      const { privateKey } = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);

      this.instance = admin
        .initializeApp({
          credential: admin.credential.cert({
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey.replace(/\\n/g, '\n'),
            projectId: process.env.FIREBASE_PROJECT_ID,
          }),
        })
        .messaging();
    } catch (e) {
      // Mock or malformed credentials: keep the API bootable, push notifications stay off
      this.logger.warn(
        `Firebase credentials are not usable, push notifications are disabled: ${e.message}`,
      );
    }

    return this.instance;
  }
}
