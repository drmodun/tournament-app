import admin from 'firebase-admin';

import { Injectable } from '@nestjs/common';
import { Messaging } from 'firebase-admin/lib/messaging';

@Injectable()
export class FirebaseAdminFactory {
  private instance: Messaging | null = null;

  constructor() {}

  public getInstance(): Messaging {
    if (this.instance || process.env.MODE === 'test') {
      return this.instance;
    }

    const { privateKey } = JSON.parse(
      process.env.FIREBASE_PRIVATE_KEY || '{ privateKey: null }',
    );

    this.instance = admin
      .initializeApp({
        credential: admin.credential.cert({
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey.replace(/\\n/g, '\n'),
          projectId: process.env.FIREBASE_PROJECT_ID,
        }),
      })
      .messaging();

    return this.instance;
  }
}
