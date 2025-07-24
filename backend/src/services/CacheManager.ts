import { config } from '../config';
import logger from '../utils/logger';
import { cacheMetrics } from '../utils/cache-metrics';

/**
 * Options for cache operations
 */
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string; // Cache namespace for grouping related items
  domain?: string; // Domain for metrics tracking
}

/**
 * Cache statistics for monitoring
 */
export interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRatio: number;
  avgGetTime: number;
  avgSetTime: number;
}

/**
 * Simple in-memory cache implementation
 */
class MemoryCache {
  private cache: Map<string, { value: any; expiry: number | null }>;
  private stats: {
    hits: number;
    misses: number;
    totalGetTime: number;
    getRequests: number;
    totalSetTime: number;
    setRequests: number;
  };

  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      totalGetTime: 0,
      getRequests: 0,
      totalSetTime: 0,
      setRequests: 0
    };
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const start = Date.now();
    const item = this.cache.get(key);
    
    this.stats.getRequests++;
    this.stats.totalGetTime += Date.now() - start;
    
    // If item doesn't exist, return null
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // If item has expired, delete it and return null
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Return the cached value
    this.stats.hits++;
    return item.value as T;
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param options Cache options including TTL
   */
  set(key: string, value: any, options: CacheOptions = {}): void {
    const start = Date.now();
    const ttl = options.ttl || 0;
    
    // Calculate expiry time (or null for no expiry)
    const expiry = ttl > 0 ? Date.now() + (ttl * 1000) : null;
    this.cache.set(key, { value, expiry });
    
    this.stats.setRequests++;
    this.stats.totalSetTime += Date.now() - start;
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete all values that match a pattern
   * @param pattern Key pattern to match (simple wildcard matching)
   */
  deleteByPattern(pattern: string): void {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get all keys that match a pattern
   * @param pattern Key pattern to match (simple wildcard matching)
   * @returns Array of matching keys
   */
  keys(pattern: string = '*'): string[] {
    const regexPattern = pattern.replace(/\*/g, '.*');
    const regex = new RegExp(`^${regexPattern}$`);
    const keys: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keys.push(key);
      }
    }
    
    return keys;
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): CacheStats {
    const { hits, misses, totalGetTime, getRequests, totalSetTime, setRequests } = this.stats;
    const totalRequests = hits + misses;
    
    return {
      hits,
      misses,
      totalRequests,
      hitRatio: totalRequests > 0 ? hits / totalRequests : 0,
      avgGetTime: getRequests > 0 ? totalGetTime / getRequests : 0,
      avgSetTime: setRequests > 0 ? totalSetTime / setRequests : 0
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalGetTime: 0,
      getRequests: 0,
      totalSetTime: 0,
      setRequests: 0
    };
  }
}

/**
 * Cache manager that can be extended to support different cache providers
 */
class CacheManager {
  private provider: MemoryCache;
  private defaultTTL: number;
  private enabled: boolean;

  constructor() {
    this.provider = new MemoryCache();
    this.defaultTTL = config.cache?.defaultTTL || 3600; // 1 hour default
    this.enabled = config.cache?.enabled || true;
    logger.info('Cache Manager initialized with Memory Cache');
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @param options Cache options including domain for metrics
   * @returns Cached value or null if not found
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.enabled) return null;
    
    const domain = this.extractDomain(key, options);
    const start = Date.now();
    
    try {
      const value = this.provider.get<T>(key);
      const duration = Date.now() - start;
      
      if (value !== null) {
        // Cache hit
        cacheMetrics.recordHit(domain, duration);
      } else {
        // Cache miss
        cacheMetrics.recordMiss(domain, duration);
      }
      
      return value;
    } catch (error) {
      // Record the error
      cacheMetrics.recordError();
      logger.warn('Cache get error', { key, domain, error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Set a value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param options Cache options including TTL and domain
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    if (!this.enabled) return;
    if (value === undefined || value === null) return;
    
    const domain = this.extractDomain(key, options);
    const start = Date.now();
    
    try {
      const ttl = options.ttl !== undefined ? options.ttl : this.defaultTTL;
      this.provider.set(key, value, { ttl });
      
      const duration = Date.now() - start;
      cacheMetrics.recordSet(duration);
    } catch (error) {
      cacheMetrics.recordError();
      logger.warn('Cache set error', { key, domain, error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Delete a value from cache
   * @param key Cache key
   * @param options Cache options including domain
   */
  async delete(key: string, options: CacheOptions = {}): Promise<void> {
    if (!this.enabled) return;
    
    const domain = this.extractDomain(key, options);
    const start = Date.now();
    
    try {
      this.provider.delete(key);
      
      const duration = Date.now() - start;
      cacheMetrics.recordDelete(duration);
    } catch (error) {
      cacheMetrics.recordError();
      logger.warn('Cache delete error', { key, domain, error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Delete all values that match a pattern
   * @param pattern Key pattern to match
   * @param options Cache options including domain
   */
  async deleteByPattern(pattern: string, options: CacheOptions = {}): Promise<void> {
    if (!this.enabled) return;
    
    const domain = this.extractDomain(pattern, options);
    const start = Date.now();
    
    try {
      this.provider.deleteByPattern(pattern);
      
      const duration = Date.now() - start;
      cacheMetrics.recordDelete(duration);
    } catch (error) {
      cacheMetrics.recordError();
      logger.warn('Cache delete pattern error', { pattern, domain, error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (!this.enabled) return;
    try {
      this.provider.clear();
    } catch (error) {
      logger.warn('Cache clear error', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Get all keys that match a pattern
   * @param pattern Key pattern to match
   * @returns Array of matching keys
   */
  async keys(pattern: string = '*'): Promise<string[]> {
    if (!this.enabled) return [];
    try {
      return this.provider.keys(pattern);
    } catch (error) {
      logger.warn('Cache keys error', { pattern, error: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): CacheStats {
    return this.provider.getStats();
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.provider.resetStats();
  }

  /**
   * Enable or disable cache
   * @param enabled Whether cache is enabled
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    logger.info(`Cache ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Extract domain from key or options for metrics tracking
   * 
   * @param key Cache key or pattern
   * @param options Cache options
   * @returns Domain for metrics
   */
  private extractDomain(key: string, options: CacheOptions): string {
    // If domain is explicitly provided in options, use it
    if (options.domain) {
      return options.domain;
    }
    
    // Try to extract domain from key
    // Examples:
    // - user:123 -> user
    // - user:email:test@example.com -> user
    // - posts:recent -> posts
    const firstPart = key.split(':')[0];
    if (firstPart) {
      return firstPart;
    }
    
    // Default domain
    return 'default';
  }
  
  /**
   * Get combined metrics report
   * Includes both internal provider stats and the global cache metrics
   */
  getMetricsReport(): any {
    const providerStats = this.provider.getStats();
    
    return {
      enabled: this.enabled,
      providerStats,
      hitRate: `${cacheMetrics.getHitRate()}%`,
      domainHitRates: cacheMetrics.getDomainHitRates(),
      avgLatency: {
        get: `${cacheMetrics.getAverageGetLatency()}ms`,
        set: `${cacheMetrics.getAverageSetLatency()}ms`,
        delete: `${cacheMetrics.getAverageDeleteLatency()}ms`
      }
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager(); 