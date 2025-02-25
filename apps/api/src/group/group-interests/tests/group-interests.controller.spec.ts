import { Test, TestingModule } from '@nestjs/testing';
import { GroupInterestsController } from '../group-interests.controller';
import { GroupInterestsService } from '../group-interests.service';
import { PaginationOnly } from 'src/base/query/baseQuery';

describe('GroupInterestsController', () => {
  let controller: GroupInterestsController;
  let service: GroupInterestsService;

  beforeEach(async () => {
    const mockService = {
      createGroupInterest: jest.fn(),
      deleteGroupInterest: jest.fn(),
      getGroupInterests: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupInterestsController],
      providers: [
        {
          provide: GroupInterestsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<GroupInterestsController>(GroupInterestsController);
    service = module.get<GroupInterestsService>(GroupInterestsService);
  });

  describe('findAll', () => {
    const groupId = 1;
    const pagination: PaginationOnly = {
      page: 1,
      pageSize: 10,
    };
    const mockRequest = {
      url: '/group-interests/1',
    } as Request;

    it('should return group interests with metadata', async () => {
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

      jest.spyOn(service, 'getGroupInterests').mockResolvedValue(mockResults);

      const result = await controller.findAll(pagination, groupId, mockRequest);

      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('metadata');
      expect(result.results).toEqual(mockResults);
      expect(service.getGroupInterests).toHaveBeenCalledWith(
        groupId,
        pagination.page,
        pagination.pageSize,
      );
    });
  });

  describe('addInterest', () => {
    const groupId = 1;
    const categoryId = 1;
    const mockInterest = { groupId: 1, categoryId: 1 };

    it('should add an interest to a group', async () => {
      jest
        .spyOn(service, 'createGroupInterest')
        .mockResolvedValue(mockInterest as any);

      const result = await controller.addInterest(groupId, categoryId);

      expect(result).toEqual(mockInterest);
      expect(service.createGroupInterest).toHaveBeenCalledWith(
        groupId,
        categoryId,
      );
    });
  });

  describe('removeInterest', () => {
    const groupId = 1;
    const categoryId = 1;

    it('should remove an interest from a group', async () => {
      jest.spyOn(service, 'deleteGroupInterest').mockResolvedValue(undefined);

      await controller.removeInterest(groupId, categoryId);

      expect(service.deleteGroupInterest).toHaveBeenCalledWith(
        groupId,
        categoryId,
      );
    });
  });
});
