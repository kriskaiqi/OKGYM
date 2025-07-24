import { DeleteResult, FindManyOptions, FindOneOptions } from 'typeorm';

/**
 * Generic base repository interface that defines common operations for all repositories
 */
export interface BaseRepository<T> {
    /**
     * Find entity by ID
     */
    findById(id: string | number): Promise<T | null>;
    
    /**
     * Find multiple entities by their IDs
     */
    findByIds(ids: (string | number)[]): Promise<T[]>;
    
    /**
     * Find all entities that match the given options
     */
    find(options?: FindManyOptions<T>): Promise<T[]>;
    
    /**
     * Find one entity that matches the given options
     */
    findOne(options: FindOneOptions<T>): Promise<T | null>;
    
    /**
     * Count entities that match the given options
     */
    count(options?: FindManyOptions<T>): Promise<number>;
    
    /**
     * Create a new entity
     */
    create(data: Partial<T>): Promise<T>;
    
    /**
     * Update an existing entity
     */
    update(id: string | number, data: Partial<T>): Promise<T | null>;
    
    /**
     * Delete an entity by ID
     */
    delete(id: string | number): Promise<DeleteResult>;
    
    /**
     * Save an entity instance or array of entities (create or update)
     */
    save(entity: T | T[]): Promise<T | T[]>;
} 