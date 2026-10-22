import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, loginAs } from './helpers/tournamentRun';

describe('Personal access tokens (e2e)', () => {
  let app: INestApplication;
  let login: string;
  let otherLogin: string;
  let adminLogin: string;

  // Seeded users that no other suite uses, and the seeded site admin
  const owner = 62;
  const other = 63;
  const admin = 101;

  const http = () => request(app.getHttpServer());
  const as = (req: request.Test, token: string) =>
    req.set('Authorization', `Bearer ${token}`);

  const createToken = async (
    token: string,
    body: Record<string, unknown> = { name: 'script', scopes: ['write'] },
  ) =>
    (await as(http().post('/auth/tokens'), token).send(body).expect(201)).body;

  beforeAll(async () => {
    app = await createApp();
    login = await loginAs(app, owner);
    otherLogin = await loginAs(app, other);
    adminLogin = await loginAs(app, admin);
  });

  afterAll(async () => {
    for (const token of [login, otherLogin, adminLogin]) {
      await as(http().delete('/auth/tokens'), token);
    }
    await app.close();
  });

  it('shows the token once and never lists it or its hash', async () => {
    const created = await createToken(login, {
      name: 'Discord bot',
      scopes: ['read'],
    });

    expect(created.token).toMatch(/^wsh_[A-Za-z0-9_-]{43}$/);
    expect(created).toMatchObject({
      name: 'Discord bot',
      prefix: created.token.slice(4, 12),
      scopes: ['read'],
      revokedAt: null,
    });
    expect(new Date(created.expiresAt).getTime() - Date.now()).toBeGreaterThan(
      89 * 86400000,
    );

    const list = await as(http().get('/auth/tokens'), login).expect(200);
    const listed = list.body.find(
      (token: { id: number }) => token.id === created.id,
    );
    expect(listed).toBeDefined();
    expect(listed).not.toHaveProperty('token');
    expect(listed).not.toHaveProperty('tokenHash');
    expect(JSON.stringify(list.body)).not.toContain(created.token);
  });

  it('acts as its user until it is revoked', async () => {
    const { id, token } = await createToken(login);

    const me = await as(http().get('/users/me'), token).expect(200);
    expect(me.body.id).toBe(owner);

    await as(http().delete(`/auth/tokens/${id}`), login).expect(200);
    const refused = await as(http().get('/users/me'), token).expect(401);
    expect(refused.body.message).toBe('Invalid, expired or revoked API token');
  });

  it('lets a read-only token read but not write', async () => {
    const { token } = await createToken(login, {
      name: 'reader',
      scopes: ['read'],
    });

    await as(http().get('/users/me'), token).expect(200);
    const refused = await as(http().patch('/users'), token)
      .send({ bio: 'changed by a read-only token' })
      .expect(403);
    expect(refused.body.message).toBe('This token is read-only');
  });

  it('lets a write token change what its user may change', async () => {
    const { token } = await createToken(login);

    await as(http().patch('/users'), token)
      .send({ bio: 'changed by an API token' })
      .expect(200);
  });

  it('cannot manage tokens or delete the account', async () => {
    const { id, token } = await createToken(login);

    for (const req of [
      () => http().get('/auth/tokens'),
      () =>
        http()
          .post('/auth/tokens')
          .send({ name: 'more', scopes: ['write'] }),
      () => http().delete(`/auth/tokens/${id}`),
      () => http().delete('/auth/tokens'),
      () => http().delete('/users'),
    ]) {
      const refused = await as(req(), token).expect(403);
      expect(refused.body.message).toBe(
        'This action needs a login, not an API token',
      );
    }

    await as(http().get('/users/me'), token).expect(200);
  });

  it('refuses unknown wsh_ tokens and still accepts logins', async () => {
    await as(http().get('/users/me'), 'wsh_not-a-real-token').expect(401);
    await as(http().get('/users/me'), login).expect(200);
  });

  it('does not carry site admin rights', async () => {
    const { token } = await createToken(adminLogin);

    const refused = await as(http().patch(`/users/${other}`), token)
      .send({ bio: 'changed by an admin token' })
      .expect(403);
    expect(refused.body.message).toBe(
      'Admin actions need a login, not an API token',
    );
    await as(http().get('/users/me'), token).expect(200);
  });

  it('answers 404 for someone else’s token', async () => {
    const { id } = await createToken(login);

    await as(http().delete(`/auth/tokens/${id}`), otherLogin).expect(404);
    await as(http().get(`/auth/tokens/${id}/usage`), otherLogin).expect(404);
  });

  it('counts requests per day and sets lastUsedAt', async () => {
    const { id, token } = await createToken(login);

    for (let i = 0; i < 3; i++) {
      await as(http().get('/users/me'), token).expect(200);
    }

    // Use is recorded alongside the request, so give it a moment
    await new Promise((resolve) => setTimeout(resolve, 200));

    const usage = await as(
      http().get(`/auth/tokens/${id}/usage`),
      login,
    ).expect(200);
    expect(usage.body).toEqual([
      { day: new Date().toISOString().slice(0, 10), requests: 3 },
    ]);

    const list = await as(http().get('/auth/tokens'), login).expect(200);
    const listed = list.body.find((token: { id: number }) => token.id === id);
    expect(listed.lastUsedAt).not.toBeNull();
  });

  it('validates the body', async () => {
    for (const body of [
      { name: '', scopes: ['read'] },
      { name: 'a'.repeat(61), scopes: ['read'] },
      { name: 'a', scopes: [] },
      { name: 'a', scopes: ['admin'] },
      { name: 'a', scopes: ['read'], expiresInDays: 0 },
      { name: 'a', scopes: ['read'], expiresInDays: 366 },
    ]) {
      await as(http().post('/auth/tokens'), login).send(body).expect(400);
    }

    const never = await createToken(login, {
      name: 'forever',
      scopes: ['read'],
      expiresInDays: null,
    });
    expect(never.expiresAt).toBeNull();
  });

  it('allows at most 10 active tokens, and revoking all frees them', async () => {
    await as(http().delete('/auth/tokens'), otherLogin).expect(200);

    for (let i = 0; i < 10; i++) {
      await createToken(otherLogin, { name: `token ${i}`, scopes: ['read'] });
    }
    const refused = await as(http().post('/auth/tokens'), otherLogin)
      .send({ name: 'eleventh', scopes: ['read'] })
      .expect(400);
    expect(refused.body.message).toBe(
      'You can have at most 10 active API tokens',
    );

    const revoked = await as(http().delete('/auth/tokens'), otherLogin).expect(
      200,
    );
    expect(revoked.body).toEqual({ revoked: 10 });
    await createToken(otherLogin, { name: 'after', scopes: ['read'] });
  });

  it('limits a token to 120 requests a minute and tells its owner', async () => {
    const { token } = await createToken(otherLogin, {
      name: 'busy script',
      scopes: ['read'],
    });

    let last: request.Response | undefined;
    for (let i = 0; i < 120; i++) {
      last = await as(http().get('/users/me'), token).expect(200);
    }
    expect(last!.headers['x-ratelimit-remaining']).toBe('0');

    const refused = await as(http().get('/users/me'), token).expect(429);
    expect(Number(refused.headers['retry-after'])).toBeGreaterThan(0);

    // The notices are sent alongside the requests
    await new Promise((resolve) => setTimeout(resolve, 500));
    const notifications = await as(
      http().get('/notifications'),
      otherLogin,
    ).expect(200);
    const messages = notifications.body.map(
      (row: { notification: { message: string } }) => row.notification.message,
    );
    expect(messages).toContain(
      'Your API token busy script made 96 of its 120 requests a minute',
    );
    expect(messages).toContain(
      'Your API token busy script reached its limit of 120 requests a minute and is being refused until the minute is over',
    );
  });
});
