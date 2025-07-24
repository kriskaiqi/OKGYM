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
exports.saveSessionExerciseResults = exports.submitSessionFeedback = exports.updateSessionStatus = exports.getActiveSession = exports.getSessionSummary = exports.getSessionExercises = exports.cancelSession = exports.completeSession = exports.resumeSession = exports.pauseSession = exports.skipExercise = exports.recordExerciseCompletion = exports.getUserSessions = exports.getSessionById = exports.startSession = void 0;
const WorkoutSessionService_1 = require("../services/WorkoutSessionService");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const Enums_1 = require("../models/shared/Enums");
const models_1 = require("../models");
const data_source_1 = require("../data-source");
const RelationshipLoader_1 = require("../utils/RelationshipLoader");
const orphanedExerciseHandler_1 = require("../utils/orphanedExerciseHandler");
const class_validator_2 = require("class-validator");
class StartSessionDto {
}
__decorate([
    (0, class_validator_2.IsNotEmpty)({ message: 'Workout Plan ID is required' }),
    __metadata("design:type", Object)
], StartSessionDto.prototype, "workoutPlanId", void 0);
class RecordExerciseDto {
}
class SkipExerciseDto {
}
const sessionService = new WorkoutSessionService_1.WorkoutSessionService();
const startSession = async (req, res, next) => {
    try {
        const { workoutPlanId } = req.body;
        const userId = req.user.id;
        logger_1.default.info(`Starting workout session for plan ID ${workoutPlanId} (type: ${typeof workoutPlanId}) for user ${userId}`);
        let sessionResponse = null;
        await data_source_1.AppDataSource.transaction(async (transactionalEntityManager) => {
            const existingSessions = await transactionalEntityManager.query(`SELECT * FROM workout_sessions 
                 WHERE user_id = $1 
                 AND workout_plan_id = $2
                 ORDER BY "createdAt" DESC
                 LIMIT 1
                 FOR UPDATE`, [userId, workoutPlanId]);
            const latestSession = existingSessions && existingSessions.length > 0 ? existingSessions[0] : null;
            if (latestSession && (latestSession.status === 'ACTIVE' || latestSession.status === 'PAUSED')) {
                logger_1.default.info(`Found existing ${latestSession.status} session ${latestSession.id} for user ${userId} and workout plan ${workoutPlanId}`);
                const planExercises = await transactionalEntityManager.query(`SELECT we.id, we."order", we.exercise_id, we.repetitions, we.duration, we."restTime", we.sets,
                     e.name as exercise_name, e.description as exercise_description  
                     FROM workout_exercises we
                     LEFT JOIN exercises e ON we.exercise_id = e.id
                     WHERE we.workout_plan_id = $1 
                     ORDER BY we."order"`, [workoutPlanId]);
                const workoutPlanResult = await transactionalEntityManager.query('SELECT id, name, description FROM workout_plans WHERE id = $1', [workoutPlanId]);
                const workoutPlan = workoutPlanResult[0];
                const exercises_list = planExercises.length > 0 ?
                    planExercises.map(ex => ({
                        id: ex.id,
                        order: ex.order,
                        repetitions: ex.repetitions || 10,
                        duration: ex.duration || 30,
                        restTime: ex.restTime || 60,
                        sets: ex.sets || 3,
                        exercise: {
                            id: ex.exercise_id,
                            name: ex.exercise_name || "Default Exercise",
                            description: ex.exercise_description || "Please add exercises to this workout plan"
                        },
                        targetSets: ex.sets || 3
                    })) : [{
                        id: 0,
                        order: 0,
                        repetitions: 10,
                        duration: 30,
                        restTime: 60,
                        sets: 3,
                        exercise: {
                            id: "placeholder",
                            name: "Default Exercise",
                            description: "Please add exercises to this workout plan"
                        },
                        targetSets: 3
                    }];
                let exerciseSequence = null;
                try {
                    exerciseSequence = JSON.parse(latestSession.exerciseSequence);
                }
                catch (err) {
                    logger_1.default.warn(`Could not parse exercise sequence for session ${latestSession.id}:`, err);
                    exerciseSequence = {
                        originalPlan: planExercises.map(e => ({
                            id: e.id,
                            exerciseId: e.exercise_id,
                            order: e.order || 0
                        })),
                        actualSequence: [],
                        currentIndex: 0
                    };
                }
                sessionResponse = Object.assign(Object.assign({}, latestSession), { exerciseSequence: exerciseSequence, workoutPlan: {
                        id: workoutPlan.id,
                        name: workoutPlan.name,
                        description: workoutPlan.description,
                        exercises: exercises_list
                    } });
                return;
            }
            if (latestSession && latestSession.status === 'COMPLETED') {
                const completedTime = new Date(latestSession.endTime);
                const now = new Date();
                const diffMinutes = (now.getTime() - completedTime.getTime()) / (1000 * 60);
                logger_1.default.info(`Workout was recently completed. Allowing a new session to start.`);
            }
            const activeOrPendingSessions = await transactionalEntityManager.query(`SELECT * FROM workout_sessions 
                 WHERE user_id = $1 
                 AND status IN ('ACTIVE', 'PENDING', 'PAUSED')
                 FOR UPDATE`, [userId]);
            if (activeOrPendingSessions && activeOrPendingSessions.length > 0) {
                logger_1.default.info(`Found ${activeOrPendingSessions.length} existing active/paused/pending sessions for user ${userId}`);
                try {
                    for (const session of activeOrPendingSessions) {
                        await transactionalEntityManager.query(`UPDATE workout_sessions 
                             SET status = 'CANCELLED', "endTime" = $1, "updatedAt" = $1
                             WHERE id = $2`, [new Date(), session.id]);
                        logger_1.default.info(`Cancelled existing session ${session.id} to start fresh`);
                    }
                }
                catch (cancelError) {
                    logger_1.default.error(`Error cancelling existing sessions: ${cancelError}`);
                }
            }
            const results = await transactionalEntityManager.query('SELECT id, name, description FROM workout_plans WHERE id = $1', [workoutPlanId]);
            if (!results || results.length === 0) {
                throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, `Workout plan with ID ${workoutPlanId} not found`, 404);
            }
            const workoutPlan = results[0];
            const exercises = await transactionalEntityManager.query('SELECT id, "order", exercise_id, sets FROM workout_exercises WHERE workout_plan_id = $1 ORDER BY "order"', [workoutPlan.id]);
            const exerciseSequence = {
                originalPlan: exercises.length > 0 ? exercises.map(e => ({
                    id: e.id,
                    exerciseId: e.exercise_id,
                    order: e.order || 0
                })) : [{
                        id: 0,
                        exerciseId: "placeholder",
                        order: 0
                    }],
                actualSequence: [],
                currentIndex: 0
            };
            try {
                const result = await transactionalEntityManager.query(`INSERT INTO workout_sessions 
                    (user_id, workout_plan_id, status, "startTime", "createdAt", "updatedAt", "exerciseResults", summary, "exerciseSequence") 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                    RETURNING *`, [
                    userId,
                    workoutPlan.id,
                    'ACTIVE',
                    new Date(),
                    new Date(),
                    new Date(),
                    JSON.stringify({}),
                    JSON.stringify({
                        totalExercises: exercises.length,
                        uniqueExercises: exercises.length,
                        totalDuration: 0,
                        caloriesBurned: 0,
                        exerciseSummaries: [],
                        focusAreas: [],
                        muscleGroups: [],
                        totalSets: 0,
                        totalReps: 0,
                        formScore: 0
                    }),
                    JSON.stringify(exerciseSequence)
                ]);
                if (!result || result.length === 0) {
                    logger_1.default.error('Failed to create new session - no result returned from query');
                    throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to create new session', 500);
                }
                const newSession = result[0];
                logger_1.default.info(`Created new ACTIVE session with ID: ${newSession.id}`);
                const planExercises = await transactionalEntityManager.query(`SELECT we.id, we."order", we.exercise_id, we.repetitions, we.duration, we."restTime", we.sets, 
                     e.name as exercise_name, e.description as exercise_description  
                     FROM workout_exercises we
                     LEFT JOIN exercises e ON we.exercise_id = e.id
                     WHERE we.workout_plan_id = $1 
                     ORDER BY we."order"`, [workoutPlan.id]);
                const exercises_list = planExercises.length > 0 ?
                    planExercises.map(ex => ({
                        id: ex.id,
                        order: ex.order,
                        repetitions: ex.repetitions || 10,
                        duration: ex.duration || 30,
                        restTime: ex.restTime || 60,
                        sets: ex.sets || 3,
                        exercise: {
                            id: ex.exercise_id,
                            name: ex.exercise_name || "Default Exercise",
                            description: ex.exercise_description || "Please add exercises to this workout plan"
                        },
                        targetSets: ex.sets || 3
                    })) : [{
                        id: 0,
                        order: 0,
                        repetitions: 10,
                        duration: 30,
                        restTime: 60,
                        sets: 3,
                        exercise: {
                            id: "placeholder",
                            name: "Default Exercise",
                            description: "Please add exercises to this workout plan"
                        },
                        targetSets: 3
                    }];
                sessionResponse = Object.assign(Object.assign({}, newSession), { exerciseSequence: exerciseSequence, workoutPlan: {
                        id: workoutPlan.id,
                        name: workoutPlan.name,
                        description: workoutPlan.description,
                        exercises: exercises_list
                    } });
            }
            catch (insertError) {
                logger_1.default.error('Error creating new session:', insertError);
                throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, `Error creating workout session: ${insertError.message}`, 500, insertError);
            }
        });
        if (sessionResponse) {
            const statusCode = sessionResponse.id ? 200 : 201;
            res.status(statusCode).json(sessionResponse);
        }
        else {
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to create or find session', 500);
        }
    }
    catch (error) {
        if (error instanceof errors_1.AppError) {
            next(error);
        }
        else {
            logger_1.default.error('Unexpected error starting session:', error);
            next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, `Error starting session: ${error.message || 'Unknown error'}`, 500, error));
        }
    }
};
exports.startSession = startSession;
const getSessionById = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const session = await data_source_1.AppDataSource
            .getRepository(models_1.WorkoutSession)
            .findOne({
            where: { id: sessionId, user: { id: userId } }
        });
        if (!session) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        const [workoutPlan, metrics, feedback, ratings, formAnalysis, achievements] = await Promise.all([
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'workoutPlan', sessionId, data_source_1.AppDataSource.getRepository(models_1.WorkoutPlan)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'metrics', sessionId, data_source_1.AppDataSource.getRepository(models_1.MetricTracking)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'feedback', sessionId, data_source_1.AppDataSource.getRepository(models_1.Feedback)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'ratings', sessionId, data_source_1.AppDataSource.getRepository(models_1.WorkoutRating)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'formAnalysis', sessionId, data_source_1.AppDataSource.getRepository(models_1.ExerciseFormAnalysis)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'achievements', sessionId, data_source_1.AppDataSource.getRepository(models_1.Achievement))
        ]);
        session.workoutPlan = workoutPlan[0];
        session.metrics = metrics;
        session.feedback = feedback;
        session.ratings = ratings;
        session.formAnalysis = formAnalysis;
        session.achievements = achievements;
        res.json(session);
    }
    catch (error) {
        logger_1.default.error('Error fetching session:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching session', 500, error));
    }
};
exports.getSessionById = getSessionById;
const getUserSessions = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { status, startDateMin, startDateMax, limit = 10, offset = 0 } = req.query;
        const queryBuilder = data_source_1.AppDataSource
            .getRepository(models_1.WorkoutSession)
            .createQueryBuilder('session')
            .where('session.user_id = :userId', { userId });
        if (status) {
            if (Array.isArray(status)) {
                queryBuilder.andWhere('session.status IN (:...statuses)', { statuses: status });
            }
            else {
                queryBuilder.andWhere('session.status = :status', { status });
            }
        }
        if (startDateMin && startDateMax) {
            queryBuilder.andWhere('session.startTime BETWEEN :minDate AND :maxDate', {
                minDate: new Date(startDateMin),
                maxDate: new Date(startDateMax)
            });
        }
        queryBuilder
            .orderBy('session.startTime', 'DESC')
            .skip(Number(offset))
            .take(Number(limit));
        let sessions = [];
        let total = 0;
        try {
            [sessions, total] = await queryBuilder.getManyAndCount();
            logger_1.default.info(`Found ${sessions.length} sessions for user ${userId}`);
        }
        catch (error) {
            logger_1.default.error('Error querying workout sessions:', error);
            sessions = [];
            total = 0;
        }
        const workoutSessions = sessions;
        if (workoutSessions.length > 0) {
            const sessionIds = workoutSessions.map(s => s.id);
            try {
                const [workoutPlansMap, summariesMap] = await Promise.all([
                    RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('WorkoutSession', 'workoutPlan', sessionIds, data_source_1.AppDataSource.getRepository(models_1.WorkoutPlan)),
                    RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('WorkoutSession', 'summary', sessionIds, data_source_1.AppDataSource.getRepository(models_1.WorkoutSummary))
                ]);
                workoutSessions.forEach(session => {
                    var _a, _b;
                    const workoutPlan = (_a = workoutPlansMap.get(session.id)) === null || _a === void 0 ? void 0 : _a[0];
                    if (workoutPlan) {
                        session.workoutPlan = workoutPlan;
                    }
                    else {
                        logger_1.default.warn(`Workout plan not found for session ${session.id}`);
                    }
                    session.summary = (_b = summariesMap.get(session.id)) === null || _b === void 0 ? void 0 : _b[0];
                });
            }
            catch (error) {
                logger_1.default.error('Error loading relationships for workout sessions:', error);
            }
        }
        res.json({
            data: workoutSessions,
            metadata: {
                total,
                page: Math.floor(Number(offset) / Number(limit)) + 1,
                limit: Number(limit)
            }
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching user sessions:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching user sessions', 500, error));
    }
};
exports.getUserSessions = getUserSessions;
const recordExerciseCompletion = async (req, res, next) => {
    try {
        const { sessionId, exerciseId } = req.params;
        const userId = req.user.id;
        const exerciseData = (0, class_transformer_1.plainToClass)(RecordExerciseDto, req.body);
        logger_1.default.info(`Recording exercise completion - Session: ${sessionId}, Exercise: ${exerciseId}, User: ${userId}`);
        logger_1.default.info(`Request body: ${JSON.stringify(req.body)}`);
        try {
            await (0, class_validator_1.validateOrReject)(exerciseData);
        }
        catch (errors) {
            logger_1.default.error(`Validation errors: ${JSON.stringify(errors)}`);
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid exercise data', 400, errors);
        }
        if (exerciseData.formScore < 0 || exerciseData.formScore > 10) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Form score must be between 0 and 10', 400);
        }
        logger_1.default.info(`Fetching session with ID ${sessionId} for user ${userId}`);
        const sessionResult = await data_source_1.AppDataSource.query(`SELECT * FROM workout_sessions WHERE id = $1 AND user_id = $2`, [sessionId, userId]);
        if (!sessionResult || sessionResult.length === 0) {
            logger_1.default.error(`Session not found - ID: ${sessionId}, User: ${userId}`);
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        const session = sessionResult[0];
        logger_1.default.info(`Found session with status: ${session.status}`);
        if (session.status !== 'ACTIVE' && session.status !== 'PAUSED') {
            logger_1.default.error(`Invalid session status: ${session.status} - Cannot record exercise`);
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, `Cannot record exercise for session with status ${session.status}`, 400);
        }
        logger_1.default.info(`Fetching workout plan with ID ${session.workout_plan_id}`);
        const workoutPlanResult = await data_source_1.AppDataSource.query(`SELECT * FROM workout_plans WHERE id = $1`, [session.workout_plan_id]);
        if (!workoutPlanResult || workoutPlanResult.length === 0) {
            logger_1.default.error(`Workout plan not found - ID: ${session.workout_plan_id}`);
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Workout plan not found', 404);
        }
        logger_1.default.info(`Current exercise results: ${session.exerciseResults || '{}'}`);
        let exerciseResults = {};
        try {
            exerciseResults = session.exerciseResults ? JSON.parse(session.exerciseResults) : {};
        }
        catch (error) {
            logger_1.default.error(`Error parsing exercise results: ${error}`);
            exerciseResults = {};
        }
        let summary = {
            formScore: 0,
            totalReps: 0,
            totalSets: 0,
            focusAreas: [],
            muscleGroups: [],
            totalDuration: 0,
            caloriesBurned: 0,
            totalExercises: 5,
            uniqueExercises: 5,
            exerciseSummaries: []
        };
        try {
            if (session.summary) {
                const parsedSummary = JSON.parse(session.summary);
                summary = Object.assign(Object.assign({}, summary), parsedSummary);
            }
        }
        catch (error) {
            logger_1.default.error(`Error parsing summary: ${error}`);
        }
        if (!exerciseResults[exerciseId]) {
            logger_1.default.info(`Initializing exercise result for exercise ${exerciseId}`);
            exerciseResults[exerciseId] = {
                status: "ACTIVE",
                attempts: [],
                bestResult: {
                    formScore: 0,
                    weight: 0,
                    reps: 0,
                    duration: 0,
                    notes: ''
                }
            };
        }
        const attempt = {
            timestamp: new Date(),
            repetitions: exerciseData.repetitions || 0,
            duration: exerciseData.duration || 0,
            formScore: exerciseData.formScore,
            weight: exerciseData.weight || 0,
            notes: exerciseData.notes || ''
        };
        logger_1.default.info(`Created attempt: ${JSON.stringify(attempt)}`);
        exerciseResults[exerciseId].attempts.push(attempt);
        const currentBest = exerciseResults[exerciseId].bestResult;
        if (!currentBest.formScore || attempt.formScore > currentBest.formScore) {
            exerciseResults[exerciseId].bestResult = {
                formScore: attempt.formScore,
                weight: attempt.weight || 0,
                reps: attempt.repetitions || 0,
                duration: attempt.duration || 0,
                notes: attempt.notes || ''
            };
        }
        summary.totalSets = (summary.totalSets || 0) + 1;
        summary.totalReps = (summary.totalReps || 0) + (attempt.repetitions || 0);
        summary.formScore = Math.round(((summary.formScore || 0) * ((summary.totalSets || 1) - 1) + attempt.formScore) / (summary.totalSets || 1));
        const exerciseResultsJson = JSON.stringify(exerciseResults);
        const summaryJson = JSON.stringify(summary);
        logger_1.default.info(`Updating session with exercise results: ${exerciseResultsJson.substring(0, 100)}...`);
        try {
            const updateResult = await data_source_1.AppDataSource.query(`UPDATE workout_sessions 
                SET "exerciseResults" = $1::jsonb, 
                    summary = $2::jsonb,
                    "updatedAt" = $3
                WHERE id = $4 
                AND user_id = $5
                RETURNING *`, [
                exerciseResultsJson,
                summaryJson,
                new Date(),
                sessionId,
                userId
            ]);
            if (!updateResult || updateResult.length === 0) {
                logger_1.default.error(`Failed to update session ${sessionId}`);
                throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Failed to update session', 500);
            }
            logger_1.default.info(`Successfully recorded exercise completion for session ${sessionId}, exercise ${exerciseId}`);
            res.json(updateResult[0]);
        }
        catch (dbError) {
            logger_1.default.error(`Database error updating session: ${dbError}`);
            throw new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Database error updating session', 500, dbError);
        }
    }
    catch (error) {
        logger_1.default.error('Error recording exercise completion:', error);
        next(error instanceof errors_1.AppError ? error : new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error recording exercise completion', 500, error));
    }
};
exports.recordExerciseCompletion = recordExerciseCompletion;
const skipExercise = async (req, res, next) => {
    var _a;
    try {
        const { sessionId, exerciseId } = req.params;
        const userId = req.user.id;
        const skipData = (0, class_transformer_1.plainToClass)(SkipExerciseDto, req.body);
        await (0, class_validator_1.validateOrReject)(skipData).catch(errors => {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid skip data', 400, errors);
        });
        const session = await data_source_1.AppDataSource
            .getRepository(models_1.WorkoutSession)
            .findOne({
            where: {
                id: sessionId,
                user: { id: userId }
            }
        });
        if (!session) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        if (session.status !== Enums_1.SessionStatus.ACTIVE && session.status !== Enums_1.SessionStatus.PAUSED) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Cannot skip exercise in non-active session', 400);
        }
        const [workoutPlan] = await RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'workoutPlan', sessionId, data_source_1.AppDataSource.getRepository(models_1.WorkoutPlan));
        if (!workoutPlan) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Workout plan not found', 404);
        }
        const workoutExercise = (_a = workoutPlan.exercises) === null || _a === void 0 ? void 0 : _a.find(e => e.exercise_id === exerciseId);
        if (!workoutExercise) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Exercise not found in workout plan', 404);
        }
        if (!session.exerciseResults) {
            session.exerciseResults = {};
        }
        session.exerciseResults[exerciseId] = {
            status: Enums_1.ExerciseStatus.SKIPPED,
            attempts: [],
            bestResult: new models_1.BestResult(),
            skipReason: skipData.reason || 'No reason provided'
        };
        const savedSession = await data_source_1.AppDataSource.getRepository(models_1.WorkoutSession).save(session);
        const [updatedWorkoutPlan, summary] = await Promise.all([
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'workoutPlan', savedSession.id, data_source_1.AppDataSource.getRepository(models_1.WorkoutPlan)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'summary', savedSession.id, data_source_1.AppDataSource.getRepository(models_1.WorkoutSummary))
        ]);
        savedSession.workoutPlan = updatedWorkoutPlan[0];
        savedSession.summary = summary[0];
        res.json(savedSession);
    }
    catch (error) {
        logger_1.default.error('Error skipping exercise:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error skipping exercise', 500, error));
    }
};
exports.skipExercise = skipExercise;
const pauseSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { duration, caloriesBurned } = req.body;
        logger_1.default.info(`Attempting to pause session ${sessionId}`);
        logger_1.default.info(`Pause session request data: duration=${duration}, calories=${caloriesBurned}`);
        const session = await data_source_1.AppDataSource
            .getRepository(models_1.WorkoutSession)
            .findOne({
            where: { id: sessionId, user: { id: userId } },
            relations: ['workoutPlan']
        });
        if (!session) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        if (session.status !== Enums_1.SessionStatus.ACTIVE) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Can only pause an active session', 400);
        }
        const workoutSessionService = new WorkoutSessionService_1.WorkoutSessionService();
        const pausedSession = await workoutSessionService.pauseSession(sessionId, {
            duration,
            caloriesBurned
        });
        res.json(pausedSession);
    }
    catch (error) {
        logger_1.default.error('Error pausing session:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error pausing session', 500, error));
    }
};
exports.pauseSession = pauseSession;
const resumeSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        logger_1.default.info(`Attempting to resume session ${sessionId} for user ${userId}`);
        const session = await data_source_1.AppDataSource
            .getRepository(models_1.WorkoutSession)
            .findOne({
            where: { id: sessionId, user: { id: userId } }
        });
        if (!session) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        logger_1.default.info(`Session ${sessionId} current status: ${session.status}`);
        if (session.status !== Enums_1.SessionStatus.PAUSED) {
            const errorMessage = `Cannot resume session. Session is in state: ${session.status}`;
            logger_1.default.error(errorMessage);
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Can only resume a paused session', 400);
        }
        const workoutSessionService = new WorkoutSessionService_1.WorkoutSessionService();
        const resumedSession = await workoutSessionService.resumeSession(sessionId);
        const response = Object.assign(Object.assign({}, resumedSession), { success: true, data: resumedSession, message: 'Session resumed successfully' });
        res.json(response);
    }
    catch (error) {
        logger_1.default.error(`Error resuming session ${req.params.sessionId}:`, error);
        next(error instanceof errors_1.AppError ? error : new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error resuming session', 500, error));
    }
};
exports.resumeSession = resumeSession;
const completeSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { duration, caloriesBurned, exerciseResults } = req.body;
        logger_1.default.info(`Attempting to complete session ${sessionId}`);
        logger_1.default.info(`Complete session request data: duration=${duration}, calories=${caloriesBurned}`);
        const session = await data_source_1.AppDataSource
            .getRepository(models_1.WorkoutSession)
            .findOne({
            where: { id: sessionId, user: { id: userId } },
            relations: ['workoutPlan']
        });
        if (!session) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        if (session.status !== Enums_1.SessionStatus.ACTIVE && session.status !== Enums_1.SessionStatus.PAUSED) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Can only complete an active or paused session', 400);
        }
        const now = new Date();
        let totalDurationSeconds = duration || 0;
        if (!totalDurationSeconds && session.startTime) {
            totalDurationSeconds = Math.round((now.getTime() - session.startTime.getTime()) / 1000);
        }
        const durationInMinutes = totalDurationSeconds / 60;
        const calculatedCaloriesBurned = caloriesBurned || Math.max(Math.round(durationInMinutes * 7), 1);
        let sessionExerciseResults = {};
        if (exerciseResults && typeof exerciseResults === 'object') {
            sessionExerciseResults = exerciseResults;
            logger_1.default.info('Using exercise results from request');
        }
        else {
            try {
                sessionExerciseResults = session.exerciseResults ?
                    (typeof session.exerciseResults === 'string' ?
                        JSON.parse(session.exerciseResults) : session.exerciseResults) : {};
                logger_1.default.info('Using exercise results from session');
            }
            catch (error) {
                logger_1.default.error(`Error parsing exercise results: ${error}`);
                sessionExerciseResults = {};
            }
        }
        let totalSets = 0;
        let totalReps = 0;
        let formScoreSum = 0;
        let formScoreCount = 0;
        Object.values(sessionExerciseResults).forEach((result) => {
            if (result.attempts && Array.isArray(result.attempts)) {
                totalSets += result.attempts.length;
                result.attempts.forEach((attempt) => {
                    totalReps += attempt.repetitions || 0;
                    if (typeof attempt.formScore === 'number') {
                        formScoreSum += attempt.formScore;
                        formScoreCount++;
                    }
                });
            }
        });
        const avgFormScore = formScoreCount > 0 ? Math.round(formScoreSum / formScoreCount) : 7;
        const summaryData = {
            formScore: avgFormScore,
            totalReps: totalReps,
            totalSets: Math.max(totalSets, 1),
            focusAreas: [],
            muscleGroups: [],
            totalDuration: totalDurationSeconds,
            caloriesBurned: calculatedCaloriesBurned,
            totalExercises: session.workoutPlan ?
                (session.workoutPlan.exercises ? session.workoutPlan.exercises.length : 3) : 3,
            uniqueExercises: session.workoutPlan ?
                (session.workoutPlan.exercises ? session.workoutPlan.exercises.length : 3) : 3,
            exerciseSummaries: []
        };
        await data_source_1.AppDataSource.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.query(`UPDATE workout_sessions 
                 SET status = 'COMPLETED', 
                     "endTime" = $1, 
                     "totalDuration" = $2,
                     "caloriesBurned" = $3,
                     "summary" = $4,
                     "updatedAt" = $1
                 WHERE id = $5
                 AND user_id = $6
                 AND status IN ('ACTIVE', 'PAUSED')
                 RETURNING *`, [now, totalDurationSeconds, calculatedCaloriesBurned, JSON.stringify(summaryData), sessionId, userId]);
        });
        const updatedSession = await data_source_1.AppDataSource
            .getRepository(models_1.WorkoutSession)
            .findOne({
            where: { id: sessionId },
            relations: ['workoutPlan']
        });
        if (!updatedSession) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found after update', 404);
        }
        logger_1.default.info(`Successfully completed session ${sessionId}`);
        res.json(updatedSession);
    }
    catch (error) {
        logger_1.default.error('Error completing session:', error);
        next(error instanceof errors_1.AppError ? error : new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error completing session', 500, error));
    }
};
exports.completeSession = completeSession;
const cancelSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const results = await data_source_1.AppDataSource.query(`UPDATE workout_sessions 
             SET status = 'CANCELLED', 
                 "endTime" = $1, 
                 "updatedAt" = $1
             WHERE id = $2
             AND user_id = $3
             AND status NOT IN ('COMPLETED', 'CANCELLED')
             RETURNING *`, [new Date(), sessionId, userId]);
        if (!results || results.length === 0) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found or already cancelled/completed', 404);
        }
        res.json(results[0]);
    }
    catch (error) {
        logger_1.default.error('Error cancelling session:', error);
        next(error instanceof errors_1.AppError ? error : new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error cancelling session', 500, error));
    }
};
exports.cancelSession = cancelSession;
const getSessionExercises = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        let session;
        try {
            session = await data_source_1.AppDataSource
                .getRepository(models_1.WorkoutSession)
                .findOne({
                where: { id: sessionId, user: { id: userId } }
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding session with ID ${sessionId}:`, error);
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        if (!session) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        let workoutPlan;
        try {
            const workoutPlans = await RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'workoutPlan', sessionId, data_source_1.AppDataSource.getRepository(models_1.WorkoutPlan));
            workoutPlan = workoutPlans[0];
        }
        catch (error) {
            logger_1.default.error(`Error loading workout plan for session ${sessionId}:`, error);
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Workout plan not found', 404);
        }
        if (!workoutPlan) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Workout plan not found', 404);
        }
        let exercises = [];
        try {
            exercises = await orphanedExerciseHandler_1.OrphanedExerciseHandler.safelyLoadExercises(session.workoutPlanId);
            logger_1.default.info(`Loaded ${exercises.length} exercises for session ${sessionId}, including possible orphaned exercises`);
        }
        catch (error) {
            logger_1.default.warn(`Error loading exercises for session ${sessionId}:`, error);
        }
        workoutPlan.exercises = exercises;
        res.json(workoutPlan.exercises);
    }
    catch (error) {
        logger_1.default.error('Error fetching session exercises:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching session exercises', 500, error));
    }
};
exports.getSessionExercises = getSessionExercises;
const getSessionSummary = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const session = await data_source_1.AppDataSource
            .getRepository(models_1.WorkoutSession)
            .findOne({
            where: { id: sessionId, user: { id: userId } }
        });
        if (!session) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        const summary = await RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'summary', sessionId, data_source_1.AppDataSource.getRepository(models_1.WorkoutSummary));
        if (!summary[0]) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session summary not found', 404);
        }
        res.json(summary[0]);
    }
    catch (error) {
        logger_1.default.error('Error fetching session summary:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching session summary', 500, error));
    }
};
exports.getSessionSummary = getSessionSummary;
const getActiveSession = async (req, res, next) => {
    try {
        const userId = req.user.id;
        let session = null;
        try {
            const queryResult = await data_source_1.AppDataSource.query(`SELECT * FROM workout_sessions 
                 WHERE user_id = $1 
                 AND status IN ('ACTIVE', 'PAUSED')
                 ORDER BY "startTime" DESC LIMIT 1`, [userId]);
            if (queryResult && queryResult.length > 0) {
                session = queryResult[0];
                logger_1.default.info(`Found active session: ${(session === null || session === void 0 ? void 0 : session.id) || 'none'}`);
            }
            else {
                logger_1.default.info(`No active session found for user ${userId}`);
            }
        }
        catch (error) {
            logger_1.default.error('Error finding active session:', error);
            res.status(404).json({ message: 'No active session found' });
            return;
        }
        if (!session) {
            res.status(404).json({ message: 'No active session found' });
            return;
        }
        try {
            const [workoutPlan, metrics, feedback, ratings, formAnalysis, achievements] = await Promise.all([
                RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'workoutPlan', session.id, data_source_1.AppDataSource.getRepository(models_1.WorkoutPlan)),
                RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'metrics', session.id, data_source_1.AppDataSource.getRepository(models_1.MetricTracking)),
                RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'feedback', session.id, data_source_1.AppDataSource.getRepository(models_1.Feedback)),
                RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'ratings', session.id, data_source_1.AppDataSource.getRepository(models_1.WorkoutRating)),
                RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'formAnalysis', session.id, data_source_1.AppDataSource.getRepository(models_1.ExerciseFormAnalysis)),
                RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'achievements', session.id, data_source_1.AppDataSource.getRepository(models_1.Achievement))
            ]);
            if (workoutPlan && workoutPlan.length > 0) {
                session.workoutPlan = workoutPlan[0];
            }
            session.metrics = metrics || [];
            session.feedback = feedback || [];
            session.ratings = ratings || [];
            session.formAnalysis = formAnalysis || [];
            session.achievements = achievements || [];
            if (session.workoutPlan) {
                try {
                    const exercises = await RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutPlan', 'exercises', session.workoutPlan.id, data_source_1.AppDataSource.getRepository(models_1.WorkoutExercise));
                    session.workoutPlan.exercises = exercises || [];
                }
                catch (exerciseError) {
                    logger_1.default.warn(`Error loading exercises for workout plan ${session.workoutPlan.id}:`, exerciseError);
                    session.workoutPlan.exercises = [];
                }
            }
        }
        catch (relationshipError) {
            logger_1.default.warn('Error loading relationships for active session:', relationshipError);
        }
        res.json(session);
    }
    catch (error) {
        logger_1.default.error('Error fetching active session:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching active session', 500, error));
    }
};
exports.getActiveSession = getActiveSession;
const updateSessionStatus = async (req, res, next) => {
    var _a;
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { status } = req.body;
        if (!Object.values(Enums_1.SessionStatus).includes(status)) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Invalid session status', 400);
        }
        const session = await data_source_1.AppDataSource
            .getRepository(models_1.WorkoutSession)
            .findOne({
            where: {
                id: sessionId,
                user: { id: userId }
            }
        });
        if (!session) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        const validTransitions = {
            [Enums_1.SessionStatus.PENDING]: [Enums_1.SessionStatus.ACTIVE],
            [Enums_1.SessionStatus.ACTIVE]: [Enums_1.SessionStatus.PAUSED, Enums_1.SessionStatus.COMPLETED, Enums_1.SessionStatus.CANCELLED],
            [Enums_1.SessionStatus.PAUSED]: [Enums_1.SessionStatus.ACTIVE, Enums_1.SessionStatus.COMPLETED, Enums_1.SessionStatus.CANCELLED],
            [Enums_1.SessionStatus.COMPLETED]: [],
            [Enums_1.SessionStatus.CANCELLED]: []
        };
        if (!((_a = validTransitions[session.status]) === null || _a === void 0 ? void 0 : _a.includes(status))) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, `Invalid status transition from ${session.status} to ${status}`, 400);
        }
        session.status = status;
        if (status === Enums_1.SessionStatus.COMPLETED || status === Enums_1.SessionStatus.CANCELLED) {
            session.endTime = new Date();
        }
        const savedSession = await data_source_1.AppDataSource.getRepository(models_1.WorkoutSession).save(session);
        const [workoutPlan, metrics, feedback, ratings, formAnalysis, achievements] = await Promise.all([
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'workoutPlan', savedSession.id, data_source_1.AppDataSource.getRepository(models_1.WorkoutPlan)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'metrics', savedSession.id, data_source_1.AppDataSource.getRepository(models_1.MetricTracking)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'feedback', savedSession.id, data_source_1.AppDataSource.getRepository(models_1.Feedback)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'ratings', savedSession.id, data_source_1.AppDataSource.getRepository(models_1.WorkoutRating)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'formAnalysis', savedSession.id, data_source_1.AppDataSource.getRepository(models_1.ExerciseFormAnalysis)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'achievements', savedSession.id, data_source_1.AppDataSource.getRepository(models_1.Achievement))
        ]);
        savedSession.workoutPlan = workoutPlan[0];
        savedSession.metrics = metrics;
        savedSession.feedback = feedback;
        savedSession.ratings = ratings;
        savedSession.formAnalysis = formAnalysis;
        savedSession.achievements = achievements;
        if (savedSession.workoutPlan) {
            const exercises = await RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutPlan', 'exercises', savedSession.workoutPlan.id, data_source_1.AppDataSource.getRepository(models_1.WorkoutExercise));
            savedSession.workoutPlan.exercises = exercises;
        }
        res.json(savedSession);
    }
    catch (error) {
        logger_1.default.error('Error updating session status:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error updating session status', 500, error));
    }
};
exports.updateSessionStatus = updateSessionStatus;
const submitSessionFeedback = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { difficultyRating, feedback } = req.body;
        if (difficultyRating !== undefined && (difficultyRating < 1 || difficultyRating > 5)) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Difficulty rating must be between 1 and 5', 400);
        }
        const session = await data_source_1.AppDataSource
            .getRepository(models_1.WorkoutSession)
            .findOne({
            where: {
                id: sessionId,
                user: { id: userId }
            }
        });
        if (!session) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        if (session.status !== Enums_1.SessionStatus.COMPLETED) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Can only submit feedback for completed sessions', 400);
        }
        const feedbackEntity = new models_1.Feedback();
        feedbackEntity.user = { id: userId };
        feedbackEntity.workoutSession = { id: sessionId };
        feedbackEntity.type = Enums_1.FeedbackType.WORKOUT_RATING;
        feedbackEntity.comment = feedback;
        feedbackEntity.entityId = sessionId;
        feedbackEntity.entityType = 'WorkoutSession';
        feedbackEntity.createdAt = new Date();
        const ratingEntity = difficultyRating ? new models_1.WorkoutRating() : null;
        if (ratingEntity) {
            ratingEntity.user = { id: userId };
            ratingEntity.workoutSession = { id: sessionId };
            ratingEntity.difficultyRating = difficultyRating;
            ratingEntity.createdAt = new Date();
        }
        await Promise.all([
            data_source_1.AppDataSource.getRepository(models_1.Feedback).save(feedbackEntity),
            ratingEntity ? data_source_1.AppDataSource.getRepository(models_1.WorkoutRating).save(ratingEntity) : Promise.resolve()
        ]);
        const [workoutPlan, metrics, feedbackList, ratings, formAnalysis, achievements] = await Promise.all([
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'workoutPlan', session.id, data_source_1.AppDataSource.getRepository(models_1.WorkoutPlan)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'metrics', session.id, data_source_1.AppDataSource.getRepository(models_1.MetricTracking)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'feedback', session.id, data_source_1.AppDataSource.getRepository(models_1.Feedback)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'ratings', session.id, data_source_1.AppDataSource.getRepository(models_1.WorkoutRating)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'formAnalysis', session.id, data_source_1.AppDataSource.getRepository(models_1.ExerciseFormAnalysis)),
            RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutSession', 'achievements', session.id, data_source_1.AppDataSource.getRepository(models_1.Achievement))
        ]);
        session.workoutPlan = workoutPlan[0];
        session.metrics = metrics;
        session.feedback = feedbackList;
        session.ratings = ratings;
        session.formAnalysis = formAnalysis;
        session.achievements = achievements;
        if (session.workoutPlan) {
            const exercises = await RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutPlan', 'exercises', session.workoutPlan.id, data_source_1.AppDataSource.getRepository(models_1.WorkoutExercise));
            session.workoutPlan.exercises = exercises;
        }
        res.json(session);
    }
    catch (error) {
        logger_1.default.error('Error submitting session feedback:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error submitting session feedback', 500, error));
    }
};
exports.submitSessionFeedback = submitSessionFeedback;
const saveSessionExerciseResults = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { exerciseResults } = req.body;
        if (!exerciseResults || typeof exerciseResults !== 'object') {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Exercise results data is required', 400);
        }
        logger_1.default.info(`Saving exercise results for session ${sessionId}`);
        logger_1.default.debug(`Exercise results data received:`, exerciseResults);
        const session = await data_source_1.AppDataSource
            .getRepository(models_1.WorkoutSession)
            .findOne({
            where: { id: sessionId, user: { id: userId } },
            relations: ['workoutPlan', 'workoutPlan.exercises', 'workoutPlan.exercises.exercise']
        });
        if (!session) {
            throw new errors_1.AppError(errors_1.ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        if (session.status !== Enums_1.SessionStatus.ACTIVE && session.status !== Enums_1.SessionStatus.PAUSED) {
            throw new errors_1.AppError(errors_1.ErrorType.VALIDATION_ERROR, 'Can only update exercise results for an active or paused session', 400);
        }
        let existingResults = {};
        try {
            if (session.exerciseResults) {
                if (typeof session.exerciseResults === 'string') {
                    existingResults = JSON.parse(session.exerciseResults);
                }
                else {
                    existingResults = session.exerciseResults;
                }
            }
        }
        catch (error) {
            logger_1.default.warn(`Error parsing existing exercise results: ${error}`);
        }
        const mergedResults = {};
        Object.keys(existingResults).forEach(exerciseId => {
            mergedResults[exerciseId] = existingResults[exerciseId];
        });
        Object.keys(exerciseResults).forEach(exerciseId => {
            if (mergedResults[exerciseId]) {
                const existing = mergedResults[exerciseId];
                const newData = exerciseResults[exerciseId];
                const attempts = [...(existing.attempts || [])];
                if (newData.attempts && Array.isArray(newData.attempts)) {
                    newData.attempts.forEach(newAttempt => {
                        const isDuplicate = attempts.some(existingAttempt => {
                            const existingTime = new Date(existingAttempt.timestamp).getTime();
                            const newTime = new Date(newAttempt.timestamp).getTime();
                            const timeDiff = Math.abs(existingTime - newTime);
                            const sameReps = existingAttempt.repetitions === newAttempt.repetitions;
                            const sameWeight = existingAttempt.weight === newAttempt.weight;
                            return (existingAttempt.timestamp === newAttempt.timestamp) ||
                                (timeDiff < 100 && sameReps && sameWeight);
                        });
                        if (!isDuplicate) {
                            if (!newAttempt.setNumber) {
                                const existingSets = attempts
                                    .filter(a => a.setNumber)
                                    .map(a => a.setNumber);
                                newAttempt.setNumber = existingSets.length > 0 ?
                                    Math.max(...existingSets) + 1 : 1;
                            }
                            attempts.push(newAttempt);
                        }
                    });
                }
                attempts.sort((a, b) => {
                    const timeA = new Date(a.timestamp).getTime();
                    const timeB = new Date(b.timestamp).getTime();
                    return timeA - timeB;
                });
                const bestResult = Object.assign(Object.assign({}, (existing.bestResult || {})), (newData.bestResult || {}));
                if (existing.bestResult && newData.bestResult) {
                    bestResult.reps = Math.max(existing.bestResult.reps || 0, newData.bestResult.reps || 0);
                    bestResult.weight = Math.max(existing.bestResult.weight || 0, newData.bestResult.weight || 0);
                    bestResult.formScore = Math.max(existing.bestResult.formScore || 0, newData.bestResult.formScore || 0);
                }
                mergedResults[exerciseId] = Object.assign(Object.assign(Object.assign({}, existing), newData), { attempts,
                    bestResult });
            }
            else {
                mergedResults[exerciseId] = exerciseResults[exerciseId];
            }
        });
        logger_1.default.info(`Merged exercise results:`, mergedResults);
        session.exerciseResults = mergedResults;
        await data_source_1.AppDataSource.getRepository(models_1.WorkoutSession).save(session);
        logger_1.default.info(`Successfully saved exercise results for session ${sessionId}`);
        res.json({
            data: session
        });
    }
    catch (error) {
        logger_1.default.error('Error saving session exercise results:', error);
        next(error instanceof errors_1.AppError ? error : new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error saving session exercise results', 500, error));
    }
};
exports.saveSessionExerciseResults = saveSessionExerciseResults;
//# sourceMappingURL=WorkoutSessionController.js.map