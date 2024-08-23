import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PostgresExceptionFilter } from '../src/base/exception/postgresExceptionFilter';
import { Reflector } from '@nestjs/core';
import { NoValuesToSetExceptionFilter } from '../src/base/exception/noValuesToSetExceptionFilter';
import { CreateUserRequest, UpdateUserInfo } from '@tournament-app/types';

describe('UserController', () => {
  let app: INestApplication;

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
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /users', () => {
    it('should return a valid query with mini return type', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?responseType=mini')
        .expect(200);

      const { results, metadata } = response.body;

      expect(results.length).toEqual(12);
      expect(Object.keys(results[0])).toEqual(['id', 'username']);

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

    it('should return a valid query with miniWithProfilePicture return type', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?responseType=mini-with-pfp')
        .expect(200);

      const { results, metadata } = response.body;

      expect(results.length).toEqual(12);
      expect(Object.keys(results[0])).toEqual([
        'id',
        'username',
        'profilePicture ',
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

    it('should return a valid query with miniWithCountry return type', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?responseType=mini-with-country')
        .expect(200);

      const { results, metadata } = response.body;

      expect(results.length).toEqual(12);
      expect(Object.keys(results[0])).toEqual([
        'id',
        'username',
        'profilePicture',
        'country',
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

    it('should return a valid query with extended return type', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?responseType=extended')
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
        'following',
        'location',
        'createdAt',
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
  });

  describe('PATCH /users/:id', () => {
    it('should return a 400 when updating a user with an invalid request', async () => {
      const update: UpdateUserInfo = {
        bio: '',
        location: 'Updated location',
      };

      const results = await request(app.getHttpServer())
        .patch('/users/1')
        .send(update)
        .expect(400);

      const { message, error } = results.body;

      expect(message.length).toEqual(1);
      expect(error).toBe('Bad Request');
    });

    it('should return a 422 when no body is sent', async () => {
      await request(app.getHttpServer()).patch('/users/1').send({}).expect(422);
    });

    it('should return a 404 when updating a non-existent user', async () => {
      const update: UpdateUserInfo = {
        bio: 'Updated bio',
        location: 'Updated location',
      };

      await request(app.getHttpServer())
        .patch('/users/100')
        .send(update)
        .expect(404);
    });

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
    it('should return a 404 when deleting a non-existent user', async () => {
      await request(app.getHttpServer()).delete('/users/100').expect(404);
    });

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
        email: 'johssn@doe.com',
        location: 'New York',
        password: 'Password123!',
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
