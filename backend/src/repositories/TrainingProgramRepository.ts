import { FindManyOptions, FindOptionsWhere, In, Like, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { TrainingProgram } from '../models/TrainingProgram';
import { 
    WorkoutCategory, 
    Difficulty, 
    ProgressionType, 
    SplitType,
    FitnessGoal
} from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import { 
    createQueryOptions, 
    addWhereCondition, 
    addOrderBy,
    createRawQuery
} from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying training programs
 */
export interface TrainingProgramFilters {
    difficulty?: Difficulty;
    category?: WorkoutCategory;
    programStructure?: ProgressionType;
    splitType?: SplitType;
    fitnessGoals?: FitnessGoal[];
    minDurationWeeks?: number;
    maxDurationWeeks?: number;
    minWorkoutsPerWeek?: number;
    maxWorkoutsPerWeek?: number;
    categoryIds?: number[];
    equipmentIds?: string[];
    tagIds?: number[];
    searchTerm?: string;
    isPublished?: boolean;
    creatorId?: string;
    includeWorkouts?: boolean;
    includeCreator?: boolean;
    includeTags?: boolean;
    includeMuscleGroups?: boolean;
    includeEquipment?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for TrainingProgram entity
 */
export class TrainingProgramRepository extends GenericRepository<TrainingProgram> {
    constructor() {
        super(TrainingProgram);
    }

    /**
     * Find training programs with detailed filtering options
     */
    async findWithFilters(filters: TrainingProgramFilters): Promise<[TrainingProgram[], number]> {
        try {
            // Create base query with helper function
            const query = createQueryOptions<TrainingProgram>({
                relations: this.getRequiredRelations(filters),
                take: filters.limit || 20,
                skip: filters.offset || 0
            });

            // Apply basic filters
            if (filters.difficulty) {
                addWhereCondition(query, "difficulty", filters.difficulty);
            }

            if (filters.category) {
                addWhereCondition(query, "category", filters.category);
            }

            if (filters.programStructure) {
                addWhereCondition(query, "programStructure", filters.programStructure);
            }
            
            if (filters.splitType) {
                addWhereCondition(query, "splitType", filters.splitType);
            }

            if (filters.isPublished !== undefined) {
                addWhereCondition(query, "isPublished", filters.isPublished);
            }

            if (filters.creatorId) {
                addWhereCondition(query, "creator_id", filters.creatorId);
            }

            // Duration and workout frequency filters
            if (filters.minDurationWeeks !== undefined) {
                addWhereCondition(query, "durationWeeks", MoreThanOrEqual(filters.minDurationWeeks));
            }

            if (filters.maxDurationWeeks !== undefined) {
                addWhereCondition(query, "durationWeeks", LessThanOrEqual(filters.maxDurationWeeks));
            }

            if (filters.minWorkoutsPerWeek !== undefined) {
                addWhereCondition(query, "workoutsPerWeek", MoreThanOrEqual(filters.minWorkoutsPerWeek));
            }

            if (filters.maxWorkoutsPerWeek !== undefined) {
                addWhereCondition(query, "workoutsPerWeek", LessThanOrEqual(filters.maxWorkoutsPerWeek));
            }
            
            // Fitness Goals filter (stored in JSONB)
            if (filters.fitnessGoals?.length) {
                addWhereCondition(query, "metadata", createRawQuery(
                    alias => `${alias}->>'fitnessGoals' ?| ARRAY[:...goals]`,
                    { goals: filters.fitnessGoals }
                ));
            }

            // Relationship filters
            if (filters.categoryIds && filters.categoryIds.length > 0) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT tp.id FROM training_programs tp
                        JOIN program_muscle_groups pmg ON tp.id = pmg.program_id
                        WHERE pmg.category_id IN (:...categoryIds)
                    )`,
                    { categoryIds: filters.categoryIds }
                ));
            }

            if (filters.equipmentIds && filters.equipmentIds.length > 0) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT tp.id FROM training_programs tp
                        JOIN program_equipment pe ON tp.id = pe.program_id
                        WHERE pe.equipment_id IN (:...equipmentIds)
                    )`,
                    { equipmentIds: filters.equipmentIds }
                ));
            }

            if (filters.tagIds && filters.tagIds.length > 0) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT tp.id FROM training_programs tp
                        JOIN program_tags pt ON tp.id = pt.program_id
                        WHERE pt.tag_id IN (:...tagIds)
                    )`,
                    { tagIds: filters.tagIds }
                ));
            }

            // Search term
            if (filters.searchTerm) {
                addWhereCondition(query, "name", createRawQuery(
                    alias => `LOWER(${alias}) LIKE LOWER(:term)`,
                    { term: `%${filters.searchTerm}%` }
                ));
            }

            // Apply sorting
            if (filters.sortBy) {
                addOrderBy(query, filters.sortBy, filters.sortDirection || 'ASC');
            } else {
                // Default sort by popularity
                addOrderBy(query, "enrollmentCount", "DESC");
                addOrderBy(query, "rating", "DESC");
            }

            // Execute query
            return await this.repository.findAndCount(query);
        } catch (error) {
            logger.error(`Error finding training programs with filters: ${error.message}`, { 
                error, 
                filters: JSON.stringify(filters) 
            });
            throw error;
        }
    }

    // Helper method to determine which relations to load based on filter needs
    private getRequiredRelations(filters: TrainingProgramFilters): string[] {
        const relations: string[] = [];
        
        if (filters.includeWorkouts) {
            relations.push('programWorkouts');
            relations.push('programWorkouts.workout');
        }
        
        if (filters.includeCreator) {
            relations.push('creator');
        }
        
        if (filters.includeTags) {
            relations.push('tags');
        }
        
        if (filters.includeMuscleGroups) {
            relations.push('targetMuscleGroups');
        }
        
        if (filters.includeEquipment) {
            relations.push('requiredEquipment');
        }
        
        return relations;
    }

    /**
     * Find popular training programs
     */
    async findPopular(limit: number = 10): Promise<TrainingProgram[]> {
        const query = createQueryOptions<TrainingProgram>({
            relations: ['targetMuscleGroups', 'tags'],
            take: limit
        });
        
        addWhereCondition(query, 'isPublished', true);
        addOrderBy(query, 'enrollmentCount', 'DESC');
        addOrderBy(query, 'rating', 'DESC');
        
        return this.repository.find(query);
    }

    /**
     * Find programs by muscle group category
     */
    async findByMuscleGroup(categoryId: number, limit: number = 20, offset: number = 0): Promise<[TrainingProgram[], number]> {
        return this.repository.findAndCount({
            where: {
                targetMuscleGroups: {
                    id: categoryId
                },
                isPublished: true
            },
            relations: ['programWorkouts', 'targetMuscleGroups', 'tags', 'requiredEquipment'],
            take: limit,
            skip: offset
        });
    }

    /**
     * Find programs that require specific equipment
     */
    async findByEquipment(equipmentId: number, limit: number = 20, offset: number = 0): Promise<[TrainingProgram[], number]> {
        const query = createQueryOptions<TrainingProgram>({
            relations: ['programWorkouts', 'targetMuscleGroups', 'tags', 'requiredEquipment'],
            take: limit,
            skip: offset
        });
        
        addWhereCondition(query, 'requiredEquipment', { id: equipmentId } as any);
        addWhereCondition(query, 'isPublished', true);
        
        return this.repository.findAndCount(query);
    }

    /**
     * Find programs by tag
     */
    async findByTag(tagId: number, limit: number = 20, offset: number = 0): Promise<[TrainingProgram[], number]> {
        return this.repository.findAndCount({
            where: {
                tags: {
                    id: tagId
                },
                isPublished: true
            },
            relations: ['programWorkouts', 'targetMuscleGroups', 'tags', 'requiredEquipment'],
            take: limit,
            skip: offset
        });
    }

    /**
     * Find programs created by a specific user
     */
    async findByCreator(userId: string, limit: number = 20, offset: number = 0): Promise<[TrainingProgram[], number]> {
        return this.repository.findAndCount({
            where: {
                creator: {
                    id: userId
                }
            },
            relations: ['programWorkouts', 'targetMuscleGroups', 'tags', 'requiredEquipment'],
            take: limit,
            skip: offset
        });
    }

    /**
     * Get a program with full details including workouts
     */
    async getWithFullDetails(id: number): Promise<TrainingProgram | null> {
        return this.repository.findOne({
            where: { id },
            relations: [
                'programWorkouts',
                'programWorkouts.workout',
                'programWorkouts.workout.exercises',
                'programWorkouts.workout.exercises.exercise',
                'creator',
                'tags',
                'targetMuscleGroups',
                'requiredEquipment'
            ]
        });
    }

    /**
     * Get program schedule for a specific week
     */
    async getProgramWeek(programId: number, weekNumber: number): Promise<TrainingProgram | null> {
        try {
            const query = createQueryOptions<TrainingProgram>({
                relations: [
                    'programWorkouts',
                    'programWorkouts.workout'
                ]
            });
            
            addWhereCondition(query, 'id', programId);
            
            const program = await this.repository.findOne(query);
    
            if (program && program.programWorkouts) {
                // Filter to include only workouts for the specified week
                program.programWorkouts = program.programWorkouts.filter(
                    workout => workout.week === weekNumber
                );
                
                if (program.programWorkouts.length > 0) {
                    return program;
                }
            }
            return null;
        } catch (error) {
            logger.error(`Error getting program week: ${error.message}`, { 
                programId, 
                weekNumber 
            });
            throw error;
        }
    }

    /**
     * Increment the enrollment count for a program
     */
    async incrementEnrollmentCount(programId: number): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update()
            .set({
                enrollmentCount: () => "enrollment_count + 1"
            })
            .where("id = :id", { id: programId })
            .execute();
    }

    /**
     * Increment the completion count for a program
     */
    async incrementCompletionCount(programId: number): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update()
            .set({
                completionCount: () => "completion_count + 1"
            })
            .where("id = :id", { id: programId })
            .execute();
    }

    /**
     * Update the success rate for a program
     */
    async updateSuccessRate(programId: number): Promise<void> {
        const program = await this.findById(programId);
        if (program && program.enrollmentCount > 0) {
            const successRate = (program.completionCount / program.enrollmentCount) * 100;
            await this.repository.update(programId, { successRate });
        }
    }
} 