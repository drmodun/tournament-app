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
import { categoryTypeEnum, Links } from '@tournament-app/types';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from 'src/category/dto/requests.dto';
import { AuthModule } from 'src/auth/auth.module';

const checkLinksOnDefault = (links: Links, baseLink: string) => {
  expect(links.first).toEqual(`${baseLink}&page=1`);
  expect(links.prev).toEqual(`${baseLink}&page=0`);
  expect(links.next).toEqual(`${baseLink}&page=2`);
};

describe('CategoryController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
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

    // Get auth token for protected routes
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123',
      });

    authToken = loginResponse.body.access_token;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /categories', () => {
    it('should return a valid query with base return type', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories?responseType=base')
        .expect(200);

      const { results, metadata } = response.body;

      expect(results.length).toBeGreaterThan(0);
      expect(Object.keys(results[0])).toEqual([
        'id',
        'name',
        'description',
        'logoUrl',
      ]);

      expect(metadata.pagination).toBeDefined();
      expect(metadata.links).toBeDefined();
      expect(metadata.query).toBeDefined();

      checkLinksOnDefault(metadata.links, '/categories?responseType=base');
    });

    it('should return a valid query with extended return type', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories?responseType=extended')
        .expect(200);

      const { results, metadata } = response.body;

      expect(results.length).toBeGreaterThan(0);
      expect(Object.keys(results[0])).toEqual([
        'id',
        'name',
        'description',
        'logoUrl',
        'tournaments',
        'teams',
      ]);

      checkLinksOnDefault(metadata.links, '/categories?responseType=extended');
    });

    it('should filter categories by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories?name=Test')
        .expect(200);

      const { results } = response.body;
      results.forEach((category) => {
        expect(category.name.toLowerCase()).toContain('test');
      });
    });
  });

  describe('GET /categories/:id', () => {
    it('should return a category by id', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('logoUrl');
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer()).get('/categories/999').expect(404);
    });
  });

  describe('POST /categories', () => {
    it('should create a new category when authenticated as admin', async () => {
      const categoryData: CreateCategoryRequest = {
        name: 'New Category',
        description: 'New Category Description',
        logo: 'https://example.com/logo.jpg',
        type: categoryTypeEnum.OTHER,
      };

      const response = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('number');
    });

    it('should return 401 when creating category without auth', async () => {
      const categoryData: CreateCategoryRequest = {
        name: 'New Category',
        description: 'New Category Description',
        logo: 'https://example.com/logo.jpg',
        type: categoryTypeEnum.OTHER,
      };

      await request(app.getHttpServer())
        .post('/categories')
        .send(categoryData)
        .expect(401);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('should update a category when authenticated as admin', async () => {
      const updateData: UpdateCategoryRequest = {
        name: 'Updated Category',
        description: 'Updated Description',
      };

      const response = await request(app.getHttpServer())
        .patch('/categories/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body.name).toBe(updateData.name);
    });

    it('should return 401 when updating category without auth', async () => {
      const updateData: UpdateCategoryRequest = {
        name: 'Updated Category',
      };

      await request(app.getHttpServer())
        .patch('/categories/1')
        .send(updateData)
        .expect(401);
    });

    it('should return 404 when updating non-existent category', async () => {
      const updateData: UpdateCategoryRequest = {
        name: 'Updated Category',
      };

      await request(app.getHttpServer())
        .patch('/categories/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete a category when authenticated as admin', async () => {
      // First create a category to delete
      const createResponse = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Category to Delete',
          description: 'This category will be deleted',
          logoUrl: 'https://example.com/logo.jpg',
        });

      const categoryId = createResponse.body;

      // Then delete it
      await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .expect(404);
    });

    it('should return 401 when deleting category without auth', async () => {
      await request(app.getHttpServer()).delete('/categories/1').expect(401);
    });

    it('should return 404 when deleting non-existent category', async () => {
      await request(app.getHttpServer())
        .delete('/categories/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
