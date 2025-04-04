import { Test, TestingModule } from '@nestjs/testing';
import { FollowersService } from '../followers.service';
import { FollowerDrizzleRepository } from '../followers.repository';
import { NotFoundException } from '@nestjs/common';
import {
  FollowerResponsesEnum,
  notificationTypeEnum,
} from '@tournament-app/types';
import { SseNotificationsService } from '../../infrastructure/sse-notifications/sse-notifications.service';
import { NotificationTemplatesFiller } from '../../infrastructure/firebase-notifications/templates';
import { TemplatesEnum } from '../../infrastructure/types';

describe('FollowersService', () => {
  let service: FollowersService;
  let repository: FollowerDrizzleRepository;
  let notificationService: SseNotificationsService;
  let notificationTemplatesFiller: NotificationTemplatesFiller;

  const mockRepository = {
    createEntity: jest.fn(),
    getQuery: jest.fn(),
    getSingleQuery: jest.fn(),
    deleteEntity: jest.fn(),
    autoCompleteFollowers: jest.fn(),
    autoCompleteFollowing: jest.fn(),
  };

  const mockNotificationService = {
    createWithUsers: jest.fn(),
  };

  const mockNotificationTemplatesFiller = {
    fill: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowersService,
        {
          provide: FollowerDrizzleRepository,
          useValue: mockRepository,
        },
        {
          provide: SseNotificationsService,
          useValue: mockNotificationService,
        },
        {
          provide: NotificationTemplatesFiller,
          useValue: mockNotificationTemplatesFiller,
        },
      ],
    }).compile();

    service = module.get<FollowersService>(FollowersService);
    repository = module.get<FollowerDrizzleRepository>(
      FollowerDrizzleRepository,
    );
    notificationService = module.get<SseNotificationsService>(
      SseNotificationsService,
    );
    notificationTemplatesFiller = module.get<NotificationTemplatesFiller>(
      NotificationTemplatesFiller,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a follower relationship and emit notifications', async () => {
      const userId = 1;
      const followerId = 2;
      const mockFollower = {
        id: 1,
        username: 'TestUser',
        profilePicture: 'pic.jpg',
      };

      mockRepository.getSingleQuery.mockResolvedValue([mockFollower]);
      mockNotificationTemplatesFiller.fill.mockReturnValue(
        'Test User is now following you',
      );

      await service.create(userId, followerId);

      expect(repository.createEntity).toHaveBeenCalledWith({
        userId,
        followerId,
      });

      // Verify notification was created
      expect(notificationService.createWithUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          type: notificationTypeEnum.NEW_FOLLOWER,
          message: 'Test User is now following you',
          link: `/user/${userId}`,
          image: mockFollower.profilePicture,
        }),
        [userId],
      );
    });

    it('should throw error when trying to follow self', async () => {
      const userId = 1;
      const followerId = 1;

      await expect(service.create(userId, followerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return array of followers', async () => {
      const mockFollowers = [{ id: 1, name: 'Test User' }];
      mockRepository.getQuery.mockResolvedValue(mockFollowers);

      const query = { page: 1, pageSize: 10 };
      const result = await service.findAll(query);

      expect(result).toEqual(mockFollowers);
      expect(repository.getQuery).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a follower relationship', async () => {
      const mockFollower = { id: 1, name: 'Test User' };
      mockRepository.getSingleQuery.mockResolvedValue([mockFollower]);

      const userId = 1;
      const followerId = 2;
      const result = await service.findOne(userId, followerId);

      expect(result).toEqual(mockFollower);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        { userId, followerId },
        FollowerResponsesEnum.FOLLOWER_MINI,
      );
    });

    it('should throw error when follower relationship not found', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      const userId = 1;
      const followerId = 2;

      await expect(service.findOne(userId, followerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a follower relationship', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([{ id: 1 }]);

      const userId = 1;
      const followerId = 2;

      await service.remove(userId, followerId);

      expect(repository.deleteEntity).toHaveBeenCalledWith({
        userId,
        followerId,
      });
    });

    it('should throw error when trying to remove non-existent relationship', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      const userId = 1;
      const followerId = 2;

      await expect(service.remove(userId, followerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('autoCompleteFollowers', () => {
    it('should call repository with correct parameters', async () => {
      const search = 'test';
      const userId = 1;
      const pagination = { page: 1, pageSize: 10 };

      mockRepository.autoCompleteFollowers.mockResolvedValue([]);

      await service.autoCompleteFollowers(search, userId, pagination);

      expect(repository.autoCompleteFollowers).toHaveBeenCalledWith(
        search,
        userId,
        pagination,
      );
    });
  });

  describe('autoCompleteFollowing', () => {
    it('should call repository with correct parameters', async () => {
      const search = 'test';
      const userId = 1;
      const pagination = { page: 1, pageSize: 10 };

      mockRepository.autoCompleteFollowing.mockResolvedValue([]);

      await service.autoCompleteFollowing(search, userId, pagination);

      expect(repository.autoCompleteFollowing).toHaveBeenCalledWith(
        search,
        userId,
        pagination,
      );
    });
  });

  describe('createNotificationBodyForNewFollower', () => {
    it('should create a notification body with correct data', async () => {
      const userId = 1;
      const followerId = 2;
      const mockFollower = {
        id: 2,
        username: 'Follower',
        profilePicture: 'profile.jpg',
      };

      mockRepository.getSingleQuery.mockResolvedValue([mockFollower]);
      mockNotificationTemplatesFiller.fill.mockReturnValue(
        'Follower is now following you',
      );

      const result = await service.createNotificationBodyForNewFollower(
        userId,
        followerId,
      );

      expect(result).toEqual({
        type: notificationTypeEnum.NEW_FOLLOWER,
        message: 'Follower is now following you',
        link: `/user/${userId}`,
        image: 'profile.jpg',
      });

      expect(notificationTemplatesFiller.fill).toHaveBeenCalledWith(
        TemplatesEnum.NEW_FOLLOWER,
        {
          follower: mockFollower.username,
        },
      );
    });
  });

  describe('saveAndEmitNotificationsForNewFollower', () => {
    it('should create and emit notifications for new follower', async () => {
      const userId = 1;
      const followerId = 2;
      const mockNotification = {
        type: notificationTypeEnum.NEW_FOLLOWER,
        message: 'Test message',
        link: '/user/1',
        image: 'image.jpg',
      };

      jest
        .spyOn(service, 'createNotificationBodyForNewFollower')
        .mockResolvedValue(mockNotification);

      await service.saveAndEmitNotificationsForNewFollower(userId, followerId);

      expect(service.createNotificationBodyForNewFollower).toHaveBeenCalledWith(
        userId,
        followerId,
      );
      expect(notificationService.createWithUsers).toHaveBeenCalledWith(
        mockNotification,
        [userId],
      );
    });
  });
});
