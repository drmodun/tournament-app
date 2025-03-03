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
  ICreateGroupRequest,
} from '@tournament-app/types';
import {
  CreateGroupRequirementsDto,
  UpdateGroupRequirementsDto,
} from '../src/group/requirements/dto/requests';

describe('GroupRequirementsController (e2e)', () => {
  let app: INestApplication;
  let adminAuthToken: string;
  let memberAuthToken: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let nonMemberAuthToken: string;
  let testGroupId: number;
  let testCategoryId: number;

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

    // Get test users
    const { body: adminUser } = await request(app.getHttpServer())
      .get('/users/3')
      .expect(200);

    const { body: memberUser } = await request(app.getHttpServer())
      .get('/users/36')
      .expect(200);

    const { body: nonMemberUser } = await request(app.getHttpServer())
      .get('/users/33')
      .expect(200);

    // Get auth tokens
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminUser.email, password: 'Password123!' });

    const memberLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: memberUser.email, password: 'Password123!' });

    const nonMemberLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: nonMemberUser.email, password: 'Password123!' });

    adminAuthToken = adminLoginResponse.body.accessToken;
    memberAuthToken = memberLoginResponse.body.accessToken;
    nonMemberAuthToken = nonMemberLoginResponse.body.accessToken;

    const createGroupResponse = await request(app.getHttpServer())
      .post('/groups')
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .send({
        name: 'Test Group for Requirements',
        abbreviation: 'TGR',
        description: 'A test group for testing group requirements',
        focus: groupFocusEnum.HYBRID,
        logo: 'https://example.com/logo.png',
        type: groupTypeEnum.PUBLIC,
        locationId: 1,
        country: 'Test Country',
      } satisfies ICreateGroupRequest)
      .expect(201);

    testGroupId = createGroupResponse.body.id;

    await request(app.getHttpServer())
      .post(`/group-membership/${testGroupId}/${memberUser.id}`)
      .set('Authorization', `Bearer ${adminAuthToken}`)
      .expect(201);

    const { body: categories } = await request(app.getHttpServer())
      .get('/categories')
      .expect(200);

    testCategoryId = categories.results[0]?.id || 1;
  });

  describe('POST /groups/:groupId/requirements', () => {
    const createDto: CreateGroupRequirementsDto = {
      minimumAge: 18,
      maximumAge: 35,
      isSameCountry: true,
      eloRequirements: [
        {
          categoryId: 1,
          minimumElo: 1000,
          maximumElo: 2000,
        },
      ],
    };

    it('should create group requirements when user is admin', async () => {
      const response = await request(app.getHttpServer())
        .post(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        minimumAge: createDto.minimumAge,
        maximumAge: createDto.maximumAge,
        isSameCountry: createDto.isSameCountry,
      });
    });

    it('should not allow non-admin to create requirements', async () => {
      await request(app.getHttpServer())
        .post(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .send(createDto)
        .expect(403);
    });

    it('should validate age ranges', async () => {
      const invalidDto = {
        ...createDto,
        minimumAge: -1,
        maximumAge: 101,
      };

      await request(app.getHttpServer())
        .post(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should validate elo ranges', async () => {
      const invalidDto = {
        ...createDto,
        eloRequirements: [
          {
            categoryId: 1,
            minimumElo: -100,
            maximumElo: 6000,
          },
        ],
      };

      await request(app.getHttpServer())
        .post(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /groups/:groupId/requirements', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          minimumAge: 18,
          maximumAge: 35,
          isSameCountry: true,
          eloRequirements: [
            {
              categoryId: testCategoryId,
              minimumElo: 1000,
              maximumElo: 2000,
            },
          ],
        });
    });

    it('should get group requirements', async () => {
      const response = await request(app.getHttpServer())
        .get(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        minimumAge: 18,
        maximumAge: 35,
        isSameCountry: true,
      });
      expect(response.body.eloRequirements).toHaveLength(1);
    });

    it('should return 404 for non-existent group', async () => {
      await request(app.getHttpServer())
        .get('/group-requirements/99999')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404);
    });
  });

  describe('PUT /groups/:groupId/requirements', () => {
    const updateDto: UpdateGroupRequirementsDto = {
      minimumAge: 21,
      maximumAge: 40,
      isSameCountry: false,
      eloRequirements: [
        {
          categoryId: 1,
          minimumElo: 1200,
          maximumElo: 2200,
        },
      ],
    };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          minimumAge: 18,
          maximumAge: 35,
          isSameCountry: true,
          eloRequirements: [
            {
              categoryId: testCategoryId,
              minimumElo: 1000,
              maximumElo: 2000,
            },
          ],
        });
    });

    it('should update group requirements when user is admin', async () => {
      const response = await request(app.getHttpServer())
        .put(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        minimumAge: updateDto.minimumAge,
        maximumAge: updateDto.maximumAge,
        isSameCountry: updateDto.isSameCountry,
      });
    });

    it('should not allow non-admin to update requirements', async () => {
      await request(app.getHttpServer())
        .put(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .send(updateDto)
        .expect(403);
    });

    it('should return 404 when requirements do not exist', async () => {
      const nonExistentGroupId = 99999;
      await request(app.getHttpServer())
        .put(`/group-requirements/${nonExistentGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /groups/:groupId/requirements', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send({
          minimumAge: 18,
          maximumAge: 35,
          isSameCountry: true,
          eloRequirements: [
            {
              categoryId: testCategoryId,
              minimumElo: 1000,
              maximumElo: 2000,
            },
          ],
        });
    });

    it('should delete group requirements when user is admin', async () => {
      await request(app.getHttpServer())
        .delete(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404);
    });

    it('should not allow non-admin to delete requirements', async () => {
      await request(app.getHttpServer())
        .delete(`/group-requirements/${testGroupId}`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .expect(403);
    });

    it('should return 404 when requirements do not exist', async () => {
      const nonExistentGroupId = 99999;
      await request(app.getHttpServer())
        .delete(`/group-requirements/${nonExistentGroupId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .expect(404);
    });
  });

  describe('Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      await request(app.getHttpServer())
        .get(`/group-requirements/${testGroupId}`)
        .expect(401);

      await request(app.getHttpServer())
        .post(`/group-requirements/${testGroupId}`)
        .expect(401);

      await request(app.getHttpServer())
        .put(`/group-requirements/${testGroupId}`)
        .expect(401);

      await request(app.getHttpServer())
        .delete(`/group-requirements/${testGroupId}`)
        .expect(401);
    });
  });

  afterAll(async () => {
    await request(app.getHttpServer())
      .delete(`/groups/${testGroupId}`)
      .set('Authorization', `Bearer ${adminAuthToken}`);

    await app.close();
  });
});
