import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from '../group.service';
import { GroupDrizzleRepository } from '../group.repository';
import { GroupMembershipService } from '../../group-membership/group-membership.service';
import { CreateGroupRequest, UpdateGroupRequest } from '../dto/requests.dto';
import {
  GroupResponsesEnum,
  groupTypeEnum,
  groupFocusEnum,
} from '@tournament-app/types';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

describe('GroupService', () => {
  let service: GroupService;

  const mockRepository = {
    createEntityWithUser: jest.fn(),
    getQuery: jest.fn(),
    getSingleQuery: jest.fn(),
    updateEntity: jest.fn(),
    deleteEntity: jest.fn(),
    getGroupTournaments: jest.fn(),
    getGroupFollowers: jest.fn(),
  };

  const mockGroupMembershipService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: GroupDrizzleRepository,
          useValue: mockRepository,
        },
        {
          provide: GroupMembershipService,
          useValue: mockGroupMembershipService,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateGroupRequest = {
      name: 'Test Group',
      abbreviation: 'TG',
      description: 'Test Description',
      type: groupTypeEnum.PRIVATE,
      focus: groupFocusEnum.HYBRID,
      logo: 'logo.png',
      location: 'Test Location',
      country: 'Test Country',
    };
    const userId = 1;

    it('should create a group successfully', async () => {
      const createdGroup = { id: 1, ...createDto };
      mockRepository.createEntityWithUser.mockResolvedValue([createdGroup]);
      mockRepository.getSingleQuery.mockResolvedValue([createdGroup]);

      const result = await service.create(createDto, userId);
      expect(result).toEqual(createdGroup);
      expect(mockRepository.createEntityWithUser).toHaveBeenCalledWith({
        ...createDto,
        userId,
      });
    });

    it('should throw UnprocessableEntityException when creation fails', async () => {
      mockRepository.createEntityWithUser.mockResolvedValue([]);

      await expect(service.create(createDto, userId)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('findAll', () => {
    const query = { type: groupTypeEnum.PRIVATE };

    it('should return array of groups', async () => {
      const groups = [{ id: 1, name: 'Test Group' }];
      mockRepository.getQuery.mockReturnValue(Promise.resolve(groups));

      const result = await service.findAll(query);
      expect(result).toEqual(groups);
      expect(mockRepository.getQuery).toHaveBeenCalledWith({
        ...query,
        responseType: GroupResponsesEnum.BASE,
      });
    });
  });

  describe('findOne', () => {
    const id = 1;

    it('should return a group', async () => {
      const group = { id: 1, name: 'Test Group' };
      mockRepository.getSingleQuery.mockResolvedValue([group]);

      const result = await service.findOne(id);
      expect(result).toEqual(group);
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith(
        id,
        GroupResponsesEnum.BASE,
      );
    });

    it('should throw NotFoundException when group not found', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const id = 1;
    const updateDto: UpdateGroupRequest = { name: 'Updated Group Name' };

    it('should update a group successfully', async () => {
      const updatedGroup = { id, ...updateDto };
      mockRepository.getSingleQuery.mockResolvedValue([
        { id: 1, name: 'Test Group' },
      ]);
      mockRepository.updateEntity.mockResolvedValue([updatedGroup]);
      mockRepository.getSingleQuery.mockResolvedValue([updatedGroup]);

      const result = await service.update(id, updateDto);
      expect(result).toEqual(updatedGroup);
      expect(mockRepository.updateEntity).toHaveBeenCalledWith(id, updateDto);
    });

    it('should throw UnprocessableEntityException when update fails', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([
        { id: 1, name: 'Test Group' },
      ]);
      mockRepository.updateEntity.mockResolvedValue([]);

      await expect(service.update(id, updateDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw NotFoundException when group not found', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    const id = 1;

    it('should remove a group successfully', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([
        { id: 1, name: 'Test Group' },
      ]);
      mockRepository.deleteEntity.mockResolvedValue([{ id }]);

      const result = await service.remove(id);
      expect(result).toEqual({ success: true, id });
      expect(mockRepository.deleteEntity).toHaveBeenCalledWith(id);
    });

    it('should throw UnprocessableEntityException when removal fails', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([
        { id: 1, name: 'Test Group' },
      ]);
      mockRepository.deleteEntity.mockResolvedValue([]);

      await expect(service.remove(id)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('should throw NotFoundException when group not found', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getGroupMembers', () => {
    const id = 1;

    it('should return group members', async () => {
      const group = { id: 1, name: 'Test Group' };
      const members = [{ id: 1, userId: 1, role: 'admin' }];
      mockRepository.getSingleQuery.mockResolvedValue([group]);
      mockGroupMembershipService.findAll.mockResolvedValue(members);

      const result = await service.getGroupMembers(id);
      expect(result).toEqual({ group, members });
      expect(mockGroupMembershipService.findAll).toHaveBeenCalled();
    });

    it('should throw NotFoundException when group not found', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.getGroupMembers(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getGroupTournaments', () => {
    const id = 1;

    it('should return group tournaments', async () => {
      const group = { id: 1, name: 'Test Group' };
      const tournaments = [{ id: 1, name: 'Tournament 1' }];
      mockRepository.getSingleQuery.mockResolvedValue([group]);
      mockRepository.getGroupTournaments.mockResolvedValue(tournaments);

      const result = await service.getGroupTournaments(id);
      expect(result).toEqual({ group, tournaments });
      expect(mockRepository.getGroupTournaments).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when group not found', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.getGroupTournaments(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getGroupFollowers', () => {
    const id = 1;

    it('should return group followers', async () => {
      const group = { id: 1, name: 'Test Group' };
      const followers = [{ id: 1, name: 'Follower 1' }];
      mockRepository.getSingleQuery.mockResolvedValue([group]);
      mockRepository.getGroupFollowers.mockResolvedValue(followers);

      const result = await service.getGroupFollowers(id);
      expect(result).toEqual({ group, followers });
      expect(mockRepository.getGroupFollowers).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when group not found', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.getGroupFollowers(id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
