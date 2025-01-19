import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateStageRequest,
  UpdateStageRequest,
  StageQuery,
} from '../dto/requests.dto';
import { stageTypeEnum } from '@tournament-app/types';

describe('StageRequestsDtos', () => {
  describe('CreateStageRequest', () => {
    it('should fail validation with empty object', async () => {
      const body = {};
      const createRequest = plainToInstance(CreateStageRequest, body);
      const errors = await validate(createRequest);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.map((x) => x.property)).toContain('name');
      expect(errors.map((x) => x.property)).toContain('startDate');
      expect(errors.map((x) => x.property)).toContain('tournamentId');
    });

    it('should fail validation with invalid data types', async () => {
      const body = {
        name: 123,
        description: {},
        stageType: 'invalid_type',
        tournamentId: 'not_a_number',
        startDate: 'invalid_date',
        endDate: 'invalid_date',
      };
      const createRequest = plainToInstance(CreateStageRequest, body);
      const errors = await validate(createRequest);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation with invalid string lengths', async () => {
      const body = {
        name: 'ab', // too short
        description: 'short', // too short
        stageType: stageTypeEnum.KNOCKOUT,
        tournamentId: 1,
        startDate: new Date(new Date().getTime() - 100),
        endDate: new Date(new Date().getTime() + 100),
      };
      const createRequest = plainToInstance(CreateStageRequest, body);
      const errors = await validate(createRequest);
      console.log(errors);
      expect(errors.length).toBe(2);
      expect(errors.map((x) => x.property)).toContain('name');
      expect(errors.map((x) => x.property)).toContain('description');
    });

    it('should pass validation with valid data', async () => {
      const body = {
        name: 'Valid Stage Name',
        description:
          'This is a valid stage description that meets the minimum length requirement',
        stageType: stageTypeEnum.KNOCKOUT,
        tournamentId: 1,
        startDate: new Date(new Date().getTime() - 100),
        endDate: new Date(),
      };
      const createRequest = plainToInstance(CreateStageRequest, body);
      const errors = await validate(createRequest);
      console.log(errors);
      expect(errors.length).toBe(0);
    });
  });

  describe('UpdateStageRequest', () => {
    it('should pass validation with empty object', async () => {
      const body = {};
      const updateRequest = plainToInstance(UpdateStageRequest, body);
      const errors = await validate(updateRequest);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid data types', async () => {
      const body = {
        name: 123,
        description: {},
        stageType: 'invalid_type',
        startDate: 'invalid_date',
        endDate: 'invalid_date',
      };
      const updateRequest = plainToInstance(UpdateStageRequest, body);
      const errors = await validate(updateRequest);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation with valid data', async () => {
      const body = {
        name: 'Valid Stage Name',
        description:
          'This is a valid stage description that meets the minimum length requirement',
        stageType: stageTypeEnum.KNOCKOUT,
        startDate: new Date(),
        endDate: new Date(),
      };
      const updateRequest = plainToInstance(UpdateStageRequest, body);
      const errors = await validate(updateRequest);
      expect(errors.length).toBe(0);
    });
  });

  describe('StageQuery', () => {
    it('should pass validation with empty object', async () => {
      const body = {};
      const query = plainToInstance(StageQuery, body);
      const errors = await validate(query);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid data types', async () => {
      const body = {
        page: 'not_a_number',
        limit: 'not_a_number',
        sortBy: 123,
        sortOrder: 456,
      };
      const query = plainToInstance(StageQuery, body);
      const errors = await validate(query);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation with valid data', async () => {
      const body = {
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      };
      const query = plainToInstance(StageQuery, body);
      const errors = await validate(query);
      expect(errors.length).toBe(0);
    });
  });
});
