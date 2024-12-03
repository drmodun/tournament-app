import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { GroupMembershipResponsesEnum, GroupMembershipRoleEnum } from '@tournament-app/types';
import { CreateGroupMembershipRequest, UpdateGroupMembershipRequest } from '../dto/requests.dto';
import { generateToken } from '../utils/jwt';

describe('GroupMembershipController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdMembershipId: number;
  let groupId: number;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Generate auth token for testing
    authToken = generateToken({ id: 1, email: 'test@example.com' });

    // Create a test group first
    const groupResponse = await request(app.getHttpServer())
      .post('/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Group',
        abbreviation: 'TG',
        description: 'Test Description',
        type: 'public',
        focus: 'hybrid',
        logo: 'logo.png',
        location: 'Test Location',
        country: 'Test Country',
      });
    groupId = groupResponse.body.id;
  });

  afterAll(async () => {
    // Clean up the test group
    await request(app.getHttpServer())
      .delete(`/groups/${groupId}`)
      .set('Authorization', `Bearer ${authToken}`);

    await app.close();
  });

  describe('POST /group-memberships', () => {
    const createDto: CreateGroupMembershipRequest = {
      userId: 1,
      groupId: 1, // This will be updated in beforeAll
      role: GroupMembershipRoleEnum.MEMBER,
    };

    beforeAll(() => {
      createDto.groupId = groupId;
    });

    it('should create a new group membership', () => {
      return request(app.getHttpServer())
        .post('/group-memberships')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.userId).toBe(createDto.userId);
          expect(res.body.groupId).toBe(createDto.groupId);
          createdMembershipId = res.body.id;
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/group-memberships')
        .send(createDto)
        .expect(401);
    });
  });

  describe('GET /group-memberships', () => {
    it('should return an array of group memberships', () => {
      return request(app.getHttpServer())
        .get('/group-memberships')
        .query({ groupId })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].groupId).toBe(groupId);
        });
    });

    it('should filter group memberships by role', () => {
      return request(app.getHttpServer())
        .get('/group-memberships')
        .query({ groupId, role: GroupMembershipRoleEnum.MEMBER })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((membership) => {
            expect(membership.role).toBe(GroupMembershipRoleEnum.MEMBER);
          });
        });
    });
  });

  describe('GET /group-memberships/:id', () => {
    it('should return a group membership by id', () => {
      return request(app.getHttpServer())
        .get(`/group-memberships/${createdMembershipId}`)
        .query({ responseType: GroupMembershipResponsesEnum.BASE })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdMembershipId);
          expect(res.body.groupId).toBe(groupId);
        });
    });

    it('should return 404 for non-existent group membership', () => {
      return request(app.getHttpServer())
        .get('/group-memberships/999999')
        .expect(404);
    });
  });

  describe('PATCH /group-memberships/:id', () => {
    const updateDto: UpdateGroupMembershipRequest = {
      role: GroupMembershipRoleEnum.ADMIN,
    };

    it('should update a group membership', () => {
      return request(app.getHttpServer())
        .patch(`/group-memberships/${createdMembershipId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdMembershipId);
          expect(res.body.role).toBe(updateDto.role);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/group-memberships/${createdMembershipId}`)
        .send(updateDto)
        .expect(401);
    });
  });

  describe('DELETE /group-memberships/:id', () => {
    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/group-memberships/${createdMembershipId}`)
        .expect(401);
    });

    it('should delete a group membership', () => {
      return request(app.getHttpServer())
        .delete(`/group-memberships/${createdMembershipId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdMembershipId);
        });
    });

    it('should return 404 after deletion', () => {
      return request(app.getHttpServer())
        .get(`/group-memberships/${createdMembershipId}`)
        .expect(404);
    });
  });
});
