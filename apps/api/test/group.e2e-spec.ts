import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  groupFocusEnum,
  GroupResponsesEnum,
  groupTypeEnum,
} from '@tournament-app/types';
import {
  CreateGroupRequest,
  UpdateGroupRequest,
} from '../src/group/dto/requests.dto';

describe('GroupController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdGroupId: number;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Generate auth token for testing
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example', password: 'Password123!' });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /groups', () => {
    const createDto: CreateGroupRequest = {
      name: 'Test Group',
      abbreviation: 'TG',
      description: 'Test Description',
      type: groupTypeEnum.PRIVATE,
      focus: groupFocusEnum.HYBRID,
      logo: 'logo.png',
      location: 'Test Location',
      country: 'Test Country',
    };

    it('should create a new group', () => {
      return request(app.getHttpServer())
        .post('/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createDto.name);
          createdGroupId = res.body.id;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/groups')
        .send(createDto)
        .expect(401);
    });
  });

  describe('GET /groups', () => {
    it('should return an array of groups with metadata and MINI response type', () => {
      return request(app.getHttpServer())
        .get('/groups?responseType=mini')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('metadata');
          expect(Array.isArray(res.body.results)).toBe(true);
          expect(Object.keys(res.body.results[0])).toEqual([
            'id',
            'name',
            'abbreviation',
          ]);
          expect(res.body.metadata.pagination).toEqual({
            page: 1,
            pageSize: 12,
          });
        });
    });

    it('should return an array of groups with metadata and MINI_WITH_LOGO response type', () => {
      return request(app.getHttpServer())
        .get('/groups?responseType=mini-with-logo')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('metadata');
          expect(Array.isArray(res.body.results)).toBe(true);
          expect(Object.keys(res.body.results[0])).toEqual([
            'id',
            'name',
            'abbreviation',
            'logo',
          ]);
          expect(res.body.metadata.pagination).toEqual({
            page: 1,
            pageSize: 12,
          });
        });
    });

    it('should return an array of groups with metadata and MINI_WITH_COUNTRY response type', () => {
      return request(app.getHttpServer())
        .get('/groups?responseType=mini-with-country')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('metadata');
          expect(Array.isArray(res.body.results)).toBe(true);
          expect(Object.keys(res.body.results[0])).toEqual([
            'id',
            'name',
            'abbreviation',
            'country',
          ]);
          expect(res.body.metadata.pagination).toEqual({
            page: 1,
            pageSize: 12,
          });
        });
    });

    it('should return an array of groups with metadata and BASE response type', () => {
      return request(app.getHttpServer())
        .get('/groups?responseType=base')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('metadata');
          expect(Array.isArray(res.body.results)).toBe(true);
          expect(Object.keys(res.body.results[0])).toEqual([
            'id',
            'name',
            'abbreviation',
            'country',
            'description',
            'type',
            'focus',
            'logo',
            'location',
            'updatedAt',
            'memberCount',
          ]);
          expect(res.body.metadata.pagination).toEqual({
            page: 1,
            pageSize: 12,
          });
        });
    });

    it('should return an array of groups with metadata and EXTENDED response type', () => {
      return request(app.getHttpServer())
        .get('/groups?responseType=extended')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('metadata');
          expect(Array.isArray(res.body.results)).toBe(true);
          expect(Object.keys(res.body.results[0])).toEqual([
            'id',
            'name',
            'abbreviation',
            'country',
            'description',
            'type',
            'focus',
            'logo',
            'location',
            'updatedAt',
            'memberCount',
            'createdAt',
            'tournamentCount',
            'subscriberCount',
          ]);
          expect(res.body.metadata.pagination).toEqual({
            page: 1,
            pageSize: 12,
          });
        });
    });

    it('should return an array of groups with metadata', () => {
      return request(app.getHttpServer())
        .get('/groups')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('metadata');
          expect(Array.isArray(res.body.results)).toBe(true);
          expect(res.body.results.length).toBeGreaterThan(0);
        });
    });

    it('should filter groups by type', () => {
      return request(app.getHttpServer())
        .get('/groups')
        .query({ type: 'public' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.results)).toBe(true);
          res.body.results.forEach((group) => {
            expect(group.type).toBe('public');
          });
        });
    });
  });

  describe('GET /groups/:id', () => {
    it('should return a group with MINI response type', () => {
      return request(app.getHttpServer())
        .get(`/groups/${createdGroupId}?responseType=mini`)
        .expect(200)
        .expect((res) => {
          expect(Object.keys(res.body)).toEqual(['id', 'name', 'abbreviation']);
        });
    });

    it('should return a group with MINI_WITH_LOGO response type', () => {
      return request(app.getHttpServer())
        .get(`/groups/${createdGroupId}?responseType=mini-with-logo`)
        .expect(200)
        .expect((res) => {
          expect(Object.keys(res.body)).toEqual([
            'id',
            'name',
            'abbreviation',
            'logo',
          ]);
        });
    });

    it('should return a group with MINI_WITH_COUNTRY response type', () => {
      return request(app.getHttpServer())
        .get(`/groups/${createdGroupId}?responseType=mini-with-country`)
        .expect(200)
        .expect((res) => {
          expect(Object.keys(res.body)).toEqual([
            'id',
            'name',
            'abbreviation',
            'country',
          ]);
        });
    });

    it('should return a group with BASE response type', () => {
      return request(app.getHttpServer())
        .get(`/groups/${createdGroupId}?responseType=base`)
        .expect(200)
        .expect((res) => {
          expect(Object.keys(res.body)).toEqual([
            'id',
            'name',
            'abbreviation',
            'country',
            'description',
            'type',
            'focus',
            'logo',
            'location',
            'updatedAt',
            'memberCount',
          ]);
        });
    });

    it('should return a group with EXTENDED response type', () => {
      return request(app.getHttpServer())
        .get(`/groups/${createdGroupId}?responseType=extended`)
        .expect(200)
        .expect((res) => {
          expect(Object.keys(res.body)).toEqual([
            'id',
            'name',
            'abbreviation',
            'country',
            'description',
            'type',
            'focus',
            'logo',
            'location',
            'updatedAt',
            'memberCount',
            'createdAt',
            'tournamentCount',
            'subscriberCount',
          ]);
        });
    });

    it('should return a group by id', () => {
      return request(app.getHttpServer())
        .get(`/groups/${createdGroupId}`)
        .query({ responseType: GroupResponsesEnum.BASE })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdGroupId);
        });
    });

    it('should return 404 for non-existent group', () => {
      return request(app.getHttpServer()).get('/groups/999999').expect(404);
    });
  });

  describe('GET /groups/:id/members', () => {
    it('should return group members', () => {
      return request(app.getHttpServer())
        .get(`/groups/${createdGroupId}/members`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('group');
          expect(res.body).toHaveProperty('members');
          expect(Array.isArray(res.body.members)).toBe(true);
        });
    });

    it('should return 404 for non-existent group', () => {
      return request(app.getHttpServer())
        .get('/groups/999999/members')
        .expect(404);
    });
  });

  describe('GET /groups/:id/tournaments', () => {
    it('should return group tournaments', () => {
      return request(app.getHttpServer())
        .get(`/groups/${createdGroupId}/tournaments`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('group');
          expect(res.body).toHaveProperty('tournaments');
          expect(Array.isArray(res.body.tournaments)).toBe(true);
        });
    });

    it('should return 404 for non-existent group', () => {
      return request(app.getHttpServer())
        .get('/groups/999999/tournaments')
        .expect(404);
    });
  });

  describe('GET /groups/:id/followers', () => {
    it('should return group followers', () => {
      return request(app.getHttpServer())
        .get(`/groups/${createdGroupId}/followers`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('group');
          expect(res.body).toHaveProperty('followers');
          expect(Array.isArray(res.body.followers)).toBe(true);
        });
    });

    it('should return 404 for non-existent group', () => {
      return request(app.getHttpServer())
        .get('/groups/999999/followers')
        .expect(404);
    });
  });

  describe('PATCH /groups/:id', () => {
    const updateDto: UpdateGroupRequest = {
      name: 'Updated Test Group',
    };

    it('should update a group', () => {
      return request(app.getHttpServer())
        .patch(`/groups/${createdGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdGroupId);
          expect(res.body.name).toBe(updateDto.name);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/groups/${createdGroupId}`)
        .send(updateDto)
        .expect(401);
    });
  });

  describe('DELETE /groups/:id', () => {
    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/groups/${createdGroupId}`)
        .expect(401);
    });

    it('should delete a group', () => {
      return request(app.getHttpServer())
        .delete(`/groups/${createdGroupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdGroupId);
        });
    });

    it('should return 404 after deletion', () => {
      return request(app.getHttpServer())
        .get(`/groups/${createdGroupId}`)
        .expect(404);
    });
  });
});
