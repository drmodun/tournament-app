import { createHash } from 'crypto';
import {
  createLocalJWKSet,
  createRemoteJWKSet,
  JWK,
  JWTVerifyGetKey,
  jwtVerify,
} from 'jose';
import { VansyConfig } from './vansy.config';
import { VansyWebhookEvent } from './vansy.types';

// Older webhook signatures are refused, so a captured request cannot be replayed later
const MAX_AGE = '5m';

export class InvalidWebhookError extends Error {}

/**
 * Checks a Vansy webhook: the Vansy-Signature JWT must be Vansy's, addressed to this app, recent,
 * and bound to exactly this body by its SHA-256 and to this event by its id.
 */
export async function verifyVansyWebhook(
  keys: JWTVerifyGetKey,
  tenantId: string,
  rawBody: Buffer | string,
  signature: string | undefined,
): Promise<VansyWebhookEvent> {
  if (!signature) {
    throw new InvalidWebhookError('Missing Vansy-Signature');
  }

  let payload;
  try {
    ({ payload } = await jwtVerify(signature, keys, {
      issuer: 'vansy',
      audience: tenantId,
      algorithms: ['EdDSA'],
      maxTokenAge: MAX_AGE,
    }));
  } catch {
    throw new InvalidWebhookError('Invalid Vansy-Signature');
  }

  const hash = createHash('sha256').update(rawBody).digest('base64url');
  if (payload.body_sha256 !== hash) {
    throw new InvalidWebhookError('The body does not match its signature');
  }

  const event = JSON.parse(rawBody.toString()) as VansyWebhookEvent;
  if (payload.jti !== event.eventId || event.tenantId !== tenantId) {
    throw new InvalidWebhookError('The event does not match its signature');
  }

  return event;
}

export function vansyKeys(config: VansyConfig): JWTVerifyGetKey {
  if (config.publicKey) {
    return createLocalJWKSet({ keys: [JSON.parse(config.publicKey) as JWK] });
  }

  return createRemoteJWKSet(new URL(`${config.url}/v1/.well-known/jwks.json`));
}
