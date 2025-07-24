/**
 * Cache configuration for the OKGYM application
 */
export const cacheConfig = {
  /**
   * Whether caching is enabled
   */
  enabled: process.env.CACHE_ENABLED === 'true',
  
  /**
   * Default namespace for cache keys
   */
  namespace: process.env.CACHE_NAMESPACE || 'okgym',
  
  /**
   * Default TTL in seconds (1 hour)
   */
  defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600', 10),
  
  /**
   * Redis connection configuration
   */
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    connectTimeout: 10000,
    maxRetriesPerRequest: 3
  },
  
  /**
   * TTL settings for different data types (in seconds)
   */
  ttl: {
    /**
     * Exercise data (24 hours)
     */
    exercise: parseInt(process.env.CACHE_TTL_EXERCISE || '86400', 10),
    
    /**
     * Search results (15 minutes)
     */
    search: parseInt(process.env.CACHE_TTL_SEARCH || '900', 10),
    
    /**
     * Popular items (30 minutes)
     */
    popular: parseInt(process.env.CACHE_TTL_POPULAR || '1800', 10),
    
    /**
     * User data (5 minutes)
     */
    user: parseInt(process.env.CACHE_TTL_USER || '300', 10),
    
    /**
     * Workout plans (1 hour)
     */
    workoutPlan: parseInt(process.env.CACHE_TTL_WORKOUT_PLAN || '3600', 10),
    
    /**
     * Reference data (48 hours)
     */
    reference: parseInt(process.env.CACHE_TTL_REFERENCE || '172800', 10)
  },
  
  /**
   * Cache monitoring settings
   */
  monitoring: {
    /**
     * Whether to log cache hits/misses
     */
    logHitMiss: process.env.CACHE_LOG_HIT_MISS === 'true',
    
    /**
     * Threshold in ms for slow cache operations
     */
    slowOperationThreshold: parseInt(process.env.CACHE_SLOW_THRESHOLD || '50', 10)
  }
};

/**
 * Update the main config file to include this cache configuration
 * 
 * In config/index.ts:
 * 
 * import { cacheConfig } from './cache.config';
 * 
 * export const config = {
 *   // ... other config
 *   cache: cacheConfig
 * }; 
 */