import { getCorsOrigin } from '../corsOrigin';

describe('getCorsOrigin', () => {
  it('uses the configured allow-list', () => {
    expect(
      getCorsOrigin({
        CORS_ORIGIN: 'https://a.example, https://b.example',
        MODE: 'production',
        FRONTEND_URL: 'https://c.example',
      }),
    ).toEqual(['https://a.example', 'https://b.example']);
  });

  it('only allows the frontend in production when nothing is configured', () => {
    expect(
      getCorsOrigin({ MODE: 'production', FRONTEND_URL: 'https://c.example' }),
    ).toEqual(['https://c.example']);
  });

  it('allows every origin in development', () => {
    expect(
      getCorsOrigin({ MODE: 'development', FRONTEND_URL: 'http://localhost' }),
    ).toBe(true);
    expect(getCorsOrigin({ CORS_ORIGIN: '' })).toBe(true);
  });
});
