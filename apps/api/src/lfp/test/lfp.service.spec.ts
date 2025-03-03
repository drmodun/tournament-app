import { Test, TestingModule } from '@nestjs/testing';
import { LFPService } from '../lfp.service';
import { LFPDrizzleRepository } from '../lfp.repository';
import { CreateLFPDto, UpdateLFPDto } from '../dto/requests';
import { NotFoundException } from '@nestjs/common';

describe('LFPService', () => {
  let service: LFPService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: LFPDrizzleRepository;

  const mockRepository = {
    createEntity: jest.fn(),
    updateEntity: jest.fn(),
    getSingleQuery: jest.fn(),
    getQuery: jest.fn(),
    getGroups: jest.fn(),
    deleteLFP: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LFPService,
        {
          provide: LFPDrizzleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LFPService>(LFPService);
    repository = module.get<LFPDrizzleRepository>(LFPDrizzleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLFP', () => {
    it('should create an LFP post', async () => {
      const createDto: CreateLFPDto = {
        message: 'Test LFP message',
      };
      const groupId = 1;
      const expectedResult = { id: 1, ...createDto, groupId };

      mockRepository.createEntity.mockResolvedValue([expectedResult]);

      const result = await service.createLFP(createDto, groupId);

      expect(result).toEqual(expectedResult);
      expect(mockRepository.createEntity).toHaveBeenCalledWith({
        ...createDto,
        groupId,
      });
    });
  });

  describe('updateLFP', () => {
    const lfpId = 1;
    const updateDto: UpdateLFPDto = {
      message: 'Updated message',
    };

    it('should update an LFP post when it exists', async () => {
      const existingLFP = [{ id: lfpId, message: 'Old message' }];
      const updatedLFP = { id: lfpId, message: updateDto.message };

      mockRepository.getSingleQuery.mockResolvedValue([existingLFP]);
      mockRepository.updateEntity.mockResolvedValue([updatedLFP]);

      const result = await service.updateLFP(lfpId, updateDto);

      expect(result).toEqual(updatedLFP);
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith(lfpId, 'mini');
      expect(mockRepository.updateEntity).toHaveBeenCalledWith(
        lfpId,
        updateDto,
      );
    }); // TODO: remove console logs

    it('should throw NotFoundException when LFP does not exist', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.updateLFP(lfpId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.updateEntity).not.toHaveBeenCalled();
    });
  });

  describe('getForGroup', () => {
    it('should get LFP posts for a group', async () => {
      const groupId = 1;
      const expectedLFPs = [
        { id: 1, message: 'LFP 1' },
        { id: 2, message: 'LFP 2' },
      ];

      mockRepository.getQuery.mockResolvedValue(expectedLFPs);

      const result = await service.getForGroup(groupId);

      expect(result).toEqual(expectedLFPs);
      expect(mockRepository.getQuery).toHaveBeenCalledWith({
        groupId,
        responseType: 'mini',
      });
    });
  });

  describe('getGroups', () => {
    it('should get groups based on query parameters', async () => {
      const userId = 1;
      const query = { lat: 12.34, lng: 56.78, distance: 10 };
      const expectedGroups = [
        { id: 1, name: 'Group 1' },
        { id: 2, name: 'Group 2' },
      ];

      mockRepository.getGroups.mockResolvedValue(expectedGroups);

      const result = await service.getGroups(userId, query);

      expect(result).toEqual(expectedGroups);
      expect(mockRepository.getGroups).toHaveBeenCalledWith(userId, query);
    });
  });

  describe('deleteLFP', () => {
    const lfpId = 1;

    it('should delete an LFP post when it exists', async () => {
      const existingLFP = { id: lfpId, message: 'Test message' };
      mockRepository.getSingleQuery.mockResolvedValue([existingLFP]);
      mockRepository.deleteLFP.mockResolvedValue({ success: true });

      const result = await service.deleteLFP(lfpId);

      expect(result).toEqual({ success: true });
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith(lfpId, 'mini');
      expect(mockRepository.deleteLFP).toHaveBeenCalledWith(lfpId);
    });

    it('should throw NotFoundException when LFP does not exist', async () => {
      mockRepository.getSingleQuery.mockResolvedValue(null);

      await expect(service.deleteLFP(lfpId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.deleteLFP).not.toHaveBeenCalled();
    });
  });
});
