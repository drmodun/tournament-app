import { Test, TestingModule } from '@nestjs/testing';
import { BlockedUsersService } from '../blocked-users.service';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { BadRequestException } from '@nestjs/common';

describe('BlockedUsersService', () => {
  let service: BlockedUsersService;
  let repository: UserDrizzleRepository;

  beforeEach(async () => {
    const mockRepository = {
      checkIfUserIsBlocked: jest.fn(),
      blockUser: jest.fn(),
      unblockUser: jest.fn(),
      getBlockedUsers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockedUsersService,
        {
          provide: UserDrizzleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BlockedUsersService>(BlockedUsersService);
    repository = module.get<UserDrizzleRepository>(UserDrizzleRepository);
  });

  describe('checkIfUserIsBlocked', () => {
    const groupId = 1;
    const userId = 1;

    it('should return true if user is blocked', async () => {
      jest.spyOn(repository, 'checkIfUserIsBlocked').mockResolvedValue(true);

      const result = await service.checkIfUserIsBlocked(groupId, userId);

      expect(result).toBe(true);
      expect(repository.checkIfUserIsBlocked).toHaveBeenCalledWith(
        groupId,
        userId,
      );
    });

    it('should return false if user is not blocked', async () => {
      jest.spyOn(repository, 'checkIfUserIsBlocked').mockResolvedValue(false);

      const result = await service.checkIfUserIsBlocked(groupId, userId);

      expect(result).toBe(false);
      expect(repository.checkIfUserIsBlocked).toHaveBeenCalledWith(
        groupId,
        userId,
      );
    });
  });

  describe('blockUser', () => {
    const groupId = 1;
    const userId = 1;
    it('should block a user if not already blocked', async () => {
      jest.spyOn(repository, 'checkIfUserIsBlocked').mockResolvedValue(false);
      jest.spyOn(repository, 'blockUser').mockResolvedValue(undefined);

      await service.blockUser(groupId, userId);

      expect(repository.blockUser).toHaveBeenCalledWith(groupId, userId);
    });

    it('should throw BadRequestException if user is already blocked', async () => {
      jest.spyOn(repository, 'checkIfUserIsBlocked').mockResolvedValue(true);

      await expect(service.blockUser(groupId, userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.blockUser).not.toHaveBeenCalled();
    });
  });

  describe('unblockUser', () => {
    const groupId = 1;
    const userId = 1;
    it('should unblock a user if blocked', async () => {
      jest.spyOn(repository, 'checkIfUserIsBlocked').mockResolvedValue(true);
      jest.spyOn(repository, 'unblockUser').mockResolvedValue(undefined);

      await service.unblockUser(groupId, userId);

      expect(repository.unblockUser).toHaveBeenCalledWith(groupId, userId);
    });

    it('should throw BadRequestException if user is not blocked', async () => {
      jest.spyOn(repository, 'checkIfUserIsBlocked').mockResolvedValue(false);

      await expect(service.unblockUser(groupId, userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.unblockUser).not.toHaveBeenCalled();
    });
  });

  describe('getBlockedUsers', () => {
    const groupId = 1;
    const page = 1;
    const pageSize = 10;

    it('should return blocked users', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'User 1',
          email: 'user1@example.com',
          country: 'Country 1',
          profilePic: 'https://example.com/user1.jpg',
        },
        {
          id: 2,
          username: 'User 1',
          email: 'user1@example.com',
          country: 'Country 1',
          profilePic: 'https://example.com/user1.jpg',
        },
      ];

      jest.spyOn(repository, 'getBlockedUsers').mockResolvedValue(mockUsers);

      const result = await service.getBlockedUsers(groupId, page, pageSize);

      expect(result).toEqual(mockUsers);
      expect(repository.getBlockedUsers).toHaveBeenCalledWith(
        groupId,
        page,
        pageSize,
      );
    });
  });
});
