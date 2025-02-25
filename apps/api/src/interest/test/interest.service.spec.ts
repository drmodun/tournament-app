import { Test, TestingModule } from '@nestjs/testing';
import { InterestService } from '../interest.service';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { BadRequestException } from '@nestjs/common';

describe('InterestService', () => {
  let service: InterestService;
  let repository: UserDrizzleRepository;

  beforeEach(async () => {
    const mockRepository = {
      checkIfInterestExists: jest.fn(),
      createInterest: jest.fn(),
      deleteInterest: jest.fn(),
      getInterestCategories: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterestService,
        {
          provide: UserDrizzleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<InterestService>(InterestService);
    repository = module.get<UserDrizzleRepository>(UserDrizzleRepository);
  });

  describe('checkIfInterestExists', () => {
    const categoryId = 1;
    const userId = 1;

    it('should return true if interest exists', async () => {
      jest.spyOn(repository, 'checkIfInterestExists').mockResolvedValue(true);

      const result = await service.checkIfInterestExists(categoryId, userId);

      expect(result).toBe(true);
      expect(repository.checkIfInterestExists).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
    });

    it('should return false if interest does not exist', async () => {
      jest.spyOn(repository, 'checkIfInterestExists').mockResolvedValue(false);

      const result = await service.checkIfInterestExists(categoryId, userId);

      expect(result).toBe(false);
      expect(repository.checkIfInterestExists).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
    });
  });

  describe('createInterest', () => {
    const categoryId = 1;
    const userId = 1;
    const mockInterest = { categoryId: 1, userId: 1 };

    it('should create an interest if it does not exist', async () => {
      jest.spyOn(repository, 'checkIfInterestExists').mockResolvedValue(false);
      jest
        .spyOn(repository, 'createInterest')
        .mockResolvedValue(mockInterest as any);

      const result = await service.createInterest(categoryId, userId);

      expect(result).toEqual(mockInterest);
      expect(repository.createInterest).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
    });

    it('should throw BadRequestException if interest already exists', async () => {
      jest.spyOn(repository, 'checkIfInterestExists').mockResolvedValue(true);

      await expect(service.createInterest(categoryId, userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.createInterest).not.toHaveBeenCalled();
    });
  });

  describe('deleteInterest', () => {
    const categoryId = 1;
    const userId = 1;

    it('should delete an interest if it exists', async () => {
      jest.spyOn(repository, 'checkIfInterestExists').mockResolvedValue(true);
      jest.spyOn(repository, 'deleteInterest').mockResolvedValue(undefined);

      await service.deleteInterest(categoryId, userId);

      expect(repository.deleteInterest).toHaveBeenCalledWith(
        categoryId,
        userId,
      );
    });

    it('should throw BadRequestException if interest does not exist', async () => {
      jest.spyOn(repository, 'checkIfInterestExists').mockResolvedValue(false);

      await expect(service.deleteInterest(categoryId, userId)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.deleteInterest).not.toHaveBeenCalled();
    });
  });

  describe('getInterestCategories', () => {
    const userId = 1;
    const page = 1;
    const pageSize = 10;

    it('should return interest categories', async () => {
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
        .spyOn(repository, 'getInterestCategories')
        .mockResolvedValue(mockCategories);

      const result = await service.getInterestCategories(
        userId,
        page,
        pageSize,
      );

      expect(result).toEqual(mockCategories);
      expect(repository.getInterestCategories).toHaveBeenCalledWith(
        userId,
        page,
        pageSize,
      );
    });
  });
});
