/**
 * This utility patches the WorkoutPlanService to make it more testable
 * by fixing issues with logger, performance tracking, and other dependencies.
 */

// Override the logger
import logger from '../../utils/logger';
if (typeof logger.info !== 'function') {
  logger.info = jest.fn();
}
if (typeof logger.error !== 'function') {
  logger.error = jest.fn();
}
if (typeof logger.warn !== 'function') {
  logger.warn = jest.fn();
}
if (typeof logger.debug !== 'function') {
  logger.debug = jest.fn();
}

// Override the performance tracking
import * as performance from '../../utils/performance';
if (!performance.SimpleTrack) {
  (performance as any).SimpleTrack = function(options: any = {}) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      return descriptor;
    };
  };
}

// Override the cache manager
import { cacheManager } from '../../services/CacheManager';
if (!cacheManager.get || typeof cacheManager.get !== 'function') {
  (cacheManager as any).get = jest.fn().mockResolvedValue(null);
  (cacheManager as any).set = jest.fn().mockResolvedValue(undefined);
  (cacheManager as any).delete = jest.fn().mockResolvedValue(undefined);
  (cacheManager as any).deleteByPattern = jest.fn().mockResolvedValue(undefined);
}

// Override the transaction helper
import * as transactionHelper from '../../utils/transaction-helper';
if (!transactionHelper.executeTransaction || typeof transactionHelper.executeTransaction !== 'function') {
  (transactionHelper as any).executeTransaction = jest.fn(async (callback: Function) => {
    return await callback({
      manager: {
        save: jest.fn().mockResolvedValue([])
      }
    });
  });
} else {
  const originalExecuteTransaction = transactionHelper.executeTransaction;
  (transactionHelper as any).executeTransaction = jest.fn(async (callback: Function) => {
    try {
      return await callback({
        manager: {
          save: jest.fn().mockResolvedValue([])
        }
      });
    } catch (error) {
      console.error("Mock transaction failed", error);
      throw error;
    }
  });
}

// Now import and patch the WorkoutPlanService
import { WorkoutPlanService } from '../../services/WorkoutPlanService';

// Add a helper method to patch the handleError method
export function patchWorkoutPlanService(service: WorkoutPlanService): WorkoutPlanService {
  (service as any).handleError = jest.fn().mockImplementation((error: any, message: string) => {
    console.error(`Error handled: ${message}`, error);
    return null;
  });
  
  return service;
} 