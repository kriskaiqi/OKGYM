import { FindManyOptions, In, Like } from 'typeorm';
import { WorkoutTag } from '../models/WorkoutTag';
import { TagCategory, TagScope } from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import { 
    createQueryOptions, 
    addWhereCondition, 
    addOrderBy,
    createRawQuery
} from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying workout tags
 */
export interface WorkoutTagFilters {
    category?: TagCategory;
    scope?: TagScope;
    isActive?: boolean;
    createdBy?: string;
    searchTerm?: string;
    workoutPlanId?: number;
    programId?: number;
    equipmentId?: string;
    includeWorkoutPlans?: boolean;
    includePrograms?: boolean;
    includeEquipment?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for WorkoutTag entity
 */
export class WorkoutTagRepository extends GenericRepository<WorkoutTag> {
    constructor() {
        super(WorkoutTag);
    }

    /**
     * Find tags with detailed filtering options
     */
    async findWithFilters(filters: WorkoutTagFilters): Promise<[WorkoutTag[], number]> {
        try {
            // Create base query with helper function
            const query = createQueryOptions<WorkoutTag>({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });

            // Apply basic filters
            if (filters.category) {
                addWhereCondition(query, "category", filters.category);
            }
            
            if (filters.scope) {
                addWhereCondition(query, "scope", filters.scope);
            }
            
            if (filters.isActive !== undefined) {
                addWhereCondition(query, "isActive", filters.isActive);
            }
            
            if (filters.createdBy) {
                addWhereCondition(query, "createdBy", filters.createdBy);
            }
            
            // Apply search term
            if (filters.searchTerm) {
                addWhereCondition(query, "name", createRawQuery(
                    alias => `LOWER(${alias}) LIKE LOWER(:term)`,
                    { term: `%${filters.searchTerm}%` }
                ));
            }
            
            // Apply relationship filters
            if (filters.workoutPlanId) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT t.id FROM workout_tags t
                        JOIN workout_tags_mapping wtm ON t.id = wtm.tag_id
                        WHERE wtm.workout_id = :workoutId
                    )`,
                    { workoutId: filters.workoutPlanId }
                ));
            }
            
            if (filters.programId) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT t.id FROM workout_tags t
                        JOIN program_tags_mapping ptm ON t.id = ptm.tag_id
                        WHERE ptm.program_id = :programId
                    )`,
                    { programId: filters.programId }
                ));
            }
            
            if (filters.equipmentId) {
                addWhereCondition(query, "id", createRawQuery(
                    alias => `${alias} IN (
                        SELECT t.id FROM workout_tags t
                        JOIN equipment_tags_mapping etm ON t.id = etm.tag_id
                        WHERE etm.equipment_id = :equipmentId
                    )`,
                    { equipmentId: filters.equipmentId }
                ));
            }
            
            // Apply sorting
            if (filters.sortBy) {
                addOrderBy(query, filters.sortBy, filters.sortDirection || 'ASC');
            } else {
                // Default sort by displayOrder and name
                addOrderBy(query, "displayOrder", "ASC");
                addOrderBy(query, "name", "ASC");
            }
            
            // Execute query
            const [tags, total] = await this.repository.findAndCount(query);
            return [tags, total];
        } catch (error) {
            logger.error(`Error finding workout tags with filters: ${error.message}`, { 
                error, 
                filters: JSON.stringify(filters) 
            });
            throw error;
        }
    }

    /**
     * Find tags by category
     */
    async findByCategory(category: TagCategory): Promise<WorkoutTag[]> {
        try {
            const query = createQueryOptions<WorkoutTag>();
            addWhereCondition(query, "category", category);
            addWhereCondition(query, "isActive", true);
            addOrderBy(query, "displayOrder", "ASC");
            
            return await this.repository.find(query);
        } catch (error) {
            logger.error(`Error finding tags by category: ${error.message}`, { category });
            throw error;
        }
    }

    /**
     * Find tags by scope
     */
    async findByScope(scope: TagScope): Promise<WorkoutTag[]> {
        try {
            const query = createQueryOptions<WorkoutTag>();
            addWhereCondition(query, "scope", scope);
            addWhereCondition(query, "isActive", true);
            addOrderBy(query, "displayOrder", "ASC");
            
            return await this.repository.find(query);
        } catch (error) {
            logger.error(`Error finding tags by scope: ${error.message}`, { scope });
            throw error;
        }
    }

    /**
     * Helper method to determine which relations to load based on filter needs
     */
    private getRequiredRelations(filters: WorkoutTagFilters): string[] {
        const relations: string[] = [];
        
        if (filters.includeWorkoutPlans) {
            relations.push('workoutPlans');
        }
        
        if (filters.includePrograms) {
            relations.push('trainingPrograms');
        }
        
        if (filters.includeEquipment) {
            relations.push('equipment');
        }
        
        return relations;
    }

    /**
     * Find system tags (scope = SYSTEM)
     */
    async findSystemTags(): Promise<WorkoutTag[]> {
        return this.findByScope(TagScope.SYSTEM);
    }

    /**
     * Find user-created tags
     */
    async findUserDefinedTags(): Promise<WorkoutTag[]> {
        return this.findByScope(TagScope.USER);
    }

    /**
     * Find popular tags (based on usage count)
     */
    async findPopularTags(limit: number = 20): Promise<WorkoutTag[]> {
        return this.repository.find({
            where: { isActive: true },
            order: { usageCount: 'DESC' },
            take: limit
        });
    }

    /**
     * Find tags by IDs
     */
    async findByIds(ids: number[]): Promise<WorkoutTag[]> {
        if (!ids.length) return [];
        
        return this.repository.find({
            where: { 
                id: In(ids),
                isActive: true
            }
        });
    }

    /**
     * Find tags associated with a workout plan
     */
    async findByWorkoutPlan(workoutPlanId: number): Promise<WorkoutTag[]> {
        // Use query builder to properly handle the many-to-many relationship
        return this.repository
            .createQueryBuilder('tag')
            .innerJoin('tag.workouts', 'workoutPlan')
            .where('workoutPlan.id = :workoutPlanId', { workoutPlanId })
            .andWhere('tag.isActive = :isActive', { isActive: true })
            .orderBy('tag.displayOrder', 'ASC')
            .addOrderBy('tag.name', 'ASC')
            .getMany();
    }

    /**
     * Increment the usage count for a tag
     */
    async incrementUsageCount(tagId: number): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update()
            .set({
                usageCount: () => "usage_count + 1"
            })
            .where("id = :id", { id: tagId })
            .execute();
    }

    /**
     * Get tags for auto-completion
     */
    async getTagsForAutoComplete(term: string, limit: number = 10): Promise<WorkoutTag[]> {
        return this.repository.find({
            where: {
                name: Like(`%${term}%`),
                isActive: true
            },
            take: limit,
            order: { usageCount: 'DESC' }
        });
    }
} 