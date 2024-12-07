import { Test, TestingModule } from '@nestjs/testing';
import { GroupInvitesService } from '../group-invites.service';
import { GroupInviteDrizzleRepository } from '../group-invites.repository';
import { GroupMembershipService } from '../../group-membership/group-membership.service';
import { GroupInviteResponsesEnum } from '@tournament-app/types';
import { BadRequestException } from '@nestjs/common';

describe('GroupInvitesService', () => {
  let service: GroupInvitesService;
  let repository: GroupInviteDrizzleRepository;

  const mockRepository = {
    createEntity: jest.fn(),
    getQuery: jest.fn(),
    getSingleQuery: jest.fn(),
    updateEntity: jest.fn(),
    deleteEntity: jest.fn(),
  };

  const mockGroupMembershipService = {
    entityExists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupInvitesService,
        {
          provide: GroupInviteDrizzleRepository,
          useValue: mockRepository,
        },
        {
          provide: GroupMembershipService,
          useValue: mockGroupMembershipService,
        },
      ],
    }).compile();

    service = module.get<GroupInvitesService>(GroupInvitesService);
    repository = module.get<GroupInviteDrizzleRepository>(
      GroupInviteDrizzleRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a group invite', async () => {
      const createDto = {
        message: 'test message',
      };

      mockGroupMembershipService.entityExists.mockResolvedValue(false);
      await service.create(1, 1, createDto);

      expect(repository.createEntity).toHaveBeenCalledWith({
        groupId: 1,
        userId: 1,
        message: createDto.message,
      });
    });

    it('should throw BadRequestException if user is already a member', async () => {
      mockGroupMembershipService.entityExists.mockResolvedValue(true);

      await expect(service.create(1, 1, { message: 'test' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of group invites', async () => {
      const result = [{ id: 1, message: 'test' }];
      mockRepository.getQuery.mockResolvedValue(result);

      expect(await service.findAll({})).toBe(result);
      expect(repository.getQuery).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a group invite', async () => {
      const result = { id: 1, message: 'test' };
      mockRepository.getSingleQuery.mockResolvedValue([result]);

      expect(
        await service.findOne(1, 1, GroupInviteResponsesEnum.WITH_USER),
      ).toBe(result);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        {
          userId: 1,
          groupId: 1,
        },
        GroupInviteResponsesEnum.WITH_USER,
      );
    });
  });

  describe('update', () => {
    it('should update a group invite', async () => {
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
    it('should remove a group invite', async () => {
      await service.remove(1, 1);

      expect(repository.deleteEntity).toHaveBeenCalledWith({
        groupId: 1,
        userId: 1,
      });
    });
  });

  describe('checkIfUserIsAlreadyMember', () => {
    it('should throw BadRequestException if user is already a member', async () => {
      mockGroupMembershipService.entityExists.mockResolvedValue(true);

      await expect(service.checkIfUserIsAlreadyMember(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not throw if user is not a member', async () => {
      mockGroupMembershipService.entityExists.mockResolvedValue(false);

      await expect(
        service.checkIfUserIsAlreadyMember(1, 1),
      ).resolves.not.toThrow();
    });
  });

  describe('checkIfInviteExists', () => {
    it('should throw BadRequestException if invite already exists', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([{ id: 1 }]);

      await expect(service.checkIfInviteExists(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should not throw if invite does not exist', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.checkIfInviteExists(1, 1)).resolves.not.toThrow();
    });
  });
});
