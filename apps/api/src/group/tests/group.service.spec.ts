import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from '../group.service';
import { GroupDrizzleRepository } from '../group.repository';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GroupResponsesEnum } from '@tournament-app/types';

describe('GroupService', () => {
  let service: GroupService;

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
        GroupService,
        {
          provide: GroupDrizzleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: 'Test Group',
      abbreviation: 'TG',
      description: 'Test Description',
      type: 'public',
      focus: 'hybrid',
      logo: 'logo.png',
      location: 'Test Location',
      country: 'Test Country',
    };
    const userId = 1;

    it('should create a group successfully', async () => {
      const expectedResult = { id: 1, ...createDto };
      mockRepository.createEntity.mockResolvedValue([expectedResult]);

      const result = await service.create(createDto, userId);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.createEntity).toHaveBeenCalledWith(
        createDto,
        userId,
      );
    });

    it('should throw UnprocessableEntityException when creation fails', async () => {
      mockRepository.createEntity.mockResolvedValue([]);

      await expect(service.create(createDto, userId)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('findAll', () => {
    const query = { type: 'public' };

    it('should return array of groups', async () => {
      const expectedResult = [{ id: 1, name: 'Test Group' }];
      mockRepository.getQuery.mockResolvedValue(expectedResult);

      const result = await service.findAll(query);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.getQuery).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    const id = 1;
    const responseType = GroupResponsesEnum.BASE;

    it('should return a group', async () => {
      const expectedResult = { id: 1, name: 'Test Group' };
      mockRepository.getSingleQuery.mockResolvedValue([expectedResult]);

      const result = await service.findOne(id, responseType);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith(
        id,
        responseType,
      );
    });

    it('should throw NotFoundException when group not found', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.findOne(id, responseType)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const id = 1;
    const userId = 1;
    const updateDto = { name: 'Updated Group Name' };

    it('should update a group successfully', async () => {
      const expectedResult = { id, ...updateDto };
      mockRepository.updateEntity.mockResolvedValue([expectedResult]);

      const result = await service.update(id, updateDto, userId);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.updateEntity).toHaveBeenCalledWith(
        id,
        updateDto,
        userId,
      );
    });

    it('should throw NotFoundException when update fails', async () => {
      mockRepository.updateEntity.mockResolvedValue([]);

      await expect(service.update(id, updateDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    const id = 1;
    const userId = 1;

    it('should remove a group successfully', async () => {
      const expectedResult = { id, name: 'Test Group' };
      mockRepository.deleteEntity.mockResolvedValue([expectedResult]);

      const result = await service.remove(id, userId);
      expect(result).toEqual(expectedResult);
      expect(mockRepository.deleteEntity).toHaveBeenCalledWith(id, userId);
    });

    it('should throw NotFoundException when removal fails', async () => {
      mockRepository.deleteEntity.mockResolvedValue([]);

      await expect(service.remove(id, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
