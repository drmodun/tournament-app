import { Test } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateGroupRequest } from 'src/group/dto/requests.dto';
import { groupFocusEnum, groupTypeEnum } from '@tournament-app/types';
import { Reflector } from '@nestjs/core';
import { PostgresExceptionFilter } from 'src/base/exception/postgresExceptionFilter';
import { NoValuesToSetExceptionFilter } from 'src/base/exception/noValuesToSetExceptionFilter';

describe('GroupInvitesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let adminAuthToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
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

    const testUser = await request(app.getHttpServer())
      .get('/users/3')
      .expect(200);

    const auth = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.body.email, password: 'Password123!' })
      .expect(201);

    adminAuthToken = auth.body.accessToken;

    await request(app.getHttpServer())
      .post('/group-membership/2/41')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .expect(201); // Add user 41 to group 2

    const testNonAdminUser = await request(app.getHttpServer())
      .get('/users/40')
      .expect(200);

    const nonAdminAuth = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testNonAdminUser.body.email, password: 'Password123!' })
      .expect(201);

    authToken = nonAdminAuth.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/group-invites (GET)', () => {
    let groupId: number;

    beforeEach(async () => {
      // Create a test group
      const createGroup = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          name: 'Test Group',
          abbreviation: 'TG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          location: 'Test Location',
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      groupId = createGroup.body.id;

      // Create some test invites
      await request(app.getHttpServer())
        .post(`/group-invites/${groupId}/40`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          message: 'First invite',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/group-invites/${groupId}/41`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          message: 'Second invite',
        })
        .expect(201);
    });

    it('should return paginated group invites with default response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/group-invites')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('metadata');
      expect(Array.isArray(response.body.results)).toBe(true);

      const expectedFields = new Set([
        'id',
        'username',
        'email',
        'profilePicture',
        'groupId',
        'message',
        'bio',
        'country',
        'followers',
        'level',
        'name',
        'updatedAt',
      ]);

      const resultFields = new Set(Object.keys(response.body.results[0]));
      expect(resultFields).toEqual(expectedFields);
    });

    it('should return invites with group details when using WITH_GROUP response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/group-invites?responseType=with-group')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);

      const expectedFields = new Set([
        'id',
        'name',
        'abbreviation',
        'description',
        'type',
        'focus',
        'logo',
        'updatedAt',
        'memberCount',
        'location',
        'country',
        'userId',
        'message',
      ]);

      const resultFields = new Set(Object.keys(response.body.results[0]));
      expect(resultFields).toEqual(expectedFields);
    });

    it('should return invites with mini user details when using WITH_MINI_USER response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/group-invites?responseType=with-mini-user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);

      const expectedFields = new Set([
        'id',
        'username',
        'profilePicture',
        'createdAt',
      ]);

      const resultFields = new Set(Object.keys(response.body.results[0]));
      expect(resultFields).toEqual(expectedFields);
    });

    it('should return invites with mini group details when using WITH_MINI_GROUP response type', async () => {
      const response = await request(app.getHttpServer())
        .get('/group-invites?responseType=with-mini-group')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);

      const expectedFields = new Set([
        'id',
        'name',
        'abbreviation',
        'logo',
        'createdAt',
      ]);

      const resultFields = new Set(Object.keys(response.body.results[0]));
      expect(resultFields).toEqual(expectedFields);
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/group-invites?page=2&pageSize=2')
        .expect(200);

      expect(response.body.results).toHaveLength(2);
      expect(response.body.metadata.pagination).toHaveProperty('page', 2);
      expect(response.body.metadata.pagination).toHaveProperty('pageSize', 2);
    });

    it('should support filtering by groupId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/group-invites?groupId=${groupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(
        response.body.results.every((invite) => invite.groupId === groupId),
      ).toBe(true);
    });
  });

  describe('/group-invites/:groupId/:userId (POST)', () => {
    it('should create a group invite', async () => {
      const createDto = {
        message: 'You are invited to join this group',
      };

      const createGroup = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          name: 'Test Group',
          abbreviation: 'TG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          location: 'Test Location',
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      await request(app.getHttpServer())
        .post(`/group-invites/${createGroup.body.id}/40`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(createDto)
        .expect(201);
    });

    it('should not allow inviting existing members', async () => {
      const createDto = {
        message: 'You are invited to join this group',
      };

      await request(app.getHttpServer())
        .post('/group-invites/2/41')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should not allow group non-admins to create invites', async () => {
      const createDto = {
        message: 'You are invited to join this group',
      };

      await request(app.getHttpServer())
        .post('/group-invites/1/40')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(403);
    });
  });

  describe('/group-invites/:groupId/:userId (GET)', () => {
    let groupId: number;
    let userId: number;

    beforeEach(async () => {
      // Create a test group
      const createGroup = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          name: 'Test Group',
          abbreviation: 'TG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          location: 'Test Location',
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      groupId = createGroup.body.id;
      userId = 40; // Using the non-admin test user ID

      // Create an invite
      await request(app.getHttpServer())
        .post(`/group-invites/${groupId}/${userId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          message: 'You are invited to join this group',
        })
        .expect(201);
    });

    it('should return invite with user details when using WITH_USER response type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/group-invites/${groupId}/${userId}?responseType=with-user`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const expectedFields = new Set([
        'id',
        'username',
        'email',
        'profilePicture',
        'groupId',
        'message',
        'bio',
        'country',
        'followers',
        'level',
        'name',
        'updatedAt',
      ]);

      const responseFields = new Set(Object.keys(response.body));
      expect(responseFields).toEqual(expectedFields);
    });

    it('should return invite with group details when using WITH_GROUP response type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/group-invites/${groupId}/${userId}?responseType=with-group`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const expectedFields = new Set([
        'id',
        'name',
        'abbreviation',
        'description',
        'type',
        'focus',
        'logo',
        'updatedAt',
        'memberCount',
        'location',
        'country',
        'userId',
        'message',
      ]);

      const responseFields = new Set(Object.keys(response.body));
      expect(responseFields).toEqual(expectedFields);
    });

    it('should return invite with mini user details when using WITH_MINI_USER response type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/group-invites/${groupId}/${userId}?responseType=with-mini-user`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const expectedFields = new Set([
        'id',
        'username',
        'profilePicture',
        'createdAt',
      ]);

      const responseFields = new Set(Object.keys(response.body));
      expect(responseFields).toEqual(expectedFields);
    });

    it('should return invite with mini group details when using WITH_MINI_GROUP response type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/group-invites/${groupId}/${userId}?responseType=with-mini-group`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const expectedFields = new Set([
        'id',
        'name',
        'abbreviation',
        'logo',
        'createdAt',
      ]);

      const responseFields = new Set(Object.keys(response.body));
      expect(responseFields).toEqual(expectedFields);
    });

    it('should return 404 for non-existent invite', async () => {
      await request(app.getHttpServer())
        .get('/group-invites/999/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/group-invites/:groupId/:userId (PATCH)', () => {
    let groupId: number;

    beforeAll(async () => {
      const newGroup = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          name: 'Test Group',
          abbreviation: 'TG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          location: 'Test Location',
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      await request(app.getHttpServer())
        .post(`/group-invites/${newGroup.body.id}/40`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          message: 'You are invited to join this group',
        })
        .expect(201);

      groupId = newGroup.body.id;
    });

    it('should update a group invite', async () => {
      const updateDto = {
        message: 'Updated invite message',
      };

      await request(app.getHttpServer())
        .patch(`/group-invites/${groupId}/40`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateDto)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/group-invites/${groupId}/40?responseType=with-user`)
        .expect(200);

      expect(response.body.message).toBe(updateDto.message);
    });

    it('should not allow non-admins to update invites', async () => {
      const updateDto = {
        message: 'Updated invite message',
      };

      await request(app.getHttpServer())
        .patch(`/group-invites/${groupId}/40`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(403);
    });
  });

  describe('/group-invites/:groupId/:userId (DELETE)', () => {
    it('should delete a group invite', async () => {
      await request(app.getHttpServer())
        .delete('/group-invites/1/40')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/group-invites/1/40')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not allow non-admins to delete invites', async () => {
      await request(app.getHttpServer())
        .delete('/group-invites/1/40')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  describe('/group-invites/:groupId/accept (POST)', () => {
    let groupId: number;

    beforeAll(async () => {
      const group = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          name: 'Test Accept Invite Group',
          abbreviation: 'TAIG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          location: 'Test Location',
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      groupId = group.body.id;

      await request(app.getHttpServer())
        .post(`/group-invites/${groupId}/40`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          message: 'You are invited to join this group',
        })
        .expect(201);
    });

    it('should not allow accepting invite if already a member', async () => {
      // First accept the invite
      await request(app.getHttpServer())
        .post(`/group-invites/${groupId}/accept`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      // Try to accept again
      await request(app.getHttpServer())
        .post(`/group-invites/${groupId}/accept`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should accept a group invite', async () => {
      const createGroup = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          name: 'Another Test Accept Group',
          abbreviation: 'ATAG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          location: 'Test Location',
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      await request(app.getHttpServer())
        .post(`/group-invites/${createGroup.body.id}/40`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          message: 'You are invited to join this group',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/group-invites/${createGroup.body.id}/accept`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      // Verify membership was created
      await request(app.getHttpServer())
        .get(`/group-membership/${createGroup.body.id}/40`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);
    });

    it('should return 404 when accepting non-existing invite', async () => {
      await request(app.getHttpServer())
        .post('/group-invites/999/accept')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/group-invites/:groupId/reject (DELETE)', () => {
    let groupId: number;

    beforeAll(async () => {
      const group = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          name: 'Test Reject Invite Group',
          abbreviation: 'TRIG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          location: 'Test Location',
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      groupId = group.body.id;

      await request(app.getHttpServer())
        .post(`/group-invites/${groupId}/40`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          message: 'You are invited to join this group',
        })
        .expect(201);
    });

    it('should reject a group invite', async () => {
      const createGroup = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          name: 'Another Test Reject Group',
          abbreviation: 'ATRG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          location: 'Test Location',
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      await request(app.getHttpServer())
        .post(`/group-invites/${createGroup.body.id}/40`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          message: 'You are invited to join this group',
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/group-invites/${createGroup.body.id}/reject`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify invite was deleted
      await request(app.getHttpServer())
        .get(`/group-invites/${createGroup.body.id}/40`)
        .expect(404);
    });

    it('should return 404 when rejecting non-existing invite', async () => {
      await request(app.getHttpServer())
        .delete('/group-invites/999/reject')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not allow rejecting invite after accepting it', async () => {
      await request(app.getHttpServer())
        .post(`/group-invites/${groupId}/accept`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/group-invites/${groupId}/reject`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });
});
