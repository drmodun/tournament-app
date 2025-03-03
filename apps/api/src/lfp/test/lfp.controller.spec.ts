import { Test, TestingModule } from '@nestjs/testing';
import { LFPController } from '../lfp.controller';
import { LFPService } from '../lfp.service';
import { CreateLFPDto, UpdateLFPDto, LFPQueryDto } from '../dto/requests';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import { userRoleEnum } from '@tournament-app/types';

describe('LFPController', () => {
  let controller: LFPController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: LFPService;

  const mockService = {
    createLFP: jest.fn(),
    updateLFP: jest.fn(),
    getForGroup: jest.fn(),
    getGroups: jest.fn(),
    deleteLFP: jest.fn(),
  };

  const mockUser: ValidatedUserDto = {
    id: 1,
    email: 'test@example.com',
    role: userRoleEnum.USER,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LFPController],
      providers: [
        {
          provide: LFPService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<LFPController>(LFPController);
    service = module.get<LFPService>(LFPService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLFP', () => {
    it('should create an LFP post', async () => {
      const groupId = 1;
      const createDto: CreateLFPDto = {
        message: 'Test LFP message',
      };
      const expectedResult = { id: 1, ...createDto, groupId };

      mockService.createLFP.mockResolvedValue(expectedResult);

      const result = await controller.createLFP(groupId, createDto);

      expect(result).toEqual(expectedResult);
      expect(mockService.createLFP).toHaveBeenCalledWith(createDto, groupId);
    });
  });

  describe('getForGroup', () => {
    it('should get LFP posts for a group', async () => {
      const groupId = 1;
      const expectedLFPs = [
        { id: 1, message: 'LFP 1' },
        { id: 2, message: 'LFP 2' },
      ];

      mockService.getForGroup.mockResolvedValue(expectedLFPs);

      const result = await controller.getForGroup(groupId);

      expect(result).toEqual(expectedLFPs);
      expect(mockService.getForGroup).toHaveBeenCalledWith(groupId);
    });
  });

  describe('getGroups', () => {
    it('should get groups based on query parameters', async () => {
      const query: LFPQueryDto = {
        lat: 12.34,
        lng: 56.78,
        distance: 10,
      };
      const expectedGroups = [
        { id: 1, name: 'Group 1' },
        { id: 2, name: 'Group 2' },
      ];

      mockService.getGroups.mockResolvedValue(expectedGroups);

      const result = await controller.getGroups(mockUser, query);

      expect(result).toEqual(expectedGroups);
      expect(mockService.getGroups).toHaveBeenCalledWith(mockUser.id, query);
    });
  });

  describe('updateLFP', () => {
    it('should update an LFP post', async () => {
      const lfpId = 1;
      const updateDto: UpdateLFPDto = {
        message: 'Updated message',
      };
      const expectedResult = { id: lfpId, ...updateDto };

      mockService.updateLFP.mockResolvedValue(expectedResult);

      const result = await controller.updateLFP(lfpId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockService.updateLFP).toHaveBeenCalledWith(lfpId, updateDto);
    });
  });

  describe('deleteLFP', () => {
    it('should delete an LFP post', async () => {
      const lfpId = 1;
      const expectedResult = { success: true };

      mockService.deleteLFP.mockResolvedValue(expectedResult);

      const result = await controller.deleteLFP(lfpId);

      expect(result).toEqual(expectedResult);
      expect(mockService.deleteLFP).toHaveBeenCalledWith(lfpId);
    });
  });
});
