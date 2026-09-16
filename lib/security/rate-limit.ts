import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

type LimitType = 'LOGIN' | 'OTP' | 'API';

// In-Memory Rate Limiter Fallback for environments without Redis configured
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(identifier: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const record = memoryStore.get(identifier);

  if (!record || now > record.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: maxRequests - record.count };
}

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const loginLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 m'), analytics: true })
  : null;

const otpLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '5 m'), analytics: true })
  : null;

const apiLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 m'), analytics: true })
  : null;

export async function checkRateLimit(identifier: string, type: LimitType) {
  try {
    if (type === 'LOGIN') {
      if (loginLimiter) return await loginLimiter.limit(`login:${identifier}`);
      return memoryRateLimit(`login:${identifier}`, 5, 60 * 1000);
    }

    if (type === 'OTP') {
      if (otpLimiter) return await otpLimiter.limit(`otp:${identifier}`);
      return memoryRateLimit(`otp:${identifier}`, 3, 5 * 60 * 1000);
    }

    if (apiLimiter) return await apiLimiter.limit(`api:${identifier}`);
    return memoryRateLimit(`api:${identifier}`, 100, 60 * 1000);
  } catch (err) {
    console.warn('Rate limiting fallback to memory store:', err);
    return memoryRateLimit(`${type}:${identifier}`, 100, 60 * 1000);
  }
}
