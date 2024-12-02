import { Test, TestingModule } from '@nestjs/testing';
import { GroupMembershipService } from './group-membership.service';
import { GroupMembershipDrizzleRepository } from './group-membership.repository';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { GroupMembershipResponsesEnum, GroupMembershipRoleEnum } from '@tournament-app/types';

describe('GroupMembershipService', () => {
  let service: GroupMembershipService;
  let repository: GroupMembershipDrizzleRepository;

  const mockRepository = {
    createEntity: jest.fn(),
    getQuery: jest.fn(),
    getSingleQuery: jest.fn(),
    updateEntity: jest.fn(),
    deleteEntity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupMembershipService,
        {
          provide: GroupMembershipDrizzleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GroupMembershipService>(GroupMembershipService);
    repository = module.get<GroupMembershipDrizzleRepository>(GroupMembershipDrizzleRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      userId: 1,
      groupId: 1,
      role: GroupMembershipRoleEnum.MEMBER,
    };

    it('should create a group membership successfully', async () => {
      const expectedResult = { id: 1, ...createDto };
      mockRepository.createEntity.mockResolvedValue([expectedResult]);

      const result = await service.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.createEntity).toHaveBeenCalledWith(createDto);
    });

    it('should throw UnprocessableEntityException when creation fails', async () => {
      mockRepository.createEntity.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('findAll', () => {
    const query = { groupId: 1, role: GroupMembershipRoleEnum.MEMBER };

    it('should return array of group memberships', async () => {
      const expectedResult = [{ id: 1, userId: 1, groupId: 1, role: GroupMembershipRoleEnum.MEMBER }];
      mockRepository.getQuery.mockResolvedValue(expectedResult);

      const result = await service.findAll(query);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.getQuery).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    const id = 1;
    const responseType = GroupMembershipResponsesEnum.BASE;

    it('should return a group membership', async () => {
      const expectedResult = { id: 1, userId: 1, groupId: 1, role: GroupMembershipRoleEnum.MEMBER };
      mockRepository.getSingleQuery.mockResolvedValue([expectedResult]);

      const result = await service.findOne(id, responseType);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith(id, responseType);
    });

    it('should throw NotFoundException when group membership not found', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.findOne(id, responseType)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const id = 1;
    const updateDto = { role: GroupMembershipRoleEnum.ADMIN };

    it('should update a group membership successfully', async () => {
      const expectedResult = { id, userId: 1, groupId: 1, ...updateDto };
      mockRepository.updateEntity.mockResolvedValue([expectedResult]);

      const result = await service.update(id, updateDto);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.updateEntity).toHaveBeenCalledWith(id, updateDto);
    });

    it('should throw NotFoundException when update fails', async () => {
      mockRepository.updateEntity.mockResolvedValue([]);

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    const id = 1;

    it('should remove a group membership successfully', async () => {
      const expectedResult = { id, userId: 1, groupId: 1, role: GroupMembershipRoleEnum.MEMBER };
      mockRepository.deleteEntity.mockResolvedValue([expectedResult]);

      const result = await service.remove(id);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.deleteEntity).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when removal fails', async () => {
      mockRepository.deleteEntity.mockResolvedValue([]);

      await expect(service.remove(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
