import { Test, TestingModule } from '@nestjs/testing';
import { FollowersController } from '../followers.controller';
import { FollowersService } from '../followers.service';
import { Request } from 'express';
import { userRoleEnum } from '@tournament-app/types';

describe('FollowersController', () => {
  let controller: FollowersController;
  let service: FollowersService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowersController],
      providers: [
        {
          provide: FollowersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FollowersController>(FollowersController);
    service = module.get<FollowersService>(FollowersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return followers with metadata', async () => {
      const mockFollowers = [{ id: 1, name: 'Test User' }];
      mockService.findAll.mockResolvedValue(mockFollowers);

      const query = { page: 1, pageSize: 10 };
      const mockRequest = { url: '/followers' } as Request;

      const result = await controller.findAll(query, mockRequest);

      expect(result.results).toEqual(mockFollowers);
      expect(result.metadata).toBeDefined();
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single follower relationship', async () => {
      const mockFollower = { id: 1, name: 'Test User' };
      mockService.findOne.mockResolvedValue(mockFollower);

      const userId = 1;
      const followerId = 2;

      const result = await controller.findOne(userId, followerId);

      expect(result).toEqual(mockFollower);
      expect(service.findOne).toHaveBeenCalledWith(userId, followerId);
    });
  });

  describe('create', () => {
    it('should create a follower relationship', async () => {
      const userId = 1;
      const currentUser = {
        id: 2,
        email: 'test@example.com',
        role: userRoleEnum.USER,
      };

      await controller.create(userId, currentUser);

      expect(service.create).toHaveBeenCalledWith(userId, currentUser.id);
    });
  });

  describe('remove', () => {
    it('should remove a follower relationship', async () => {
      const userId = 1;
      const currentUser = {
        id: 2,
        email: 'test@example.com',
        role: userRoleEnum.USER,
      };

      await controller.remove(userId, currentUser);

      expect(service.remove).toHaveBeenCalledWith(userId, currentUser.id);
    });
  });
});
