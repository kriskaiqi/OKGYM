import { repositories } from '../../repositories';
import { AppError, ErrorType } from '../../utils/errors';
import logger from '../../utils/logger';
import { executeTransaction } from '../../utils/transaction-helper';
import { BaseService } from '../interfaces/BaseService';

/**
 * Template for entity service implementation
 * Replace EntityName with the actual entity name
 * Replace CreateDto, UpdateDto, and FilterDto with actual DTOs
 */
export class EntityNameService implements BaseService<EntityName, CreateDto, UpdateDto, FilterDto> {
  /**
   * Get entities with filtering
   * 
   * @param filters Filter criteria
   * @returns Array of entities and total count
   */
  async getAll(filters?: FilterDto): Promise<[EntityName[], number]> {
    try {
      // Use the repository's findWithFilters method if available
      return await repositories.entityName.findWithFilters(filters || {});
    } catch (error) {
      logger.error('Failed to fetch entities', { error, filters });
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to fetch entities',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }
  
  /**
   * Get entity by ID
   * 
   * @param id Entity ID
   * @param relations Optional relations to include
   * @returns Entity or throws NOT_FOUND error
   */
  async getById(id: string | number, relations: string[] = []): Promise<EntityName> {
    try {
      const entity = await repositories.entityName.findById(id, relations);
      
      if (!entity) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `Entity with ID ${id} not found`,
          404
        );
      }
      
      return entity;
    } catch (error) {
      // Rethrow AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to fetch entity by ID', { error, id });
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to fetch entity',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }
  
  /**
   * Create new entity
   * 
   * @param data Entity creation data
   * @returns Created entity
   */
  async create(data: CreateDto): Promise<EntityName> {
    try {
      // Validate input data
      this.validateEntityData(data);
      
      // Create entity
      const entity = await repositories.entityName.create(data as any);
      
      logger.info('Entity created', { 
        entityId: entity.id, 
        entityType: 'EntityName' 
      });
      
      return entity;
    } catch (error) {
      // Rethrow AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to create entity', { error, data });
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to create entity',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }
  
  /**
   * Update entity
   * 
   * @param id Entity ID
   * @param data Entity update data
   * @returns Updated entity
   */
  async update(id: string | number, data: UpdateDto): Promise<EntityName> {
    try {
      // Check if entity exists
      await this.getById(id);
      
      // Validate update data
      this.validateEntityData(data, true);
      
      // Update entity
      const updated = await repositories.entityName.update(id, data as any);
      
      if (!updated) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          `Entity with ID ${id} not found`,
          404
        );
      }
      
      logger.info('Entity updated', { 
        entityId: id, 
        entityType: 'EntityName',
        fields: Object.keys(data)
      });
      
      return updated;
    } catch (error) {
      // Rethrow AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to update entity', { error, id, data });
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to update entity',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }
  
  /**
   * Delete entity
   * 
   * @param id Entity ID
   * @returns True if deleted successfully
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      // Check if entity exists
      await this.getById(id);
      
      // Check if can be deleted (business rules)
      await this.canDelete(id);
      
      // Delete entity
      const result = await repositories.entityName.delete(id);
      
      logger.info('Entity deleted', { 
        entityId: id, 
        entityType: 'EntityName' 
      });
      
      return result.affected > 0;
    } catch (error) {
      // Rethrow AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to delete entity', { error, id });
      throw new AppError(
        ErrorType.DATABASE_ERROR,
        'Failed to delete entity',
        500,
        error instanceof Error ? { message: error.message } : undefined
      );
    }
  }
  
  /**
   * Example of a domain-specific method
   * This could perform a complex business operation
   */
  async performComplexOperation(id: string | number, operationData: any): Promise<any> {
    return executeTransaction(async (queryRunner) => {
      try {
        // Get entity
        const entity = await this.getById(id);
        
        // Perform complex operation that might involve multiple repositories
        // This will be wrapped in a transaction
        
        logger.info('Complex operation completed', { 
          entityId: id, 
          operation: 'performComplexOperation' 
        });
        
        return result;
      } catch (error) {
        // Rethrow AppError instances
        if (error instanceof AppError) {
          throw error;
        }
        
        logger.error('Failed to perform complex operation', { error, id, operationData });
        throw new AppError(
          ErrorType.OPERATION_FAILED,
          'Failed to perform operation',
          500,
          error instanceof Error ? { message: error.message } : undefined
        );
      }
    });
  }
  
  /**
   * Validate entity data before create/update
   * This is a private helper method
   * 
   * @param data Entity data to validate
   * @param isUpdate Whether this is an update operation
   */
  private validateEntityData(data: Partial<CreateDto | UpdateDto>, isUpdate: boolean = false): void {
    // Implement validation logic
    // Throw AppError with VALIDATION_ERROR type if validation fails
  }
  
  /**
   * Check if entity can be deleted based on business rules
   * This is a private helper method
   * 
   * @param id Entity ID
   * @returns True if entity can be deleted
   */
  private async canDelete(id: string | number): Promise<boolean> {
    // Implement business logic to check if entity can be deleted
    // For example, check if it has related entities that would be orphaned
    // Throw AppError if deletion is not allowed
    return true;
  }
} 