import { AppDataSource } from '../data-source';
import { EntityRelationships, RelationConfig } from './EntityRelationships';
import { Repository, ObjectLiteral, In } from 'typeorm';
import { cacheManager } from '../services/CacheManager';
import logger from './logger';

export class RelationshipLoader {
  /**
   * Load a single relationship for an entity
   */
  static async loadRelationship<R extends ObjectLiteral>(
    entityName: string,
    relationshipName: string,
    entityId: string | number,
    repository: Repository<R>,
    options: { useCache?: boolean, ttl?: number } = {}
  ): Promise<R[]> {
    const opts = { useCache: true, ttl: 3600, ...options };
    
    // Special case for WorkoutSession -> WorkoutPlan relationship
    if (entityName === 'WorkoutSession' && relationshipName === 'workoutPlan') {
      const result = await this.loadWorkoutPlansForSessions([entityId as string], repository);
      return result.get(entityId as string) || [];
    }
    
    const relationConfig = EntityRelationships[entityName]?.[relationshipName];
    
    if (!relationConfig) {
      logger.warn(`No relation config found for ${entityName}.${relationshipName}`);
      return [];
    }
    
    if (opts.useCache) {
      const cacheKey = `relation:${entityName}:${entityId}:${relationshipName}`;
      const cached = await cacheManager.get<R[]>(cacheKey);
      if (cached) return cached;
      
      try {
        const result = await this._loadRelationshipUncached(relationConfig, entityId, repository);
        await cacheManager.set(cacheKey, result, { ttl: opts.ttl });
        return result;
      } catch (error) {
        logger.error(`Error loading relationship ${entityName}.${relationshipName}`, { 
          error: error instanceof Error ? error.message : String(error)
        });
        return [];
      }
    }
    
    try {
      return await this._loadRelationshipUncached(relationConfig, entityId, repository);
    } catch (error) {
      logger.error(`Error loading relationship ${entityName}.${relationshipName}`, { 
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }
  
  /**
   * Internal method to load relationship without caching
   */
  private static async _loadRelationshipUncached<R extends ObjectLiteral>(
    relationConfig: RelationConfig,
    entityId: string | number,
    repository: Repository<R>
  ): Promise<R[]> {
    try {
      // Query the join table to get related IDs
      const result = await AppDataSource
        .createQueryBuilder()
        .select(relationConfig.relationIdField)
        .from(relationConfig.joinTable, 'jt')
        .where(`jt.${relationConfig.entityIdField} = :id`, { id: entityId })
        .getRawMany();
      
      if (result.length === 0) return [];
      
      // Extract IDs from result
      const relatedIds = result.map(row => row[relationConfig.relationIdField]);
      
      // Load the related entities
      return repository.findBy({ id: In(relatedIds) } as any);
    } catch (error) {
      logger.error('Error loading relationship, returning empty array', { 
        error: error instanceof Error ? error.message : String(error),
        relationConfig,
        entityId
      });
      // Return empty array instead of throwing to prevent cascading failures
      return [];
    }
  }
  
  /**
   * Load a relationship for multiple entities (batch loading)
   */
  static async loadRelationshipBatch<R extends ObjectLiteral>(
    entityName: string,
    relationshipName: string,
    entityIds: (string | number)[],
    repository: Repository<R>,
    options: { useCache?: boolean, ttl?: number } = {}
  ): Promise<Map<string | number, R[]>> {
    if (entityIds.length === 0) return new Map();
    
    // Special case for WorkoutSession -> WorkoutPlan relationship
    if (entityName === 'WorkoutSession' && relationshipName === 'workoutPlan') {
      return this.loadWorkoutPlansForSessions(entityIds as string[], repository) as any;
    }
    
    const opts = { useCache: true, ttl: 3600, ...options };
    const relationConfig = EntityRelationships[entityName]?.[relationshipName];
    
    if (!relationConfig) {
      logger.warn(`No relation config found for ${entityName}.${relationshipName}`);
      return new Map(entityIds.map(id => [id, []]));
    }
    
    try {
      // Query the join table to get all related entity mappings
      const joinResults = await AppDataSource
        .createQueryBuilder()
        .select([
          `jt.${relationConfig.entityIdField} as entity_id`,
          `jt.${relationConfig.relationIdField} as relation_id`
        ])
        .from(relationConfig.joinTable, 'jt')
        .where(`jt.${relationConfig.entityIdField} IN (:...ids)`, { ids: entityIds })
        .getRawMany();
      
      if (joinResults.length === 0) {
        return new Map(entityIds.map(id => [id, []]));
      }
      
      // Group by entity ID to create a map of entity ID -> related IDs
      const relationMap = new Map<string | number, string[]>();
      joinResults.forEach(row => {
        const entityId = row.entity_id;
        const relationId = row.relation_id;
        
        if (!relationMap.has(entityId)) {
          relationMap.set(entityId, []);
        }
        relationMap.get(entityId)!.push(relationId);
      });
      
      // Load all related entities in a single query
      const allRelationIds = [...new Set(joinResults.map(row => row.relation_id))];
      const relatedEntities = await repository.findBy({ id: In(allRelationIds) } as any);
      
      // Create a map for quick lookup
      const relatedEntitiesMap = new Map(
        relatedEntities.map(entity => [entity.id, entity])
      );
      
      // Create the final result map
      const result = new Map<string | number, R[]>();
      
      entityIds.forEach(entityId => {
        const relationIds = relationMap.get(entityId) || [];
        const relations = relationIds
          .map(id => relatedEntitiesMap.get(id))
          .filter(Boolean) as R[];
        
        result.set(entityId, relations);
      });
      
      return result;
    } catch (error) {
      logger.error('Error batch loading relationships, returning empty arrays', { 
        error: error instanceof Error ? error.message : String(error),
        relationConfig,
        entityCount: entityIds.length
      });
      // Instead of failing, return a map with empty arrays for all entities
      return new Map(entityIds.map(id => [id, []]));
    }
  }
  
  // Convenience methods for common relationships
  
  static async loadCategoriesForExercise(
    exerciseId: string,
    repository: Repository<any>
  ) {
    return this.loadRelationship('Exercise', 'categories', exerciseId, repository);
  }
  
  static async loadEquipmentForExercise(
    exerciseId: string,
    repository: Repository<any>
  ) {
    return this.loadRelationship('Exercise', 'equipmentOptions', exerciseId, repository);
  }
  
  static async loadMediaForExercise(
    exerciseId: string,
    repository: Repository<any>
  ) {
    return this.loadRelationship('Exercise', 'media', exerciseId, repository);
  }

  // Special handler for WorkoutSession to WorkoutPlan relationship due to UUID/integer mismatch
  static async loadWorkoutPlansForSessions(
    sessionIds: string[],
    repository: Repository<any>
  ): Promise<Map<string, any[]>> {
    try {
      // First, get all the session data with their workout_plan_id
      const sessions = await AppDataSource.query(
        `SELECT id, workout_plan_id FROM workout_sessions WHERE id IN (${sessionIds.map((_, i) => `$${i+1}`).join(',')})`,
        sessionIds
      );

      if (!sessions || sessions.length === 0) {
        return new Map(sessionIds.map(id => [id, []]));
      }

      // Extract all workout plan IDs (which are integers)
      const workoutPlanIds = sessions
        .filter(s => s.workout_plan_id)
        .map(s => s.workout_plan_id);

      if (workoutPlanIds.length === 0) {
        return new Map(sessionIds.map(id => [id, []]));
      }

      // Get all the workout plans in one query
      const workoutPlans = await repository.findBy({ id: In(workoutPlanIds) } as any);
      
      // Map the workout plans back to their sessions
      const result = new Map<string, any[]>();
      sessionIds.forEach(sessionId => {
        const session = sessions.find(s => s.id === sessionId);
        if (session && session.workout_plan_id) {
          const workoutPlan = workoutPlans.find(wp => wp.id === parseInt(session.workout_plan_id));
          result.set(sessionId, workoutPlan ? [workoutPlan] : []);
        } else {
          result.set(sessionId, []);
        }
      });

      return result;
    } catch (error) {
      logger.error('Error loading workout plans for sessions', { error, sessionCount: sessionIds.length });
      return new Map(sessionIds.map(id => [id, []]));
    }
  }

  // User-specific relationship loading methods

  /**
   * Load user fitness goals
   * @param userId User ID
   * @param options Caching options
   */
  static async loadUserFitnessGoals(userId: string, options: { useCache?: boolean, ttl?: number } = {}): Promise<any[]> {
    const repository = AppDataSource.getRepository('FitnessGoal');
    return this.loadRelationship('User', 'fitnessGoals', userId, repository, options);
  }

  /**
   * Load user body metrics
   * @param userId User ID
   * @param options Caching options
   */
  static async loadUserBodyMetrics(userId: string, options: { useCache?: boolean, ttl?: number } = {}): Promise<any[]> {
    const repository = AppDataSource.getRepository('BodyMetric');
    return this.loadRelationship('User', 'bodyMetrics', userId, repository, options);
  }

  /**
   * Load user favorite workouts with enhanced error handling and type checking
   * @param userId User ID
   * @param options Caching options
   * @returns Array of workout plans
   */
  static async loadUserFavoriteWorkouts(userId: string, options: { useCache?: boolean, ttl?: number } = {}): Promise<any[]> {
    try {
      // Use the repository directly for better type safety
      const workoutRepository = AppDataSource.getRepository('WorkoutPlan');
      
      // Get the relationship configuration for favorite workouts
      const relationConfig = EntityRelationships.User?.favoriteWorkouts;
      
      if (!relationConfig) {
        logger.error('Favorite workouts relationship configuration not found');
        return [];
      }
      
      // Get favorite workout IDs from junction table
      const query = `
        SELECT wk.* 
        FROM workout_plans wk
        JOIN ${relationConfig.joinTable} jt 
          ON jt.${relationConfig.relationIdField} = wk.id
        WHERE jt.${relationConfig.entityIdField} = $1
      `;
      
      const favoriteWorkouts = await AppDataSource.query(query, [userId]);
      
      logger.info(`Loaded ${favoriteWorkouts.length} favorite workouts for user ${userId}`, {
        workoutIds: favoriteWorkouts.map((w: any) => w.id),
        dataTypes: {
          firstWorkoutIdType: favoriteWorkouts.length > 0 ? typeof favoriteWorkouts[0].id : 'none', 
          workoutIdSample: favoriteWorkouts.length > 0 ? favoriteWorkouts[0].id : 'none'
        }
      });
      
      // Return workout plans
      return favoriteWorkouts || [];
    } catch (error) {
      logger.error('Error loading user favorite workouts', { 
        userId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      // Try fallback with standard relationship loader
      try {
        const repository = AppDataSource.getRepository('WorkoutPlan');
        return this.loadRelationship('User', 'favoriteWorkouts', userId, repository, options);
      } catch (fallbackError) {
        logger.error('Fallback loading of favorite workouts also failed', { 
          userId,
          error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        });
        return [];
      }
    }
  }

  /**
   * Load user progress data
   * @param userId User ID
   * @param options Caching options
   */
  static async loadUserProgress(userId: string, options: { useCache?: boolean, ttl?: number } = {}): Promise<any[]> {
    const repository = AppDataSource.getRepository('UserProgress');
    return this.loadRelationship('User', 'progress', userId, repository, options);
  }

  /**
   * Load user recent activity
   * @param userId User ID
   * @param limit Maximum number of items to load
   * @param options Caching options
   */
  static async loadUserRecentActivity(userId: string, limit: number = 5, options: { useCache?: boolean, ttl?: number } = {}): Promise<any[]> {
    try {
      // Check if user_activities table exists (note: correct plural table name)
      const tableExists = await AppDataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'user_activities'
        );
      `);
      
      if (!tableExists[0]?.exists) {
        logger.warn(`user_activities table does not exist, returning empty array for user ${userId}`);
        return [];
      }
      
      // If table exists, proceed with direct SQL query using the correct table name
      try {
        const activities = await AppDataSource.query(`
          SELECT * FROM user_activities
          WHERE user_id = $1
          ORDER BY timestamp DESC
          LIMIT $2
        `, [userId, limit]);
        
        return activities || [];
      } catch (error) {
        logger.error('Error querying user_activities', { userId, error, limit });
        return []; // Return empty array on error
      }
    } catch (error) {
      logger.error('Error checking user_activities table', { userId, error });
      return []; // Return empty array on error
    }
  }

  /**
   * Load user achievements
   * @param userId User ID
   * @param options Caching options
   */
  static async loadUserAchievements(userId: string, options: { useCache?: boolean, ttl?: number } = {}): Promise<any[]> {
    const repository = AppDataSource.getRepository('Achievement');
    return this.loadRelationship('User', 'achievements', userId, repository, options);
  }

  /**
   * Load user's workout sessions
   * @param userId User ID
   * @param options Caching options
   */
  static async loadUserWorkoutSessions(userId: string, options: { useCache?: boolean, ttl?: number } = {}): Promise<any[]> {
    // Use a direct query to get the most up-to-date workout session data
    try {
      // Skip cache entirely for this critical data
      options.useCache = false;
      
      // Use a raw SQL query with fresh connection to ensure we get the latest data
      const sessions = await AppDataSource.query(`
        SELECT * FROM workout_sessions 
        WHERE user_id = $1 
        ORDER BY start_time DESC
      `, [userId]);
      
      logger.info(`Direct SQL query loaded ${sessions.length} workout sessions for user ${userId}`);
      
      // Map the raw data to match WorkoutSession entity structure
      const formattedSessions = sessions.map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        status: s.status,
        startTime: s.start_time,
        endTime: s.end_time,
        totalDuration: s.total_duration,
        caloriesBurned: s.calories_burned
      }));
      
      return formattedSessions;
    } catch (error) {
      logger.error('Error loading user workout sessions', { userId, error });
      return [];
    }
  }
} 