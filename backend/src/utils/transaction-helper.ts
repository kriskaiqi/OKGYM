import { QueryRunner, EntityManager } from 'typeorm';
import { AppDataSource } from '../data-source';
import { AppError, ErrorType } from './errors';
import logger from './logger';

/**
 * Execute a function within a database transaction
 * 
 * @param callback Function to execute within transaction
 * @returns Result of the callback function
 * @throws {AppError} If transaction fails
 */
export async function executeTransaction<T>(
  callback: (queryRunner: QueryRunner) => Promise<T>
): Promise<T> {
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    // Start transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    // Execute callback with query runner
    const result = await callback(queryRunner);
    
    // Commit transaction
    await queryRunner.commitTransaction();
    
    return result;
  } catch (error) {
    // Rollback transaction on error
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    
    logger.error('Transaction failed', { 
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Rethrow as AppError
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(
      ErrorType.TRANSACTION_ERROR, 
      'Transaction failed', 
      500, 
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  } finally {
    // Release query runner
    await queryRunner.release();
  }
}

/**
 * Execute a batch of operations within a transaction
 * 
 * @param operations Array of functions to execute within transaction
 * @returns Array of results from operations
 * @throws {AppError} If transaction fails
 */
export async function executeTransactionBatch<T>(
  operations: ((manager: EntityManager) => Promise<T>)[]
): Promise<T[]> {
  return executeTransaction(async (queryRunner) => {
    const results: T[] = [];
    const manager = queryRunner.manager;
    
    for (const operation of operations) {
      const result = await operation(manager);
      results.push(result);
    }
    
    return results;
  });
}

/**
 * Check if a function is running within an active transaction
 * 
 * @param manager EntityManager instance
 * @returns True if running within transaction
 */
export function isInTransaction(manager: EntityManager): boolean {
  return manager.queryRunner?.isTransactionActive || false;
} 