import { NextResponse } from 'next/server';

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitStore {
  [key: string]: number[];
}

const rateLimitStore: RateLimitStore = {};

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options;

  return {
    check: (limit: number, token: string): Promise<void> =>
      new Promise((resolve, reject) => {
        const now = Date.now();
        const tokenKey = `${token}`;

        if (!rateLimitStore[tokenKey]) {
          rateLimitStore[tokenKey] = [];
        }

        const timestamps = rateLimitStore[tokenKey].filter(
          (timestamp) => now - timestamp < interval
        );

        if (timestamps.length >= limit) {
          const oldestTimestamp = timestamps[0];
          const timeToWait = interval - (now - oldestTimestamp);
          reject(new Error(`Rate limit exceeded. Try again in ${Math.ceil(timeToWait / 1000)} seconds`));
        } else {
          timestamps.push(now);
          rateLimitStore[tokenKey] = timestamps;
          resolve();
        }

        if (Object.keys(rateLimitStore).length > uniqueTokenPerInterval) {
          const oldestKey = Object.keys(rateLimitStore).find(
            (key) => rateLimitStore[key].length === 0 || 
            rateLimitStore[key][0] < now - interval
          );
          if (oldestKey) {
            delete rateLimitStore[oldestKey];
          }
        }
      }),
  };
}

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export async function applyRateLimit(
  request: Request,
  limit: number = 10
): Promise<NextResponse | null> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'anonymous';
    
    await limiter.check(limit, ip);
    return null;
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: error instanceof Error ? error.message : 'Too many requests'
      },
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
        }
      }
    );
  }
}

export function withRateLimit(
  handler: (request: Request) => Promise<NextResponse>,
  limit: number = 10
) {
  return async (request: Request): Promise<NextResponse> => {
    const rateLimitResponse = await applyRateLimit(request, limit);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(request);
  };
}
