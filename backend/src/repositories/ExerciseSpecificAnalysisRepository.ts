import { FindManyOptions, In } from 'typeorm';
import { ExerciseSpecificAnalysis, ExerciseAnalysisType } from '../models/ExerciseSpecificAnalysis';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying exercise-specific analyses
 */
export interface ExerciseSpecificAnalysisFilters {
    analysisId?: string;
    analysisIds?: string[];
    exerciseType?: ExerciseAnalysisType;
    exerciseTypes?: ExerciseAnalysisType[];
    includeAnalysis?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for ExerciseSpecificAnalysis entity
 */
export class ExerciseSpecificAnalysisRepository extends GenericRepository<ExerciseSpecificAnalysis> {
    constructor() {
        super(ExerciseSpecificAnalysis);
    }

    /**
     * Find exercise-specific analyses with detailed filtering options
     */
    async findWithFilters(filters: ExerciseSpecificAnalysisFilters): Promise<[ExerciseSpecificAnalysis[], number]> {
        try {
            const queryOptions: FindManyOptions<ExerciseSpecificAnalysis> = createQueryOptions<ExerciseSpecificAnalysis>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { createdAt: 'DESC' };

            // Add relations if needed
            if (filters.includeAnalysis) {
                queryOptions.relations = ['analysis'];
            }

            // Apply basic filters
            if (filters.analysisId) {
                addWhereCondition(queryOptions, 'analysis_id', filters.analysisId);
            }

            if (filters.analysisIds && filters.analysisIds.length > 0) {
                addWhereCondition(queryOptions, 'analysis_id', In(filters.analysisIds));
            }

            if (filters.exerciseType) {
                addWhereCondition(queryOptions, 'exerciseType', filters.exerciseType);
            }

            if (filters.exerciseTypes && filters.exerciseTypes.length > 0) {
                addWhereCondition(queryOptions, 'exerciseType', In(filters.exerciseTypes));
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in ExerciseSpecificAnalysisRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find specific analysis by parent analysis ID
     */
    async findByAnalysisId(analysisId: string): Promise<ExerciseSpecificAnalysis | null> {
        try {
            return await this.repository.findOne({
                where: { analysis_id: analysisId }
            });
        } catch (error) {
            logger.error('Error in ExerciseSpecificAnalysisRepository.findByAnalysisId', { error, analysisId });
            throw error;
        }
    }

    /**
     * Find specific analyses by exercise type
     */
    async findByExerciseType(exerciseType: ExerciseAnalysisType, limit: number = 20): Promise<ExerciseSpecificAnalysis[]> {
        try {
            const queryOptions: FindManyOptions<ExerciseSpecificAnalysis> = createQueryOptions<ExerciseSpecificAnalysis>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { createdAt: 'DESC' };

            // Include relations
            queryOptions.relations = ['analysis', 'analysis.exercise', 'analysis.user'];

            // Add where conditions
            addWhereCondition(queryOptions, 'exerciseType', exerciseType);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in ExerciseSpecificAnalysisRepository.findByExerciseType', { error, exerciseType, limit });
            throw error;
        }
    }

    /**
     * Find specific analyses by user
     * This requires joining with the parent analysis
     */
    async findByUserId(userId: string, limit: number = 20): Promise<ExerciseSpecificAnalysis[]> {
        try {
            // For this query, we need to join with the parent analysis to filter by user_id
            const specificAnalyses = await this.repository
                .createQueryBuilder('specificAnalysis')
                .innerJoinAndSelect('specificAnalysis.analysis', 'analysis')
                .innerJoinAndSelect('analysis.exercise', 'exercise')
                .where('analysis.user_id = :userId', { userId })
                .orderBy('analysis.performedAt', 'DESC')
                .take(limit)
                .getMany();
            
            return specificAnalyses;
        } catch (error) {
            logger.error('Error in ExerciseSpecificAnalysisRepository.findByUserId', { error, userId, limit });
            throw error;
        }
    }

    /**
     * Create specific analysis for an exercise form analysis
     */
    async createForAnalysis(analysisId: string, exerciseType: ExerciseAnalysisType, specificData: any): Promise<ExerciseSpecificAnalysis> {
        try {
            const specificAnalysis = new ExerciseSpecificAnalysis();
            specificAnalysis.analysis_id = analysisId;
            specificAnalysis.exerciseType = exerciseType;
            
            // Add type-specific fields based on the exercise type
            Object.assign(specificAnalysis, specificData);
            
            return await this.repository.save(specificAnalysis);
        } catch (error) {
            logger.error('Error in ExerciseSpecificAnalysisRepository.createForAnalysis', { 
                error, 
                analysisId,
                exerciseType,
                specificData 
            });
            throw error;
        }
    }
} 