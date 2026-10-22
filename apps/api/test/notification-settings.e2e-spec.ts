import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp, loginAs } from './helpers/tournamentRun';

describe('Notification settings and push tokens (e2e)', () => {
  let app: INestApplication;
  let tokenA: string;
  let tokenB: string;

  // Two seeded users that no other suite uses
  const userA = 60;
  const userB = 61;

  const http = () => request(app.getHttpServer());
  const as = (req: request.Test, token: string) =>
    req.set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    app = await createApp();
    tokenA = await loginAs(app, userA);
    tokenB = await loginAs(app, userB);
  });

  afterAll(async () => {
    await as(http().patch('/notifications/settings'), tokenA).send({
      inAppNotifications: true,
    });
    await app.close();
  });

  describe('settings', () => {
    it('starts with every channel on', async () => {
      const response = await as(
        http().get('/notifications/settings'),
        tokenB,
      ).expect(200);

      expect(response.body).toEqual({
        userId: userB,
        emailNotifications: true,
        pushNotifications: true,
        inAppNotifications: true,
      });
    });

    it('changes only the settings sent', async () => {
      await as(http().patch('/notifications/settings'), tokenB)
        .send({ emailNotifications: false })
        .expect(200);

      const response = await as(
        http().get('/notifications/settings'),
        tokenB,
      ).expect(200);
      expect(response.body).toMatchObject({
        emailNotifications: false,
        pushNotifications: true,
        inAppNotifications: true,
      });

      await as(http().patch('/notifications/settings'), tokenB)
        .send({ emailNotifications: true })
        .expect(200);
    });

    it('validates the body', async () => {
      await as(http().patch('/notifications/settings'), tokenB)
        .send({ inAppNotifications: 'sometimes' })
        .expect(400);
    });

    it('needs a signed-in user', async () => {
      await http().get('/notifications/settings').expect(401);
      await http().get('/notifications/push-tokens').expect(401);
    });

    it('stops storing in-app notifications for users who turn them off', async () => {
      const followerNotifications = async () => {
        const response = await as(
          http().get('/notifications?pageSize=100'),
          tokenA,
        ).expect(200);

        return response.body.filter(
          (row: { notification: { link: string } }) =>
            row.notification.link === `/user/${userB}`,
        ).length;
      };
      const followAgain = async () => {
        await as(http().delete(`/followers/${userA}`), tokenB);
        await as(http().post(`/followers/${userA}`), tokenB).expect(201);
      };

      await as(http().patch('/notifications/settings'), tokenA)
        .send({ inAppNotifications: false })
        .expect(200);
      const before = await followerNotifications();
      await followAgain();
      expect(await followerNotifications()).toBe(before);

      await as(http().patch('/notifications/settings'), tokenA)
        .send({ inAppNotifications: true })
        .expect(200);
      await followAgain();
      expect(await followerNotifications()).toBe(before + 1);

      await as(http().delete(`/followers/${userA}`), tokenB);
    });
  });

  describe('push tokens', () => {
    const deviceToken = `e2e-device-${Date.now()}`;

    it('registers, lists and removes a token', async () => {
      const registered = await as(
        http().post('/notifications/push-tokens'),
        tokenA,
      )
        .send({ token: deviceToken })
        .expect(201);
      expect(registered.body).toMatchObject({ token: deviceToken });

      const listed = await as(
        http().get('/notifications/push-tokens'),
        tokenA,
      ).expect(200);
      expect(listed.body.map((t: { token: string }) => t.token)).toContain(
        deviceToken,
      );

      await as(
        http().delete(`/notifications/push-tokens/${registered.body.id}`),
        tokenA,
      ).expect(204);

      const after = await as(
        http().get('/notifications/push-tokens'),
        tokenA,
      ).expect(200);
      expect(after.body.map((t: { token: string }) => t.token)).not.toContain(
        deviceToken,
      );
    });

    it('registers a token once, however often it is sent', async () => {
      const token = `${deviceToken}-repeat`;
      const first = await as(http().post('/notifications/push-tokens'), tokenA)
        .send({ token })
        .expect(201);
      const second = await as(http().post('/notifications/push-tokens'), tokenA)
        .send({ token })
        .expect(201);

      expect(second.body.id).toBe(first.body.id);

      const listed = await as(
        http().get('/notifications/push-tokens'),
        tokenA,
      ).expect(200);
      expect(
        listed.body.filter((t: { token: string }) => t.token === token),
      ).toHaveLength(1);
    });

    it('moves a token to the user who registers it on the device next', async () => {
      const token = `${deviceToken}-shared`;
      const registered = await as(
        http().post('/notifications/push-tokens'),
        tokenA,
      )
        .send({ token })
        .expect(201);
      await as(http().post('/notifications/push-tokens'), tokenB)
        .send({ token })
        .expect(201);

      const ofA = await as(http().get('/notifications/push-tokens'), tokenA);
      const ofB = await as(http().get('/notifications/push-tokens'), tokenB);
      expect(ofA.body.map((t: { token: string }) => t.token)).not.toContain(
        token,
      );
      expect(ofB.body.map((t: { token: string }) => t.token)).toContain(token);

      // A cannot remove the token now that it is B's
      await as(
        http().delete(`/notifications/push-tokens/${registered.body.id}`),
        tokenA,
      ).expect(404);
    });

    it('refuses an empty token', async () => {
      await as(http().post('/notifications/push-tokens'), tokenA)
        .send({ token: '' })
        .expect(400);
    });
  });
});
