import { 
    WorkoutSession,
    WorkoutPlan,
    Exercise,
    User
} from '../models';

// Import from their specific files since they're not exported through index
import { ExerciseFormAnalysis } from '../models/ExerciseFormAnalysis'; 
import { MetricTracking } from '../models/MetricTracking';
import { WorkoutRating } from '../models/WorkoutRating';
import { Feedback } from '../models/Feedback';
import { Achievement } from '../models/Achievement';

// Import needed types from WorkoutSession
import { 
    ExerciseSequence, 
    PlannedExercise,
    ActualExercise,
    ExerciseResult,
    ExerciseAttempt,
    WorkoutSummary,
    ExerciseSummary,
    BestResult
} from '../models/WorkoutSession';

import { repositories } from '../repositories';
import { WorkoutSessionRepository } from '../repositories/WorkoutSessionRepository';
import { WorkoutPlanRepository } from '../repositories/WorkoutPlanRepository';
import { ExerciseRepository } from '../repositories/ExerciseRepository';
import { ExerciseStatus, SessionStatus } from '../models/shared/Enums';
import { AppError, ErrorType } from '../utils/errors';
import logger from '../utils/logger';
import { SimpleTrack } from '../utils/performance';
import { executeTransaction } from '../utils/transaction-helper';
import { WorkoutPlanId } from './WorkoutPlanService';
import { cacheManager } from '../services/CacheManager';

/**
 * Service for managing workout sessions and tracking exercise performance
 */
export class WorkoutSessionService {
    constructor(
        private readonly sessionRepo = new WorkoutSessionRepository(),
        private readonly workoutPlanRepo = new WorkoutPlanRepository(),
        private readonly exerciseRepo = new ExerciseRepository()
    ) {}

    /**
     * Start a new workout session based on a workout plan
     */
    @SimpleTrack()
    async startSession(userId: string, workoutPlanId: WorkoutPlanId): Promise<WorkoutSession> {
        try {
            logger.info(`Starting workout session for user ${userId} with workout plan ${workoutPlanId}`);
            
            // Get the workout plan with exercises - handle both UUID and number types
            const workoutPlan = await this.workoutPlanRepo.findById(workoutPlanId);
            
            if (!workoutPlan) {
                throw new AppError(ErrorType.NOT_FOUND, 'Workout plan not found', 404);
            }
            
            // Load the workout plan with exercises relationship
            const workoutPlanWithExercises = await this.workoutPlanRepo.findOne({
                where: { id: workoutPlanId.toString() } as any,
                relations: ['exercises', 'exercises.exercise']
            });
            
            if (!workoutPlanWithExercises || !workoutPlanWithExercises.exercises || workoutPlanWithExercises.exercises.length === 0) {
                throw new AppError(ErrorType.VALIDATION_ERROR, 'Workout plan has no exercises', 400);
            }

            // Create exercise sequence from workout plan
            const exerciseSequence = new ExerciseSequence();
            exerciseSequence.originalPlan = workoutPlanWithExercises.exercises.map(exercise => {
                const plannedExercise = new PlannedExercise();
                plannedExercise.exerciseId = exercise.exercise.id;
                plannedExercise.order = exercise.order;
                plannedExercise.targetRepetitions = exercise.repetitions;
                plannedExercise.targetDuration = exercise.duration;
                plannedExercise.targetSets = exercise.sets;
                plannedExercise.restTime = exercise.restTime;
                plannedExercise.notes = exercise.notes;
                return plannedExercise;
            });
            
            // Create new session
            const session = new WorkoutSession();
            session.user = { id: userId } as User;
            session.workoutPlan = workoutPlan;
            session.status = SessionStatus.ACTIVE;
            session.startTime = new Date();
            session.exerciseSequence = exerciseSequence;
            session.exerciseResults = {};
            
            // Initialize summary
            session.summary = new WorkoutSummary();
            session.summary.totalExercises = exerciseSequence.originalPlan.length;
            session.summary.uniqueExercises = new Set(
                exerciseSequence.originalPlan.map(e => e.exerciseId)
            ).size;

            // Save session
            const savedSession = await this.sessionRepo.save(session);
            if (Array.isArray(savedSession)) {
                return savedSession[0]; // Handle case where repository returns an array
            }
            return savedSession;
        } catch (error) {
            logger.error('Error starting workout session:', error);
            throw error;
        }
    }

    /**
     * Record exercise completion in a session
     */
    @SimpleTrack()
    async recordExerciseCompletion(
        sessionId: string,
        exerciseId: string,
        result: {
            repetitions?: number;
            duration?: number;
            formScore: number;
            weight?: number;
            resistance?: number;
            notes?: string;
            setNumber: number;
        }
    ): Promise<WorkoutSession> {
        try {
            logger.info(`Recording exercise completion for session ${sessionId}, exercise ${exerciseId}`);
            
            // Get session with current results
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
            }

            if (session.status !== SessionStatus.ACTIVE) {
                throw new AppError(ErrorType.OPERATION_NOT_ALLOWED, 'Session is not active', 400);
            }
            
            return await executeTransaction(async (entityManager) => {
                // Record the attempt
                const attempt = new ExerciseAttempt();
                attempt.timestamp = new Date();
                attempt.repetitions = result.repetitions || 0;
                attempt.duration = result.duration || 0;
                attempt.formScore = result.formScore;
                attempt.weight = result.weight;
                attempt.resistance = result.resistance;
                attempt.notes = result.notes;

                // Initialize or update exercise results
                if (!session.exerciseResults[exerciseId]) {
                    session.exerciseResults[exerciseId] = new ExerciseResult();
                }

                const exerciseResult = session.exerciseResults[exerciseId];
                exerciseResult.attempts.push(attempt);

                // Update best result
                if (!exerciseResult.bestResult) {
                    exerciseResult.bestResult = new BestResult();
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

                // Update actual sequence
                const plannedExercise = session.exerciseSequence.originalPlan.find(e => e.exerciseId === exerciseId);
                
                let actualExercise = session.exerciseSequence.actualSequence.find(e => e.exerciseId === exerciseId);
                
                if (!actualExercise) {
                    actualExercise = new ActualExercise();
                    actualExercise.exerciseId = exerciseId;
                    actualExercise.order = plannedExercise?.order || 0;
                    actualExercise.startTime = new Date();
                    actualExercise.status = ExerciseStatus.ACTIVE;
                    session.exerciseSequence.actualSequence.push(actualExercise);
                }
                
                // Set status based on progress
                const attempts = (result as { attempts?: any[] }).attempts || [];
                actualExercise.completedSets = attempts.length;
                
                // If all sets completed, mark as complete
                if (plannedExercise && actualExercise.completedSets >= plannedExercise.targetSets) {
                    actualExercise.status = ExerciseStatus.COMPLETED;
                    actualExercise.endTime = new Date();
                }

                // Save updated session
                const updatedSession = await this.sessionRepo.save(session);
                if (Array.isArray(updatedSession)) {
                    return updatedSession[0];
                }
                return updatedSession;
            });
        } catch (error) {
            logger.error('Error recording exercise completion:', error);
            throw error;
        }
    }

    /**
     * Skip an exercise in a workout session
     */
    @SimpleTrack()
    async skipExercise(sessionId: string, exerciseId: string, reason?: string): Promise<WorkoutSession> {
        try {
            logger.info(`Skipping exercise ${exerciseId} in session ${sessionId}`);
            
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
            }

            if (session.status !== SessionStatus.ACTIVE) {
                throw new AppError(ErrorType.OPERATION_NOT_ALLOWED, 'Session is not active', 400);
            }
            
            return await executeTransaction(async (entityManager) => {
                // Update actual sequence
                const plannedExercise = session.exerciseSequence.originalPlan.find(e => e.exerciseId === exerciseId);
                
                if (!plannedExercise) {
                    throw new AppError(ErrorType.NOT_FOUND, 'Exercise not found in workout plan', 404);
                }
                
                let actualExercise = session.exerciseSequence.actualSequence.find(e => e.exerciseId === exerciseId);
                
                if (!actualExercise) {
                    actualExercise = new ActualExercise();
                    actualExercise.exerciseId = exerciseId;
                    actualExercise.order = plannedExercise.order;
                    actualExercise.startTime = new Date();
                    session.exerciseSequence.actualSequence.push(actualExercise);
                }
                
                // Mark as skipped
                actualExercise.status = ExerciseStatus.SKIPPED;
                actualExercise.endTime = new Date();
                actualExercise.notes = reason || 'Exercise skipped by user';

                // Save updated session
                const updatedSession = await this.sessionRepo.save(session);
                if (Array.isArray(updatedSession)) {
                    return updatedSession[0];
                }
                return updatedSession;
            });
        } catch (error) {
            logger.error('Error skipping exercise:', error);
            throw error;
        }
    }

    /**
     * Pause a workout session
     */
    @SimpleTrack()
    async pauseSession(sessionId: string, data?: { duration?: number; caloriesBurned?: number }): Promise<WorkoutSession> {
        try {
            logger.info(`Pausing workout session ${sessionId}`);
            logger.info(`Pause data received: duration=${data?.duration}, caloriesBurned=${data?.caloriesBurned}`);
            
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
            }

            if (session.status !== SessionStatus.ACTIVE) {
                throw new AppError(ErrorType.OPERATION_NOT_ALLOWED, 'Session is not active', 400);
            }
            
            // Update session status
            session.status = SessionStatus.PAUSED;
            
            // Use provided duration or calculate it
            if (data?.duration !== undefined) {
                // Use the exact duration provided by client
                session.totalDuration = data.duration;
                logger.info(`Using provided totalDuration: ${data.duration} seconds`);
            } else if (session.startTime) {
                // Calculate duration from session start to now in seconds
                const now = new Date();
                const calculatedDuration = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
                session.totalDuration = calculatedDuration;
                logger.info(`Calculated totalDuration: ${calculatedDuration} seconds`);
            }

            // Use provided calories or calculate them
            if (data?.caloriesBurned !== undefined) {
                session.caloriesBurned = data.caloriesBurned;
                logger.info(`Using provided caloriesBurned: ${data.caloriesBurned}`);
            } else {
                session.caloriesBurned = this.calculateCaloriesBurned(session);
                logger.info(`Calculated caloriesBurned: ${session.caloriesBurned}`);
            }

            // Ensure all exercises have a status
            for (const plannedExercise of session.exerciseSequence.originalPlan) {
                const exerciseId = plannedExercise.exerciseId;
                const alreadyInActual = session.exerciseSequence.actualSequence.some(
                    e => e.exerciseId === exerciseId
                );
                
                if (!alreadyInActual) {
                    // Add as not started exercise
                    const actualExercise = new ActualExercise();
                    actualExercise.exerciseId = exerciseId;
                    actualExercise.order = plannedExercise.order;
                    actualExercise.status = ExerciseStatus.PENDING; // Use PENDING instead of NOT_STARTED
                    session.exerciseSequence.actualSequence.push(actualExercise);
                }
            }

            // If there are no actual exercises in the sequence but we have exercise results,
            // try to populate the actualSequence based on the exercise results
            if (session.exerciseResults && 
                (!session.exerciseSequence.actualSequence || session.exerciseSequence.actualSequence.length === 0)) {
                
                logger.info(`Rebuilding actualSequence from exerciseResults for session ${sessionId}`);
                
                try {
                    // Create actual exercises from the exercise results
                    const exerciseResults = typeof session.exerciseResults === 'string' 
                        ? JSON.parse(session.exerciseResults) 
                        : session.exerciseResults;
                    
                    // For each exercise in the results, create an actual exercise entry if it doesn't exist
                    Object.entries(exerciseResults).forEach(([exerciseId, resultValue], index) => {
                        // Add type assertion to fix TypeScript error
                        const result = resultValue as { attempts?: any[] };
                        
                        // Find matching planned exercise to get order
                        const plannedExercise = session.exerciseSequence.originalPlan.find(
                            p => p.exerciseId === exerciseId
                        );
                        
                        // Create actual exercise
                        const actualExercise = new ActualExercise();
                        actualExercise.exerciseId = exerciseId;
                        actualExercise.order = plannedExercise?.order || (index + 1);
                        actualExercise.startTime = new Date();
                        
                        // Set status based on progress
                        const attempts = result.attempts || [];
                        actualExercise.completedSets = attempts.length;
                        
                        if (plannedExercise && attempts.length >= plannedExercise.targetSets) {
                            actualExercise.status = ExerciseStatus.COMPLETED;
                            actualExercise.endTime = new Date();
                        } else if (attempts.length > 0) {
                            actualExercise.status = ExerciseStatus.ACTIVE;
                        } else {
                            actualExercise.status = ExerciseStatus.PENDING;
                        }
                        
                        // Add to sequence if not already there
                        if (!session.exerciseSequence.actualSequence.some(e => e.exerciseId === exerciseId)) {
                            session.exerciseSequence.actualSequence.push(actualExercise);
                        }
                    });
                } catch (error) {
                    logger.error(`Error rebuilding actualSequence from exerciseResults: ${error}`);
                    // Continue with the pause operation even if this fails
                }
            }
            
            // Generate exercise summaries
            await this.generateSessionSummary(session);

            // Save paused session
            const updatedSession = await this.sessionRepo.save(session);
            
            // Invalidate the user profile cache so profile page will show updated stats
            const userId = session.userId || (session.user?.id);
            if (userId) {
                // Invalidate all user-related caches
                await cacheManager.delete(`user:profile:${userId}`);
                await cacheManager.delete(`user:${userId}`);
                await cacheManager.delete(`user:${userId}:progress`);
                await cacheManager.delete(`user:${userId}:stats`);
                await cacheManager.delete(`user:${userId}:workoutSessions:direct`);
                
                // Use pattern matching to invalidate any other user-related caches
                await cacheManager.deleteByPattern(`user:${userId}:*`);
                
                logger.debug(`Invalidated caches for user ${userId}`);
            }
            
            if (Array.isArray(updatedSession)) {
                return updatedSession[0];
            }
            return updatedSession;
        } catch (error) {
            logger.error('Error pausing workout session:', error);
            throw error;
        }
    }

    /**
     * Resume a paused workout session
     */
    @SimpleTrack()
    async resumeSession(sessionId: string): Promise<WorkoutSession> {
        try {
            logger.info(`Resuming workout session ${sessionId}`);
            
            // Get the session with minimal relations first
            const session = await this.sessionRepo.findOne({
                where: { id: sessionId },
                relations: ['user', 'workoutPlan'] // Only load essential relations
            });
            
            if (!session) {
                logger.error(`Session not found: ${sessionId}`);
                throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
            }

            logger.info(`Current session state: ${sessionId} [${session.status}]`);

            if (session.status !== SessionStatus.PAUSED) {
                logger.error(`Cannot resume session in ${session.status} state: ${sessionId}`);
                throw new AppError(ErrorType.OPERATION_NOT_ALLOWED, `Session is not paused (current state: ${session.status})`, 400);
            }
            
            // Update status and reset start time
            session.status = SessionStatus.ACTIVE;
            session.startTime = new Date();
            
            // Save the updated session
            logger.info(`Saving resumed session ${sessionId}`);
            await this.sessionRepo.save(session);
            
            // Re-load the full session with all needed relations to ensure complete data
            logger.info(`Loading complete session data for ${sessionId}`);
            const fullSession = await this.sessionRepo.getWithFullDetails(sessionId);
            
            if (!fullSession) {
                logger.error(`Failed to load complete session data for ${sessionId}`);
                throw new AppError(ErrorType.SERVICE_ERROR, 'Failed to load session after resume', 500);
            }
            
            // Make sure the session has a workout plan
            if (!fullSession.workoutPlan) {
                logger.warn(`Resumed session ${sessionId} missing workout plan, attempting to load it`);
                try {
                    const workoutPlan = await this.workoutPlanRepo.findOne({ 
                        where: { id: fullSession.workoutPlanId } 
                    });
                    
                    if (workoutPlan) {
                        fullSession.workoutPlan = workoutPlan;
                        logger.info(`Successfully loaded workout plan for session ${sessionId}`);
                    } else {
                        logger.error(`Could not find workout plan with ID ${fullSession.workoutPlanId}`);
                    }
                } catch (error) {
                    logger.error(`Error loading workout plan for session ${sessionId}: ${error.message}`);
                    // Continue despite error - frontend should handle missing workout plan
                }
            }
            
            // Ensure exercise sequence exists
            if (!fullSession.exerciseSequence) {
                logger.warn(`Session ${sessionId} missing exercise sequence, creating empty one`);
                fullSession.exerciseSequence = {
                    originalPlan: [],
                    actualSequence: []
                };
            }
            
            logger.info(`Successfully resumed session ${sessionId}`);
            return fullSession;
        } catch (error) {
            logger.error(`Error resuming workout session ${sessionId}:`, error);
            throw error;
        }
    }

    /**
     * Complete a workout session
     */
    @SimpleTrack()
    async completeSession(sessionId: string, data?: { duration?: number; caloriesBurned?: number }): Promise<WorkoutSession> {
        try {
            logger.info(`Completing workout session ${sessionId}`);
            logger.info(`Complete data received: duration=${data?.duration}, caloriesBurned=${data?.caloriesBurned}`);
            
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
            }

            if (session.status !== SessionStatus.ACTIVE && session.status !== SessionStatus.PAUSED) {
                throw new AppError(ErrorType.OPERATION_NOT_ALLOWED, 'Session cannot be completed', 400);
            }
            
            return await executeTransaction(async (entityManager) => {
                // Update session status and end time
                session.status = SessionStatus.COMPLETED;
                session.endTime = new Date();

                // Use provided duration or calculate it
                if (data?.duration !== undefined) {
                    // Use the exact duration provided by client without any minimum
                    session.totalDuration = data.duration;
                    logger.info(`Using provided totalDuration: ${data.duration} seconds`);
                } else if (session.startTime) {
                    // Calculate from session start to now
                    const additionalDuration = Math.floor(
                        (session.endTime.getTime() - session.startTime.getTime()) / 1000
                    );
                    session.totalDuration += additionalDuration;
                    logger.info(`Calculated totalDuration: ${additionalDuration} seconds`);
                }

                // Use provided calories or calculate them
                if (data?.caloriesBurned !== undefined) {
                    session.caloriesBurned = data.caloriesBurned;
                    logger.info(`Using provided caloriesBurned: ${data.caloriesBurned}`);
                } else {
                    session.caloriesBurned = this.calculateCaloriesBurned(session);
                    logger.info(`Calculated caloriesBurned: ${session.caloriesBurned}`);
                }

                // Ensure all exercises have a status
                for (const plannedExercise of session.exerciseSequence.originalPlan) {
                    const exerciseId = plannedExercise.exerciseId;
                    const alreadyInActual = session.exerciseSequence.actualSequence.some(
                        e => e.exerciseId === exerciseId
                    );
                    
                    if (!alreadyInActual) {
                        // Add as not started exercise
                        const actualExercise = new ActualExercise();
                        actualExercise.exerciseId = exerciseId;
                        actualExercise.order = plannedExercise.order;
                        actualExercise.status = ExerciseStatus.PENDING; // Use PENDING instead of NOT_STARTED
                        session.exerciseSequence.actualSequence.push(actualExercise);
                    }
                }

                // Calculate calories burned
                session.caloriesBurned = this.calculateCaloriesBurned(session);
            
                // Generate exercise summaries
                await this.generateSessionSummary(session);

                // Save completed session
                const updatedSession = await this.sessionRepo.save(session);
                
                // Invalidate the user profile cache so profile page will show updated stats
                const userId = session.userId || (session.user?.id);
                if (userId) {
                    // Invalidate all user-related caches
                    await cacheManager.delete(`user:profile:${userId}`);
                    await cacheManager.delete(`user:${userId}`);
                    await cacheManager.delete(`user:${userId}:progress`);
                    await cacheManager.delete(`user:${userId}:stats`);
                    await cacheManager.delete(`user:${userId}:workoutSessions:direct`);
                    
                    // Use pattern matching to invalidate any other user-related caches
                    await cacheManager.deleteByPattern(`user:${userId}:*`);
                    
                    logger.debug(`Invalidated caches for user ${userId}`);
                }
                
                if (Array.isArray(updatedSession)) {
                    return updatedSession[0];
                }
                return updatedSession;
            });
        } catch (error) {
            logger.error('Error completing workout session:', error);
            throw error;
        }
    }

    /**
     * Cancel a workout session
     */
    @SimpleTrack()
    async cancelSession(sessionId: string): Promise<WorkoutSession> {
        try {
            logger.info(`Cancelling workout session ${sessionId}`);
            
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
            }

            if (session.status !== SessionStatus.ACTIVE && session.status !== SessionStatus.PAUSED) {
                throw new AppError(ErrorType.OPERATION_NOT_ALLOWED, 'Session cannot be cancelled', 400);
            }
            
            session.status = SessionStatus.CANCELLED;
            session.endTime = new Date();
            
            // Calculate partial duration
            if (session.startTime) {
                const additionalDuration = Math.floor(
                    (session.endTime.getTime() - session.startTime.getTime()) / 1000
                );
                session.totalDuration += additionalDuration;
            }

            const updatedSession = await this.sessionRepo.save(session);
            
            // Invalidate the user profile cache so profile page will show updated stats
            const userId = session.userId || (session.user?.id);
            if (userId) {
                // Invalidate all user-related caches
                await cacheManager.delete(`user:profile:${userId}`);
                await cacheManager.delete(`user:${userId}`);
                await cacheManager.delete(`user:${userId}:progress`);
                await cacheManager.delete(`user:${userId}:stats`);
                await cacheManager.delete(`user:${userId}:workoutSessions:direct`);
                
                // Use pattern matching to invalidate any other user-related caches
                await cacheManager.deleteByPattern(`user:${userId}:*`);
                
                logger.debug(`Invalidated caches for user ${userId}`);
            }
            
            if (Array.isArray(updatedSession)) {
                return updatedSession[0];
            }
            return updatedSession;
        } catch (error) {
            logger.error('Error cancelling workout session:', error);
            throw error;
        }
    }

    /**
     * Get workout session details
     */
    @SimpleTrack()
    async getSessionById(sessionId: string): Promise<WorkoutSession> {
        try {
            logger.info(`Getting workout session ${sessionId}`);
            
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
            }

            return session;
        } catch (error) {
            logger.error('Error getting workout session:', error);
            throw error;
        }
    }

    /**
     * Get user's workout sessions with filtering
     */
    @SimpleTrack()
    async getUserSessions(userId: string, filters: {
        status?: SessionStatus;
        startDateMin?: Date;
        startDateMax?: Date;
        limit?: number;
        offset?: number;
    } = {}): Promise<[WorkoutSession[], number]> {
        try {
            logger.info(`Getting workout sessions for user ${userId}`);
            
            return await this.sessionRepo.findWithFilters({
                userId,
                ...filters,
                includeWorkoutPlan: true
            });
        } catch (error) {
            logger.error('Error getting user workout sessions:', error);
            throw error;
        }
    }
    
    /**
     * Get workout session exercises with completion status
     */
    @SimpleTrack()
    async getSessionExercises(sessionId: string): Promise<{
        planned: PlannedExercise[];
        actual: ActualExercise[];
        progress: number;
    }> {
        try {
            logger.info(`Getting exercises for session ${sessionId}`);
            
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
            }
            
            // Calculate progress percentage
            const totalExercises = session.exerciseSequence.originalPlan.length;
            const completedExercises = session.exerciseSequence.actualSequence.filter(
                e => e.status === ExerciseStatus.COMPLETED
            ).length;
            
            const progress = totalExercises > 0 
                ? Math.round((completedExercises / totalExercises) * 100) 
                : 0;
            
            return {
                planned: session.exerciseSequence.originalPlan,
                actual: session.exerciseSequence.actualSequence,
                progress
            };
        } catch (error) {
            logger.error('Error getting session exercises:', error);
            throw error;
        }
    }
    
    /**
     * Get session summary with performance metrics
     */
    @SimpleTrack()
    async getSessionSummary(sessionId: string): Promise<WorkoutSummary> {
        try {
            logger.info(`Getting summary for session ${sessionId}`);
            
            const session = await this.sessionRepo.getWithFullDetails(sessionId);
            if (!session) {
                throw new AppError(ErrorType.NOT_FOUND, 'Session not found', 404);
            }
            
            // If session is complete, return the stored summary
            if (session.status === SessionStatus.COMPLETED) {
                return session.summary;
            }
            
            // For in-progress sessions, generate an up-to-date summary
            await this.generateSessionSummary(session);
            
            return session.summary;
        } catch (error) {
            logger.error('Error getting session summary:', error);
            throw error;
        }
    }

    /**
     * Generate a comprehensive session summary
     * This updates the session.summary property with current data
     */
    private async generateSessionSummary(session: WorkoutSession): Promise<void> {
        // Get exercise details to generate proper summaries
        const exerciseIds = Object.keys(session.exerciseResults);
        const exercises = await this.exerciseRepo.findByIds(exerciseIds);
        
        const summary = new WorkoutSummary();
        
        // Basic counts
        summary.totalExercises = session.exerciseSequence.originalPlan.length;
        summary.uniqueExercises = new Set(session.exerciseSequence.originalPlan.map(e => e.exerciseId)).size;
        
        // Duration and calories
        summary.totalDuration = session.totalDuration;
        summary.caloriesBurned = session.caloriesBurned;
        
        // Generate exercise summaries
        const exerciseSummaries: ExerciseSummary[] = [];
        
        for (const [exerciseId, result] of Object.entries(session.exerciseResults)) {
            const exercise = exercises.find(e => e.id === exerciseId);
            
            if (exercise) {
                const summary = new ExerciseSummary();
                summary.exerciseId = exerciseId;
                summary.name = exercise.name;
                summary.totalAttempts = result.attempts.length;
                summary.bestResult = result.bestResult || new BestResult();
                
                exerciseSummaries.push(summary);
            }
        }
        
        summary.exerciseSummaries = exerciseSummaries;
        
        // Update session summary
        session.summary = summary;
    }

    /**
     * Calculate calories burned for a session
     * This is a simplified calculation - implement proper formula based on:
     * - Exercise intensity
     * - User's weight and other metrics
     * - Exercise type and MET values
     */
    private calculateCaloriesBurned(session: WorkoutSession): number {
        // Implement proper calorie calculation (placeholder implementation)
        const minutesWorked = session.totalDuration / 60;
        const averageCaloriesPerMinute = 7; // This should be calculated based on exercise intensity
        return Math.floor(minutesWorked * averageCaloriesPerMinute);
    }
} 