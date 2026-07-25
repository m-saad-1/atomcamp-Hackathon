import { sysLogger } from './observability';
import { KVStore } from './kv';

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    return await KVStore.get<T>(key);
  }

  static async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    await KVStore.set(key, value, { ex: ttlSeconds });
  }

  static async delete(key: string): Promise<void> {
    await KVStore.del(key);
  }

  static async clear(): Promise<void> {
    // KV stores typically don't clear all easily without iteration or flushdb
    sysLogger.warn('CacheService.clear() called. Not fully supported in KV.');
  }

  /**
   * Helper for caching expensive database queries or external API calls.
   */
  static async remember<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {
      sysLogger.info(`Cache HIT for key: ${key}`);
      return cached;
    }

    sysLogger.info(`Cache MISS for key: ${key}. Executing fetcher...`);
    const data = await fetcher();
    await this.set(key, data, ttlSeconds);
    return data;
  }
}
