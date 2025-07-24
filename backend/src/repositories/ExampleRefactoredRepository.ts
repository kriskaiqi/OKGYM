import { FindManyOptions } from 'typeorm';
import { GenericRepository } from './GenericRepository';
import { 
  createQueryOptions, 
  addWhereCondition, 
  createRawQuery, 
  addOrderBy, 
  createWhereCondition 
} from '../utils/typeorm-helpers';

// Example entity and filters interface
interface ExampleEntity {
  id: string;
  name: string;
  description: string;
  category: string;
  active: boolean;
}

interface ExampleFilters {
  category?: string;
  searchTerm?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

/**
 * Example repository showing how to use the helper functions
 * to fix TypeORM type issues
 */
export class ExampleRefactoredRepository extends GenericRepository<ExampleEntity> {
  
  /**
   * Find entities with filters - using the helper functions
   */
  async findWithFilters(filters: ExampleFilters): Promise<[ExampleEntity[], number]> {
    // Create a properly typed query object
    const query = createQueryOptions<ExampleEntity>({
      take: filters.limit || 20,
      skip: filters.offset || 0,
    });
    
    // Apply filters using helpers
    if (filters.category) {
      addWhereCondition(query, 'category', filters.category);
    }
    
    if (filters.isActive !== undefined) {
      addWhereCondition(query, 'active', filters.isActive);
    }
    
    // Apply search term
    if (filters.searchTerm) {
      // Using Raw query helper
      addWhereCondition(
        query, 
        'name', 
        createRawQuery(alias => `${alias} ILIKE :searchTerm`, { 
          searchTerm: `%${filters.searchTerm}%` 
        })
      );
    }
    
    // Apply sorting
    if (filters.sortBy) {
      const validSortFields = ['name', 'category', 'createdAt'];
      const direction = filters.sortDirection || 'ASC';
      
      if (validSortFields.includes(filters.sortBy)) {
        addOrderBy(query, filters.sortBy, direction);
      } else {
        // Default sort
        addOrderBy(query, 'name', 'ASC');
      }
    } else {
      // Default sort
      addOrderBy(query, 'name', 'ASC');
    }
    
    // Execute query
    const result = await this.repository.findAndCount(query);
    return result;
  }
  
  /**
   * Find entity by ID using helper
   */
  async findEntityById(id: string): Promise<ExampleEntity | null> {
    const entity = await this.repository.findOne({
      where: createWhereCondition<ExampleEntity>({ id })
    });
    
    return entity;
  }
  
  /**
   * Find entities by category using helper
   */
  async findByCategory(category: string): Promise<ExampleEntity[]> {
    const entities = await this.repository.find({
      where: createWhereCondition<ExampleEntity>({ category })
    });
    
    return entities;
  }
} 