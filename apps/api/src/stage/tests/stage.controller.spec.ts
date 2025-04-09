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
import { TournamentService } from '../../tournament/tournament.service';
import { StageAdminGuard } from '../guards/stage-admin.guard';
import { GroupMembershipService } from '../../group-membership/group-membership.service';

describe('StageController', () => {
  let controller: StageController;
  let service: jest.Mocked<StageService>;

  const mockStage: IStageResponse = {
    id: 1,
    startDate: new Date(),
    endDate: new Date(),
    name: 'Test Stage',
    description: 'Test Description',
    stageType: stageTypeEnum.KNOCKOUT,
    rostersParticipating: 4,
    stageStatus: stageStatusEnum.UPCOMING,
    tournamentId: 1,
    logo: 'https://example.com/logo.png',
    locationId: 1,
    location: {
      id: 1,
      name: 'Test Location',
      coordinates: [12.345678, 12.345678],
      apiId: 'test-location',
    },
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      generateBracket: jest.fn(),
      startStage: jest.fn(),
      finishStage: jest.fn(),
      getRostersByStage: jest.fn(),
      getMatchesForStage: jest.fn(),
      getManagedStages: jest.fn(),
    };

    const mockTournamentService = {
      findOne: jest.fn(),
    };

    const mockGroupMembershipService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StageController],
      providers: [
        {
          provide: StageService,
          useValue: mockService,
        },
        {
          provide: TournamentService,
          useValue: mockTournamentService,
        },
        {
          provide: GroupMembershipService,
          useValue: mockGroupMembershipService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(TournamentAdminGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(StageAdminGuard)
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
      tournamentId: 1,
    };

    it('should update a stage', async () => {
      const updatedStage = { ...mockStage, ...updateDto };
      service.update.mockResolvedValue(updatedStage);

      const result = await controller.update(1, 1, updateDto);

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

  describe('getManagedStages', () => {
    const paginationQuery = {
      page: 1,
      pageSize: 10,
    };
    const mockUser = {
      id: 1,
      username: 'testuser',
      isFake: false,
      email: 'test@example.com',
      role: 'user',
    };
    const mockManagedStages = [mockStage];

    beforeEach(() => {
      service.getManagedStages = jest.fn();
    });

    it('should return stages managed by the user', async () => {
      service.getManagedStages.mockResolvedValue(mockManagedStages);

      const result = await controller.getManagedStages(
        mockUser as any,
        paginationQuery,
      );

      expect(result).toEqual({
        results: mockManagedStages,
        metadata: expect.any(Object),
      });
      expect(service.getManagedStages).toHaveBeenCalledWith(
        mockUser.id,
        paginationQuery,
      );
    });

    it('should pass the correct user ID to the service', async () => {
      service.getManagedStages.mockResolvedValue([]);

      await controller.getManagedStages(mockUser as any, paginationQuery);

      expect(service.getManagedStages).toHaveBeenCalledWith(
        1,
        expect.any(Object),
      );
    });
  });

  describe('startStage', () => {
    it('should start a stage', async () => {
      const stageId = 1;
      const updatedStage = {
        ...mockStage,
        stageStatus: stageStatusEnum.ONGOING,
      };

      service.startStage = jest.fn().mockResolvedValue(updatedStage);

      const result = await controller.startStage(stageId);

      expect(result).toEqual(updatedStage);
      expect(service.startStage).toHaveBeenCalledWith(stageId);
    });
  });
});
