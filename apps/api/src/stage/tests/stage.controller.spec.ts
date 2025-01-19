import { Test, TestingModule } from '@nestjs/testing';
import { StageController } from '../stage.controller';
import { StageService } from '../stage.service';
import { TournamentAdminGuard } from '../../tournament/guards/tournament-admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateStageRequest, UpdateStageRequest } from '../dto/requests.dto';
import {
  IStageResponse,
  StageResponsesEnum,
  stageStatusEnum,
  stageTypeEnum,
} from '@tournament-app/types';

describe('StageController', () => {
  let controller: StageController;
  let service: jest.Mocked<StageService>;

  const mockStage: IStageResponse = {
    id: 1,
    name: 'Test Stage',
    description: 'Test Description',
    stageType: stageTypeEnum.KNOCKOUT,
    rostersParticipating: 4,
    stageStatus: stageStatusEnum.UPCOMING,
    tournamentId: 1,
    logo: 'https://example.com/logo.png',
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StageController],
      providers: [
        {
          provide: StageService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(TournamentAdminGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<StageController>(StageController);
    service = module.get(StageService);
  });

  describe('findAll', () => {
    const query = {
      page: 1,
      limit: 10,
      responseType: StageResponsesEnum.BASE,
    };

    it('should return stages with metadata', async () => {
      service.findAll.mockResolvedValue([mockStage]);

      const result = await controller.findAll(query, {
        url: 'test-url',
      } as any);

      expect(result).toEqual({
        results: [mockStage],
        metadata: expect.any(Object),
      });
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single stage', async () => {
      service.findOne.mockResolvedValue(mockStage);

      const result = await controller.findOne(1, StageResponsesEnum.BASE);

      expect(result).toEqual(mockStage);
      expect(service.findOne).toHaveBeenCalledWith(1, StageResponsesEnum.BASE);
    });
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

    it('should create a stage', async () => {
      service.create.mockResolvedValue(mockStage);

      const result = await controller.create(createDto, 1);

      expect(result).toEqual(mockStage);
      expect(service.create).toHaveBeenCalledWith({
        ...createDto,
        tournamentId: 1,
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateStageRequest = {
      name: 'Updated Stage',
      description: 'Updated Description',
    };

    it('should update a stage', async () => {
      const updatedStage = { ...mockStage, ...updateDto };
      service.update.mockResolvedValue(updatedStage);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(updatedStage);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a stage', async () => {
      service.remove.mockResolvedValue(mockStage);

      const result = await controller.remove(1);

      expect(result).toEqual(mockStage);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
