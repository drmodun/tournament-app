import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { GroupResponsesEnum } from '@tournament-app/types';
import { CreateGroupRequest, UpdateGroupRequest } from './dto/requests.dto';

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
    const tokens = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Password123!' });

    authToken = await tokens.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /groups', () => {
    const createDto: CreateGroupRequest = {
      name: 'Test Group',
      abbreviation: 'TG',
      description: 'Test Description',
      type: 'public',
      focus: 'hybrid',
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
    it('should return an array of groups', () => {
      return request(app.getHttpServer())
        .get('/groups')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should filter groups by type', () => {
      return request(app.getHttpServer())
        .get('/groups')
        .query({ type: 'public' })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((group) => {
            expect(group.type).toBe('public');
          });
        });
    });
  });

  describe('GET /groups/:id', () => {
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
