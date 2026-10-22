import { ApiTokenRateLimiter } from '../api-token-rate-limiter';

describe('ApiTokenRateLimiter', () => {
  const hits = (limiter: ApiTokenRateLimiter, n: number, now = 0) =>
    Array.from({ length: n }, () => limiter.hit(1, now));

  it('allows 120 requests a minute by default', () => {
    const results = hits(new ApiTokenRateLimiter(), 121);
    expect(results[119]).toMatchObject({
      allowed: true,
      count: 120,
      limit: 120,
      remaining: 0,
    });
    expect(results[120].allowed).toBe(false);
  });

  it('reports reaching 80% and 100% of the limit once per window', () => {
    const results = hits(new ApiTokenRateLimiter(10, 1000), 12);
    expect(results.filter((r) => r.reachedWarning).map((r) => r.count)).toEqual(
      [8],
    );
    expect(results.filter((r) => r.reachedLimit).map((r) => r.count)).toEqual([
      10,
    ]);
  });

  it('starts over when the window has passed', () => {
    const limiter = new ApiTokenRateLimiter(2, 1000);
    hits(limiter, 3, 0);
    expect(limiter.hit(1, 999)).toMatchObject({
      allowed: false,
      resetInMs: 1,
    });
    expect(limiter.hit(1, 1000)).toMatchObject({ allowed: true, count: 1 });
  });

  it('counts each token separately', () => {
    const limiter = new ApiTokenRateLimiter(1, 1000);
    expect(limiter.hit(1, 0).allowed).toBe(true);
    expect(limiter.hit(2, 0).allowed).toBe(true);
    expect(limiter.hit(1, 0).allowed).toBe(false);
  });
});
