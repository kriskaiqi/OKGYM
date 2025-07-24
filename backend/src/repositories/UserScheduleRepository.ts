import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not } from 'typeorm';
import { UserSchedule, ScheduleItem } from '../models/UserSchedule';
import { RecurrencePattern, ScheduleItemType, ScheduleItemStatus } from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying user schedules
 */
export interface UserScheduleFilters {
    userId?: string;
    isActive?: boolean;
    recurrencePattern?: RecurrencePattern;
    startDateMin?: Date;
    startDateMax?: Date;
    endDateMin?: Date;
    endDateMax?: Date;
    includeItems?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Filter options for querying schedule items
 */
export interface ScheduleItemFilters {
    scheduleId?: string;
    userId?: string;
    type?: ScheduleItemType;
    status?: ScheduleItemStatus;
    dateMin?: Date;
    dateMax?: Date;
    workoutPlanId?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for UserSchedule entity
 */
export class UserScheduleRepository extends GenericRepository<UserSchedule> {
    constructor() {
        super(UserSchedule);
    }

    /**
     * Find user schedules with detailed filtering options
     */
    async findWithFilters(filters: UserScheduleFilters): Promise<[UserSchedule[], number]> {
        try {
            const queryOptions: FindManyOptions<UserSchedule> = createQueryOptions<UserSchedule>({});

            // Set pagination
            queryOptions.take = filters.limit || 100;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { createdAt: 'DESC' };

            // Add relations if needed
            if (filters.includeItems) {
                queryOptions.relations = ['items'];
            }

            // Apply filters
            if (filters.userId) {
                addWhereCondition(queryOptions, 'user_id', filters.userId);
            }

            if (filters.isActive !== undefined) {
                addWhereCondition(queryOptions, 'isActive', filters.isActive);
            }

            if (filters.recurrencePattern) {
                addWhereCondition(queryOptions, 'recurrencePattern', filters.recurrencePattern);
            }

            // Date range filters for startDate
            if (filters.startDateMin && filters.startDateMax) {
                addWhereCondition(queryOptions, 'startDate', Between(filters.startDateMin, filters.startDateMax));
            } else if (filters.startDateMin) {
                addWhereCondition(queryOptions, 'startDate', MoreThan(filters.startDateMin));
            } else if (filters.startDateMax) {
                addWhereCondition(queryOptions, 'startDate', LessThan(filters.startDateMax));
            }

            // Date range filters for endDate
            if (filters.endDateMin && filters.endDateMax) {
                addWhereCondition(queryOptions, 'endDate', Between(filters.endDateMin, filters.endDateMax));
            } else if (filters.endDateMin) {
                addWhereCondition(queryOptions, 'endDate', MoreThan(filters.endDateMin));
            } else if (filters.endDateMax) {
                addWhereCondition(queryOptions, 'endDate', LessThan(filters.endDateMax));
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in UserScheduleRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find active schedules for a specific user
     */
    async findActiveByUser(userId: string, includeItems: boolean = true): Promise<UserSchedule[]> {
        try {
            const queryOptions: FindManyOptions<UserSchedule> = createQueryOptions<UserSchedule>({});
            
            // Set sorting
            queryOptions.order = { createdAt: 'DESC' };

            addWhereCondition(queryOptions, 'user_id', userId);
            addWhereCondition(queryOptions, 'isActive', true);

            if (includeItems) {
                queryOptions.relations = ['items'];
            }

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in UserScheduleRepository.findActiveByUser', { error, userId });
            throw error;
        }
    }

    /**
     * Find schedule items with detailed filtering options
     */
    async findItemsWithFilters(filters: ScheduleItemFilters): Promise<[ScheduleItem[], number]> {
        try {
            const queryOptions: FindManyOptions<ScheduleItem> = createQueryOptions<ScheduleItem>({});

            // Set pagination
            queryOptions.take = filters.limit || 100;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'ASC' } 
                : { date: 'ASC' };

            // Apply filters
            if (filters.scheduleId) {
                addWhereCondition(queryOptions, 'schedule_id', filters.scheduleId);
            }

            if (filters.userId) {
                addWhereCondition(queryOptions, 'schedule.user_id', filters.userId);
                queryOptions.relations = ['schedule'];
            }

            if (filters.type) {
                addWhereCondition(queryOptions, 'type', filters.type);
            }

            if (filters.status) {
                addWhereCondition(queryOptions, 'status', filters.status);
            }

            if (filters.workoutPlanId) {
                addWhereCondition(queryOptions, 'workoutPlan.id', filters.workoutPlanId);
                
                // Ensure relations array exists
                if (!queryOptions.relations) {
                    queryOptions.relations = ['workoutPlan'];
                } else if (typeof queryOptions.relations === 'string') {
                    // If relations is a string, convert to array with both relations
                    queryOptions.relations = [queryOptions.relations, 'workoutPlan'];
                } else if (Array.isArray(queryOptions.relations) && !queryOptions.relations.includes('workoutPlan')) {
                    // Add workoutPlan to existing array
                    queryOptions.relations = [...queryOptions.relations, 'workoutPlan'];
                }
            }

            // Date range filters
            if (filters.dateMin && filters.dateMax) {
                addWhereCondition(queryOptions, 'date', Between(filters.dateMin, filters.dateMax));
            } else if (filters.dateMin) {
                addWhereCondition(queryOptions, 'date', MoreThan(filters.dateMin));
            } else if (filters.dateMax) {
                addWhereCondition(queryOptions, 'date', LessThan(filters.dateMax));
            }

            return await this.repository.manager.findAndCount(ScheduleItem, queryOptions);
        } catch (error) {
            logger.error('Error in UserScheduleRepository.findItemsWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find upcoming schedule items for a user
     */
    async findUpcomingItems(userId: string, days: number = 7): Promise<ScheduleItem[]> {
        try {
            const today = new Date();
            const endDate = new Date();
            endDate.setDate(today.getDate() + days);

            const queryOptions: FindManyOptions<ScheduleItem> = createQueryOptions<ScheduleItem>({});
            
            // Set sorting for multiple fields
            queryOptions.order = {
                date: 'ASC',
                startTime: 'ASC'
            };

            addWhereCondition(queryOptions, 'schedule.user_id', userId);
            addWhereCondition(queryOptions, 'date', Between(today, endDate));
            addWhereCondition(queryOptions, 'status', ScheduleItemStatus.UPCOMING);

            queryOptions.relations = ['schedule', 'workoutPlan'];

            return await this.repository.manager.find(ScheduleItem, queryOptions);
        } catch (error) {
            logger.error('Error in UserScheduleRepository.findUpcomingItems', { error, userId, days });
            throw error;
        }
    }

    /**
     * Update the status of a schedule item
     */
    async updateItemStatus(itemId: string, status: ScheduleItemStatus): Promise<void> {
        try {
            await this.repository.manager.update(ScheduleItem, itemId, { status });
        } catch (error) {
            logger.error('Error in UserScheduleRepository.updateItemStatus', { error, itemId, status });
            throw error;
        }
    }

    /**
     * Add a new item to a schedule
     */
    async addScheduleItem(scheduleId: string, item: Partial<ScheduleItem>): Promise<ScheduleItem> {
        try {
            const schedule = await this.repository.findOne({ where: { id: scheduleId } });
            if (!schedule) {
                throw new Error(`Schedule with ID ${scheduleId} not found`);
            }

            const newItem = this.repository.manager.create(ScheduleItem, {
                ...item,
                schedule,
                status: item.status || ScheduleItemStatus.UPCOMING
            });

            return await this.repository.manager.save(ScheduleItem, newItem);
        } catch (error) {
            logger.error('Error in UserScheduleRepository.addScheduleItem', { error, scheduleId, item });
            throw error;
        }
    }
}

/**
 * Specialized repository for ScheduleItem entity
 */
export class ScheduleItemRepository extends GenericRepository<ScheduleItem> {
    constructor() {
        super(ScheduleItem);
    }

    /**
     * Find items by date range
     */
    async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ScheduleItem[]> {
        try {
            const queryOptions: FindManyOptions<ScheduleItem> = createQueryOptions<ScheduleItem>({});
            
            // Set sorting for multiple fields
            queryOptions.order = {
                date: 'ASC',
                startTime: 'ASC'
            };

            addWhereCondition(queryOptions, 'schedule.user_id', userId);
            addWhereCondition(queryOptions, 'date', Between(startDate, endDate));

            queryOptions.relations = ['schedule', 'workoutPlan'];

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in ScheduleItemRepository.findByDateRange', { error, userId, startDate, endDate });
            throw error;
        }
    }

    /**
     * Find items by type
     */
    async findByType(userId: string, type: ScheduleItemType): Promise<ScheduleItem[]> {
        try {
            const queryOptions: FindManyOptions<ScheduleItem> = createQueryOptions<ScheduleItem>({});
            
            // Set sorting
            queryOptions.order = { date: 'ASC' };

            addWhereCondition(queryOptions, 'schedule.user_id', userId);
            addWhereCondition(queryOptions, 'type', type);

            queryOptions.relations = ['schedule'];

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in ScheduleItemRepository.findByType', { error, userId, type });
            throw error;
        }
    }

    /**
     * Find items by status
     */
    async findByStatus(userId: string, status: ScheduleItemStatus): Promise<ScheduleItem[]> {
        try {
            const queryOptions: FindManyOptions<ScheduleItem> = createQueryOptions<ScheduleItem>({});
            
            // Set sorting
            queryOptions.order = { date: 'ASC' };

            addWhereCondition(queryOptions, 'schedule.user_id', userId);
            addWhereCondition(queryOptions, 'status', status);

            queryOptions.relations = ['schedule'];

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in ScheduleItemRepository.findByStatus', { error, userId, status });
            throw error;
        }
    }
} 