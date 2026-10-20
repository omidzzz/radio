/**
 * Simple in-memory LRU cache with TTL support.
 * Used for read-heavy database queries to reduce SQLite round-trips.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;
  private readonly defaultTtlMs: number;

  constructor(maxSize = 100, defaultTtlMs = 60_000) {
    this.maxSize = maxSize;
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check expiry
    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// Global cache instances (survive HMR in dev via globalThis).
// Values are typed as unknown — consumers should cast on read.
const globalForCache = globalThis as unknown as {
  __blogCache?: LRUCache<unknown>;
  __forumCache?: LRUCache<unknown>;
  __statsCache?: LRUCache<unknown>;
};

export const blogCache =
  globalForCache.__blogCache ?? (globalForCache.__blogCache = new LRUCache(200, 60_000));
export const forumCache =
  globalForCache.__forumCache ?? (globalForCache.__forumCache = new LRUCache(200, 60_000));
export const statsCache =
  globalForCache.__statsCache ?? (globalForCache.__statsCache = new LRUCache(50, 30_000));

export default LRUCache;