/**
 * Mock implementation of transaction helper methods
 */

import { QueryRunner } from 'typeorm';

// Mock implementation of executeTransaction that just executes the callback function
export async function executeTransaction<T>(
  callback: (queryRunner: QueryRunner) => Promise<T>
): Promise<T> {
  // Create a minimal mock QueryRunner with the necessary properties
  const mockQueryRunner = {
    manager: {
      save: jest.fn().mockImplementation((Entity, data) => {
        // For arrays, return the same array with ids set
        if (Array.isArray(data)) {
          return Promise.resolve(data.map((item, index) => ({ ...item, id: index + 1 })));
        }
        // For single entities, return with an id
        return Promise.resolve({ ...data, id: 1 });
      }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      update: jest.fn().mockImplementation((Entity, id, data) => {
        return Promise.resolve({ ...data, id });
      })
    },
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    isTransactionActive: true,
  } as unknown as QueryRunner;

  try {
    // Execute the callback with the mock query runner
    const result = await callback(mockQueryRunner);
    return result;
  } catch (error) {
    // Re-throw the error
    throw error;
  }
}

// Mock implementation of executeTransactionBatch
export async function executeTransactionBatch<T>(
  operations: ((manager: any) => Promise<T>)[]
): Promise<T[]> {
  const results: T[] = [];
  
  // Create a minimal mock EntityManager
  const mockManager = {
    save: jest.fn().mockImplementation((Entity, data) => {
      // For arrays, return the same array with ids set
      if (Array.isArray(data)) {
        return Promise.resolve(data.map((item, index) => ({ ...item, id: index + 1 })));
      }
      // For single entities, return with an id
      return Promise.resolve({ ...data, id: 1 });
    }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    update: jest.fn().mockImplementation((Entity, id, data) => {
      return Promise.resolve({ ...data, id });
    }),
    findOne: jest.fn().mockImplementation(() => Promise.resolve(null)),
    find: jest.fn().mockImplementation(() => Promise.resolve([])),
    queryRunner: { isTransactionActive: true }
  };
  
  for (const operation of operations) {
    const result = await operation(mockManager);
    results.push(result);
  }
  
  return results;
}

// Mock implementation of isInTransaction
export function isInTransaction(manager: any): boolean {
  return true;
} 