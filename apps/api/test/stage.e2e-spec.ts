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
import { stageTypeEnum } from '@tournament-app/types';
import {
  CreateStageRequest,
  UpdateStageRequest,
} from '../src/stage/dto/requests.dto';

describe('StageController (e2e)', () => {
  let app: INestApplication;
  let tournamentAdminToken: string;
  let regularUserToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
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

    // Get tokens for different user roles
    const tournamentAdmin = await request(app.getHttpServer())
      .get('/users/3') // User who is admin of a tournament
      .expect(200);

    const regularUser = await request(app.getHttpServer())
      .get('/users/20') // Regular user
      .expect(200);

    // Login to get tokens
    const loginTournamentAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: tournamentAdmin.body.email, password: 'Password123!' });
    tournamentAdminToken = loginTournamentAdmin.body.accessToken;

    const loginRegularUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: regularUser.body.email, password: 'Password123!' });
    regularUserToken = loginRegularUser.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /stages/:tournamentId', () => {
    const createDto: CreateStageRequest = {
      name: 'Test Stage',
      tournamentId: 1,
      description: 'Test Description',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // tomorrow
      stageType: stageTypeEnum.KNOCKOUT,
      locationId: 1,
    };

    it('should create a stage when user is tournament admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/stages/1')
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('should not create a stage when user is not tournament admin', async () => {
      await request(app.getHttpServer())
        .post('/stages/1')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(createDto)
        .expect(403);
    });

    it('should not create a stage with invalid data', async () => {
      const invalidDto = {
        ...createDto,
        name: '', // invalid name
      };

      await request(app.getHttpServer())
        .post('/stages/1')
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /stages', () => {
    it('should return stages with MINI response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/stages?responseType=mini')
        .expect(200);

      expect(response.body.results).toBeDefined();
      expect(response.body.metadata).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);

      // Verify MINI response type fields
      const stage = response.body.results[0];
      expect(stage).toHaveProperty('id');
      expect(stage).toHaveProperty('name');
      expect(stage).not.toHaveProperty('tournament');
    });

    it('should return stages with BASE response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/stages?responseType=base')
        .expect(200);

      expect(response.body.results).toBeDefined();
      const stage = response.body.results[0];

      // Verify BASE response type fields
      expect(stage).toHaveProperty('id');
      expect(stage).toHaveProperty('name');
      expect(stage).toHaveProperty('startDate');
      expect(stage).toHaveProperty('endDate');
      expect(stage).toHaveProperty('description');
      expect(stage).toHaveProperty('stageType');
      expect(stage).toHaveProperty('rostersParticipating');
      expect(stage).not.toHaveProperty('tournament');
    });

    it('should return stages with WITH_TOURNAMENT response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/stages?responseType=withTournament')
        .expect(200);

      const stage = response.body.results[0];

      // Verify WITH_TOURNAMENT response type fields
      expect(stage.tournament).toBeDefined();
      expect(stage.tournament).toHaveProperty('id');
      expect(stage.tournament).toHaveProperty('name');
      expect(stage.tournament).toHaveProperty('type');
      expect(stage.tournament).toHaveProperty('startDate');
      expect(stage.tournament).toHaveProperty('locationId');
    });

    it('should return stages with EXTENDED response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/stages?responseType=extended')
        .expect(200);

      const stage = response.body.results[0];

      // Verify EXTENDED response type fields
      expect(stage).toHaveProperty('createdAt');
      expect(stage).toHaveProperty('updatedAt');
    });

    it('should return stages with WITH_EXTENDED_TOURNAMENT response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/stages?responseType=withExtendedTournament')
        .expect(200);

      const stage = response.body.results[0];

      // Verify WITH_EXTENDED_TOURNAMENT response type fields
      expect(stage).toHaveProperty('createdAt');
      expect(stage).toHaveProperty('updatedAt');
      expect(stage.tournament).toBeDefined();
    });

    it('should filter stages by tournament ID', async () => {
      const response = await request(app.getHttpServer()).get(
        '/stages?tournamentId=2',
      );

      expect(response.body.results).toBeDefined();
      expect(
        response.body.results.every((stage) => stage.tournamentId == 2),
      ).toBe(true);
    });

    it('should filter stages by stage type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/stages?stageType=${stageTypeEnum.KNOCKOUT}`)
        .expect(200);

      expect(response.body.results).toBeDefined();
      expect(
        response.body.results.every(
          (stage) => stage.stageType === stageTypeEnum.KNOCKOUT,
        ),
      ).toBe(true);
    });

    it('should sort stages by start date ascending', async () => {
      const response = await request(app.getHttpServer())
        .get('/stages?field=startDate&order=asc')
        .expect(200);

      const stages = response.body.results;
      for (let i = 1; i < stages.length; i++) {
        const prevDate = new Date(stages[i - 1].startDate).getTime();
        const currDate = new Date(stages[i].startDate).getTime();
        expect(prevDate).toBeLessThanOrEqual(currDate);
      }
    });

    it('should sort stages by name descending', async () => {
      const response = await request(app.getHttpServer())
        .get('/stages?field=name&order=desc')
        .expect(200);

      const stages = response.body.results;
      for (let i = 1; i < stages.length; i++) {
        const prev = stages[i - 1].name.toLowerCase();
        const curr = stages[i].name.toLowerCase();
        expect(prev >= curr).toBe(true);
      }
    });

    it('should paginate results correctly', async () => {
      const pageSize = 5;
      const response = await request(app.getHttpServer())
        .get(`/stages?pageSize=${pageSize}&page=1`)
        .expect(200);

      expect(response.body.results.length).toBeLessThanOrEqual(pageSize);
      expect(response.body.metadata).toBeDefined();
    });

    it('should combine multiple query parameters', async () => {
      const response = await request(app.getHttpServer()).get(
        '/stages?responseType=withTournament&stageType=knockout&field=startDate&order=asc&pageSize=5&page=1',
      );

      const stages = response.body.results;
      expect(stages?.length).toBeLessThanOrEqual(5);
      expect(stages[0]?.tournament).toBeDefined();
      expect(
        stages?.every((stage) => stage?.stageType === stageTypeEnum.KNOCKOUT),
      ).toBe(true);

      // Verify sorting
      for (let i = 1; i < stages.length; i++) {
        const prevDate = new Date(stages[i - 1].startDate).getTime();
        const currDate = new Date(stages[i].startDate).getTime();
        expect(prevDate).toBeLessThanOrEqual(currDate);
      }
    });
  });

  describe('GET /stages/:stageId', () => {
    it('should return a single stage', async () => {
      const response = await request(app.getHttpServer())
        .get('/stages/1')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(1);
    });

    it('should return 404 for non-existent stage', async () => {
      await request(app.getHttpServer()).get('/stages/999999').expect(404);
    });

    it('should return stage with tournament data when requested', async () => {
      const response = await request(app.getHttpServer())
        .get('/stages/1?responseType=withTournament')
        .expect(200);

      expect(response.body.tournament).toBeDefined();
    });
  });

  describe('PATCH /stages/:tournamentId/:stageId', () => {
    const updateDto: UpdateStageRequest = {
      name: 'Updated Stage',
      description: 'Updated Description',
    };

    it('should update a stage when user is tournament admin', async () => {
      const response = await request(app.getHttpServer())
        .patch('/stages/1/1')
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.id).toBeDefined();
    });

    it('should not update a stage when user is not tournament admin', async () => {
      await request(app.getHttpServer())
        .patch('/stages/1/1')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(updateDto)
        .expect(403);
    });

    it('should not update a stage with invalid data', async () => {
      const invalidDto = {
        name: '', // invalid name
      };

      await request(app.getHttpServer())
        .patch('/stages/1/1')
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('DELETE /stages/:tournamentId/:stageId', () => {
    it('should delete a stage when user is tournament admin', async () => {
      await request(app.getHttpServer())
        .delete('/stages/1/1')
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .expect(200);

      // Verify stage is deleted
      await request(app.getHttpServer()).get('/stages/1').expect(404);
    });

    it('should not delete a stage when user is not tournament admin', async () => {
      await request(app.getHttpServer())
        .delete('/stages/1/1')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should return 404 when deleting non-existent stage', async () => {
      await request(app.getHttpServer())
        .delete('/stages/1/999999')
        .set('Authorization', `Bearer ${tournamentAdminToken}`)
        .expect(404);
    });
  });
});
