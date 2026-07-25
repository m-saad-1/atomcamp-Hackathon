import { sysLogger } from './observability';

// This abstracts a Redis/KV store (e.g., @vercel/kv) 
// to prevent Serverless cold-start memory loss anti-patterns.
export class KVStore {
  // Simulating the external KV call
  static async get<T>(key: string): Promise<T | null> {
    try {
      // In production: return await kv.get(key);
      sysLogger.info(`[KV] GET ${key}`);
      return null; // Mock
    } catch {
      return null;
    }
  }

  static async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
    try {
       // In production: await kv.set(key, value, options);
       sysLogger.info(`[KV] SET ${key}`, { value, options });
    } catch (err) {
       sysLogger.error(`[KV] Error setting ${key}`, { err });
    }
  }

  static async incr(key: string): Promise<number> {
    try {
       // In production: return await kv.incr(key);
       sysLogger.info(`[KV] INCR ${key}`);
       return 1; // Mock
    } catch {
       return 1;
    }
  }
  
  static async del(key: string): Promise<void> {
    try {
       // In production: await kv.del(key);
       sysLogger.info(`[KV] DEL ${key}`);
    } catch {}
  }
}
