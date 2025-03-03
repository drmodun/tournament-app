import { Test, TestingModule } from '@nestjs/testing';
import { StageService } from '../stage.service';
import { StageDrizzleRepository } from '../stage.repository';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateStageRequest } from '../dto/requests.dto';
import {
  StageResponsesEnum,
  StageSortingEnum,
  stageTypeEnum,
  IChallongeTournament,
} from '@tournament-app/types';
import { StagesWithDates } from '../types';

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
      getAllTournamentStagesSortedByStartDate: jest.fn(),
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

    service.createChallongeTournament = jest.fn();
    service.updateChallongeTournament = jest.fn();
    service.deleteChallongeTournament = jest.fn();

    jest.spyOn(service, 'createChallongeTournament').mockResolvedValue({
      id: '1',
    } as IChallongeTournament);

    jest.spyOn(service, 'updateChallongeTournament').mockResolvedValue();

    jest.spyOn(service, 'deleteChallongeTournament').mockResolvedValue();
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

  describe('getFirstStage', () => {
    const tournamentId = 1;
    const expectedQuery = {
      responseType: StageResponsesEnum.MINI,
      field: StageSortingEnum.START_DATE,
      order: 'asc',
      tournamentId,
    };

    it('should return the first stage of a tournament', async () => {
      repository.getQuery.mockResolvedValue([mockStage]);

      const result = await service.getFirstStage(tournamentId);

      expect(result).toEqual(mockStage);
      expect(repository.getQuery).toHaveBeenCalledWith(expectedQuery);
    });

    it('should return undefined if no stages exist', async () => {
      repository.getQuery.mockResolvedValue([]);

      const result = await service.getFirstStage(tournamentId);

      expect(result).toBeUndefined();
      expect(repository.getQuery).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('isFirstStage', () => {
    const tournamentId = 1;
    const stageId = 1;

    it('should return true if the stage is the first stage', async () => {
      const firstStage = { ...mockStage, id: stageId };
      repository.getQuery.mockResolvedValue([firstStage]);

      const result = await service.isFirstStage(stageId, tournamentId);

      expect(result).toBe(true);
    });

    it('should return false if the stage is not the first stage', async () => {
      const firstStage = { ...mockStage, id: 2 }; // Different ID
      repository.getQuery.mockResolvedValue([firstStage]);

      const result = await service.isFirstStage(stageId, tournamentId);

      expect(result).toBe(false);
    });
  });

  describe('getStagesSortedByStartDate', () => {
    const tournamentId = 1;
    const mockStagesWithDates: StagesWithDates[] = [
      {
        id: 1,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-01-10'),
      },
      {
        id: 2,
        startDate: new Date('2023-01-11'),
        endDate: new Date('2023-01-20'),
      },
      {
        id: 3,
        startDate: new Date('2023-01-21'),
        endDate: undefined,
      },
    ];

    it('should return stages sorted by start date', async () => {
      repository.getAllTournamentStagesSortedByStartDate.mockResolvedValue(
        mockStagesWithDates,
      );

      const result = await service.getStagesSortedByStartDate(tournamentId);

      expect(result).toEqual(mockStagesWithDates);
      expect(
        repository.getAllTournamentStagesSortedByStartDate,
      ).toHaveBeenCalledWith(tournamentId);
    });

    it('should return an empty array if no stages exist', async () => {
      repository.getAllTournamentStagesSortedByStartDate.mockResolvedValue([]);

      const result = await service.getStagesSortedByStartDate(tournamentId);

      expect(result).toEqual([]);
      expect(
        repository.getAllTournamentStagesSortedByStartDate,
      ).toHaveBeenCalledWith(tournamentId);
    });
  });
});
