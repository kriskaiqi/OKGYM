"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Exercise_1 = require("../models/Exercise");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const Equipment_1 = require("../models/Equipment");
const Media_1 = require("../models/Media");
const ExerciseRelation_1 = require("../models/ExerciseRelation");
const errors_1 = require("../utils/errors");
const cache_metrics_1 = require("../utils/cache-metrics");
const performance_1 = require("../utils/performance");
const ExerciseDTO_1 = require("../dto/ExerciseDTO");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
const logger_1 = __importDefault(require("../utils/logger"));
const Enums_1 = require("../models/shared/Enums");
const RelationshipLoader_1 = require("../utils/RelationshipLoader");
const QueryBuilderExtensions_1 = require("../utils/QueryBuilderExtensions");
let ExerciseService = class ExerciseService {
    constructor(exerciseRepository, categoryRepository, equipmentRepository, mediaRepository, relationRepository, cacheManager) {
        this.exerciseRepository = exerciseRepository;
        this.categoryRepository = categoryRepository;
        this.equipmentRepository = equipmentRepository;
        this.mediaRepository = mediaRepository;
        this.relationRepository = relationRepository;
        this.cacheManager = cacheManager;
        this.CACHE_TTL = 3600;
        this.CATEGORY_CACHE_TTL = 7200;
        this.EQUIPMENT_CACHE_TTL = 7200;
        this.MEDIA_CACHE_TTL = 86400;
    }
    async createExercise(exerciseData) {
        try {
            const exercise = this.exerciseRepository.create(Object.assign(Object.assign({}, exerciseData), { types: [exerciseData.type] }));
            await this.validateExercise(exercise);
            if (exerciseData.categoryIds) {
                exercise.categories = await this.categoryRepository.findByIds(exerciseData.categoryIds);
            }
            if (exerciseData.equipmentIds) {
                exercise.equipmentOptions = await this.equipmentRepository.findByIds(exerciseData.equipmentIds);
            }
            if (exerciseData.mediaIds) {
                exercise.media = await this.mediaRepository.findByIds(exerciseData.mediaIds);
            }
            const savedExercise = await this.exerciseRepository.save(exercise);
            await this.invalidateExerciseCache();
            return this.mapToResponseDTO(savedExercise);
        }
        catch (error) {
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to create exercise', 500, error);
        }
    }
    async getExerciseById(id) {
        try {
            const cacheKey = `exercise:${id}`;
            const cachedExercise = await this.getFromCache(cacheKey);
            if (cachedExercise) {
                return cachedExercise;
            }
            const exercise = await this.exerciseRepository.findOne({
                where: { id }
            });
            if (!exercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }
            try {
                const [categories, equipmentOptions, media] = await Promise.all([
                    RelationshipLoader_1.RelationshipLoader.loadCategoriesForExercise(id, this.categoryRepository),
                    RelationshipLoader_1.RelationshipLoader.loadEquipmentForExercise(id, this.equipmentRepository),
                    RelationshipLoader_1.RelationshipLoader.loadRelationship('Exercise', 'media', id, this.mediaRepository)
                ]);
                exercise.categories = categories;
                exercise.equipmentOptions = equipmentOptions;
                exercise.media = media;
                logger_1.default.debug(`Loaded relationships for exercise ${id}:`, {
                    categories: categories.length,
                    equipment: equipmentOptions.length,
                    media: media.length
                });
            }
            catch (error) {
                logger_1.default.error(`Failed to load relationships for exercise ${id}, trying direct query fallback`, {
                    error: error instanceof Error ? error.message : String(error)
                });
                try {
                    const categoriesQuery = `
                        SELECT ec.id, ec.name, ec.description, ec.type, ec.is_active
                        FROM exercise_categories ec
                        JOIN exercise_category ec_join ON ec.id = ec_join.category_id
                        WHERE ec_join.exercise_id = $1
                    `;
                    const equipmentQuery = `
                        SELECT e.id, e.name, e.description, e.category 
                        FROM equipment e
                        JOIN exercise_equipment ee ON e.id = ee.equipment_id
                        WHERE ee.exercise_id = $1
                    `;
                    const [categoriesResult, equipmentResult] = await Promise.all([
                        this.exerciseRepository.query(categoriesQuery, [id]),
                        this.exerciseRepository.query(equipmentQuery, [id])
                    ]);
                    exercise.categories = categoriesResult.map(row => ({
                        id: row.id,
                        name: row.name,
                        description: row.description,
                        type: row.type,
                        isActive: row.is_active
                    }));
                    exercise.equipmentOptions = equipmentResult.map(row => ({
                        id: row.id,
                        name: row.name,
                        description: row.description,
                        category: row.category
                    }));
                    exercise.media = [];
                    logger_1.default.debug(`Direct query fallback for exercise ${id}:`, {
                        categories: exercise.categories.length,
                        equipment: exercise.equipmentOptions.length
                    });
                }
                catch (directError) {
                    logger_1.default.error(`Direct query fallback also failed for exercise ${id}`, {
                        error: directError instanceof Error ? directError.message : String(directError)
                    });
                    exercise.categories = [];
                    exercise.equipmentOptions = [];
                    exercise.media = [];
                }
            }
            const responseDTO = this.mapToResponseDTO(exercise);
            await this.setCache(cacheKey, responseDTO);
            return responseDTO;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get exercise', 500, error);
        }
    }
    async updateExercise(id, exerciseData) {
        try {
            const exercise = await this.exerciseRepository.findOne({ where: { id } });
            if (!exercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }
            Object.assign(exercise, exerciseData);
            await this.validateExercise(exercise);
            if (exerciseData.categoryIds) {
                exercise.categories = await this.categoryRepository.findByIds(exerciseData.categoryIds);
            }
            if (exerciseData.equipmentIds) {
                exercise.equipmentOptions = await this.equipmentRepository.findByIds(exerciseData.equipmentIds);
            }
            if (exerciseData.mediaIds) {
                exercise.media = await this.mediaRepository.findByIds(exerciseData.mediaIds);
            }
            const updatedExercise = await this.exerciseRepository.save(exercise);
            await this.invalidateExerciseCache();
            return this.mapToResponseDTO(updatedExercise);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to update exercise', 500, error);
        }
    }
    async deleteExercise(id) {
        try {
            const exercise = await this.exerciseRepository.findOne({
                where: { id },
                relations: ['workoutExercises']
            });
            if (!exercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }
            if (exercise.workoutExercises && exercise.workoutExercises.length > 0) {
                throw new errors_1.AppError(errors_1.ErrorType.BUSINESS_RULE_VIOLATION, 'Cannot delete exercise that is used in workouts', 400);
            }
            await this.exerciseRepository.remove(exercise);
            await this.invalidateExerciseCache();
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to delete exercise', 500, error);
        }
    }
    async getAllExercises(filterOptions) {
        try {
            const cacheKey = `exercises:all:${JSON.stringify(filterOptions || {})}`;
            const cachedData = await this.getFromCache(cacheKey);
            if (cachedData) {
                logger_1.default.debug(`Cache hit for getAllExercises with filters ${JSON.stringify(filterOptions)}`);
                return cachedData;
            }
            logger_1.default.debug(`Cache miss for getAllExercises with filters ${JSON.stringify(filterOptions)}`);
            let page = 1;
            let limit = 20;
            if (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.page) {
                page = typeof filterOptions.page === 'string' ?
                    parseInt(filterOptions.page, 10) : filterOptions.page;
                if (isNaN(page) || page < 1) {
                    throw errors_1.AppError.validation('Invalid page parameter', { page: filterOptions.page });
                }
            }
            if (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.limit) {
                limit = typeof filterOptions.limit === 'string' ?
                    parseInt(filterOptions.limit, 10) : filterOptions.limit;
                if (isNaN(limit) || limit < 1) {
                    throw errors_1.AppError.validation('Invalid limit parameter', { limit: filterOptions.limit });
                }
            }
            const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise')
                .skip((page - 1) * limit)
                .take(limit);
            if (filterOptions) {
                this.applyExerciseFilters(queryBuilder, filterOptions);
            }
            const [exercises, total] = await queryBuilder.getManyAndCount();
            const exerciseIds = exercises.map(ex => ex.id);
            try {
                const [categoriesMap, equipmentMap, mediaMap] = await Promise.all([
                    RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('Exercise', 'categories', exerciseIds, this.categoryRepository),
                    RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('Exercise', 'equipmentOptions', exerciseIds, this.equipmentRepository),
                    RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('Exercise', 'media', exerciseIds, this.mediaRepository)
                ]);
                exercises.forEach(exercise => {
                    exercise.categories = categoriesMap.get(exercise.id) || [];
                    exercise.equipmentOptions = equipmentMap.get(exercise.id) || [];
                    exercise.media = mediaMap.get(exercise.id) || [];
                });
            }
            catch (error) {
                logger_1.default.error('Failed to load relationships using RelationshipLoader, falling back to direct query', {
                    error: error instanceof Error ? error.message : String(error)
                });
                try {
                    const categoriesQuery = `
                        SELECT e.id as exercise_id, ec.id, ec.name, ec.description, ec.type, ec.is_active
                        FROM exercises e
                        LEFT JOIN exercise_category ec_join ON e.id = ec_join.exercise_id
                        LEFT JOIN exercise_categories ec ON ec_join.category_id = ec.id
                        WHERE e.id IN (${exerciseIds.map(id => `'${id}'`).join(',')})
                    `;
                    const categoriesResult = await this.exerciseRepository.query(categoriesQuery);
                    const categoriesByExercise = new Map();
                    categoriesResult.forEach(row => {
                        if (!row.id)
                            return;
                        const exerciseId = row.exercise_id;
                        if (!categoriesByExercise.has(exerciseId)) {
                            categoriesByExercise.set(exerciseId, []);
                        }
                        categoriesByExercise.get(exerciseId).push({
                            id: row.id,
                            name: row.name,
                            description: row.description,
                            type: row.type,
                            isActive: row.is_active
                        });
                    });
                    exercises.forEach(exercise => {
                        exercise.categories = categoriesByExercise.get(exercise.id) || [];
                    });
                }
                catch (directError) {
                    logger_1.default.error('Direct query fallback also failed, using empty arrays for relationships', {
                        error: directError instanceof Error ? directError.message : String(directError)
                    });
                    exercises.forEach(exercise => {
                        exercise.categories = [];
                        exercise.equipmentOptions = [];
                        exercise.media = [];
                    });
                }
            }
            const responseDTOs = exercises.map(ex => this.mapToResponseDTO(ex));
            const result = [responseDTOs, total];
            await this.setCache(cacheKey, result, this.CACHE_TTL);
            return result;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            logger_1.default.error('Failed to get all exercises', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                filters: filterOptions
            });
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get all exercises', 500, error);
        }
    }
    async createExerciseRelation(relationData) {
        try {
            const [baseExercise, relatedExercise] = await Promise.all([
                this.exerciseRepository.findOne({ where: { id: relationData.sourceExerciseId } }),
                this.exerciseRepository.findOne({ where: { id: relationData.targetExerciseId } })
            ]);
            if (!baseExercise || !relatedExercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'One or both exercises not found', 404);
            }
            const relation = this.relationRepository.create({
                baseExercise,
                relatedExercise,
                relationType: relationData.type,
                notes: relationData.description,
                similarityScore: 1.0
            });
            const savedRelation = await this.relationRepository.save(relation);
            await this.invalidateExerciseCache();
            return this.mapToRelationResponseDTO(savedRelation);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to create exercise relation', 500, error);
        }
    }
    async getRelatedExercises(exerciseId, relationType) {
        try {
            const queryBuilder = this.relationRepository.createQueryBuilder('relation')
                .leftJoinAndSelect('relation.relatedExercise', 'related')
                .where('relation.base_exercise_id = :exerciseId', { exerciseId });
            if (relationType) {
                queryBuilder.andWhere('relation.relationType = :type', { type: relationType });
            }
            const relations = await queryBuilder.getMany();
            return relations.map(relation => this.mapToResponseDTO(relation.relatedExercise));
        }
        catch (error) {
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get related exercises', 500, error);
        }
    }
    async removeExerciseRelation(relationId) {
        try {
            const relation = await this.relationRepository.findOne({ where: { id: relationId } });
            if (!relation) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise relation not found', 404);
            }
            await this.relationRepository.remove(relation);
            await this.invalidateExerciseCache();
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to remove exercise relation', 500, error);
        }
    }
    async getExerciseAlternatives(exerciseId, filterOptions) {
        try {
            const cacheKey = `exercise:${exerciseId}:alternatives`;
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cachedAlternatives = await this.getFromCache(cacheKey);
                if (cachedAlternatives) {
                    return cachedAlternatives;
                }
            }
            const exercise = await this.exerciseRepository.findOne({
                where: { id: exerciseId }
            });
            if (!exercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }
            const queryBuilder = this.relationRepository.createQueryBuilder('relation')
                .leftJoinAndSelect('relation.relatedExercise', 'relatedExercise')
                .where('relation.base_exercise_id = :exerciseId', { exerciseId })
                .andWhere('relation.relationType = :relationType', { relationType: ExerciseRelation_1.RelationType.ALTERNATIVE });
            if ((filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.page) && (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.limit)) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            }
            const [relations, total] = await queryBuilder.getManyAndCount();
            const alternatives = relations.map(relation => this.mapToResponseDTO(relation.relatedExercise));
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                await this.setCache(cacheKey, [alternatives, total]);
            }
            return [alternatives, total];
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get exercise alternatives', 500, error);
        }
    }
    async getExerciseProgressions(exerciseId, direction, filterOptions) {
        try {
            const cacheKey = `exercise:${exerciseId}:progressions:${direction || 'all'}`;
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cachedProgressions = await this.getFromCache(cacheKey);
                if (cachedProgressions) {
                    return cachedProgressions;
                }
            }
            const exercise = await this.exerciseRepository.findOne({
                where: { id: exerciseId }
            });
            if (!exercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }
            const queryBuilder = this.relationRepository.createQueryBuilder('relation')
                .leftJoinAndSelect('relation.relatedExercise', 'relatedExercise')
                .where('relation.base_exercise_id = :exerciseId', { exerciseId });
            if (direction === 'HARDER') {
                queryBuilder.andWhere('relation.relationType = :relationType', {
                    relationType: ExerciseRelation_1.RelationType.PROGRESSION
                });
            }
            else if (direction === 'EASIER') {
                queryBuilder.andWhere('relation.relationType = :relationType', {
                    relationType: ExerciseRelation_1.RelationType.REGRESSION
                });
            }
            else {
                queryBuilder.andWhere('relation.relationType IN (:...relationTypes)', {
                    relationTypes: [ExerciseRelation_1.RelationType.PROGRESSION, ExerciseRelation_1.RelationType.REGRESSION]
                });
            }
            if ((filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.page) && (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.limit)) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            }
            const [relations, total] = await queryBuilder.getManyAndCount();
            const progressions = relations.map(relation => this.mapToResponseDTO(relation.relatedExercise));
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                await this.setCache(cacheKey, [progressions, total]);
            }
            return [progressions, total];
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get exercise progressions', 500, error);
        }
    }
    async validateExercise(exercise) {
    }
    mapToResponseDTO(exercise) {
        const primaryMuscles = exercise.targetMuscleGroups ?
            exercise.targetMuscleGroups.map(m => String(m)) : [];
        const secondaryMuscles = exercise.synergistMuscleGroups ?
            exercise.synergistMuscleGroups.map(m => String(m)) : [];
        let formattedStats = undefined;
        if (exercise.stats) {
            formattedStats = {
                duration: Object.assign({}, exercise.stats.duration),
                calories: Object.assign({}, exercise.stats.calories),
                completion: Object.assign({}, exercise.stats.completion),
                rating: Object.assign({}, exercise.stats.rating),
                popularity: Object.assign(Object.assign({}, exercise.stats.popularity), { lastUpdated: exercise.stats.popularity.lastUpdated ?
                        (typeof exercise.stats.popularity.lastUpdated === 'object' &&
                            exercise.stats.popularity.lastUpdated instanceof Date ?
                            exercise.stats.popularity.lastUpdated.toISOString() :
                            String(exercise.stats.popularity.lastUpdated)) :
                        undefined })
            };
        }
        let workoutExerciseInfos = undefined;
        if (exercise.workoutExercises && exercise.workoutExercises.length > 0) {
            workoutExerciseInfos = exercise.workoutExercises.map(we => ({
                id: we.id,
                workoutPlanId: we.workout_plan_id,
                order: we.order,
                sets: we.sets,
                repetitions: we.repetitions,
                duration: we.duration,
                restTime: we.restTime,
                setType: we.setType,
                exerciseRole: we.exerciseRole,
                intensity: we.intensity,
                notes: we.notes,
                tempo: we.tempo,
                rangeOfMotion: we.rangeOfMotion,
                progressionStrategy: we.progressionStrategy,
                substitutionOptions: we.substitutionOptions,
                createdAt: we.createdAt,
                updatedAt: we.updatedAt
            }));
        }
        const dto = {
            id: exercise.id,
            name: exercise.name,
            description: exercise.description,
            type: (exercise.types && exercise.types.length > 0) ?
                exercise.types[0] : Enums_1.ExerciseType.STRENGTH_COMPOUND,
            difficulty: exercise.level,
            movementPattern: exercise.movementPattern,
            categories: exercise.categories ?
                exercise.categories.map(c => ({
                    id: String(c.id),
                    name: c.name,
                    description: c.description,
                    type: c.type,
                    icon: c.icon,
                    color: c.color,
                    displayOrder: c.displayOrder
                })) : [],
            equipment: exercise.equipmentOptions ?
                exercise.equipmentOptions.map(e => ({
                    id: String(e.id),
                    name: e.name,
                    description: e.description,
                    category: e.category
                })) : [],
            media: exercise.media ?
                exercise.media.map(m => ({
                    id: String(m.id),
                    type: m.type,
                    url: m.url
                })) : [],
            muscleGroups: {
                primary: primaryMuscles,
                secondary: secondaryMuscles
            },
            createdAt: exercise.createdAt,
            updatedAt: exercise.updatedAt,
            stats: formattedStats,
            measurementType: exercise.measurementType,
            types: exercise.types,
            trackingFeatures: exercise.trackingFeatures,
            targetMuscleGroups: exercise.targetMuscleGroups ?
                exercise.targetMuscleGroups.map(m => String(m)) : [],
            synergistMuscleGroups: exercise.synergistMuscleGroups ?
                exercise.synergistMuscleGroups.map(m => String(m)) : [],
            form: exercise.form,
            aiConfig: exercise.aiConfig,
            workoutExercises: workoutExerciseInfos
        };
        return dto;
    }
    mapToRelationResponseDTO(relation) {
        return {
            id: relation.id,
            sourceExerciseId: relation.base_exercise_id,
            targetExerciseId: relation.related_exercise_id,
            type: relation.relationType,
            description: relation.notes,
            createdAt: relation.createdAt,
            updatedAt: relation.updatedAt
        };
    }
    async getFromCache(key) {
        const start = Date.now();
        try {
            const value = await this.cacheManager.get(key);
            const duration = Date.now() - start;
            if (value) {
                cache_metrics_1.cacheMetrics.recordHit('exercise', duration);
            }
            else {
                cache_metrics_1.cacheMetrics.recordMiss('exercise', duration);
            }
            return value;
        }
        catch (error) {
            cache_metrics_1.cacheMetrics.recordError();
            return null;
        }
    }
    async setCache(key, value, ttl = this.CACHE_TTL) {
        const start = Date.now();
        try {
            await this.cacheManager.set(key, value, ttl);
            const duration = Date.now() - start;
            cache_metrics_1.cacheMetrics.recordSet(duration);
        }
        catch (error) {
            logger_1.default.warn('Cache set error', { key, error: error instanceof Error ? error.message : String(error) });
        }
    }
    async setCacheWithTTL(key, value, ttl) {
        const start = Date.now();
        try {
            await this.cacheManager.set(key, value, ttl);
            const duration = Date.now() - start;
            cache_metrics_1.cacheMetrics.recordSet(duration);
        }
        catch (error) {
            cache_metrics_1.cacheMetrics.recordError();
        }
    }
    async invalidateExerciseCache(exerciseId) {
        try {
            if (exerciseId) {
                await this.cacheManager.del(`exercise:${exerciseId}`);
                await this.cacheManager.del(`exercise:${exerciseId}:media`);
                await this.cacheManager.del(`exercise:${exerciseId}:alternatives`);
                await this.cacheManager.del(`exercise:${exerciseId}:progressions`);
            }
            await this.cacheManager.deleteByPattern('exercise:*');
            await this.cacheManager.deleteByPattern('exercises:*');
            cache_metrics_1.cacheMetrics.recordDelete(0);
        }
        catch (error) {
            cache_metrics_1.cacheMetrics.recordError();
        }
    }
    async getExerciseCategories(filterOptions) {
        try {
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cacheKey = 'exercise:categories:all';
                const cachedCategories = await this.getFromCache(cacheKey);
                if (cachedCategories) {
                    return cachedCategories;
                }
            }
            const queryBuilder = this.categoryRepository.createQueryBuilder('category');
            if (filterOptions) {
                if (filterOptions.search) {
                    queryBuilder.andWhere('category.name ILIKE :search OR category.description ILIKE :search', { search: `%${filterOptions.search}%` });
                }
                if (filterOptions.parentCategoryId) {
                    queryBuilder.andWhere('category.parentCategoryId = :parentId', { parentId: filterOptions.parentCategoryId });
                }
                if (filterOptions.sortBy) {
                    const order = filterOptions.sortOrder === 'DESC' ? 'DESC' : 'ASC';
                    queryBuilder.orderBy(`category.${filterOptions.sortBy}`, order);
                }
                else {
                    queryBuilder.orderBy('category.displayOrder', 'ASC')
                        .addOrderBy('category.name', 'ASC');
                }
                if (filterOptions.page && filterOptions.limit) {
                    queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                        .take(filterOptions.limit);
                }
            }
            else {
                queryBuilder.orderBy('category.displayOrder', 'ASC')
                    .addOrderBy('category.name', 'ASC');
            }
            const [categories, total] = await queryBuilder.getManyAndCount();
            const categoryDTOs = categories.map(category => this.mapToCategoryResponseDTO(category));
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cacheKey = 'exercise:categories:all';
                await this.setCache(cacheKey, [categoryDTOs, total]);
            }
            return [categoryDTOs, total];
        }
        catch (error) {
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get exercise categories', 500, error);
        }
    }
    async getCategoryById(id) {
        try {
            const cacheKey = `exercise:category:${id}`;
            const cachedCategory = await this.getFromCache(cacheKey);
            if (cachedCategory) {
                return cachedCategory;
            }
            const category = await this.categoryRepository.findOne({
                where: { id: id }
            });
            if (!category) {
                return null;
            }
            const categoryDTO = this.mapToCategoryResponseDTO(category);
            await this.setCache(cacheKey, categoryDTO);
            return categoryDTO;
        }
        catch (error) {
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get category', 500, error);
        }
    }
    async createCategory(categoryData) {
        try {
            const category = this.categoryRepository.create(categoryData);
            const savedCategory = await this.categoryRepository.save(category);
            await this.invalidateCategoryCache();
            return this.mapToCategoryResponseDTO(savedCategory);
        }
        catch (error) {
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to create category', 500, error);
        }
    }
    async updateCategory(id, categoryData) {
        try {
            const category = await this.categoryRepository.findOne({
                where: { id: id }
            });
            if (!category) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Category not found', 404);
            }
            Object.assign(category, categoryData);
            const updatedCategory = await this.categoryRepository.save(category);
            await this.invalidateCategoryCache(id);
            return this.mapToCategoryResponseDTO(updatedCategory);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to update category', 500, error);
        }
    }
    async deleteCategory(id) {
        try {
            const category = await this.categoryRepository.findOne({
                where: { id: id },
                relations: ['exercises']
            });
            if (!category) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Category not found', 404);
            }
            if (category.exercises && category.exercises.length > 0) {
                throw new errors_1.AppError(errors_1.ErrorType.BUSINESS_RULE_VIOLATION, 'Cannot delete category that is used by exercises', 400);
            }
            await this.categoryRepository.remove(category);
            await this.invalidateCategoryCache(id);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to delete category', 500, error);
        }
    }
    async findExercisesByCategory(categoryId, options) {
        try {
            const cacheKey = `exercises:category:${categoryId}:${JSON.stringify(options || {})}`;
            const cachedData = await this.getFromCache(cacheKey);
            if (cachedData) {
                return cachedData;
            }
            const page = (options === null || options === void 0 ? void 0 : options.page) ?
                (typeof options.page === 'string' ? parseInt(options.page, 10) : options.page) : 1;
            const limit = (options === null || options === void 0 ? void 0 : options.limit) ?
                (typeof options.limit === 'string' ? parseInt(options.limit, 10) : options.limit) : 20;
            const queryBuilder = this.exerciseRepository
                .createQueryBuilder('exercise')
                .orderBy('exercise.name', 'ASC')
                .skip((page - 1) * limit)
                .take(limit);
            QueryBuilderExtensions_1.QueryBuilderExtensions.whereHasRelation(queryBuilder, 'Exercise', 'categories', categoryId);
            if (options === null || options === void 0 ? void 0 : options.type) {
                queryBuilder.andWhere('exercise.types @> :type', { type: [options.type] });
            }
            if (options === null || options === void 0 ? void 0 : options.difficulty) {
                queryBuilder.andWhere('exercise.level = :level', { level: options.difficulty });
            }
            if (options === null || options === void 0 ? void 0 : options.search) {
                queryBuilder.andWhere(`(exercise.name ILIKE :search OR exercise.description ILIKE :search)`, { search: `%${options.search}%` });
            }
            const [exercises, total] = await queryBuilder.getManyAndCount();
            const exerciseIds = exercises.map(ex => ex.id);
            const [categoriesMap, equipmentMap, mediaMap] = await Promise.all([
                RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('Exercise', 'categories', exerciseIds, this.categoryRepository),
                RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('Exercise', 'equipmentOptions', exerciseIds, this.equipmentRepository),
                RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('Exercise', 'media', exerciseIds, this.mediaRepository)
            ]);
            exercises.forEach(exercise => {
                exercise.categories = categoriesMap.get(exercise.id) || [];
                exercise.equipmentOptions = equipmentMap.get(exercise.id) || [];
                exercise.media = mediaMap.get(exercise.id) || [];
            });
            const responseDTOs = exercises.map(ex => this.mapToResponseDTO(ex));
            const result = [responseDTOs, total];
            await this.setCache(cacheKey, result);
            return result;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, `Failed to find exercises by category: ${error.message}`, 500, error);
        }
    }
    mapToCategoryResponseDTO(category) {
        return {
            id: category.id.toString(),
            name: category.name,
            description: category.description,
            type: category.type,
            icon: category.icon,
            color: category.color,
            displayOrder: category.displayOrder
        };
    }
    async invalidateCategoryCache(categoryId) {
        try {
            if (categoryId) {
                await this.cacheManager.del(`exercise:category:${categoryId}`);
            }
            await this.cacheManager.del('exercise:categories:*');
            cache_metrics_1.cacheMetrics.recordDelete(0);
        }
        catch (error) {
            cache_metrics_1.cacheMetrics.recordError();
        }
    }
    async getEquipmentById(id) {
        try {
            const cacheKey = `exercise:equipment:${id}`;
            const cachedEquipment = await this.getFromCache(cacheKey);
            if (cachedEquipment) {
                return cachedEquipment;
            }
            const equipment = await this.equipmentRepository.findOne({
                where: { id: id },
                relations: [
                    'muscleGroupsTargeted',
                    'trainingTypes',
                    'media'
                ]
            });
            if (!equipment) {
                return null;
            }
            const equipmentDTO = this.mapToEquipmentResponseDTO(equipment);
            await this.setCache(cacheKey, equipmentDTO);
            return equipmentDTO;
        }
        catch (error) {
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get equipment', 500, error);
        }
    }
    async getAllEquipment(filterOptions) {
        try {
            logger_1.default.debug('Getting all equipment with filters:', filterOptions);
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cacheKey = 'exercise:equipment:all';
                const cachedEquipment = await this.getFromCache(cacheKey);
                if (cachedEquipment) {
                    logger_1.default.debug('Returning cached equipment data', { count: cachedEquipment[0].length });
                    return cachedEquipment;
                }
            }
            const queryBuilder = this.equipmentRepository.createQueryBuilder('equipment');
            try {
                if (this.equipmentRepository.metadata.relations.some(rel => rel.propertyName === 'muscleGroupsTargeted')) {
                    queryBuilder.leftJoinAndSelect('equipment.muscleGroupsTargeted', 'muscleGroups');
                }
                if (this.equipmentRepository.metadata.relations.some(rel => rel.propertyName === 'trainingTypes')) {
                    queryBuilder.leftJoinAndSelect('equipment.trainingTypes', 'trainingTypes');
                }
                if (this.equipmentRepository.metadata.relations.some(rel => rel.propertyName === 'media')) {
                    queryBuilder.leftJoinAndSelect('equipment.media', 'media');
                }
            }
            catch (joinError) {
                logger_1.default.warn('Error setting up joins for equipment query', {
                    error: joinError instanceof Error ? joinError.message : String(joinError)
                });
            }
            logger_1.default.debug('Created equipment query builder with joins');
            if (filterOptions) {
                logger_1.default.debug('Applying equipment filters', { filters: filterOptions });
                if (filterOptions.search) {
                    queryBuilder.andWhere('equipment.name ILIKE :search OR equipment.description ILIKE :search', { search: `%${filterOptions.search}%` });
                }
                if (filterOptions.isCommon !== undefined) {
                    queryBuilder.andWhere('equipment.isCommon = :isCommon', { isCommon: filterOptions.isCommon });
                }
                if (filterOptions.category) {
                    queryBuilder.andWhere('equipment.category = :category', { category: filterOptions.category });
                }
                try {
                    const columns = this.equipmentRepository.metadata.columns.map(col => col.propertyName);
                    if (filterOptions.difficulty && columns.includes('difficulty')) {
                        queryBuilder.andWhere('equipment.difficulty = :difficulty', { difficulty: filterOptions.difficulty });
                    }
                    if (filterOptions.costTier && columns.includes('costTier')) {
                        queryBuilder.andWhere('equipment.costTier = :costTier', { costTier: filterOptions.costTier });
                    }
                    if (filterOptions.spaceRequired && columns.includes('spaceRequired')) {
                        queryBuilder.andWhere('equipment.spaceRequired = :spaceRequired', { spaceRequired: filterOptions.spaceRequired });
                    }
                    if (filterOptions.manufacturer && columns.includes('manufacturer')) {
                        queryBuilder.andWhere('equipment.manufacturer ILIKE :manufacturer', { manufacturer: `%${filterOptions.manufacturer}%` });
                    }
                }
                catch (filterError) {
                    logger_1.default.warn('Error applying some filters', {
                        error: filterError instanceof Error ? filterError.message : String(filterError)
                    });
                }
                if (filterOptions.muscleGroup && queryBuilder.expressionMap.joinAttributes.some(join => join.entityOrProperty === 'equipment.muscleGroupsTargeted')) {
                    try {
                        queryBuilder.andWhere('muscleGroups.name ILIKE :muscleGroup', { muscleGroup: `%${filterOptions.muscleGroup}%` });
                    }
                    catch (muscleGroupError) {
                        logger_1.default.warn('Error applying muscle group filter', {
                            error: muscleGroupError instanceof Error ? muscleGroupError.message : String(muscleGroupError)
                        });
                    }
                }
                if (filterOptions.sortBy) {
                    try {
                        const order = filterOptions.sortOrder === 'DESC' ? 'DESC' : 'ASC';
                        queryBuilder.orderBy(`equipment.${filterOptions.sortBy}`, order);
                    }
                    catch (sortError) {
                        logger_1.default.warn('Error applying sort', {
                            error: sortError instanceof Error ? sortError.message : String(sortError)
                        });
                        queryBuilder.orderBy('equipment.name', 'ASC');
                    }
                }
                else {
                    queryBuilder.orderBy('equipment.name', 'ASC');
                }
                if (filterOptions.page && filterOptions.limit) {
                    queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                        .take(filterOptions.limit);
                }
            }
            else {
                queryBuilder.orderBy('equipment.name', 'ASC');
            }
            try {
                const [equipment, total] = await queryBuilder.getManyAndCount();
                logger_1.default.debug(`Retrieved ${equipment.length} equipment items out of ${total}`);
                if (equipment.length === 0) {
                    logger_1.default.warn('No equipment found in database');
                    return [[], 0];
                }
                const equipmentDTOs = equipment.map(eq => this.mapToEquipmentResponseDTO(eq));
                if (!filterOptions || Object.keys(filterOptions).length === 0) {
                    const cacheKey = 'exercise:equipment:all';
                    await this.setCache(cacheKey, [equipmentDTOs, total]);
                    logger_1.default.debug('Cached equipment results');
                }
                return [equipmentDTOs, total];
            }
            catch (queryError) {
                logger_1.default.error('Error executing equipment query', {
                    error: queryError instanceof Error ? queryError.message : String(queryError),
                    stack: queryError instanceof Error ? queryError.stack : undefined
                });
                return [[], 0];
            }
        }
        catch (error) {
            logger_1.default.error('Failed to get equipment', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                filters: filterOptions
            });
            return [[], 0];
        }
    }
    async createEquipment(equipmentData) {
        try {
            const equipmentEntity = {
                name: equipmentData.name,
                description: equipmentData.description || '',
                category: equipmentData.category,
            };
            const equipment = this.equipmentRepository.create(equipmentEntity);
            const savedEquipment = await this.equipmentRepository.save(equipment);
            await this.invalidateEquipmentCache();
            return this.mapToEquipmentResponseDTO(savedEquipment);
        }
        catch (error) {
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to create equipment', 500, error);
        }
    }
    async updateEquipment(id, equipmentData) {
        try {
            const equipment = await this.equipmentRepository.findOne({
                where: { id: id }
            });
            if (!equipment) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Equipment not found', 404);
            }
            Object.assign(equipment, equipmentData);
            const updatedEquipment = await this.equipmentRepository.save(equipment);
            await this.invalidateEquipmentCache(id);
            return this.mapToEquipmentResponseDTO(updatedEquipment);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to update equipment', 500, error);
        }
    }
    async deleteEquipment(id) {
        try {
            const equipment = await this.equipmentRepository.findOne({
                where: { id: id },
                relations: ['exercises']
            });
            if (!equipment) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Equipment not found', 404);
            }
            if (equipment.exercises && equipment.exercises.length > 0) {
                throw new errors_1.AppError(errors_1.ErrorType.BUSINESS_RULE_VIOLATION, 'Cannot delete equipment that is used by exercises', 400);
            }
            await this.equipmentRepository.remove(equipment);
            await this.invalidateEquipmentCache(id);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to delete equipment', 500, error);
        }
    }
    async findExercisesByEquipment(equipmentId, filterOptions) {
        try {
            const cacheKey = `exercises:by-equipment:${equipmentId}`;
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cachedExercises = await this.getFromCache(cacheKey);
                if (cachedExercises) {
                    return cachedExercises;
                }
            }
            const equipment = await this.equipmentRepository.findOne({
                where: { id: equipmentId }
            });
            if (!equipment) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Equipment not found', 404);
            }
            const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise')
                .innerJoin('exercise.equipmentOptions', 'eq', 'eq.id = :equipmentId', { equipmentId })
                .leftJoinAndSelect('exercise.categories', 'categories')
                .leftJoinAndSelect('exercise.media', 'media');
            if (filterOptions) {
                this.applyExerciseFilters(queryBuilder, filterOptions);
            }
            if ((filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.page) && (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.limit)) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            }
            const [exercises, total] = await queryBuilder.getManyAndCount();
            const result = [
                exercises.map(exercise => this.mapToResponseDTO(exercise)),
                total
            ];
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                await this.setCache(cacheKey, result);
            }
            return result;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to find exercises by equipment', 500, error);
        }
    }
    mapToEquipmentResponseDTO(equipment) {
        try {
            if (!equipment) {
                logger_1.default.warn('Attempting to map null or undefined equipment to DTO');
                return {
                    id: 'unknown',
                    name: 'Unknown Equipment',
                    description: '',
                    category: 'OTHER'
                };
            }
            let imageUrl;
            let videoUrl;
            try {
                const media = equipment.media;
                if (media && Array.isArray(media) && media.length > 0) {
                    const image = media.find(m => m && m.type === 'IMAGE');
                    const video = media.find(m => m && m.type === 'VIDEO');
                    if (image && image.url)
                        imageUrl = image.url;
                    if (video && video.url)
                        videoUrl = video.url;
                }
            }
            catch (mediaError) {
                logger_1.default.warn('Error accessing media in equipment mapping', {
                    equipmentId: equipment.id,
                    error: mediaError instanceof Error ? mediaError.message : String(mediaError)
                });
            }
            let muscleGroups = [];
            try {
                if (equipment.muscleGroupsTargeted && Array.isArray(equipment.muscleGroupsTargeted)) {
                    muscleGroups = equipment.muscleGroupsTargeted
                        .filter(mg => mg && mg.id)
                        .map(mg => ({
                        id: String(mg.id),
                        name: mg.name || 'Unknown Muscle',
                        description: mg.description || '',
                        type: mg.type || 'OTHER'
                    }));
                }
            }
            catch (muscleGroupError) {
                logger_1.default.warn('Error mapping muscle groups in equipment', {
                    equipmentId: equipment.id,
                    error: muscleGroupError instanceof Error ? muscleGroupError.message : String(muscleGroupError)
                });
            }
            let trainingTypes = [];
            try {
                if (equipment.trainingTypes && Array.isArray(equipment.trainingTypes)) {
                    trainingTypes = equipment.trainingTypes
                        .filter((tt) => tt && tt.id)
                        .map((tt) => ({
                        id: String(tt.id),
                        name: tt.name || 'Unknown Type'
                    }));
                }
            }
            catch (trainingTypesError) {
                logger_1.default.warn('Error mapping training types in equipment', {
                    equipmentId: equipment.id,
                    error: trainingTypesError instanceof Error ? trainingTypesError.message : String(trainingTypesError)
                });
            }
            logger_1.default.debug(`Mapping equipment with ID ${equipment.id}`, {
                name: equipment.name,
                hasMuscleGroups: !!equipment.muscleGroupsTargeted,
                muscleGroupsCount: equipment.muscleGroupsTargeted ? equipment.muscleGroupsTargeted.length : 0,
                hasMedia: !!(equipment.media && equipment.media.length > 0),
                mediaCount: equipment.media ? equipment.media.length : 0,
                hasImageUrl: !!imageUrl,
                hasVideoUrl: !!videoUrl
            });
            const dto = {
                id: String(equipment.id),
                name: equipment.name || 'Unnamed Equipment',
                description: equipment.description || '',
                category: equipment.category || 'OTHER'
            };
            if (muscleGroups.length > 0)
                dto.muscleGroupsTargeted = muscleGroups;
            if (trainingTypes.length > 0)
                dto.trainingTypes = trainingTypes;
            if (imageUrl)
                dto.imageUrl = imageUrl;
            if (videoUrl)
                dto.videoUrl = videoUrl;
            if (equipment.difficulty)
                dto.difficulty = equipment.difficulty;
            if (equipment.costTier)
                dto.costTier = equipment.costTier;
            if (equipment.spaceRequired)
                dto.spaceRequired = equipment.spaceRequired;
            if (equipment.manufacturer)
                dto.manufacturer = equipment.manufacturer;
            if (equipment.purchaseUrl)
                dto.purchaseUrl = equipment.purchaseUrl;
            if (equipment.estimatedPrice)
                dto.estimatedPrice = equipment.estimatedPrice;
            if (equipment.specifications)
                dto.specifications = equipment.specifications;
            if (equipment.alternatives)
                dto.alternatives = equipment.alternatives;
            if (equipment.createdAt)
                dto.createdAt = equipment.createdAt;
            if (equipment.updatedAt)
                dto.updatedAt = equipment.updatedAt;
            return dto;
        }
        catch (error) {
            logger_1.default.error('Error mapping equipment to DTO', {
                equipmentId: equipment === null || equipment === void 0 ? void 0 : equipment.id,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            return {
                id: (equipment === null || equipment === void 0 ? void 0 : equipment.id) ? String(equipment.id) : 'error',
                name: (equipment === null || equipment === void 0 ? void 0 : equipment.name) || 'Error Equipment',
                description: (equipment === null || equipment === void 0 ? void 0 : equipment.description) || 'An error occurred while loading this equipment',
                category: (equipment === null || equipment === void 0 ? void 0 : equipment.category) || 'OTHER'
            };
        }
    }
    async invalidateEquipmentCache(equipmentId) {
        try {
            if (equipmentId) {
                await this.cacheManager.del(`exercise:equipment:${equipmentId}`);
            }
            await this.cacheManager.del('exercise:equipment:*');
            cache_metrics_1.cacheMetrics.recordDelete(0);
        }
        catch (error) {
            cache_metrics_1.cacheMetrics.recordError();
        }
    }
    async attachMediaToExercise(exerciseId, mediaId) {
        try {
            const [exercise, media] = await Promise.all([
                this.exerciseRepository.findOne({
                    where: { id: exerciseId },
                    relations: ['media']
                }),
                this.mediaRepository.findOne({
                    where: { id: mediaId }
                })
            ]);
            if (!exercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }
            if (!media) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Media not found', 404);
            }
            if (exercise.media && exercise.media.some(m => m.id === mediaId)) {
                throw new errors_1.AppError(errors_1.ErrorType.BUSINESS_RULE_VIOLATION, 'Media is already attached to this exercise', 400);
            }
            if (!exercise.media) {
                exercise.media = [];
            }
            exercise.media.push(media);
            const updatedExercise = await this.exerciseRepository.save(exercise);
            await this.invalidateExerciseCache(exerciseId);
            return this.mapToResponseDTO(updatedExercise);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to attach media to exercise', 500, error);
        }
    }
    async detachMediaFromExercise(exerciseId, mediaId) {
        try {
            const exercise = await this.exerciseRepository.findOne({
                where: { id: exerciseId },
                relations: ['media']
            });
            if (!exercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }
            if (!exercise.media || !exercise.media.some(m => m.id === mediaId)) {
                throw new errors_1.AppError(errors_1.ErrorType.BUSINESS_RULE_VIOLATION, 'Media is not attached to this exercise', 400);
            }
            exercise.media = exercise.media.filter(m => m.id !== mediaId);
            const updatedExercise = await this.exerciseRepository.save(exercise);
            await this.invalidateExerciseCache(exerciseId);
            return this.mapToResponseDTO(updatedExercise);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to detach media from exercise', 500, error);
        }
    }
    async getExerciseMedia(exerciseId) {
        try {
            const cacheKey = `exercise:${exerciseId}:media`;
            const cachedMedia = await this.getFromCache(cacheKey);
            if (cachedMedia) {
                return cachedMedia;
            }
            const exercise = await this.exerciseRepository.findOne({
                where: { id: exerciseId },
                relations: ['media']
            });
            if (!exercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }
            const mediaList = exercise.media ? exercise.media.map(m => this.mapToMediaResponseDTO(m)) : [];
            await this.setCache(cacheKey, mediaList);
            return mediaList;
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get exercise media', 500, error);
        }
    }
    async updateExerciseMediaOrder(exerciseId, mediaOrder) {
        try {
            const exercise = await this.exerciseRepository.findOne({
                where: { id: exerciseId },
                relations: ['media']
            });
            if (!exercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }
            if (!exercise.media || exercise.media.length === 0) {
                throw new errors_1.AppError(errors_1.ErrorType.BUSINESS_RULE_VIOLATION, 'Exercise has no media attached', 400);
            }
            const exerciseMediaIds = exercise.media.map(m => m.id);
            const invalidMediaIds = mediaOrder.filter(id => !exerciseMediaIds.includes(id));
            if (invalidMediaIds.length > 0) {
                throw new errors_1.AppError(errors_1.ErrorType.BUSINESS_RULE_VIOLATION, `Media IDs not attached to exercise: ${invalidMediaIds.join(', ')}`, 400);
            }
            const orderedMedia = mediaOrder.map(id => exercise.media.find(m => m.id === id));
            exercise.media.forEach(media => {
                if (!mediaOrder.includes(media.id)) {
                    orderedMedia.push(media);
                }
            });
            exercise.media = orderedMedia;
            const updatedExercise = await this.exerciseRepository.save(exercise);
            await this.invalidateExerciseCache(exerciseId);
            return this.mapToResponseDTO(updatedExercise);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to update exercise media order', 500, error);
        }
    }
    async setPrimaryExerciseMedia(exerciseId, mediaId) {
        try {
            const exercise = await this.exerciseRepository.findOne({
                where: { id: exerciseId },
                relations: ['media']
            });
            if (!exercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found', 404);
            }
            if (!exercise.media || !exercise.media.some(m => m.id === mediaId)) {
                throw new errors_1.AppError(errors_1.ErrorType.BUSINESS_RULE_VIOLATION, 'Media is not attached to this exercise', 400);
            }
            const primaryMedia = exercise.media.find(m => m.id === mediaId);
            const otherMedia = exercise.media.filter(m => m.id !== mediaId);
            exercise.media = [primaryMedia, ...otherMedia];
            const updatedExercise = await this.exerciseRepository.save(exercise);
            await this.invalidateExerciseCache(exerciseId);
            return this.mapToResponseDTO(updatedExercise);
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to set primary exercise media', 500, error);
        }
    }
    mapToMediaResponseDTO(media) {
        return {
            id: String(media.id),
            type: media.type,
            url: media.url
        };
    }
    async searchExercises(searchQuery, filterOptions) {
        try {
            const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise');
            queryBuilder.where('exercise.name ILIKE :search OR exercise.description ILIKE :search', { search: `%${searchQuery}%` });
            if (filterOptions) {
                this.applyExerciseFilters(queryBuilder, filterOptions);
            }
            if ((filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.page) && (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.limit)) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            }
            else {
                queryBuilder.take(20);
            }
            const [exercises, total] = await queryBuilder.getManyAndCount();
            return [exercises.map(exercise => this.mapToResponseDTO(exercise)), total];
        }
        catch (error) {
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to search exercises', 500, error);
        }
    }
    async getExercisesByMuscleGroup(muscleGroup, filterOptions) {
        try {
            const cacheKey = `exercise:muscle:${muscleGroup}`;
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cachedExercises = await this.getFromCache(cacheKey);
                if (cachedExercises) {
                    return cachedExercises;
                }
            }
            const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise')
                .innerJoin('exercise.categories', 'targetCategory', 'targetCategory.name = :muscleGroup', { muscleGroup });
            if (filterOptions) {
                this.applyExerciseFilters(queryBuilder, filterOptions);
            }
            if ((filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.page) && (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.limit)) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            }
            const [exercises, total] = await queryBuilder.getManyAndCount();
            const result = [
                exercises.map(exercise => this.mapToResponseDTO(exercise)),
                total
            ];
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                await this.setCache(cacheKey, result);
            }
            return result;
        }
        catch (error) {
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get exercises by muscle group', 500, error);
        }
    }
    async getExercisesByDifficulty(difficulty, filterOptions) {
        try {
            const cacheKey = `exercise:difficulty:${difficulty}`;
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cachedExercises = await this.getFromCache(cacheKey);
                if (cachedExercises) {
                    return cachedExercises;
                }
            }
            const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise')
                .where('exercise.level = :difficulty', { difficulty });
            if (filterOptions) {
                const { difficulty: _ } = filterOptions, otherFilters = __rest(filterOptions, ["difficulty"]);
                this.applyExerciseFilters(queryBuilder, otherFilters);
            }
            if ((filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.page) && (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.limit)) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            }
            const [exercises, total] = await queryBuilder.getManyAndCount();
            const result = [
                exercises.map(exercise => this.mapToResponseDTO(exercise)),
                total
            ];
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                await this.setCache(cacheKey, result);
            }
            return result;
        }
        catch (error) {
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get exercises by difficulty', 500, error);
        }
    }
    async getExercisesByMovementPattern(movementPattern, filterOptions) {
        try {
            const cacheKey = `exercise:movement:${movementPattern}`;
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                const cachedExercises = await this.getFromCache(cacheKey);
                if (cachedExercises) {
                    return cachedExercises;
                }
            }
            const queryBuilder = this.exerciseRepository.createQueryBuilder('exercise')
                .where('exercise.movementPattern = :pattern', { pattern: movementPattern });
            if (filterOptions) {
                this.applyExerciseFilters(queryBuilder, filterOptions);
            }
            if ((filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.page) && (filterOptions === null || filterOptions === void 0 ? void 0 : filterOptions.limit)) {
                queryBuilder.skip((filterOptions.page - 1) * filterOptions.limit)
                    .take(filterOptions.limit);
            }
            const [exercises, total] = await queryBuilder.getManyAndCount();
            const result = [
                exercises.map(exercise => this.mapToResponseDTO(exercise)),
                total
            ];
            if (!filterOptions || Object.keys(filterOptions).length === 0) {
                await this.setCache(cacheKey, result);
            }
            return result;
        }
        catch (error) {
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to get exercises by movement pattern', 500, error);
        }
    }
    async getPopularExercises(limit = 10) {
        const cacheKey = `exercises:popular:${limit}`;
        const cachedExercises = await this.cacheManager.get(cacheKey);
        if (cachedExercises) {
            return cachedExercises;
        }
        const exercises = await this.exerciseRepository.find({
            take: limit,
            order: {
                stats: {
                    popularity: {
                        score: 'DESC'
                    }
                }
            }
        });
        const exerciseDTOs = exercises.map(exercise => this.mapToResponseDTO(exercise));
        await this.cacheManager.set(cacheKey, exerciseDTOs, 3600);
        return exerciseDTOs;
    }
    extractDatabaseErrorDetails(error) {
        const details = {
            originalError: error.name || 'DatabaseError'
        };
        if (error.code === '23505') {
            details.constraint = error.constraint;
            details.type = 'UniqueViolation';
            details.message = 'A record with this data already exists';
        }
        if (error.code === '23503') {
            details.constraint = error.constraint;
            details.type = 'ForeignKeyViolation';
            details.message = 'Referenced record does not exist';
        }
        return details;
    }
    applyExerciseFilters(queryBuilder, filterOptions) {
        var _a, _b;
        if (filterOptions.type) {
            queryBuilder.andWhere('exercise.types @> :type', {
                type: [filterOptions.type]
            });
        }
        if (filterOptions.difficulty) {
            queryBuilder.andWhere('exercise.level = :difficulty', {
                difficulty: filterOptions.difficulty
            });
        }
        if (filterOptions.equipment) {
            QueryBuilderExtensions_1.QueryBuilderExtensions.whereHasRelation(queryBuilder, 'Exercise', 'equipmentOptions', filterOptions.equipment);
        }
        if (filterOptions.categoryIds && filterOptions.categoryIds.length > 0) {
            logger_1.default.debug('Filtering exercises by category IDs', { categoryIds: filterOptions.categoryIds });
            queryBuilder.innerJoin('exercise_category', 'ec', 'ec.exercise_id = exercise.id').andWhere('ec.category_id IN (:...categoryIds)', {
                categoryIds: filterOptions.categoryIds
            });
        }
        if (filterOptions.category) {
            logger_1.default.debug('Filtering exercises by category name', { category: filterOptions.category });
            queryBuilder.innerJoin('exercise_category', 'ec', 'ec.exercise_id = exercise.id').innerJoin('exercise_categories', 'cats', 'cats.id = ec.category_id').andWhere('LOWER(cats.name) = LOWER(:category)', {
                category: filterOptions.category
            });
        }
        if (filterOptions.muscleGroup) {
            if ((_b = (_a = queryBuilder.expressionMap.mainAlias) === null || _a === void 0 ? void 0 : _a.metadata) === null || _b === void 0 ? void 0 : _b.findColumnWithPropertyName('targetMuscleGroups')) {
                queryBuilder.andWhere('exercise.targetMuscleGroups LIKE :muscleGroup', {
                    muscleGroup: `%${filterOptions.muscleGroup}%`
                });
            }
            else {
                queryBuilder.andWhere(qb => {
                    const subQuery = qb.subQuery()
                        .select('1')
                        .from(ExerciseCategory_1.ExerciseCategory, 'cat')
                        .innerJoin('exercise_categories_join', 'ecj', 'ecj.category_id = cat.id')
                        .where('ecj.exercise_id = exercise.id')
                        .andWhere('cat.muscleGroup = :muscleGroup', { muscleGroup: filterOptions.muscleGroup });
                    return 'EXISTS ' + subQuery.getQuery();
                });
            }
        }
        if (filterOptions.search) {
            queryBuilder.andWhere('exercise.name ILIKE :search OR exercise.description ILIKE :search', { search: `%${filterOptions.search}%` });
        }
        queryBuilder.orderBy('exercise.name', 'ASC');
    }
};
exports.ExerciseService = ExerciseService;
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ExerciseDTO_1.ExerciseDTO]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "createExercise", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getExerciseById", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "updateExercise", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "deleteExercise", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getAllExercises", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ExerciseDTO_1.ExerciseRelationDTO]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "createExerciseRelation", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getRelatedExercises", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "removeExerciseRelation", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getExerciseAlternatives", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getExerciseProgressions", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 100 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getExerciseCategories", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 100 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getCategoryById", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ExerciseDTO_1.CategoryDTO]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "createCategory", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "updateCategory", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "deleteCategory", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 300 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "findExercisesByCategory", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 100 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getEquipmentById", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getAllEquipment", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ExerciseDTO_1.EquipmentDTO]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "createEquipment", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "updateEquipment", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "deleteEquipment", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "findExercisesByEquipment", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "attachMediaToExercise", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "detachMediaFromExercise", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 100 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getExerciseMedia", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "updateExerciseMediaOrder", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "setPrimaryExerciseMedia", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 300 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "searchExercises", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getExercisesByMuscleGroup", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getExercisesByDifficulty", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getExercisesByMovementPattern", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ExerciseService.prototype, "getPopularExercises", null);
exports.ExerciseService = ExerciseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Exercise_1.Exercise)),
    __param(1, (0, typeorm_1.InjectRepository)(ExerciseCategory_1.ExerciseCategory)),
    __param(2, (0, typeorm_1.InjectRepository)(Equipment_1.Equipment)),
    __param(3, (0, typeorm_1.InjectRepository)(Media_1.Media)),
    __param(4, (0, typeorm_1.InjectRepository)(ExerciseRelation_1.ExerciseRelation)),
    __param(5, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], ExerciseService);
//# sourceMappingURL=ExerciseService.js.map