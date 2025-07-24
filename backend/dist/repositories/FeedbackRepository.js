"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackRepository = void 0;
const typeorm_1 = require("typeorm");
const Feedback_1 = require("../models/Feedback");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class FeedbackRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(Feedback_1.Feedback);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { createdAt: 'DESC' };
            const relations = [];
            if (filters.includeUser)
                relations.push('user');
            if (filters.includeExercise)
                relations.push('exercise');
            if (filters.includeWorkoutPlan)
                relations.push('workoutPlan');
            if (filters.includeWorkoutSession)
                relations.push('workoutSession');
            if (filters.includeProgram)
                relations.push('program');
            if (filters.includeWorkoutRating)
                relations.push('workoutRating');
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', filters.userId);
            }
            if (filters.type) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', filters.type);
            }
            if (filters.types && filters.types.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', (0, typeorm_1.In)(filters.types));
            }
            if (filters.category) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', filters.category);
            }
            if (filters.categories && filters.categories.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', (0, typeorm_1.In)(filters.categories));
            }
            if (filters.sentiment) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'sentiment', filters.sentiment);
            }
            if (filters.sentiments && filters.sentiments.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'sentiment', (0, typeorm_1.In)(filters.sentiments));
            }
            if (filters.entityId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityId', filters.entityId);
            }
            if (filters.entityType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityType', filters.entityType);
            }
            if (filters.exerciseId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise_id', filters.exerciseId);
            }
            if (filters.workoutPlanId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workout_plan_id', filters.workoutPlanId);
            }
            if (filters.workoutSessionId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workout_session_id', filters.workoutSessionId);
            }
            if (filters.programId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'program_id', filters.programId);
            }
            if (filters.needsReview !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'needsReview', filters.needsReview);
            }
            if (filters.isApproved !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isApproved', filters.isApproved);
            }
            if (filters.isPublic !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isPublic', filters.isPublic);
            }
            if (filters.wouldRecommend !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'wouldRecommend', filters.wouldRecommend);
            }
            if (filters.minRating !== undefined && filters.maxRating !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'rating', (0, typeorm_1.Between)(filters.minRating, filters.maxRating));
            }
            else if (filters.minRating !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'rating', (0, typeorm_1.MoreThan)(filters.minRating));
            }
            else if (filters.maxRating !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'rating', (0, typeorm_1.LessThan)(filters.maxRating));
            }
            if (filters.createdMinDate && filters.createdMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.Between)(filters.createdMinDate, filters.createdMaxDate));
            }
            else if (filters.createdMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.MoreThan)(filters.createdMinDate));
            }
            else if (filters.createdMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.LessThan)(filters.createdMaxDate));
            }
            if (filters.hasComment !== undefined) {
                if (filters.hasComment) {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'comment', (0, typeorm_1.Not)((0, typeorm_1.IsNull)()));
                }
                else {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'comment', (0, typeorm_1.IsNull)());
                }
            }
            if (filters.searchTerm) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'comment', (0, typeorm_1.ILike)(`%${filters.searchTerm}%`));
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in FeedbackRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findByEntity(entityType, entityId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { createdAt: 'DESC' };
            queryOptions.relations = ['user'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityType', entityType);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'entityId', entityId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isApproved', true);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isPublic', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in FeedbackRepository.findByEntity', { error, entityType, entityId });
            throw error;
        }
    }
    async findByUser(userId, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { createdAt: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', userId);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in FeedbackRepository.findByUser', { error, userId, limit });
            throw error;
        }
    }
    async findNeedsReview(limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { createdAt: 'ASC' };
            queryOptions.relations = ['user'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'needsReview', true);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isApproved', false);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in FeedbackRepository.findNeedsReview', { error, limit });
            throw error;
        }
    }
    async findByType(type, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { createdAt: 'DESC' };
            queryOptions.relations = ['user'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', type);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isApproved', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in FeedbackRepository.findByType', { error, type, limit });
            throw error;
        }
    }
    async markAsReviewed(feedbackId, isApproved = true) {
        try {
            await this.repository.update(feedbackId, {
                needsReview: false,
                isApproved
            });
        }
        catch (error) {
            logger_1.default.error('Error in FeedbackRepository.markAsReviewed', { error, feedbackId, isApproved });
            throw error;
        }
    }
    async markNeedsReview(feedbackId) {
        try {
            await this.repository.update(feedbackId, { needsReview: true });
        }
        catch (error) {
            logger_1.default.error('Error in FeedbackRepository.markNeedsReview', { error, feedbackId });
            throw error;
        }
    }
    async updateSentiment(feedbackId, sentiment) {
        try {
            await this.repository.update(feedbackId, { sentiment });
        }
        catch (error) {
            logger_1.default.error('Error in FeedbackRepository.updateSentiment', { error, feedbackId, sentiment });
            throw error;
        }
    }
    async getFeedbackStatsByType() {
        try {
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
        }
        catch (error) {
            logger_1.default.error('Error in FeedbackRepository.getFeedbackStatsByType', { error });
            throw error;
        }
    }
    async getFeedbackOverview() {
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
        }
        catch (error) {
            logger_1.default.error('Error in FeedbackRepository.getFeedbackOverview', { error });
            throw error;
        }
    }
}
exports.FeedbackRepository = FeedbackRepository;
//# sourceMappingURL=FeedbackRepository.js.map