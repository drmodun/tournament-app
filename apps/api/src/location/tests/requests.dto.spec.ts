import { validate } from 'class-validator';
import {
  CreateLocationDto,
  UpdateLocationDto,
  LocationQuery,
} from '../dto/requests';

describe('Location DTOs', () => {
  describe('CreateLocationDto', () => {
    it('should validate a valid create request', async () => {
      const dto = new CreateLocationDto();
      dto.name = 'Test Location';
      dto.apiId = 'location123';
      dto.lat = 40.7128;
      dto.lng = -74.006;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail with missing name', async () => {
      const dto = new CreateLocationDto();
      dto.apiId = 'location123';
      dto.lat = 40.7128;
      dto.lng = -74.006;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with missing apiId', async () => {
      const dto = new CreateLocationDto();
      dto.name = 'Test Location';
      dto.lat = 40.7128;
      dto.lng = -74.006;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with missing lat', async () => {
      const dto = new CreateLocationDto();
      dto.name = 'Test Location';
      dto.apiId = 'location123';
      dto.lng = -74.006;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with missing lng', async () => {
      const dto = new CreateLocationDto();
      dto.name = 'Test Location';
      dto.apiId = 'location123';
      dto.lat = 40.7128;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail with missing required fields', async () => {
      const dto = new CreateLocationDto();
      const errors = await validate(dto);
      expect(errors.length).toBe(4); // name, apiId, lat, and lng are required
    });
  });

  describe('UpdateLocationDto', () => {
    it('should validate a valid update request with all fields', async () => {
      const dto = new UpdateLocationDto();
      dto.name = 'Updated Location';
      dto.apiId = 'updatedLocation123';
      dto.lat = 40.7128;
      dto.lng = -74.006;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate a valid update request with partial fields', async () => {
      const dto = new UpdateLocationDto();
      dto.name = 'Updated Location';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate an update with only lat', async () => {
      const dto = new UpdateLocationDto();
      dto.lat = 40.7128;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate an update with only lng', async () => {
      const dto = new UpdateLocationDto();
      dto.lng = -74.006;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate an empty update request', async () => {
      const dto = new UpdateLocationDto();
      const errors = await validate(dto);
      expect(errors.length).toBe(0); // All fields are optional
    });
  });

  describe('LocationQuery', () => {
    it('should validate a valid query with all optional fields', async () => {
      const dto = new LocationQuery();
      dto.name = 'Test';
      dto.apiId = 'location123';
      dto.lat = 40.7128;
      dto.lng = -74.006;
      dto.page = 1;
      dto.pageSize = 10;
      dto.field = 'name';
      dto.order = 'asc';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate a query with no fields', async () => {
      const dto = new LocationQuery();
      const errors = await validate(dto);
      expect(errors.length).toBe(0); // All fields are optional
    });

    it('should validate a query with some fields', async () => {
      const dto = new LocationQuery();
      dto.name = 'Test';
      dto.page = 1;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate a query with coordinates', async () => {
      const dto = new LocationQuery();
      dto.lat = 40.7128;
      dto.lng = -74.006;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
