import { FindManyOptions, In } from 'typeorm';
import { AIModelConfiguration, AIModelType } from '../models/AIModelConfiguration';
import { ExerciseAnalysisType } from '../models/ExerciseSpecificAnalysis';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying AI model configurations
 */
export interface AIModelConfigurationFilters {
    exerciseType?: ExerciseAnalysisType;
    exerciseTypes?: ExerciseAnalysisType[];
    modelType?: AIModelType;
    modelTypes?: AIModelType[];
    isActive?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for AIModelConfiguration entity
 */
export class AIModelConfigurationRepository extends GenericRepository<AIModelConfiguration> {
    constructor() {
        super(AIModelConfiguration);
    }

    /**
     * Find AI model configurations with detailed filtering options
     */
    async findWithFilters(filters: AIModelConfigurationFilters): Promise<[AIModelConfiguration[], number]> {
        try {
            const queryOptions: FindManyOptions<AIModelConfiguration> = createQueryOptions<AIModelConfiguration>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { createdAt: 'DESC' };

            // Apply basic filters
            if (filters.exerciseType) {
                addWhereCondition(queryOptions, 'exerciseType', filters.exerciseType);
            }

            if (filters.exerciseTypes && filters.exerciseTypes.length > 0) {
                addWhereCondition(queryOptions, 'exerciseType', In(filters.exerciseTypes));
            }

            if (filters.modelType) {
                addWhereCondition(queryOptions, 'modelType', filters.modelType);
            }

            if (filters.modelTypes && filters.modelTypes.length > 0) {
                addWhereCondition(queryOptions, 'modelType', In(filters.modelTypes));
            }

            if (filters.isActive !== undefined) {
                addWhereCondition(queryOptions, 'isActive', filters.isActive);
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in AIModelConfigurationRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find active configuration for specific exercise type and model type
     */
    async findActiveConfig(exerciseType: ExerciseAnalysisType, modelType: AIModelType): Promise<AIModelConfiguration | null> {
        try {
            const queryOptions: FindManyOptions<AIModelConfiguration> = createQueryOptions<AIModelConfiguration>({});
            
            // Add where conditions
            addWhereCondition(queryOptions, 'exerciseType', exerciseType);
            addWhereCondition(queryOptions, 'modelType', modelType);
            addWhereCondition(queryOptions, 'isActive', true);

            return await this.repository.findOne(queryOptions);
        } catch (error) {
            logger.error('Error in AIModelConfigurationRepository.findActiveConfig', { error, exerciseType, modelType });
            throw error;
        }
    }

    /**
     * Get all active model configurations
     */
    async findAllActive(): Promise<AIModelConfiguration[]> {
        try {
            const queryOptions: FindManyOptions<AIModelConfiguration> = createQueryOptions<AIModelConfiguration>({});
            
            // Add where conditions
            addWhereCondition(queryOptions, 'isActive', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in AIModelConfigurationRepository.findAllActive', { error });
            throw error;
        }
    }

    /**
     * Activate a specific model configuration and deactivate others of the same type
     */
    async activateConfig(configId: string): Promise<void> {
        try {
            // First get the configuration we want to activate
            const config = await this.repository.findOne({
                where: { id: configId }
            });
            
            if (!config) {
                throw new Error(`Configuration with ID ${configId} not found`);
            }
            
            // Deactivate all configurations of the same exercise and model type
            await this.repository
                .createQueryBuilder()
                .update()
                .set({ isActive: false })
                .where('exerciseType = :exerciseType', { exerciseType: config.exerciseType })
                .andWhere('modelType = :modelType', { modelType: config.modelType })
                .execute();
            
            // Activate the selected configuration
            await this.repository.update(configId, { isActive: true });
        } catch (error) {
            logger.error('Error in AIModelConfigurationRepository.activateConfig', { error, configId });
            throw error;
        }
    }

    /**
     * Update model parameters
     */
    async updateParameters(configId: string, parameters: any): Promise<AIModelConfiguration> {
        try {
            const config = await this.repository.findOne({
                where: { id: configId }
            });
            
            if (!config) {
                throw new Error(`Configuration with ID ${configId} not found`);
            }
            
            // Update the parameters
            config.modelParameters = {
                ...config.modelParameters,
                ...parameters
            };
            
            return await this.repository.save(config);
        } catch (error) {
            logger.error('Error in AIModelConfigurationRepository.updateParameters', { error, configId, parameters });
            throw error;
        }
    }

    /**
     * Update analysis rules
     */
    async updateAnalysisRules(configId: string, rules: any): Promise<AIModelConfiguration> {
        try {
            const config = await this.repository.findOne({
                where: { id: configId }
            });
            
            if (!config) {
                throw new Error(`Configuration with ID ${configId} not found`);
            }
            
            // Update the analysis rules
            config.analysisRules = {
                ...config.analysisRules,
                ...rules
            };
            
            return await this.repository.save(config);
        } catch (error) {
            logger.error('Error in AIModelConfigurationRepository.updateAnalysisRules', { error, configId, rules });
            throw error;
        }
    }

    /**
     * Create a new model configuration based on an existing one
     */
    async cloneConfig(configId: string, changes: Partial<AIModelConfiguration> = {}): Promise<AIModelConfiguration> {
        try {
            const sourceConfig = await this.repository.findOne({
                where: { id: configId }
            });
            
            if (!sourceConfig) {
                throw new Error(`Configuration with ID ${configId} not found`);
            }
            
            // Create a new configuration based on the source
            const newConfig = new AIModelConfiguration();
            
            // Copy base properties
            newConfig.exerciseType = sourceConfig.exerciseType;
            newConfig.modelType = sourceConfig.modelType;
            newConfig.modelParameters = { ...sourceConfig.modelParameters };
            newConfig.analysisRules = { ...sourceConfig.analysisRules };
            
            // Initialize metadata as an empty object rather than undefined
            newConfig.metadata = sourceConfig.metadata ? { ...sourceConfig.metadata } : {};
            
            // New configs are inactive by default to avoid conflicts
            newConfig.isActive = false;
            
            // Apply any changes
            Object.assign(newConfig, changes);
            
            // Update metadata for cloned config
            newConfig.metadata.description = 
                `Cloned from ${sourceConfig.id} on ${new Date().toISOString()}`;
            newConfig.metadata.lastUpdated = new Date();
            
            return await this.repository.save(newConfig);
        } catch (error) {
            logger.error('Error in AIModelConfigurationRepository.cloneConfig', { error, configId, changes });
            throw error;
        }
    }
} 