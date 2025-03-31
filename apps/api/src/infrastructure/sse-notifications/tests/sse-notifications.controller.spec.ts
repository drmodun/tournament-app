import { Test, TestingModule } from '@nestjs/testing';
import { SseNotificationsController } from '../sse-notifications.controller';
import { SseNotificationsService } from '../sse-notifications.service';
import { notificationTypeEnum } from '@tournament-app/types';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { NotificationQueryDto } from '../dto/requests';
import { NotificationCreateDto } from '../../types';

describe('SseNotificationsController', () => {
  let controller: SseNotificationsController;
  let service: SseNotificationsService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
  };

  const mockNotification: NotificationCreateDto = {
    type: notificationTypeEnum.TOURNAMENT_START,
    message: 'Your tournament is starting now!',
    link: '/tournaments/123',
    image: 'https://example.com/tournament-image.jpg',
  };

  const mockToken = 'mock-token';
  const mockNotificationId = 1;
  const mockUserIds = [1, 2, 3];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SseNotificationsController],
      providers: [
        {
          provide: SseNotificationsService,
          useValue: {
            findAllForUser: jest.fn(),
            createWithUsers: jest.fn(),
            requestNewToken: jest.fn(),
            getUserIdByToken: jest.fn(),
            setAsRead: jest.fn(),
            setAllAsReadForUser: jest.fn(),
            setBulkAsRead: jest.fn(),
            remove: jest.fn(),
            getNotificationStream: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SseNotificationsController>(
      SseNotificationsController,
    );
    service = module.get<SseNotificationsService>(SseNotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAllForUser with correct parameters', async () => {
      const mockQuery: NotificationQueryDto = { page: 1, pageSize: 10 };
      const mockResult = [{ notification: mockNotification, isRead: false }];

      jest.spyOn(service, 'findAllForUser').mockResolvedValue(mockResult);

      const result = await controller.findAll(mockUser, mockQuery);

      expect(service.findAllForUser).toHaveBeenCalledWith({
        ...mockQuery,
        userId: mockUser.id,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('requestNewToken', () => {
    it('should call service.requestNewToken with user id', async () => {
      const mockUpdatedUser = { id: mockUser.id, sseToken: 'new-token' };

      jest.spyOn(service, 'requestNewToken').mockResolvedValue(mockUpdatedUser);

      const result = await controller.requestNewToken(mockUser);

      expect(service.requestNewToken).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('markAsRead', () => {
    it('should call service.setAsRead with notification id', async () => {
      jest.spyOn(service, 'setAsRead').mockResolvedValue(undefined);

      await controller.markAsRead(mockNotificationId);

      expect(service.setAsRead).toHaveBeenCalledWith(mockNotificationId);
    });
  });

  describe('markAllAsRead', () => {
    it('should call service.setAllAsReadForUser with user id', async () => {
      jest.spyOn(service, 'setAllAsReadForUser').mockResolvedValue(undefined);

      await controller.markAllAsRead(mockUser);

      expect(service.setAllAsReadForUser).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('markBulkAsRead', () => {
    it('should call service.setBulkAsRead with notification ids', async () => {
      const notificationIds = [1, 2, 3];

      jest.spyOn(service, 'setBulkAsRead').mockResolvedValue(undefined);

      await controller.markBulkAsRead(notificationIds);

      expect(service.setBulkAsRead).toHaveBeenCalledWith(notificationIds);
    });
  });

  describe('remove', () => {
    it('should call service.remove with notification id', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove(mockNotificationId);

      expect(service.remove).toHaveBeenCalledWith(mockNotificationId);
    });
  });

  describe('getNotificationStream', () => {
    it('should throw UnauthorizedException when token is missing', async () => {
      await expect(controller.getNotificationStream('')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should call service.getUserIdByToken with token and return stream', async () => {
      const mockObservable = new Observable<MessageEvent>();

      jest.spyOn(service, 'getUserIdByToken').mockResolvedValue(mockUser.id);
      jest
        .spyOn(service, 'getNotificationStream')
        .mockReturnValue(mockObservable);

      const result = await controller.getNotificationStream(mockToken);

      expect(service.getUserIdByToken).toHaveBeenCalledWith(mockToken);
      expect(service.getNotificationStream).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBe(mockObservable);
    });
  });
});
