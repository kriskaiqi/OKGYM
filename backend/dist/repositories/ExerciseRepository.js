"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseRepository = void 0;
const typeorm_1 = require("typeorm");
const Exercise_1 = require("../models/Exercise");
const GenericRepository_1 = require("./GenericRepository");
const logger_1 = __importDefault(require("../utils/logger"));
const CacheManager_1 = require("../services/CacheManager");
const config_1 = require("../config");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
class ExerciseCacheKeys {
    static forFilters(filters) {
        var _a, _b, _c, _d, _e;
        const keyParts = ['exercises:filters'];
        if (filters.difficulty)
            keyParts.push(`diff:${filters.difficulty}`);
        if (filters.movementPattern)
            keyParts.push(`mp:${filters.movementPattern}`);
        if (filters.measurementType)
            keyParts.push(`mt:${filters.measurementType}`);
        if (filters.searchTerm)
            keyParts.push(`search:${filters.searchTerm}`);
        if (filters.limit)
            keyParts.push(`limit:${filters.limit}`);
        if (filters.offset)
            keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy)
            keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        if ((_a = filters.categoryIds) === null || _a === void 0 ? void 0 : _a.length)
            keyParts.push(`cats:${filters.categoryIds.sort().join(',')}`);
        if ((_b = filters.equipmentIds) === null || _b === void 0 ? void 0 : _b.length)
            keyParts.push(`equip:${filters.equipmentIds.sort().join(',')}`);
        if ((_c = filters.muscleGroups) === null || _c === void 0 ? void 0 : _c.length)
            keyParts.push(`musc:${filters.muscleGroups.sort().join(',')}`);
        if ((_d = filters.exerciseTypes) === null || _d === void 0 ? void 0 : _d.length)
            keyParts.push(`types:${filters.exerciseTypes.sort().join(',')}`);
        if ((_e = filters.trackingFeatures) === null || _e === void 0 ? void 0 : _e.length)
            keyParts.push(`track:${filters.trackingFeatures.sort().join(',')}`);
        if (filters.includeVariations)
            keyParts.push('incl:variations');
        if (filters.includeAlternatives)
            keyParts.push('incl:alternatives');
        if (filters.includeProgressions)
            keyParts.push('incl:progressions');
        if (filters.includeRegressions)
            keyParts.push('incl:regressions');
        if (filters.includeEquipment)
            keyParts.push('incl:equipment');
        if (filters.includeCategories)
            keyParts.push('incl:categories');
        if (filters.includeMedia)
            keyParts.push('incl:media');
        if (filters.includeDetails)
            keyParts.push('incl:details');
        if (filters.includeMetrics)
            keyParts.push('incl:metrics');
        if (filters.includeFeedback)
            keyParts.push('incl:feedback');
        return keyParts.join(':');
    }
    static forExercise(id, relations = []) {
        if (relations.length === 0)
            return `exercise:${id}`;
        return `exercise:${id}:${relations.sort().join('-')}`;
    }
    static forRelatedExercises(id, relationType) {
        return `exercise:${id}:related:${relationType}`;
    }
    static forPopular(limit) {
        return `exercises:popular:${limit}`;
    }
}
class ExerciseRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        var _a, _b;
        super(Exercise_1.Exercise);
        this.cacheTTL = ((_b = (_a = config_1.config.cache) === null || _a === void 0 ? void 0 : _a.ttl) === null || _b === void 0 ? void 0 : _b.exercise) || 3600;
    }
    async findWithFilters(filters) {
        var _a, _b, _c;
        const cacheKey = ExerciseCacheKeys.forFilters(filters);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            logger_1.default.debug(`Returning cached exercises for filters`, { filters });
            return cached;
        }
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });
            if (filters.difficulty) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "level", filters.difficulty);
            }
            if (filters.movementPattern) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "movementPattern", filters.movementPattern);
            }
            if (filters.measurementType) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "measurementType", filters.measurementType);
            }
            if ((_a = filters.exerciseTypes) === null || _a === void 0 ? void 0 : _a.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "types", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} && ARRAY[:...types]::text[]`, { types: filters.exerciseTypes }));
            }
            if (filters.searchTerm) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "name", (0, typeorm_helpers_1.createRawQuery)(alias => `LOWER(${alias}) LIKE LOWER(:term)`, { term: `%${filters.searchTerm}%` }));
            }
            if ((_b = filters.equipmentIds) === null || _b === void 0 ? void 0 : _b.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT e.id FROM exercises e
                        JOIN exercise_equipment ee ON e.id = ee.exercise_id
                        WHERE ee.equipment_id IN (:...equipmentIds)
                    )`, { equipmentIds: filters.equipmentIds }));
            }
            if ((_c = filters.categoryIds) === null || _c === void 0 ? void 0 : _c.length) {
                const numericCategoryIds = filters.categoryIds.map(id => {
                    return typeof id === 'string' ? parseInt(id, 10) : id;
                }).filter(id => !isNaN(id));
                if (numericCategoryIds.length > 0) {
                    logger_1.default.debug('Filtering exercises by categories', { categoryIds: numericCategoryIds });
                    (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                            SELECT e.id FROM exercises e
                            JOIN exercise_category ecm ON e.id = ecm.exercise_id
                            WHERE ecm.category_id IN (:...categoryIds)
                        )`, { categoryIds: numericCategoryIds }));
                }
            }
            this.applySorting(query, filters);
            const [exercises, total] = await this.repository.findAndCount(query);
            await CacheManager_1.cacheManager.set(cacheKey, [exercises, total], { ttl: this.cacheTTL });
            return [exercises, total];
        }
        catch (error) {
            logger_1.default.error(`Error finding exercises with filters: ${error.message}`, {
                error,
                filters: JSON.stringify(filters)
            });
            throw error;
        }
    }
    async findById(id, relations = []) {
        const cacheKey = ExerciseCacheKeys.forExercise(id, relations);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            logger_1.default.debug('Exercise detail served from cache', { id });
            return cached;
        }
        const start = Date.now();
        const exercise = await this.repository.findOne({
            where: { id },
            relations
        });
        const duration = Date.now() - start;
        if (duration > 100) {
            logger_1.default.warn(`Slow query detected in ExerciseRepository.findById: ${duration}ms`, { id, duration });
        }
        if (exercise) {
            await CacheManager_1.cacheManager.set(cacheKey, exercise, { ttl: this.cacheTTL });
        }
        return exercise;
    }
    async findRelatedExercises(id, relationType) {
        const cacheKey = ExerciseCacheKeys.forRelatedExercises(id, relationType);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const exercise = await this.findById(id, ['relationsFrom', 'relationsTo']);
        if (!exercise) {
            return [];
        }
        const relatedExercises = await exercise.getRelatedExercises(relationType);
        await CacheManager_1.cacheManager.set(cacheKey, relatedExercises, { ttl: this.cacheTTL });
        return relatedExercises;
    }
    async findPopularExercises(limit = 10) {
        const cacheKey = ExerciseCacheKeys.forPopular(limit);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const exercises = await this.repository.find({
            where: {},
            order: {
                stats: (0, typeorm_1.Raw)(alias => `${alias}->>'popularity'->>'score' DESC`)
            },
            take: limit,
            relations: ['equipmentOptions', 'categories', 'media']
        });
        await CacheManager_1.cacheManager.set(cacheKey, exercises, { ttl: this.cacheTTL });
        return exercises;
    }
    async create(data) {
        const exercise = await super.create(data);
        await this.invalidateExerciseCaches();
        return exercise;
    }
    async update(id, data) {
        const exercise = await super.update(id, data);
        if (exercise) {
            await this.invalidateExerciseCache(id);
            await this.invalidateExerciseCaches();
        }
        return exercise;
    }
    async delete(id) {
        const result = await super.delete(id);
        await this.invalidateExerciseCache(id);
        await this.invalidateExerciseCaches();
        return result;
    }
    async updateStats(id, statsUpdate) {
        const exercise = await this.findById(id);
        if (!exercise) {
            return null;
        }
        const updatedStats = Object.assign(Object.assign({}, exercise.stats), statsUpdate);
        return this.update(id, { stats: updatedStats });
    }
    async invalidateExerciseCache(id) {
        await CacheManager_1.cacheManager.deleteByPattern(`exercise:${id}*`);
        logger_1.default.debug(`Invalidated cache for exercise: ${id}`);
    }
    async invalidateExerciseCaches() {
        await CacheManager_1.cacheManager.deleteByPattern('exercises:filters*');
        await CacheManager_1.cacheManager.deleteByPattern('exercises:popular*');
        logger_1.default.debug('Invalidated exercise list caches');
    }
    getRequiredRelations(filters) {
        const relations = [];
        if (filters.includeEquipment) {
            relations.push('equipmentOptions');
        }
        if (filters.includeCategories) {
            relations.push('categories');
        }
        if (filters.includeMedia) {
            relations.push('media');
        }
        if (filters.includeDetails) {
            relations.push('details');
        }
        if (filters.includeMetrics) {
            relations.push('metrics');
        }
        if (filters.includeFeedback) {
            relations.push('feedback');
        }
        if (filters.includeVariations ||
            filters.includeAlternatives ||
            filters.includeProgressions ||
            filters.includeRegressions) {
            relations.push('relationsFrom');
            relations.push('relationsTo');
        }
        return relations;
    }
    applySorting(query, filters) {
        if (filters.sortBy) {
            const validSortFields = ['name', 'level', 'createdAt', 'updatedAt', 'movementPattern'];
            const direction = filters.sortDirection || 'ASC';
            if (validSortFields.includes(filters.sortBy)) {
                query.order = { [filters.sortBy]: direction };
            }
            else if (filters.sortBy === 'popularity') {
                query.order = {
                    stats: (0, typeorm_1.Raw)(alias => `${alias}->>'popularity'->>'score' ${direction}`)
                };
            }
        }
        else {
            query.order = { name: 'ASC' };
        }
    }
}
exports.ExerciseRepository = ExerciseRepository;
//# sourceMappingURL=ExerciseRepository.js.map