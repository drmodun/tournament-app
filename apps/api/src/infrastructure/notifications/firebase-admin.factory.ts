import admin from 'firebase-admin';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Messaging } from 'firebase-admin/lib/messaging';

@Injectable()
export class FirebaseAdminFactory {
  private instance: Messaging | null = null;

  constructor() {}

  public getInstance(): Messaging {
    if (this.instance || process.env.MODE === 'test') {
      return this.instance;
    }

    this.instance = admin
      .initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      })
      .messaging();

    return this.instance;
  }
}
