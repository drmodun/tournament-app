import { validate } from 'class-validator';
import { CreateLFGRequest, UpdateLFGRequest } from '../dto/requests';
import { plainToInstance } from 'class-transformer';

describe('LFG Request DTOs', () => {
  describe('CreateLFGRequest', () => {
    it('should validate a valid create request', async () => {
      const dto = plainToInstance(CreateLFGRequest, {
        message: 'Looking for team members for competitive tournament',
        categoryIds: [1, 2, 3],
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with too short message', async () => {
      const dto = plainToInstance(CreateLFGRequest, {
        message: 'short',
        categoryIds: [1],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail with too long message', async () => {
      const dto = plainToInstance(CreateLFGRequest, {
        message: 'a'.repeat(751),
        categoryIds: [1],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail without categoryIds', async () => {
      const dto = plainToInstance(CreateLFGRequest, {
        message: 'Looking for team members for competitive tournament',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isArray');
    });

    it('should transform string categoryIds to numbers', async () => {
      const dto = plainToInstance(CreateLFGRequest, {
        message: 'Looking for team members for competitive tournament',
        categoryIds: ['1', '2', '3'],
      });

      expect(dto.categoryIds).toEqual([1, 2, 3]);
    });
  });

  describe('UpdateLFGRequest', () => {
    it('should validate a valid update request with all fields', async () => {
      const dto = plainToInstance(UpdateLFGRequest, {
        message: 'Updated message for LFG',
        categoryIds: [1, 2, 3],
      });

      const errors = await validate(dto);
      console.log(errors.length);
      expect(errors.length).toBe(0);
    });

    it('should validate a valid update request with partial fields', async () => {
      const dto = plainToInstance(UpdateLFGRequest, {
        message: 'Updated message for LFG',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with too short message if provided', async () => {
      const dto = plainToInstance(UpdateLFGRequest, {
        message: 'short',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should transform string categoryIds to numbers when provided', async () => {
      const dto = plainToInstance(UpdateLFGRequest, {
        categoryIds: ['1', '2', '3'],
      });

      expect(dto.categoryIds).toEqual([1, 2, 3]);
    });

    it('should validate an empty update request', async () => {
      const dto = plainToInstance(UpdateLFGRequest, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
