import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PostgresExceptionFilter } from '../src/base/exception/postgresExceptionFilter';
import { Reflector } from '@nestjs/core';
import { NoValuesToSetExceptionFilter } from '../src/base/exception/noValuesToSetExceptionFilter';
import { LocationResponsesEnum } from '@tournament-app/types';
import {
  CreateLocationDto,
  UpdateLocationDto,
} from 'src/location/dto/requests';
import { AuthModule } from 'src/auth/auth.module';

const checkLinksOnDefault = (links: any, baseLink: string) => {
  expect(links.first).toEqual(`${baseLink}&page=1`);
  expect(links.prev).toEqual(`${baseLink}&page=0`);
  expect(links.next).toEqual(`${baseLink}&page=2`);
};

describe('LocationController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdLocationId: number;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    app.useGlobalFilters(
      new PostgresExceptionFilter(),
      new NoValuesToSetExceptionFilter(),
    );

    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Password123!' });

    authToken = loginResponse.body.accessToken;
  });

  afterEach(async () => {
    // Clean up created test location if it exists
    if (createdLocationId) {
      try {
        await request(app.getHttpServer())
          .delete(`/locations/${createdLocationId}`)
          .set('Authorization', `Bearer ${authToken}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }

    await app.close();
  });

  describe('GET /locations', () => {
    it('should return a valid query with base return type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/locations?responseType=${LocationResponsesEnum.BASE}`)
        .expect(200);

      const { results, metadata } = response.body;

      expect(results.length).toBeGreaterThanOrEqual(0);
      if (results.length > 0) {
        expect(Object.keys(results[0])).toEqual([
          'id',
          'apiId',
          'name',
          'coordinates',
        ]);
      }

      expect(metadata.pagination).toBeDefined();
      expect(metadata.links).toBeDefined();
      expect(metadata.query).toBeDefined();

      checkLinksOnDefault(
        metadata.links,
        `/locations?responseType=${LocationResponsesEnum.BASE}`,
      );
    });

    it('should return a valid query with extended return type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/locations?responseType=${LocationResponsesEnum.EXTENDED}`)
        .expect(200);

      const { results, metadata } = response.body;

      expect(results.length).toBeGreaterThanOrEqual(0);
      if (results.length > 0) {
        expect(Object.keys(results[0])).toEqual([
          'id',
          'apiId',
          'name',
          'coordinates',
          'createdAt',
        ]);
      }

      checkLinksOnDefault(
        metadata.links,
        `/locations?responseType=${LocationResponsesEnum.EXTENDED}`,
      );
    });

    it('should filter locations by name', async () => {
      // First create a location with a specific name to search for
      const locationData: CreateLocationDto = {
        name: 'TestSearchLocation',
        apiId: 'searchLocation123',
        lat: 40.7128,
        lng: -74.006,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/locations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(locationData)
        .expect(201);

      createdLocationId = createResponse.body.id;

      // Now search for it
      const response = await request(app.getHttpServer())
        .get('/locations?name=TestSearchLocation')
        .expect(200);

      const { results } = response.body;
      expect(results.length).toBeGreaterThan(0);

      const foundLocation = results.find(
        (location) => location.name === 'TestSearchLocation',
      );
      expect(foundLocation).toBeDefined();
    });
  });

  describe('GET /locations/:id', () => {
    it('should return a location by id', async () => {
      // First create a location to get
      const locationData: CreateLocationDto = {
        name: 'TestGetLocation',
        apiId: 'getLocation123',
        lat: 40.7128,
        lng: -74.006,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/locations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(locationData)
        .expect(201);

      createdLocationId = createResponse.body.id;

      // Now get it by ID with specific response type
      const response = await request(app.getHttpServer())
        .get(
          `/locations/${createdLocationId}?responseType=${LocationResponsesEnum.BASE}`,
        )
        .expect(200);

      expect(response.body).toHaveProperty('id', createdLocationId);
      expect(response.body).toHaveProperty('name', 'TestGetLocation');
      expect(response.body).toHaveProperty('apiId', 'getLocation123');
      expect(response.body).toHaveProperty('coordinates');
      expect(response.body.coordinates).toHaveLength(2);
      expect(response.body.coordinates[0]).toBeCloseTo(-74.006);
      expect(response.body.coordinates[1]).toBeCloseTo(40.7128);
    });

    it('should return 404 for non-existent location', async () => {
      await request(app.getHttpServer()).get('/locations/999999').expect(404);
    });
  });

  describe('GET /locations/map', () => {
    it('should return all locations', async () => {
      const response = await request(app.getHttpServer())
        .get(`/locations/map`)
        .expect(200);

      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('coordinates');

      expect(response.body.length).toBeGreaterThan(25);
    });
  });

  describe('POST /locations', () => {
    it('should create a new location when authenticated as admin', async () => {
      const locationData: CreateLocationDto = {
        name: 'New Test Location',
        apiId: 'newTestLocation123',
        lat: 34.0522,
        lng: -118.2437,
      };

      const response = await request(app.getHttpServer())
        .post('/locations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(locationData)
        .expect(201);

      createdLocationId = response.body.id;

      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('id');
    });

    it('should return 401 when creating location without auth', async () => {
      const locationData: CreateLocationDto = {
        name: 'Unauthorized Location',
        apiId: 'unauthorized123',
        lat: 34.0522,
        lng: -118.2437,
      };

      await request(app.getHttpServer())
        .post('/locations')
        .send(locationData)
        .expect(401);
    });

    it('should return 400 when creating location with invalid data', async () => {
      const invalidLocationData = {
        name: 'Invalid Location',
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/locations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLocationData)
        .expect(400);
    });
  });

  describe('PATCH /locations/:id', () => {
    it('should update a location when authenticated', async () => {
      // First create a location to update
      const locationData: CreateLocationDto = {
        name: 'Location To Update',
        apiId: 'locationToUpdate123',
        lat: 40.7128,
        lng: -74.006,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/locations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(locationData)
        .expect(201);

      createdLocationId = createResponse.body.id;

      // Now update it
      const updateData: UpdateLocationDto = {
        name: 'Updated Location Name',
        lat: 34.0522,
        lng: -118.2437,
      };

      const response = await request(app.getHttpServer())
        .patch(`/locations/${createdLocationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdLocationId);

      // Verify the update
      const getResponse = await request(app.getHttpServer())
        .get(
          `/locations/${createdLocationId}?responseType=${LocationResponsesEnum.BASE}`,
        )
        .expect(200);

      expect(getResponse.body).toHaveProperty('name', 'Updated Location Name');
      expect(getResponse.body.coordinates[0]).toBeCloseTo(-118.2437);
      expect(getResponse.body.coordinates[1]).toBeCloseTo(34.0522);
    });

    it('should return 401 when updating location without auth', async () => {
      const updateData: UpdateLocationDto = {
        name: 'Unauthorized Update',
      };

      await request(app.getHttpServer())
        .patch('/locations/1')
        .send(updateData)
        .expect(401);
    });

    it('should return 404 when updating non-existent location', async () => {
      const updateData: UpdateLocationDto = {
        name: 'Non-existent Location Update',
      };

      await request(app.getHttpServer())
        .patch('/locations/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /locations/:id', () => {
    it('should delete a location when authenticated as admin', async () => {
      // First create a location to delete
      const createResponse = await request(app.getHttpServer())
        .post('/locations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Location to Delete',
          apiId: 'locationToDelete123',
          lat: 40.7128,
          lng: -74.006,
        });

      const locationId = createResponse.body.id;

      // Then delete it
      await request(app.getHttpServer())
        .delete(`/locations/${locationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/locations/${locationId}`)
        .expect(404);

      // Clear the createdLocationId since we've already deleted it
      createdLocationId = null;
    });

    it('should return 401 when deleting location without auth', async () => {
      await request(app.getHttpServer()).delete('/locations/1').expect(401);
    });

    it('should return 404 when deleting non-existent location', async () => {
      await request(app.getHttpServer())
        .delete('/locations/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
