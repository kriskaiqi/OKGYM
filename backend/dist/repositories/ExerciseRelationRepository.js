"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseRelationRepository = void 0;
const typeorm_1 = require("typeorm");
const ExerciseRelation_1 = require("../models/ExerciseRelation");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class ExerciseRelationRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(ExerciseRelation_1.ExerciseRelation);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { updatedAt: 'DESC' };
            const relations = [];
            if (filters.includeBaseExercise)
                relations.push('baseExercise');
            if (filters.includeRelatedExercise)
                relations.push('relatedExercise');
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }
            if (filters.baseExerciseId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'base_exercise_id', filters.baseExerciseId);
            }
            if (filters.baseExerciseIds && filters.baseExerciseIds.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'base_exercise_id', (0, typeorm_1.In)(filters.baseExerciseIds));
            }
            if (filters.relatedExerciseId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'related_exercise_id', filters.relatedExerciseId);
            }
            if (filters.relatedExerciseIds && filters.relatedExerciseIds.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'related_exercise_id', (0, typeorm_1.In)(filters.relatedExerciseIds));
            }
            if (filters.relationType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'relationType', filters.relationType);
            }
            if (filters.relationTypes && filters.relationTypes.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'relationType', (0, typeorm_1.In)(filters.relationTypes));
            }
            if (filters.minSimilarityScore !== undefined && filters.maxSimilarityScore !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'similarityScore', (0, typeorm_1.Between)(filters.minSimilarityScore, filters.maxSimilarityScore));
            }
            else if (filters.minSimilarityScore !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'similarityScore', (0, typeorm_1.MoreThan)(filters.minSimilarityScore));
            }
            else if (filters.maxSimilarityScore !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'similarityScore', (0, typeorm_1.LessThan)(filters.maxSimilarityScore));
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
            if (filters.updatedMinDate && filters.updatedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'updatedAt', (0, typeorm_1.Between)(filters.updatedMinDate, filters.updatedMaxDate));
            }
            else if (filters.updatedMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'updatedAt', (0, typeorm_1.MoreThan)(filters.updatedMinDate));
            }
            else if (filters.updatedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'updatedAt', (0, typeorm_1.LessThan)(filters.updatedMaxDate));
            }
            if (filters.searchTerm) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'notes', (0, typeorm_1.ILike)(`%${filters.searchTerm}%`));
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseRelationRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findVariations(exerciseId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.relations = ['relatedExercise'];
            queryOptions.order = { similarityScore: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'base_exercise_id', exerciseId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'relationType', ExerciseRelation_1.RelationType.VARIATION);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseRelationRepository.findVariations', { error, exerciseId });
            throw error;
        }
    }
    async findAlternatives(exerciseId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.relations = ['relatedExercise'];
            queryOptions.order = { similarityScore: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'base_exercise_id', exerciseId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'relationType', ExerciseRelation_1.RelationType.ALTERNATIVE);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseRelationRepository.findAlternatives', { error, exerciseId });
            throw error;
        }
    }
    async findProgressionPath(exerciseId) {
        try {
            const progressions = await this.repository.find({
                where: {
                    base_exercise_id: exerciseId,
                    relationType: ExerciseRelation_1.RelationType.PROGRESSION
                },
                relations: ['relatedExercise'],
                order: { similarityScore: 'DESC' }
            });
            const regressions = await this.repository.find({
                where: {
                    base_exercise_id: exerciseId,
                    relationType: ExerciseRelation_1.RelationType.REGRESSION
                },
                relations: ['relatedExercise'],
                order: { similarityScore: 'DESC' }
            });
            return {
                progressions,
                regressions
            };
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseRelationRepository.findProgressionPath', { error, exerciseId });
            throw error;
        }
    }
    async findAllRelations(exerciseId) {
        try {
            const relationsFrom = await this.repository.find({
                where: { base_exercise_id: exerciseId },
                relations: ['relatedExercise'],
                order: { relationType: 'ASC', similarityScore: 'DESC' }
            });
            const relationsTo = await this.repository.find({
                where: { related_exercise_id: exerciseId },
                relations: ['baseExercise'],
                order: { relationType: 'ASC', similarityScore: 'DESC' }
            });
            const groupedRelations = {
                variations: relationsFrom.filter(r => r.relationType === ExerciseRelation_1.RelationType.VARIATION),
                alternatives: relationsFrom.filter(r => r.relationType === ExerciseRelation_1.RelationType.ALTERNATIVE),
                progressions: relationsFrom.filter(r => r.relationType === ExerciseRelation_1.RelationType.PROGRESSION),
                regressions: relationsFrom.filter(r => r.relationType === ExerciseRelation_1.RelationType.REGRESSION),
                isVariationOf: relationsTo.filter(r => r.relationType === ExerciseRelation_1.RelationType.VARIATION),
                isAlternativeOf: relationsTo.filter(r => r.relationType === ExerciseRelation_1.RelationType.ALTERNATIVE),
                isProgressionOf: relationsTo.filter(r => r.relationType === ExerciseRelation_1.RelationType.REGRESSION),
                isRegressionOf: relationsTo.filter(r => r.relationType === ExerciseRelation_1.RelationType.PROGRESSION)
            };
            return groupedRelations;
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseRelationRepository.findAllRelations', { error, exerciseId });
            throw error;
        }
    }
    async relationExists(baseExerciseId, relatedExerciseId, relationType) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'base_exercise_id', baseExerciseId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'related_exercise_id', relatedExerciseId);
            if (relationType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'relationType', relationType);
            }
            const count = await this.repository.count(queryOptions);
            return count > 0;
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseRelationRepository.relationExists', { error, baseExerciseId, relatedExerciseId, relationType });
            throw error;
        }
    }
    async createBidirectionalRelation(baseExerciseId, relatedExerciseId, relationType, similarityScore = 1, notes) {
        try {
            const forwardRelation = this.repository.create({
                base_exercise_id: baseExerciseId,
                related_exercise_id: relatedExerciseId,
                relationType,
                similarityScore,
                notes
            });
            let inverseRelationType;
            switch (relationType) {
                case ExerciseRelation_1.RelationType.VARIATION:
                case ExerciseRelation_1.RelationType.ALTERNATIVE:
                    inverseRelationType = relationType;
                    break;
                case ExerciseRelation_1.RelationType.PROGRESSION:
                    inverseRelationType = ExerciseRelation_1.RelationType.REGRESSION;
                    break;
                case ExerciseRelation_1.RelationType.REGRESSION:
                    inverseRelationType = ExerciseRelation_1.RelationType.PROGRESSION;
                    break;
                default:
                    inverseRelationType = relationType;
            }
            const inverseRelation = this.repository.create({
                base_exercise_id: relatedExerciseId,
                related_exercise_id: baseExerciseId,
                relationType: inverseRelationType,
                similarityScore,
                notes
            });
            await this.repository.manager.transaction(async (transactionalEntityManager) => {
                await transactionalEntityManager.save(forwardRelation);
                await transactionalEntityManager.save(inverseRelation);
            });
            return [forwardRelation, inverseRelation];
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseRelationRepository.createBidirectionalRelation', { error, baseExerciseId, relatedExerciseId, relationType, similarityScore });
            throw error;
        }
    }
    async deleteBidirectionalRelation(relationId) {
        try {
            const relation = await this.repository.findOne({
                where: { id: relationId }
            });
            if (!relation) {
                throw new Error(`Relation with ID ${relationId} not found`);
            }
            const inverseRelation = await this.repository.findOne({
                where: {
                    base_exercise_id: relation.related_exercise_id,
                    related_exercise_id: relation.base_exercise_id
                }
            });
            await this.repository.manager.transaction(async (transactionalEntityManager) => {
                await transactionalEntityManager.remove(relation);
                if (inverseRelation) {
                    await transactionalEntityManager.remove(inverseRelation);
                }
            });
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseRelationRepository.deleteBidirectionalRelation', { error, relationId });
            throw error;
        }
    }
    async countByType() {
        try {
            const counts = await this.repository
                .createQueryBuilder('relation')
                .select('relation.relationType', 'type')
                .addSelect('COUNT(*)', 'count')
                .groupBy('relation.relationType')
                .getRawMany();
            const result = {};
            for (const item of counts) {
                result[item.type] = parseInt(item.count);
            }
            return result;
        }
        catch (error) {
            logger_1.default.error('Error in ExerciseRelationRepository.countByType', { error });
            throw error;
        }
    }
}
exports.ExerciseRelationRepository = ExerciseRelationRepository;
//# sourceMappingURL=ExerciseRelationRepository.js.map