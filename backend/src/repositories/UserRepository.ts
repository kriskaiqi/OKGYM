import { FindManyOptions, FindOptionsWhere, Like, MoreThan, In, Raw } from 'typeorm';
import { User, UserRole, UserStatus } from '../models/User';
import { 
    Difficulty, 
    FitnessGoal, 
    Gender, 
    ActivityLevel, 
    WorkoutLocation, 
    ExercisePreference, 
    BodyArea, 
    MeasurementUnit, 
    AppTheme 
} from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import logger from '../utils/logger';
import { cacheManager } from '../services/CacheManager';
import { config } from '../config';
import { createQueryOptions, addWhereCondition, addOrderBy, createRawQuery } from '../utils/typeorm-helpers';
import { AppDataSource } from '../data-source';
import { EntityRelationships } from '../utils/EntityRelationships';
import { RelationshipLoader } from '../utils/RelationshipLoader';

/**
 * Filter options for querying users
 */
export interface UserFilters {
    // Basic properties
    role?: UserRole;
    status?: UserStatus;
    searchTerm?: string;
    lastActiveAfter?: Date;
    hasCompletedProfile?: boolean;
    
    // User demographics and preferences
    gender?: Gender;
    activityLevel?: ActivityLevel;
    fitnessGoals?: FitnessGoal[];
    preferredLocation?: WorkoutLocation;
    exercisePreferences?: ExercisePreference[];
    targetBodyAreas?: BodyArea[];
    preferredUnit?: MeasurementUnit;
    preferredTheme?: AppTheme;
    minimumFitnessLevel?: Difficulty;
    
    // Relations to include
    includePreferences?: boolean;
    includeFitnessGoals?: boolean;
    includeFavoriteWorkouts?: boolean;
    includeWorkoutHistory?: boolean;
    
    // Related entity filters
    favoriteWorkoutIds?: number[];
    workoutHistoryIds?: number[];
    
    // Pagination
    limit?: number;
    offset?: number;
    
    // Sorting
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    emailVerified?: boolean;
    hasProfilePicture?: boolean;
}

/**
 * Cache key generation for User repository
 */
class UserCacheKeys {
    /**
     * Generate cache key for findWithFilters method
     */
    static forFilters(filters: UserFilters): string {
        const keyParts = ['users:filters'];
        
        // Add filter properties to key
        if (filters.role) keyParts.push(`role:${filters.role}`);
        if (filters.status) keyParts.push(`status:${filters.status}`);
        if (filters.searchTerm) keyParts.push(`search:${filters.searchTerm}`);
        if (filters.lastActiveAfter) keyParts.push(`active:${filters.lastActiveAfter.toISOString()}`);
        if (filters.hasCompletedProfile !== undefined) keyParts.push(`complete:${filters.hasCompletedProfile}`);
        if (filters.emailVerified !== undefined) keyParts.push(`verified:${filters.emailVerified}`);
        if (filters.hasProfilePicture !== undefined) keyParts.push(`hasPic:${filters.hasProfilePicture}`);
        
        // Add user demographics and preferences
        if (filters.gender) keyParts.push(`gender:${filters.gender}`);
        if (filters.activityLevel) keyParts.push(`activity:${filters.activityLevel}`);
        if (filters.preferredLocation) keyParts.push(`location:${filters.preferredLocation}`);
        if (filters.preferredUnit) keyParts.push(`unit:${filters.preferredUnit}`);
        if (filters.preferredTheme) keyParts.push(`theme:${filters.preferredTheme}`);
        if (filters.minimumFitnessLevel) keyParts.push(`minLevel:${filters.minimumFitnessLevel}`);
        
        // Add pagination and sorting
        if (filters.limit) keyParts.push(`limit:${filters.limit}`);
        if (filters.offset) keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy) keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        
        // Add relation inclusion flags
        if (filters.includePreferences) keyParts.push('incl:prefs');
        if (filters.includeFitnessGoals) keyParts.push('incl:goals');
        if (filters.includeFavoriteWorkouts) keyParts.push('incl:favs');
        if (filters.includeWorkoutHistory) keyParts.push('incl:history');
        
        // Add array properties
        if (filters.favoriteWorkoutIds?.length) keyParts.push(`favIds:${filters.favoriteWorkoutIds.sort().join(',')}`);
        if (filters.workoutHistoryIds?.length) keyParts.push(`histIds:${filters.workoutHistoryIds.sort().join(',')}`);
        if (filters.fitnessGoals?.length) keyParts.push(`goals:${filters.fitnessGoals.sort().join(',')}`);
        if (filters.exercisePreferences?.length) keyParts.push(`prefs:${filters.exercisePreferences.sort().join(',')}`);
        if (filters.targetBodyAreas?.length) keyParts.push(`areas:${filters.targetBodyAreas.sort().join(',')}`);
        
        return keyParts.join(':');
    }
    
    /**
     * Generate cache key for a single user
     */
    static forUser(id: string, relations: string[] = []): string {
        if (relations.length === 0) return `user:${id}`;
        return `user:${id}:${relations.sort().join('-')}`;
    }
    
    /**
     * Generate cache key for user by email
     */
    static forEmail(email: string): string {
        return `user:email:${email.toLowerCase()}`;
    }
    
    /**
     * Generate cache key for user by username
     */
    static forUsername(username: string): string {
        return `user:username:${username.toLowerCase()}`;
    }
    
    /**
     * Generate cache key for active users
     */
    static forActiveUsers(days: number, limit: number): string {
        return `users:active:${days}:${limit}`;
    }
}

/**
 * Specialized repository for User entity
 * Optimized with standardized indexes and query patterns
 */
export class UserRepository extends GenericRepository<User> {
    private cacheTTL: number;
    
    constructor() {
        super(User);
        this.repository = AppDataSource.getRepository(User);
        this.cacheTTL = typeof config.cache?.ttl === 'object' 
            ? config.cache.ttl.user || 3600 
            : config.cache?.ttl || 3600; // 1 hour default
    }

    /**
     * Find users with detailed filtering options
     */
    async findWithFilters(filters: UserFilters): Promise<[User[], number]> {
        // Generate cache key based on filters
        const cacheKey = UserCacheKeys.forFilters(filters);
        
        // Try to get from cache first
        const cached = await cacheManager.get<[User[], number]>(cacheKey);
        if (cached) {
            logger.debug(`Returning cached users for filters: ${JSON.stringify(filters)}`);
            return cached;
        }
        
        try {
            // Create base query with helper function
            const query = createQueryOptions<User>({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });

            // Apply where conditions using type-safe helper
            if (filters.role) {
                addWhereCondition(query, "role", filters.role);
            }
            
            if (filters.status) {
                addWhereCondition(query, "status", filters.status);
            }
            
            if (filters.searchTerm) {
                // Use helper for raw query
                addWhereCondition(query, "firstName", createRawQuery(
                    alias => `LOWER(${alias}) LIKE LOWER(:term)`,
                    { term: `%${filters.searchTerm}%` }
                ));
            }
            
            if (filters.emailVerified !== undefined) {
                addWhereCondition(query, "emailVerified", filters.emailVerified);
            }
            
            if (filters.hasProfilePicture !== undefined) {
                if (filters.hasProfilePicture) {
                    addWhereCondition(query, "profilePicture", createRawQuery(alias => `${alias} IS NOT NULL AND ${alias} != ''`));
                } else {
                    addWhereCondition(query, "profilePicture", createRawQuery(alias => `${alias} IS NULL OR ${alias} = ''`));
                }
            }
            
            // Apply user demographics and preferences filters
            if (filters.gender) {
                addWhereCondition(query, "gender", filters.gender);
            }
            
            if (filters.activityLevel) {
                addWhereCondition(query, "activityLevel", filters.activityLevel);
            }
            
            if (filters.preferredLocation) {
                addWhereCondition(query, "preferences.preferredLocation", filters.preferredLocation);
            }
            
            if (filters.preferredUnit) {
                addWhereCondition(query, "preferences.preferredUnit", filters.preferredUnit);
            }
            
            if (filters.preferredTheme) {
                addWhereCondition(query, "preferences.theme", filters.preferredTheme);
            }
            
            if (filters.minimumFitnessLevel) {
                addWhereCondition(query, "fitnessLevel", createRawQuery(
                    alias => `${alias} >= :level`,
                    { level: filters.minimumFitnessLevel }
                ));
            }
            
            // Handle array-based filters
            if (filters.fitnessGoals?.length) {
                // For array stored in JSONB column
                addWhereCondition(query, "preferences.fitnessGoals", createRawQuery(
                    alias => `${alias} ?| ARRAY[:...goals]`,
                    { goals: filters.fitnessGoals }
                ));
            }
            
            if (filters.exercisePreferences?.length) {
                // For array stored in JSONB column
                addWhereCondition(query, "preferences.exercisePreferences", createRawQuery(
                    alias => `${alias} ?| ARRAY[:...prefs]`,
                    { prefs: filters.exercisePreferences }
                ));
            }
            
            if (filters.targetBodyAreas?.length) {
                // For array stored in JSONB column
                addWhereCondition(query, "preferences.targetAreas", createRawQuery(
                    alias => `${alias} ?| ARRAY[:...areas]`,
                    { areas: filters.targetBodyAreas }
                ));
            }
            
            // Apply sorting with helper function
            if (filters.sortBy) {
                addOrderBy(query, filters.sortBy, filters.sortDirection || 'ASC');
            } else {
                // Default sort by createdAt descending
                addOrderBy(query, "createdAt", "DESC");
            }
            
            // Execute query
            const [users, total] = await this.repository.findAndCount(query);
            
            // Cache results
            await cacheManager.set(cacheKey, [users, total], { ttl: this.cacheTTL });
            
            return [users, total];
        } catch (error) {
            logger.error(`Error finding users with filters: ${error.message}`, { error, filters });
            throw error;
        }
    }

    /**
     * Find user by email - optimized to use email index
     */
    async findByEmail(email: string): Promise<User | null> {
        // Generate cache key
        const cacheKey = UserCacheKeys.forEmail(email);
        
        // Try to get from cache first
        const cached = await cacheManager.get<User>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const start = Date.now();
        const result = await this.repository.findOneBy({ email: email.toLowerCase() } as FindOptionsWhere<User>);
        
        const duration = Date.now() - start;
        if (duration > 50) {
            logger.warn(`Slow query detected in UserRepository.findByEmail: ${duration}ms`, { duration });
        }
        
        // Cache the result
        if (result) {
            await cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        }
        
        return result;
    }

    /**
     * Find user by username - optimized to use username index
     */
    async findByUsername(username: string): Promise<User | null> {
        // Generate cache key
        const cacheKey = UserCacheKeys.forUsername(username);
        
        // Try to get from cache first
        const cached = await cacheManager.get<User>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const result = await this.repository.findOneBy({ username } as FindOptionsWhere<User>);
        
        // Cache the result
        if (result) {
            await cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        }
        
        return result;
    }

    /**
     * Find user with profile details - selective relation loading
     */
    async findWithProfile(userId: string): Promise<User | null> {
        const relations = ['preferences', 'fitnessGoals', 'metrics', 'profile'];
        
        // Generate cache key
        const cacheKey = UserCacheKeys.forUser(userId, relations);
        
        // Try to get from cache first
        const cached = await cacheManager.get<User>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const start = Date.now();
        
        const result = await this.repository.findOne({
            where: { id: userId } as FindOptionsWhere<User>,
            relations
        });
        
        const duration = Date.now() - start;
        if (duration > 100) {
            logger.warn(`Slow query detected in UserRepository.findWithProfile: ${duration}ms`, { 
                userId,
                duration
            });
        }
        
        // Cache the result
        if (result) {
            await cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        }
        
        return result;
    }

    /**
     * Find user with workout data - uses idx_user_favorite_workouts and idx_user_workout_history
     */
    async findWithWorkouts(userId: string): Promise<User | null> {
        const relations = ['favoriteWorkouts', 'workoutHistory'];
        
        // Generate cache key
        const cacheKey = UserCacheKeys.forUser(userId, relations);
        
        // Try to get from cache first
        const cached = await cacheManager.get<User>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const start = Date.now();
        
        const result = await this.repository.findOne({
            where: { id: userId } as FindOptionsWhere<User>,
            relations
        });
        
        const duration = Date.now() - start;
        if (duration > 100) {
            logger.warn(`Slow query detected in UserRepository.findWithWorkouts: ${duration}ms`, { 
                userId,
                duration
            });
        }
        
        // Cache the result
        if (result) {
            await cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        }
        
        return result;
    }

    /**
     * Find active users for engagement features
     * Uses idx_user_activity index
     */
    async findActiveUsers(daysSinceActive: number = 30, limit: number = 50): Promise<User[]> {
        // Generate cache key
        const cacheKey = UserCacheKeys.forActiveUsers(daysSinceActive, limit);
        
        // Try to get from cache first
        const cached = await cacheManager.get<User[]>(cacheKey);
        if (cached) {
            return cached;
        }
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysSinceActive);
        
        const result = await this.repository.find({
            where: { 
                lastActive: MoreThan(cutoffDate),
                status: UserStatus.ACTIVE
            } as FindOptionsWhere<User>,
            take: limit,
            order: { lastActive: 'DESC' } as Record<string, 'ASC' | 'DESC'>
        });
        
        // Cache the result
        await cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        
        return result;
    }

    /**
     * Count users by status - optimized counting operation
     */
    async countByStatus(status: UserStatus): Promise<number> {
        const cacheKey = `users:count:status:${status}`;
        
        // Try to get from cache first
        const cached = await cacheManager.get<number>(cacheKey);
        if (cached !== undefined) {
            return cached || 0; // Convert null to 0 to ensure a number is returned
        }
        
        const count = await this.repository.countBy({ status } as FindOptionsWhere<User>);
        
        // Cache the result
        await cacheManager.set(cacheKey, count, { ttl: this.cacheTTL });
        
        return count;
    }
    
    /**
     * Override findById to implement caching
     */
    async findById(id: string, relations: string[] = []): Promise<User | null> {
        // Generate cache key
        const cacheKey = UserCacheKeys.forUser(id, relations);
        
        // Try to get from cache first
        const cached = await cacheManager.get<User>(cacheKey);
        if (cached) {
            logger.debug('User detail served from cache', { id });
            return cached;
        }
        
        // Not in cache, fetch from database
        const start = Date.now();
        
        const user = await this.repository.findOne({
            where: { id } as FindOptionsWhere<User>,
            relations
        });
        
        // Log slow queries
        const duration = Date.now() - start;
        if (duration > 100) {
            logger.warn(`Slow query detected in UserRepository.findById: ${duration}ms`, { id, duration });
        }
        
        // Cache the user
        if (user) {
            await cacheManager.set(cacheKey, user, { ttl: this.cacheTTL });
        }
        
        return user;
    }

    /**
     * Find user by ID with specific relationships loaded
     * Uses the RelationshipLoader to load relationships from the schema
     * 
     * @param id User ID
     * @param relationships Array of relationship names to load
     * @returns User with requested relationships loaded
     */
    async findByIdWithRelations(id: string, relationships: string[] = []): Promise<User | null> {
        try {
            // Generate cache key
            const cacheKey = UserCacheKeys.forUser(id, relationships);
            
            // Try to get from cache first
            const cached = await cacheManager.get<User>(cacheKey);
            if (cached) {
                logger.debug(`Returning cached user with relations: ${relationships.join(', ')}`, { userId: id });
                return cached;
            }
            
            // Get base user first
            const user = await this.findById(id);
            if (!user) return null;
            
            // Use the RelationshipLoader to load each relationship
            const entityName = 'User';
            for (const relationName of relationships) {
                if (EntityRelationships[entityName]?.[relationName]) {
                    // Get the related entity
                    const relConfig = EntityRelationships[entityName][relationName];
                    const relEntityRepository = AppDataSource.getRepository(relConfig.relatedEntity);
                    
                    // Load the relationship
                    const relationData = await RelationshipLoader.loadRelationship(
                        entityName,
                        relationName,
                        id,
                        relEntityRepository
                    );
                    
                    // Assign to the user object
                    (user as any)[relationName] = relationData;
                } else {
                    logger.warn(`Relationship '${relationName}' not defined for entity '${entityName}'`);
                }
            }
            
            // Cache the result
            await cacheManager.set(cacheKey, user, { ttl: this.cacheTTL });
            
            return user;
        } catch (error) {
            logger.error('Error loading user with relations', {
                error: error instanceof Error ? error.message : String(error),
                userId: id,
                relations: relationships
            });
            
            return null;
        }
    }

    /**
     * Override create method to invalidate caches
     */
    async create(data: Partial<User>): Promise<User> {
        const user = await super.create(data);
        await this.invalidateUserCaches();
        return user;
    }

    /**
     * Override update method to invalidate caches
     */
    async update(id: string, data: Partial<User>): Promise<User | null> {
        const user = await super.update(id, data);
        if (user) {
            await this.invalidateUserCache(id);
            await this.invalidateUserCaches();
            
            // Also invalidate email and username caches if those fields were updated
            if (data.email && user.email) {
                await cacheManager.delete(UserCacheKeys.forEmail(user.email));
            }
            if ((data as any).username && (user as any).username) {
                await cacheManager.delete(UserCacheKeys.forUsername((user as any).username));
            }
        }
        return user;
    }

    /**
     * Override delete method to invalidate caches
     */
    async delete(id: string): Promise<any> {
        // Get the user first to invalidate email/username caches
        const user = await this.findById(id);
        
        const result = await super.delete(id);
        
        if (user) {
            await this.invalidateUserCache(id);
            await this.invalidateUserCaches();
            
            if (user.email) {
                await cacheManager.delete(UserCacheKeys.forEmail(user.email));
            }
            if ((user as any).username) {
                await cacheManager.delete(UserCacheKeys.forUsername((user as any).username));
            }
        }
        
        return result;
    }

    /**
     * Invalidate cache for a specific user
     */
    private async invalidateUserCache(id: string): Promise<void> {
        const pattern = `user:${id}*`;
        await cacheManager.deleteByPattern(pattern);
        logger.debug(`Invalidated cache for user: ${id}`);
    }

    /**
     * Invalidate list caches
     */
    private async invalidateUserCaches(): Promise<void> {
        await cacheManager.deleteByPattern('users:filters*');
        await cacheManager.deleteByPattern('users:active*');
        await cacheManager.deleteByPattern('users:count*');
        logger.debug('Invalidated user list caches');
    }

    /**
     * Helper method to determine which relations to load based on filter needs
     */
    private getRequiredRelations(filters: UserFilters): string[] {
        const relations: string[] = [];
        
        // Always include preferences if any preference filters are used
        if (filters.includePreferences || 
            filters.preferredLocation || 
            filters.preferredUnit || 
            filters.preferredTheme || 
            filters.fitnessGoals?.length || 
            filters.exercisePreferences?.length || 
            filters.targetBodyAreas?.length) {
            relations.push('preferences');
        }
        
        if (filters.includeFitnessGoals) {
            relations.push('fitnessGoals');
        }
        
        if (filters.includeFavoriteWorkouts) {
            relations.push('favoriteWorkouts');
        }
        
        if (filters.includeWorkoutHistory) {
            relations.push('workoutHistory');
        }
        
        return relations;
    }

    /**
     * Helper to apply relation filters
     */
    private applyRelationFilters(query: FindManyOptions<User>, filters: UserFilters): void {
        if (filters.favoriteWorkoutIds && filters.favoriteWorkoutIds.length > 0) {
            (query.where as any) = {
                ...(query.where as any),
                favoriteWorkouts: {
                    id: In(filters.favoriteWorkoutIds)
                }
            };
        }

        if (filters.workoutHistoryIds && filters.workoutHistoryIds.length > 0) {
            (query.where as any) = {
                ...(query.where as any),
                workoutHistory: {
                    id: In(filters.workoutHistoryIds)
                }
            };
        }
    }

    /**
     * Helper to apply sorting using indexed fields
     */
    private applySorting(query: FindManyOptions<User>, filters: UserFilters): void {
        if (filters.sortBy) {
            const validSortFields = ['displayName', 'email', 'lastActive', 'createdAt', 'role', 'status'];
            const direction = filters.sortDirection || 'ASC';
            
            if (validSortFields.includes(filters.sortBy)) {
                (query.order as any) = { [filters.sortBy]: direction };
            }
        } else {
            // Default sort by created date (newest first)
            query.order = { createdAt: 'DESC' } as Record<string, 'ASC' | 'DESC'>;
        }
    }

    /**
     * Save a user entity to the database
     */
    async save(user: User): Promise<User> {
        try {
            return await this.repository.save(user);
        } catch (error) {
            logger.error('Error saving user', {
                userId: user.id,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Remove a workout from a user's favorites
     * Uses direct query to ensure junction table record is removed
     */
    async removeFavoriteWorkout(userId: string, workoutId: string): Promise<boolean> {
        try {
            logger.info(`Removing workout from favorites`, { userId, workoutId });
            
            // First try using TypeORM's relation removal
            const user = await this.repository.findOne({
                where: { id: userId },
                relations: ['favoriteWorkouts']
            });

            if (!user) {
                logger.warn(`Cannot remove favorite - user not found`, { userId, workoutId });
                return false;
            }

            // Check if workout is in favorites - handle potential type mismatch
            // Use loose equality (==) to handle string/number comparison or convert both to strings
            const hasWorkout = user.favoriteWorkouts.some(w => String(w.id) === String(workoutId));
            if (!hasWorkout) {
                logger.info(`Workout not in favorites, nothing to remove`, { userId, workoutId });
                
                // Try direct SQL removal as a fallback
                const result = await this.removeWorkoutByDirectSQL(userId, workoutId);
                if (result) {
                    logger.info(`Direct SQL removal successful for workout that wasn't found in relation`, { userId, workoutId });
                }
                return result;
            }

            // Remove workout from favorites array - handle potential type mismatch
            user.favoriteWorkouts = user.favoriteWorkouts.filter(w => String(w.id) !== String(workoutId));
            
            // Save with transaction for data consistency
            const { AppDataSource } = require('../data-source');
            const queryRunner = AppDataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            
            try {
                // Save using the transaction
                await queryRunner.manager.save(user);
                
                // Verify deletion with direct query for extra safety
                const junctionTableRecord = await queryRunner.query(
                    `SELECT * FROM user_favorite_workouts WHERE user_id = $1 AND workout_id = $2`,
                    [userId, workoutId]
                );
                
                // If record still exists, force delete it
                if (junctionTableRecord && junctionTableRecord.length > 0) {
                    logger.warn(`Junction record still exists after TypeORM save, forcing deletion with SQL`, { 
                        userId, 
                        workoutId 
                    });
                    
                    await queryRunner.query(
                        `DELETE FROM user_favorite_workouts WHERE user_id = $1 AND workout_id = $2`,
                        [userId, workoutId]
                    );
                }
                
                // Commit the transaction
                await queryRunner.commitTransaction();
                logger.info(`Successfully removed favorite workout relationship`, { userId, workoutId });
                return true;
            } catch (error) {
                // Rollback on error
                await queryRunner.rollbackTransaction();
                logger.error('Transaction error removing favorite workout', {
                    userId,
                    workoutId,
                    error: error instanceof Error ? error.message : String(error)
                });
                throw error;
            } finally {
                // Release the query runner
                await queryRunner.release();
            }
        } catch (error) {
            logger.error('Error removing favorite workout', {
                userId,
                workoutId,
                error: error instanceof Error ? error.message : String(error)
            });
            
            // Last resort: try direct deletion if everything else failed
            return this.removeWorkoutByDirectSQL(userId, workoutId);
        }
    }

    /**
     * Remove a workout from favorites using direct SQL
     * Helper method to consolidate direct SQL removal logic
     * @param userId User ID
     * @param workoutId Workout ID
     * @returns Whether removal was successful
     */
    private async removeWorkoutByDirectSQL(userId: string, workoutId: string): Promise<boolean> {
        try {
            const { AppDataSource } = require('../data-source');
            const result = await AppDataSource.query(
                `DELETE FROM user_favorite_workouts WHERE user_id = $1 AND workout_id = $2`,
                [userId, workoutId]
            );
            logger.info(`Emergency direct delete from favorite workouts:`, { result });
            return true;
        } catch (fallbackError) {
            logger.error('Direct SQL delete failed', {
                userId,
                workoutId,
                error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
            });
            return false;
        }
    }
} 