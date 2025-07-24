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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutSessionService = void 0;
const models_1 = require("../models");
const WorkoutSession_1 = require("../models/WorkoutSession");
const WorkoutSessionRepository_1 = require("../repositories/WorkoutSessionRepository");
const WorkoutPlanRepository_1 = require("../repositories/WorkoutPlanRepository");
const ExerciseRepository_1 = require("../repositories/ExerciseRepository");
const Enums_1 = require("../models/shared/Enums");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const performance_1 = require("../utils/performance");
const transaction_helper_1 = require("../utils/transaction-helper");
const CacheManager_1 = require("../services/CacheManager");
class WorkoutSessionService {
    constructor(sessionRepo = new WorkoutSessionRepository_1.WorkoutSessionRepository(), workoutPlanRepo = new WorkoutPlanRepository_1.WorkoutPlanRepository(), exerciseRepo = new ExerciseRepository_1.ExerciseRepository()) {
        this.sessionRepo = sessionRepo;
        this.workoutPlanRepo = workoutPlanRepo;
        this.exerciseRepo = exerciseRepo;
    }
    async startSession(userId, workoutPlanId) {
        try {
            logger_1.default.info(`Starting workout session for user ${userId} with workout plan ${workoutPlanId}`);
            const workoutPlan = await this.workoutPlanRepo.findById(workoutPlanId);
            if (!workoutPlan) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Workout plan not found', 404);
            }
            const workoutPlanWithExercises = await this.workoutPlanRepo.findOne({
                where: { id: workoutPlanId.toString() },
                relations: ['exercises', 'exercises.exercise']
            });
            if (!workoutPlanWithExercises || !workoutPlanWithExercises.exercises || workoutPlanWithExercises.exercises.length === 0) {
                throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Workout plan has no exercises', 400);
            }
            const exerciseSequence = new WorkoutSession_1.ExerciseSequence();
            exerciseSequence.originalPlan = workoutPlanWithExercises.exercises.map(exercise => {
                const plannedExercise = new WorkoutSession_1.PlannedExercise();
                plannedExercise.exerciseId = exercise.exercise.id;
                plannedExercise.order = exercise.order;
                plannedExercise.targetRepetitions = exercise.repetitions;
                plannedExercise.targetDuration = exercise.duration;
                plannedExercise.targetSets = exercise.sets;
                plannedExercise.restTime = exercise.restTime;
                plannedExercise.notes = exercise.notes;
                return plannedExercise;
            });
            const session = new models_1.WorkoutSession();
            session.user = { id: userId };
            session.workoutPlan = workoutPlan;
            session.status = Enums_1.SessionStatus.ACTIVE;
            session.startTime = new Date();
            session.exerciseSequence = exerciseSequence;
            session.exerciseResults = {};
            session.summary = new WorkoutSession_1.WorkoutSummary();
            session.summary.totalExercises = exerciseSequence.originalPlan.length;
            session.summary.uniqueExercises = new Set(exerciseSequence.originalPlan.map(e => e.exerciseId)).size;
            const savedSession = await this.sessionRepo.save(session);
            if (Array.isArray(savedSession)) {
                return savedSession[0];
            }
            return savedSession;
        }
        catch (error) {
            logger_1.default.error('Error starting workout session:', error);
            throw error;
        }
    }
    async recordExerciseCompletion(sessionId, exerciseId, result) {
        try {
            logger_1.default.info(`Recording exercise completion for session ${sessionId}, exercise ${exerciseId}`);
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
            }
            if (session.status !== Enums_1.SessionStatus.ACTIVE) {
                throw new errors_1.AppError(errors_1.ErrorType.OPERATION_NOT_ALLOWED, 'Session is not active', 400);
            }
            return await (0, transaction_helper_1.executeTransaction)(async (entityManager) => {
                const attempt = new WorkoutSession_1.ExerciseAttempt();
                attempt.timestamp = new Date();
                attempt.repetitions = result.repetitions || 0;
                attempt.duration = result.duration || 0;
                attempt.formScore = result.formScore;
                attempt.weight = result.weight;
                attempt.resistance = result.resistance;
                attempt.notes = result.notes;
                if (!session.exerciseResults[exerciseId]) {
                    session.exerciseResults[exerciseId] = new WorkoutSession_1.ExerciseResult();
                }
                const exerciseResult = session.exerciseResults[exerciseId];
                exerciseResult.attempts.push(attempt);
                if (!exerciseResult.bestResult) {
                    exerciseResult.bestResult = new WorkoutSession_1.BestResult();
                }
                if (attempt.repetitions > (exerciseResult.bestResult.reps || 0)) {
                    exerciseResult.bestResult.reps = attempt.repetitions;
                }
                if (attempt.duration > (exerciseResult.bestResult.duration || 0)) {
                    exerciseResult.bestResult.duration = attempt.duration;
                }
                if (attempt.weight && (!exerciseResult.bestResult.weight || attempt.weight > exerciseResult.bestResult.weight)) {
                    exerciseResult.bestResult.weight = attempt.weight;
                }
                const plannedExercise = session.exerciseSequence.originalPlan.find(e => e.exerciseId === exerciseId);
                let actualExercise = session.exerciseSequence.actualSequence.find(e => e.exerciseId === exerciseId);
                if (!actualExercise) {
                    actualExercise = new WorkoutSession_1.ActualExercise();
                    actualExercise.exerciseId = exerciseId;
                    actualExercise.order = (plannedExercise === null || plannedExercise === void 0 ? void 0 : plannedExercise.order) || 0;
                    actualExercise.startTime = new Date();
                    actualExercise.status = Enums_1.ExerciseStatus.ACTIVE;
                    session.exerciseSequence.actualSequence.push(actualExercise);
                }
                const attempts = result.attempts || [];
                actualExercise.completedSets = attempts.length;
                if (plannedExercise && actualExercise.completedSets >= plannedExercise.targetSets) {
                    actualExercise.status = Enums_1.ExerciseStatus.COMPLETED;
                    actualExercise.endTime = new Date();
                }
                const updatedSession = await this.sessionRepo.save(session);
                if (Array.isArray(updatedSession)) {
                    return updatedSession[0];
                }
                return updatedSession;
            });
        }
        catch (error) {
            logger_1.default.error('Error recording exercise completion:', error);
            throw error;
        }
    }
    async skipExercise(sessionId, exerciseId, reason) {
        try {
            logger_1.default.info(`Skipping exercise ${exerciseId} in session ${sessionId}`);
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
            }
            if (session.status !== Enums_1.SessionStatus.ACTIVE) {
                throw new errors_1.AppError(errors_1.ErrorType.OPERATION_NOT_ALLOWED, 'Session is not active', 400);
            }
            return await (0, transaction_helper_1.executeTransaction)(async (entityManager) => {
                const plannedExercise = session.exerciseSequence.originalPlan.find(e => e.exerciseId === exerciseId);
                if (!plannedExercise) {
                    throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found in workout plan', 404);
                }
                let actualExercise = session.exerciseSequence.actualSequence.find(e => e.exerciseId === exerciseId);
                if (!actualExercise) {
                    actualExercise = new WorkoutSession_1.ActualExercise();
                    actualExercise.exerciseId = exerciseId;
                    actualExercise.order = plannedExercise.order;
                    actualExercise.startTime = new Date();
                    session.exerciseSequence.actualSequence.push(actualExercise);
                }
                actualExercise.status = Enums_1.ExerciseStatus.SKIPPED;
                actualExercise.endTime = new Date();
                actualExercise.notes = reason || 'Exercise skipped by user';
                const updatedSession = await this.sessionRepo.save(session);
                if (Array.isArray(updatedSession)) {
                    return updatedSession[0];
                }
                return updatedSession;
            });
        }
        catch (error) {
            logger_1.default.error('Error skipping exercise:', error);
            throw error;
        }
    }
    async pauseSession(sessionId, data) {
        var _a;
        try {
            logger_1.default.info(`Pausing workout session ${sessionId}`);
            logger_1.default.info(`Pause data received: duration=${data === null || data === void 0 ? void 0 : data.duration}, caloriesBurned=${data === null || data === void 0 ? void 0 : data.caloriesBurned}`);
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
            }
            if (session.status !== Enums_1.SessionStatus.ACTIVE) {
                throw new errors_1.AppError(errors_1.ErrorType.OPERATION_NOT_ALLOWED, 'Session is not active', 400);
            }
            session.status = Enums_1.SessionStatus.PAUSED;
            if ((data === null || data === void 0 ? void 0 : data.duration) !== undefined) {
                session.totalDuration = data.duration;
                logger_1.default.info(`Using provided totalDuration: ${data.duration} seconds`);
            }
            else if (session.startTime) {
                const now = new Date();
                const calculatedDuration = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
                session.totalDuration = calculatedDuration;
                logger_1.default.info(`Calculated totalDuration: ${calculatedDuration} seconds`);
            }
            if ((data === null || data === void 0 ? void 0 : data.caloriesBurned) !== undefined) {
                session.caloriesBurned = data.caloriesBurned;
                logger_1.default.info(`Using provided caloriesBurned: ${data.caloriesBurned}`);
            }
            else {
                session.caloriesBurned = this.calculateCaloriesBurned(session);
                logger_1.default.info(`Calculated caloriesBurned: ${session.caloriesBurned}`);
            }
            for (const plannedExercise of session.exerciseSequence.originalPlan) {
                const exerciseId = plannedExercise.exerciseId;
                const alreadyInActual = session.exerciseSequence.actualSequence.some(e => e.exerciseId === exerciseId);
                if (!alreadyInActual) {
                    const actualExercise = new WorkoutSession_1.ActualExercise();
                    actualExercise.exerciseId = exerciseId;
                    actualExercise.order = plannedExercise.order;
                    actualExercise.status = Enums_1.ExerciseStatus.PENDING;
                    session.exerciseSequence.actualSequence.push(actualExercise);
                }
            }
            if (session.exerciseResults &&
                (!session.exerciseSequence.actualSequence || session.exerciseSequence.actualSequence.length === 0)) {
                logger_1.default.info(`Rebuilding actualSequence from exerciseResults for session ${sessionId}`);
                try {
                    const exerciseResults = typeof session.exerciseResults === 'string'
                        ? JSON.parse(session.exerciseResults)
                        : session.exerciseResults;
                    Object.entries(exerciseResults).forEach(([exerciseId, resultValue], index) => {
                        const result = resultValue;
                        const plannedExercise = session.exerciseSequence.originalPlan.find(p => p.exerciseId === exerciseId);
                        const actualExercise = new WorkoutSession_1.ActualExercise();
                        actualExercise.exerciseId = exerciseId;
                        actualExercise.order = (plannedExercise === null || plannedExercise === void 0 ? void 0 : plannedExercise.order) || (index + 1);
                        actualExercise.startTime = new Date();
                        const attempts = result.attempts || [];
                        actualExercise.completedSets = attempts.length;
                        if (plannedExercise && attempts.length >= plannedExercise.targetSets) {
                            actualExercise.status = Enums_1.ExerciseStatus.COMPLETED;
                            actualExercise.endTime = new Date();
                        }
                        else if (attempts.length > 0) {
                            actualExercise.status = Enums_1.ExerciseStatus.ACTIVE;
                        }
                        else {
                            actualExercise.status = Enums_1.ExerciseStatus.PENDING;
                        }
                        if (!session.exerciseSequence.actualSequence.some(e => e.exerciseId === exerciseId)) {
                            session.exerciseSequence.actualSequence.push(actualExercise);
                        }
                    });
                }
                catch (error) {
                    logger_1.default.error(`Error rebuilding actualSequence from exerciseResults: ${error}`);
                }
            }
            await this.generateSessionSummary(session);
            const updatedSession = await this.sessionRepo.save(session);
            const userId = session.userId || ((_a = session.user) === null || _a === void 0 ? void 0 : _a.id);
            if (userId) {
                await CacheManager_1.cacheManager.delete(`user:profile:${userId}`);
                await CacheManager_1.cacheManager.delete(`user:${userId}`);
                await CacheManager_1.cacheManager.delete(`user:${userId}:progress`);
                await CacheManager_1.cacheManager.delete(`user:${userId}:stats`);
                await CacheManager_1.cacheManager.delete(`user:${userId}:workoutSessions:direct`);
                await CacheManager_1.cacheManager.deleteByPattern(`user:${userId}:*`);
                logger_1.default.debug(`Invalidated caches for user ${userId}`);
            }
            if (Array.isArray(updatedSession)) {
                return updatedSession[0];
            }
            return updatedSession;
        }
        catch (error) {
            logger_1.default.error('Error pausing workout session:', error);
            throw error;
        }
    }
    async resumeSession(sessionId) {
        try {
            logger_1.default.info(`Resuming workout session ${sessionId}`);
            const session = await this.sessionRepo.findOne({
                where: { id: sessionId },
                relations: ['user', 'workoutPlan']
            });
            if (!session) {
                logger_1.default.error(`Session not found: ${sessionId}`);
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
            }
            logger_1.default.info(`Current session state: ${sessionId} [${session.status}]`);
            if (session.status !== Enums_1.SessionStatus.PAUSED) {
                logger_1.default.error(`Cannot resume session in ${session.status} state: ${sessionId}`);
                throw new errors_1.AppError(errors_1.ErrorType.OPERATION_NOT_ALLOWED, `Session is not paused (current state: ${session.status})`, 400);
            }
            session.status = Enums_1.SessionStatus.ACTIVE;
            session.startTime = new Date();
            logger_1.default.info(`Saving resumed session ${sessionId}`);
            await this.sessionRepo.save(session);
            logger_1.default.info(`Loading complete session data for ${sessionId}`);
            const fullSession = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!fullSession) {
                logger_1.default.error(`Failed to load complete session data for ${sessionId}`);
                throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to load session after resume', 500);
            }
            if (!fullSession.workoutPlan) {
                logger_1.default.warn(`Resumed session ${sessionId} missing workout plan, attempting to load it`);
                try {
                    const workoutPlan = await this.workoutPlanRepo.findOne({
                        where: { id: fullSession.workoutPlanId }
                    });
                    if (workoutPlan) {
                        fullSession.workoutPlan = workoutPlan;
                        logger_1.default.info(`Successfully loaded workout plan for session ${sessionId}`);
                    }
                    else {
                        logger_1.default.error(`Could not find workout plan with ID ${fullSession.workoutPlanId}`);
                    }
                }
                catch (error) {
                    logger_1.default.error(`Error loading workout plan for session ${sessionId}: ${error.message}`);
                }
            }
            if (!fullSession.exerciseSequence) {
                logger_1.default.warn(`Session ${sessionId} missing exercise sequence, creating empty one`);
                fullSession.exerciseSequence = {
                    originalPlan: [],
                    actualSequence: []
                };
            }
            logger_1.default.info(`Successfully resumed session ${sessionId}`);
            return fullSession;
        }
        catch (error) {
            logger_1.default.error(`Error resuming workout session ${sessionId}:`, error);
            throw error;
        }
    }
    async completeSession(sessionId, data) {
        try {
            logger_1.default.info(`Completing workout session ${sessionId}`);
            logger_1.default.info(`Complete data received: duration=${data === null || data === void 0 ? void 0 : data.duration}, caloriesBurned=${data === null || data === void 0 ? void 0 : data.caloriesBurned}`);
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
            }
            if (session.status !== Enums_1.SessionStatus.ACTIVE && session.status !== Enums_1.SessionStatus.PAUSED) {
                throw new errors_1.AppError(errors_1.ErrorType.OPERATION_NOT_ALLOWED, 'Session cannot be completed', 400);
            }
            return await (0, transaction_helper_1.executeTransaction)(async (entityManager) => {
                var _a;
                session.status = Enums_1.SessionStatus.COMPLETED;
                session.endTime = new Date();
                if ((data === null || data === void 0 ? void 0 : data.duration) !== undefined) {
                    session.totalDuration = data.duration;
                    logger_1.default.info(`Using provided totalDuration: ${data.duration} seconds`);
                }
                else if (session.startTime) {
                    const additionalDuration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
                    session.totalDuration += additionalDuration;
                    logger_1.default.info(`Calculated totalDuration: ${additionalDuration} seconds`);
                }
                if ((data === null || data === void 0 ? void 0 : data.caloriesBurned) !== undefined) {
                    session.caloriesBurned = data.caloriesBurned;
                    logger_1.default.info(`Using provided caloriesBurned: ${data.caloriesBurned}`);
                }
                else {
                    session.caloriesBurned = this.calculateCaloriesBurned(session);
                    logger_1.default.info(`Calculated caloriesBurned: ${session.caloriesBurned}`);
                }
                for (const plannedExercise of session.exerciseSequence.originalPlan) {
                    const exerciseId = plannedExercise.exerciseId;
                    const alreadyInActual = session.exerciseSequence.actualSequence.some(e => e.exerciseId === exerciseId);
                    if (!alreadyInActual) {
                        const actualExercise = new WorkoutSession_1.ActualExercise();
                        actualExercise.exerciseId = exerciseId;
                        actualExercise.order = plannedExercise.order;
                        actualExercise.status = Enums_1.ExerciseStatus.PENDING;
                        session.exerciseSequence.actualSequence.push(actualExercise);
                    }
                }
                session.caloriesBurned = this.calculateCaloriesBurned(session);
                await this.generateSessionSummary(session);
                const updatedSession = await this.sessionRepo.save(session);
                const userId = session.userId || ((_a = session.user) === null || _a === void 0 ? void 0 : _a.id);
                if (userId) {
                    await CacheManager_1.cacheManager.delete(`user:profile:${userId}`);
                    await CacheManager_1.cacheManager.delete(`user:${userId}`);
                    await CacheManager_1.cacheManager.delete(`user:${userId}:progress`);
                    await CacheManager_1.cacheManager.delete(`user:${userId}:stats`);
                    await CacheManager_1.cacheManager.delete(`user:${userId}:workoutSessions:direct`);
                    await CacheManager_1.cacheManager.deleteByPattern(`user:${userId}:*`);
                    logger_1.default.debug(`Invalidated caches for user ${userId}`);
                }
                if (Array.isArray(updatedSession)) {
                    return updatedSession[0];
                }
                return updatedSession;
            });
        }
        catch (error) {
            logger_1.default.error('Error completing workout session:', error);
            throw error;
        }
    }
    async cancelSession(sessionId) {
        var _a;
        try {
            logger_1.default.info(`Cancelling workout session ${sessionId}`);
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
            }
            if (session.status !== Enums_1.SessionStatus.ACTIVE && session.status !== Enums_1.SessionStatus.PAUSED) {
                throw new errors_1.AppError(errors_1.ErrorType.OPERATION_NOT_ALLOWED, 'Session cannot be cancelled', 400);
            }
            session.status = Enums_1.SessionStatus.CANCELLED;
            session.endTime = new Date();
            if (session.startTime) {
                const additionalDuration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
                session.totalDuration += additionalDuration;
            }
            const updatedSession = await this.sessionRepo.save(session);
            const userId = session.userId || ((_a = session.user) === null || _a === void 0 ? void 0 : _a.id);
            if (userId) {
                await CacheManager_1.cacheManager.delete(`user:profile:${userId}`);
                await CacheManager_1.cacheManager.delete(`user:${userId}`);
                await CacheManager_1.cacheManager.delete(`user:${userId}:progress`);
                await CacheManager_1.cacheManager.delete(`user:${userId}:stats`);
                await CacheManager_1.cacheManager.delete(`user:${userId}:workoutSessions:direct`);
                await CacheManager_1.cacheManager.deleteByPattern(`user:${userId}:*`);
                logger_1.default.debug(`Invalidated caches for user ${userId}`);
            }
            if (Array.isArray(updatedSession)) {
                return updatedSession[0];
            }
            return updatedSession;
        }
        catch (error) {
            logger_1.default.error('Error cancelling workout session:', error);
            throw error;
        }
    }
    async getSessionById(sessionId) {
        try {
            logger_1.default.info(`Getting workout session ${sessionId}`);
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
            }
            return session;
        }
        catch (error) {
            logger_1.default.error('Error getting workout session:', error);
            throw error;
        }
    }
    async getUserSessions(userId, filters = {}) {
        try {
            logger_1.default.info(`Getting workout sessions for user ${userId}`);
            return await this.sessionRepo.findWithFilters(Object.assign(Object.assign({ userId }, filters), { includeWorkoutPlan: true }));
        }
        catch (error) {
            logger_1.default.error('Error getting user workout sessions:', error);
            throw error;
        }
    }
    async getSessionExercises(sessionId) {
        try {
            logger_1.default.info(`Getting exercises for session ${sessionId}`);
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
            }
            const totalExercises = session.exerciseSequence.originalPlan.length;
            const completedExercises = session.exerciseSequence.actualSequence.filter(e => e.status === Enums_1.ExerciseStatus.COMPLETED).length;
            const progress = totalExercises > 0
                ? Math.round((completedExercises / totalExercises) * 100)
                : 0;
            return {
                planned: session.exerciseSequence.originalPlan,
                actual: session.exerciseSequence.actualSequence,
                progress
            };
        }
        catch (error) {
            logger_1.default.error('Error getting session exercises:', error);
            throw error;
        }
    }
    async getSessionSummary(sessionId) {
        try {
            logger_1.default.info(`Getting summary for session ${sessionId}`);
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
            }
            if (session.status === Enums_1.SessionStatus.COMPLETED) {
                return session.summary;
            }
            await this.generateSessionSummary(session);
            return session.summary;
        }
        catch (error) {
            logger_1.default.error('Error getting session summary:', error);
            throw error;
        }
    }
    async generateSessionSummary(session) {
        const exerciseIds = Object.keys(session.exerciseResults);
        const exercises = await this.exerciseRepo.findByIds(exerciseIds);
        const summary = new WorkoutSession_1.WorkoutSummary();
        summary.totalExercises = session.exerciseSequence.originalPlan.length;
        summary.uniqueExercises = new Set(session.exerciseSequence.originalPlan.map(e => e.exerciseId)).size;
        summary.totalDuration = session.totalDuration;
        summary.caloriesBurned = session.caloriesBurned;
        const exerciseSummaries = [];
        for (const [exerciseId, result] of Object.entries(session.exerciseResults)) {
            const exercise = exercises.find(e => e.id === exerciseId);
            if (exercise) {
                const summary = new WorkoutSession_1.ExerciseSummary();
                summary.exerciseId = exerciseId;
                summary.name = exercise.name;
                summary.totalAttempts = result.attempts.length;
                summary.bestResult = result.bestResult || new WorkoutSession_1.BestResult();
                exerciseSummaries.push(summary);
            }
        }
        summary.exerciseSummaries = exerciseSummaries;
        session.summary = summary;
    }
    calculateCaloriesBurned(session) {
        const minutesWorked = session.totalDuration / 60;
        const averageCaloriesPerMinute = 7;
        return Math.floor(minutesWorked * averageCaloriesPerMinute);
    }
}
exports.WorkoutSessionService = WorkoutSessionService;
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkoutSessionService.prototype, "startSession", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WorkoutSessionService.prototype, "recordExerciseCompletion", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WorkoutSessionService.prototype, "skipExercise", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkoutSessionService.prototype, "pauseSession", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkoutSessionService.prototype, "resumeSession", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkoutSessionService.prototype, "completeSession", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkoutSessionService.prototype, "cancelSession", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkoutSessionService.prototype, "getSessionById", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WorkoutSessionService.prototype, "getUserSessions", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkoutSessionService.prototype, "getSessionExercises", null);
__decorate([
    (0, performance_1.SimpleTrack)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WorkoutSessionService.prototype, "getSessionSummary", null);
//# sourceMappingURL=WorkoutSessionService.js.map