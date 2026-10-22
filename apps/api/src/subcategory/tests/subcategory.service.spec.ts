import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SubcategoryService } from '../subcategory.service';
import { SubcategoryDrizzleRepository } from '../subcategory.repository';

describe('SubcategoryService', () => {
  let service: SubcategoryService;
  let repository: jest.Mocked<SubcategoryDrizzleRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubcategoryService,
        {
          provide: SubcategoryDrizzleRepository,
          useValue: {
            createEntity: jest.fn(),
            getQuery: jest.fn(),
            getSingleQuery: jest.fn(),
            updateEntity: jest.fn(),
            deleteEntity: jest.fn(),
            getCategoryId: jest.fn(),
            countTournaments: jest.fn(),
            isInCategory: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(SubcategoryService);
    repository = module.get(SubcategoryDrizzleRepository);
  });

  describe('update', () => {
    it('updates without checking tournaments when the category stays', async () => {
      repository.updateEntity.mockResolvedValue([{ id: 3 }]);

      await expect(service.update(3, { name: 'Blitz' })).resolves.toEqual({
        id: 3,
      });
      expect(repository.countTournaments).not.toHaveBeenCalled();
    });

    it('moves an unused subcategory to another category', async () => {
      repository.getCategoryId.mockResolvedValue(1);
      repository.countTournaments.mockResolvedValue(0);
      repository.updateEntity.mockResolvedValue([{ id: 3 }]);

      await service.update(3, { categoryId: 2 });

      expect(repository.updateEntity).toHaveBeenCalledWith(3, {
        categoryId: 2,
      });
    });

    it('refuses to move a subcategory tournaments use', async () => {
      repository.getCategoryId.mockResolvedValue(1);
      repository.countTournaments.mockResolvedValue(2);

      await expect(service.update(3, { categoryId: 2 })).rejects.toThrow(
        ConflictException,
      );
      expect(repository.updateEntity).not.toHaveBeenCalled();
    });

    it('allows sending the category it already has', async () => {
      repository.getCategoryId.mockResolvedValue(1);
      repository.updateEntity.mockResolvedValue([{ id: 3 }]);

      await service.update(3, { categoryId: 1 });

      expect(repository.countTournaments).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for an unknown subcategory', async () => {
      repository.getCategoryId.mockResolvedValue(undefined);

      await expect(service.update(99, { categoryId: 2 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkBelongsToCategory', () => {
    it('passes for a subcategory of the category', async () => {
      repository.isInCategory.mockResolvedValue(true);

      await expect(service.checkBelongsToCategory(3, 1)).resolves.toBe(
        undefined,
      );
    });

    it('refuses a subcategory of another category', async () => {
      repository.isInCategory.mockResolvedValue(false);

      await expect(service.checkBelongsToCategory(3, 1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  it('throws NotFoundException when deleting an unknown subcategory', async () => {
    repository.deleteEntity.mockResolvedValue([] as never);

    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });
});
