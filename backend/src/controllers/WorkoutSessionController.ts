import { Request, Response, NextFunction } from 'express';
import { WorkoutSessionService } from '../services/WorkoutSessionService';
import { formatResponse } from '../utils/response-formatter';
import { AppError, ErrorType } from '../utils/errors';
import logger from '../utils/logger';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { 
    SessionStatus, 
    ExerciseStatus,
    UserRole,
    FeedbackType,
    DifficultyRating,
    EnjoymentRating,
    Difficulty,
    WorkoutCategory
} from '../models/shared/Enums';
import {
    WorkoutSession,
    WorkoutSummary,
    WorkoutPlan,
    WorkoutExercise,
    Exercise,
    User,
    MetricTracking,
    Feedback,
    WorkoutRating,
    ExerciseFormAnalysis,
    Achievement,
    BestResult,
    ExerciseResult,
    ExerciseAttempt,
    PlannedExercise,
    ActualExercise,
    ExerciseSequence,
    ExerciseSummary
} from '../models';
import { AppDataSource } from '../data-source';
import { Between, In, Not } from 'typeorm';
import { RelationshipLoader } from '../utils/RelationshipLoader';
import { OrphanedExerciseHandler } from '../utils/orphanedExerciseHandler';
import { IsNotEmpty } from 'class-validator';
import { IdConverter } from '../utils/idConverter';
import { AchievementService } from '../services/AchievementService';

// DTOs for request validation
class StartSessionDto {
    @IsNotEmpty({ message: 'Workout Plan ID is required' })
    workoutPlanId: string | number;
}

class RecordExerciseDto {
    repetitions?: number;
    duration?: number;
    formScore: number;
    weight?: number;
    resistance?: number;
    notes?: string;
    setNumber: number;
}

class SkipExerciseDto {
    reason?: string;
}

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
        role: UserRole;
        isAdmin?: boolean;
    };
}

// Type for workout with relationships
interface WorkoutWithRelations extends Omit<WorkoutSession, 'summary'> {
  workoutPlan: WorkoutPlan;
  summary?: WorkoutSummary;
  metrics: MetricTracking[];
  feedback: Feedback[];
  ratings: WorkoutRating[];
  formAnalysis: ExerciseFormAnalysis[];
  achievements: Achievement[];
}

// Initialize service
const sessionService = new WorkoutSessionService();

/**
 * Start a new workout session
 */
export const startSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { workoutPlanId } = req.body;
        const userId = req.user.id;

        logger.info(`Starting workout session for plan ID ${workoutPlanId} (type: ${typeof workoutPlanId}) for user ${userId}`);
        
        let sessionResponse: any = null;
        
        // Use transaction to ensure consistency and prevent duplicates
        await AppDataSource.transaction(async transactionalEntityManager => {
            // Find the most recent session for this user and workout plan
            const existingSessions = await transactionalEntityManager.query(
                `SELECT * FROM workout_sessions 
                 WHERE user_id = $1 
                 AND workout_plan_id = $2
                 ORDER BY "createdAt" DESC
                 LIMIT 1
                 FOR UPDATE`,  // Lock this row to prevent race conditions
                [userId, workoutPlanId]
            );
            
            const latestSession = existingSessions && existingSessions.length > 0 ? existingSessions[0] : null;
            
            // If we have a recent session that is ACTIVE or PAUSED, use that instead of creating a new one
            if (latestSession && (latestSession.status === 'ACTIVE' || latestSession.status === 'PAUSED')) {
                logger.info(`Found existing ${latestSession.status} session ${latestSession.id} for user ${userId} and workout plan ${workoutPlanId}`);
                
                // Get exercises for response
                const planExercises = await transactionalEntityManager.query(
                    `SELECT we.id, we."order", we.exercise_id, we.repetitions, we.duration, we."restTime", we.sets,
                     e.name as exercise_name, e.description as exercise_description  
                     FROM workout_exercises we
                     LEFT JOIN exercises e ON we.exercise_id = e.id
                     WHERE we.workout_plan_id = $1 
                     ORDER BY we."order"`,
                    [workoutPlanId]
                );
                
                // Get workout plan for response
                const workoutPlanResult = await transactionalEntityManager.query(
                    'SELECT id, name, description FROM workout_plans WHERE id = $1',
                    [workoutPlanId]
                );
                
                const workoutPlan = workoutPlanResult[0];
                
                // Create exercises list
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
                        targetSets: ex.sets || 3 // Default value needed by frontend
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
                
                // Parse exercise sequence
                let exerciseSequence: any = null;
                try {
                    exerciseSequence = JSON.parse(latestSession.exerciseSequence);
                } catch(err) {
                    logger.warn(`Could not parse exercise sequence for session ${latestSession.id}:`, err);
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
                
                // Use existing session
                sessionResponse = {
                    ...latestSession,
                    exerciseSequence: exerciseSequence,
                    workoutPlan: {
                        id: workoutPlan.id,
                        name: workoutPlan.name,
                        description: workoutPlan.description,
                        exercises: exercises_list
                    }
                };
                
                return;
            } 
            
            // If we have a COMPLETED session and it was completed less than 5 minutes ago, don't allow a new one
            if (latestSession && latestSession.status === 'COMPLETED') {
                const completedTime = new Date(latestSession.endTime);
                const now = new Date();
                const diffMinutes = (now.getTime() - completedTime.getTime()) / (1000 * 60);
                
                // Remove the 5-minute restriction to allow more flexible workout start
                logger.info(`Workout was recently completed. Allowing a new session to start.`);
                // We'll still create a new session below, no need for any error
            }
            
            // If we have any active/paused/pending sessions, cancel them first
            const activeOrPendingSessions = await transactionalEntityManager.query(
                `SELECT * FROM workout_sessions 
                 WHERE user_id = $1 
                 AND status IN ('ACTIVE', 'PENDING', 'PAUSED')
                 FOR UPDATE`,  // Lock these rows to prevent race conditions
                [userId]
            );
            
            // Mark all existing active sessions as CANCELLED - we'll create a fresh one
            if (activeOrPendingSessions && activeOrPendingSessions.length > 0) {
                logger.info(`Found ${activeOrPendingSessions.length} existing active/paused/pending sessions for user ${userId}`);
                
                // Cancel ALL existing sessions to start fresh
                try {
                    for (const session of activeOrPendingSessions) {
                        await transactionalEntityManager.query(
                            `UPDATE workout_sessions 
                             SET status = 'CANCELLED', "endTime" = $1, "updatedAt" = $1
                             WHERE id = $2`,
                            [new Date(), session.id]
                        );
                        logger.info(`Cancelled existing session ${session.id} to start fresh`);
                    }
                } catch (cancelError) {
                    logger.error(`Error cancelling existing sessions: ${cancelError}`);
                    // Continue anyway - don't let this stop us from creating a new session
                }
            }
            
            // Get the workout plan 
            const results = await transactionalEntityManager.query(
                'SELECT id, name, description FROM workout_plans WHERE id = $1',
                [workoutPlanId]
            );

            if (!results || results.length === 0) {
                throw new AppError(ErrorType.NOT_FOUND, `Workout plan with ID ${workoutPlanId} not found`, 404);
            }
            
            const workoutPlan = results[0];
            
            // Get exercises for this workout plan
            const exercises = await transactionalEntityManager.query(
                'SELECT id, "order", exercise_id, sets FROM workout_exercises WHERE workout_plan_id = $1 ORDER BY "order"',
                [workoutPlan.id]
            );
            
            // Create exercise sequence structure with default exercise if empty
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
            
            // Create the new session with improved error handling
            try {
                const result = await transactionalEntityManager.query(
                    `INSERT INTO workout_sessions 
                    (user_id, workout_plan_id, status, "startTime", "createdAt", "updatedAt", "exerciseResults", summary, "exerciseSequence") 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                    RETURNING *`,  // Return the entire session record
                    [
                        userId, 
                        workoutPlan.id, 
                        'ACTIVE', // Start as ACTIVE to ensure timer works
                        new Date(), 
                        new Date(), 
                        new Date(),
                        JSON.stringify({}), // Empty exerciseResults object
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
                    ]
                );

                if (!result || result.length === 0) {
                    logger.error('Failed to create new session - no result returned from query');
                    throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to create new session', 500);
                }

                const newSession = result[0];
                logger.info(`Created new ACTIVE session with ID: ${newSession.id}`);

                // Get exercises for response
                const planExercises = await transactionalEntityManager.query(
                    `SELECT we.id, we."order", we.exercise_id, we.repetitions, we.duration, we."restTime", we.sets, 
                     e.name as exercise_name, e.description as exercise_description  
                     FROM workout_exercises we
                     LEFT JOIN exercises e ON we.exercise_id = e.id
                     WHERE we.workout_plan_id = $1 
                     ORDER BY we."order"`,
                    [workoutPlan.id]
                );

                // Create a default exercise if none found
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
                        targetSets: ex.sets || 3 // Default value needed by frontend
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

                // Prepare response with the new session
                sessionResponse = {
                    ...newSession,
                    exerciseSequence: exerciseSequence,
                    workoutPlan: {
                        id: workoutPlan.id,
                        name: workoutPlan.name,
                        description: workoutPlan.description,
                        exercises: exercises_list
                    }
                };
            } catch (insertError) {
                logger.error('Error creating new session:', insertError);
                throw new AppError(ErrorType.SERVICE_ERROR, `Error creating workout session: ${insertError.message}`, 500, insertError);
            }
        });
        
        // Return the appropriate response
        if (sessionResponse) {
            const statusCode = sessionResponse.id ? 200 : 201; // 200 for existing, 201 for new
            res.status(statusCode).json(sessionResponse);
        } else {
            throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to create or find session', 500);
        }
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            logger.error('Unexpected error starting session:', error);
            next(new AppError(ErrorType.SERVICE_ERROR, `Error starting session: ${error.message || 'Unknown error'}`, 500, error));
        }
    }
};

/**
 * Get session by ID
 */
export const getSessionById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        // Get base session
        const session = await AppDataSource
            .getRepository(WorkoutSession)
            .findOne({
                where: { id: sessionId, user: { id: userId } }
            }) as WorkoutWithRelations;

        if (!session) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }

        // Load relationships
        const [workoutPlan, metrics, feedback, ratings, formAnalysis, achievements] = await Promise.all([
            RelationshipLoader.loadRelationship('WorkoutSession', 'workoutPlan', sessionId, AppDataSource.getRepository(WorkoutPlan)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'metrics', sessionId, AppDataSource.getRepository(MetricTracking)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'feedback', sessionId, AppDataSource.getRepository(Feedback)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'ratings', sessionId, AppDataSource.getRepository(WorkoutRating)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'formAnalysis', sessionId, AppDataSource.getRepository(ExerciseFormAnalysis)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'achievements', sessionId, AppDataSource.getRepository(Achievement))
        ]);

        // Attach relationships
        session.workoutPlan = workoutPlan[0];
        session.metrics = metrics;
        session.feedback = feedback;
        session.ratings = ratings;
        session.formAnalysis = formAnalysis;
        session.achievements = achievements;

        res.json(session);
    } catch (error) {
        logger.error('Error fetching session:', error);
        next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching session', 500, error));
    }
};

/**
 * Get user sessions with filtering
 */
export const getUserSessions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user.id;
        const { status, startDateMin, startDateMax, limit = 10, offset = 0 } = req.query;

        // Use query builder for more explicit control
        const queryBuilder = AppDataSource
            .getRepository(WorkoutSession)
            .createQueryBuilder('session')
            .where('session.user_id = :userId', { userId });
        
        // Handle status filtering
        if (status) {
            if (Array.isArray(status)) {
                queryBuilder.andWhere('session.status IN (:...statuses)', { statuses: status });
            } else {
                queryBuilder.andWhere('session.status = :status', { status });
            }
        }

        // Handle date filtering
        if (startDateMin && startDateMax) {
            queryBuilder.andWhere('session.startTime BETWEEN :minDate AND :maxDate', { 
                minDate: new Date(startDateMin as string), 
                maxDate: new Date(startDateMax as string) 
            });
        }

        // Add pagination and ordering
        queryBuilder
            .orderBy('session.startTime', 'DESC')
            .skip(Number(offset))
            .take(Number(limit));

        // Get base sessions
        let sessions: WorkoutSession[] = [];
        let total = 0;

        try {
            [sessions, total] = await queryBuilder.getManyAndCount();
            logger.info(`Found ${sessions.length} sessions for user ${userId}`);
        } catch (error) {
            logger.error('Error querying workout sessions:', error);
            // Return empty array rather than failing completely
            sessions = [];
            total = 0;
        }

        const workoutSessions = sessions as WorkoutWithRelations[];

        if (workoutSessions.length > 0) {
            const sessionIds = workoutSessions.map(s => s.id);
            
            try {
                // Batch load relationships
                const [workoutPlansMap, summariesMap] = await Promise.all([
                    RelationshipLoader.loadRelationshipBatch('WorkoutSession', 'workoutPlan', sessionIds, AppDataSource.getRepository(WorkoutPlan)),
                    RelationshipLoader.loadRelationshipBatch('WorkoutSession', 'summary', sessionIds, AppDataSource.getRepository(WorkoutSummary))
                ]);

                // Attach relationships
                workoutSessions.forEach(session => {
                    const workoutPlan = workoutPlansMap.get(session.id)?.[0];
                    if (workoutPlan) {
                        session.workoutPlan = workoutPlan;
                    } else {
                        // Provide a default or placeholder workoutPlan to avoid errors
                        logger.warn(`Workout plan not found for session ${session.id}`);
                    }
                    session.summary = summariesMap.get(session.id)?.[0];
                });
            } catch (error) {
                logger.error('Error loading relationships for workout sessions:', error);
                // Continue even if relationship loading failed
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
    } catch (error) {
        logger.error('Error fetching user sessions:', error);
        next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching user sessions', 500, error));
    }
};

/**
 * Record exercise completion
 */
export const recordExerciseCompletion = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId, exerciseId } = req.params;
        const userId = req.user.id;
        const exerciseData = plainToClass(RecordExerciseDto, req.body);

        logger.info(`Recording exercise completion - Session: ${sessionId}, Exercise: ${exerciseId}, User: ${userId}`);
        logger.info(`Request body: ${JSON.stringify(req.body)}`);

        // Validate input
        try {
            await validateOrReject(exerciseData);
        } catch (errors) {
            logger.error(`Validation errors: ${JSON.stringify(errors)}`);
            throw new AppError(ErrorType.VALIDATION_ERROR, 'Invalid exercise data', 400, errors);
        }

        // Validate form score
        if (exerciseData.formScore < 0 || exerciseData.formScore > 10) {
            throw new AppError(ErrorType.VALIDATION_ERROR, 'Form score must be between 0 and 10', 400);
        }

        // Get session by direct query to ensure we get the correct one
        logger.info(`Fetching session with ID ${sessionId} for user ${userId}`);
        const sessionResult = await AppDataSource.query(
            `SELECT * FROM workout_sessions WHERE id = $1 AND user_id = $2`,
            [sessionId, userId]
        );

        if (!sessionResult || sessionResult.length === 0) {
            logger.error(`Session not found - ID: ${sessionId}, User: ${userId}`);
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }

        // Parse the session from query result
        const session = sessionResult[0];
        logger.info(`Found session with status: ${session.status}`);
        
        // Check session status - allow both ACTIVE and PAUSED sessions
        if (session.status !== 'ACTIVE' && session.status !== 'PAUSED') {
            logger.error(`Invalid session status: ${session.status} - Cannot record exercise`);
            throw new AppError(ErrorType.VALIDATION_ERROR, `Cannot record exercise for session with status ${session.status}`, 400);
        }

        // Get workout plan
        logger.info(`Fetching workout plan with ID ${session.workout_plan_id}`);
        const workoutPlanResult = await AppDataSource.query(
            `SELECT * FROM workout_plans WHERE id = $1`,
            [session.workout_plan_id]
        );

        if (!workoutPlanResult || workoutPlanResult.length === 0) {
            logger.error(`Workout plan not found - ID: ${session.workout_plan_id}`);
            throw new AppError(ErrorType.NOT_FOUND, 'Workout plan not found', 404);
        }

        // Initialize exercise results if needed
        logger.info(`Current exercise results: ${session.exerciseResults || '{}'}`);
        let exerciseResults = {};
        try {
            exerciseResults = session.exerciseResults ? JSON.parse(session.exerciseResults) : {};
        } catch (error) {
            logger.error(`Error parsing exercise results: ${error}`);
            exerciseResults = {};
        }
        
        // Define the type for the summary object
        interface WorkoutSummary {
            formScore: number;
            totalReps: number;
            totalSets: number;
            focusAreas: string[];
            muscleGroups: string[];
            totalDuration: number;
            caloriesBurned: number;
            totalExercises: number;
            uniqueExercises: number;
            exerciseSummaries: any[];
        }

        let summary: WorkoutSummary = {
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
                summary = {
                    ...summary,
                    ...parsedSummary
                };
            }
        } catch (error) {
            logger.error(`Error parsing summary: ${error}`);
            // Use the default summary initialized above
        }
        
        // Initialize exercise result if needed
        if (!exerciseResults[exerciseId]) {
            logger.info(`Initializing exercise result for exercise ${exerciseId}`);
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

        // Create and add attempt
        const attempt = {
            timestamp: new Date(),
            repetitions: exerciseData.repetitions || 0,
            duration: exerciseData.duration || 0,
            formScore: exerciseData.formScore,
            weight: exerciseData.weight || 0,
            notes: exerciseData.notes || ''
        };
        
        logger.info(`Created attempt: ${JSON.stringify(attempt)}`);

        // Add attempt to the exercise results
        exerciseResults[exerciseId].attempts.push(attempt);
        
        // Update best result if this is the first attempt or if this attempt is better
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

        // Update summary metrics
        summary.totalSets = (summary.totalSets || 0) + 1;
        summary.totalReps = (summary.totalReps || 0) + (attempt.repetitions || 0);
        summary.formScore = Math.round(
            ((summary.formScore || 0) * ((summary.totalSets || 1) - 1) + attempt.formScore) / (summary.totalSets || 1)
        );

        // Stringify exercise results and summary for storage
        const exerciseResultsJson = JSON.stringify(exerciseResults);
        const summaryJson = JSON.stringify(summary);
        
        logger.info(`Updating session with exercise results: ${exerciseResultsJson.substring(0, 100)}...`);

        // Directly update the session in the database with raw query
        try {
            const updateResult = await AppDataSource.query(
                `UPDATE workout_sessions 
                SET "exerciseResults" = $1::jsonb, 
                    summary = $2::jsonb,
                    "updatedAt" = $3
                WHERE id = $4 
                AND user_id = $5
                RETURNING *`,
                [
                    exerciseResultsJson,
                    summaryJson,
                    new Date(),
                    sessionId,
                    userId
                ]
            );

            if (!updateResult || updateResult.length === 0) {
                logger.error(`Failed to update session ${sessionId}`);
                throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to update session', 500);
            }

            logger.info(`Successfully recorded exercise completion for session ${sessionId}, exercise ${exerciseId}`);
            
            // Return the updated session without loading relationships to avoid duplication
            res.json(updateResult[0]);
        } catch (dbError) {
            logger.error(`Database error updating session: ${dbError}`);
            throw new AppError(ErrorType.SERVICE_ERROR, 'Database error updating session', 500, dbError);
        }
    } catch (error) {
        logger.error('Error recording exercise completion:', error);
        next(error instanceof AppError ? error : new AppError(ErrorType.SERVICE_ERROR, 'Error recording exercise completion', 500, error));
    }
};

/**
 * Skip exercise
 */
export const skipExercise = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId, exerciseId } = req.params;
        const userId = req.user.id;
        const skipData = plainToClass(SkipExerciseDto, req.body);

        // Validate input
        await validateOrReject(skipData).catch(errors => {
            throw new AppError(ErrorType.VALIDATION_ERROR, 'Invalid skip data', 400, errors);
        });

        // Get session with relationships
        const session = await AppDataSource
            .getRepository(WorkoutSession)
            .findOne({
                where: { 
                    id: sessionId,
                    user: { id: userId }
                }
            }) as WorkoutWithRelations;

        if (!session) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }

        if (session.status !== SessionStatus.ACTIVE && session.status !== SessionStatus.PAUSED) {
            throw new AppError(ErrorType.VALIDATION_ERROR, 'Cannot skip exercise in non-active session', 400);
        }

        // Load workout plan and exercises
        const [workoutPlan] = await RelationshipLoader.loadRelationship(
            'WorkoutSession',
            'workoutPlan',
            sessionId,
            AppDataSource.getRepository(WorkoutPlan)
        );

        if (!workoutPlan) {
            throw new AppError(ErrorType.NOT_FOUND, 'Workout plan not found', 404);
        }

        // Find the exercise in the workout plan
        const workoutExercise = workoutPlan.exercises?.find(e => e.exercise_id === exerciseId);
        if (!workoutExercise) {
            throw new AppError(ErrorType.NOT_FOUND, 'Exercise not found in workout plan', 404);
        }

        // Update session exercise results
        if (!session.exerciseResults) {
            session.exerciseResults = {};
        }

        session.exerciseResults[exerciseId] = {
            status: ExerciseStatus.SKIPPED,
            attempts: [],
            bestResult: new BestResult(),
            skipReason: skipData.reason || 'No reason provided'
        };

        // Save session
        const savedSession = await AppDataSource.getRepository(WorkoutSession).save(session);

        // Load relationships for response
        const [updatedWorkoutPlan, summary] = await Promise.all([
            RelationshipLoader.loadRelationship('WorkoutSession', 'workoutPlan', savedSession.id, AppDataSource.getRepository(WorkoutPlan)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'summary', savedSession.id, AppDataSource.getRepository(WorkoutSummary))
        ]);

        // Attach relationships
        savedSession.workoutPlan = updatedWorkoutPlan[0];
        savedSession.summary = summary[0];

        res.json(savedSession);
    } catch (error) {
        logger.error('Error skipping exercise:', error);
        next(new AppError(ErrorType.SERVICE_ERROR, 'Error skipping exercise', 500, error));
    }
};

/**
 * Pause workout session
 */
export const pauseSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { duration, caloriesBurned } = req.body;

        logger.info(`Attempting to pause session ${sessionId}`);
        logger.info(`Pause session request data: duration=${duration}, calories=${caloriesBurned}`);

        // Fetch the session to calculate metrics before pausing
        const session = await AppDataSource
            .getRepository(WorkoutSession)
            .findOne({
                where: { id: sessionId, user: { id: userId } },
                relations: ['workoutPlan']
            });
            
        if (!session) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        
        if (session.status !== SessionStatus.ACTIVE) {
            throw new AppError(ErrorType.VALIDATION_ERROR, 'Can only pause an active session', 400);
        }
        
        // Use the session service to ensure all business logic is applied
        const workoutSessionService = new WorkoutSessionService();
        const pausedSession = await workoutSessionService.pauseSession(sessionId, { 
            duration, 
            caloriesBurned 
        });
        
        res.json(pausedSession);
    } catch (error) {
        logger.error('Error pausing session:', error);
        next(new AppError(ErrorType.SERVICE_ERROR, 'Error pausing session', 500, error));
    }
};

/**
 * Resume workout session
 */
export const resumeSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        logger.info(`Attempting to resume session ${sessionId} for user ${userId}`);

        // First verify that the session belongs to the user
        const session = await AppDataSource
            .getRepository(WorkoutSession)
            .findOne({
                where: { id: sessionId, user: { id: userId } }
            });

        if (!session) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }

        // Add detailed logging for the current session state
        logger.info(`Session ${sessionId} current status: ${session.status}`);

        if (session.status !== SessionStatus.PAUSED) {
            const errorMessage = `Cannot resume session. Session is in state: ${session.status}`;
            logger.error(errorMessage);
            throw new AppError(ErrorType.VALIDATION_ERROR, 'Can only resume a paused session', 400);
        }

        // Use the service to handle the resume logic
        const workoutSessionService = new WorkoutSessionService();
        const resumedSession = await workoutSessionService.resumeSession(sessionId);
        
        // Return in a format compatible with both old and new frontend code
        const response = {
            ...resumedSession, // For backward compatibility
            success: true,
            data: resumedSession, // For updated frontend code
            message: 'Session resumed successfully'
        };
        
        res.json(response);
    } catch (error) {
        logger.error(`Error resuming session ${req.params.sessionId}:`, error);
        next(error instanceof AppError ? error : new AppError(ErrorType.SERVICE_ERROR, 'Error resuming session', 500, error));
    }
};

/**
 * Complete workout session
 */
export const completeSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { duration, caloriesBurned, exerciseResults } = req.body;

        logger.info(`Attempting to complete session ${sessionId}`);
        logger.info(`Complete session request data: duration=${duration}, calories=${caloriesBurned}`);

        // Fetch the session to calculate metrics before completing
        const session = await AppDataSource
            .getRepository(WorkoutSession)
            .findOne({
                where: { id: sessionId, user: { id: userId } },
                relations: ['workoutPlan']
            });
            
        if (!session) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        
        if (session.status !== SessionStatus.ACTIVE && session.status !== SessionStatus.PAUSED) {
            throw new AppError(ErrorType.VALIDATION_ERROR, 'Can only complete an active or paused session', 400);
        }
        
        // Use the duration provided in seconds
        const now = new Date();
        let totalDurationSeconds = duration || 0;
        
        if (!totalDurationSeconds && session.startTime) {
            // If no duration provided, calculate it from start to now (in seconds)
            totalDurationSeconds = Math.round((now.getTime() - session.startTime.getTime()) / 1000);
        }
        
        // No minimum duration - record the exact time
        
        // Convert duration to minutes for calorie calculation
        const durationInMinutes = totalDurationSeconds / 60;
        
        // Calculate calories burned (simple calculation - 7 calories per minute of exercise)
        // Ensure minimum calories value
        const calculatedCaloriesBurned = caloriesBurned || Math.max(Math.round(durationInMinutes * 7), 1);
        
        // Get exercise results for summary
        let sessionExerciseResults = {};
        
        // If client provided exercise results in the request, use those
        if (exerciseResults && typeof exerciseResults === 'object') {
            sessionExerciseResults = exerciseResults;
            logger.info('Using exercise results from request');
        } else {
            // Otherwise use what's in the session
            try {
                sessionExerciseResults = session.exerciseResults ? 
                    (typeof session.exerciseResults === 'string' ? 
                        JSON.parse(session.exerciseResults) : session.exerciseResults) : {};
                logger.info('Using exercise results from session');
            } catch (error) {
                logger.error(`Error parsing exercise results: ${error}`);
                sessionExerciseResults = {};
            }
        }
        
        // Calculate total sets and repetitions
        let totalSets = 0;
        let totalReps = 0;
        let formScoreSum = 0;
        let formScoreCount = 0;
        
        Object.values(sessionExerciseResults).forEach((result: any) => {
            if (result.attempts && Array.isArray(result.attempts)) {
                totalSets += result.attempts.length;
                result.attempts.forEach((attempt: any) => {
                    totalReps += attempt.repetitions || 0;
                    if (typeof attempt.formScore === 'number') {
                        formScoreSum += attempt.formScore;
                        formScoreCount++;
                    }
                });
            }
        });
        
        // Calculate average form score
        const avgFormScore = formScoreCount > 0 ? Math.round(formScoreSum / formScoreCount) : 7;
        
        // Create summary object - store duration in seconds
        const summaryData = {
            formScore: avgFormScore,
            totalReps: totalReps,
            totalSets: Math.max(totalSets, 1),
            focusAreas: [],
            muscleGroups: [],
            totalDuration: totalDurationSeconds, // Store in seconds directly
            caloriesBurned: calculatedCaloriesBurned,
            totalExercises: session.workoutPlan ? 
                (session.workoutPlan.exercises ? session.workoutPlan.exercises.length : 3) : 3,
            uniqueExercises: session.workoutPlan ? 
                (session.workoutPlan.exercises ? session.workoutPlan.exercises.length : 3) : 3,
            exerciseSummaries: []
        };
        
        // Use a transaction to update all fields
        await AppDataSource.transaction(async transactionalEntityManager => {
            // Update session status, end time, and metrics
            await transactionalEntityManager.query(
                `UPDATE workout_sessions 
                 SET status = 'COMPLETED', 
                     "endTime" = $1, 
                     "totalDuration" = $2,
                     "caloriesBurned" = $3,
                     "summary" = $4,
                     "updatedAt" = $1
                 WHERE id = $5
                 AND user_id = $6
                 AND status IN ('ACTIVE', 'PAUSED')
                 RETURNING *`,
                [now, totalDurationSeconds, calculatedCaloriesBurned, JSON.stringify(summaryData), sessionId, userId]
            );
        });
        
        // Fetch the updated session to return to client
        const updatedSession = await AppDataSource
            .getRepository(WorkoutSession)
            .findOne({
                where: { id: sessionId },
                relations: ['workoutPlan']
            });
            
        if (!updatedSession) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found after update', 404);
        }
        
        logger.info(`Successfully completed session ${sessionId}`);

        // After successfully completing the session, update achievements
        try {
            // Initialize Achievement Service
            const achievementService = new AchievementService();
            
            // Trigger achievement check and update based on the completed session
            // This will update all achievement types including time-based ones (Early Bird, Night Owl, Weekend Warrior)
            const userAchievements = await achievementService.getUserAchievements(userId);
            
            // Log achievement progress
            logger.info(`Updated achievements for user ${userId} after completing session ${sessionId}`);
        } catch (achievementError) {
            // Don't fail the session completion if achievements update fails
            logger.error(`Error updating achievements: ${achievementError}`);
        }
        
        res.json(updatedSession);
    } catch (error) {
        logger.error('Error completing session:', error);
        next(error instanceof AppError ? error : new AppError(ErrorType.SERVICE_ERROR, 'Error completing session', 500, error));
    }
};

/**
 * Cancel workout session
 */
export const cancelSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        // Direct query to cancel session and return updated record
        const results = await AppDataSource.query(
            `UPDATE workout_sessions 
             SET status = 'CANCELLED', 
                 "endTime" = $1, 
                 "updatedAt" = $1
             WHERE id = $2
             AND user_id = $3
             AND status NOT IN ('COMPLETED', 'CANCELLED')
             RETURNING *`,
            [new Date(), sessionId, userId]
        );

        if (!results || results.length === 0) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found or already cancelled/completed', 404);
        }

        // Return the updated session
        res.json(results[0]);
    } catch (error) {
        logger.error('Error cancelling session:', error);
        next(error instanceof AppError ? error : new AppError(ErrorType.SERVICE_ERROR, 'Error cancelling session', 500, error));
    }
};

/**
 * Get session exercises with completion status
 */
export const getSessionExercises = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        // Get base session
        let session;
        try {
            session = await AppDataSource
                .getRepository(WorkoutSession)
                .findOne({
                    where: { id: sessionId, user: { id: userId } }
                });
        } catch (error) {
            logger.error(`Error finding session with ID ${sessionId}:`, error);
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }

        if (!session) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }

        // Load workout plan
        let workoutPlan;
        try {
            const workoutPlans = await RelationshipLoader.loadRelationship(
                'WorkoutSession', 
                'workoutPlan', 
                sessionId, 
                AppDataSource.getRepository(WorkoutPlan)
            );
            workoutPlan = workoutPlans[0];
        } catch (error) {
            logger.error(`Error loading workout plan for session ${sessionId}:`, error);
            throw new AppError(ErrorType.NOT_FOUND, 'Workout plan not found', 404);
        }

        if (!workoutPlan) {
            throw new AppError(ErrorType.NOT_FOUND, 'Workout plan not found', 404);
        }

        // Use the orphaned exercise handler to safely load exercises
        let exercises: WorkoutExercise[] = [];
        try {
            exercises = await OrphanedExerciseHandler.safelyLoadExercises(session.workoutPlanId);
            logger.info(`Loaded ${exercises.length} exercises for session ${sessionId}, including possible orphaned exercises`);
        } catch (error) {
            logger.warn(`Error loading exercises for session ${sessionId}:`, error);
            // Continue with empty exercises rather than failing
        }

        // Attach exercises to workout plan
        workoutPlan.exercises = exercises;

        res.json(workoutPlan.exercises);
    } catch (error) {
        logger.error('Error fetching session exercises:', error);
        next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching session exercises', 500, error));
    }
};

/**
 * Get session summary
 */
export const getSessionSummary = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        // Get base session
        const session = await AppDataSource
            .getRepository(WorkoutSession)
            .findOne({
                where: { id: sessionId, user: { id: userId } }
            });

        if (!session) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }

        // Load summary
        const summary = await RelationshipLoader.loadRelationship('WorkoutSession', 'summary', sessionId, AppDataSource.getRepository(WorkoutSummary));

        if (!summary[0]) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session summary not found', 404);
        }

        res.json(summary[0]);
    } catch (error) {
        logger.error('Error fetching session summary:', error);
        next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching session summary', 500, error));
    }
};

/**
 * Get active session
 */
export const getActiveSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user.id;

        // Get active session
        let session: WorkoutWithRelations | null = null;
        try {
            // Use raw query to avoid TypeORM enum handling issues
            const queryResult = await AppDataSource.query(
                `SELECT * FROM workout_sessions 
                 WHERE user_id = $1 
                 AND status IN ('ACTIVE', 'PAUSED')
                 ORDER BY "startTime" DESC LIMIT 1`,
                [userId]
            );
            
            if (queryResult && queryResult.length > 0) {
                session = queryResult[0] as WorkoutWithRelations;
                logger.info(`Found active session: ${session?.id || 'none'}`);
            } else {
                logger.info(`No active session found for user ${userId}`);
            }
        } catch (error) {
            logger.error('Error finding active session:', error);
            // Return 404 but don't throw an error
            res.status(404).json({ message: 'No active session found' });
            return;
        }

        if (!session) {
            res.status(404).json({ message: 'No active session found' });
            return;
        }

        try {
            // Load relationships
            const [workoutPlan, metrics, feedback, ratings, formAnalysis, achievements] = await Promise.all([
                RelationshipLoader.loadRelationship('WorkoutSession', 'workoutPlan', session.id, AppDataSource.getRepository(WorkoutPlan)),
                RelationshipLoader.loadRelationship('WorkoutSession', 'metrics', session.id, AppDataSource.getRepository(MetricTracking)),
                RelationshipLoader.loadRelationship('WorkoutSession', 'feedback', session.id, AppDataSource.getRepository(Feedback)),
                RelationshipLoader.loadRelationship('WorkoutSession', 'ratings', session.id, AppDataSource.getRepository(WorkoutRating)),
                RelationshipLoader.loadRelationship('WorkoutSession', 'formAnalysis', session.id, AppDataSource.getRepository(ExerciseFormAnalysis)),
                RelationshipLoader.loadRelationship('WorkoutSession', 'achievements', session.id, AppDataSource.getRepository(Achievement))
            ]);

            // Attach relationships
            if (workoutPlan && workoutPlan.length > 0) {
                session.workoutPlan = workoutPlan[0];
            }
            session.metrics = metrics || [];
            session.feedback = feedback || [];
            session.ratings = ratings || [];
            session.formAnalysis = formAnalysis || [];
            session.achievements = achievements || [];

            // Load exercises for workout plan if it exists
            if (session.workoutPlan) {
                try {
                    const exercises = await RelationshipLoader.loadRelationship(
                        'WorkoutPlan',
                        'exercises',
                        session.workoutPlan.id,
                        AppDataSource.getRepository(WorkoutExercise)
                    );
                    session.workoutPlan.exercises = exercises || [];
                } catch (exerciseError) {
                    logger.warn(`Error loading exercises for workout plan ${session.workoutPlan.id}:`, exerciseError);
                    session.workoutPlan.exercises = [];
                }
            }
        } catch (relationshipError) {
            logger.warn('Error loading relationships for active session:', relationshipError);
            // Continue with partial data rather than failing completely
        }

        res.json(session);
    } catch (error) {
        logger.error('Error fetching active session:', error);
        next(new AppError(ErrorType.SERVICE_ERROR, 'Error fetching active session', 500, error));
    }
};

/**
 * Update session status
 */
export const updateSessionStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { status } = req.body;

        // Validate status
        if (!Object.values(SessionStatus).includes(status)) {
            throw new AppError(ErrorType.VALIDATION_ERROR, 'Invalid session status', 400);
        }

        // Get session with relationships
        const session = await AppDataSource
            .getRepository(WorkoutSession)
            .findOne({
                where: { 
                    id: sessionId,
                    user: { id: userId }
                }
            }) as WorkoutWithRelations;

        if (!session) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }

        // Validate status transition
        const validTransitions: { [key: string]: SessionStatus[] } = {
            [SessionStatus.PENDING]: [SessionStatus.ACTIVE],
            [SessionStatus.ACTIVE]: [SessionStatus.PAUSED, SessionStatus.COMPLETED, SessionStatus.CANCELLED],
            [SessionStatus.PAUSED]: [SessionStatus.ACTIVE, SessionStatus.COMPLETED, SessionStatus.CANCELLED],
            [SessionStatus.COMPLETED]: [],
            [SessionStatus.CANCELLED]: []
        };

        if (!validTransitions[session.status]?.includes(status)) {
            throw new AppError(
                ErrorType.VALIDATION_ERROR,
                `Invalid status transition from ${session.status} to ${status}`,
                400
            );
        }

        // Update session status
        session.status = status;

        // Set end time if completing or cancelling
        if (status === SessionStatus.COMPLETED || status === SessionStatus.CANCELLED) {
            session.endTime = new Date();
        }

        // Save session
        const savedSession = await AppDataSource.getRepository(WorkoutSession).save(session);

        // Load relationships for response
        const [workoutPlan, metrics, feedback, ratings, formAnalysis, achievements] = await Promise.all([
            RelationshipLoader.loadRelationship('WorkoutSession', 'workoutPlan', savedSession.id, AppDataSource.getRepository(WorkoutPlan)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'metrics', savedSession.id, AppDataSource.getRepository(MetricTracking)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'feedback', savedSession.id, AppDataSource.getRepository(Feedback)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'ratings', savedSession.id, AppDataSource.getRepository(WorkoutRating)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'formAnalysis', savedSession.id, AppDataSource.getRepository(ExerciseFormAnalysis)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'achievements', savedSession.id, AppDataSource.getRepository(Achievement))
        ]);

        // Attach relationships
        savedSession.workoutPlan = workoutPlan[0];
        savedSession.metrics = metrics;
        savedSession.feedback = feedback;
        savedSession.ratings = ratings;
        savedSession.formAnalysis = formAnalysis;
        savedSession.achievements = achievements;

        // Load exercises for workout plan if it exists
        if (savedSession.workoutPlan) {
            const exercises = await RelationshipLoader.loadRelationship(
                'WorkoutPlan',
                'exercises',
                savedSession.workoutPlan.id,
                AppDataSource.getRepository(WorkoutExercise)
            );
            savedSession.workoutPlan.exercises = exercises;
        }

        res.json(savedSession);
    } catch (error) {
        logger.error('Error updating session status:', error);
        next(new AppError(ErrorType.SERVICE_ERROR, 'Error updating session status', 500, error));
    }
};

/**
 * Submit session feedback
 */
export const submitSessionFeedback = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { difficultyRating, feedback } = req.body;

        // Validate difficulty rating
        if (difficultyRating !== undefined && (difficultyRating < 1 || difficultyRating > 5)) {
            throw new AppError(ErrorType.VALIDATION_ERROR, 'Difficulty rating must be between 1 and 5', 400);
        }

        // Get session with relationships
        const session = await AppDataSource
            .getRepository(WorkoutSession)
            .findOne({
                where: { 
                    id: sessionId,
                    user: { id: userId }
                }
            }) as WorkoutWithRelations;

        if (!session) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }

        // Can only submit feedback for completed sessions
        if (session.status !== SessionStatus.COMPLETED) {
            throw new AppError(ErrorType.VALIDATION_ERROR, 'Can only submit feedback for completed sessions', 400);
        }

        // Create feedback entity
        const feedbackEntity = new Feedback();
        feedbackEntity.user = { id: userId } as User;
        feedbackEntity.workoutSession = { id: sessionId } as WorkoutSession;
        feedbackEntity.type = FeedbackType.WORKOUT_RATING;
        feedbackEntity.comment = feedback;
        feedbackEntity.entityId = sessionId;
        feedbackEntity.entityType = 'WorkoutSession';
        feedbackEntity.createdAt = new Date();

        // Create rating entity if difficulty rating provided
        const ratingEntity = difficultyRating ? new WorkoutRating() : null;
        if (ratingEntity) {
            ratingEntity.user = { id: userId } as User;
            ratingEntity.workoutSession = { id: sessionId } as WorkoutSession;
            ratingEntity.difficultyRating = difficultyRating;
            ratingEntity.createdAt = new Date();
        }

        // Save feedback and rating
        await Promise.all([
            AppDataSource.getRepository(Feedback).save(feedbackEntity),
            ratingEntity ? AppDataSource.getRepository(WorkoutRating).save(ratingEntity) : Promise.resolve()
        ]);

        // Load relationships for response
        const [workoutPlan, metrics, feedbackList, ratings, formAnalysis, achievements] = await Promise.all([
            RelationshipLoader.loadRelationship('WorkoutSession', 'workoutPlan', session.id, AppDataSource.getRepository(WorkoutPlan)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'metrics', session.id, AppDataSource.getRepository(MetricTracking)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'feedback', session.id, AppDataSource.getRepository(Feedback)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'ratings', session.id, AppDataSource.getRepository(WorkoutRating)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'formAnalysis', session.id, AppDataSource.getRepository(ExerciseFormAnalysis)),
            RelationshipLoader.loadRelationship('WorkoutSession', 'achievements', session.id, AppDataSource.getRepository(Achievement))
        ]);

        // Attach relationships
        session.workoutPlan = workoutPlan[0];
        session.metrics = metrics;
        session.feedback = feedbackList;
        session.ratings = ratings;
        session.formAnalysis = formAnalysis;
        session.achievements = achievements;

        // Load exercises for workout plan if it exists
        if (session.workoutPlan) {
            const exercises = await RelationshipLoader.loadRelationship(
                'WorkoutPlan',
                'exercises',
                session.workoutPlan.id,
                AppDataSource.getRepository(WorkoutExercise)
            );
            session.workoutPlan.exercises = exercises;
        }

        res.json(session);
    } catch (error) {
        logger.error('Error submitting session feedback:', error);
        next(new AppError(ErrorType.SERVICE_ERROR, 'Error submitting session feedback', 500, error));
    }
};

/**
 * Save all exercise results for a session
 */
export const saveSessionExerciseResults = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { exerciseResults } = req.body;

        if (!exerciseResults || typeof exerciseResults !== 'object') {
            throw new AppError(ErrorType.VALIDATION_ERROR, 'Exercise results data is required', 400);
        }

        logger.info(`Saving exercise results for session ${sessionId}`);
        logger.debug(`Exercise results data received:`, exerciseResults);

        // Fetch the session to update with relations
        const session = await AppDataSource
            .getRepository(WorkoutSession)
            .findOne({
                where: { id: sessionId, user: { id: userId } },
                relations: ['workoutPlan', 'workoutPlan.exercises', 'workoutPlan.exercises.exercise']
            });
            
        if (!session) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }
        
        if (session.status !== SessionStatus.ACTIVE && session.status !== SessionStatus.PAUSED) {
            throw new AppError(ErrorType.VALIDATION_ERROR, 'Can only update exercise results for an active or paused session', 400);
        }

        // Parse existing exercise results if they exist
        let existingResults = {};
        try {
            if (session.exerciseResults) {
                if (typeof session.exerciseResults === 'string') {
                    existingResults = JSON.parse(session.exerciseResults);
                } else {
                    existingResults = session.exerciseResults;
                }
            }
        } catch (error) {
            logger.warn(`Error parsing existing exercise results: ${error}`);
            // Continue with empty existing results
        }

        // Deep merge existing results with the new ones
        const mergedResults = {};
        
        // First add all existing results
        Object.keys(existingResults).forEach(exerciseId => {
            mergedResults[exerciseId] = existingResults[exerciseId];
        });
        
        // Then merge/override with new results
        Object.keys(exerciseResults).forEach(exerciseId => {
            // If we already have results for this exercise
            if (mergedResults[exerciseId]) {
                const existing = mergedResults[exerciseId];
                const newData = exerciseResults[exerciseId];
                
                // Merge attempts from both sources, preserving duplicates
                const attempts = [...(existing.attempts || [])];
                if (newData.attempts && Array.isArray(newData.attempts)) {
                    // For each new attempt, check if it's already in the list 
                    // using a more flexible duplicate detection
                    newData.attempts.forEach(newAttempt => {
                        // More flexible duplicate detection using timestamp proximity
                        const isDuplicate = attempts.some(existingAttempt => {
                            // Check if timestamps are very close (within 100ms)
                            const existingTime = new Date(existingAttempt.timestamp).getTime();
                            const newTime = new Date(newAttempt.timestamp).getTime();
                            const timeDiff = Math.abs(existingTime - newTime);
                            
                            // Check if core values match
                            const sameReps = existingAttempt.repetitions === newAttempt.repetitions;
                            const sameWeight = existingAttempt.weight === newAttempt.weight;
                            
                            // Either exact same timestamp OR very close timestamp with same values
                            return (existingAttempt.timestamp === newAttempt.timestamp) || 
                                  (timeDiff < 100 && sameReps && sameWeight);
                        });
                        
                        if (!isDuplicate) {
                            // Ensure setNumber exists
                            if (!newAttempt.setNumber) {
                                // Assign reasonable set number if missing
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
                
                // Sort attempts by timestamp to ensure consistent order
                attempts.sort((a, b) => {
                    const timeA = new Date(a.timestamp).getTime();
                    const timeB = new Date(b.timestamp).getTime();
                    return timeA - timeB;
                });
                
                // Merge best result data
                const bestResult = {
                    ...(existing.bestResult || {}),
                    ...(newData.bestResult || {})
                };
                
                // Keep the larger value for numeric properties 
                if (existing.bestResult && newData.bestResult) {
                    bestResult.reps = Math.max(
                        existing.bestResult.reps || 0, 
                        newData.bestResult.reps || 0
                    );
                    bestResult.weight = Math.max(
                        existing.bestResult.weight || 0, 
                        newData.bestResult.weight || 0
                    );
                    bestResult.formScore = Math.max(
                        existing.bestResult.formScore || 0, 
                        newData.bestResult.formScore || 0
                    );
                }
                
                // Final merged exercise data 
                mergedResults[exerciseId] = {
                    ...existing,
                    ...newData,
                    attempts,
                    bestResult
                };
            } else {
                // Just add the new exercise data
                mergedResults[exerciseId] = exerciseResults[exerciseId];
            }
        });

        logger.info(`Merged exercise results:`, mergedResults);

        // Update the exercise results
        session.exerciseResults = mergedResults;
        await AppDataSource.getRepository(WorkoutSession).save(session);
        
        logger.info(`Successfully saved exercise results for session ${sessionId}`);
        res.json({
            data: session
        });
    } catch (error) {
        logger.error('Error saving session exercise results:', error);
        next(error instanceof AppError ? error : new AppError(ErrorType.SERVICE_ERROR, 'Error saving session exercise results', 500, error));
    }
};

/**
 * Update session user feedback
 */
export const updateSessionUserFeedback = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;
        const { userFeedback } = req.body;

        logger.info(`Updating user feedback for session ${sessionId}`);
        
        // Use direct SQL query to avoid relationship loading errors
        const result = await AppDataSource.query(
            `UPDATE workout_sessions 
             SET "userFeedback" = $1, 
                 "updatedAt" = $2
             WHERE id = $3
             AND user_id = $4
             RETURNING id, "userFeedback"`,
            [userFeedback, new Date(), sessionId, userId]
        );

        if (!result || result.length === 0) {
            throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
        }

        // Return only the essential data
        res.json({
            id: result[0].id,
            userFeedback: result[0].userFeedback,
            success: true
        });
    } catch (error) {
        logger.error('Error updating session user feedback:', error);
        next(new AppError(ErrorType.SERVICE_ERROR, 'Error updating session user feedback', 500, error));
    }
}; 