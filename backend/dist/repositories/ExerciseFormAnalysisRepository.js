"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseFormAnalysisRepository = void 0;
const typeorm_1 = require("typeorm");
const ExerciseFormAnalysis_1 = require("../models/ExerciseFormAnalysis");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class ExerciseFormAnalysisRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(ExerciseFormAnalysis_1.ExerciseFormAnalysis);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { performedAt: 'DESC' };
            const relations = [];
            if (filters.includeExercise)
                relations.push('exercise');
            if (filters.includeUser)
                relations.push('user');
            if (filters.includeWorkoutSession)
                relations.push('workoutSession');
            if (filters.includeVideo)
                relations.push('video');
            if (filters.includeCorrectionPoints)
                relations.push('correctionPoints');
            queryOptions.relations = relations;
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', filters.userId);
            }
            if (filters.exerciseId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise_id', filters.exerciseId);
            }
            if (filters.workoutSessionId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workout_session_id', filters.workoutSessionId);
            }
            if (filters.analysisType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'analysisType', filters.analysisType);
            }
            if (filters.isViewed !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isViewed', filters.isViewed);
            }
            if (filters.performedMinDate && filters.performedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'performedAt', (0, typeorm_1.Between)(filters.performedMinDate, filters.performedMaxDate));
            }
            else if (filters.performedMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'performedAt', (0, typeorm_1.MoreThan)(filters.performedMinDate));
            }
            else if (filters.performedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'performedAt', (0, typeorm_1.LessThan)(filters.performedMaxDate));
            }
            if (filters.minScore !== undefined && filters.maxScore !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'overallScore', (0, typeorm_1.Between)(filters.minScore, filters.maxScore));
            }
            else if (filters.minScore !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'overallScore', (0, typeorm_1.MoreThan)(filters.minScore));
            }
            else if (filters.maxScore !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'overallScore', (0, typeorm_1.LessThan)(filters.maxScore));
            }
            if (filters.minRepetitions !== undefined && filters.maxRepetitions !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'repetitionsDetected', (0, typeorm_1.Between)(filters.minRepetitions, filters.maxRepetitions));
            }
            else if (filters.minRepetitions !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'repetitionsDetected', (0, typeorm_1.MoreThan)(filters.minRepetitions));
            }
            else if (filters.maxRepetitions !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'repetitionsDetected', (0, typeorm_1.LessThan)(filters.maxRepetitions));
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
            if (filters.hasCorrectionPoints !== undefined) {
                if (filters.hasCorrectionPoints) {
                    if (!queryOptions.where) {
                        queryOptions.where = {};
                    }
                    if (!relations.includes('correctionPoints')) {
                        relations.push('correctionPoints');
                        queryOptions.relations = relations;
                    }
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'correctionPoints.id', (0, typeorm_1.Not)((0, typeorm_1.IsNull)()));
                }
                else {
                    if (!relations.includes('correctionPoints')) {
                        relations.push('correctionPoints');
                        queryOptions.relations = relations;
                    }
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'correctionPoints.id', (0, typeorm_1.IsNull)());
                }
            }
            if (filters.severityLevel && filters.includeCorrectionPoints) {
                if (!relations.includes('correctionPoints')) {
                    relations.push('correctionPoints');
                    queryOptions.relations = relations;
                }
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'correctionPoints.severity', filters.severityLevel);
            }
            if (filters.searchTerm) {
                const searchPattern = (0, typeorm_1.ILike)(`%${filters.searchTerm}%`);
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push({ summary: searchPattern }, { analysisType: searchPattern });
                queryOptions.where = whereArray;
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseFormAnalysisRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findLatestByUser(userId, limit = 5) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { performedAt: 'DESC' };
            queryOptions.relations = ['exercise', 'correctionPoints'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', userId);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseFormAnalysisRepository.findLatestByUser', { error, userId, limit });
            throw error;
        }
    }
    async findByExercise(exerciseId, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { performedAt: 'DESC' };
            queryOptions.relations = ['user', 'correctionPoints'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise_id', exerciseId);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseFormAnalysisRepository.findByExercise', { error, exerciseId, limit });
            throw error;
        }
    }
    async findByWorkoutSession(sessionId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { performedAt: 'ASC' };
            queryOptions.relations = ['exercise', 'correctionPoints'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workout_session_id', sessionId);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseFormAnalysisRepository.findByWorkoutSession', { error, sessionId });
            throw error;
        }
    }
    async markAsViewed(analysisId) {
        try {
            await this.repository.update(analysisId, { isViewed: true });
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseFormAnalysisRepository.markAsViewed', { error, analysisId });
            throw error;
        }
    }
    async getUserFormProgress(userId, exerciseId, startDate, endDate) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.relations = ['exercise'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', userId);
            if (exerciseId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise_id', exerciseId);
            }
            if (startDate && endDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'performedAt', (0, typeorm_1.Between)(startDate, endDate));
            }
            else if (startDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'performedAt', (0, typeorm_1.MoreThan)(startDate));
            }
            else if (endDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'performedAt', (0, typeorm_1.LessThan)(endDate));
            }
            queryOptions.order = { performedAt: 'ASC' };
            const analyses = await this.repository.find(queryOptions);
            return analyses.map(analysis => {
                var _a;
                return ({
                    id: analysis.id,
                    exerciseId: analysis.exercise_id,
                    exerciseName: (_a = analysis.exercise) === null || _a === void 0 ? void 0 : _a.name,
                    date: analysis.performedAt,
                    score: analysis.overallScore,
                    reps: {
                        total: analysis.repetitionsDetected,
                        goodForm: analysis.goodFormRepetitions
                    },
                    formQuality: analysis.goodFormRepetitions / (analysis.repetitionsDetected || 1),
                    summary: analysis.summary
                });
            });
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseFormAnalysisRepository.getUserFormProgress', { error, userId, exerciseId });
            throw error;
        }
    }
}
exports.ExerciseFormAnalysisRepository = ExerciseFormAnalysisRepository;
//# sourceMappingURL=ExerciseFormAnalysisRepository.js.map