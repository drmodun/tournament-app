import { Test, TestingModule } from '@nestjs/testing';
import { SseNotificationsService } from '../sse-notifications.service';
import { SseNotificationRepository } from '../sse-notification.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationCreateDto } from '../../types';
import { BadRequestException } from '@nestjs/common';
import { notificationTypeEnum } from '@tournament-app/types';
import { Observable } from 'rxjs';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emitAsync: jest.fn(),
            on: jest.fn(),
          },
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
    it('should update user token and return the updated user', async () => {
      const mockUpdatedUser = { id: mockUserId, sseToken: 'new-token' };
      jest
        .spyOn(repository, 'updateUserToken')
        .mockResolvedValue(mockUpdatedUser);

      const result = await service.requestNewToken(mockUserId);

      expect(repository.updateUserToken).toHaveBeenCalledWith(
        mockUserId,
        expect.any(String),
      );
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('getUserIdByToken', () => {
    it('should return the user id when token is valid', async () => {
      jest
        .spyOn(repository, 'getUserByToken')
        .mockResolvedValue([{ id: mockUserId }]);

      const result = await service.getUserIdByToken(mockToken);

      expect(repository.getUserByToken).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(mockUserId);
    });

    it('should throw BadRequestException when token is invalid', async () => {
      jest.spyOn(repository, 'getUserByToken').mockResolvedValue([]);

      await expect(service.getUserIdByToken(mockToken)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('publishNotification', () => {
    it('should emit notification to user', async () => {
      jest
        .spyOn(eventEmitter, 'emitAsync')
        .mockResolvedValue(Promise.resolve([]));

      await service.publishNotification(mockUserId, mockNotification);

      expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
        mockUserId.toString(),
        mockNotification,
      );
    });

    it('should handle errors when emitting notification', async () => {
      const mockError = new Error('Emit failed');
      jest.spyOn(eventEmitter, 'emitAsync').mockRejectedValue(mockError);
      jest.spyOn(console, 'error').mockImplementation();

      await expect(
        service.publishNotification(mockUserId, mockNotification),
      ).rejects.toThrow(BadRequestException);

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('setAsRead', () => {
    it('should call repository.updateToRead with the notification id', async () => {
      jest.spyOn(repository, 'updateToRead').mockResolvedValue(undefined);

      await service.setAsRead(mockNotificationId);

      expect(repository.updateToRead).toHaveBeenCalledWith(mockNotificationId);
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

      await service.setBulkAsRead(notificationIds);

      expect(repository.updateBulkToRead).toHaveBeenCalledWith(notificationIds);
    });
  });

  describe('remove', () => {
    it('should call repository.deleteEntity with the notification id', async () => {
      jest.spyOn(repository, 'deleteEntity').mockResolvedValue(undefined);

      await service.remove(mockNotificationId);

      expect(repository.deleteEntity).toHaveBeenCalledWith(mockNotificationId);
    });
  });

  describe('getNotificationStream', () => {
    it('should return an Observable', () => {
      const result = service.getNotificationStream(mockUserId);

      expect(result).toBeInstanceOf(Observable);
    });
  });
});
