import { Test, TestingModule } from '@nestjs/testing';
import { StageService } from '../stage.service';
import { StageDrizzleRepository } from '../stage.repository';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateStageRequest } from '../dto/requests.dto';
import { StageResponsesEnum, stageTypeEnum } from '@tournament-app/types';

describe('StageService', () => {
  let service: StageService;
  let repository: jest.Mocked<StageDrizzleRepository>;

  const mockStage = {
    id: 1,
    name: 'Test Stage',
    description: 'Test Description',
    startDate: new Date(),
    endDate: new Date(),
    stageType: stageTypeEnum.KNOCKOUT,
    createdAt: new Date(),
    updatedAt: new Date(),
    tournamentId: 1,
  };

  beforeEach(async () => {
    const mockRepository = {
      createEntity: jest.fn(),
      getQuery: jest.fn(),
      getSingleQuery: jest.fn(),
      updateEntity: jest.fn(),
      deleteEntity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StageService,
        {
          provide: StageDrizzleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StageService>(StageService);
    repository = module.get(StageDrizzleRepository);
  });

  describe('create', () => {
    const createDto: CreateStageRequest = {
      name: 'Test Stage',
      description: 'Test Description',
      startDate: new Date(),
      endDate: new Date(),
      stageType: stageTypeEnum.KNOCKOUT,
      tournamentId: 1,
    };

    it('should successfully create a stage', async () => {
      repository.createEntity.mockResolvedValue([mockStage]);

      const result = await service.create(createDto);

      expect(result).toEqual(mockStage);
      expect(repository.createEntity).toHaveBeenCalledWith(createDto);
    });

    it('should throw UnprocessableEntityException when creation fails', async () => {
      repository.createEntity.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('findAll', () => {
    const query = {
      responseType: StageResponsesEnum.BASE,
      page: 1,
      limit: 10,
    };

    it('should return an array of stages', async () => {
      repository.getQuery.mockResolvedValue([mockStage]);

      const result = await service.findAll(query);

      expect(result).toEqual([mockStage]);
      expect(repository.getQuery).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single stage', async () => {
      repository.getSingleQuery.mockResolvedValue([mockStage]);

      const result = await service.findOne(1, StageResponsesEnum.BASE);

      expect(result).toEqual(mockStage);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        1,
        StageResponsesEnum.BASE,
      );
    });

    it('should throw NotFoundException when stage not found', async () => {
      repository.getSingleQuery.mockResolvedValue([]);

      await expect(service.findOne(1, StageResponsesEnum.BASE)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Stage',
      description: 'Updated Description',
    };

    it('should successfully update a stage', async () => {
      const updatedStage = { ...mockStage, ...updateDto };
      repository.updateEntity.mockResolvedValue([updatedStage]);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedStage);
      expect(repository.updateEntity).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException when stage not found', async () => {
      repository.updateEntity.mockResolvedValue([]);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should successfully delete a stage', async () => {
      repository.deleteEntity.mockResolvedValue([mockStage]);

      const result = await service.remove(1);

      expect(result).toEqual(mockStage);
      expect(repository.deleteEntity).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when stage not found', async () => {
      repository.deleteEntity.mockResolvedValue([]);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
