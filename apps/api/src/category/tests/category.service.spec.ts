import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../category.service';
import { CategoryDrizzleRepository } from '../category.repository';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PostgresError } from 'postgres';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../dto/requests.dto';
import { CategoryResponsesEnum, categoryTypeEnum } from '^tournament-app/types';

describe('CategoryService', () => {
  let service: CategoryService;

  jest.mock('../category.repository');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService, CategoryDrizzleRepository],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a category', async () => {
    jest
      .spyOn(CategoryDrizzleRepository.prototype, 'createEntity')
      .mockResolvedValue([{ id: 1 }]);

    const request: CreateCategoryRequest = {
      name: 'Test Category',
      description: 'Test Description',
      logo: 'https://example.com/logo.jpg',
      type: categoryTypeEnum.PROGRAMMING,
    };

    const result = await service.create(request);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw an unprocessable entity exception when creating a category fails', async () => {
    jest
      .spyOn(CategoryDrizzleRepository.prototype, 'createEntity')
      .mockResolvedValue([]);

    const request: CreateCategoryRequest = {
      name: 'Test Category',
      description: 'Test Description',
      logo: 'https://example.com/logo.jpg',
      type: categoryTypeEnum.OTHER,
    };

    await expect(service.create(request)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw an error when creating a category with a duplicate name', async () => {
    jest
      .spyOn(CategoryDrizzleRepository.prototype, 'createEntity')
      .mockRejectedValue(new PostgresError('23505'));

    const request: CreateCategoryRequest = {
      name: 'Test Category',
      description: 'Test Description',
      logo: 'https://example.com/logo.jpg',
      type: categoryTypeEnum.OTHER,
    };

    await expect(service.create(request)).rejects.toThrow(PostgresError);
  });

  it('should find all categories', async () => {
    const mockCategories = [
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2' },
    ];

    jest
      .spyOn(CategoryDrizzleRepository.prototype, 'getQuery')
      .mockResolvedValue(mockCategories);

    const result = await service.findAll({
      responseType: CategoryResponsesEnum.BASE,
    });

    expect(result).toEqual(mockCategories);
  });

  it('should find one category', async () => {
    const mockCategory = [{ id: 1, name: 'Category 1' }];

    jest
      .spyOn(CategoryDrizzleRepository.prototype, 'getSingleQuery')
      .mockResolvedValue(mockCategory);

    const result = await service.findOne(1, CategoryResponsesEnum.BASE);

    expect(result).toEqual(mockCategory[0]);
  });

  it('should throw not found exception when category does not exist', async () => {
    jest
      .spyOn(CategoryDrizzleRepository.prototype, 'getSingleQuery')
      .mockResolvedValue([]);

    await expect(
      service.findOne(999, CategoryResponsesEnum.BASE),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update a category', async () => {
    jest
      .spyOn(CategoryDrizzleRepository.prototype, 'updateEntity')
      .mockResolvedValue([{ id: 1 }]);

    const request: UpdateCategoryRequest = {
      name: 'Updated Category',
      description: 'Updated Description',
      type: categoryTypeEnum.OTHER,
    };

    const result = await service.update(1, request);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw not found exception when updating non-existent category', async () => {
    jest
      .spyOn(CategoryDrizzleRepository.prototype, 'updateEntity')
      .mockResolvedValue(null);

    const request: UpdateCategoryRequest = {
      name: 'Updated Category',
    };

    await expect(service.update(999, request)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should remove a category', async () => {
    jest
      .spyOn(CategoryDrizzleRepository.prototype, 'deleteEntity')
      .mockResolvedValue([{ id: 1 }]);

    const result = await service.remove(1);

    expect(result).toEqual({ id: 1 });
  });

  it('should throw not found exception when removing non-existent category', async () => {
    jest
      .spyOn(CategoryDrizzleRepository.prototype, 'deleteEntity')
      .mockResolvedValue([]);

    await expect(service.remove(999)).rejects.toThrow(NotFoundException);
  });
});
