"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseSpecificAnalysisRepository = void 0;
const typeorm_1 = require("typeorm");
const ExerciseSpecificAnalysis_1 = require("../models/ExerciseSpecificAnalysis");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class ExerciseSpecificAnalysisRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(ExerciseSpecificAnalysis_1.ExerciseSpecificAnalysis);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { createdAt: 'DESC' };
            if (filters.includeAnalysis) {
                queryOptions.relations = ['analysis'];
            }
            if (filters.analysisId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'analysis_id', filters.analysisId);
            }
            if (filters.analysisIds && filters.analysisIds.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'analysis_id', (0, typeorm_1.In)(filters.analysisIds));
            }
            if (filters.exerciseType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exerciseType', filters.exerciseType);
            }
            if (filters.exerciseTypes && filters.exerciseTypes.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exerciseType', (0, typeorm_1.In)(filters.exerciseTypes));
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseSpecificAnalysisRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findByAnalysisId(analysisId) {
        try {
            return await this.repository.findOne({
                where: { analysis_id: analysisId }
            });
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseSpecificAnalysisRepository.findByAnalysisId', { error, analysisId });
            throw error;
        }
    }
    async findByExerciseType(exerciseType, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { createdAt: 'DESC' };
            queryOptions.relations = ['analysis', 'analysis.exercise', 'analysis.user'];
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exerciseType', exerciseType);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseSpecificAnalysisRepository.findByExerciseType', { error, exerciseType, limit });
            throw error;
        }
    }
    async findByUserId(userId, limit = 20) {
        try {
            const specificAnalyses = await this.repository
                .createQueryBuilder('specificAnalysis')
                .innerJoinAndSelect('specificAnalysis.analysis', 'analysis')
                .innerJoinAndSelect('analysis.exercise', 'exercise')
                .where('analysis.user_id = :userId', { userId })
                .orderBy('analysis.performedAt', 'DESC')
                .take(limit)
                .getMany();
            return specificAnalyses;
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseSpecificAnalysisRepository.findByUserId', { error, userId, limit });
            throw error;
        }
    }
    async createForAnalysis(analysisId, exerciseType, specificData) {
        try {
            const specificAnalysis = new ExerciseSpecificAnalysis_1.ExerciseSpecificAnalysis();
            specificAnalysis.analysis_id = analysisId;
            specificAnalysis.exerciseType = exerciseType;
            Object.assign(specificAnalysis, specificData);
            return await this.repository.save(specificAnalysis);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseSpecificAnalysisRepository.createForAnalysis', {
                error,
                analysisId,
                exerciseType,
                specificData
            });
            throw error;
        }
    }
}
exports.ExerciseSpecificAnalysisRepository = ExerciseSpecificAnalysisRepository;
//# sourceMappingURL=ExerciseSpecificAnalysisRepository.js.map