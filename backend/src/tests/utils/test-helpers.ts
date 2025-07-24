/**
 * Test helpers for working with TypeORM in tests
 */
import { QueryRunner, EntityManager } from 'typeorm';
import { AppError, ErrorType } from '../../utils/errors';

/**
 * Setup proper transaction mocking for tests
 */
export function setupTransactionMocking() {
  // Reset mocks first
  jest.resetModules();
  
  // Mock logger
  jest.mock('../../utils/logger', () => ({
    __esModule: true,
    default: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    }
  }));

  // Mock performance tracking
  jest.mock('../../utils/performance', () => ({
    SimpleTrack: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor,
    SimplePerformanceTracker: {
      getInstance: () => ({
        trackOperation: jest.fn(),
        logSlowOperationsSummary: jest.fn()
      })
    }
  }));

  // Mock cache metrics
  jest.mock('../../utils/cache-metrics', () => ({
    CacheMetrics: {
      getInstance: () => ({
        trackHit: jest.fn(),
        trackMiss: jest.fn(),
        reportMetrics: jest.fn()
      })
    }
  }));
  
  // Mock for transaction helper
  jest.mock('../../utils/transaction-helper', () => {
    return {
      executeTransaction: jest.fn().mockImplementation(async (callback) => {
        try {
          // Create a complete mock query runner
          const queryRunner = {
            manager: {
              save: jest.fn().mockImplementation((entity, data) => {
                if (Array.isArray(data)) {
                  return Promise.resolve(data.map((item, index) => ({ ...item, id: index + 1 })));
                }
                return Promise.resolve({ ...data, id: 1 });
              }),
              findOne: jest.fn().mockResolvedValue(null),
              find: jest.fn().mockResolvedValue([])
            },
            connect: jest.fn().mockResolvedValue(undefined),
            startTransaction: jest.fn().mockResolvedValue(undefined),
            commitTransaction: jest.fn().mockResolvedValue(undefined),
            rollbackTransaction: jest.fn().mockResolvedValue(undefined),
            release: jest.fn().mockResolvedValue(undefined),
            isTransactionActive: true,
          } as unknown as QueryRunner;
          
          // Execute callback with mock query runner
          const result = await callback(queryRunner);
          return result;
        } catch (error) {
          // Pass through AppErrors
          if (error instanceof AppError) {
            throw error;
          }
          
          // Wrap other errors
          throw new AppError(
            ErrorType.TRANSACTION_ERROR,
            'Mock transaction failed',
            500,
            { originalError: error instanceof Error ? error.message : String(error) }
          );
        }
      }),
      executeTransactionBatch: jest.fn().mockImplementation(async <T>(operations: ((manager: EntityManager) => Promise<T>)[]) => {
        const results: T[] = [];
        
        const mockManager = {
          save: jest.fn().mockImplementation((entity, data) => {
            if (Array.isArray(data)) {
              return Promise.resolve(data.map((item, index) => ({ ...item, id: index + 1 })));
            }
            return Promise.resolve({ ...data, id: 1 });
          }),
          findOne: jest.fn().mockResolvedValue(null),
          find: jest.fn().mockResolvedValue([])
        } as unknown as EntityManager;
        
        for (const operation of operations) {
          const result = await operation(mockManager);
          results.push(result);
        }
        
        return results;
      }),
      isInTransaction: jest.fn().mockReturnValue(true)
    };
  });
  
  // Mock for database
  jest.mock('../../config/database', () => {
    return {
      AppDataSource: {
        isInitialized: true,
        createQueryRunner: jest.fn().mockImplementation(() => ({
          manager: {
            save: jest.fn().mockImplementation((entity, data) => {
              if (Array.isArray(data)) {
                return Promise.resolve(data.map((item, index) => ({ ...item, id: index + 1 })));
              }
              return Promise.resolve({ ...data, id: 1 });
            })
          },
          connect: jest.fn().mockResolvedValue(undefined),
          startTransaction: jest.fn().mockResolvedValue(undefined),
          commitTransaction: jest.fn().mockResolvedValue(undefined),
          rollbackTransaction: jest.fn().mockResolvedValue(undefined),
          release: jest.fn().mockResolvedValue(undefined),
          isTransactionActive: true,
        }))
      }
    };
  });
  
  // Mock cache manager
  jest.mock('../../services/CacheManager', () => {
    return {
      cacheManager: {
        get: jest.fn().mockImplementation(() => null),
        set: jest.fn().mockImplementation(() => Promise.resolve(true)),
        delete: jest.fn().mockImplementation(() => Promise.resolve(true)),
        deleteByPattern: jest.fn().mockImplementation(() => Promise.resolve(true)),
        flush: jest.fn().mockImplementation(() => Promise.resolve(true)),
        stats: jest.fn().mockImplementation(() => ({
          hits: 0,
          misses: 0,
          keys: 0,
          ksize: 0,
          vsize: 0
        }))
      }
    };
  });
} 