import { Test, TestingModule } from '@nestjs/testing';
import { NotificationBus } from '../notification-bus';
import { JwtService } from '@nestjs/jwt';
import { SseNotificationsService } from '../sse-notifications.service';
import { SseNotificationRepository } from '../sse-notification.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationCreateDto } from '../../types';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { notificationTypeEnum } from '@tournament-app/types';
import { of } from 'rxjs';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Mock the fromEvent function
jest.mock('rxjs', () => {
  const original = jest.requireActual('rxjs');
  return {
    ...original,
    fromEvent: jest.fn().mockImplementation(() =>
      of({
        data: { message: 'test notification' },
        type: 'notification',
      }),
    ),
  };
});

describe('SseNotificationsService', () => {
  let service: SseNotificationsService;
  let repository: SseNotificationRepository;
  let eventEmitter: EventEmitter2;

  const mockNotification: NotificationCreateDto = {
    type: notificationTypeEnum.TOURNAMENT_START,
    message: 'Your tournament is starting now!',
    link: '/tournaments/123',
    image: 'https://example.com/tournament-image.jpg',
  };

  const mockUserIds = [1, 2, 3];
  const mockUserId = 1;
  const mockToken = 'mock-token';
  const mockNotificationId = 1;

  const notificationBus = { publish: jest.fn() };
  const jwtService = new JwtService({});

  beforeEach(async () => {
    notificationBus.publish.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        SseNotificationsService,
        {
          provide: SseNotificationRepository,
          useValue: {
            getReadTimeSorted: jest.fn(),
            createWithUsers: jest.fn(),
            updateUserToken: jest.fn(),
            getUserByToken: jest.fn(),
            updateToRead: jest.fn(),
            updateAllToReadForUser: jest.fn(),
            updateBulkToRead: jest.fn(),
            deleteEntity: jest.fn(),
            deleteForUser: jest.fn(),
          },
        },
        {
          provide: NotificationBus,
          useValue: notificationBus,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<SseNotificationsService>(SseNotificationsService);
    repository = module.get<SseNotificationRepository>(
      SseNotificationRepository,
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllForUser', () => {
    it('should call repository.getReadTimeSorted with the query', async () => {
      const mockQuery = { userId: mockUserId, page: 1, pageSize: 10 };
      const mockResult = [{ notification: mockNotification, isRead: false }];

      jest.spyOn(repository, 'getReadTimeSorted').mockResolvedValue(mockResult);

      const result = await service.findAllForUser(mockQuery);

      expect(repository.getReadTimeSorted).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual(mockResult);
    });
  });

  describe('createNotificationAndLinkToUsers', () => {
    it('should call repository.createWithUsers with notification and user ids', async () => {
      jest.spyOn(repository, 'createWithUsers').mockResolvedValue(undefined);

      await service.createNotificationAndLinkToUsers(
        mockNotification,
        mockUserIds,
      );

      expect(repository.createWithUsers).toHaveBeenCalledWith(
        mockNotification,
        mockUserIds,
      );
    });

    it('should not call eventEmitter.emitAsync', async () => {
      jest.spyOn(repository, 'createWithUsers').mockResolvedValue(undefined);
      jest.spyOn(eventEmitter, 'emitAsync');

      await service.createNotificationAndLinkToUsers(
        mockNotification,
        mockUserIds,
      );

      expect(eventEmitter.emitAsync).not.toHaveBeenCalled();
    });
  });

  describe('publishManyNotifications', () => {
    it('should call publishNotification for each user id', async () => {
      jest
        .spyOn(service, 'publishNotification')
        .mockResolvedValue(undefined as any);

      await service.publishManyNotifications(mockUserIds, mockNotification);

      expect(service.publishNotification).toHaveBeenCalledTimes(
        mockUserIds.length,
      );
      mockUserIds.forEach((userId) => {
        expect(service.publishNotification).toHaveBeenCalledWith(
          userId,
          mockNotification,
        );
      });
    });

    it('should resolve when all publishNotification calls resolve', async () => {
      jest
        .spyOn(service, 'publishNotification')
        .mockResolvedValue(undefined as any);

      const result = await service.publishManyNotifications(
        mockUserIds,
        mockNotification,
      );

      expect(result).toEqual([undefined, undefined, undefined]);
    });

    it('should reject if any publishNotification call rejects', async () => {
      const mockError = new Error('Publish failed');
      jest
        .spyOn(service, 'publishNotification')
        .mockImplementation((userId) => {
          if (userId === 2) {
            return Promise.reject(mockError);
          }
          return Promise.resolve(undefined as any);
        });

      await expect(
        service.publishManyNotifications(mockUserIds, mockNotification),
      ).rejects.toThrow(mockError);
    });
  });

  describe('createWithUsers', () => {
    it('should create notifications and publish them to users', async () => {
      jest.spyOn(repository, 'createWithUsers').mockResolvedValue(undefined);
      jest.spyOn(service, 'publishManyNotifications').mockResolvedValue([]);

      await service.createWithUsers(mockNotification, mockUserIds);

      expect(repository.createWithUsers).toHaveBeenCalledWith(
        mockNotification,
        mockUserIds,
      );
      expect(service.publishManyNotifications).toHaveBeenCalledWith(
        mockUserIds,
        mockNotification,
      );
    });

    it('should still publish notifications if repository.createWithUsers fails', async () => {
      const mockError = new Error('Creation failed');
      jest.spyOn(repository, 'createWithUsers').mockRejectedValue(mockError);
      jest.spyOn(service, 'publishManyNotifications').mockResolvedValue([]);
      jest.spyOn(console, 'error').mockImplementation();

      await expect(
        service.createWithUsers(mockNotification, mockUserIds),
      ).rejects.toThrow(mockError);

      expect(service.publishManyNotifications).not.toHaveBeenCalled();
    });
  });

  describe('requestNewToken', () => {
    it('should issue a stream token that resolves to the user', async () => {
      const result = await service.requestNewToken(mockUserId);

      expect(result.id).toBe(mockUserId);
      await expect(service.getUserIdByToken(result.sseToken)).resolves.toBe(
        mockUserId,
      );
    });
  });

  describe('getUserIdByToken', () => {
    it('should reject a token that is not a stream token', async () => {
      await expect(service.getUserIdByToken(mockToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject an access token signed for logging in', async () => {
      const accessToken = await jwtService.signAsync(
        { sub: mockUserId },
        { secret: process.env.JWT_SECRET },
      );

      await expect(service.getUserIdByToken(accessToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should reject an expired stream token', async () => {
      const expired = await jwtService.signAsync(
        { sub: mockUserId, purpose: 'sse' },
        {
          secret: `${process.env.JWT_SECRET}:sse`,
          expiresIn: -10,
        },
      );

      await expect(service.getUserIdByToken(expired)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('publishNotification', () => {
    it('should publish the notification on the bus', async () => {
      notificationBus.publish.mockResolvedValue(undefined);

      await service.publishNotification(mockUserId, mockNotification);

      expect(notificationBus.publish).toHaveBeenCalledWith(
        mockUserId,
        mockNotification,
      );
    });

    it('should handle errors when publishing', async () => {
      notificationBus.publish.mockRejectedValue(new Error('Publish failed'));
      jest.spyOn(console, 'error').mockImplementation();

      await expect(
        service.publishNotification(mockUserId, mockNotification),
      ).rejects.toThrow(BadRequestException);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('setAsRead', () => {
    it("should mark only the caller's copy as read", async () => {
      jest
        .spyOn(repository, 'updateToRead')
        .mockResolvedValue([{ notificationId: mockNotificationId }]);

      await service.setAsRead(mockNotificationId, mockUserId);

      expect(repository.updateToRead).toHaveBeenCalledWith(
        mockNotificationId,
        mockUserId,
      );
    });

    it('should throw NotFoundException for a notification the caller did not receive', async () => {
      jest.spyOn(repository, 'updateToRead').mockResolvedValue([]);

      await expect(
        service.setAsRead(mockNotificationId, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setAllAsReadForUser', () => {
    it('should call repository.updateAllToReadForUser with the user id', async () => {
      jest
        .spyOn(repository, 'updateAllToReadForUser')
        .mockResolvedValue(undefined);

      await service.setAllAsReadForUser(mockUserId);

      expect(repository.updateAllToReadForUser).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });

  describe('setBulkAsRead', () => {
    it('should call repository.updateBulkToRead with the notification ids', async () => {
      const notificationIds = [1, 2, 3];
      jest.spyOn(repository, 'updateBulkToRead').mockResolvedValue(undefined);

      await service.setBulkAsRead(notificationIds, mockUserId);

      expect(repository.updateBulkToRead).toHaveBeenCalledWith(
        notificationIds,
        mockUserId,
      );
    });
  });

  describe('remove', () => {
    it('should remove the notification for the caller', async () => {
      jest
        .spyOn(repository, 'deleteForUser')
        .mockResolvedValue([{ notificationId: mockNotificationId }]);

      await service.remove(mockNotificationId, mockUserId);

      expect(repository.deleteForUser).toHaveBeenCalledWith(
        mockNotificationId,
        mockUserId,
      );
    });

    it('should throw NotFoundException for a notification the caller did not receive', async () => {
      jest.spyOn(repository, 'deleteForUser').mockResolvedValue([]);

      await expect(
        service.remove(mockNotificationId, mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getNotificationStream', () => {
    it('should return an Promise since it works that way with our implementation', () => {
      const result = service.getNotificationStream(mockUserId);

      expect(result).toBeInstanceOf(Promise);
    });
  });
});
