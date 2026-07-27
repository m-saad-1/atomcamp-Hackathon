import { sysLogger } from './observability';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client. Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }) 
  : null;

export class KVStore {
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (redis) {
        return await redis.get<T>(key);
      }
      sysLogger.warn(\[KV] Redis not configured, mocking GET \\);
      return null;
    } catch (err) {
      sysLogger.error(\[KV] Error getting \\, { err });
      return null;
    }
  }

  static async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
    try {
      if (redis) {
        if (options?.ex) {
          await redis.set(key, value, { ex: options.ex });
        } else {
          await redis.set(key, value);
        }
      } else {
        sysLogger.warn(\[KV] Redis not configured, mocking SET \\);
      }
    } catch (err) {
       sysLogger.error(\[KV] Error setting \\, { err });
    }
  }

  static async incr(key: string): Promise<number> {
    try {
      if (redis) {
        return await redis.incr(key);
      }
      sysLogger.warn(\[KV] Redis not configured, mocking INCR \\);
      return 1;
    } catch (err) {
       sysLogger.error(\[KV] Error incrementing \\, { err });
       return 1;
    }
  }
  
  static async del(key: string): Promise<void> {
    try {
      if (redis) {
        await redis.del(key);
      } else {
        sysLogger.warn(\[KV] Redis not configured, mocking DEL \\);
      }
    } catch (err) {
       sysLogger.error(\[KV] Error deleting \\, { err });
    }
  }
}
