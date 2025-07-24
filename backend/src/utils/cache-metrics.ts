import logger from './logger';

/**
 * Cache metrics collection and reporting
 * 
 * This utility tracks cache performance metrics such as hit/miss ratios,
 * latency, and storage metrics to optimize cache usage.
 */
export class CacheMetrics {
  private static instance: CacheMetrics;
  
  // Core metrics
  private hits: number = 0;
  private misses: number = 0;
  private sets: number = 0;
  private deletes: number = 0;
  private errors: number = 0;
  
  // Timing metrics (in ms)
  private getLatencyTotal: number = 0;
  private setLatencyTotal: number = 0;
  private deleteLatencyTotal: number = 0;
  
  // Domain-specific metrics for key areas
  private domainHits: Record<string, number> = {};
  private domainMisses: Record<string, number> = {};
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): CacheMetrics {
    if (!CacheMetrics.instance) {
      CacheMetrics.instance = new CacheMetrics();
    }
    return CacheMetrics.instance;
  }
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Report metrics periodically
    setInterval(() => this.reportMetrics(), 5 * 60 * 1000); // Every 5 minutes
  }
  
  /**
   * Record a cache hit
   * 
   * @param domain Optional domain for categorizing the hit
   * @param latencyMs Latency of the operation in milliseconds
   */
  public recordHit(domain: string = 'default', latencyMs: number = 0): void {
    this.hits++;
    this.getLatencyTotal += latencyMs;
    
    // Track domain-specific hits
    this.domainHits[domain] = (this.domainHits[domain] || 0) + 1;
  }
  
  /**
   * Record a cache miss
   * 
   * @param domain Optional domain for categorizing the miss
   * @param latencyMs Latency of the operation in milliseconds
   */
  public recordMiss(domain: string = 'default', latencyMs: number = 0): void {
    this.misses++;
    this.getLatencyTotal += latencyMs;
    
    // Track domain-specific misses
    this.domainMisses[domain] = (this.domainMisses[domain] || 0) + 1;
  }
  
  /**
   * Record a cache set operation
   * 
   * @param latencyMs Latency of the operation in milliseconds
   */
  public recordSet(latencyMs: number = 0): void {
    this.sets++;
    this.setLatencyTotal += latencyMs;
  }
  
  /**
   * Record a cache delete operation
   * 
   * @param latencyMs Latency of the operation in milliseconds
   */
  public recordDelete(latencyMs: number = 0): void {
    this.deletes++;
    this.deleteLatencyTotal += latencyMs;
  }
  
  /**
   * Record a cache error
   */
  public recordError(): void {
    this.errors++;
  }
  
  /**
   * Get the current hit rate as a percentage
   * 
   * @returns Hit rate percentage or 0 if no operations
   */
  public getHitRate(): number {
    const total = this.hits + this.misses;
    if (total === 0) return 0;
    return Math.round((this.hits / total) * 100);
  }
  
  /**
   * Get domain-specific hit rates
   * 
   * @returns Object with domain hit rates
   */
  public getDomainHitRates(): Record<string, number> {
    const result: Record<string, number> = {};
    
    // Combine all domain keys
    const domains = new Set([
      ...Object.keys(this.domainHits),
      ...Object.keys(this.domainMisses)
    ]);
    
    // Calculate hit rate for each domain
    domains.forEach(domain => {
      const hits = this.domainHits[domain] || 0;
      const misses = this.domainMisses[domain] || 0;
      const total = hits + misses;
      
      if (total === 0) {
        result[domain] = 0;
      } else {
        result[domain] = Math.round((hits / total) * 100);
      }
    });
    
    return result;
  }
  
  /**
   * Get average latency for get operations
   * 
   * @returns Average latency in ms or 0 if no operations
   */
  public getAverageGetLatency(): number {
    const total = this.hits + this.misses;
    if (total === 0) return 0;
    return Math.round(this.getLatencyTotal / total);
  }
  
  /**
   * Get average latency for set operations
   * 
   * @returns Average latency in ms or 0 if no operations
   */
  public getAverageSetLatency(): number {
    if (this.sets === 0) return 0;
    return Math.round(this.setLatencyTotal / this.sets);
  }
  
  /**
   * Get average latency for delete operations
   * 
   * @returns Average latency in ms or 0 if no operations
   */
  public getAverageDeleteLatency(): number {
    if (this.deletes === 0) return 0;
    return Math.round(this.deleteLatencyTotal / this.deletes);
  }
  
  /**
   * Reset all metrics
   */
  public reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.deletes = 0;
    this.errors = 0;
    this.getLatencyTotal = 0;
    this.setLatencyTotal = 0;
    this.deleteLatencyTotal = 0;
    this.domainHits = {};
    this.domainMisses = {};
  }
  
  /**
   * Report current metrics to the logger
   */
  public reportMetrics(): void {
    const totalOperations = this.hits + this.misses + this.sets + this.deletes;
    if (totalOperations === 0) return; // Skip reporting if no activity
    
    logger.info('Cache Metrics Report', {
      hitRate: `${this.getHitRate()}%`,
      operations: {
        total: totalOperations,
        hits: this.hits,
        misses: this.misses,
        sets: this.sets,
        deletes: this.deletes,
        errors: this.errors
      },
      latency: {
        get: `${this.getAverageGetLatency()}ms`,
        set: `${this.getAverageSetLatency()}ms`,
        delete: `${this.getAverageDeleteLatency()}ms`
      },
      domainHitRates: this.getDomainHitRates()
    });
  }
}

// Export the singleton instance
export const cacheMetrics = CacheMetrics.getInstance(); 