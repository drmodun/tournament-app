import {
  BadGatewayException,
  HttpException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { importJWK, JWK, KeyLike, SignJWT } from 'jose';
import { VANSY_CONFIG, VansyConfig } from './vansy.config';
import {
  VansyContextRef,
  VansyLaunchRequest,
  VansyLaunchResponse,
  VansyQuizSummary,
} from './vansy.types';

// Vansy accepts a token for at most 60 seconds and only once
const TOKEN_LIFETIME_SECONDS = 30;
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Server-to-server calls to Vansy. Every call carries a fresh EdDSA token signed with this app's
 * key; nothing here ever reaches a browser.
 */
@Injectable()
export class VansyClient {
  private key: KeyLike | Uint8Array | null = null;

  constructor(
    @Inject(VANSY_CONFIG) private readonly config: VansyConfig | null,
  ) {}

  get enabled() {
    return !!this.config;
  }

  private settings() {
    if (!this.config) {
      throw new ServiceUnavailableException('Vansy is not configured');
    }

    return this.config;
  }

  async token() {
    const config = this.settings();
    const jwk = JSON.parse(config.privateKey) as JWK;
    this.key ??= await importJWK(jwk, 'EdDSA');
    const now = Math.floor(Date.now() / 1000);

    return new SignJWT({})
      .setProtectedHeader({ alg: 'EdDSA', kid: jwk.kid })
      .setIssuer(config.tenantId)
      .setAudience('vansy')
      .setIssuedAt(now)
      .setExpirationTime(now + TOKEN_LIFETIME_SECONDS)
      .setJti(randomUUID())
      .sign(this.key);
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const config = this.settings();
    let response: Response;

    try {
      response = await fetch(`${config.url}/v1${path}`, {
        method,
        headers: {
          authorization: `Bearer ${await this.token()}`,
          ...(body !== undefined && { 'content-type': 'application/json' }),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new BadGatewayException('Vansy could not be reached');
    }

    const data = await response.json().catch(() => ({}));

    // Vansy's own client errors (an unpublished quiz, a missing one) are passed on as they are
    if (!response.ok) {
      throw response.status >= 500
        ? new BadGatewayException('Vansy failed to answer')
        : new HttpException(data, response.status);
    }

    return data as T;
  }

  launch(body: VansyLaunchRequest) {
    return this.request<VansyLaunchResponse>('POST', '/launches', body);
  }

  getQuiz(quizId: string) {
    return this.request<VansyQuizSummary>(
      'GET',
      `/quizzes/${encodeURIComponent(quizId)}`,
    );
  }

  listQuizzes(query: Record<string, string>) {
    return this.request<{ results: VansyQuizSummary[] }>(
      'GET',
      `/quizzes?${new URLSearchParams({ pageSize: '100', ...query })}`,
    );
  }

  setContexts(quizId: string, contexts: VansyContextRef[]) {
    return this.request<VansyContextRef[]>(
      'PUT',
      `/quizzes/${encodeURIComponent(quizId)}/contexts`,
      { contexts },
    );
  }

  finalize(quizId: string) {
    return this.request<{ closedAttempts: number }>(
      'POST',
      `/quizzes/${encodeURIComponent(quizId)}/finalize`,
    );
  }
}
