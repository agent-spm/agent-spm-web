/**
 * In-memory sliding-window rate limiter & client IP extractor.
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

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "127.0.0.1";
}

export function createRateLimiter(config: RateLimiterConfig) {
  const store = new Map<string, RateLimitEntry>();

  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  };

  if (typeof setInterval !== "undefined") {
    const timer = setInterval(cleanup, 60_000);
    if (typeof timer === "object" && timer !== null && "unref" in timer) {
      (timer as { unref: () => void }).unref();
    }
  }

  return {
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

    reset(key: string): void {
      store.delete(key);
    },

    remaining(key: string): number {
      const entry = store.get(key);
      if (!entry || Date.now() > entry.resetAt) return config.max;
      return Math.max(0, config.max - entry.count);
    },
  };
}

// Pre-configured security limiters across authentication & payment APIs
export const otpSendLimiter = createRateLimiter({ windowMs: 5 * 60_000, max: 5 });
export const otpVerifyLimiter = createRateLimiter({ windowMs: 10 * 60_000, max: 5 });
export const authApiLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });
export const checkoutApiLimiter = createRateLimiter({ windowMs: 60_000, max: 15 });
export const publishApiLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });
export const downloadApiLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });
export const demoInspectLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });
