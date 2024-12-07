import { Test, TestingModule } from '@nestjs/testing';
import { GroupJoinRequestsService } from '../group-join-requests.service';
import { GroupJoinRequestDrizzleRepository } from '../group-join-requests.repository';
import { GroupMembershipService } from '../../group-membership/group-membership.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GroupJoinRequestResponsesEnum } from '@tournament-app/types';
import { GroupService } from 'src/group/group.service';

describe('GroupJoinRequestsService', () => {
  let service: GroupJoinRequestsService;
  let repository: GroupJoinRequestDrizzleRepository;

  const mockRepository = {
    createEntity: jest.fn(),
    getQuery: jest.fn(),
    getSingleQuery: jest.fn(),
    updateEntity: jest.fn(),
    deleteEntity: jest.fn(),
    checkIfGroupIsPublic: jest.fn(),
  };

  const mockGroupMembershipService = {
    create: jest.fn(),
  };

  const mockGroupService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupJoinRequestsService,
        {
          provide: GroupJoinRequestDrizzleRepository,
          useValue: mockRepository,
        },
        {
          provide: GroupMembershipService,
          useValue: mockGroupMembershipService,
        },
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
      ],
    }).compile();

    service = module.get<GroupJoinRequestsService>(GroupJoinRequestsService);
    repository = module.get<GroupJoinRequestDrizzleRepository>(
      GroupJoinRequestDrizzleRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a group join request', async () => {
      const createDto = {
        message: 'test message',
        relatedLFPId: 1,
      };

      service.checkIfGroupIsPublic = jest.fn().mockResolvedValue(false);
      await service.create(1, 1, createDto);

      expect(repository.createEntity).toHaveBeenCalledWith({
        groupId: 1,
        userId: 1,
        message: createDto.message,
        relatedLFPId: createDto.relatedLFPId,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of group join requests', async () => {
      const result = [{ id: 1, message: 'test' }];
      mockRepository.getQuery.mockResolvedValue(result);

      expect(await service.findAll({})).toBe(result);
      expect(repository.getQuery).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a group join request', async () => {
      const result = { id: 1, message: 'test' };
      mockRepository.getSingleQuery.mockResolvedValue([result]);

      expect(
        await service.findOne(1, 1, GroupJoinRequestResponsesEnum.WITH_USER),
      ).toBe(result);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        {
          userId: 1,
          groupId: 1,
        },
        GroupJoinRequestResponsesEnum.WITH_USER,
      );
    });

    it('should throw NotFoundException when group join request not found', async () => {
      service.findOne = jest.fn().mockImplementation(() => {
        return Promise.reject(new NotFoundException());
      });

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a group join request', async () => {
      const updateDto = {
        message: 'updated message',
      };

      await service.update(1, 1, updateDto);

      expect(repository.updateEntity).toHaveBeenCalledWith(
        {
          userId: 1,
          groupId: 1,
        },
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a group join request', async () => {
      await service.remove(1, 1);

      expect(repository.deleteEntity).toHaveBeenCalledWith({
        userId: 1,
        groupId: 1,
      });
    });
  });

  describe('accept', () => {
    it('should throw NotFoundException when request does not exist', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.accept(1, 1)).rejects.toThrow(BadRequestException);
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith({
        userId: 1,
        groupId: 1,
      });
    });

    it('should accept a group join request', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([{ id: 1 }]);

      await service.accept(1, 1);

      expect(mockGroupMembershipService.create).toHaveBeenCalledWith(1, 1);
      expect(mockRepository.deleteEntity).toHaveBeenCalledWith({
        userId: 1,
        groupId: 1,
      });
    });
  });

  describe('reject', () => {
    it('should throw NotFoundException when request does not exist', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.reject(1, 1)).rejects.toThrow(NotFoundException);
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith({
        userId: 1,
        groupId: 1,
      });
    });

    it('should reject a group join request', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([{ id: 1 }]);

      await service.reject(1, 1);

      expect(mockRepository.deleteEntity).toHaveBeenCalledWith({
        userId: 1,
        groupId: 1,
      });
    });
  });
});
