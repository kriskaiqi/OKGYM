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
exports.WorkoutPlanService = void 0;
const WorkoutExercise_1 = require("../models/WorkoutExercise");
const WorkoutPlanRepository_1 = require("../repositories/WorkoutPlanRepository");
const WorkoutExerciseRepository_1 = require("../repositories/WorkoutExerciseRepository");
const ExerciseRepository_1 = require("../repositories/ExerciseRepository");
const errors_1 = require("../utils/errors");
const transaction_helper_1 = require("../utils/transaction-helper");
const performance_1 = require("../utils/performance");
const logger_1 = __importDefault(require("../utils/logger"));
const Enums_1 = require("../models/shared/Enums");
const CacheManager_1 = require("./CacheManager");
const RelationshipLoader_1 = require("../utils/RelationshipLoader");
const data_source_1 = require("../data-source");
const WorkoutTag_1 = require("../models/WorkoutTag");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const Equipment_1 = require("../models/Equipment");
function idToString(id) {
    return (id === null || id === void 0 ? void 0 : id.toString()) || '';
}
class WorkoutPlanService {
    constructor(workoutPlanRepo = new WorkoutPlanRepository_1.WorkoutPlanRepository(), workoutExerciseRepo = new WorkoutExerciseRepository_1.WorkoutExerciseRepository(), exerciseRepo = new ExerciseRepository_1.ExerciseRepository(), cacheTTL = 3600) {
        this.workoutPlanRepo = workoutPlanRepo;
        this.workoutExerciseRepo = workoutExerciseRepo;
        this.exerciseRepo = exerciseRepo;
        this.cacheTTL = cacheTTL;
        this.tagRepository = data_source_1.AppDataSource.getRepository(WorkoutTag_1.WorkoutTag);
        this.categoryRepository = data_source_1.AppDataSource.getRepository(ExerciseCategory_1.ExerciseCategory);
        this.equipmentRepository = data_source_1.AppDataSource.getRepository(Equipment_1.Equipment);
    }
    async createWorkoutPlan(data, userId) {
        try {
            return await (0, transaction_helper_1.executeTransaction)(async (queryRunner) => {
                var _a;
                if (!data.name || !data.description) {
                    throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Name and description are required', 400);
                }
                const workoutPlan = await this.workoutPlanRepo.create(Object.assign(Object.assign({}, data), { creator_id: userId, isCustom: true, difficulty: data.difficulty || Enums_1.Difficulty.BEGINNER, workoutCategory: data.workoutCategory || Enums_1.WorkoutCategory.FULL_BODY, estimatedDuration: data.estimatedDuration || 30 }));
                if ((_a = data.exercises) === null || _a === void 0 ? void 0 : _a.length) {
                    const exercises = data.exercises.map((ex, idx) => (Object.assign({ workoutPlan: { id: workoutPlan.id }, exercise_id: ex.exercise_id || ex.exerciseId, order: ex.order || idx, sets: ex.sets || 1, repetitions: ex.repetitions || 0, duration: ex.duration || 0, restTime: ex.restTime || 30 }, ex)));
                    await queryRunner.manager.save(WorkoutExercise_1.WorkoutExercise, exercises);
                }
                logger_1.default.info(`Created workout plan: ${workoutPlan.name}`, { userId, workoutPlanId: workoutPlan.id });
                return this.workoutPlanRepo.findById(workoutPlan.id);
            });
        }
        catch (error) {
            this.handleError(error, 'Failed to create workout plan', { userId });
        }
    }
    async getWorkoutPlanById(id, userId) {
        try {
            const cacheKey = `workout-plan:${id}`;
            const cachedPlan = await CacheManager_1.cacheManager.get(cacheKey);
            if (cachedPlan)
                return cachedPlan;
            const workoutPlan = await this.workoutPlanRepo.findById(id);
            if (!workoutPlan) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Workout plan with ID ${id} not found`, 404);
            }
            if (userId && workoutPlan.isCustom && workoutPlan.creator_id !== userId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'Access denied', 403);
            }
            const [tags, targetMuscleGroups, equipmentNeeded] = await Promise.all([
                RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutPlan', 'tags', id, this.tagRepository),
                RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutPlan', 'targetMuscleGroups', id, this.categoryRepository),
                RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutPlan', 'equipmentNeeded', id, this.equipmentRepository)
            ]);
            workoutPlan.tags = tags;
            workoutPlan.targetMuscleGroups = targetMuscleGroups;
            workoutPlan.equipmentNeeded = equipmentNeeded;
            await CacheManager_1.cacheManager.set(cacheKey, workoutPlan, { ttl: this.cacheTTL });
            return workoutPlan;
        }
        catch (error) {
            this.handleError(error, 'Failed to get workout plan', { id, userId });
        }
    }
    async updateWorkoutPlan(id, data, userId) {
        try {
            return await (0, transaction_helper_1.executeTransaction)(async () => {
                const existingPlan = await this.workoutPlanRepo.findById(id);
                if (!existingPlan) {
                    throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Workout plan with ID ${id} not found`, 404);
                }
                if (existingPlan.isCustom && existingPlan.creator_id !== userId) {
                    throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'Update denied', 403);
                }
                const { exercises } = data, planData = __rest(data, ["exercises"]);
                await this.workoutPlanRepo.update(id, planData);
                if (exercises === null || exercises === void 0 ? void 0 : exercises.length) {
                    await this.updateWorkoutExercises(id, exercises);
                }
                await this.invalidateWorkoutPlanCache(id);
                logger_1.default.info(`Updated workout plan: ${existingPlan.name}`, { userId, id });
                return this.workoutPlanRepo.findById(id);
            });
        }
        catch (error) {
            this.handleError(error, 'Failed to update workout plan', { id, userId });
        }
    }
    async deleteWorkoutPlan(id, userId) {
        try {
            const existingPlan = await this.workoutPlanRepo.findById(id);
            if (!existingPlan) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Workout plan with ID ${id} not found`, 404);
            }
            if (existingPlan.isCustom && existingPlan.creator_id !== userId) {
                throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'Delete denied', 403);
            }
            await this.workoutPlanRepo.delete(id);
            await this.invalidateWorkoutPlanCache(id);
            logger_1.default.info(`Deleted workout plan: ${existingPlan.name}`, { userId, id });
            return true;
        }
        catch (error) {
            this.handleError(error, 'Failed to delete workout plan', { id, userId });
        }
    }
    async getWorkoutPlans(filters, userId) {
        var _a;
        try {
            if (userId && !filters.creatorId && filters.userPlansOnly) {
                filters.creatorId = userId;
            }
            const isCacheable = !filters.searchTerm && !filters.creatorId && !((_a = filters.tagIds) === null || _a === void 0 ? void 0 : _a.length);
            const cacheKey = isCacheable ? `workout-plans:${JSON.stringify(filters)}` : null;
            if (cacheKey) {
                const cached = await CacheManager_1.cacheManager.get(cacheKey);
                if (cached)
                    return cached;
            }
            const [plans, count] = await this.workoutPlanRepo.findWithFilters(filters);
            if (plans.length) {
                const planIds = plans.map(plan => plan.id);
                const [tagsMap, targetMuscleGroupsMap, equipmentMap] = await Promise.all([
                    RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('WorkoutPlan', 'tags', planIds, this.tagRepository),
                    RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('WorkoutPlan', 'targetMuscleGroups', planIds, this.categoryRepository),
                    RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('WorkoutPlan', 'equipmentNeeded', planIds, this.equipmentRepository)
                ]);
                plans.forEach(plan => {
                    plan.tags = tagsMap.get(plan.id) || [];
                    plan.targetMuscleGroups = targetMuscleGroupsMap.get(plan.id) || [];
                    plan.equipmentNeeded = equipmentMap.get(plan.id) || [];
                });
            }
            if (cacheKey) {
                await CacheManager_1.cacheManager.set(cacheKey, [plans, count], { ttl: this.cacheTTL });
            }
            return [plans, count];
        }
        catch (error) {
            this.handleError(error, 'Failed to get workout plans', { filters });
        }
    }
    async addExerciseToWorkoutPlan(workoutPlanId, exerciseData, userId) {
        try {
            return await (0, transaction_helper_1.executeTransaction)(async () => {
                const workoutPlan = await this.getWorkoutPlanById(workoutPlanId, userId);
                if (!exerciseData.exercise_id) {
                    throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Exercise ID required', 400);
                }
                const exercise = await this.exerciseRepo.findById(exerciseData.exercise_id);
                if (!exercise) {
                    throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Exercise with ID ${exerciseData.exercise_id} not found`, 404);
                }
                const exercises = workoutPlan.exercises || [];
                const nextOrder = exercises.length ? Math.max(...exercises.map(e => e.order)) + 1 : 0;
                await this.workoutExerciseRepo.create(Object.assign({ workoutPlan: { id: workoutPlanId }, exercise_id: exerciseData.exercise_id, order: exerciseData.order || nextOrder, sets: exerciseData.sets || 1, repetitions: exerciseData.repetitions || 0, duration: exerciseData.duration || 0, restTime: exerciseData.restTime || 30 }, exerciseData));
                await this.invalidateWorkoutPlanCache(workoutPlanId);
                return this.getWorkoutPlanById(workoutPlanId, userId);
            });
        }
        catch (error) {
            this.handleError(error, 'Failed to add exercise to workout plan', { workoutPlanId, userId });
        }
    }
    async updateExerciseInWorkoutPlan(workoutPlanId, exerciseId, exerciseData, userId) {
        var _a;
        try {
            const workoutPlan = await this.getWorkoutPlanById(workoutPlanId, userId);
            const foundExercise = (_a = workoutPlan.exercises) === null || _a === void 0 ? void 0 : _a.find(e => idToString(e.id) === idToString(exerciseId));
            if (!foundExercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Exercise with ID ${exerciseId} not found in workout plan`, 404);
            }
            await this.workoutExerciseRepo.update(exerciseId, Object.assign(Object.assign({}, exerciseData), { workoutPlan: { id: workoutPlanId } }));
            await this.invalidateWorkoutPlanCache(workoutPlanId);
            return this.getWorkoutPlanById(workoutPlanId, userId);
        }
        catch (error) {
            this.handleError(error, 'Failed to update exercise in workout plan', { workoutPlanId, exerciseId, userId });
        }
    }
    async removeExerciseFromWorkoutPlan(workoutPlanId, exerciseId, userId) {
        var _a;
        try {
            const workoutPlan = await this.getWorkoutPlanById(workoutPlanId, userId);
            const foundExercise = (_a = workoutPlan.exercises) === null || _a === void 0 ? void 0 : _a.find(e => idToString(e.id) === idToString(exerciseId));
            if (!foundExercise) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Exercise with ID ${exerciseId} not found in workout plan`, 404);
            }
            await this.workoutExerciseRepo.delete(exerciseId);
            await this.invalidateWorkoutPlanCache(workoutPlanId);
            return this.getWorkoutPlanById(workoutPlanId, userId);
        }
        catch (error) {
            this.handleError(error, 'Failed to remove exercise from workout plan', { workoutPlanId, exerciseId, userId });
        }
    }
    async reorderExercisesInWorkoutPlan(workoutPlanId, exerciseOrders, userId) {
        try {
            return await (0, transaction_helper_1.executeTransaction)(async () => {
                var _a;
                const workoutPlan = await this.getWorkoutPlanById(workoutPlanId, userId);
                const exercisesMap = new Map(((_a = workoutPlan.exercises) === null || _a === void 0 ? void 0 : _a.map(ex => [idToString(ex.id), ex])) || []);
                for (const { id, order } of exerciseOrders) {
                    if (exercisesMap.has(idToString(id))) {
                        await this.workoutExerciseRepo.update(id, { order });
                    }
                }
                await this.invalidateWorkoutPlanCache(workoutPlanId);
                return this.getWorkoutPlanById(workoutPlanId, userId);
            });
        }
        catch (error) {
            this.handleError(error, 'Failed to reorder exercises', { workoutPlanId, userId });
        }
    }
    async updateWorkoutExercises(workoutPlanId, exercises) {
        var _a;
        const existingExercises = await this.workoutExerciseRepo.findByWorkoutPlan(workoutPlanId);
        const existingIds = new Set(existingExercises.map(e => e.id));
        for (const exercise of exercises) {
            if (exercise.id && existingIds.has(exercise.id)) {
                await this.workoutExerciseRepo.update(exercise.id, Object.assign(Object.assign({}, exercise), { workoutPlan: { id: workoutPlanId } }));
                existingIds.delete(exercise.id);
            }
            else {
                await this.workoutExerciseRepo.create(Object.assign(Object.assign({}, exercise), { workoutPlan: { id: workoutPlanId }, exercise_id: exercise.exercise_id, order: exercise.order || 0, sets: exercise.sets || 1 }));
            }
        }
        if (exercises.length && ((_a = exercises[0]) === null || _a === void 0 ? void 0 : _a.deleteRemaining)) {
            for (const id of existingIds) {
                await this.workoutExerciseRepo.delete(id);
            }
        }
    }
    async invalidateWorkoutPlanCache(workoutPlanId) {
        try {
            await Promise.all([
                CacheManager_1.cacheManager.delete(`workout-plan:${workoutPlanId}`),
                ...Array.from({ length: 10 }, (_, i) => CacheManager_1.cacheManager.delete(`workout-plans-page-${i}`))
            ]);
        }
        catch (error) {
            logger_1.default.warn(`Cache invalidation error: ${error.message}`, { workoutPlanId });
        }
    }
    handleError(error, message, context) {
        if (error instanceof errors_1.AppError)
            throw error;
        logger_1.default.error(message, Object.assign({ error: error instanceof Error ? error.message : String(error) }, context));
        throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, message, 500);
    }
}
exports.WorkoutPlanService = WorkoutPlanService;
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 300 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkoutPlanService.prototype, "createWorkoutPlan", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkoutPlanService.prototype, "getWorkoutPlanById", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 250 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], WorkoutPlanService.prototype, "updateWorkoutPlan", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkoutPlanService.prototype, "deleteWorkoutPlan", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 300 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkoutPlanService.prototype, "getWorkoutPlans", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], WorkoutPlanService.prototype, "addExerciseToWorkoutPlan", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object, String]),
    __metadata("design:returntype", Promise)
], WorkoutPlanService.prototype, "updateExerciseInWorkoutPlan", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], WorkoutPlanService.prototype, "removeExerciseFromWorkoutPlan", null);
__decorate([
    (0, performance_1.SimpleTrack)({ slowThreshold: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, String]),
    __metadata("design:returntype", Promise)
], WorkoutPlanService.prototype, "reorderExercisesInWorkoutPlan", null);
//# sourceMappingURL=WorkoutPlanService.js.map