/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
 *   if (!limiter.check(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface RateLimiterConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed within the window */
  max: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(config: RateLimiterConfig) {
  const store = new Map<string, RateLimitEntry>();

  // Periodic cleanup to prevent memory leaks
  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  };

  // Run cleanup every 60 seconds
  if (typeof setInterval !== "undefined") {
    setInterval(cleanup, 60_000);
  }

  return {
    /**
     * Check if a request from the given key is allowed.
     * Returns `true` if allowed, `false` if rate-limited.
     */
    check(key: string): boolean {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + config.windowMs });
        return true;
      }

      if (entry.count >= config.max) {
        return false;
      }

      entry.count++;
      return true;
    },

    /** Get remaining requests for a key */
    remaining(key: string): number {
      const entry = store.get(key);
      if (!entry || Date.now() > entry.resetAt) return config.max;
      return Math.max(0, config.max - entry.count);
    },
  };
}
