"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../models/User");
const GenericRepository_1 = require("./GenericRepository");
const logger_1 = __importDefault(require("../utils/logger"));
const CacheManager_1 = require("../services/CacheManager");
const config_1 = require("../config");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const data_source_1 = require("../data-source");
const EntityRelationships_1 = require("../utils/EntityRelationships");
const RelationshipLoader_1 = require("../utils/RelationshipLoader");
class UserCacheKeys {
    static forFilters(filters) {
        var _a, _b, _c, _d, _e;
        const keyParts = ['users:filters'];
        if (filters.role)
            keyParts.push(`role:${filters.role}`);
        if (filters.status)
            keyParts.push(`status:${filters.status}`);
        if (filters.searchTerm)
            keyParts.push(`search:${filters.searchTerm}`);
        if (filters.lastActiveAfter)
            keyParts.push(`active:${filters.lastActiveAfter.toISOString()}`);
        if (filters.hasCompletedProfile !== undefined)
            keyParts.push(`complete:${filters.hasCompletedProfile}`);
        if (filters.emailVerified !== undefined)
            keyParts.push(`verified:${filters.emailVerified}`);
        if (filters.hasProfilePicture !== undefined)
            keyParts.push(`hasPic:${filters.hasProfilePicture}`);
        if (filters.gender)
            keyParts.push(`gender:${filters.gender}`);
        if (filters.activityLevel)
            keyParts.push(`activity:${filters.activityLevel}`);
        if (filters.preferredLocation)
            keyParts.push(`location:${filters.preferredLocation}`);
        if (filters.preferredUnit)
            keyParts.push(`unit:${filters.preferredUnit}`);
        if (filters.preferredTheme)
            keyParts.push(`theme:${filters.preferredTheme}`);
        if (filters.minimumFitnessLevel)
            keyParts.push(`minLevel:${filters.minimumFitnessLevel}`);
        if (filters.limit)
            keyParts.push(`limit:${filters.limit}`);
        if (filters.offset)
            keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy)
            keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        if (filters.includePreferences)
            keyParts.push('incl:prefs');
        if (filters.includeFitnessGoals)
            keyParts.push('incl:goals');
        if (filters.includeFavoriteWorkouts)
            keyParts.push('incl:favs');
        if (filters.includeWorkoutHistory)
            keyParts.push('incl:history');
        if ((_a = filters.favoriteWorkoutIds) === null || _a === void 0 ? void 0 : _a.length)
            keyParts.push(`favIds:${filters.favoriteWorkoutIds.sort().join(',')}`);
        if ((_b = filters.workoutHistoryIds) === null || _b === void 0 ? void 0 : _b.length)
            keyParts.push(`histIds:${filters.workoutHistoryIds.sort().join(',')}`);
        if ((_c = filters.fitnessGoals) === null || _c === void 0 ? void 0 : _c.length)
            keyParts.push(`goals:${filters.fitnessGoals.sort().join(',')}`);
        if ((_d = filters.exercisePreferences) === null || _d === void 0 ? void 0 : _d.length)
            keyParts.push(`prefs:${filters.exercisePreferences.sort().join(',')}`);
        if ((_e = filters.targetBodyAreas) === null || _e === void 0 ? void 0 : _e.length)
            keyParts.push(`areas:${filters.targetBodyAreas.sort().join(',')}`);
        return keyParts.join(':');
    }
    static forUser(id, relations = []) {
        if (relations.length === 0)
            return `user:${id}`;
        return `user:${id}:${relations.sort().join('-')}`;
    }
    static forEmail(email) {
        return `user:email:${email.toLowerCase()}`;
    }
    static forUsername(username) {
        return `user:username:${username.toLowerCase()}`;
    }
    static forActiveUsers(days, limit) {
        return `users:active:${days}:${limit}`;
    }
}
class UserRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        var _a, _b;
        super(User_1.User);
        this.repository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.cacheTTL = typeof ((_a = config_1.config.cache) === null || _a === void 0 ? void 0 : _a.ttl) === 'object'
            ? config_1.config.cache.ttl.user || 3600
            : ((_b = config_1.config.cache) === null || _b === void 0 ? void 0 : _b.ttl) || 3600;
    }
    async findWithFilters(filters) {
        var _a, _b, _c;
        const cacheKey = UserCacheKeys.forFilters(filters);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            logger_1.default.debug(`Returning cached users for filters: ${JSON.stringify(filters)}`);
            return cached;
        }
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });
            if (filters.role) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "role", filters.role);
            }
            if (filters.status) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "status", filters.status);
            }
            if (filters.searchTerm) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "firstName", (0, typeorm_helpers_1.createRawQuery)(alias => `LOWER(${alias}) LIKE LOWER(:term)`, { term: `%${filters.searchTerm}%` }));
            }
            if (filters.emailVerified !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "emailVerified", filters.emailVerified);
            }
            if (filters.hasProfilePicture !== undefined) {
                if (filters.hasProfilePicture) {
                    (0, typeorm_helpers_1.addWhereCondition)(query, "profilePicture", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IS NOT NULL AND ${alias} != ''`));
                }
                else {
                    (0, typeorm_helpers_1.addWhereCondition)(query, "profilePicture", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IS NULL OR ${alias} = ''`));
                }
            }
            if (filters.gender) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "gender", filters.gender);
            }
            if (filters.activityLevel) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "activityLevel", filters.activityLevel);
            }
            if (filters.preferredLocation) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "preferences.preferredLocation", filters.preferredLocation);
            }
            if (filters.preferredUnit) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "preferences.preferredUnit", filters.preferredUnit);
            }
            if (filters.preferredTheme) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "preferences.theme", filters.preferredTheme);
            }
            if (filters.minimumFitnessLevel) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "fitnessLevel", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} >= :level`, { level: filters.minimumFitnessLevel }));
            }
            if ((_a = filters.fitnessGoals) === null || _a === void 0 ? void 0 : _a.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "preferences.fitnessGoals", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} ?| ARRAY[:...goals]`, { goals: filters.fitnessGoals }));
            }
            if ((_b = filters.exercisePreferences) === null || _b === void 0 ? void 0 : _b.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "preferences.exercisePreferences", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} ?| ARRAY[:...prefs]`, { prefs: filters.exercisePreferences }));
            }
            if ((_c = filters.targetBodyAreas) === null || _c === void 0 ? void 0 : _c.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "preferences.targetAreas", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} ?| ARRAY[:...areas]`, { areas: filters.targetBodyAreas }));
            }
            if (filters.sortBy) {
                (0, typeorm_helpers_1.addOrderBy)(query, filters.sortBy, filters.sortDirection || 'ASC');
            }
            else {
                (0, typeorm_helpers_1.addOrderBy)(query, "createdAt", "DESC");
            }
            const [users, total] = await this.repository.findAndCount(query);
            await CacheManager_1.cacheManager.set(cacheKey, [users, total], { ttl: this.cacheTTL });
            return [users, total];
        }
        catch (error) {
            logger_1.default.error(`Error finding users with filters: ${error.message}`, { error, filters });
            throw error;
        }
    }
    async findByEmail(email) {
        const cacheKey = UserCacheKeys.forEmail(email);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const start = Date.now();
        const result = await this.repository.findOneBy({ email: email.toLowerCase() });
        const duration = Date.now() - start;
        if (duration > 50) {
            logger_1.default.warn(`Slow query detected in UserRepository.findByEmail: ${duration}ms`, { duration });
        }
        if (result) {
            await CacheManager_1.cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        }
        return result;
    }
    async findByUsername(username) {
        const cacheKey = UserCacheKeys.forUsername(username);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.repository.findOneBy({ username });
        if (result) {
            await CacheManager_1.cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        }
        return result;
    }
    async findWithProfile(userId) {
        const relations = ['preferences', 'fitnessGoals', 'metrics', 'profile'];
        const cacheKey = UserCacheKeys.forUser(userId, relations);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const start = Date.now();
        const result = await this.repository.findOne({
            where: { id: userId },
            relations
        });
        const duration = Date.now() - start;
        if (duration > 100) {
            logger_1.default.warn(`Slow query detected in UserRepository.findWithProfile: ${duration}ms`, {
                userId,
                duration
            });
        }
        if (result) {
            await CacheManager_1.cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        }
        return result;
    }
    async findWithWorkouts(userId) {
        const relations = ['favoriteWorkouts', 'workoutHistory'];
        const cacheKey = UserCacheKeys.forUser(userId, relations);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const start = Date.now();
        const result = await this.repository.findOne({
            where: { id: userId },
            relations
        });
        const duration = Date.now() - start;
        if (duration > 100) {
            logger_1.default.warn(`Slow query detected in UserRepository.findWithWorkouts: ${duration}ms`, {
                userId,
                duration
            });
        }
        if (result) {
            await CacheManager_1.cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        }
        return result;
    }
    async findActiveUsers(daysSinceActive = 30, limit = 50) {
        const cacheKey = UserCacheKeys.forActiveUsers(daysSinceActive, limit);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysSinceActive);
        const result = await this.repository.find({
            where: {
                lastActive: (0, typeorm_1.MoreThan)(cutoffDate),
                status: User_1.UserStatus.ACTIVE
            },
            take: limit,
            order: { lastActive: 'DESC' }
        });
        await CacheManager_1.cacheManager.set(cacheKey, result, { ttl: this.cacheTTL });
        return result;
    }
    async countByStatus(status) {
        const cacheKey = `users:count:status:${status}`;
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached !== undefined) {
            return cached || 0;
        }
        const count = await this.repository.countBy({ status });
        await CacheManager_1.cacheManager.set(cacheKey, count, { ttl: this.cacheTTL });
        return count;
    }
    async findById(id, relations = []) {
        const cacheKey = UserCacheKeys.forUser(id, relations);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            logger_1.default.debug('User detail served from cache', { id });
            return cached;
        }
        const start = Date.now();
        const user = await this.repository.findOne({
            where: { id },
            relations
        });
        const duration = Date.now() - start;
        if (duration > 100) {
            logger_1.default.warn(`Slow query detected in UserRepository.findById: ${duration}ms`, { id, duration });
        }
        if (user) {
            await CacheManager_1.cacheManager.set(cacheKey, user, { ttl: this.cacheTTL });
        }
        return user;
    }
    async findByIdWithRelations(id, relationships = []) {
        var _a;
        try {
            const cacheKey = UserCacheKeys.forUser(id, relationships);
            const cached = await CacheManager_1.cacheManager.get(cacheKey);
            if (cached) {
                logger_1.default.debug(`Returning cached user with relations: ${relationships.join(', ')}`, { userId: id });
                return cached;
            }
            const user = await this.findById(id);
            if (!user)
                return null;
            const entityName = 'User';
            for (const relationName of relationships) {
                if ((_a = EntityRelationships_1.EntityRelationships[entityName]) === null || _a === void 0 ? void 0 : _a[relationName]) {
                    const relConfig = EntityRelationships_1.EntityRelationships[entityName][relationName];
                    const relEntityRepository = data_source_1.AppDataSource.getRepository(relConfig.relatedEntity);
                    const relationData = await RelationshipLoader_1.RelationshipLoader.loadRelationship(entityName, relationName, id, relEntityRepository);
                    user[relationName] = relationData;
                }
                else {
                    logger_1.default.warn(`Relationship '${relationName}' not defined for entity '${entityName}'`);
                }
            }
            await CacheManager_1.cacheManager.set(cacheKey, user, { ttl: this.cacheTTL });
            return user;
        }
        catch (error) {
            logger_1.default.error('Error loading user with relations', {
                error: error instanceof Error ? error.message : String(error),
                userId: id,
                relations: relationships
            });
            return null;
        }
    }
    async create(data) {
        const user = await super.create(data);
        await this.invalidateUserCaches();
        return user;
    }
    async update(id, data) {
        const user = await super.update(id, data);
        if (user) {
            await this.invalidateUserCache(id);
            await this.invalidateUserCaches();
            if (data.email && user.email) {
                await CacheManager_1.cacheManager.delete(UserCacheKeys.forEmail(user.email));
            }
            if (data.username && user.username) {
                await CacheManager_1.cacheManager.delete(UserCacheKeys.forUsername(user.username));
            }
        }
        return user;
    }
    async delete(id) {
        const user = await this.findById(id);
        const result = await super.delete(id);
        if (user) {
            await this.invalidateUserCache(id);
            await this.invalidateUserCaches();
            if (user.email) {
                await CacheManager_1.cacheManager.delete(UserCacheKeys.forEmail(user.email));
            }
            if (user.username) {
                await CacheManager_1.cacheManager.delete(UserCacheKeys.forUsername(user.username));
            }
        }
        return result;
    }
    async invalidateUserCache(id) {
        const pattern = `user:${id}*`;
        await CacheManager_1.cacheManager.deleteByPattern(pattern);
        logger_1.default.debug(`Invalidated cache for user: ${id}`);
    }
    async invalidateUserCaches() {
        await CacheManager_1.cacheManager.deleteByPattern('users:filters*');
        await CacheManager_1.cacheManager.deleteByPattern('users:active*');
        await CacheManager_1.cacheManager.deleteByPattern('users:count*');
        logger_1.default.debug('Invalidated user list caches');
    }
    getRequiredRelations(filters) {
        var _a, _b, _c;
        const relations = [];
        if (filters.includePreferences ||
            filters.preferredLocation ||
            filters.preferredUnit ||
            filters.preferredTheme ||
            ((_a = filters.fitnessGoals) === null || _a === void 0 ? void 0 : _a.length) ||
            ((_b = filters.exercisePreferences) === null || _b === void 0 ? void 0 : _b.length) ||
            ((_c = filters.targetBodyAreas) === null || _c === void 0 ? void 0 : _c.length)) {
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
    applyRelationFilters(query, filters) {
        if (filters.favoriteWorkoutIds && filters.favoriteWorkoutIds.length > 0) {
            query.where = Object.assign(Object.assign({}, query.where), { favoriteWorkouts: {
                    id: (0, typeorm_1.In)(filters.favoriteWorkoutIds)
                } });
        }
        if (filters.workoutHistoryIds && filters.workoutHistoryIds.length > 0) {
            query.where = Object.assign(Object.assign({}, query.where), { workoutHistory: {
                    id: (0, typeorm_1.In)(filters.workoutHistoryIds)
                } });
        }
    }
    applySorting(query, filters) {
        if (filters.sortBy) {
            const validSortFields = ['displayName', 'email', 'lastActive', 'createdAt', 'role', 'status'];
            const direction = filters.sortDirection || 'ASC';
            if (validSortFields.includes(filters.sortBy)) {
                query.order = { [filters.sortBy]: direction };
            }
        }
        else {
            query.order = { createdAt: 'DESC' };
        }
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map