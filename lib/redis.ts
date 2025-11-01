class RedisClient {
  private cache: Map<string, { value: string; expiry: number }>;
  private connected: boolean;

  constructor() {
    this.cache = new Map();
    this.connected = false;
    this.connect();
  }

  private async connect() {
    if (process.env.REDIS_URL) {
      try {
        this.connected = true;
        console.log('Redis client initialized (in-memory fallback)');
      } catch (error) {
        console.warn('Redis connection failed, using in-memory cache:', error);
        this.connected = false;
      }
    }
  }

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, expirySeconds: number = 3600): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + expirySeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async incr(key: string): Promise<number> {
    const current = await this.get(key);
    const value = current ? parseInt(current) + 1 : 1;
    await this.set(key, value.toString());
    return value;
  }

  async expire(key: string, seconds: number): Promise<void> {
    const item = this.cache.get(key);
    if (item) {
      item.expiry = Date.now() + seconds * 1000;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

let redis: RedisClient | null = null;

export function getRedisClient(): RedisClient {
  if (!redis) {
    redis = new RedisClient();
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  expirySeconds: number = 3600
): Promise<void> {
  try {
    const client = getRedisClient();
    await client.set(key, JSON.stringify(value), expirySeconds);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  console.log(`Cache invalidation pattern: ${pattern}`);
}
