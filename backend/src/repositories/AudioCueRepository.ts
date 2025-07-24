import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not, ILike } from 'typeorm';
import { AudioCue } from '../models/AudioCue';
import { AudioCueType, AudioCueTrigger } from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying audio cues
 */
export interface AudioCueFilters {
    type?: AudioCueType;
    trigger?: AudioCueTrigger;
    exerciseId?: string;
    createdById?: string;
    isEnabled?: boolean;
    isPremium?: boolean;
    isSystemDefault?: boolean;
    includeVibration?: boolean;
    language?: string;
    voiceType?: string;
    searchTerm?: string;
    volumeMin?: number;
    volumeMax?: number;
    priorityMin?: number;
    priorityMax?: number;
    durationMin?: number;
    durationMax?: number;
    createdMin?: Date;
    createdMax?: Date;
    includeExercise?: boolean;
    includeWorkoutPlans?: boolean;
    includeCreator?: boolean;
    workoutPlanId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for AudioCue entity
 */
export class AudioCueRepository extends GenericRepository<AudioCue> {
    constructor() {
        super(AudioCue);
    }

    /**
     * Find audio cues with detailed filtering options
     */
    async findWithFilters(filters: AudioCueFilters): Promise<[AudioCue[], number]> {
        try {
            const queryOptions: FindManyOptions<AudioCue> = createQueryOptions<AudioCue>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { createdAt: 'DESC' };

            // Add relations if needed
            const relations: string[] = [];
            if (filters.includeExercise) relations.push('exercise');
            if (filters.includeWorkoutPlans) relations.push('workoutPlans');
            if (filters.includeCreator) relations.push('createdBy');
            
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }

            // Apply basic filters
            if (filters.type) {
                addWhereCondition(queryOptions, 'type', filters.type);
            }

            if (filters.trigger) {
                addWhereCondition(queryOptions, 'trigger', filters.trigger);
            }

            if (filters.exerciseId) {
                addWhereCondition(queryOptions, 'exercise_id', filters.exerciseId);
            }

            if (filters.createdById) {
                addWhereCondition(queryOptions, 'created_by', filters.createdById);
            }

            if (filters.isEnabled !== undefined) {
                addWhereCondition(queryOptions, 'isEnabled', filters.isEnabled);
            }

            if (filters.isPremium !== undefined) {
                addWhereCondition(queryOptions, 'isPremium', filters.isPremium);
            }

            if (filters.isSystemDefault !== undefined) {
                addWhereCondition(queryOptions, 'isSystemDefault', filters.isSystemDefault);
            }

            if (filters.includeVibration !== undefined) {
                addWhereCondition(queryOptions, 'includeVibration', filters.includeVibration);
            }

            if (filters.language) {
                addWhereCondition(queryOptions, 'language', filters.language);
            }

            if (filters.voiceType) {
                addWhereCondition(queryOptions, 'voiceType', filters.voiceType);
            }

            // Volume range filters
            if (filters.volumeMin !== undefined && filters.volumeMax !== undefined) {
                addWhereCondition(queryOptions, 'volume', Between(filters.volumeMin, filters.volumeMax));
            } else if (filters.volumeMin !== undefined) {
                addWhereCondition(queryOptions, 'volume', MoreThan(filters.volumeMin));
            } else if (filters.volumeMax !== undefined) {
                addWhereCondition(queryOptions, 'volume', LessThan(filters.volumeMax));
            }

            // Priority range filters
            if (filters.priorityMin !== undefined && filters.priorityMax !== undefined) {
                addWhereCondition(queryOptions, 'priority', Between(filters.priorityMin, filters.priorityMax));
            } else if (filters.priorityMin !== undefined) {
                addWhereCondition(queryOptions, 'priority', MoreThan(filters.priorityMin));
            } else if (filters.priorityMax !== undefined) {
                addWhereCondition(queryOptions, 'priority', LessThan(filters.priorityMax));
            }

            // Duration range filters
            if (filters.durationMin !== undefined && filters.durationMax !== undefined) {
                addWhereCondition(queryOptions, 'durationSeconds', Between(filters.durationMin, filters.durationMax));
            } else if (filters.durationMin !== undefined) {
                addWhereCondition(queryOptions, 'durationSeconds', MoreThan(filters.durationMin));
            } else if (filters.durationMax !== undefined) {
                addWhereCondition(queryOptions, 'durationSeconds', LessThan(filters.durationMax));
            }

            // Created date range filters
            if (filters.createdMin && filters.createdMax) {
                addWhereCondition(queryOptions, 'createdAt', Between(filters.createdMin, filters.createdMax));
            } else if (filters.createdMin) {
                addWhereCondition(queryOptions, 'createdAt', MoreThan(filters.createdMin));
            } else if (filters.createdMax) {
                addWhereCondition(queryOptions, 'createdAt', LessThan(filters.createdMax));
            }

            // Workout Plan filter
            if (filters.workoutPlanId && filters.includeWorkoutPlans) {
                // This is a simplified approach and might need further improvement based on your ORM setup
                if (!queryOptions.where) {
                    queryOptions.where = {};
                }
                
                // We add a condition to find audio cues associated with the specified workout plan
                addWhereCondition(queryOptions, 'workoutPlans.id', filters.workoutPlanId);
            }

            // Search filter
            if (filters.searchTerm) {
                // This is a simplified implementation
                // For a real app, you might want to use full-text search or a more complex query
                const searchPattern = ILike(`%${filters.searchTerm}%`);
                
                // Add where conditions for name and script
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push(
                    { name: searchPattern },
                    { script: searchPattern }
                );
                
                queryOptions.where = whereArray;
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in AudioCueRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find audio cues for specific exercise
     */
    async findByExercise(exerciseId: string): Promise<AudioCue[]> {
        try {
            const queryOptions: FindManyOptions<AudioCue> = createQueryOptions<AudioCue>({});
            
            // Set sorting
            queryOptions.order = { 
                priority: 'DESC',
                type: 'ASC'
            };

            // Add where conditions
            addWhereCondition(queryOptions, 'exercise_id', exerciseId);
            addWhereCondition(queryOptions, 'isEnabled', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in AudioCueRepository.findByExercise', { error, exerciseId });
            throw error;
        }
    }

    /**
     * Find audio cues for a workout plan
     */
    async findByWorkoutPlan(workoutPlanId: string): Promise<AudioCue[]> {
        try {
            const queryOptions: FindManyOptions<AudioCue> = createQueryOptions<AudioCue>({});
            
            // Set sorting
            queryOptions.order = { 
                priority: 'DESC',
                type: 'ASC'
            };

            // Include relation and add where condition
            queryOptions.relations = ['workoutPlans'];
            addWhereCondition(queryOptions, 'workoutPlans.id', workoutPlanId);
            addWhereCondition(queryOptions, 'isEnabled', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in AudioCueRepository.findByWorkoutPlan', { error, workoutPlanId });
            throw error;
        }
    }

    /**
     * Find system default audio cues
     */
    async findSystemDefaults(): Promise<AudioCue[]> {
        try {
            const queryOptions: FindManyOptions<AudioCue> = createQueryOptions<AudioCue>({});
            
            // Set sorting
            queryOptions.order = { 
                type: 'ASC',
                priority: 'DESC'
            };

            // Add where conditions
            addWhereCondition(queryOptions, 'isSystemDefault', true);
            addWhereCondition(queryOptions, 'isEnabled', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in AudioCueRepository.findSystemDefaults', { error });
            throw error;
        }
    }

    /**
     * Find audio cues by type
     */
    async findByType(type: AudioCueType): Promise<AudioCue[]> {
        try {
            const queryOptions: FindManyOptions<AudioCue> = createQueryOptions<AudioCue>({});
            
            // Set sorting
            queryOptions.order = { 
                priority: 'DESC',
                createdAt: 'DESC'
            };

            // Add where conditions
            addWhereCondition(queryOptions, 'type', type);
            addWhereCondition(queryOptions, 'isEnabled', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in AudioCueRepository.findByType', { error, type });
            throw error;
        }
    }

    /**
     * Add audio cue to workout plan
     */
    async addToWorkoutPlan(cueId: string, workoutPlanId: string): Promise<void> {
        try {
            const cue = await this.repository.findOne({ 
                where: { id: cueId },
                relations: ['workoutPlans'] 
            });
            
            if (!cue) {
                throw new Error(`Audio cue with ID ${cueId} not found`);
            }

            // Check if the workout plan is already associated
            const planExists = cue.workoutPlans?.some(plan => String(plan.id) === workoutPlanId);
            if (planExists) {
                return; // Already associated, nothing to do
            }

            // Add the association and save
            if (!cue.workoutPlans) {
                cue.workoutPlans = [];
            }
            
            cue.workoutPlans.push({ id: workoutPlanId } as any);
            await this.repository.save(cue);
        } catch (error) {
            logger.error('Error in AudioCueRepository.addToWorkoutPlan', { error, cueId, workoutPlanId });
            throw error;
        }
    }

    /**
     * Remove audio cue from workout plan
     */
    async removeFromWorkoutPlan(cueId: string, workoutPlanId: string): Promise<void> {
        try {
            const cue = await this.repository.findOne({ 
                where: { id: cueId },
                relations: ['workoutPlans'] 
            });
            
            if (!cue || !cue.workoutPlans) {
                return; // Nothing to remove
            }

            // Filter out the workout plan
            cue.workoutPlans = cue.workoutPlans.filter(plan => String(plan.id) !== workoutPlanId);
            await this.repository.save(cue);
        } catch (error) {
            logger.error('Error in AudioCueRepository.removeFromWorkoutPlan', { error, cueId, workoutPlanId });
            throw error;
        }
    }
} 