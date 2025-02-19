import { Test, TestingModule } from '@nestjs/testing';
import { FollowersService } from '../followers.service';
import { FollowerDrizzleRepository } from '../followers.repository';
import { NotFoundException } from '@nestjs/common';
import { FollowerResponsesEnum } from '@tournament-app/types';

describe('FollowersService', () => {
  let service: FollowersService;
  let repository: FollowerDrizzleRepository;

  const mockRepository = {
    createEntity: jest.fn(),
    getQuery: jest.fn(),
    getSingleQuery: jest.fn(),
    deleteEntity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowersService,
        {
          provide: FollowerDrizzleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FollowersService>(FollowersService);
    repository = module.get<FollowerDrizzleRepository>(
      FollowerDrizzleRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a follower relationship', async () => {
      const userId = 1;
      const followerId = 2;

      await service.create(userId, followerId);

      expect(repository.createEntity).toHaveBeenCalledWith({
        userId,
        followerId,
      });
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
});
