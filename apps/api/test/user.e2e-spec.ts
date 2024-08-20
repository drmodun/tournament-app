import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { CreateUserRequest } from '@tournament-app/types';

describe('UserController', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should return a valid query', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    const { results, metadata } = response.body;

    expect(results.length).toEqual(12);
    expect(Object.keys(results[0])).toEqual([
      'id',
      'username',
      'profilePicture',
      'country',
      'bio',
      'email',
      'level',
      'updatedAt',
      'followers',
    ]);

    expect(metadata.pagination).toEqual({
      page: 1,
      pageSize: 12,
    });

    expect(metadata.links).toEqual({
      first: '/users?page=1',
      prev: '/users?page=0',
      next: '/users?page=2',
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        bio: 'Updated bio',
        location: 'Updated location',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/1')
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toEqual({ id: 1 });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/1')
        .expect(200);

      expect(response.body).toEqual({ id: 1 });
    });
  });

  describe('POST /users', () => {
    it('should create a user', async () => {
      const createRequest: CreateUserRequest = {
        username: 'john_doe',
        bio: 'I am a user',
        country: 'USA',
        email: 'john@doe.com',
        location: 'New York',
        password: 'password',
        name: 'John Doe',
        profilePicture: 'https://example.com/john_doe.jpg',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createRequest)
        .expect(201);

      expect(response.body).toEqual({ id: expect.any(Number) });
    });
  });
});
