"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationshipLoader = void 0;
const data_source_1 = require("../data-source");
const EntityRelationships_1 = require("./EntityRelationships");
const typeorm_1 = require("typeorm");
const CacheManager_1 = require("../services/CacheManager");
const logger_1 = __importDefault(require("./logger"));
class RelationshipLoader {
    static async loadRelationship(entityName, relationshipName, entityId, repository, options = {}) {
        var _a;
        const opts = Object.assign({ useCache: true, ttl: 3600 }, options);
        if (entityName === 'WorkoutSession' && relationshipName === 'workoutPlan') {
            const result = await this.loadWorkoutPlansForSessions([entityId], repository);
            return result.get(entityId) || [];
        }
        const relationConfig = (_a = EntityRelationships_1.EntityRelationships[entityName]) === null || _a === void 0 ? void 0 : _a[relationshipName];
        if (!relationConfig) {
            logger_1.default.warn(`No relation config found for ${entityName}.${relationshipName}`);
            return [];
        }
        if (opts.useCache) {
            const cacheKey = `relation:${entityName}:${entityId}:${relationshipName}`;
            const cached = await CacheManager_1.cacheManager.get(cacheKey);
            if (cached)
                return cached;
            try {
                const result = await this._loadRelationshipUncached(relationConfig, entityId, repository);
                await CacheManager_1.cacheManager.set(cacheKey, result, { ttl: opts.ttl });
                return result;
            }
            catch (error) {
                logger_1.default.error(`Error loading relationship ${entityName}.${relationshipName}`, {
                    error: error instanceof Error ? error.message : String(error)
                });
                return [];
            }
        }
        try {
            return await this._loadRelationshipUncached(relationConfig, entityId, repository);
        }
        catch (error) {
            logger_1.default.error(`Error loading relationship ${entityName}.${relationshipName}`, {
                error: error instanceof Error ? error.message : String(error)
            });
            return [];
        }
    }
    static async _loadRelationshipUncached(relationConfig, entityId, repository) {
        try {
            const result = await data_source_1.AppDataSource
                .createQueryBuilder()
                .select(relationConfig.relationIdField)
                .from(relationConfig.joinTable, 'jt')
                .where(`jt.${relationConfig.entityIdField} = :id`, { id: entityId })
                .getRawMany();
            if (result.length === 0)
                return [];
            const relatedIds = result.map(row => row[relationConfig.relationIdField]);
            return repository.findBy({ id: (0, typeorm_1.In)(relatedIds) });
        }
        catch (error) {
            logger_1.default.error('Error loading relationship, returning empty array', {
                error: error instanceof Error ? error.message : String(error),
                relationConfig,
                entityId
            });
            return [];
        }
    }
    static async loadRelationshipBatch(entityName, relationshipName, entityIds, repository, options = {}) {
        var _a;
        if (entityIds.length === 0)
            return new Map();
        if (entityName === 'WorkoutSession' && relationshipName === 'workoutPlan') {
            return this.loadWorkoutPlansForSessions(entityIds, repository);
        }
        const opts = Object.assign({ useCache: true, ttl: 3600 }, options);
        const relationConfig = (_a = EntityRelationships_1.EntityRelationships[entityName]) === null || _a === void 0 ? void 0 : _a[relationshipName];
        if (!relationConfig) {
            logger_1.default.warn(`No relation config found for ${entityName}.${relationshipName}`);
            return new Map(entityIds.map(id => [id, []]));
        }
        try {
            const joinResults = await data_source_1.AppDataSource
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
            const relationMap = new Map();
            joinResults.forEach(row => {
                const entityId = row.entity_id;
                const relationId = row.relation_id;
                if (!relationMap.has(entityId)) {
                    relationMap.set(entityId, []);
                }
                relationMap.get(entityId).push(relationId);
            });
            const allRelationIds = [...new Set(joinResults.map(row => row.relation_id))];
            const relatedEntities = await repository.findBy({ id: (0, typeorm_1.In)(allRelationIds) });
            const relatedEntitiesMap = new Map(relatedEntities.map(entity => [entity.id, entity]));
            const result = new Map();
            entityIds.forEach(entityId => {
                const relationIds = relationMap.get(entityId) || [];
                const relations = relationIds
                    .map(id => relatedEntitiesMap.get(id))
                    .filter(Boolean);
                result.set(entityId, relations);
            });
            return result;
        }
        catch (error) {
            logger_1.default.error('Error batch loading relationships, returning empty arrays', {
                error: error instanceof Error ? error.message : String(error),
                relationConfig,
                entityCount: entityIds.length
            });
            return new Map(entityIds.map(id => [id, []]));
        }
    }
    static async loadCategoriesForExercise(exerciseId, repository) {
        return this.loadRelationship('Exercise', 'categories', exerciseId, repository);
    }
    static async loadEquipmentForExercise(exerciseId, repository) {
        return this.loadRelationship('Exercise', 'equipmentOptions', exerciseId, repository);
    }
    static async loadMediaForExercise(exerciseId, repository) {
        return this.loadRelationship('Exercise', 'media', exerciseId, repository);
    }
    static async loadWorkoutPlansForSessions(sessionIds, repository) {
        try {
            const sessions = await data_source_1.AppDataSource.query(`SELECT id, workout_plan_id FROM workout_sessions WHERE id IN (${sessionIds.map((_, i) => `$${i + 1}`).join(',')})`, sessionIds);
            if (!sessions || sessions.length === 0) {
                return new Map(sessionIds.map(id => [id, []]));
            }
            const workoutPlanIds = sessions
                .filter(s => s.workout_plan_id)
                .map(s => s.workout_plan_id);
            if (workoutPlanIds.length === 0) {
                return new Map(sessionIds.map(id => [id, []]));
            }
            const workoutPlans = await repository.findBy({ id: (0, typeorm_1.In)(workoutPlanIds) });
            const result = new Map();
            sessionIds.forEach(sessionId => {
                const session = sessions.find(s => s.id === sessionId);
                if (session && session.workout_plan_id) {
                    const workoutPlan = workoutPlans.find(wp => wp.id === parseInt(session.workout_plan_id));
                    result.set(sessionId, workoutPlan ? [workoutPlan] : []);
                }
                else {
                    result.set(sessionId, []);
                }
            });
            return result;
        }
        catch (error) {
            logger_1.default.error('Error loading workout plans for sessions', { error, sessionCount: sessionIds.length });
            return new Map(sessionIds.map(id => [id, []]));
        }
    }
    static async loadUserFitnessGoals(userId, options = {}) {
        const repository = data_source_1.AppDataSource.getRepository('FitnessGoal');
        return this.loadRelationship('User', 'fitnessGoals', userId, repository, options);
    }
    static async loadUserBodyMetrics(userId, options = {}) {
        const repository = data_source_1.AppDataSource.getRepository('BodyMetric');
        return this.loadRelationship('User', 'bodyMetrics', userId, repository, options);
    }
    static async loadUserFavoriteWorkouts(userId, options = {}) {
        const repository = data_source_1.AppDataSource.getRepository('WorkoutPlan');
        return this.loadRelationship('User', 'favoriteWorkouts', userId, repository, options);
    }
    static async loadUserProgress(userId, options = {}) {
        const repository = data_source_1.AppDataSource.getRepository('UserProgress');
        return this.loadRelationship('User', 'progress', userId, repository, options);
    }
    static async loadUserRecentActivity(userId, limit = 5, options = {}) {
        var _a;
        try {
            const tableExists = await data_source_1.AppDataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'user_activities'
        );
      `);
            if (!((_a = tableExists[0]) === null || _a === void 0 ? void 0 : _a.exists)) {
                logger_1.default.warn(`user_activities table does not exist, returning empty array for user ${userId}`);
                return [];
            }
            try {
                const activities = await data_source_1.AppDataSource.query(`
          SELECT * FROM user_activities
          WHERE user_id = $1
          ORDER BY timestamp DESC
          LIMIT $2
        `, [userId, limit]);
                return activities || [];
            }
            catch (error) {
                logger_1.default.error('Error querying user_activities', { userId, error, limit });
                return [];
            }
        }
        catch (error) {
            logger_1.default.error('Error checking user_activities table', { userId, error });
            return [];
        }
    }
    static async loadUserAchievements(userId, options = {}) {
        const repository = data_source_1.AppDataSource.getRepository('Achievement');
        return this.loadRelationship('User', 'achievements', userId, repository, options);
    }
    static async loadUserWorkoutSessions(userId, options = {}) {
        try {
            options.useCache = false;
            const sessions = await data_source_1.AppDataSource.query(`
        SELECT * FROM workout_sessions 
        WHERE user_id = $1 
        ORDER BY start_time DESC
      `, [userId]);
            logger_1.default.info(`Direct SQL query loaded ${sessions.length} workout sessions for user ${userId}`);
            const formattedSessions = sessions.map((s) => ({
                id: s.id,
                userId: s.user_id,
                status: s.status,
                startTime: s.start_time,
                endTime: s.end_time,
                totalDuration: s.total_duration,
                caloriesBurned: s.calories_burned
            }));
            return formattedSessions;
        }
        catch (error) {
            logger_1.default.error('Error loading user workout sessions', { userId, error });
            return [];
        }
    }
}
exports.RelationshipLoader = RelationshipLoader;
//# sourceMappingURL=RelationshipLoader.js.map