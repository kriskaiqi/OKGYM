import { FindManyOptions, In, IsNull, Like } from 'typeorm';
import { ExerciseCategory, CategoryType } from '../models/ExerciseCategory';
import { GenericRepository } from './GenericRepository';
import logger from '../utils/logger';
import { cacheManager } from '../services/CacheManager';
import { config } from '../config';
import { createQueryOptions, addWhereCondition, addOrderBy } from '../utils/typeorm-helpers';

/**
 * Filter options for querying exercise categories
 */
export interface ExerciseCategoryFilters {
    // Basic properties
    type?: CategoryType;
    isActive?: boolean;
    parentId?: number | null;
    
    // Search
    searchTerm?: string;
    
    // Related entities
    hasExercises?: boolean;
    
    // Relations to include
    includeExercises?: boolean;
    includeChildCategories?: boolean;
    includeEquipment?: boolean;
    includeWorkouts?: boolean;
    includePrograms?: boolean;
    
    // Pagination
    limit?: number;
    offset?: number;
    
    // Sorting
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Cache key generation for ExerciseCategory repository
 */
class ExerciseCategoryCacheKeys {
    /**
     * Generate cache key for findWithFilters method
     */
    static forFilters(filters: ExerciseCategoryFilters): string {
        const keyParts = ['category:filters'];
        
        // Add filter properties to key
        if (filters.type) keyParts.push(`type:${filters.type}`);
        if (filters.isActive !== undefined) keyParts.push(`active:${filters.isActive}`);
        if (filters.parentId === null) keyParts.push('parent:null');
        else if (filters.parentId !== undefined) keyParts.push(`parent:${filters.parentId}`);
        if (filters.searchTerm) keyParts.push(`search:${filters.searchTerm}`);
        if (filters.hasExercises !== undefined) keyParts.push(`hasExer:${filters.hasExercises}`);
        if (filters.limit) keyParts.push(`limit:${filters.limit}`);
        if (filters.offset) keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy) keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        
        // Add relation inclusion flags
        if (filters.includeExercises) keyParts.push('incl:exercises');
        if (filters.includeChildCategories) keyParts.push('incl:children');
        if (filters.includeEquipment) keyParts.push('incl:equipment');
        if (filters.includeWorkouts) keyParts.push('incl:workouts');
        if (filters.includePrograms) keyParts.push('incl:programs');
        
        return keyParts.join(':');
    }
    
    /**
     * Generate cache key for a single category
     */
    static forCategory(id: number, relations: string[] = []): string {
        if (relations.length === 0) return `category:${id}`;
        return `category:${id}:${relations.sort().join('-')}`;
    }
    
    /**
     * Generate cache key for top level categories
     */
    static forTopLevel(): string {
        return 'category:top-level';
    }
    
    /**
     * Generate cache key for categories by type
     */
    static forType(type: CategoryType): string {
        return `category:type:${type}`;
    }
    
    /**
     * Generate cache key for child categories
     */
    static forChildren(parentId: number): string {
        return `category:children:${parentId}`;
    }
    
    /**
     * Generate cache key for categories with exercises
     */
    static forWithExercises(limit: number): string {
        return `category:with-exercises:${limit}`;
    }
    
    /**
     * Generate cache key for category hierarchy
     */
    static forHierarchy(): string {
        return 'category:hierarchy';
    }
}

/**
 * Specialized repository for ExerciseCategory entity
 */
export class ExerciseCategoryRepository extends GenericRepository<ExerciseCategory> {
    private cacheTTL: number;
    
    constructor() {
        super(ExerciseCategory);
        this.cacheTTL = config.cache?.ttl?.exercise || 3600; // Use exercise TTL or default to 1 hour
    }

    /**
     * Find categories with detailed filtering options
     */
    async findWithFilters(filters: ExerciseCategoryFilters): Promise<[ExerciseCategory[], number]> {
        // Generate cache key based on filters
        const cacheKey = ExerciseCategoryCacheKeys.forFilters(filters);
        
        // Try to get from cache first
        const cached = await cacheManager.get<[ExerciseCategory[], number]>(cacheKey);
        if (cached) {
            logger.debug(`Returning cached categories for filters`, { filters });
            return cached;
        }
        
        try {
            // Create base query with helper function
            const query = createQueryOptions<ExerciseCategory>({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });

            // Apply filtering conditions using type-safe helpers
            if (filters.type) {
                addWhereCondition(query, "type", filters.type);
            }
            
            if (filters.isActive !== undefined) {
                addWhereCondition(query, "isActive", filters.isActive);
            }
            
            // Handle parent ID filter (including NULL case)
            if (filters.parentId === null) {
                addWhereCondition(query, "parentId", IsNull());
            } else if (filters.parentId !== undefined) {
                addWhereCondition(query, "parentId", filters.parentId);
            }
            
            // Apply search term to name and description
            if (filters.searchTerm) {
                addWhereCondition(query, "name", Like(`%${filters.searchTerm}%`));
            }
            
            // Apply sorting
            if (filters.sortBy) {
                addOrderBy(query, filters.sortBy, filters.sortDirection || 'ASC');
            } else {
                // Default sort by displayOrder, then name
                addOrderBy(query, "displayOrder", "ASC");
                addOrderBy(query, "name", "ASC");
            }
            
            // Execute query
            const [categories, total] = await this.repository.findAndCount(query);
            
            // If requested, load child categories for a hierarchical structure
            if (filters.includeChildCategories && categories.length > 0) {
                // Get all parent IDs from the result set
                const parentIds = categories.map(category => category.id);
                
                // Find all children for these parents
                const childCategories = await this.findChildrenForParents(parentIds);
                
                // Associate children with their parents
                categories.forEach(category => {
                    category.childCategories = childCategories.filter(
                        child => child.parentId === category.id
                    );
                });
            }
            
            // Cache results
            await cacheManager.set(cacheKey, [categories, total], { ttl: this.cacheTTL });
            
            return [categories, total];
        } catch (error) {
            logger.error(`Error finding categories with filters: ${error.message}`, { 
                error, 
                filters: JSON.stringify(filters) 
            });
            throw error;
        }
    }

    /**
     * Override findById to implement caching
     */
    async findById(id: number, relations: string[] = []): Promise<ExerciseCategory | null> {
        // Generate cache key
        const cacheKey = ExerciseCategoryCacheKeys.forCategory(id, relations);
        
        // Try to get from cache first
        const cached = await cacheManager.get<ExerciseCategory>(cacheKey);
        if (cached) {
            logger.debug('Category detail served from cache', { id });
            return cached;
        }
        
        // Not in cache, fetch from database
        const start = Date.now();
        
        const category = await this.repository.findOne({
            where: { id },
            relations
        });
        
        // Log slow queries
        const duration = Date.now() - start;
        if (duration > 100) {
            logger.warn(`Slow query detected in ExerciseCategoryRepository.findById: ${duration}ms`, { id, duration });
        }
        
        // Cache the category
        if (category) {
            await cacheManager.set(cacheKey, category, { ttl: this.cacheTTL });
        }
        
        return category;
    }

    /**
     * Find all top-level categories (those without a parent)
     */
    async findTopLevelCategories(): Promise<ExerciseCategory[]> {
        // Generate cache key
        const cacheKey = ExerciseCategoryCacheKeys.forTopLevel();
        
        // Try to get from cache first
        const cached = await cacheManager.get<ExerciseCategory[]>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const categories = await this.repository.find({
            where: { 
                parentId: IsNull(),
                isActive: true
            },
            order: { 
                displayOrder: 'ASC',
                name: 'ASC'
            }
        });
        
        // Cache the result
        await cacheManager.set(cacheKey, categories, { ttl: this.cacheTTL });
        
        return categories;
    }

    /**
     * Find categories by type
     */
    async findByType(type: CategoryType): Promise<ExerciseCategory[]> {
        // Generate cache key
        const cacheKey = ExerciseCategoryCacheKeys.forType(type);
        
        // Try to get from cache first
        const cached = await cacheManager.get<ExerciseCategory[]>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const categories = await this.repository.find({
            where: { 
                type,
                isActive: true
            },
            order: { 
                displayOrder: 'ASC',
                name: 'ASC'
            }
        });
        
        // Cache the result
        await cacheManager.set(cacheKey, categories, { ttl: this.cacheTTL });
        
        return categories;
    }

    /**
     * Find child categories for a parent category
     */
    async findChildCategories(parentId: number): Promise<ExerciseCategory[]> {
        // Generate cache key
        const cacheKey = ExerciseCategoryCacheKeys.forChildren(parentId);
        
        // Try to get from cache first
        const cached = await cacheManager.get<ExerciseCategory[]>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const categories = await this.repository.find({
            where: { 
                parentId,
                isActive: true
            },
            order: { 
                displayOrder: 'ASC',
                name: 'ASC'
            }
        });
        
        // Cache the result
        await cacheManager.set(cacheKey, categories, { ttl: this.cacheTTL });
        
        return categories;
    }

    /**
     * Find categories with exercises
     */
    async findWithExercises(limit: number = 20): Promise<ExerciseCategory[]> {
        // Generate cache key
        const cacheKey = ExerciseCategoryCacheKeys.forWithExercises(limit);
        
        // Try to get from cache first
        const cached = await cacheManager.get<ExerciseCategory[]>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const categories = await this.repository.find({
            relations: ['exercises'],
            where: { isActive: true },
            order: { displayOrder: 'ASC' },
            take: limit
        });

        // Filter out categories with no exercises
        const filteredCategories = categories.filter(category => 
            category.exercises && category.exercises.length > 0
        );
        
        // Cache the result
        await cacheManager.set(cacheKey, filteredCategories, { ttl: this.cacheTTL });
        
        return filteredCategories;
    }

    /**
     * Find categories by IDs
     */
    async findByIds(ids: number[]): Promise<ExerciseCategory[]> {
        if (!ids.length) return [];
        
        const cacheKey = `category:ids:${ids.sort().join(',')}`;
        
        // Try to get from cache first
        const cached = await cacheManager.get<ExerciseCategory[]>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const categories = await this.repository.find({
            where: { 
                id: In(ids),
                isActive: true
            }
        });
        
        // Cache the result
        await cacheManager.set(cacheKey, categories, { ttl: this.cacheTTL });
        
        return categories;
    }

    /**
     * Get full category hierarchy
     */
    async getHierarchy(): Promise<ExerciseCategory[]> {
        // Generate cache key
        const cacheKey = ExerciseCategoryCacheKeys.forHierarchy();
        
        // Try to get from cache first
        const cached = await cacheManager.get<ExerciseCategory[]>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const start = Date.now();
        
        // First get all top-level categories
        const topLevel = await this.findTopLevelCategories();
        
        // For each top-level category, get its children
        for (const category of topLevel) {
            category.childCategories = await this.findChildCategories(category.id);
        }
        
        // Log slow queries
        const duration = Date.now() - start;
        if (duration > 200) {
            logger.warn(`Slow query detected in ExerciseCategoryRepository.getHierarchy: ${duration}ms`, { 
                duration,
                topLevelCount: topLevel.length
            });
        }
        
        // Cache the result
        await cacheManager.set(cacheKey, topLevel, { ttl: this.cacheTTL });
        
        return topLevel;
    }

    /**
     * Get category with all related exercises
     */
    async getCategoryWithExercises(categoryId: number): Promise<ExerciseCategory | null> {
        const relations = ['exercises', 'exercises.equipmentOptions', 'childCategories'];
        
        // Generate cache key
        const cacheKey = ExerciseCategoryCacheKeys.forCategory(categoryId, relations);
        
        // Try to get from cache first
        const cached = await cacheManager.get<ExerciseCategory>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const category = await this.repository.findOne({
            where: { id: categoryId },
            relations
        });
        
        // Cache the result
        if (category) {
            await cacheManager.set(cacheKey, category, { ttl: this.cacheTTL });
        }
        
        return category;
    }
    
    /**
     * Override create method to invalidate caches
     */
    async create(data: Partial<ExerciseCategory>): Promise<ExerciseCategory> {
        const category = await super.create(data);
        await this.invalidateCategoryCaches();
        return category;
    }

    /**
     * Override update method to invalidate caches
     */
    async update(id: number, data: Partial<ExerciseCategory>): Promise<ExerciseCategory | null> {
        const category = await super.update(id, data);
        if (category) {
            await this.invalidateCategoryCache(id);
            await this.invalidateCategoryCaches();
        }
        return category;
    }

    /**
     * Override delete method to invalidate caches
     */
    async delete(id: number): Promise<any> {
        const result = await super.delete(id);
        await this.invalidateCategoryCache(id);
        await this.invalidateCategoryCaches();
        return result;
    }

    /**
     * Invalidate cache for a specific category
     */
    private async invalidateCategoryCache(id: number): Promise<void> {
        await cacheManager.deleteByPattern(`category:${id}*`);
        logger.debug(`Invalidated cache for category: ${id}`);
    }

    /**
     * Invalidate list caches
     */
    private async invalidateCategoryCaches(): Promise<void> {
        await cacheManager.deleteByPattern('category:filters*');
        await cacheManager.deleteByPattern('category:top-level*');
        await cacheManager.deleteByPattern('category:type*');
        await cacheManager.deleteByPattern('category:children*');
        await cacheManager.deleteByPattern('category:with-exercises*');
        await cacheManager.deleteByPattern('category:hierarchy*');
        await cacheManager.deleteByPattern('category:ids*');
        logger.debug('Invalidated category list caches');
    }
    
    /**
     * Helper method to determine which relations to load based on filter needs
     */
    private getRequiredRelations(filters: ExerciseCategoryFilters): string[] {
        const relations: string[] = [];
        
        // Only include relationships needed for filtering and display
        if (filters.includeExercises || filters.hasExercises) {
            relations.push('exercises');
        }
        
        if (filters.includeChildCategories) {
            relations.push('childCategories');
        }
        
        if (filters.includeEquipment) {
            relations.push('equipment');
        }
        
        if (filters.includeWorkouts) {
            relations.push('workouts');
        }
        
        if (filters.includePrograms) {
            relations.push('programs');
        }
        
        return relations;
    }
    
    /**
     * Helper to apply sorting
     */
    private applySorting(query: FindManyOptions<ExerciseCategory>, filters: ExerciseCategoryFilters): void {
        if (filters.sortBy) {
            const validSortFields = ['name', 'displayOrder', 'type', 'createdAt'];
            const direction = filters.sortDirection || 'ASC';
            
            if (validSortFields.includes(filters.sortBy)) {
                query.order = { [filters.sortBy]: direction };
            }
        } else {
            // Default sorting by displayOrder and name
            query.order = { 
                displayOrder: 'ASC',
                name: 'ASC'
            };
        }
    }

    /**
     * Helper method to find child categories for multiple parents at once
     */
    private async findChildrenForParents(parentIds: number[]): Promise<ExerciseCategory[]> {
        if (!parentIds.length) return [];
        
        try {
            const query = createQueryOptions<ExerciseCategory>();
            addWhereCondition(query, "parentId", In(parentIds));
            addWhereCondition(query, "isActive", true);
            addOrderBy(query, "displayOrder", "ASC");
            
            return await this.repository.find(query);
        } catch (error) {
            logger.error(`Error finding children for parents: ${error.message}`, { parentIds });
            return [];
        }
    }
} 