import { Test, TestingModule } from '@nestjs/testing';
import { BlockedGroupsService } from '../blocked-groups.service';
import { GroupDrizzleRepository } from 'src/group/group.repository';
import { BadRequestException } from '@nestjs/common';

describe('BlockedGroupsService', () => {
  let service: BlockedGroupsService;
  let repository: GroupDrizzleRepository;

  beforeEach(async () => {
    const mockRepository = {
      checkIfGroupIsBlocked: jest.fn(),
      blockGroup: jest.fn(),
      unblockGroup: jest.fn(),
      getBlockedGroups: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockedGroupsService,
        {
          provide: GroupDrizzleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BlockedGroupsService>(BlockedGroupsService);
    repository = module.get<GroupDrizzleRepository>(GroupDrizzleRepository);
  });

  describe('checkIfGroupIsBlocked', () => {
    const userId = 1;
    const groupId = 1;

    it('should return true if group is blocked', async () => {
      jest.spyOn(repository, 'checkIfGroupIsBlocked').mockResolvedValue(true);

      const result = await service.checkIfGroupIsBlocked(userId, groupId);

      expect(result).toBe(true);
      expect(repository.checkIfGroupIsBlocked).toHaveBeenCalledWith(
        userId,
        groupId,
      );
    });

    it('should return false if group is not blocked', async () => {
      jest.spyOn(repository, 'checkIfGroupIsBlocked').mockResolvedValue(false);

      const result = await service.checkIfGroupIsBlocked(userId, groupId);

      expect(result).toBe(false);
      expect(repository.checkIfGroupIsBlocked).toHaveBeenCalledWith(
        userId,
        groupId,
      );
    });
  });

  describe('blockGroup', () => {
    const userId = 1;
    const groupId = 1;

    it('should block a group if not already blocked', async () => {
      jest.spyOn(repository, 'checkIfGroupIsBlocked').mockResolvedValue(false);
      jest.spyOn(repository, 'blockGroup').mockResolvedValue(undefined);

      await service.blockGroup(userId, groupId);

      expect(repository.blockGroup).toHaveBeenCalledWith(userId, groupId);
    });

    it('should throw BadRequestException if group is already blocked', async () => {
      jest.spyOn(repository, 'checkIfGroupIsBlocked').mockResolvedValue(true);

      await expect(service.blockGroup(userId, groupId)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.blockGroup).not.toHaveBeenCalled();
    });
  });

  describe('unblockGroup', () => {
    const userId = 1;
    const groupId = 1;

    it('should unblock a group if blocked', async () => {
      jest.spyOn(repository, 'checkIfGroupIsBlocked').mockResolvedValue(true);
      jest.spyOn(repository, 'unblockGroup').mockResolvedValue(undefined);

      await service.unblockGroup(userId, groupId);

      expect(repository.unblockGroup).toHaveBeenCalledWith(userId, groupId);
    });

    it('should throw BadRequestException if group is not blocked', async () => {
      jest.spyOn(repository, 'checkIfGroupIsBlocked').mockResolvedValue(false);

      await expect(service.unblockGroup(userId, groupId)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.unblockGroup).not.toHaveBeenCalled();
    });
  });

  describe('getBlockedGroups', () => {
    const userId = 1;
    const page = 1;
    const pageSize = 10;

    it('should return blocked groups', async () => {
      const mockGroups = [
        {
          abbreviation: 'AB',
          id: 1,
          name: 'Group 1',
          country: 'Country 1',
          logo: 'https://example.com/logo1.jpg',
        },
      ];

      jest.spyOn(repository, 'getBlockedGroups').mockResolvedValue(mockGroups);

      const result = await service.getBlockedGroups(userId, page, pageSize);

      expect(result).toEqual(mockGroups);
      expect(repository.getBlockedGroups).toHaveBeenCalledWith(
        userId,
        page,
        pageSize,
      );
    });
  });
});
