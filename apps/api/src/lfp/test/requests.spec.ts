import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateLFPDto, UpdateLFPDto, LFPQueryDto } from '../dto/requests';
import {
  createLFPExample,
  updateLFPExample,
  lfpQueryExample,
} from '../dto/examples';

describe('LFP DTOs', () => {
  describe('CreateLFPDto', () => {
    it('should validate a valid create DTO', async () => {
      const dto = plainToInstance(CreateLFPDto, createLFPExample);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with empty message', async () => {
      const dto = plainToInstance(CreateLFPDto, { message: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with too short message', async () => {
      const dto = plainToInstance(CreateLFPDto, { message: 'short' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail validation with too long message', async () => {
      const dto = plainToInstance(CreateLFPDto, {
        message: 'a'.repeat(2001),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });

  describe('UpdateLFPDto', () => {
    it('should validate a valid update DTO', async () => {
      const dto = plainToInstance(UpdateLFPDto, updateLFPExample);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate an empty update DTO', async () => {
      const dto = plainToInstance(UpdateLFPDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with optional fields', async () => {
      const dto = plainToInstance(UpdateLFPDto, {
        message: 'Updated message',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('LFPQueryDto', () => {
    it('should validate a valid query DTO', async () => {
      const dto = plainToInstance(LFPQueryDto, lfpQueryExample);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate an empty query DTO', async () => {
      const dto = plainToInstance(LFPQueryDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate with optional fields', async () => {
      const dto = plainToInstance(LFPQueryDto, {
        groupId: 1,
        categoryId: 1,
        message: 'test',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid lat/lng', async () => {
      const dto = plainToInstance(LFPQueryDto, {
        lat: 'invalid',
        lng: 'invalid',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(2);
      expect(errors[0].constraints).toHaveProperty('isNumber');
      expect(errors[1].constraints).toHaveProperty('isNumber');
    });

    it('should transform string numbers to numbers', async () => {
      const dto = plainToInstance(LFPQueryDto, {
        lat: '12.345',
        lng: '12.345',
        groupId: '1',
        categoryId: '1',
      });
      expect(typeof dto.lat).toBe('number');
      expect(typeof dto.lng).toBe('number');
      expect(typeof dto.groupId).toBe('number');
    });
  });
});
