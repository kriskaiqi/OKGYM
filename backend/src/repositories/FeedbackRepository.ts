import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not, In, ILike } from 'typeorm';
import { Feedback, FeedbackType, RatingCategory, FeedbackSentiment } from '../models/Feedback';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying feedback
 */
export interface FeedbackFilters {
    userId?: string;
    type?: FeedbackType;
    types?: FeedbackType[];
    category?: RatingCategory;
    categories?: RatingCategory[];
    sentiment?: FeedbackSentiment;
    sentiments?: FeedbackSentiment[];
    minRating?: number;
    maxRating?: number;
    entityId?: string;
    entityType?: string;
    exerciseId?: string;
    workoutPlanId?: number;
    workoutSessionId?: string;
    programId?: number;
    needsReview?: boolean;
    isApproved?: boolean;
    isPublic?: boolean;
    wouldRecommend?: boolean;
    searchTerm?: string;
    createdMinDate?: Date;
    createdMaxDate?: Date;
    includeUser?: boolean;
    includeExercise?: boolean;
    includeWorkoutPlan?: boolean;
    includeWorkoutSession?: boolean;
    includeProgram?: boolean;
    includeWorkoutRating?: boolean;
    hasComment?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for Feedback entity
 */
export class FeedbackRepository extends GenericRepository<Feedback> {
    constructor() {
        super(Feedback);
    }

    /**
     * Find feedback with detailed filtering options
     */
    async findWithFilters(filters: FeedbackFilters): Promise<[Feedback[], number]> {
        try {
            const queryOptions: FindManyOptions<Feedback> = createQueryOptions<Feedback>({});

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
            if (filters.includeExercise) relations.push('exercise');
            if (filters.includeWorkoutPlan) relations.push('workoutPlan');
            if (filters.includeWorkoutSession) relations.push('workoutSession');
            if (filters.includeProgram) relations.push('program');
            if (filters.includeWorkoutRating) relations.push('workoutRating');
            
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }

            // Apply basic filters
            if (filters.userId) {
                addWhereCondition(queryOptions, 'user_id', filters.userId);
            }

            if (filters.type) {
                addWhereCondition(queryOptions, 'type', filters.type);
            }

            if (filters.types && filters.types.length > 0) {
                addWhereCondition(queryOptions, 'type', In(filters.types));
            }

            if (filters.category) {
                addWhereCondition(queryOptions, 'category', filters.category);
            }

            if (filters.categories && filters.categories.length > 0) {
                addWhereCondition(queryOptions, 'category', In(filters.categories));
            }

            if (filters.sentiment) {
                addWhereCondition(queryOptions, 'sentiment', filters.sentiment);
            }

            if (filters.sentiments && filters.sentiments.length > 0) {
                addWhereCondition(queryOptions, 'sentiment', In(filters.sentiments));
            }

            if (filters.entityId) {
                addWhereCondition(queryOptions, 'entityId', filters.entityId);
            }

            if (filters.entityType) {
                addWhereCondition(queryOptions, 'entityType', filters.entityType);
            }

            if (filters.exerciseId) {
                addWhereCondition(queryOptions, 'exercise_id', filters.exerciseId);
            }

            if (filters.workoutPlanId) {
                addWhereCondition(queryOptions, 'workout_plan_id', filters.workoutPlanId);
            }

            if (filters.workoutSessionId) {
                addWhereCondition(queryOptions, 'workout_session_id', filters.workoutSessionId);
            }

            if (filters.programId) {
                addWhereCondition(queryOptions, 'program_id', filters.programId);
            }

            if (filters.needsReview !== undefined) {
                addWhereCondition(queryOptions, 'needsReview', filters.needsReview);
            }

            if (filters.isApproved !== undefined) {
                addWhereCondition(queryOptions, 'isApproved', filters.isApproved);
            }

            if (filters.isPublic !== undefined) {
                addWhereCondition(queryOptions, 'isPublic', filters.isPublic);
            }

            if (filters.wouldRecommend !== undefined) {
                addWhereCondition(queryOptions, 'wouldRecommend', filters.wouldRecommend);
            }

            // Rating range filters
            if (filters.minRating !== undefined && filters.maxRating !== undefined) {
                addWhereCondition(queryOptions, 'rating', Between(filters.minRating, filters.maxRating));
            } else if (filters.minRating !== undefined) {
                addWhereCondition(queryOptions, 'rating', MoreThan(filters.minRating));
            } else if (filters.maxRating !== undefined) {
                addWhereCondition(queryOptions, 'rating', LessThan(filters.maxRating));
            }

            // Created date range filters
            if (filters.createdMinDate && filters.createdMaxDate) {
                addWhereCondition(queryOptions, 'createdAt', Between(filters.createdMinDate, filters.createdMaxDate));
            } else if (filters.createdMinDate) {
                addWhereCondition(queryOptions, 'createdAt', MoreThan(filters.createdMinDate));
            } else if (filters.createdMaxDate) {
                addWhereCondition(queryOptions, 'createdAt', LessThan(filters.createdMaxDate));
            }

            // Filter for feedback with comments
            if (filters.hasComment !== undefined) {
                if (filters.hasComment) {
                    addWhereCondition(queryOptions, 'comment', Not(IsNull()));
                } else {
                    addWhereCondition(queryOptions, 'comment', IsNull());
                }
            }

            // Search term for comment text
            if (filters.searchTerm) {
                addWhereCondition(queryOptions, 'comment', ILike(`%${filters.searchTerm}%`));
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in FeedbackRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find feedback for specific entity
     */
    async findByEntity(entityType: string, entityId: string): Promise<Feedback[]> {
        try {
            const queryOptions: FindManyOptions<Feedback> = createQueryOptions<Feedback>({});
            
            // Set sorting
            queryOptions.order = { createdAt: 'DESC' };

            // Include relations
            queryOptions.relations = ['user'];

            // Add where conditions
            addWhereCondition(queryOptions, 'entityType', entityType);
            addWhereCondition(queryOptions, 'entityId', entityId);
            addWhereCondition(queryOptions, 'isApproved', true);
            addWhereCondition(queryOptions, 'isPublic', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in FeedbackRepository.findByEntity', { error, entityType, entityId });
            throw error;
        }
    }

    /**
     * Find feedback by user
     */
    async findByUser(userId: string, limit: number = 20): Promise<Feedback[]> {
        try {
            const queryOptions: FindManyOptions<Feedback> = createQueryOptions<Feedback>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { createdAt: 'DESC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'user_id', userId);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in FeedbackRepository.findByUser', { error, userId, limit });
            throw error;
        }
    }

    /**
     * Find feedback that needs review
     */
    async findNeedsReview(limit: number = 20): Promise<Feedback[]> {
        try {
            const queryOptions: FindManyOptions<Feedback> = createQueryOptions<Feedback>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { createdAt: 'ASC' };

            // Include relations
            queryOptions.relations = ['user'];

            // Add where conditions
            addWhereCondition(queryOptions, 'needsReview', true);
            addWhereCondition(queryOptions, 'isApproved', false);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in FeedbackRepository.findNeedsReview', { error, limit });
            throw error;
        }
    }

    /**
     * Find feedback by type
     */
    async findByType(type: FeedbackType, limit: number = 20): Promise<Feedback[]> {
        try {
            const queryOptions: FindManyOptions<Feedback> = createQueryOptions<Feedback>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { createdAt: 'DESC' };

            // Include relations
            queryOptions.relations = ['user'];

            // Add where conditions
            addWhereCondition(queryOptions, 'type', type);
            addWhereCondition(queryOptions, 'isApproved', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in FeedbackRepository.findByType', { error, type, limit });
            throw error;
        }
    }

    /**
     * Mark feedback as reviewed
     */
    async markAsReviewed(feedbackId: string, isApproved: boolean = true): Promise<void> {
        try {
            await this.repository.update(feedbackId, {
                needsReview: false,
                isApproved
            });
        } catch (error) {
            logger.error('Error in FeedbackRepository.markAsReviewed', { error, feedbackId, isApproved });
            throw error;
        }
    }

    /**
     * Mark feedback as needs review
     */
    async markNeedsReview(feedbackId: string): Promise<void> {
        try {
            await this.repository.update(feedbackId, { needsReview: true });
        } catch (error) {
            logger.error('Error in FeedbackRepository.markNeedsReview', { error, feedbackId });
            throw error;
        }
    }

    /**
     * Update feedback sentiment
     */
    async updateSentiment(feedbackId: string, sentiment: FeedbackSentiment): Promise<void> {
        try {
            await this.repository.update(feedbackId, { sentiment });
        } catch (error) {
            logger.error('Error in FeedbackRepository.updateSentiment', { error, feedbackId, sentiment });
            throw error;
        }
    }

    /**
     * Get feedback statistics by type
     */
    async getFeedbackStatsByType(): Promise<any> {
        try {
            // Perform the calculation using TypeORM query builder for raw SQL
            const stats = await this.repository
                .createQueryBuilder('feedback')
                .select('feedback.type', 'type')
                .addSelect('COUNT(*)', 'count')
                .addSelect('AVG(feedback.rating)', 'averageRating')
                .where('feedback.isApproved = :isApproved', { isApproved: true })
                .groupBy('feedback.type')
                .orderBy('count', 'DESC')
                .getRawMany();
            
            return stats;
        } catch (error) {
            logger.error('Error in FeedbackRepository.getFeedbackStatsByType', { error });
            throw error;
        }
    }

    /**
     * Get feedback overview statistics
     */
    async getFeedbackOverview(): Promise<any> {
        try {
            const totalCount = await this.repository.count();
            const pendingReviewCount = await this.repository.count({
                where: { needsReview: true }
            });
            
            const sentimentDistribution = await this.repository
                .createQueryBuilder('feedback')
                .select('feedback.sentiment', 'sentiment')
                .addSelect('COUNT(*)', 'count')
                .where('feedback.sentiment IS NOT NULL')
                .groupBy('feedback.sentiment')
                .getRawMany();
            
            const typeDistribution = await this.repository
                .createQueryBuilder('feedback')
                .select('feedback.type', 'type')
                .addSelect('COUNT(*)', 'count')
                .groupBy('feedback.type')
                .getRawMany();
            
            const categoryDistribution = await this.repository
                .createQueryBuilder('feedback')
                .select('feedback.category', 'category')
                .addSelect('COUNT(*)', 'count')
                .where('feedback.category IS NOT NULL')
                .groupBy('feedback.category')
                .getRawMany();
            
            const recentTrend = await this.repository
                .createQueryBuilder('feedback')
                .select('DATE(feedback.createdAt)', 'date')
                .addSelect('COUNT(*)', 'count')
                .where('feedback.createdAt >= :startDate', { startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) })
                .groupBy('DATE(feedback.createdAt)')
                .orderBy('date', 'ASC')
                .getRawMany();
            
            return {
                totalCount,
                pendingReviewCount,
                sentimentDistribution,
                typeDistribution,
                categoryDistribution,
                recentTrend
            };
        } catch (error) {
            logger.error('Error in FeedbackRepository.getFeedbackOverview', { error });
            throw error;
        }
    }
} 