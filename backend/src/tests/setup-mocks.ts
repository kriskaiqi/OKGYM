/**
 * Setup mocks for unit tests
 */

// Mock TypeORM initialization to avoid entity metadata errors
jest.mock('typeorm', () => {
  const originalModule = jest.requireActual('typeorm');
  
  // Create a simple mock for the DataSource class
  class MockDataSource {
    options: any;
    
    constructor(options: any) {
      this.options = options;
    }
    
    async initialize() {
      return this; // Return self to allow chaining
    }
    
    getRepository() {
      return {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };
    }
  }
  
  return {
    ...originalModule,
    DataSource: MockDataSource,
  };
});

// Mock the transaction helper
jest.mock('../utils/transaction-helper', () => {
  return require('./__mocks__/transaction-helper');
});

// Mock the database configuration
jest.mock('../config/database', () => {
  return require('./__mocks__/database');
});

// Mock the CacheManager
jest.mock('../services/CacheManager', () => {
  return {
    cacheManager: {
      get: jest.fn().mockImplementation(() => null),
      set: jest.fn().mockImplementation(() => Promise.resolve(true)),
      delete: jest.fn().mockImplementation(() => Promise.resolve(true)),
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

// Mock the logger
jest.mock('../utils/logger', () => {
  return {
    __esModule: true,
    default: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    }
  };
});

// Mock performance tracking
jest.mock('../utils/performance', () => {
  return {
    __esModule: true,
    SimpleTrack: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor,
    trackExecution: jest.fn().mockImplementation((name, fn) => fn()),
    recordMetric: jest.fn(),
  };
}); 