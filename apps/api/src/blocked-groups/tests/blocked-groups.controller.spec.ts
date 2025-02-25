import { Test, TestingModule } from '@nestjs/testing';
import { BlockedGroupsController } from '../blocked-groups.controller';
import { BlockedGroupsService } from '../blocked-groups.service';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { userRoleEnum } from '@tournament-app/types';
import { MiniGroupResponseWithCountry } from 'src/group/dto/responses.dto';

describe('BlockedGroupsController', () => {
  let controller: BlockedGroupsController;
  let service: BlockedGroupsService;

  const mockUser: ValidatedUserDto = {
    id: 1,
    email: 'test@example.com',
    role: userRoleEnum.USER,
  };

  beforeEach(async () => {
    const mockService = {
      getBlockedGroups: jest.fn(),
      blockGroup: jest.fn(),
      unblockGroup: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockedGroupsController],
      providers: [
        {
          provide: BlockedGroupsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<BlockedGroupsController>(BlockedGroupsController);
    service = module.get<BlockedGroupsService>(BlockedGroupsService);
  });

  describe('findAll', () => {
    const pagination: PaginationOnly = {
      page: 1,
      pageSize: 10,
    };

    const mockRequest = {
      url: '/blocked-groups',
    } as Request;

    it('should return blocked groups with metadata', async () => {
      const mockResults = [
        {
          abbreviation: 'AB',
          id: 1,
          name: 'Group 1',
          country: 'Country 1',
          logo: 'https://example.com/logo1.jpg',
        },
      ] satisfies MiniGroupResponseWithCountry[];

      jest.spyOn(service, 'getBlockedGroups').mockResolvedValue(mockResults);

      const result = await controller.findAll(
        pagination,
        mockUser,
        mockRequest,
      );

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('metadata');
      expect(result.results).toEqual(mockResults);
      expect(service.getBlockedGroups).toHaveBeenCalledWith(
        mockUser.id,
        pagination.page,
        pagination.pageSize,
      );
    });
  });

  describe('block', () => {
    const groupId = 1;

    it('should block a group', async () => {
      jest.spyOn(service, 'blockGroup').mockResolvedValue(undefined);

      await controller.block(mockUser, groupId);

      expect(service.blockGroup).toHaveBeenCalledWith(mockUser.id, groupId);
    });
  });

  describe('unblock', () => {
    const groupId = 1;

    it('should unblock a group', async () => {
      jest.spyOn(service, 'unblockGroup').mockResolvedValue(undefined);

      await controller.unblock(mockUser, groupId);

      expect(service.unblockGroup).toHaveBeenCalledWith(mockUser.id, groupId);
    });
  });
});
