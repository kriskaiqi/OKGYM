import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not, In } from 'typeorm';
import { WorkoutRating } from '../models/WorkoutRating';
import { DifficultyRating, EnjoymentRating } from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying workout ratings
 */
export interface WorkoutRatingFilters {
    userId?: string;
    workoutPlanId?: number;
    workoutSessionId?: number;
    difficultyRating?: DifficultyRating;
    enjoymentRating?: EnjoymentRating;
    minEffectivenessRating?: number;
    maxEffectivenessRating?: number;
    minTimeSuitabilityRating?: number;
    maxTimeSuitabilityRating?: number;
    minEquipmentSuitabilityRating?: number;
    maxEquipmentSuitabilityRating?: number;
    wouldRecommend?: boolean;
    isFlagged?: boolean;
    isApproved?: boolean;
    isPublic?: boolean;
    createdMinDate?: Date;
    createdMaxDate?: Date;
    includeUser?: boolean;
    includeWorkoutPlan?: boolean;
    includeWorkoutSession?: boolean;
    includeFeedback?: boolean;
    hasReviewText?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for WorkoutRating entity
 * @deprecated Use FeedbackRepository with appropriate type filter instead
 */
export class WorkoutRatingRepository extends GenericRepository<WorkoutRating> {
    constructor() {
        super(WorkoutRating);
    }

    /**
     * Find workout ratings with detailed filtering options
     */
    async findWithFilters(filters: WorkoutRatingFilters): Promise<[WorkoutRating[], number]> {
        try {
            const queryOptions: FindManyOptions<WorkoutRating> = createQueryOptions<WorkoutRating>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { createdAt: 'DESC' };

            // Add relations if needed
            const relations: string[] = [];
            if (filters.includeUser) relations.push('user');
            if (filters.includeWorkoutPlan) relations.push('workoutPlan');
            if (filters.includeWorkoutSession) relations.push('workoutSession');
            if (filters.includeFeedback) relations.push('feedback');
            
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }

            // Apply basic filters
            if (filters.userId) {
                addWhereCondition(queryOptions, 'user_id', filters.userId);
            }

            if (filters.workoutPlanId) {
                addWhereCondition(queryOptions, 'workout_plan_id', filters.workoutPlanId);
            }

            if (filters.workoutSessionId) {
                addWhereCondition(queryOptions, 'workout_session_id', filters.workoutSessionId);
            }

            if (filters.difficultyRating) {
                addWhereCondition(queryOptions, 'difficultyRating', filters.difficultyRating);
            }

            if (filters.enjoymentRating) {
                addWhereCondition(queryOptions, 'enjoymentRating', filters.enjoymentRating);
            }

            if (filters.wouldRecommend !== undefined) {
                addWhereCondition(queryOptions, 'wouldRecommend', filters.wouldRecommend);
            }

            if (filters.isFlagged !== undefined) {
                addWhereCondition(queryOptions, 'isFlagged', filters.isFlagged);
            }

            if (filters.isApproved !== undefined) {
                addWhereCondition(queryOptions, 'isApproved', filters.isApproved);
            }

            if (filters.isPublic !== undefined) {
                addWhereCondition(queryOptions, 'isPublic', filters.isPublic);
            }

            // Effectiveness rating range filters
            if (filters.minEffectivenessRating !== undefined && filters.maxEffectivenessRating !== undefined) {
                addWhereCondition(queryOptions, 'effectivenessRating', 
                    Between(filters.minEffectivenessRating, filters.maxEffectivenessRating));
            } else if (filters.minEffectivenessRating !== undefined) {
                addWhereCondition(queryOptions, 'effectivenessRating', 
                    MoreThan(filters.minEffectivenessRating));
            } else if (filters.maxEffectivenessRating !== undefined) {
                addWhereCondition(queryOptions, 'effectivenessRating', 
                    LessThan(filters.maxEffectivenessRating));
            }

            // Time suitability rating range filters
            if (filters.minTimeSuitabilityRating !== undefined && filters.maxTimeSuitabilityRating !== undefined) {
                addWhereCondition(queryOptions, 'timeSuitabilityRating', 
                    Between(filters.minTimeSuitabilityRating, filters.maxTimeSuitabilityRating));
            } else if (filters.minTimeSuitabilityRating !== undefined) {
                addWhereCondition(queryOptions, 'timeSuitabilityRating', 
                    MoreThan(filters.minTimeSuitabilityRating));
            } else if (filters.maxTimeSuitabilityRating !== undefined) {
                addWhereCondition(queryOptions, 'timeSuitabilityRating', 
                    LessThan(filters.maxTimeSuitabilityRating));
            }

            // Equipment suitability rating range filters
            if (filters.minEquipmentSuitabilityRating !== undefined && filters.maxEquipmentSuitabilityRating !== undefined) {
                addWhereCondition(queryOptions, 'equipmentSuitabilityRating', 
                    Between(filters.minEquipmentSuitabilityRating, filters.maxEquipmentSuitabilityRating));
            } else if (filters.minEquipmentSuitabilityRating !== undefined) {
                addWhereCondition(queryOptions, 'equipmentSuitabilityRating', 
                    MoreThan(filters.minEquipmentSuitabilityRating));
            } else if (filters.maxEquipmentSuitabilityRating !== undefined) {
                addWhereCondition(queryOptions, 'equipmentSuitabilityRating', 
                    LessThan(filters.maxEquipmentSuitabilityRating));
            }

            // Created date range filters
            if (filters.createdMinDate && filters.createdMaxDate) {
                addWhereCondition(queryOptions, 'createdAt', 
                    Between(filters.createdMinDate, filters.createdMaxDate));
            } else if (filters.createdMinDate) {
                addWhereCondition(queryOptions, 'createdAt', 
                    MoreThan(filters.createdMinDate));
            } else if (filters.createdMaxDate) {
                addWhereCondition(queryOptions, 'createdAt', 
                    LessThan(filters.createdMaxDate));
            }

            // Filter for ratings with review text
            if (filters.hasReviewText !== undefined) {
                if (filters.hasReviewText) {
                    addWhereCondition(queryOptions, 'reviewText', Not(IsNull()));
                } else {
                    addWhereCondition(queryOptions, 'reviewText', IsNull());
                }
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in WorkoutRatingRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find ratings for a specific workout plan
     */
    async findByWorkoutPlan(workoutPlanId: number, limit: number = 10): Promise<WorkoutRating[]> {
        try {
            const queryOptions: FindManyOptions<WorkoutRating> = createQueryOptions<WorkoutRating>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { createdAt: 'DESC' };

            // Include relations
            queryOptions.relations = ['user'];

            // Add where conditions
            addWhereCondition(queryOptions, 'workout_plan_id', workoutPlanId);
            addWhereCondition(queryOptions, 'isApproved', true);
            addWhereCondition(queryOptions, 'isPublic', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in WorkoutRatingRepository.findByWorkoutPlan', { error, workoutPlanId, limit });
            throw error;
        }
    }

    /**
     * Find ratings by a specific user
     */
    async findByUser(userId: string, limit: number = 20): Promise<WorkoutRating[]> {
        try {
            const queryOptions: FindManyOptions<WorkoutRating> = createQueryOptions<WorkoutRating>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { createdAt: 'DESC' };

            // Include relations
            queryOptions.relations = ['workoutPlan'];

            // Add where conditions
            addWhereCondition(queryOptions, 'user_id', userId);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in WorkoutRatingRepository.findByUser', { error, userId, limit });
            throw error;
        }
    }

    /**
     * Find ratings for a specific workout session
     */
    async findByWorkoutSession(sessionId: number): Promise<WorkoutRating[]> {
        try {
            const queryOptions: FindManyOptions<WorkoutRating> = createQueryOptions<WorkoutRating>({});
            
            // Set sorting
            queryOptions.order = { createdAt: 'DESC' };

            // Include relations
            queryOptions.relations = ['user', 'workoutPlan'];

            // Add where conditions
            addWhereCondition(queryOptions, 'workout_session_id', sessionId);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in WorkoutRatingRepository.findByWorkoutSession', { error, sessionId });
            throw error;
        }
    }

    /**
     * Flag a rating for review
     */
    async flagRating(ratingId: string): Promise<void> {
        try {
            await this.repository.update(ratingId, { isFlagged: true });
        } catch (error) {
            logger.error('Error in WorkoutRatingRepository.flagRating', { error, ratingId });
            throw error;
        }
    }

    /**
     * Update approval status of a rating
     */
    async updateApprovalStatus(ratingId: string, isApproved: boolean): Promise<void> {
        try {
            await this.repository.update(ratingId, { 
                isApproved,
                isFlagged: isApproved ? false : true
            });
        } catch (error) {
            logger.error('Error in WorkoutRatingRepository.updateApprovalStatus', { error, ratingId, isApproved });
            throw error;
        }
    }

    /**
     * Get aggregated rating statistics for a workout plan
     */
    async getWorkoutPlanRatingStats(workoutPlanId: number): Promise<any> {
        try {
            const ratings = await this.repository.find({
                where: { 
                    workout_plan_id: workoutPlanId,
                    isApproved: true
                }
            });

            if (ratings.length === 0) {
                return {
                    count: 0,
                    averageEffectiveness: 0,
                    averageTimeSuitability: 0,
                    averageEquipmentSuitability: 0,
                    recommendationPercentage: 0,
                    difficultyDistribution: {},
                    enjoymentDistribution: {}
                };
            }

            // Calculate statistics
            const difficultyDistribution: Record<string, number> = {};
            const enjoymentDistribution: Record<string, number> = {};

            let totalEffectiveness = 0;
            let effectivenessCount = 0;
            let totalTimeSuitability = 0;
            let timeSuitabilityCount = 0;
            let totalEquipmentSuitability = 0;
            let equipmentSuitabilityCount = 0;
            let recommendCount = 0;

            for (const rating of ratings) {
                // Count difficulty ratings
                const difficulty = rating.difficultyRating;
                difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1;

                // Count enjoyment ratings
                const enjoyment = rating.enjoymentRating;
                enjoymentDistribution[enjoyment] = (enjoymentDistribution[enjoyment] || 0) + 1;

                // Sum effectiveness ratings
                if (rating.effectivenessRating !== null && rating.effectivenessRating !== undefined) {
                    totalEffectiveness += rating.effectivenessRating;
                    effectivenessCount++;
                }

                // Sum time suitability ratings
                if (rating.timeSuitabilityRating !== null && rating.timeSuitabilityRating !== undefined) {
                    totalTimeSuitability += rating.timeSuitabilityRating;
                    timeSuitabilityCount++;
                }

                // Sum equipment suitability ratings
                if (rating.equipmentSuitabilityRating !== null && rating.equipmentSuitabilityRating !== undefined) {
                    totalEquipmentSuitability += rating.equipmentSuitabilityRating;
                    equipmentSuitabilityCount++;
                }

                // Count recommendations
                if (rating.wouldRecommend) {
                    recommendCount++;
                }
            }

            return {
                count: ratings.length,
                averageEffectiveness: effectivenessCount > 0 ? totalEffectiveness / effectivenessCount : 0,
                averageTimeSuitability: timeSuitabilityCount > 0 ? totalTimeSuitability / timeSuitabilityCount : 0,
                averageEquipmentSuitability: equipmentSuitabilityCount > 0 ? totalEquipmentSuitability / equipmentSuitabilityCount : 0,
                recommendationPercentage: (recommendCount / ratings.length) * 100,
                difficultyDistribution,
                enjoymentDistribution
            };
        } catch (error) {
            logger.error('Error in WorkoutRatingRepository.getWorkoutPlanRatingStats', { error, workoutPlanId });
            throw error;
        }
    }
} 