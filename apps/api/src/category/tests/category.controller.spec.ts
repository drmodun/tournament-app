import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from '../category.controller';
import { CategoryService } from '../category.service';
import { CategoryDrizzleRepository } from '../category.repository';
import {
  CategoryResponsesEnum,
  categoryTypeEnum,
  ICategoryMiniResponse,
} from '^tournament-app/types';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQuery,
} from '../dto/requests.dto';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

describe('CategoryController', () => {
  let controller: CategoryController;

  jest.mock('../category.service');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [CategoryService, CategoryDrizzleRepository],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a valid query', async () => {
    jest
      .spyOn(CategoryService.prototype, 'findAll')
      .mockImplementation(async () => {
        return [
          {
            id: 1,
            name: 'Category 1',
          },
          {
            id: 2,
            name: 'Category 2',
          },
        ] satisfies ICategoryMiniResponse[];
      });

    const request: CategoryQuery = {
      page: 1,
      pageSize: 10,
      name: 'Category',
      field: 'name',
      order: 'asc',
      responseType: CategoryResponsesEnum.BASE,
    };

    const req = new Request('https://example.com/api/categories');

    const result = await controller.findAll(request, req);

    expect(result.results).toEqual([
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2' },
    ]);

    expect(result.metadata).toEqual({
      pagination: {
        page: 1,
        pageSize: 10,
      },
      links: {
        first: 'https://example.com/api/categories?page=1',
        prev: 'https://example.com/api/categories?page=0',
        next: 'https://example.com/api/categories?page=2',
      },
      query: request,
    });
  });

  it('should return a category', async () => {
    jest
      .spyOn(CategoryService.prototype, 'findOne')
      .mockImplementation(async () => {
        return { id: 1, name: 'Category 1' };
      });

    const result = await controller.findOne(1, CategoryResponsesEnum.BASE);

    expect(result).toEqual({
      id: 1,
      name: 'Category 1',
    });
  });

  it('should create a category', async () => {
    jest
      .spyOn(CategoryService.prototype, 'create')
      .mockImplementation(async () => {
        return { id: 1 };
      });

    const request: CreateCategoryRequest = {
      name: 'New Category',
      description: 'New Description',
      logo: 'https://example.com/new-logo.jpg',
      type: categoryTypeEnum.PROGRAMMING,
    };

    const result = await controller.create(request);

    expect(result).toEqual({ id: 1 });
  });

  it('should update a category', async () => {
    jest
      .spyOn(CategoryService.prototype, 'update')
      .mockImplementation(async () => {
        return { id: 1 };
      });

    const request: UpdateCategoryRequest = {
      name: 'Updated Category',
      description: 'Updated Description',
      type: categoryTypeEnum.OTHER,
    };

    const result = await controller.update(1, request);

    expect(result).toEqual({ id: 1 });
  });

  it('should remove a category', async () => {
    jest
      .spyOn(CategoryService.prototype, 'remove')
      .mockImplementation(async () => {
        return { id: 1 };
      });

    const result = await controller.remove(1);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw NotFoundException when category is not found', async () => {
    jest
      .spyOn(CategoryService.prototype, 'findOne')
      .mockRejectedValue(new NotFoundException('Category not found'));

    await expect(
      controller.findOne(999, CategoryResponsesEnum.BASE),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw UnprocessableEntityException when category creation fails', async () => {
    jest
      .spyOn(CategoryService.prototype, 'create')
      .mockRejectedValue(
        new UnprocessableEntityException('Category creation failed'),
      );

    const request: CreateCategoryRequest = {
      name: 'New Category',
      description: 'New Description',
      logo: 'https://example.com/logo.jpg',
      type: categoryTypeEnum.PROGRAMMING,
    };

    await expect(controller.create(request)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw NotFoundException when updating non-existent category', async () => {
    jest
      .spyOn(CategoryService.prototype, 'update')
      .mockRejectedValue(new NotFoundException('Category not found'));

    const request: UpdateCategoryRequest = {
      name: 'Updated Category',
      description: 'Updated Description',
    };

    await expect(controller.update(999, request)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when removing non-existent category', async () => {
    jest
      .spyOn(CategoryService.prototype, 'remove')
      .mockRejectedValue(new NotFoundException('Category not found'));

    await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
  });
});
