import logger from './logger';

/**
 * Simple performance tracking for service methods
 * 
 * This lightweight utility helps identify slow operations and track
 * success rates without adding excessive complexity.
 */
export class SimplePerformanceTracker {
  private static instance: SimplePerformanceTracker;
  
  // Track just basic metrics for slow operations
  private slowOperations: Record<string, {
    count: number;
    avgDuration: number;
    lastOccurrence: Date;
  }> = {};
  
  // Simple success/failure counters
  private successCounts: Record<string, number> = {};
  private failureCounts: Record<string, number> = {};
  
  /**
   * Get singleton instance
   */
  public static getInstance(): SimplePerformanceTracker {
    if (!SimplePerformanceTracker.instance) {
      SimplePerformanceTracker.instance = new SimplePerformanceTracker();
    }
    return SimplePerformanceTracker.instance;
  }
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Log periodic summary of slow operations (every hour)
    setInterval(() => this.logSlowOperationsSummary(), 60 * 60 * 1000);
  }
  
  /**
   * Track an asynchronous operation
   * 
   * @param operationName Name of the operation being tracked
   * @param slowThreshold Threshold in ms to consider an operation slow (default 100ms)
   * @param fn Function to track
   * @returns Result of the function
   */
  public async trackAsync<T>(
    operationName: string,
    slowThreshold: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    
    try {
      const result = await fn();
      this.successCounts[operationName] = (this.successCounts[operationName] || 0) + 1;
      return result;
    } catch (error) {
      this.failureCounts[operationName] = (this.failureCounts[operationName] || 0) + 1;
      throw error;
    } finally {
      const duration = Date.now() - start;
      
      // Only track detailed metrics for slow operations
      if (duration >= slowThreshold) {
        this.trackSlowOperation(operationName, duration);
        logger.warn(`Slow operation: ${operationName} took ${duration}ms`);
      }
    }
  }
  
  /**
   * Track a slow operation
   */
  private trackSlowOperation(operation: string, duration: number): void {
    if (!this.slowOperations[operation]) {
      this.slowOperations[operation] = {
        count: 0,
        avgDuration: 0,
        lastOccurrence: new Date()
      };
    }
    
    const stats = this.slowOperations[operation];
    
    // Update average duration using a simple rolling average
    const newCount = stats.count + 1;
    stats.avgDuration = (stats.avgDuration * stats.count + duration) / newCount;
    stats.count = newCount;
    stats.lastOccurrence = new Date();
  }
  
  /**
   * Get basic metrics report (for admin dashboard)
   */
  public getBasicReport(): any {
    const report: Record<string, any> = {
      slowOperations: {},
      errorRates: {}
    };
    
    // Add slow operations to report
    Object.keys(this.slowOperations).forEach(op => {
      report.slowOperations[op] = {
        count: this.slowOperations[op].count,
        avgDuration: Math.round(this.slowOperations[op].avgDuration),
        lastOccurrence: this.slowOperations[op].lastOccurrence
      };
    });
    
    // Calculate and add error rates
    Object.keys(this.successCounts).forEach(op => {
      const successCount = this.successCounts[op] || 0;
      const failureCount = this.failureCounts[op] || 0;
      const total = successCount + failureCount;
      
      if (total > 0) {
        const errorRate = Math.round((failureCount / total) * 100);
        
        // Only include operations with errors
        if (errorRate > 0) {
          report.errorRates[op] = {
            errorRate,
            total,
            failures: failureCount
          };
        }
      }
    });
    
    return report;
  }
  
  /**
   * Reset all metrics
   */
  public reset(): void {
    this.slowOperations = {};
    this.successCounts = {};
    this.failureCounts = {};
  }
  
  /**
   * Log a summary of slow operations
   */
  private logSlowOperationsSummary(): void {
    const slowOps = Object.keys(this.slowOperations);
    
    if (slowOps.length === 0) return;
    
    logger.info(`Performance Summary: ${slowOps.length} slow operations detected`, {
      slowOperations: this.slowOperations
    });
  }
}

export const simplePerformance = SimplePerformanceTracker.getInstance();

/**
 * Decorator for simple performance tracking
 * 
 * @example
 * ```
 * @SimpleTrack({ slowThreshold: 200 })
 * async getUser(id: string): Promise<User> {
 *   // method implementation
 * }
 * ```
 */
export function SimpleTrack(options: { slowThreshold?: number } = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const slowThreshold = options.slowThreshold || 100;
    const operationName = `${target.constructor.name}.${propertyKey}`;
    
    descriptor.value = async function (...args: any[]) {
      return simplePerformance.trackAsync(
        operationName,
        slowThreshold,
        () => originalMethod.apply(this, args)
      );
    };
    
    return descriptor;
  };
} 