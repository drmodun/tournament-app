import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, loginAs } from './helpers/tournamentRun';

// Category 1 and 2 come from the seed; the admin is the user after the seeded ones
describe('Subcategories (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  const http = () => request(app.getHttpServer());

  const tournamentBody = (overrides: Record<string, unknown> = {}) => ({
    name: 'Subcategory e2e tournament',
    description: 'Created by the subcategory e2e suite',
    startDate: new Date(Date.now() + 7 * 86400000),
    endDate: new Date(Date.now() + 14 * 86400000),
    categoryId: 1,
    location: 'online',
    tournamentTeamType: 'solo',
    tournamentType: 'competition',
    isPublic: true,
    maxParticipants: 16,
    country: 'US',
    isRanked: false,
    locationId: 1,
    ...overrides,
  });

  const createSubcategory = async (categoryId: number, name: string) =>
    (
      await http()
        .post('/subcategories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name, description: 'For the e2e suite', categoryId })
        .expect(201)
    ).body.id as number;

  beforeAll(async () => {
    app = await createApp();

    const login = await http()
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Password123!' })
      .expect(201);
    adminToken = login.body.accessToken;
    userToken = await loginAs(app, 10);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('CRUD', () => {
    it('lets site admins create, read, update and delete a subcategory', async () => {
      const id = await createSubcategory(1, 'Rapid');

      const created = await http().get(`/subcategories/${id}`).expect(200);
      expect(created.body).toMatchObject({
        id,
        name: 'Rapid',
        categoryId: 1,
        tournamentCount: 0,
      });

      const extended = await http()
        .get(`/subcategories/${id}?responseType=extended`)
        .expect(200);
      expect(extended.body.category.id).toBe(1);
      expect(extended.body.createdAt).toBeDefined();

      await http()
        .patch(`/subcategories/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Blitz' })
        .expect(200);
      expect((await http().get(`/subcategories/${id}`)).body.name).toBe(
        'Blitz',
      );

      await http()
        .delete(`/subcategories/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      await http().get(`/subcategories/${id}`).expect(404);
    });

    it('lists the subcategories of a category', async () => {
      const inFirst = await createSubcategory(1, 'Listed in 1');
      const inSecond = await createSubcategory(2, 'Listed in 2');

      const response = await http()
        .get('/subcategories?categoryId=1&pageSize=100')
        .expect(200);

      const ids = response.body.results.map((s: { id: number }) => s.id);
      expect(ids).toContain(inFirst);
      expect(ids).not.toContain(inSecond);
      expect(
        response.body.results.every(
          (s: { categoryId: number }) => s.categoryId === 1,
        ),
      ).toBe(true);
      expect(response.body.metadata.pagination).toBeDefined();
    });

    it('refuses writes from users who are not site admins', async () => {
      await http()
        .post('/subcategories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Nope', categoryId: 1 })
        .expect(403);
      await http()
        .post('/subcategories')
        .send({ name: 'Nope', categoryId: 1 })
        .expect(401);
    });

    it('validates the body', async () => {
      await http()
        .post('/subcategories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'No category' })
        .expect(400);
    });

    it('answers 404 for a subcategory that does not exist', async () => {
      await http().get('/subcategories/999999').expect(404);
      await http()
        .delete('/subcategories/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('tournaments', () => {
    it('links a tournament to a subcategory of its category', async () => {
      const subcategoryId = await createSubcategory(1, 'Linked');

      const created = await http()
        .post('/tournaments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tournamentBody({ subcategoryId }))
        .expect(201);

      const tournament = await http()
        .get(`/tournaments/${created.body.id}`)
        .expect(200);
      expect(tournament.body.subcategory).toEqual({
        id: subcategoryId,
        name: 'Linked',
      });

      const filtered = await http()
        .get(`/tournaments?subcategoryId=${subcategoryId}`)
        .expect(200);
      expect(filtered.body.results.map((t: { id: number }) => t.id)).toEqual([
        created.body.id,
      ]);

      const subcategory = await http()
        .get(`/subcategories/${subcategoryId}`)
        .expect(200);
      expect(subcategory.body.tournamentCount).toBe(1);
    });

    it('filters tournaments by category', async () => {
      const response = await http()
        .get('/tournaments?categoryId=2&pageSize=100')
        .expect(200);

      expect(response.body.results.length).toBeGreaterThan(0);
      expect(
        response.body.results.every(
          (t: { category: { id: number } }) => t.category.id === 2,
        ),
      ).toBe(true);
    });

    it('refuses a subcategory of another category', async () => {
      const subcategoryId = await createSubcategory(2, 'Elsewhere');

      await http()
        .post('/tournaments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tournamentBody({ subcategoryId }))
        .expect(400);
    });

    it('drops the subcategory when the tournament moves to another category', async () => {
      const subcategoryId = await createSubcategory(1, 'Left behind');
      const created = await http()
        .post('/tournaments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tournamentBody({ subcategoryId }))
        .expect(201);

      await http()
        .patch(`/tournaments/${created.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryId: 2 })
        .expect(200);

      const tournament = await http()
        .get(`/tournaments/${created.body.id}`)
        .expect(200);
      expect(tournament.body.category.id).toBe(2);
      expect(tournament.body.subcategory).toBeNull();
    });

    it('sets and clears the subcategory of an existing tournament', async () => {
      const subcategoryId = await createSubcategory(1, 'Set later');
      const created = await http()
        .post('/tournaments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tournamentBody())
        .expect(201);
      const url = `/tournaments/${created.body.id}`;

      await http()
        .patch(url)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ subcategoryId })
        .expect(200);
      expect((await http().get(url)).body.subcategory.id).toBe(subcategoryId);

      await http()
        .patch(url)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ subcategoryId: null })
        .expect(200);
      expect((await http().get(url)).body.subcategory).toBeNull();
    });

    it('keeps a used subcategory in its category, and unlinks tournaments when it is deleted', async () => {
      const subcategoryId = await createSubcategory(1, 'In use');
      const created = await http()
        .post('/tournaments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tournamentBody({ subcategoryId }))
        .expect(201);

      await http()
        .patch(`/subcategories/${subcategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ categoryId: 2 })
        .expect(409);

      await http()
        .delete(`/subcategories/${subcategoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const tournament = await http()
        .get(`/tournaments/${created.body.id}`)
        .expect(200);
      expect(tournament.body.category.id).toBe(1);
      expect(tournament.body.subcategory).toBeNull();
    });
  });
});
