import { Test, TestingModule } from '@nestjs/testing';
import { InterestController } from '../interest.controller';
import { InterestService } from '../interest.service';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';

describe('InterestController', () => {
  let controller: InterestController;
  let service: InterestService;

  beforeEach(async () => {
    const mockService = {
      createInterest: jest.fn(),
      deleteInterest: jest.fn(),
      getInterestCategories: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterestController],
      providers: [
        {
          provide: InterestService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<InterestController>(InterestController);
    service = module.get<InterestService>(InterestService);
  });

  describe('createInterest', () => {
    const categoryId = 1;
    const user: ValidatedUserDto = {
      id: 1,
      username: 'testuser',
      role: 'user',
      email: 'test@example.com',
    } as ValidatedUserDto;
    const mockInterest = { categoryId: 1, userId: 1 };

    it('should create an interest', async () => {
      jest
        .spyOn(service, 'createInterest')
        .mockResolvedValue(mockInterest as any);

      const result = await controller.createInterest(categoryId, user);

      expect(result).toEqual(mockInterest);
      expect(service.createInterest).toHaveBeenCalledWith(categoryId, user.id);
    });
  });

  describe('deleteInterest', () => {
    const categoryId = 1;
    const user: ValidatedUserDto = {
      id: 1,
      username: 'testuser',
      role: 'user',
      email: 'test@example.com',
    } as ValidatedUserDto;

    it('should delete an interest', async () => {
      jest.spyOn(service, 'deleteInterest').mockResolvedValue(undefined);

      await controller.deleteInterest(categoryId, user);

      expect(service.deleteInterest).toHaveBeenCalledWith(categoryId, user.id);
    });
  });

  describe('getInterestCategories', () => {
    const pagination: PaginationOnly = {
      page: 1,
      pageSize: 10,
    };
    const user: ValidatedUserDto = {
      id: 1,
      username: 'testuser',
      role: 'user',
      email: 'test@example.com',
    } as ValidatedUserDto;
    const mockRequest = {
      url: '/interest',
    } as Request;

    it('should return interest categories with metadata', async () => {
      const mockResults = [
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
        .spyOn(service, 'getInterestCategories')
        .mockResolvedValue(mockResults);

      const result = await controller.getInterestCategories(
        pagination,
        user,
        mockRequest,
      );

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('metadata');
      expect(result.results).toEqual(mockResults);
      expect(service.getInterestCategories).toHaveBeenCalledWith(
        user.id,
        pagination.page,
        pagination.pageSize,
      );
    });
  });
});
