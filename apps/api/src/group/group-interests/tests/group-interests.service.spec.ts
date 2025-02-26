import { Test, TestingModule } from '@nestjs/testing';
import { GroupInterestsService } from '../group-interests.service';
import { GroupDrizzleRepository } from '../../group.repository';
import { BadRequestException } from '@nestjs/common';

describe('GroupInterestsService', () => {
  let service: GroupInterestsService;
  let repository: GroupDrizzleRepository;

  beforeEach(async () => {
    const mockRepository = {
      checkIfGroupInterestExists: jest.fn(),
      createGroupInterest: jest.fn(),
      deleteGroupInterest: jest.fn(),
      getGroupInterests: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupInterestsService,
        {
          provide: GroupDrizzleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GroupInterestsService>(GroupInterestsService);
    repository = module.get<GroupDrizzleRepository>(GroupDrizzleRepository);
  });

  describe('checkIfInterestExists', () => {
    const groupId = 1;
    const categoryId = 1;

    it('should return true if interest exists', async () => {
      jest
        .spyOn(repository, 'checkIfGroupInterestExists')
        .mockResolvedValue(true);

      const result = await service.checkIfInterestExists(groupId, categoryId);

      expect(result).toBe(true);
      expect(repository.checkIfGroupInterestExists).toHaveBeenCalledWith(
        groupId,
        categoryId,
      );
    });

    it('should return false if interest does not exist', async () => {
      jest
        .spyOn(repository, 'checkIfGroupInterestExists')
        .mockResolvedValue(false);

      const result = await service.checkIfInterestExists(groupId, categoryId);

      expect(result).toBe(false);
      expect(repository.checkIfGroupInterestExists).toHaveBeenCalledWith(
        groupId,
        categoryId,
      );
    });
  });

  describe('createGroupInterest', () => {
    const groupId = 1;
    const categoryId = 1;

    it('should create a group interest if it does not exist', async () => {
      jest
        .spyOn(repository, 'checkIfGroupInterestExists')
        .mockResolvedValue(false);
      jest
        .spyOn(repository, 'createGroupInterest')
        .mockResolvedValue(undefined);

      await service.createGroupInterest(groupId, categoryId);

      expect(repository.createGroupInterest).toHaveBeenCalledWith(
        groupId,
        categoryId,
      );
    });

    it('should throw BadRequestException if interest already exists', async () => {
      jest
        .spyOn(repository, 'checkIfGroupInterestExists')
        .mockResolvedValue(true);

      await expect(
        service.createGroupInterest(groupId, categoryId),
      ).rejects.toThrow(BadRequestException);
      expect(repository.createGroupInterest).not.toHaveBeenCalled();
    });
  });

  describe('deleteGroupInterest', () => {
    const groupId = 1;
    const categoryId = 1;

    it('should delete a group interest if it exists', async () => {
      jest
        .spyOn(repository, 'checkIfGroupInterestExists')
        .mockResolvedValue(true);
      jest
        .spyOn(repository, 'deleteGroupInterest')
        .mockResolvedValue(undefined);

      await service.deleteGroupInterest(groupId, categoryId);

      expect(repository.deleteGroupInterest).toHaveBeenCalledWith(
        groupId,
        categoryId,
      );
    });

    it('should throw BadRequestException if interest does not exist', async () => {
      jest
        .spyOn(repository, 'checkIfGroupInterestExists')
        .mockResolvedValue(false);

      await expect(
        service.deleteGroupInterest(groupId, categoryId),
      ).rejects.toThrow(BadRequestException);
      expect(repository.deleteGroupInterest).not.toHaveBeenCalled();
    });
  });

  describe('getGroupInterests', () => {
    const groupId = 1;
    const page = 1;
    const pageSize = 10;

    it('should return group interests', async () => {
      const mockCategories = [
        {
          id: 1,
          name: 'Category 1',
          description: 'Description 1',
          type: 'game',
          image: 'https://example.com/category1.jpg',
        },
        {
          id: 2,
          name: 'Category 2',
          description: 'Description 2',
          type: 'sport',
          image: 'https://example.com/category2.jpg',
        },
      ];

      jest
        .spyOn(repository, 'getGroupInterests')
        .mockResolvedValue(mockCategories);

      const result = await service.getGroupInterests(groupId, page, pageSize);

      expect(result).toEqual(mockCategories);
      expect(repository.getGroupInterests).toHaveBeenCalledWith(
        groupId,
        page,
        pageSize,
      );
    });
  });
});
