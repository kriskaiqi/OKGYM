import logger from './logger';

/**
 * Service metrics collection and reporting
 * 
 * This utility tracks service performance metrics such as response times,
 * success/failure rates, and throughput for monitoring service health.
 */
export class ServiceMetrics {
  private static instance: ServiceMetrics;
  
  // Core metrics
  private callCounts: Record<string, number> = {};
  private successCounts: Record<string, number> = {};
  private failureCounts: Record<string, number> = {};
  private totalDurations: Record<string, number> = {};
  private maxDurations: Record<string, number> = {};
  private minDurations: Record<string, { value: number, hasValue: boolean }> = {};
  
  // Timestamp tracking
  private lastCallTimestamps: Record<string, number> = {};
  private callsPerMinute: Record<string, number[]> = {};
  private minuteMarkers: Record<string, number> = {};
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): ServiceMetrics {
    if (!ServiceMetrics.instance) {
      ServiceMetrics.instance = new ServiceMetrics();
    }
    return ServiceMetrics.instance;
  }
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Report metrics periodically
    setInterval(() => this.reportMetrics(), 10 * 60 * 1000); // Every 10 minutes
  }
  
  /**
   * Record the start of a service method call
   * 
   * @param service Name of the service
   * @param method Name of the method
   * @returns Tracking information to be passed to recordEnd
   */
  public recordStart(service: string, method: string): { startTime: number, key: string } {
    const key = `${service}.${method}`;
    const startTime = Date.now();
    
    // Track call timestamp for throughput calculations
    const currentMinute = Math.floor(startTime / 60000);
    if (!this.callsPerMinute[key]) {
      this.callsPerMinute[key] = [];
      this.minuteMarkers[key] = currentMinute;
    } else if (this.minuteMarkers[key] !== currentMinute) {
      // New minute, shift the array and update the marker
      this.callsPerMinute[key].unshift(0);
      if (this.callsPerMinute[key].length > 10) { // Keep only 10 minutes of history
        this.callsPerMinute[key].pop();
      }
      this.minuteMarkers[key] = currentMinute;
    }
    
    // Increment the current minute's counter
    this.callsPerMinute[key][0] = (this.callsPerMinute[key][0] || 0) + 1;
    
    // Update last call timestamp
    this.lastCallTimestamps[key] = startTime;
    
    return { startTime, key };
  }
  
  /**
   * Record the end of a service method call
   * 
   * @param tracking Tracking information from recordStart
   * @param success Whether the call was successful
   */
  public recordEnd(tracking: { startTime: number, key: string }, success: boolean): void {
    const { startTime, key } = tracking;
    const duration = Date.now() - startTime;
    
    // Initialize counters if needed
    if (!this.callCounts[key]) {
      this.callCounts[key] = 0;
      this.successCounts[key] = 0;
      this.failureCounts[key] = 0;
      this.totalDurations[key] = 0;
      this.maxDurations[key] = 0;
      this.minDurations[key] = { value: 0, hasValue: false };
    }
    
    // Update metrics
    this.callCounts[key]++;
    this.totalDurations[key] += duration;
    
    // Track success/failure
    if (success) {
      this.successCounts[key]++;
    } else {
      this.failureCounts[key]++;
    }
    
    // Update min/max durations
    if (duration > this.maxDurations[key]) {
      this.maxDurations[key] = duration;
    }
    
    if (!this.minDurations[key].hasValue || duration < this.minDurations[key].value) {
      this.minDurations[key] = { value: duration, hasValue: true };
    }
  }
  
  /**
   * Wrapper to track both start and end of a method
   * 
   * @param service Name of the service
   * @param method Name of the method
   * @param fn The function to execute
   * @returns The result of the function
   */
  public async trackAsync<T>(
    service: string, 
    method: string, 
    fn: () => Promise<T>
  ): Promise<T> {
    const tracking = this.recordStart(service, method);
    try {
      const result = await fn();
      this.recordEnd(tracking, true);
      return result;
    } catch (error) {
      this.recordEnd(tracking, false);
      throw error;
    }
  }
  
  /**
   * Synchronous version of trackAsync
   * 
   * @param service Name of the service
   * @param method Name of the method
   * @param fn The function to execute
   * @returns The result of the function
   */
  public track<T>(
    service: string, 
    method: string, 
    fn: () => T
  ): T {
    const tracking = this.recordStart(service, method);
    try {
      const result = fn();
      this.recordEnd(tracking, true);
      return result;
    } catch (error) {
      this.recordEnd(tracking, false);
      throw error;
    }
  }
  
  /**
   * Get the success rate for a specific service method
   * 
   * @param service Name of the service
   * @param method Name of the method
   * @returns Success rate percentage or null if no data
   */
  public getSuccessRate(service: string, method: string): number | null {
    const key = `${service}.${method}`;
    if (!this.callCounts[key] || this.callCounts[key] === 0) {
      return null;
    }
    
    return Math.round((this.successCounts[key] / this.callCounts[key]) * 100);
  }
  
  /**
   * Get the average duration for a specific service method
   * 
   * @param service Name of the service
   * @param method Name of the method
   * @returns Average duration in ms or null if no data
   */
  public getAverageDuration(service: string, method: string): number | null {
    const key = `${service}.${method}`;
    if (!this.callCounts[key] || this.callCounts[key] === 0) {
      return null;
    }
    
    return Math.round(this.totalDurations[key] / this.callCounts[key]);
  }
  
  /**
   * Get the maximum duration for a specific service method
   * 
   * @param service Name of the service
   * @param method Name of the method
   * @returns Maximum duration in ms or null if no data
   */
  public getMaxDuration(service: string, method: string): number | null {
    const key = `${service}.${method}`;
    if (!this.callCounts[key] || this.callCounts[key] === 0) {
      return null;
    }
    
    return this.maxDurations[key];
  }
  
  /**
   * Get the minimum duration for a specific service method
   * 
   * @param service Name of the service
   * @param method Name of the method
   * @returns Minimum duration in ms or null if no data
   */
  public getMinDuration(service: string, method: string): number | null {
    const key = `${service}.${method}`;
    if (!this.callCounts[key] || !this.minDurations[key].hasValue) {
      return null;
    }
    
    return this.minDurations[key].value;
  }
  
  /**
   * Get the calls per minute for a specific service method
   * 
   * @param service Name of the service
   * @param method Name of the method
   * @returns Array of call counts per minute (most recent first) or null if no data
   */
  public getCallsPerMinute(service: string, method: string): number[] | null {
    const key = `${service}.${method}`;
    if (!this.callsPerMinute[key]) {
      return null;
    }
    
    return [...this.callsPerMinute[key]];
  }
  
  /**
   * Get all metrics for a service
   * 
   * @param service Name of the service
   * @returns All metrics for the service
   */
  public getServiceMetrics(service: string): Record<string, any> {
    const metrics: Record<string, any> = {};
    const serviceKeyPrefix = `${service}.`;
    
    // Find all methods for this service
    const methods = Object.keys(this.callCounts)
      .filter(key => key.startsWith(serviceKeyPrefix))
      .map(key => key.substring(serviceKeyPrefix.length));
    
    // Collect metrics for each method
    methods.forEach(method => {
      metrics[method] = {
        calls: this.callCounts[`${service}.${method}`] || 0,
        successRate: this.getSuccessRate(service, method),
        avgDuration: this.getAverageDuration(service, method),
        maxDuration: this.getMaxDuration(service, method),
        minDuration: this.getMinDuration(service, method),
        recentCallsPerMinute: this.getCallsPerMinute(service, method)
      };
    });
    
    return metrics;
  }
  
  /**
   * Get metrics for all services
   * 
   * @returns Metrics for all services
   */
  public getAllMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    // Extract unique service names
    const services = new Set<string>();
    Object.keys(this.callCounts).forEach(key => {
      const serviceName = key.split('.')[0];
      services.add(serviceName);
    });
    
    // Collect metrics for each service
    services.forEach(service => {
      metrics[service] = this.getServiceMetrics(service);
    });
    
    return metrics;
  }
  
  /**
   * Reset all metrics
   */
  public reset(): void {
    this.callCounts = {};
    this.successCounts = {};
    this.failureCounts = {};
    this.totalDurations = {};
    this.maxDurations = {};
    this.minDurations = {};
    this.lastCallTimestamps = {};
    this.callsPerMinute = {};
    this.minuteMarkers = {};
  }
  
  /**
   * Report current metrics to the logger
   */
  private reportMetrics(): void {
    const metrics = this.getAllMetrics();
    const serviceCount = Object.keys(metrics).length;
    
    if (serviceCount === 0) return; // No metrics to report
    
    logger.info('Service Performance Report', { metrics });
  }
}

// Export the singleton instance
export const serviceMetrics = ServiceMetrics.getInstance(); 