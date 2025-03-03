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
import {
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from '@tournament-app/types';
import {
  CreateTournamentRequest,
  UpdateTournamentRequest,
} from '../src/tournament/dto/requests.dto';

describe('TournamentController (e2e)', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let regularUserToken: string;
  let creatorToken: string;
  let groupAdminToken: string;

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
    const superAdmin = await request(app.getHttpServer())
      .get('/users/1') // Assuming user 1 is superadmin
      .expect(200);

    const regularUser = await request(app.getHttpServer())
      .get('/users/20') // Assuming user 20 is regular user
      .expect(200);

    const creator = await request(app.getHttpServer())
      .get('/users/3') // User who will create tournaments
      .expect(200);

    const groupAdmin = await request(app.getHttpServer())
      .get('/users/5') // User who is admin of a group
      .expect(200);

    // Login to get tokens
    const loginSuperAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: superAdmin.body.email, password: 'Password123!' });
    superAdminToken = loginSuperAdmin.body.accessToken;

    const loginRegularUser = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: regularUser.body.email, password: 'Password123!' });
    regularUserToken = loginRegularUser.body.accessToken;

    const loginCreator = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: creator.body.email, password: 'Password123!' });
    creatorToken = loginCreator.body.accessToken;

    const loginGroupAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: groupAdmin.body.email, password: 'Password123!' });
    groupAdminToken = loginGroupAdmin.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /tournaments', () => {
    const createDto: CreateTournamentRequest = {
      name: 'Test Tournament',
      description: 'Test Description',
      startDate: new Date(),
      endDate: new Date(),
      categoryId: 1,
      location: tournamentLocationEnum.ONLINE,
      tournamentTeamType: tournamentTeamTypeEnum.MIXED,
      tournamentType: tournamentTypeEnum.COMPETITION,
      isPublic: true,
      links: 'https://chess.com/tournament/123',
      maxParticipants: 8,
      country: 'US',
      isRanked: true,
      affiliatedGroupId: 1,
      creatorId: 1,
      locationId: 1,
    };

    it('should create tournament when user is authorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');

      const tournamentId = response.body.id;
      const tournament = await request(app.getHttpServer())
        .get(`/tournaments/${tournamentId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(200);

      expect(tournament.body.name).toBe(createDto.name);
    });

    it('should fail when creating tournament with invalid data', async () => {
      const invalidDto = {
        ...createDto,
        name: 'a', // Too short
        maxParticipants: 1, // Below minimum
      };

      await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should fail when user is not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/tournaments')
        .send(createDto)
        .expect(401);
    });
  });

  describe('GET /tournaments', () => {
    it('should return tournaments with MINI response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/tournaments?responseType=mini')
        .expect(200);

      expect(response.body.results[0]).toHaveProperty('id');
      expect(response.body.results[0]).toHaveProperty('name');
      expect(response.body.results[0]).toHaveProperty('type');
      expect(response.body.results[0]).toHaveProperty('startDate');
      expect(response.body.results[0]).not.toHaveProperty('description');
    });

    it('should return tournaments with MINI_WITH_LOGO response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/tournaments?responseType=mini-with-logo')
        .expect(200);

      expect(response.body.results[0]).toHaveProperty('logo');
      expect(response.body.results[0]).toHaveProperty('location');
      expect(response.body.results[0]).toHaveProperty('country');
    });

    it('should return tournaments with BASE response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/tournaments?responseType=base')
        .expect(200);

      expect(response.body.results[0]).toHaveProperty('description');
      expect(response.body.results[0]).toHaveProperty('teamType');
      expect(response.body.results[0]).toHaveProperty('creator');
      expect(response.body.results[0]).toHaveProperty('endDate');
    });

    it('should return tournaments with EXTENDED response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/tournaments?responseType=extended')
        .expect(200);

      expect(response.body.results[0]).toHaveProperty('createdAt');
      expect(response.body.results[0]).toHaveProperty('updatedAt');
      expect(response.body.results[0]).toHaveProperty(
        'isMultipleTeamsPerGroupAllowed',
      );
      expect(response.body.results[0]).toHaveProperty('isFakePlayersAllowed');
    });

    it('should filter tournaments by query parameters', async () => {
      const response = await request(app.getHttpServer()).get(
        '/tournaments?type=SINGLE_ELIMINATION&location=ONLINE&isPublic=true&locationId=2',
      );

      const tournaments = response.body.results;
      if (!tournaments) {
        return;
      }

      tournaments.forEach((tournament: any) => {
        expect(tournament.type).toBe('SINGLE_ELIMINATION');
        expect(tournament.location).toBe('ONLINE');
        expect(tournament.isPublic).toBe(true);
        expect(tournament.locationId).toBe(2);
      });
    });
  });

  describe('GET /tournaments/:id', () => {
    it('should return a single tournament', async () => {
      const response = await request(app.getHttpServer())
        .get('/tournaments/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent tournament', async () => {
      await request(app.getHttpServer()).get('/tournaments/999999').expect(404);
    });
  });

  describe('PATCH /tournaments/:id', () => {
    const updateDto: UpdateTournamentRequest = {
      name: 'Updated Tournament',
      description: 'Updated Description',
    };

    it('should update tournament when user is creator', async () => {
      const createDto: CreateTournamentRequest = {
        name: 'Test Tournament',
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(),
        categoryId: 1,
        location: tournamentLocationEnum.ONLINE,
        tournamentTeamType: tournamentTeamTypeEnum.MIXED,
        tournamentType: tournamentTypeEnum.COMPETITION,
        isPublic: true,
        links: 'https://chess.com/tournament/123',
        maxParticipants: 8,
        country: 'US',
        isRanked: true,
        affiliatedGroupId: 1,
        creatorId: 1,
        locationId: 1,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send(createDto)
        .expect(201);

      const tournamentId = createResponse.body.id;

      // Then update it
      const response = await request(app.getHttpServer())
        .patch(`/tournaments/${tournamentId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.id).toBe(tournamentId);

      const updatedTournament = await request(app.getHttpServer())
        .get(`/tournaments/${tournamentId}`)
        .expect(200);

      expect(updatedTournament.body.name).toBe(updateDto.name);
      expect(updatedTournament.body.description).toBe(updateDto.description);
    });

    it('should update tournament when user is group admin', async () => {
      // Assuming tournament 2 belongs to a group where the groupAdmin is admin
      await request(app.getHttpServer())
        .patch('/tournaments/2')
        .set('Authorization', `Bearer ${groupAdminToken}`)
        .send(updateDto)
        .expect(200);
    });

    it('should update any tournament when user is superadmin', async () => {
      await request(app.getHttpServer())
        .patch('/tournaments/1')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(updateDto)
        .expect(200);
    });

    it('should fail when regular user tries to update tournament', async () => {
      await request(app.getHttpServer())
        .patch('/tournaments/1')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(updateDto)
        .expect(403);
    });
  });

  describe('DELETE /tournaments/:id', () => {
    it('should delete tournament when user is creator', async () => {
      // First create a tournament
      const createDto: CreateTournamentRequest = {
        name: 'Test Tournament',
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(),
        categoryId: 1,
        location: tournamentLocationEnum.ONLINE,
        tournamentTeamType: tournamentTeamTypeEnum.MIXED,
        tournamentType: tournamentTypeEnum.COMPETITION,
        isPublic: true,
        links: 'https://chess.com/tournament/123',
        maxParticipants: 8,
        country: 'US',
        isRanked: true,
        affiliatedGroupId: 1,
        creatorId: 1,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/tournaments')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send(createDto)
        .expect(201);

      const tournamentId = createResponse.body.id;

      // Then delete it
      await request(app.getHttpServer())
        .delete(`/tournaments/${tournamentId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/tournaments/${tournamentId}`)
        .expect(404);
    });

    it('should delete tournament when user is superadmin', async () => {
      await request(app.getHttpServer())
        .delete('/tournaments/3')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });

    it('should fail when regular user tries to delete tournament', async () => {
      await request(app.getHttpServer())
        .delete('/tournaments/1')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });
});
