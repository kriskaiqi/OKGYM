"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseDetailsRepository = void 0;
const typeorm_1 = require("typeorm");
const ExerciseDetails_1 = require("../models/ExerciseDetails");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class ExerciseDetailsRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(ExerciseDetails_1.ExerciseDetails);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { updated_at: 'DESC' };
            if (filters.includeExercise) {
                queryOptions.relations = ['exercise'];
            }
            if (filters.exerciseId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise_id', filters.exerciseId);
            }
            if (filters.minConfidenceScore !== undefined && filters.maxConfidenceScore !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'confidenceScore', (0, typeorm_1.Between)(filters.minConfidenceScore, filters.maxConfidenceScore));
            }
            else if (filters.minConfidenceScore !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'confidenceScore', (0, typeorm_1.MoreThan)(filters.minConfidenceScore));
            }
            else if (filters.maxConfidenceScore !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'confidenceScore', (0, typeorm_1.LessThan)(filters.maxConfidenceScore));
            }
            if (filters.analyzedMinDate && filters.analyzedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'analyzedAt', (0, typeorm_1.Between)(filters.analyzedMinDate, filters.analyzedMaxDate));
            }
            else if (filters.analyzedMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'analyzedAt', (0, typeorm_1.MoreThan)(filters.analyzedMinDate));
            }
            else if (filters.analyzedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'analyzedAt', (0, typeorm_1.LessThan)(filters.analyzedMaxDate));
            }
            if (filters.createdMinDate && filters.createdMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'created_at', (0, typeorm_1.Between)(filters.createdMinDate, filters.createdMaxDate));
            }
            else if (filters.createdMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'created_at', (0, typeorm_1.MoreThan)(filters.createdMinDate));
            }
            else if (filters.createdMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'created_at', (0, typeorm_1.LessThan)(filters.createdMaxDate));
            }
            if (filters.updatedMinDate && filters.updatedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'updated_at', (0, typeorm_1.Between)(filters.updatedMinDate, filters.updatedMaxDate));
            }
            else if (filters.updatedMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'updated_at', (0, typeorm_1.MoreThan)(filters.updatedMinDate));
            }
            else if (filters.updatedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'updated_at', (0, typeorm_1.LessThan)(filters.updatedMaxDate));
            }
            const details = await this.repository.findAndCount(queryOptions);
            if (filters.hasFormAnalysis !== undefined ||
                filters.minOverallScore !== undefined ||
                filters.maxOverallScore !== undefined ||
                filters.hasRepData !== undefined ||
                filters.minRepCount !== undefined ||
                filters.maxRepCount !== undefined ||
                filters.hasRawData !== undefined) {
                const [items, count] = details;
                const filteredItems = items.filter(item => {
                    if (filters.hasFormAnalysis !== undefined) {
                        if (filters.hasFormAnalysis && !item.formAnalysis) {
                            return false;
                        }
                        else if (!filters.hasFormAnalysis && item.formAnalysis) {
                            return false;
                        }
                    }
                    if (item.formAnalysis) {
                        if (filters.minOverallScore !== undefined &&
                            item.formAnalysis.overallScore < filters.minOverallScore) {
                            return false;
                        }
                        if (filters.maxOverallScore !== undefined &&
                            item.formAnalysis.overallScore > filters.maxOverallScore) {
                            return false;
                        }
                    }
                    else if (filters.minOverallScore !== undefined || filters.maxOverallScore !== undefined) {
                        return false;
                    }
                    if (filters.hasRepData !== undefined) {
                        if (filters.hasRepData && !item.repData) {
                            return false;
                        }
                        else if (!filters.hasRepData && item.repData) {
                            return false;
                        }
                    }
                    if (item.repData) {
                        if (filters.minRepCount !== undefined &&
                            item.repData.count < filters.minRepCount) {
                            return false;
                        }
                        if (filters.maxRepCount !== undefined &&
                            item.repData.count > filters.maxRepCount) {
                            return false;
                        }
                    }
                    else if (filters.minRepCount !== undefined || filters.maxRepCount !== undefined) {
                        return false;
                    }
                    if (filters.hasRawData !== undefined) {
                        if (filters.hasRawData && !item.rawData) {
                            return false;
                        }
                        else if (!filters.hasRawData && item.rawData) {
                            return false;
                        }
                    }
                    return true;
                });
                return [filteredItems, filteredItems.length];
            }
            return details;
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseDetailsRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findLatestForExercise(exerciseId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = 1;
            queryOptions.order = { analyzedAt: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise_id', exerciseId);
            const results = await this.repository.find(queryOptions);
            return results.length > 0 ? results[0] : null;
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseDetailsRepository.findLatestForExercise', { error, exerciseId });
            throw error;
        }
    }
    async findWithFeedback(exerciseId) {
        try {
            const result = await this.repository.find({
                where: {
                    exercise_id: exerciseId
                },
                order: { analyzedAt: 'DESC' }
            });
            return result.filter(detail => detail.formAnalysis &&
                detail.formAnalysis.feedback &&
                detail.formAnalysis.feedback.length > 0);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseDetailsRepository.findWithFeedback', { error, exerciseId });
            throw error;
        }
    }
    async getFormScoreProgression(exerciseId, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { analyzedAt: 'ASC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise_id', exerciseId);
            const details = await this.repository.find(queryOptions);
            const progression = details
                .filter(detail => detail.formAnalysis && detail.formAnalysis.overallScore !== undefined)
                .map(detail => ({
                date: detail.analyzedAt,
                score: detail.formAnalysis.overallScore,
                confidenceScore: detail.confidenceScore,
                repCount: detail.repData ? detail.repData.count : 0,
                id: detail.id
            }));
            let stats = { dataPoints: progression.length };
            if (progression.length > 0) {
                const scores = progression.map(p => p.score);
                stats.minScore = Math.min(...scores);
                stats.maxScore = Math.max(...scores);
                stats.avgScore = scores.reduce((sum, val) => sum + val, 0) / scores.length;
                if (progression.length >= 2) {
                    const firstScore = progression[0].score;
                    const lastScore = progression[progression.length - 1].score;
                    stats.improvement = lastScore - firstScore;
                    stats.improvementPercent = (stats.improvement / firstScore) * 100;
                }
            }
            return {
                progression,
                stats
            };
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseDetailsRepository.getFormScoreProgression', { error, exerciseId, limit });
            throw error;
        }
    }
    async getCommonIssues(exerciseId) {
        try {
            const details = await this.repository.find({
                where: { exercise_id: exerciseId }
            });
            const issueOccurrences = {};
            let totalIssues = 0;
            details.forEach(detail => {
                if (detail.formAnalysis && detail.formAnalysis.detectedIssues) {
                    detail.formAnalysis.detectedIssues.forEach((issue) => {
                        issueOccurrences[issue] = (issueOccurrences[issue] || 0) + 1;
                        totalIssues++;
                    });
                }
            });
            const issues = Object.entries(issueOccurrences)
                .map(([issue, count]) => ({
                issue,
                count,
                frequency: (count / details.length) * 100
            }))
                .sort((a, b) => b.count - a.count);
            return {
                issues,
                totalIssues,
                totalDetails: details.length,
                averageIssuesPerSession: totalIssues / details.length
            };
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseDetailsRepository.getCommonIssues', { error, exerciseId });
            throw error;
        }
    }
    async createWithTrackingData(exerciseId, formAnalysis, repData, rawData, confidenceScore = 0.8) {
        try {
            const exerciseDetail = this.repository.create({
                exercise_id: exerciseId,
                formAnalysis,
                repData,
                rawData,
                confidenceScore,
                analyzedAt: new Date()
            });
            return await this.repository.save(exerciseDetail);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseDetailsRepository.createWithTrackingData', { error, exerciseId, confidenceScore });
            throw error;
        }
    }
    async updateFormAnalysis(detailId, formAnalysis) {
        try {
            const detail = await this.repository.findOne({
                where: { id: detailId }
            });
            if (!detail) {
                throw new Error(`Exercise detail with ID ${detailId} not found`);
            }
            detail.formAnalysis = formAnalysis;
            return await this.repository.save(detail);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseDetailsRepository.updateFormAnalysis', { error, detailId });
            throw error;
        }
    }
    async removeRawDataFromOldDetails(exerciseId, keepCount = 3) {
        try {
            const details = await this.repository.find({
                where: { exercise_id: exerciseId },
                order: { analyzedAt: 'DESC' }
            });
            if (details.length <= keepCount) {
                return 0;
            }
            const detailsToModify = details.slice(keepCount);
            const detailsWithRawData = detailsToModify.filter(d => d.rawData !== null);
            if (detailsWithRawData.length > 0) {
                for (const detail of detailsWithRawData) {
                    detail.rawData = { timestamps: [] };
                }
                await this.repository.save(detailsWithRawData);
            }
            return detailsWithRawData.length;
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseDetailsRepository.removeRawDataFromOldDetails', { error, exerciseId, keepCount });
            throw error;
        }
    }
}
exports.ExerciseDetailsRepository = ExerciseDetailsRepository;
//# sourceMappingURL=ExerciseDetailsRepository.js.map