"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleItemRepository = exports.UserScheduleRepository = void 0;
const typeorm_1 = require("typeorm");
const UserSchedule_1 = require("../models/UserSchedule");
const Enums_1 = require("../models/shared/Enums");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class UserScheduleRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(UserSchedule_1.UserSchedule);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 100;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { createdAt: 'DESC' };
            if (filters.includeItems) {
                queryOptions.relations = ['items'];
            }
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', filters.userId);
            }
            if (filters.isActive !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isActive', filters.isActive);
            }
            if (filters.recurrencePattern) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'recurrencePattern', filters.recurrencePattern);
            }
            if (filters.startDateMin && filters.startDateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'startDate', (0, typeorm_1.Between)(filters.startDateMin, filters.startDateMax));
            }
            else if (filters.startDateMin) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'startDate', (0, typeorm_1.MoreThan)(filters.startDateMin));
            }
            else if (filters.startDateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'startDate', (0, typeorm_1.LessThan)(filters.startDateMax));
            }
            if (filters.endDateMin && filters.endDateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'endDate', (0, typeorm_1.Between)(filters.endDateMin, filters.endDateMax));
            }
            else if (filters.endDateMin) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'endDate', (0, typeorm_1.MoreThan)(filters.endDateMin));
            }
            else if (filters.endDateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'endDate', (0, typeorm_1.LessThan)(filters.endDateMax));
            }
            return await this.repository.findAndCount(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserScheduleRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findActiveByUser(userId, includeItems = true) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { createdAt: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user_id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isActive', true);
            if (includeItems) {
                queryOptions.relations = ['items'];
            }
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserScheduleRepository.findActiveByUser', { error, userId });
            throw error;
        }
    }
    async findItemsWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 100;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'ASC' }
                : { date: 'ASC' };
            if (filters.scheduleId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'schedule_id', filters.scheduleId);
            }
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'schedule.user_id', filters.userId);
                queryOptions.relations = ['schedule'];
            }
            if (filters.type) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', filters.type);
            }
            if (filters.status) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'status', filters.status);
            }
            if (filters.workoutPlanId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workoutPlan.id', filters.workoutPlanId);
                if (!queryOptions.relations) {
                    queryOptions.relations = ['workoutPlan'];
                }
                else if (typeof queryOptions.relations === 'string') {
                    queryOptions.relations = [queryOptions.relations, 'workoutPlan'];
                }
                else if (Array.isArray(queryOptions.relations) && !queryOptions.relations.includes('workoutPlan')) {
                    queryOptions.relations = [...queryOptions.relations, 'workoutPlan'];
                }
            }
            if (filters.dateMin && filters.dateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'date', (0, typeorm_1.Between)(filters.dateMin, filters.dateMax));
            }
            else if (filters.dateMin) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'date', (0, typeorm_1.MoreThan)(filters.dateMin));
            }
            else if (filters.dateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'date', (0, typeorm_1.LessThan)(filters.dateMax));
            }
            return await this.repository.manager.findAndCount(UserSchedule_1.ScheduleItem, queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserScheduleRepository.findItemsWithFilters', { error, filters });
            throw error;
        }
    }
    async findUpcomingItems(userId, days = 7) {
        try {
            const today = new Date();
            const endDate = new Date();
            endDate.setDate(today.getDate() + days);
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = {
                date: 'ASC',
                startTime: 'ASC'
            };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'schedule.user_id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'date', (0, typeorm_1.Between)(today, endDate));
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'status', Enums_1.ScheduleItemStatus.UPCOMING);
            queryOptions.relations = ['schedule', 'workoutPlan'];
            return await this.repository.manager.find(UserSchedule_1.ScheduleItem, queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserScheduleRepository.findUpcomingItems', { error, userId, days });
            throw error;
        }
    }
    async updateItemStatus(itemId, status) {
        try {
            await this.repository.manager.update(UserSchedule_1.ScheduleItem, itemId, { status });
        }
        catch (error) {
            logger_1.default.error('Error in UserScheduleRepository.updateItemStatus', { error, itemId, status });
            throw error;
        }
    }
    async addScheduleItem(scheduleId, item) {
        try {
            const schedule = await this.repository.findOne({ where: { id: scheduleId } });
            if (!schedule) {
                throw new Error(`Schedule with ID ${scheduleId} not found`);
            }
            const newItem = this.repository.manager.create(UserSchedule_1.ScheduleItem, Object.assign(Object.assign({}, item), { schedule, status: item.status || Enums_1.ScheduleItemStatus.UPCOMING }));
            return await this.repository.manager.save(UserSchedule_1.ScheduleItem, newItem);
        }
        catch (error) {
            logger_1.default.error('Error in UserScheduleRepository.addScheduleItem', { error, scheduleId, item });
            throw error;
        }
    }
}
exports.UserScheduleRepository = UserScheduleRepository;
class ScheduleItemRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(UserSchedule_1.ScheduleItem);
    }
    async findByDateRange(userId, startDate, endDate) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = {
                date: 'ASC',
                startTime: 'ASC'
            };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'schedule.user_id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'date', (0, typeorm_1.Between)(startDate, endDate));
            queryOptions.relations = ['schedule', 'workoutPlan'];
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in ScheduleItemRepository.findByDateRange', { error, userId, startDate, endDate });
            throw error;
        }
    }
    async findByType(userId, type) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { date: 'ASC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'schedule.user_id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'type', type);
            queryOptions.relations = ['schedule'];
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in ScheduleItemRepository.findByType', { error, userId, type });
            throw error;
        }
    }
    async findByStatus(userId, status) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { date: 'ASC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'schedule.user_id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'status', status);
            queryOptions.relations = ['schedule'];
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in ScheduleItemRepository.findByStatus', { error, userId, status });
            throw error;
        }
    }
}
exports.ScheduleItemRepository = ScheduleItemRepository;
//# sourceMappingURL=UserScheduleRepository.js.map