import {
  decodeJwt,
  decodeProtectedHeader,
  exportJWK,
  generateKeyPair,
} from 'jose';
import { VansyClient } from '../vansy.client';

describe('VansyClient', () => {
  it('signs short-lived single-use tokens for its tenant', async () => {
    const { privateKey } = await generateKeyPair('EdDSA', {
      crv: 'Ed25519',
      extractable: true,
    });
    const client = new VansyClient({
      url: 'http://vansy.test',
      tenantId: 'tournaments',
      privateKey: JSON.stringify({
        ...(await exportJWK(privateKey)),
        kid: 'tournaments-1',
      }),
      publicKey: null,
      frontendUrl: 'http://app.test',
    });

    const first = await client.token();
    const second = await client.token();
    const claims = decodeJwt(first);

    expect(decodeProtectedHeader(first)).toMatchObject({
      alg: 'EdDSA',
      kid: 'tournaments-1',
    });
    expect(claims).toMatchObject({ iss: 'tournaments', aud: 'vansy' });
    expect(claims.exp! - claims.iat!).toBeLessThanOrEqual(60);
    expect(decodeJwt(second).jti).not.toBe(claims.jti);
  });

  it('is disabled without configuration', async () => {
    const client = new VansyClient(null);
    expect(client.enabled).toBe(false);
    await expect(client.token()).rejects.toThrow('Vansy is not configured');
  });
});
