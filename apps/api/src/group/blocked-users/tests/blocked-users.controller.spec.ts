import { Test, TestingModule } from '@nestjs/testing';
import { BlockedUsersController } from '../blocked-users.controller';
import { BlockedUsersService } from '../blocked-users.service';
import { PaginationOnly } from 'src/base/query/baseQuery';

describe('BlockedUsersController', () => {
  let controller: BlockedUsersController;
  let service: BlockedUsersService;

  beforeEach(async () => {
    const mockService = {
      getBlockedUsers: jest.fn(),
      blockUser: jest.fn(),
      unblockUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockedUsersController],
      providers: [
        {
          provide: BlockedUsersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<BlockedUsersController>(BlockedUsersController);
    service = module.get<BlockedUsersService>(BlockedUsersService);
  });

  describe('findAll', () => {
    const groupId = 1;
    const pagination: PaginationOnly = {
      page: 1,
      pageSize: 10,
    };

    const mockRequest = {
      url: '/groups/1/blocked-users',
    } as Request;

    it('should return blocked users with metadata', async () => {
      const mockResults = [
        {
          id: 1,
          username: 'User 1',
          email: 'user1@example.com',
          country: 'Country 1',
          profilePic: 'https://example.com/user1.jpg',
        },
      ];

      jest.spyOn(service, 'getBlockedUsers').mockResolvedValue(mockResults);

      const result = await controller.findAll(pagination, groupId, mockRequest);

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('metadata');
      expect(result.results).toEqual(mockResults);
      expect(service.getBlockedUsers).toHaveBeenCalledWith(
        groupId,
        pagination.page,
        pagination.pageSize,
      );
    });
  });

  describe('block', () => {
    const groupId = 1;
    const userId = 2;

    it('should block a user', async () => {
      jest.spyOn(service, 'blockUser').mockResolvedValue(undefined);

      await controller.block(groupId, userId);

      expect(service.blockUser).toHaveBeenCalledWith(groupId, userId);
    });
  });

  describe('unblock', () => {
    const groupId = 1;
    const userId = 2;

    it('should unblock a user', async () => {
      jest.spyOn(service, 'unblockUser').mockResolvedValue(undefined);

      await controller.unblock(groupId, userId);

      expect(service.unblockUser).toHaveBeenCalledWith(groupId, userId);
    });
  });
});
