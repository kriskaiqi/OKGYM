"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FitnessGoalRepository = void 0;
const typeorm_1 = require("typeorm");
const FitnessGoal_1 = require("../models/FitnessGoal");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class FitnessGoalRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(FitnessGoal_1.FitnessGoal);
    }
    async findWithFilters(filters) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: this.getRequiredRelations(filters),
                take: filters.limit || 20,
                skip: filters.offset || 0
            });
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'user_id', filters.userId);
            }
            if (filters.status) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'status', filters.status);
            }
            if (filters.type) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'type', filters.type);
            }
            if (filters.unit) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'unit', filters.unit);
            }
            if (filters.startDateMin && filters.startDateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'startDate', (0, typeorm_1.Between)(filters.startDateMin, filters.startDateMax));
            }
            else if (filters.startDateMin) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'startDate', (0, typeorm_1.MoreThan)(filters.startDateMin));
            }
            else if (filters.startDateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'startDate', (0, typeorm_1.LessThan)(filters.startDateMax));
            }
            if (filters.deadlineMin && filters.deadlineMax) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'deadline', (0, typeorm_1.Between)(filters.deadlineMin, filters.deadlineMax));
            }
            else if (filters.deadlineMin) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'deadline', (0, typeorm_1.MoreThan)(filters.deadlineMin));
            }
            else if (filters.deadlineMax) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'deadline', (0, typeorm_1.LessThan)(filters.deadlineMax));
            }
            if (filters.progressMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'progress', (0, typeorm_1.MoreThan)(filters.progressMin));
            }
            if (filters.progressMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'progress', (0, typeorm_1.LessThan)(filters.progressMax));
            }
            if (filters.targetMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'target', (0, typeorm_1.MoreThan)(filters.targetMin));
            }
            if (filters.targetMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'target', (0, typeorm_1.LessThan)(filters.targetMax));
            }
            if (filters.isActive !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'status', filters.isActive ? FitnessGoal_1.GoalStatus.ACTIVE : FitnessGoal_1.GoalStatus.COMPLETED);
            }
            if (filters.hasCheckpoints !== undefined) {
                if (filters.hasCheckpoints) {
                    (0, typeorm_helpers_1.addWhereCondition)(query, 'checkpoints', (0, typeorm_helpers_1.createRawQuery)(alias => `jsonb_array_length(${alias}) > 0`, {}));
                }
                else {
                    (0, typeorm_helpers_1.addWhereCondition)(query, 'checkpoints', (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IS NULL OR jsonb_array_length(${alias}) = 0`, {}));
                }
            }
            if (filters.searchTerm) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'title', (0, typeorm_helpers_1.createRawQuery)(alias => `LOWER(${alias}) LIKE LOWER(:term)`, { term: `%${filters.searchTerm}%` }));
            }
            if (filters.sortBy) {
                const direction = filters.sortDirection || 'ASC';
                const validSortFields = ['title', 'startDate', 'deadline', 'progress', 'type', 'status', 'target', 'current'];
                if (validSortFields.includes(filters.sortBy)) {
                    (0, typeorm_helpers_1.addOrderBy)(query, filters.sortBy, direction);
                }
            }
            else {
                (0, typeorm_helpers_1.addOrderBy)(query, 'deadline', 'ASC');
            }
            return await this.repository.findAndCount(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding fitness goals with filters: ${error.message}`, {
                error,
                filters: JSON.stringify(filters)
            });
            throw error;
        }
    }
    getRequiredRelations(filters) {
        const relations = [];
        if (filters.includeUser) {
            relations.push('user');
        }
        return relations;
    }
    async findActiveByUser(userId) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)();
            (0, typeorm_helpers_1.addWhereCondition)(query, 'user_id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(query, 'status', FitnessGoal_1.GoalStatus.ACTIVE);
            (0, typeorm_helpers_1.addOrderBy)(query, 'deadline', 'ASC');
            return await this.repository.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding active goals for user: ${error.message}`, { userId });
            throw error;
        }
    }
    async findByType(userId, type) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)();
            (0, typeorm_helpers_1.addWhereCondition)(query, 'user_id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(query, 'type', type);
            (0, typeorm_helpers_1.addOrderBy)(query, 'status', 'ASC');
            (0, typeorm_helpers_1.addOrderBy)(query, 'deadline', 'ASC');
            return await this.repository.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding goals by type: ${error.message}`, { userId, type });
            throw error;
        }
    }
    async findUpcomingDeadlines(userId, daysThreshold = 7) {
        try {
            const today = new Date();
            const threshold = new Date();
            threshold.setDate(today.getDate() + daysThreshold);
            const query = (0, typeorm_helpers_1.createQueryOptions)();
            (0, typeorm_helpers_1.addWhereCondition)(query, 'user_id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(query, 'status', FitnessGoal_1.GoalStatus.ACTIVE);
            (0, typeorm_helpers_1.addWhereCondition)(query, 'deadline', (0, typeorm_1.Between)(today, threshold));
            (0, typeorm_helpers_1.addOrderBy)(query, 'deadline', 'ASC');
            return await this.repository.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding goals with upcoming deadlines: ${error.message}`, {
                userId,
                daysThreshold
            });
            throw error;
        }
    }
    async updateProgress(goalId, newValue) {
        try {
            const goal = await this.repository.findOne({ where: { id: goalId } });
            if (!goal)
                return null;
            goal.current = newValue;
            goal.calculateProgress();
            goal.isCompleted();
            return await this.repository.save(goal);
        }
        catch (error) {
            logger_1.default.error(`Error updating goal progress: ${error.message}`, { goalId, newValue });
            throw error;
        }
    }
}
exports.FitnessGoalRepository = FitnessGoalRepository;
//# sourceMappingURL=FitnessGoalRepository.js.map