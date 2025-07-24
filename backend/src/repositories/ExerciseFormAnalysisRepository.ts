import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not, ILike, In } from 'typeorm';
import { ExerciseFormAnalysis, BodyPositionState, FeedbackSeverity } from '../models/ExerciseFormAnalysis';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying exercise form analyses
 */
export interface ExerciseFormAnalysisFilters {
    userId?: string;
    exerciseId?: string;
    workoutSessionId?: string;
    analysisType?: string;
    performedMinDate?: Date;
    performedMaxDate?: Date;
    minScore?: number;
    maxScore?: number;
    minRepetitions?: number;
    maxRepetitions?: number;
    isViewed?: boolean;
    searchTerm?: string;
    includeExercise?: boolean;
    includeUser?: boolean;
    includeWorkoutSession?: boolean;
    includeVideo?: boolean;
    includeCorrectionPoints?: boolean;
    hasCorrectionPoints?: boolean;
    severityLevel?: FeedbackSeverity;
    createdMinDate?: Date;
    createdMaxDate?: Date;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for ExerciseFormAnalysis entity
 */
export class ExerciseFormAnalysisRepository extends GenericRepository<ExerciseFormAnalysis> {
    constructor() {
        super(ExerciseFormAnalysis);
    }

    /**
     * Find exercise form analyses with detailed filtering options
     */
    async findWithFilters(filters: ExerciseFormAnalysisFilters): Promise<[ExerciseFormAnalysis[], number]> {
        try {
            const queryOptions: FindManyOptions<ExerciseFormAnalysis> = createQueryOptions<ExerciseFormAnalysis>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { performedAt: 'DESC' };

            // Add relations if needed - convert to string array for consistent handling
            const relations: string[] = [];
            if (filters.includeExercise) relations.push('exercise');
            if (filters.includeUser) relations.push('user');
            if (filters.includeWorkoutSession) relations.push('workoutSession');
            if (filters.includeVideo) relations.push('video');
            if (filters.includeCorrectionPoints) relations.push('correctionPoints');
            
            // Ensure relations is a string array
            queryOptions.relations = relations;

            // Apply basic filters
            if (filters.userId) {
                addWhereCondition(queryOptions, 'user_id', filters.userId);
            }

            if (filters.exerciseId) {
                addWhereCondition(queryOptions, 'exercise_id', filters.exerciseId);
            }

            if (filters.workoutSessionId) {
                addWhereCondition(queryOptions, 'workout_session_id', filters.workoutSessionId);
            }

            if (filters.analysisType) {
                addWhereCondition(queryOptions, 'analysisType', filters.analysisType);
            }

            if (filters.isViewed !== undefined) {
                addWhereCondition(queryOptions, 'isViewed', filters.isViewed);
            }

            // Performed date range filters
            if (filters.performedMinDate && filters.performedMaxDate) {
                addWhereCondition(queryOptions, 'performedAt', Between(filters.performedMinDate, filters.performedMaxDate));
            } else if (filters.performedMinDate) {
                addWhereCondition(queryOptions, 'performedAt', MoreThan(filters.performedMinDate));
            } else if (filters.performedMaxDate) {
                addWhereCondition(queryOptions, 'performedAt', LessThan(filters.performedMaxDate));
            }

            // Score range filters
            if (filters.minScore !== undefined && filters.maxScore !== undefined) {
                addWhereCondition(queryOptions, 'overallScore', Between(filters.minScore, filters.maxScore));
            } else if (filters.minScore !== undefined) {
                addWhereCondition(queryOptions, 'overallScore', MoreThan(filters.minScore));
            } else if (filters.maxScore !== undefined) {
                addWhereCondition(queryOptions, 'overallScore', LessThan(filters.maxScore));
            }

            // Repetition range filters
            if (filters.minRepetitions !== undefined && filters.maxRepetitions !== undefined) {
                addWhereCondition(queryOptions, 'repetitionsDetected', Between(filters.minRepetitions, filters.maxRepetitions));
            } else if (filters.minRepetitions !== undefined) {
                addWhereCondition(queryOptions, 'repetitionsDetected', MoreThan(filters.minRepetitions));
            } else if (filters.maxRepetitions !== undefined) {
                addWhereCondition(queryOptions, 'repetitionsDetected', LessThan(filters.maxRepetitions));
            }

            // Created date range filters
            if (filters.createdMinDate && filters.createdMaxDate) {
                addWhereCondition(queryOptions, 'createdAt', Between(filters.createdMinDate, filters.createdMaxDate));
            } else if (filters.createdMinDate) {
                addWhereCondition(queryOptions, 'createdAt', MoreThan(filters.createdMinDate));
            } else if (filters.createdMaxDate) {
                addWhereCondition(queryOptions, 'createdAt', LessThan(filters.createdMaxDate));
            }

            // Filter for having correction points
            if (filters.hasCorrectionPoints !== undefined) {
                if (filters.hasCorrectionPoints) {
                    // Ensure the analysis has at least one correction point
                    if (!queryOptions.where) {
                        queryOptions.where = {};
                    }
                    
                    // Add correctionPoints relation if not already included
                    if (!relations.includes('correctionPoints')) {
                        relations.push('correctionPoints');
                        queryOptions.relations = relations;
                    }
                    
                    addWhereCondition(queryOptions, 'correctionPoints.id', Not(IsNull()));
                } else {
                    // Ensure the analysis has no correction points
                    if (!relations.includes('correctionPoints')) {
                        relations.push('correctionPoints');
                        queryOptions.relations = relations;
                    }
                    
                    addWhereCondition(queryOptions, 'correctionPoints.id', IsNull());
                }
            }

            // Filter by correction point severity level
            if (filters.severityLevel && filters.includeCorrectionPoints) {
                if (!relations.includes('correctionPoints')) {
                    relations.push('correctionPoints');
                    queryOptions.relations = relations;
                }
                
                addWhereCondition(queryOptions, 'correctionPoints.severity', filters.severityLevel);
            }

            // Search filter
            if (filters.searchTerm) {
                const searchPattern = ILike(`%${filters.searchTerm}%`);
                
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push(
                    { summary: searchPattern },
                    { analysisType: searchPattern }
                );
                
                queryOptions.where = whereArray;
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in ExerciseFormAnalysisRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find user's latest form analyses
     */
    async findLatestByUser(userId: string, limit: number = 5): Promise<ExerciseFormAnalysis[]> {
        try {
            const queryOptions: FindManyOptions<ExerciseFormAnalysis> = createQueryOptions<ExerciseFormAnalysis>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { performedAt: 'DESC' };

            // Include relations
            queryOptions.relations = ['exercise', 'correctionPoints'];

            // Add where conditions
            addWhereCondition(queryOptions, 'user_id', userId);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in ExerciseFormAnalysisRepository.findLatestByUser', { error, userId, limit });
            throw error;
        }
    }

    /**
     * Find analyses for a specific exercise
     */
    async findByExercise(exerciseId: string, limit: number = 20): Promise<ExerciseFormAnalysis[]> {
        try {
            const queryOptions: FindManyOptions<ExerciseFormAnalysis> = createQueryOptions<ExerciseFormAnalysis>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { performedAt: 'DESC' };

            // Include relations
            queryOptions.relations = ['user', 'correctionPoints'];

            // Add where conditions
            addWhereCondition(queryOptions, 'exercise_id', exerciseId);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in ExerciseFormAnalysisRepository.findByExercise', { error, exerciseId, limit });
            throw error;
        }
    }

    /**
     * Find analyses for a workout session
     */
    async findByWorkoutSession(sessionId: string): Promise<ExerciseFormAnalysis[]> {
        try {
            const queryOptions: FindManyOptions<ExerciseFormAnalysis> = createQueryOptions<ExerciseFormAnalysis>({});
            
            // Set sorting
            queryOptions.order = { performedAt: 'ASC' };

            // Include relations
            queryOptions.relations = ['exercise', 'correctionPoints'];

            // Add where conditions
            addWhereCondition(queryOptions, 'workout_session_id', sessionId);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in ExerciseFormAnalysisRepository.findByWorkoutSession', { error, sessionId });
            throw error;
        }
    }

    /**
     * Mark analysis as viewed
     */
    async markAsViewed(analysisId: string): Promise<void> {
        try {
            await this.repository.update(analysisId, { isViewed: true });
        } catch (error) {
            logger.error('Error in ExerciseFormAnalysisRepository.markAsViewed', { error, analysisId });
            throw error;
        }
    }

    /**
     * Get user's form progress over time
     */
    async getUserFormProgress(userId: string, exerciseId?: string, startDate?: Date, endDate?: Date): Promise<any[]> {
        try {
            const queryOptions: FindManyOptions<ExerciseFormAnalysis> = createQueryOptions<ExerciseFormAnalysis>({});
            
            // Include relations
            queryOptions.relations = ['exercise'];

            // Add where conditions
            addWhereCondition(queryOptions, 'user_id', userId);
            
            if (exerciseId) {
                addWhereCondition(queryOptions, 'exercise_id', exerciseId);
            }
            
            // Date range filters
            if (startDate && endDate) {
                addWhereCondition(queryOptions, 'performedAt', Between(startDate, endDate));
            } else if (startDate) {
                addWhereCondition(queryOptions, 'performedAt', MoreThan(startDate));
            } else if (endDate) {
                addWhereCondition(queryOptions, 'performedAt', LessThan(endDate));
            }

            // Set sorting
            queryOptions.order = { performedAt: 'ASC' };

            const analyses = await this.repository.find(queryOptions);
            
            // Transform the data for progress tracking
            return analyses.map(analysis => ({
                id: analysis.id,
                exerciseId: analysis.exercise_id,
                exerciseName: analysis.exercise?.name,
                date: analysis.performedAt,
                score: analysis.overallScore,
                reps: {
                    total: analysis.repetitionsDetected,
                    goodForm: analysis.goodFormRepetitions
                },
                formQuality: analysis.goodFormRepetitions / (analysis.repetitionsDetected || 1),
                summary: analysis.summary
            }));
        } catch (error) {
            logger.error('Error in ExerciseFormAnalysisRepository.getUserFormProgress', { error, userId, exerciseId });
            throw error;
        }
    }
} 