import { Test, TestingModule } from '@nestjs/testing';
import { GroupRequirementsController } from '../group-requirements.controller';
import { GroupRequirementsService } from '../group-requirements.service';
import {
  CreateGroupRequirementsDto,
  UpdateGroupRequirementsDto,
} from '../dto/requests';

describe('GroupRequirementsController', () => {
  let controller: GroupRequirementsController;
  let service: GroupRequirementsService;

  const mockGroupRequirementsService = {
    createRequirements: jest.fn(),
    updateRequirements: jest.fn(),
    getRequirements: jest.fn(),
    deleteRequirements: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupRequirementsController],
      providers: [
        {
          provide: GroupRequirementsService,
          useValue: mockGroupRequirementsService,
        },
      ],
    }).compile();

    controller = module.get<GroupRequirementsController>(
      GroupRequirementsController,
    );
    service = module.get<GroupRequirementsService>(GroupRequirementsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRequirements', () => {
    const mockCreateDto: CreateGroupRequirementsDto = {
      minimumAge: 18,
      maximumAge: 35,
      isSameCountry: true,
      eloRequirements: [{ categoryId: 1, minimumElo: 1000, maximumElo: 2000 }],
    };

    it('should create requirements', async () => {
      mockGroupRequirementsService.createRequirements.mockResolvedValue(
        mockCreateDto,
      );

      const result = await controller.createRequirements(1, mockCreateDto);
      expect(result).toEqual(mockCreateDto);
      expect(service.createRequirements).toHaveBeenCalledWith(1, mockCreateDto);
    });
  });

  describe('getRequirements', () => {
    const mockRequirements = {
      id: 1,
      groupId: 1,
      minimumAge: 18,
      maximumAge: 35,
      isSameCountry: true,
      eloRequirements: [{ categoryId: 1, minimumElo: 1000, maximumElo: 2000 }],
    };

    it('should get requirements', async () => {
      mockGroupRequirementsService.getRequirements.mockResolvedValue(
        mockRequirements,
      );

      const result = await controller.getRequirements(1);
      expect(result).toEqual(mockRequirements);
      expect(service.getRequirements).toHaveBeenCalledWith(1);
    });
  });

  describe('updateRequirements', () => {
    const mockUpdateDto: UpdateGroupRequirementsDto = {
      minimumAge: 21,
      maximumAge: 40,
      isSameCountry: false,
      eloRequirements: [{ categoryId: 1, minimumElo: 1200, maximumElo: 2200 }],
    };

    it('should update requirements', async () => {
      mockGroupRequirementsService.updateRequirements.mockResolvedValue(
        mockUpdateDto,
      );

      const result = await controller.updateRequirements(1, mockUpdateDto);
      expect(result).toEqual(mockUpdateDto);
      expect(service.updateRequirements).toHaveBeenCalledWith(1, mockUpdateDto);
    });
  });

  describe('deleteRequirements', () => {
    const mockRequirements = {
      id: 1,
      groupId: 1,
      minimumAge: 18,
      maximumAge: 35,
      isSameCountry: true,
    };

    it('should delete requirements', async () => {
      mockGroupRequirementsService.deleteRequirements.mockResolvedValue(
        mockRequirements,
      );

      const result = await controller.deleteRequirements(1);
      expect(result).toEqual(mockRequirements);
      expect(service.deleteRequirements).toHaveBeenCalledWith(1);
    });
  });
});
