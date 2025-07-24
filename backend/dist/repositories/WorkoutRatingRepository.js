"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutRatingRepository = void 0;
const typeorm_1 = require("typeorm");
const WorkoutRating_1 = require("../models/WorkoutRating");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class WorkoutRatingRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(WorkoutRating_1.WorkoutRating);
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
            if (filters.includeWorkoutPlan)
                relations.push('workoutPlan');
            if (filters.includeWorkoutSession)
                relations.push('workoutSession');
            if (filters.includeFeedback)
                relations.push('feedback');
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', filters.userId);
            }
            if (filters.workoutPlanId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workout_plan_id', filters.workoutPlanId);
            }
            if (filters.workoutSessionId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workout_session_id', filters.workoutSessionId);
            }
            if (filters.difficultyRating) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'difficultyRating', filters.difficultyRating);
            }
            if (filters.enjoymentRating) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'enjoymentRating', filters.enjoymentRating);
            }
            if (filters.wouldRecommend !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'wouldRecommend', filters.wouldRecommend);
            }
            if (filters.isFlagged !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isFlagged', filters.isFlagged);
            }
            if (filters.isApproved !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isApproved', filters.isApproved);
            }
            if (filters.isPublic !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isPublic', filters.isPublic);
            }
            if (filters.minEffectivenessRating !== undefined && filters.maxEffectivenessRating !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'effectivenessRating', (0, typeorm_1.Between)(filters.minEffectivenessRating, filters.maxEffectivenessRating));
            }
            else if (filters.minEffectivenessRating !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'effectivenessRating', (0, typeorm_1.MoreThan)(filters.minEffectivenessRating));
            }
            else if (filters.maxEffectivenessRating !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'effectivenessRating', (0, typeorm_1.LessThan)(filters.maxEffectivenessRating));
            }
            if (filters.minTimeSuitabilityRating !== undefined && filters.maxTimeSuitabilityRating !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'timeSuitabilityRating', (0, typeorm_1.Between)(filters.minTimeSuitabilityRating, filters.maxTimeSuitabilityRating));
            }
            else if (filters.minTimeSuitabilityRating !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'timeSuitabilityRating', (0, typeorm_1.MoreThan)(filters.minTimeSuitabilityRating));
            }
            else if (filters.maxTimeSuitabilityRating !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'timeSuitabilityRating', (0, typeorm_1.LessThan)(filters.maxTimeSuitabilityRating));
            }
            if (filters.minEquipmentSuitabilityRating !== undefined && filters.maxEquipmentSuitabilityRating !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'equipmentSuitabilityRating', (0, typeorm_1.Between)(filters.minEquipmentSuitabilityRating, filters.maxEquipmentSuitabilityRating));
            }
            else if (filters.minEquipmentSuitabilityRating !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'equipmentSuitabilityRating', (0, typeorm_1.MoreThan)(filters.minEquipmentSuitabilityRating));
            }
            else if (filters.maxEquipmentSuitabilityRating !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'equipmentSuitabilityRating', (0, typeorm_1.LessThan)(filters.maxEquipmentSuitabilityRating));
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
            if (filters.hasReviewText !== undefined) {
                if (filters.hasReviewText) {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'reviewText', (0, typeorm_1.Not)((0, typeorm_1.IsNull)()));
                }
                else {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'reviewText', (0, typeorm_1.IsNull)());
                }
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in WorkoutRatingRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findByWorkoutPlan(workoutPlanId, limit = 10) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { createdAt: 'DESC' };
            queryOptions.relations = ['user'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workout_plan_id', workoutPlanId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isApproved', true);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isPublic', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in WorkoutRatingRepository.findByWorkoutPlan', { error, workoutPlanId, limit });
            throw error;
        }
    }
    async findByUser(userId, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { createdAt: 'DESC' };
            queryOptions.relations = ['workoutPlan'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', userId);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in WorkoutRatingRepository.findByUser', { error, userId, limit });
            throw error;
        }
    }
    async findByWorkoutSession(sessionId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { createdAt: 'DESC' };
            queryOptions.relations = ['user', 'workoutPlan'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workout_session_id', sessionId);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in WorkoutRatingRepository.findByWorkoutSession', { error, sessionId });
            throw error;
        }
    }
    async flagRating(ratingId) {
        try {
            await this.repository.update(ratingId, { isFlagged: true });
        }
        catch (error) {
            logger_1.default.error('Error in WorkoutRatingRepository.flagRating', { error, ratingId });
            throw error;
        }
    }
    async updateApprovalStatus(ratingId, isApproved) {
        try {
            await this.repository.update(ratingId, {
                isApproved,
                isFlagged: isApproved ? false : true
            });
        }
        catch (error) {
            logger_1.default.error('Error in WorkoutRatingRepository.updateApprovalStatus', { error, ratingId, isApproved });
            throw error;
        }
    }
    async getWorkoutPlanRatingStats(workoutPlanId) {
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
            const difficultyDistribution = {};
            const enjoymentDistribution = {};
            let totalEffectiveness = 0;
            let effectivenessCount = 0;
            let totalTimeSuitability = 0;
            let timeSuitabilityCount = 0;
            let totalEquipmentSuitability = 0;
            let equipmentSuitabilityCount = 0;
            let recommendCount = 0;
            for (const rating of ratings) {
                const difficulty = rating.difficultyRating;
                difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1;
                const enjoyment = rating.enjoymentRating;
                enjoymentDistribution[enjoyment] = (enjoymentDistribution[enjoyment] || 0) + 1;
                if (rating.effectivenessRating !== null && rating.effectivenessRating !== undefined) {
                    totalEffectiveness += rating.effectivenessRating;
                    effectivenessCount++;
                }
                if (rating.timeSuitabilityRating !== null && rating.timeSuitabilityRating !== undefined) {
                    totalTimeSuitability += rating.timeSuitabilityRating;
                    timeSuitabilityCount++;
                }
                if (rating.equipmentSuitabilityRating !== null && rating.equipmentSuitabilityRating !== undefined) {
                    totalEquipmentSuitability += rating.equipmentSuitabilityRating;
                    equipmentSuitabilityCount++;
                }
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
        }
        catch (error) {
            logger_1.default.error('Error in WorkoutRatingRepository.getWorkoutPlanRatingStats', { error, workoutPlanId });
            throw error;
        }
    }
}
exports.WorkoutRatingRepository = WorkoutRatingRepository;
//# sourceMappingURL=WorkoutRatingRepository.js.map