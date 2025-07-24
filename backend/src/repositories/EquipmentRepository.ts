import { FindManyOptions, FindOptionsWhere, In, Like, Raw } from 'typeorm';
import { Equipment } from '../models/Equipment';
import { EquipmentCategory, Difficulty, CostTier, SpaceRequirement } from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import logger from '../utils/logger';
import { cacheManager } from '../services/CacheManager';
import { config } from '../config';
import { createQueryOptions, addWhereCondition, addOrderBy, createRawQuery } from '../utils/typeorm-helpers';

/**
 * Filter options for querying equipment
 */
export interface EquipmentFilters {
    // Basic properties
    category?: EquipmentCategory;
    difficulty?: Difficulty;
    costTier?: CostTier;
    spaceRequired?: SpaceRequirement;
    
    // Related entities
    muscleGroupIds?: string[];
    trainingTypeIds?: string[];
    exerciseIds?: string[];
    
    // Search
    searchTerm?: string;
    priceRange?: { min?: number; max?: number };
    manufacturer?: string;
    
    // Relations to include
    includeExercises?: boolean;
    includeMuscleGroups?: boolean;
    includeTrainingTypes?: boolean;
    includeWorkouts?: boolean;
    includePrograms?: boolean;
    includeMedia?: boolean;
    
    // Pagination
    limit?: number;
    offset?: number;
    
    // Sorting
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Cache key generation for Equipment repository
 */
class EquipmentCacheKeys {
    /**
     * Generate cache key for findWithFilters method
     */
    static forFilters(filters: EquipmentFilters): string {
        const keyParts = ['equipment:filters'];
        
        // Add filter properties to key
        if (filters.category) keyParts.push(`cat:${filters.category}`);
        if (filters.difficulty) keyParts.push(`diff:${filters.difficulty}`);
        if (filters.costTier) keyParts.push(`cost:${filters.costTier}`);
        if (filters.spaceRequired) keyParts.push(`space:${filters.spaceRequired}`);
        if (filters.searchTerm) keyParts.push(`search:${filters.searchTerm}`);
        if (filters.manufacturer) keyParts.push(`mfr:${filters.manufacturer}`);
        if (filters.limit) keyParts.push(`limit:${filters.limit}`);
        if (filters.offset) keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy) keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        
        // Add price range
        if (filters.priceRange?.min !== undefined) keyParts.push(`pmin:${filters.priceRange.min}`);
        if (filters.priceRange?.max !== undefined) keyParts.push(`pmax:${filters.priceRange.max}`);
        
        // Add array properties
        if (filters.muscleGroupIds?.length) keyParts.push(`musc:${filters.muscleGroupIds.sort().join(',')}`);
        if (filters.trainingTypeIds?.length) keyParts.push(`train:${filters.trainingTypeIds.sort().join(',')}`);
        if (filters.exerciseIds?.length) keyParts.push(`exer:${filters.exerciseIds.sort().join(',')}`);
        
        // Add relation inclusion flags
        if (filters.includeExercises) keyParts.push('incl:exercises');
        if (filters.includeMuscleGroups) keyParts.push('incl:muscleGroups');
        if (filters.includeTrainingTypes) keyParts.push('incl:trainingTypes');
        if (filters.includeWorkouts) keyParts.push('incl:workouts');
        if (filters.includePrograms) keyParts.push('incl:programs');
        if (filters.includeMedia) keyParts.push('incl:media');
        
        return keyParts.join(':');
    }
    
    /**
     * Generate cache key for a single equipment
     */
    static forEquipment(id: string, relations: string[] = []): string {
        if (relations.length === 0) return `equipment:${id}`;
        return `equipment:${id}:${relations.sort().join('-')}`;
    }
    
    /**
     * Generate cache key for popular equipment
     */
    static forPopular(limit: number): string {
        return `equipment:popular:${limit}`;
    }
    
    /**
     * Generate cache key for equipment by category
     */
    static forCategory(category: EquipmentCategory): string {
        return `equipment:category:${category}`;
    }
}

/**
 * Specialized repository for Equipment entity
 */
export class EquipmentRepository extends GenericRepository<Equipment> {
    private cacheTTL: number;
    
    constructor() {
        super(Equipment);
        this.cacheTTL = config.cache?.ttl?.exercise || 3600; // Use exercise TTL or default to 1 hour
    }

    /**
     * Find equipment with detailed filtering options
     */
    async findWithFilters(filters: EquipmentFilters): Promise<[Equipment[], number]> {
        // Generate cache key based on filters
        const cacheKey = EquipmentCacheKeys.forFilters(filters);
        
        // Try to get from cache first
        const cached = await cacheManager.get<[Equipment[], number]>(cacheKey);
        if (cached) {
            logger.debug(`Returning cached equipment for filters`, { filters });
            return cached;
        }
        
        try {
            // Create base query with helper function
            const query = createQueryOptions<Equipment>({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });

            // Apply filtering conditions using type-safe helpers
            if (filters.category) {
                addWhereCondition(query, "category", filters.category);
            }
            
            if (filters.difficulty) {
                addWhereCondition(query, "difficulty", filters.difficulty);
            }
            
            if (filters.costTier) {
                addWhereCondition(query, "costTier", filters.costTier);
            }
            
            if (filters.spaceRequired) {
                addWhereCondition(query, "spaceRequired", filters.spaceRequired);
            }
            
            if (filters.manufacturer) {
                addWhereCondition(query, "manufacturer", Like(`%${filters.manufacturer}%`));
            }
            
            // Apply search term to name and description
            if (filters.searchTerm) {
                addWhereCondition(query, "name", createRawQuery(
                    alias => `LOWER(${alias}) LIKE LOWER(:term)`,
                    { term: `%${filters.searchTerm}%` }
                ));
            }
            
            // Handle price range filtering
            if (filters.priceRange?.min !== undefined) {
                addWhereCondition(query, "averagePrice", createRawQuery(
                    alias => `${alias} >= :minPrice`,
                    { minPrice: filters.priceRange.min }
                ));
            }
            
            if (filters.priceRange?.max !== undefined) {
                addWhereCondition(query, "averagePrice", createRawQuery(
                    alias => `${alias} <= :maxPrice`,
                    { maxPrice: filters.priceRange.max }
                ));
            }
            
            // Handle related entity filtering (muscleGroups, trainingTypes, exercises)
            if (filters.muscleGroupIds?.length) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT e.id FROM equipment e
                        JOIN equipment_muscle_groups emg ON e.id = emg.equipment_id
                        WHERE emg.category_id IN (:...muscleGroupIds)
                    )`,
                    { muscleGroupIds: filters.muscleGroupIds }
                ));
            }
            
            if (filters.trainingTypeIds?.length) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT e.id FROM equipment e
                        JOIN equipment_training_types ett ON e.id = ett.equipment_id
                        WHERE ett.tag_id IN (:...trainingTypeIds)
                    )`,
                    { trainingTypeIds: filters.trainingTypeIds }
                ));
            }
            
            if (filters.exerciseIds?.length) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT e.id FROM equipment e
                        JOIN exercise_equipment ee ON e.id = ee.equipment_id
                        WHERE ee.exercise_id IN (:...exerciseIds)
                    )`,
                    { exerciseIds: filters.exerciseIds }
                ));
            }
            
            // Apply sorting
            if (filters.sortBy) {
                addOrderBy(query, filters.sortBy, filters.sortDirection || 'ASC');
            } else {
                // Default sort by name
                addOrderBy(query, "name", "ASC");
            }
            
            // Execute query
            const [equipment, total] = await this.repository.findAndCount(query);
            
            // Cache results
            await cacheManager.set(cacheKey, [equipment, total], { ttl: this.cacheTTL });
            
            return [equipment, total];
        } catch (error) {
            logger.error(`Error finding equipment with filters: ${error.message}`, { 
                error, 
                filters: JSON.stringify(filters) 
            });
            throw error;
        }
    }

    /**
     * Override findById to implement caching
     */
    async findById(id: string, relations: string[] = []): Promise<Equipment | null> {
        // Generate cache key
        const cacheKey = EquipmentCacheKeys.forEquipment(id, relations);
        
        // Try to get from cache first
        const cached = await cacheManager.get<Equipment>(cacheKey);
        if (cached) {
            logger.debug('Equipment detail served from cache', { id });
            return cached;
        }
        
        // Not in cache, fetch from database
        const start = Date.now();
        
        const equipment = await this.repository.findOne({
            where: { id } as any,
            relations
        });
        
        // Log slow queries
        const duration = Date.now() - start;
        if (duration > 100) {
            logger.warn(`Slow query detected in EquipmentRepository.findById: ${duration}ms`, { id, duration });
        }
        
        // Cache the equipment
        if (equipment) {
            await cacheManager.set(cacheKey, equipment, { ttl: this.cacheTTL });
        }
        
        return equipment;
    }

    /**
     * Find popular equipment
     */
    async findPopular(limit: number = 10): Promise<Equipment[]> {
        // Generate cache key
        const cacheKey = EquipmentCacheKeys.forPopular(limit);
        
        // Try to get from cache first
        const cached = await cacheManager.get<Equipment[]>(cacheKey);
        if (cached) {
            return cached;
        }
        
        // Order by the number of related exercises
        const equipment = await this.repository
            .createQueryBuilder('equipment')
            .leftJoin('equipment.exercises', 'exercises')
            .select('equipment')
            .addSelect('COUNT(exercises.id)', 'exerciseCount')
            .groupBy('equipment.id')
            .orderBy('exerciseCount', 'DESC')
            .take(limit)
            .getMany();
        
        // Cache the result
        await cacheManager.set(cacheKey, equipment, { ttl: this.cacheTTL });
        
        return equipment;
    }

    /**
     * Find equipment by category
     */
    async findByCategory(category: EquipmentCategory, limit: number = 20): Promise<Equipment[]> {
        // Generate cache key
        const cacheKey = EquipmentCacheKeys.forCategory(category);
        
        // Try to get from cache first
        const cached = await cacheManager.get<Equipment[]>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const equipment = await this.repository.find({
            where: { category } as any,
            take: limit,
            relations: ['image']
        });
        
        // Cache the result
        await cacheManager.set(cacheKey, equipment, { ttl: this.cacheTTL });
        
        return equipment;
    }

    /**
     * Override create method to invalidate caches
     */
    async create(data: Partial<Equipment>): Promise<Equipment> {
        const equipment = await super.create(data);
        await this.invalidateEquipmentCaches();
        return equipment;
    }

    /**
     * Override update method to invalidate caches
     */
    async update(id: string, data: Partial<Equipment>): Promise<Equipment | null> {
        const equipment = await super.update(id, data);
        if (equipment) {
            await this.invalidateEquipmentCache(id);
            await this.invalidateEquipmentCaches();
        }
        return equipment;
    }

    /**
     * Override delete method to invalidate caches
     */
    async delete(id: string): Promise<any> {
        const result = await super.delete(id);
        await this.invalidateEquipmentCache(id);
        await this.invalidateEquipmentCaches();
        return result;
    }

    /**
     * Invalidate cache for a specific equipment
     */
    private async invalidateEquipmentCache(id: string): Promise<void> {
        await cacheManager.deleteByPattern(`equipment:${id}*`);
        logger.debug(`Invalidated cache for equipment: ${id}`);
    }

    /**
     * Invalidate list caches
     */
    private async invalidateEquipmentCaches(): Promise<void> {
        await cacheManager.deleteByPattern('equipment:filters*');
        await cacheManager.deleteByPattern('equipment:popular*');
        await cacheManager.deleteByPattern('equipment:category*');
        logger.debug('Invalidated equipment list caches');
    }

    /**
     * Helper method to determine which relations to load based on filter needs
     */
    private getRequiredRelations(filters: EquipmentFilters): string[] {
        const relations: string[] = [];
        
        // Only include relationships needed for filtering and display
        if (filters.includeExercises) {
            relations.push('exercises');
        }
        
        if (filters.includeMuscleGroups) {
            relations.push('muscleGroupsTargeted');
        }
        
        if (filters.includeTrainingTypes) {
            relations.push('trainingTypes');
        }
        
        if (filters.includeWorkouts) {
            relations.push('workouts');
        }
        
        if (filters.includePrograms) {
            relations.push('programs');
        }
        
        if (filters.includeMedia) {
            relations.push('image', 'video');
        }
        
        return relations;
    }
} 