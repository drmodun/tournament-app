import { createHash, randomUUID } from 'crypto';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { InvalidWebhookError, verifyVansyWebhook } from '../webhookVerifier';

describe('verifyVansyWebhook', () => {
  let keys: ReturnType<typeof createLocalJWKSet>;
  let privateKey: CryptoKey;

  beforeAll(async () => {
    const pair = await generateKeyPair('EdDSA', {
      crv: 'Ed25519',
      extractable: true,
    });
    privateKey = pair.privateKey as CryptoKey;
    keys = createLocalJWKSet({
      keys: [{ ...(await exportJWK(pair.publicKey)), kid: 'vansy' }],
    });
  });

  const event = (eventId = randomUUID()) =>
    JSON.stringify({
      eventId,
      type: 'attempt.completed',
      tenantId: 'tournaments',
      occurredAt: '',
    });

  async function sign(
    body: string,
    overrides: {
      aud?: string;
      iat?: number;
      jti?: string;
      key?: CryptoKey;
    } = {},
  ) {
    const hash = createHash('sha256').update(body).digest('base64url');
    const now = overrides.iat ?? Math.floor(Date.now() / 1000);
    return new SignJWT({ body_sha256: hash })
      .setProtectedHeader({ alg: 'EdDSA', kid: 'vansy' })
      .setIssuer('vansy')
      .setAudience(overrides.aud ?? 'tournaments')
      .setJti(overrides.jti ?? JSON.parse(body).eventId)
      .setIssuedAt(now)
      .setExpirationTime(now + 300)
      .sign(overrides.key ?? privateKey);
  }

  it('accepts a correctly signed event', async () => {
    const body = event();
    const parsed = await verifyVansyWebhook(
      keys,
      'tournaments',
      Buffer.from(body),
      await sign(body),
    );
    expect(parsed.type).toBe('attempt.completed');
  });

  it('refuses a missing signature', async () => {
    await expect(
      verifyVansyWebhook(keys, 'tournaments', Buffer.from(event()), undefined),
    ).rejects.toThrow(InvalidWebhookError);
  });

  it('refuses a changed body', async () => {
    const body = event();
    const signature = await sign(body);
    await expect(
      verifyVansyWebhook(
        keys,
        'tournaments',
        Buffer.from(body.replace('completed', 'reviewed')),
        signature,
      ),
    ).rejects.toThrow('The body does not match its signature');
  });

  it('refuses a signature for another app', async () => {
    const body = event();
    await expect(
      verifyVansyWebhook(
        keys,
        'tournaments',
        Buffer.from(body),
        await sign(body, { aud: 'zbirka' }),
      ),
    ).rejects.toThrow('Invalid Vansy-Signature');
  });

  it('refuses an old signature', async () => {
    const body = event();
    const old = Math.floor(Date.now() / 1000) - 3600;
    await expect(
      verifyVansyWebhook(
        keys,
        'tournaments',
        Buffer.from(body),
        await sign(body, { iat: old }),
      ),
    ).rejects.toThrow(InvalidWebhookError);
  });

  it('refuses a signature made with another key', async () => {
    const other = await generateKeyPair('EdDSA', { crv: 'Ed25519' });
    const body = event();
    await expect(
      verifyVansyWebhook(
        keys,
        'tournaments',
        Buffer.from(body),
        await sign(body, { key: other.privateKey as CryptoKey }),
      ),
    ).rejects.toThrow('Invalid Vansy-Signature');
  });

  it('refuses a signature for another event', async () => {
    const body = event();
    await expect(
      verifyVansyWebhook(
        keys,
        'tournaments',
        Buffer.from(body),
        await sign(body, { jti: 'other' }),
      ),
    ).rejects.toThrow('The event does not match its signature');
  });
});
