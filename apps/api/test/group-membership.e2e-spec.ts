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
  groupFocusEnum,
  groupTypeEnum,
  groupRoleEnum,
} from '@tournament-app/types';
import { GroupMembershipUpdateRequest } from 'src/group-membership/dto/requests.dto';
import { CreateGroupRequest } from 'src/group/dto/requests.dto';

describe('GroupMembershipController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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

    const { body: authUser } = await request(app.getHttpServer())
      .get('/users/3')
      .expect(200);

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: authUser.email, password: 'Password123!' });

    authToken = loginResponse.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /group-membership', () => {
    it('should return paginated group memberships', async () => {
      const response = await request(app.getHttpServer())
        .get('/group-membership')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results, metadata } = response.body;

      expect(Array.isArray(results)).toBeTruthy();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('userId');
      expect(results[0]).toHaveProperty('groupId');
      expect(results[0]).toHaveProperty('role');

      expect(metadata).toHaveProperty('pagination');
      expect(metadata).toHaveProperty('links');
      expect(metadata.pagination).toHaveProperty('page');
      expect(metadata.pagination).toHaveProperty('pageSize');
    });

    it('should filter group memberships by userId', async () => {
      const userId = 1;
      const response = await request(app.getHttpServer())
        .get(`/group-membership?userId=${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results } = response.body;
      expect(
        results.every((membership) => membership.userId === userId),
      ).toBeTruthy();
    });

    it('should filter group memberships by groupId', async () => {
      const groupId = 1;
      const response = await request(app.getHttpServer())
        .get(`/group-membership?groupId=${groupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results } = response.body;
      expect(
        results.every((membership) => membership.groupId === groupId),
      ).toBeTruthy();
    });

    it('should filter group memberships by role', async () => {
      const role = groupRoleEnum.MEMBER;
      const response = await request(app.getHttpServer())
        .get(`/group-membership?role=${role}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { results } = response.body;
      expect(
        results.every((membership) => membership.role === role),
      ).toBeTruthy();
    });
  });

  describe('GET /group-membership/:groupId/:userId', () => {
    it('should return a specific group membership', async () => {
      const group = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Group',
          abbreviation: 'TG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          locationId: 1,
          country: 'Test Country',
        } satisfies CreateGroupRequest)
        .expect(201);

      const groupId = group.body.id;

      const response = await request(app.getHttpServer())
        .get(`/group-membership/${groupId}/3`)
        .set('Authorization', `Bearer ${authToken}`);

      console.log(response.body);

      expect(response.body).toHaveProperty('userId', 3);
      expect(response.body).toHaveProperty('groupId', groupId);
      expect(response.body).toHaveProperty('role');
    });

    it('should return 404 for non-existent membership', async () => {
      await request(app.getHttpServer())
        .get('/group-membership/999/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /group-membership/:groupId/:userId', () => {
    it('should create a new group membership', async () => {
      const newGroup = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Group',
          abbreviation: 'TG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          locationId: 1,
          country: 'Test Country',
        })
        .expect(201);

      const groupId = newGroup.body.id;

      await request(app.getHttpServer())
        .post(`/group-membership/${groupId}/43`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      // Verify the membership was created
      const membership = await request(app.getHttpServer())
        .get(`/group-membership/${groupId}/43`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      console.log(membership.body);
    });

    it('should return 409 when membership already exists', async () => {
      const userId = 1;

      const groupId = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Group',
          abbreviation: 'TG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          locationId: 1,
          country: 'Test Country',
        } satisfies CreateGroupRequest)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/group-membership/${groupId.body.id}/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/group-membership/${groupId.body.id}/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);
    });
  });

  describe('PATCH /group-membership/:groupId/:userId', () => {
    it('should update group membership role', async () => {
      const newGroup = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Group',
          abbreviation: 'TG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          locationId: 1,
          country: 'Test Country',
        })
        .expect(201);

      const groupId = newGroup.body.id;

      await request(app.getHttpServer())
        .post(`/group-membership/${groupId}/41`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);
      const updateDto: GroupMembershipUpdateRequest = {
        role: groupRoleEnum.ADMIN,
      };

      await request(app.getHttpServer())
        .patch(`/group-membership/${groupId}/41`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);
    });

    it('should return 404 when updating non-existent membership', async () => {
      const updateDto: GroupMembershipUpdateRequest = {
        role: groupRoleEnum.ADMIN,
      };

      await request(app.getHttpServer())
        .patch('/group-membership/999/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /group-membership/:groupId/:userId', () => {
    it('should delete a group membership', async () => {
      const newGroup = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Group',
          abbreviation: 'TG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          locationId: 1,
          country: 'Test Country',
        })
        .expect(201);

      const groupId = newGroup.body.id;

      await request(app.getHttpServer())
        .post(`/group-membership/${groupId}/43`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/group-membership/${groupId}/43`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/group-membership/${groupId}/43`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent membership', async () => {
      await request(app.getHttpServer())
        .delete('/group-membership/999/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('DELETE /group-membership/:groupId/leave', () => {
    it('should allow user to leave a group', async () => {
      const myGroupResponse = await request(app.getHttpServer())
        .get(`/group-membership?userId=3`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const myGroup = myGroupResponse.body.results[0];

      await request(app.getHttpServer())
        .delete(`/group-membership/${myGroup.groupId}/${myGroup.userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 404 when leaving a group user is not a member of', async () => {
      const nonAdminUser = await request(app.getHttpServer())
        .get('/users/40')
        .expect(200);

      const authToken = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: nonAdminUser.body.email, password: 'Password123!' })
        .expect(201)
        .then((res) => res.body.accessToken);

      await request(app.getHttpServer())
        .delete('/group-membership/999/leave')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });
});
