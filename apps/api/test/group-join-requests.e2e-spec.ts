import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateGroupRequest } from 'src/group/dto/requests.dto';
import { groupFocusEnum, groupTypeEnum } from '@tournament-app/types';

describe('GroupJoinRequestsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let adminAuthToken: string;
  let groupId: number;
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const testUser = await request(app.getHttpServer())
      .get('/users/3')
      .expect(200);

    const auth = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.body.email, password: 'Password123!' })
      .expect(201);

    adminAuthToken = auth.body.accessToken;

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
        locationId: 1,
        country: 'Test Country',
      } satisfies CreateGroupRequest)
      .expect(201);

    groupId = newGroup.body.id;

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

  describe('/group-join-requests (GET)', () => {
    it('should return paginated group join requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/group-join-requests')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('metadata');
      expect(Array.isArray(response.body.results)).toBe(true);
    });
  });

  describe('/group-join-requests/:groupId (POST)', () => {
    it('should create a group join request', async () => {
      const createDto = {
        message: 'I would like to join this group',
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
          locationId: 1,
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      groupId = createGroup.body.id;

      await request(app.getHttpServer())
        .post(`/group-join-requests/${createGroup.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);
    });

    it('should not allow existing members to create join requests', async () => {
      const createDto = {
        message: 'I would like to join this group',
      };

      await request(app.getHttpServer())
        .post('/group-join-requests/2')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(createDto)
        .expect(403);
    });
  });

  describe('/group-join-requests/:groupId/:userId (GET)', () => {
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
          locationId: 1,
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      groupId = createGroup.body.id;

      // Create a join request
      await request(app.getHttpServer())
        .post(`/group-join-requests/${groupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'I would like to join this group',
        })
        .expect(201);

      // Get the user ID from the auth token (assuming it's 40 based on previous code)
      userId = 40;
    });

    it('should return request with user details when using WITH_USER response type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/group-join-requests/${groupId}/${userId}?responseType=with-user`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const expectedFields = new Set([
        'id',
        'username',
        'email',
        'profilePicture',
        'groupId',
        'isFake',
        'message',
        'bio',
        'country',
        'age',
        'followers',
        'level',
        'name',
        'updatedAt',
      ]);

      const responseFields = new Set(Object.keys(response.body));
      expect(responseFields).toEqual(expectedFields);
    });

    it('should return request with group details when using WITH_GROUP response type', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/group-join-requests/${groupId}/${userId}?responseType=with-group`,
        )
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
        'locationId',
        'country',
        'userId',
        'message',
      ]);

      const responseFields = new Set(Object.keys(response.body));
      expect(responseFields).toEqual(expectedFields);
    });

    it('should return request with mini user details when using WITH_MINI_USER response type', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/group-join-requests/${groupId}/${userId}?responseType=with-mini-user`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const expectedFields = new Set([
        'id',
        'isFake',
        'username',
        'profilePicture',
        'createdAt',
      ]);

      const responseFields = new Set(Object.keys(response.body));
      expect(responseFields).toEqual(expectedFields);
    });

    it('should return request with mini group details when using WITH_MINI_GROUP response type', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/group-join-requests/${groupId}/${userId}?responseType=with-mini-group`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const expectedFields = new Set([
        'id',
        'name',
        'abbreviation',
        'locationId',
        'logo',
        'createdAt',
      ]);

      const responseFields = new Set(Object.keys(response.body));
      expect(responseFields).toEqual(expectedFields);
    });

    it('should return 404 for non-existent request', async () => {
      await request(app.getHttpServer())
        .get(`/group-join-requests/${groupId}/999?responseType=with-user`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should default to WITH_USER response type when no type is specified', async () => {
      const response = await request(app.getHttpServer())
        .get(`/group-join-requests/${groupId}/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const expectedFields = new Set([
        'id',
        'username',
        'email',
        'profilePicture',
        'groupId',
        'age',
        'message',
        'bio',
        'isFake',
        'country',
        'followers',
        'level',
        'name',
        'updatedAt',
      ]);

      const responseFields = new Set(Object.keys(response.body));
      expect(responseFields).toEqual(expectedFields);
    });
  });

  describe('/group-join-requests/:groupId (PATCH)', () => {
    it('should update a group join request', async () => {
      const updateDto = {
        message: 'Updated join request message',
      };

      await request(app.getHttpServer())
        .patch(`/group-join-requests/${groupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);
    });

    it('should not allow other users to update the request', async () => {
      const updateDto = {
        message: "Trying to update someone else's request",
      };

      await request(app.getHttpServer())
        .patch(`/group-join-requests/${groupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateDto)
        .expect(403);
    });
  });

  describe('/group-join-requests/:groupId (DELETE)', () => {
    it('should delete a group join request', async () => {
      await request(app.getHttpServer())
        .delete(`/group-join-requests/${groupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should not allow other users to delete the request', async () => {
      await request(app.getHttpServer())
        .delete(`/group-join-requests/${groupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(403);
    });
  });

  describe('/group-join-requests/:groupId/:userId/accept (POST)', () => {
    let groupId: number;

    beforeAll(async () => {
      const group = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          name: 'Test Accept Group',
          abbreviation: 'TAG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          locationId: 1,
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      groupId = group.body.id;

      await request(app.getHttpServer())
        .post(`/group-join-requests/${groupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'I would like to join this group',
        })
        .expect(201);
    });

    it('should not allow non-admin to accept requests', async () => {
      await request(app.getHttpServer())
        .post(`/group-join-requests/${groupId}/40/accept`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should accept a group join request', async () => {
      const createDto = {
        message: 'I would like to join this group',
      };

      const createGroup = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          name: 'Test Accept Group',
          abbreviation: 'TAG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          locationId: 1,
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      await request(app.getHttpServer())
        .post(`/group-join-requests/${createGroup.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/group-join-requests/${createGroup.body.id}/40/accept`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(201);
    });

    it('should allow group admin to accept a join request', async () => {
      await request(app.getHttpServer())
        .post(`/group-join-requests/${groupId}/40/accept`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(201);
    });

    it('should return 404 when accepting non-existing request', async () => {
      await request(app.getHttpServer())
        .post('/group-join-requests/999/999/accept')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(400);
    });
  });

  describe('/group-join-requests/:groupId/:userId/reject (DELETE)', () => {
    let groupId: number;

    beforeAll(async () => {
      const group = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          name: 'Test Accept Group',
          abbreviation: 'TAG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          locationId: 1,
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      groupId = group.body.id;

      await request(app.getHttpServer())
        .post(`/group-join-requests/${groupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'I would like to join this group',
        })
        .expect(201);
    });

    it('should not allow non-admin to reject requests', async () => {
      await request(app.getHttpServer())
        .delete(`/group-join-requests/${groupId}/40/reject`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should reject a group join request', async () => {
      const createDto = {
        message: 'I would like to join this group',
      };

      const createGroup = await request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          name: 'Test Reject Group',
          abbreviation: 'TRG',
          description: 'Test Description',
          type: groupTypeEnum.PUBLIC,
          focus: groupFocusEnum.HYBRID,
          logo: 'logo.png',
          locationId: 1,
          country: 'Test Country',
        } satisfies CreateGroupRequest);

      await request(app.getHttpServer())
        .post(`/group-join-requests/${createGroup.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/group-join-requests/${createGroup.body.id}/40/reject`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);
    });

    it('should allow group admin to reject a join request', async () => {
      await request(app.getHttpServer())
        .delete(`/group-join-requests/${groupId}/40/reject`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);
    });

    it('should return 404 when rejecting non-existing request', async () => {
      await request(app.getHttpServer())
        .delete('/group-join-requests/999/999/reject')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404);
    });
  });
});
