import { Test, TestingModule } from '@nestjs/testing';
import { GroupRequirementsService } from '../group-requirements.service';
import { GroupRequirementsRepository } from '../group-requirements.repository';
import { GroupDrizzleRepository } from '../../group.repository';
import { NotFoundException } from '@nestjs/common';
import { groupRoleEnum } from '@tournament-app/types';

describe('GroupRequirementsService', () => {
  let service: GroupRequirementsService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let groupRequirementsRepository: GroupRequirementsRepository;

  const mockGroupRequirementsRepository = {
    createRequirements: jest.fn(),
    updateRequirements: jest.fn(),
    getRequirementsWithElo: jest.fn(),
    deleteRequirements: jest.fn(),
  };

  const mockGroupRepository = {
    getMemberRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupRequirementsService,
        {
          provide: GroupRequirementsRepository,
          useValue: mockGroupRequirementsRepository,
        },
        {
          provide: GroupDrizzleRepository,
          useValue: mockGroupRepository,
        },
      ],
    }).compile();

    service = module.get<GroupRequirementsService>(GroupRequirementsService);
    groupRequirementsRepository = module.get<GroupRequirementsRepository>(
      GroupRequirementsRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRequirements', () => {
    const mockData = {
      minimumAge: 18,
      maximumAge: 35,
      isSameCountry: true,
      eloRequirements: [{ categoryId: 1, minimumElo: 1000, maximumElo: 2000 }],
    };

    it('should create requirements when user is admin', async () => {
      mockGroupRepository.getMemberRole.mockResolvedValue({
        role: groupRoleEnum.ADMIN,
      });
      mockGroupRequirementsRepository.createRequirements.mockResolvedValue(
        mockData,
      );

      const result = await service.createRequirements(1, mockData);
      expect(result).toEqual(mockData);
    });
  });

  describe('updateRequirements', () => {
    const mockData = {
      minimumAge: 21,
      maximumAge: 40,
      isSameCountry: false,
      eloRequirements: [{ categoryId: 1, minimumElo: 1200, maximumElo: 2200 }],
    };

    it('should update requirements when user is admin', async () => {
      mockGroupRepository.getMemberRole.mockResolvedValue({
        role: groupRoleEnum.ADMIN,
      });
      mockGroupRequirementsRepository.getRequirementsWithElo.mockResolvedValue(
        mockData,
      );
      mockGroupRequirementsRepository.updateRequirements.mockResolvedValue(
        mockData,
      );

      const result = await service.updateRequirements(1, mockData);
      expect(result).toEqual(mockData);
    });

    it('should throw NotFoundException when requirements not found', async () => {
      mockGroupRepository.getMemberRole.mockResolvedValue({
        role: groupRoleEnum.ADMIN,
      });
      mockGroupRequirementsRepository.getRequirementsWithElo.mockResolvedValue(
        null,
      );

      await expect(service.updateRequirements(1, mockData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getRequirements', () => {
    const mockData = {
      minimumAge: 18,
      maximumAge: 35,
      isSameCountry: true,
      eloRequirements: [{ categoryId: 1, minimumElo: 1000, maximumElo: 2000 }],
    };

    it('should return requirements when they exist', async () => {
      mockGroupRequirementsRepository.getRequirementsWithElo.mockResolvedValue(
        mockData,
      );

      const result = await service.getRequirements(1);
      expect(result).toEqual(mockData);
    });

    it('should throw NotFoundException when requirements not found', async () => {
      mockGroupRequirementsRepository.getRequirementsWithElo.mockResolvedValue(
        null,
      );

      await expect(service.getRequirements(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteRequirements', () => {
    const mockData = {
      id: 1,
      groupId: 1,
      minimumAge: 18,
      maximumAge: 35,
      isSameCountry: true,
    };

    it('should delete requirements when user is admin', async () => {
      mockGroupRepository.getMemberRole.mockResolvedValue({
        role: groupRoleEnum.ADMIN,
      });
      mockGroupRequirementsRepository.deleteRequirements.mockResolvedValue(
        mockData,
      );

      const result = await service.deleteRequirements(1);
      expect(result).toEqual(mockData);
    });

    it('should throw NotFoundException when requirements not found', async () => {
      mockGroupRepository.getMemberRole.mockResolvedValue({
        role: groupRoleEnum.ADMIN,
      });
      mockGroupRequirementsRepository.deleteRequirements.mockResolvedValue(
        null,
      );

      await expect(service.deleteRequirements(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
