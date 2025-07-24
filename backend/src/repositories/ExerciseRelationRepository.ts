import { Between, FindManyOptions, LessThan, MoreThan, In, ILike } from 'typeorm';
import { ExerciseRelation, RelationType } from '../models/ExerciseRelation';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying exercise relations
 */
export interface ExerciseRelationFilters {
    baseExerciseId?: string;
    baseExerciseIds?: string[];
    relatedExerciseId?: string;
    relatedExerciseIds?: string[];
    relationType?: RelationType;
    relationTypes?: RelationType[];
    minSimilarityScore?: number;
    maxSimilarityScore?: number;
    searchTerm?: string;
    createdMinDate?: Date;
    createdMaxDate?: Date;
    updatedMinDate?: Date;
    updatedMaxDate?: Date;
    includeBaseExercise?: boolean;
    includeRelatedExercise?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for ExerciseRelation entity
 */
export class ExerciseRelationRepository extends GenericRepository<ExerciseRelation> {
    constructor() {
        super(ExerciseRelation);
    }

    /**
     * Find exercise relations with detailed filtering options
     */
    async findWithFilters(filters: ExerciseRelationFilters): Promise<[ExerciseRelation[], number]> {
        try {
            const queryOptions: FindManyOptions<ExerciseRelation> = createQueryOptions<ExerciseRelation>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { updatedAt: 'DESC' };

            // Add relations if needed
            const relations: string[] = [];
            if (filters.includeBaseExercise) relations.push('baseExercise');
            if (filters.includeRelatedExercise) relations.push('relatedExercise');
            
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }

            // Apply basic filters
            if (filters.baseExerciseId) {
                addWhereCondition(queryOptions, 'base_exercise_id', filters.baseExerciseId);
            }

            if (filters.baseExerciseIds && filters.baseExerciseIds.length > 0) {
                addWhereCondition(queryOptions, 'base_exercise_id', In(filters.baseExerciseIds));
            }

            if (filters.relatedExerciseId) {
                addWhereCondition(queryOptions, 'related_exercise_id', filters.relatedExerciseId);
            }

            if (filters.relatedExerciseIds && filters.relatedExerciseIds.length > 0) {
                addWhereCondition(queryOptions, 'related_exercise_id', In(filters.relatedExerciseIds));
            }

            if (filters.relationType) {
                addWhereCondition(queryOptions, 'relationType', filters.relationType);
            }

            if (filters.relationTypes && filters.relationTypes.length > 0) {
                addWhereCondition(queryOptions, 'relationType', In(filters.relationTypes));
            }

            // Similarity score range filters
            if (filters.minSimilarityScore !== undefined && filters.maxSimilarityScore !== undefined) {
                addWhereCondition(queryOptions, 'similarityScore', 
                    Between(filters.minSimilarityScore, filters.maxSimilarityScore));
            } else if (filters.minSimilarityScore !== undefined) {
                addWhereCondition(queryOptions, 'similarityScore', 
                    MoreThan(filters.minSimilarityScore));
            } else if (filters.maxSimilarityScore !== undefined) {
                addWhereCondition(queryOptions, 'similarityScore', 
                    LessThan(filters.maxSimilarityScore));
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

            // Updated date range filters
            if (filters.updatedMinDate && filters.updatedMaxDate) {
                addWhereCondition(queryOptions, 'updatedAt', 
                    Between(filters.updatedMinDate, filters.updatedMaxDate));
            } else if (filters.updatedMinDate) {
                addWhereCondition(queryOptions, 'updatedAt', 
                    MoreThan(filters.updatedMinDate));
            } else if (filters.updatedMaxDate) {
                addWhereCondition(queryOptions, 'updatedAt', 
                    LessThan(filters.updatedMaxDate));
            }

            // Search term for notes
            if (filters.searchTerm) {
                addWhereCondition(queryOptions, 'notes', ILike(`%${filters.searchTerm}%`));
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in ExerciseRelationRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find all variations of an exercise
     */
    async findVariations(exerciseId: string): Promise<ExerciseRelation[]> {
        try {
            const queryOptions: FindManyOptions<ExerciseRelation> = createQueryOptions<ExerciseRelation>({});
            
            // Set relations
            queryOptions.relations = ['relatedExercise'];
            
            // Set sorting by similarity score
            queryOptions.order = { similarityScore: 'DESC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'base_exercise_id', exerciseId);
            addWhereCondition(queryOptions, 'relationType', RelationType.VARIATION);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in ExerciseRelationRepository.findVariations', { error, exerciseId });
            throw error;
        }
    }

    /**
     * Find all alternatives of an exercise
     */
    async findAlternatives(exerciseId: string): Promise<ExerciseRelation[]> {
        try {
            const queryOptions: FindManyOptions<ExerciseRelation> = createQueryOptions<ExerciseRelation>({});
            
            // Set relations
            queryOptions.relations = ['relatedExercise'];
            
            // Set sorting by similarity score
            queryOptions.order = { similarityScore: 'DESC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'base_exercise_id', exerciseId);
            addWhereCondition(queryOptions, 'relationType', RelationType.ALTERNATIVE);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in ExerciseRelationRepository.findAlternatives', { error, exerciseId });
            throw error;
        }
    }

    /**
     * Find progression/regression path for an exercise
     */
    async findProgressionPath(exerciseId: string): Promise<any> {
        try {
            // Find progressions (more advanced exercises)
            const progressions = await this.repository.find({
                where: {
                    base_exercise_id: exerciseId,
                    relationType: RelationType.PROGRESSION
                },
                relations: ['relatedExercise'],
                order: { similarityScore: 'DESC' }
            });

            // Find regressions (easier exercises)
            const regressions = await this.repository.find({
                where: {
                    base_exercise_id: exerciseId,
                    relationType: RelationType.REGRESSION
                },
                relations: ['relatedExercise'],
                order: { similarityScore: 'DESC' }
            });

            return {
                progressions,
                regressions
            };
        } catch (error) {
            logger.error('Error in ExerciseRelationRepository.findProgressionPath', { error, exerciseId });
            throw error;
        }
    }

    /**
     * Find all relations for an exercise
     */
    async findAllRelations(exerciseId: string): Promise<any> {
        try {
            // Find relations where this exercise is the base
            const relationsFrom = await this.repository.find({
                where: { base_exercise_id: exerciseId },
                relations: ['relatedExercise'],
                order: { relationType: 'ASC', similarityScore: 'DESC' }
            });

            // Find relations where this exercise is the related exercise
            const relationsTo = await this.repository.find({
                where: { related_exercise_id: exerciseId },
                relations: ['baseExercise'],
                order: { relationType: 'ASC', similarityScore: 'DESC' }
            });

            // Group relations by type
            const groupedRelations = {
                variations: relationsFrom.filter(r => r.relationType === RelationType.VARIATION),
                alternatives: relationsFrom.filter(r => r.relationType === RelationType.ALTERNATIVE),
                progressions: relationsFrom.filter(r => r.relationType === RelationType.PROGRESSION),
                regressions: relationsFrom.filter(r => r.relationType === RelationType.REGRESSION),
                isVariationOf: relationsTo.filter(r => r.relationType === RelationType.VARIATION),
                isAlternativeOf: relationsTo.filter(r => r.relationType === RelationType.ALTERNATIVE),
                isProgressionOf: relationsTo.filter(r => r.relationType === RelationType.REGRESSION), // Note the reversal
                isRegressionOf: relationsTo.filter(r => r.relationType === RelationType.PROGRESSION) // Note the reversal
            };

            return groupedRelations;
        } catch (error) {
            logger.error('Error in ExerciseRelationRepository.findAllRelations', { error, exerciseId });
            throw error;
        }
    }

    /**
     * Check if a relation exists between two exercises
     */
    async relationExists(baseExerciseId: string, relatedExerciseId: string, relationType?: RelationType): Promise<boolean> {
        try {
            const queryOptions: FindManyOptions<ExerciseRelation> = createQueryOptions<ExerciseRelation>({});
            
            // Add where conditions
            addWhereCondition(queryOptions, 'base_exercise_id', baseExerciseId);
            addWhereCondition(queryOptions, 'related_exercise_id', relatedExerciseId);
            
            if (relationType) {
                addWhereCondition(queryOptions, 'relationType', relationType);
            }

            const count = await this.repository.count(queryOptions);
            return count > 0;
        } catch (error) {
            logger.error('Error in ExerciseRelationRepository.relationExists', 
                { error, baseExerciseId, relatedExerciseId, relationType });
            throw error;
        }
    }

    /**
     * Create bidirectional relation
     * This creates two relations: A->B and an appropriate inverse B->A
     */
    async createBidirectionalRelation(
        baseExerciseId: string, 
        relatedExerciseId: string, 
        relationType: RelationType, 
        similarityScore: number = 1,
        notes?: string
    ): Promise<[ExerciseRelation, ExerciseRelation]> {
        try {
            // Create the base->related relation
            const forwardRelation = this.repository.create({
                base_exercise_id: baseExerciseId,
                related_exercise_id: relatedExerciseId,
                relationType,
                similarityScore,
                notes
            });

            // Determine the inverse relation type
            let inverseRelationType: RelationType;
            switch (relationType) {
                case RelationType.VARIATION:
                case RelationType.ALTERNATIVE:
                    inverseRelationType = relationType; // These are symmetric
                    break;
                case RelationType.PROGRESSION:
                    inverseRelationType = RelationType.REGRESSION;
                    break;
                case RelationType.REGRESSION:
                    inverseRelationType = RelationType.PROGRESSION;
                    break;
                default:
                    inverseRelationType = relationType;
            }

            // Create the related->base relation
            const inverseRelation = this.repository.create({
                base_exercise_id: relatedExerciseId,
                related_exercise_id: baseExerciseId,
                relationType: inverseRelationType,
                similarityScore,
                notes
            });

            // Save both relations in a transaction
            await this.repository.manager.transaction(async transactionalEntityManager => {
                await transactionalEntityManager.save(forwardRelation);
                await transactionalEntityManager.save(inverseRelation);
            });

            return [forwardRelation, inverseRelation];
        } catch (error) {
            logger.error('Error in ExerciseRelationRepository.createBidirectionalRelation', 
                { error, baseExerciseId, relatedExerciseId, relationType, similarityScore });
            throw error;
        }
    }

    /**
     * Delete relation and its inverse
     */
    async deleteBidirectionalRelation(relationId: string): Promise<void> {
        try {
            // Find the relation to delete
            const relation = await this.repository.findOne({
                where: { id: relationId }
            });

            if (!relation) {
                throw new Error(`Relation with ID ${relationId} not found`);
            }

            // Find the inverse relation
            const inverseRelation = await this.repository.findOne({
                where: {
                    base_exercise_id: relation.related_exercise_id,
                    related_exercise_id: relation.base_exercise_id
                }
            });

            // Delete both relations in a transaction
            await this.repository.manager.transaction(async transactionalEntityManager => {
                await transactionalEntityManager.remove(relation);
                if (inverseRelation) {
                    await transactionalEntityManager.remove(inverseRelation);
                }
            });
        } catch (error) {
            logger.error('Error in ExerciseRelationRepository.deleteBidirectionalRelation', { error, relationId });
            throw error;
        }
    }

    /**
     * Count relations by type
     */
    async countByType(): Promise<any> {
        try {
            // Perform the calculation using TypeORM query builder
            const counts = await this.repository
                .createQueryBuilder('relation')
                .select('relation.relationType', 'type')
                .addSelect('COUNT(*)', 'count')
                .groupBy('relation.relationType')
                .getRawMany();
            
            // Convert to a more readable format
            const result: Record<string, number> = {};
            for (const item of counts) {
                result[item.type] = parseInt(item.count);
            }
            
            return result;
        } catch (error) {
            logger.error('Error in ExerciseRelationRepository.countByType', { error });
            throw error;
        }
    }
} 