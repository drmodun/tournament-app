import { validate } from 'class-validator';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryQuery,
  UploadCategoryLogoRequest,
} from '../dto/requests.dto';
import { categoryTypeEnum } from '@tournament-app/types';

describe('Category DTOs', () => {
  describe('CreateCategoryRequest', () => {
    it('should validate a valid create request', async () => {
      const dto = new CreateCategoryRequest();
      dto.name = 'Test Category';
      dto.description = 'Test Description';
      dto.logo = 'https://example.com/logo.jpg';
      dto.type = categoryTypeEnum.OTHER;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with short name', async () => {
      const dto = new CreateCategoryRequest();
      dto.name = 'Te';
      dto.description = 'Test Description';
      dto.logo = 'https://example.com/logo.jpg';
      dto.type = categoryTypeEnum.OTHER;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail with long name', async () => {
      const dto = new CreateCategoryRequest();
      dto.name = 'T'.repeat(31);
      dto.description = 'Test Description';
      dto.logo = 'https://example.com/logo.jpg';
      dto.type = categoryTypeEnum.OTHER;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail with missing required fields', async () => {
      const dto = new CreateCategoryRequest();
      const errors = await validate(dto);
      expect(errors.length).toBe(3); // name, description, and type are required
    });
  });

  describe('UpdateCategoryRequest', () => {
    it('should validate a valid update request with all fields', async () => {
      const dto = new UpdateCategoryRequest();
      dto.name = 'Updated Category';
      dto.description = 'Updated Description';
      dto.type = categoryTypeEnum.OTHER;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate a valid update request with partial fields', async () => {
      const dto = new UpdateCategoryRequest();
      dto.name = 'Updated Category';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with invalid name length', async () => {
      const dto = new UpdateCategoryRequest();
      dto.name = 'T'.repeat(31);

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should validate an empty update request', async () => {
      const dto = new UpdateCategoryRequest();
      const errors = await validate(dto);
      expect(errors.length).toBe(0); // All fields are optional
    });
  });

  describe('CategoryQuery', () => {
    it('should validate a valid query with all optional fields', async () => {
      const dto = new CategoryQuery();
      dto.name = 'Test';
      dto.type = 'Test Type';
      dto.page = 1;
      dto.pageSize = 10;
      dto.field = 'name';
      dto.order = 'asc';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate a query with no fields', async () => {
      const dto = new CategoryQuery();
      const errors = await validate(dto);
      expect(errors.length).toBe(0); // All fields are optional
    });

    it('should validate a query with some fields', async () => {
      const dto = new CategoryQuery();
      dto.name = 'Test';
      dto.page = 1;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('UploadCategoryLogoRequest', () => {
    it('should validate a valid logo upload request', async () => {
      const dto = new UploadCategoryLogoRequest();
      dto.logo = 'https://example.com/logo.jpg';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
