export const RATE_LIMIT = 120;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
// The share of the limit at which the user is warned.
export const RATE_LIMIT_WARNING_RATIO = 0.8;

const SWEEP_THRESHOLD = 10_000;

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
  // Milliseconds until the window starts over.
  resetInMs: number;
  // True on the request that first reaches 80% / 100% of the limit in a
  // window, so each crossing is reported once.
  reachedWarning: boolean;
  reachedLimit: boolean;
}

interface Window {
  startedAt: number;
  count: number;
}

/**
 * Fixed-window request counter per API token: RATE_LIMIT requests per
 * minute.
 *
 * The counts live in this process. With several API instances each has its
 * own budget, so a token can make up to RATE_LIMIT requests a minute per
 * instance. A shared store (Redis) would fix that if it ever matters.
 */
export class ApiTokenRateLimiter {
  private readonly windows = new Map<number, Window>();

  constructor(
    private readonly limit = RATE_LIMIT,
    private readonly windowMs = RATE_LIMIT_WINDOW_MS,
  ) {}

  hit(tokenId: number, now = Date.now()): RateLimitResult {
    let window = this.windows.get(tokenId);
    if (!window || now - window.startedAt >= this.windowMs) {
      if (!window && this.windows.size >= SWEEP_THRESHOLD) this.sweep(now);
      window = { startedAt: now, count: 0 };
      this.windows.set(tokenId, window);
    }

    window.count++;
    const warningAt = Math.ceil(this.limit * RATE_LIMIT_WARNING_RATIO);
    return {
      allowed: window.count <= this.limit,
      count: window.count,
      limit: this.limit,
      remaining: Math.max(0, this.limit - window.count),
      resetInMs: window.startedAt + this.windowMs - now,
      reachedWarning: window.count === warningAt,
      reachedLimit: window.count === this.limit,
    };
  }

  private sweep(now: number) {
    for (const [tokenId, window] of this.windows)
      if (now - window.startedAt >= this.windowMs) this.windows.delete(tokenId);
  }
}
