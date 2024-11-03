import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications.service';
import { NotificationTemplatesFiller } from '../templates';
import * as admin from 'firebase-admin';
import { db } from 'src/db/db';
import { InternalServerErrorException } from '@nestjs/common';
import { FirebaseAdminFactory } from '../firebase-admin.factory';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  messaging: jest.fn(() => ({
    send: jest.fn(),
    sendEachForMulticast: jest.fn(),
  })),
}));

jest.mock('src/db/db');
jest.mock('src/db/schema');

describe('NotificationsService', () => {
  let service: NotificationsService;
  let templatesFiller: NotificationTemplatesFiller;
  let firebaseAdminFactory: FirebaseAdminFactory;
  let messaging: Partial<admin.messaging.Messaging> = {
    send: jest.fn(),
    sendEachForMulticast: jest.fn(),
  };

  beforeEach(async () => {
    templatesFiller = {
      fill: jest.fn(),
    } as Partial<NotificationTemplatesFiller> as NotificationTemplatesFiller;

    firebaseAdminFactory = {
      getInstance: jest.fn(),
    } as Partial<FirebaseAdminFactory> as FirebaseAdminFactory;

    process.env.FIREBASE_PROJECT_ID = 'test-project-id';
    process.env.FIREBASE_PRIVATE_KEY = 'test-private';
    process.env.FIREBASE_CLIENT_EMAIL = 'test-email';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationTemplatesFiller, useValue: templatesFiller },
        { provide: FirebaseAdminFactory, useValue: firebaseAdminFactory },
      ],
    }).compile();

    jest
      .spyOn(FirebaseAdminFactory.prototype, 'getInstance')
      .mockReturnValue(messaging as admin.messaging.Messaging);

    service = module.get<NotificationsService>(NotificationsService);
    service.messaging = messaging as admin.messaging.Messaging;
  });

  it('should throw an error if Firebase credentials are not set', () => {
    process.env.FIREBASE_PROJECT_ID = '';
    process.env.FIREBASE_PRIVATE_KEY = '';
    process.env.FIREBASE_CLIENT_EMAIL = '';

    expect(
      () => new NotificationsService(templatesFiller, firebaseAdminFactory),
    ).toThrow(Error);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotificationToUser', () => {
    it('should send notification to user', async () => {
      const userId = 1;
      const templateName = 'testTemplate';
      const data = { key: 'value' };
      const options = { title: 'Test' };
      const tokens = [{ token: 'token1' }, { token: 'token2' }];
      const batchResponse = {
        successCount: 2,
        failureCount: 0,
      } as admin.messaging.BatchResponse;

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(tokens),
        }),
      });

      jest
        .spyOn(service, 'sendMulticastNotification')
        .mockResolvedValue(batchResponse);

      const result = await service.sendNotificationToUser(
        userId,
        templateName,
        data,
        options,
      );

      expect(result).toEqual(batchResponse);
      expect(service.sendMulticastNotification).toHaveBeenCalledWith(
        ['token1', 'token2'],
        templateName,
        data,
        options,
      );
    });

    it('should throw InternalServerErrorException if sending notification fails', async () => {
      const userId = 1;
      const templateName = 'testTemplate';
      const data = { key: 'value' };
      const options = { title: 'Test' };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      jest
        .spyOn(service, 'sendMulticastNotification')
        .mockRejectedValue(new InternalServerErrorException());

      await expect(
        service.sendNotificationToUser(userId, templateName, data, options),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('sendNotification', () => {
    it('should send notification', async () => {
      const fcmToken = 'token';
      const templateName = 'testTemplate';
      const data = { key: 'value' };
      const options = { title: 'Test' };
      const message = 'filled message';

      (templatesFiller.fill as jest.Mock).mockReturnValue(message);
      jest.spyOn(messaging, 'send').mockResolvedValue('messageId');

      const result = await service.sendNotification(
        fcmToken,
        templateName,
        data,
        options,
      );

      expect(result).toBe('messageId');
      expect(messaging.send).toHaveBeenCalledWith({
        token: fcmToken,
        notification: {
          body: message,
          ...options,
        },
      });
    });

    it('should throw InternalServerErrorException if sending notification fails', async () => {
      const fcmToken = 'token';
      const templateName = 'testTemplate';
      const data = { key: 'value' };
      const options = { title: 'Test' };
      const message = 'filled message';

      (templatesFiller.fill as jest.Mock).mockReturnValue(message);

      jest
        .spyOn(messaging, 'send')
        .mockRejectedValue(new InternalServerErrorException());

      await expect(
        service.sendNotification(fcmToken, templateName, data, options),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('sendMulticastNotification', () => {
    it('should send multicast notification', async () => {
      const fcmTokens = ['token1', 'token2'];
      const templateName = 'testTemplate';
      const data = { key: 'value' };
      const options = { title: 'Test' };
      const message = 'filled message';
      const batchResponse = {
        successCount: 2,
        failureCount: 0,
      } as admin.messaging.BatchResponse;

      (templatesFiller.fill as jest.Mock).mockReturnValue(message);
      jest
        .spyOn(messaging, 'sendEachForMulticast')
        .mockResolvedValue(batchResponse);

      const result = await service.sendMulticastNotification(
        fcmTokens,
        templateName,
        data,
        options,
      );

      expect(result).toEqual(batchResponse);
      expect(messaging.sendEachForMulticast).toHaveBeenCalledWith({
        tokens: fcmTokens,
        notification: {
          body: message,
          ...options,
        },
      });
    });

    it('should throw InternalServerErrorException if sending multicast notification fails', async () => {
      const fcmTokens = ['token1', 'token2'];
      const templateName = 'testTemplate';
      const data = { key: 'value' };
      const options = { title: 'Test' };
      const message = 'filled message';

      (templatesFiller.fill as jest.Mock).mockReturnValue(message);
      jest
        .spyOn(messaging, 'sendEachForMulticast')
        .mockRejectedValue(new Error('Send Error'));

      await expect(
        service.sendMulticastNotification(
          fcmTokens,
          templateName,
          data,
          options,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
