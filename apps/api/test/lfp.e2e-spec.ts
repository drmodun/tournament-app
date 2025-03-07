import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateLFPDto, UpdateLFPDto } from '../src/lfp/dto/requests';
import { NoValuesToSetExceptionFilter } from 'src/base/exception/noValuesToSetExceptionFilter';
import { PostgresExceptionFilter } from 'src/base/exception/postgresExceptionFilter';
import { Reflector } from '@nestjs/core';
import { AuthModule } from 'src/auth/auth.module';
import { groupFocusEnum, groupTypeEnum } from '@tournament-app/types';
import { CreateGroupRequest } from 'src/group/dto/requests.dto';

describe('LFPController (e2e)', () => {
  let app: INestApplication;
  let adminAuthToken: string;
  let userAuthToken: string;
  let groupId: number;
  let lfpId: number;

  beforeAll(async () => {
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

    const email = await request(app.getHttpServer())
      .get('/users/3')
      .expect(200);

    const otherEmail = await request(app.getHttpServer())
      .get('/users/41')
      .expect(200);

    // Get admin auth token
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: email.body.email, password: 'Password123!' })
      .expect(201);

    adminAuthToken = adminLoginResponse.body.accessToken;

    // Get user auth token
    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: otherEmail.body.email, password: 'Password123!' })
      .expect(201);

    userAuthToken = userLoginResponse.body.accessToken;

    // Create a test group for LFP operations
    const groupResponse = await request(app.getHttpServer())
      .post('/groups')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: 'Test LFP Group',
        description: 'Group for LFP testing',
        abbreviation: 'TLG',
        country: 'Test Country',
        type: groupTypeEnum.PUBLIC,
        focus: groupFocusEnum.HYBRID,
        logo: 'logo.png',
        locationId: 1,
      } satisfies CreateGroupRequest)
      .expect(201);

    groupId = groupResponse.body.id;

    // Make admin a group admin
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /lfp/:groupId', () => {
    it('should create a new LFP post when authenticated as group admin', async () => {
      const lfpData: CreateLFPDto = {
        message: 'Looking for players for our team',
      };

      const response = await request(app.getHttpServer())
        .post(`/lfp/${groupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(lfpData)
        .expect(201);

      expect(response.body).toHaveProperty('id');

      lfpId = response.body.id;
    });

    it('should return 401 when creating LFP without auth', async () => {
      const lfpData: CreateLFPDto = {
        message: 'Looking for players',
      };

      await request(app.getHttpServer())
        .post(`/lfp/${groupId}`)
        .send(lfpData)
        .expect(401);
    });

    it('should return 403 when creating LFP as non-admin member', async () => {
      const lfpData: CreateLFPDto = {
        message: 'Looking for players',
      };

      await request(app.getHttpServer())
        .post(`/lfp/${groupId}`)
        .set('Authorization', `Bearer ${userAuthToken}`)
        .send(lfpData)
        .expect(403);
    });

    it('should return 400 when creating LFP with invalid data', async () => {
      const invalidData = {
        message: 'too short', // Should be longer based on validation
      };

      await request(app.getHttpServer())
        .post(`/lfp/${groupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /lfp/:groupId', () => {
    it('should get LFP posts for a group when authenticated as member', async () => {
      // First join the group as a regular user
      await request(app.getHttpServer())
        .post(`/group-membership/${groupId}/41`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/lfp/${groupId}`)
        .set('Authorization', `Bearer ${userAuthToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('message');
        expect(response.body[0]).toHaveProperty('groupId');
        expect(response.body[0]).toHaveProperty('createdAt');
      }
    });

    it('should return 401 when fetching LFP posts without auth', async () => {
      await request(app.getHttpServer()).get(`/lfp/${groupId}`).expect(401);
    });

    it('should return 403 when fetching LFP posts as non-member', async () => {
      const randomUser = await request(app.getHttpServer())
        .get('/users/45')
        .expect(200);

      const nonMemberResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: randomUser.body.email, password: 'Password123!' });

      await request(app.getHttpServer())
        .get(`/lfp/${groupId}`)
        .set('Authorization', `Bearer ${nonMemberResponse.body.accessToken}`)
        .expect(403);
    });
  });

  describe('GET /lfp/groups', () => {
    it('should get available groups with LFP posts', async () => {
      const response = await request(app.getHttpServer())
        .get('/lfp/groups')
        .set('Authorization', `Bearer ${userAuthToken}`)
        .query({
          lat: 45.815399,
          lng: 15.966568,
          distance: 100,
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const lfp = response.body[0];
        expect(lfp).toHaveProperty('group');
        expect(lfp).toHaveProperty('message');
        expect(lfp).toHaveProperty('location');
        expect(lfp).toHaveProperty('groupRequirements');
      }
    });

    it('should return 401 when fetching groups without auth', async () => {
      await request(app.getHttpServer()).get('/lfp/groups').expect(401);
    });
  });

  describe('PATCH /lfp/:groupId/:id', () => {
    it('should update an LFP post when authenticated as group admin', async () => {
      const updateData: UpdateLFPDto = {
        message: 'Updated LFP message',
      };

      const response = await request(app.getHttpServer())
        .patch(`/lfp/${groupId}/${lfpId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
    });

    it('should return 401 when updating LFP without auth', async () => {
      const updateData: UpdateLFPDto = {
        message: 'Updated message',
      };

      await request(app.getHttpServer())
        .patch(`/lfp/${groupId}/${lfpId}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 403 when updating LFP as non-admin member', async () => {
      const updateData: UpdateLFPDto = {
        message: 'Updated message',
      };

      await request(app.getHttpServer())
        .patch(`/lfp/${groupId}/${lfpId}`)
        .set('Authorization', `Bearer ${userAuthToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should return 404 when updating non-existent LFP', async () => {
      const updateData: UpdateLFPDto = {
        message: 'Updated message',
      };

      await request(app.getHttpServer())
        .patch(`/lfp/${groupId}/99999`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /lfp/:groupId/:id', () => {
    it('should delete an LFP post when authenticated as group admin', async () => {
      const req = await request(app.getHttpServer())
        .delete(`/lfp/${groupId}/${lfpId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`);
      //expect(200  );
      console.log(req.body);

      // Verify deletion
      const response = await request(app.getHttpServer())
        .get(`/lfp/${groupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.body.find((lfp) => lfp.id === lfpId)).toBeUndefined();
    });

    it('should return 401 when deleting LFP without auth', async () => {
      await request(app.getHttpServer())
        .delete(`/lfp/${groupId}/${lfpId}`)
        .expect(401);
    });

    it('should return 403 when deleting LFP as non-admin member', async () => {
      await request(app.getHttpServer())
        .delete(`/lfp/${groupId}/${lfpId}`)
        .set('Authorization', `Bearer ${userAuthToken}`)
        .expect(403);
    });

    it('should return 404 when deleting non-existent LFP', async () => {
      await request(app.getHttpServer())
        .delete(`/lfp/${groupId}/99999`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404);
    });
  });
});
