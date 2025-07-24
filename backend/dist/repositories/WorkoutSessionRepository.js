"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutSessionRepository = void 0;
const typeorm_1 = require("typeorm");
const WorkoutSession_1 = require("../models/WorkoutSession");
const Enums_1 = require("../models/shared/Enums");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class WorkoutSessionRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(WorkoutSession_1.WorkoutSession);
    }
    async findWithFilters(filters) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "userId", filters.userId);
            }
            if (filters.workoutPlanId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "workoutPlanId", filters.workoutPlanId);
            }
            if (filters.programId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "programId", filters.programId);
            }
            if (filters.status) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "status", filters.status);
            }
            if (filters.location) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "locationData", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias}->>'type' = :locationType`, { locationType: filters.location }));
            }
            if (filters.startDateMin && filters.startDateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "startTime", (0, typeorm_1.Between)(filters.startDateMin, filters.startDateMax));
            }
            else if (filters.startDateMin) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "startTime", (0, typeorm_1.MoreThanOrEqual)(filters.startDateMin));
            }
            else if (filters.startDateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "startTime", (0, typeorm_1.LessThanOrEqual)(filters.startDateMax));
            }
            if (filters.durationMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "totalDuration", (0, typeorm_1.MoreThanOrEqual)(filters.durationMin));
            }
            if (filters.durationMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "totalDuration", (0, typeorm_1.LessThanOrEqual)(filters.durationMax));
            }
            if (filters.caloriesBurnedMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "caloriesBurned", (0, typeorm_1.MoreThanOrEqual)(filters.caloriesBurnedMin));
            }
            if (filters.caloriesBurnedMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "caloriesBurned", (0, typeorm_1.LessThanOrEqual)(filters.caloriesBurnedMax));
            }
            if (filters.exerciseStatus) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT ws.id FROM workout_sessions ws
                        JOIN exercise_results er ON ws.id = er.session_id
                        WHERE er.status = :status
                    )`, { status: filters.exerciseStatus }));
            }
            if (filters.searchTerm) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "userFeedback", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} LIKE :term`, { term: `%${filters.searchTerm}%` }));
            }
            if (filters.sortBy) {
                (0, typeorm_helpers_1.addOrderBy)(query, filters.sortBy, filters.sortDirection || 'DESC');
            }
            else {
                (0, typeorm_helpers_1.addOrderBy)(query, "startTime", "DESC");
            }
            const [sessions, total] = await this.repository.findAndCount(query);
            return [sessions, total];
        }
        catch (error) {
            logger_1.default.error(`Error finding workout sessions with filters: ${error.message}`, {
                error,
                filters: JSON.stringify(filters)
            });
            throw error;
        }
    }
    getRequiredRelations(filters) {
        const relations = [];
        if (filters.includeExerciseResults) {
            relations.push('exerciseResults');
            relations.push('exerciseResults.exercise');
        }
        if (filters.includeWorkoutPlan) {
            relations.push('workoutPlan');
        }
        if (filters.includeUser) {
            relations.push('user');
        }
        if (filters.includeEnvironmentData) {
            relations.push('environmentData');
        }
        if (filters.includeHealthData) {
            relations.push('healthData');
        }
        return relations;
    }
    async findRecentByUser(userId, limit = 10) {
        const query = (0, typeorm_helpers_1.createQueryOptions)({
            relations: ['workoutPlan', 'exerciseLogs'],
            take: limit
        });
        (0, typeorm_helpers_1.addWhereCondition)(query, 'user', { id: userId });
        (0, typeorm_helpers_1.addOrderBy)(query, 'startTime', 'DESC');
        return this.repository.find(query);
    }
    async findByDateRange(userId, startDate, endDate) {
        const query = (0, typeorm_helpers_1.createQueryOptions)({
            relations: ['workoutPlan', 'exerciseLogs']
        });
        (0, typeorm_helpers_1.addWhereCondition)(query, 'user', { id: userId });
        (0, typeorm_helpers_1.addWhereCondition)(query, 'startTime', (0, typeorm_1.Between)(startDate, endDate));
        (0, typeorm_helpers_1.addOrderBy)(query, 'startTime', 'ASC');
        return this.repository.find(query);
    }
    async findByWorkoutPlan(workoutPlanId, limit = 20) {
        const query = (0, typeorm_helpers_1.createQueryOptions)({
            relations: ['user', 'exerciseLogs'],
            take: limit
        });
        (0, typeorm_helpers_1.addWhereCondition)(query, 'workoutPlan', { id: workoutPlanId });
        (0, typeorm_helpers_1.addOrderBy)(query, 'startTime', 'DESC');
        return this.repository.find(query);
    }
    async findByProgram(programId, limit = 20) {
        const query = (0, typeorm_helpers_1.createQueryOptions)({
            relations: ['user', 'workoutPlan', 'exerciseLogs'],
            take: limit
        });
        (0, typeorm_helpers_1.addWhereCondition)(query, 'trainingProgram', { id: programId });
        (0, typeorm_helpers_1.addOrderBy)(query, 'startTime', 'DESC');
        return this.repository.find(query);
    }
    async getWithFullDetails(sessionId) {
        const query = (0, typeorm_helpers_1.createQueryOptions)({
            relations: [
                'user',
                'workoutPlan',
                'workoutPlan.exercises',
                'workoutPlan.exercises.exercise'
            ]
        });
        (0, typeorm_helpers_1.addWhereCondition)(query, 'id', sessionId);
        return this.repository.findOne(query);
    }
    async getUserStats(userId) {
        const result = await this.repository
            .createQueryBuilder('session')
            .select('COUNT(*)', 'totalSessions')
            .addSelect('SUM(session.totalDuration)', 'totalDuration')
            .addSelect('SUM(session.caloriesBurned)', 'totalCaloriesBurned')
            .addSelect('AVG(session.difficultyRating)', 'avgIntensity')
            .addSelect('AVG(session.difficultyRating)', 'avgRating')
            .addSelect('SUM(CASE WHEN session.status = :completed THEN 1 ELSE 0 END)', 'completedWorkouts')
            .where('session.user.id = :userId', { userId, completed: Enums_1.SessionStatus.COMPLETED })
            .getRawOne();
        return {
            totalSessions: parseInt(result.totalSessions) || 0,
            totalDuration: parseInt(result.totalDuration) || 0,
            totalCaloriesBurned: parseInt(result.totalCaloriesBurned) || 0,
            avgIntensity: parseFloat(result.avgIntensity) || 0,
            avgRating: parseFloat(result.avgRating) || 0,
            completedWorkouts: parseInt(result.completedWorkouts) || 0,
        };
    }
    async getWeeklyCount(userId, weeks = 12) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (weeks * 7));
        const sessions = await this.repository.find({
            where: {
                user: { id: userId },
                startTime: (0, typeorm_1.MoreThan)(startDate)
            },
            select: ['startTime']
        });
        const weekMap = new Map();
        for (let i = 0; i < weeks; i++) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7));
            const weekKey = this.getWeekKey(weekStart);
            weekMap.set(weekKey, 0);
        }
        for (const session of sessions) {
            if (session.startTime) {
                const weekKey = this.getWeekKey(session.startTime);
                const count = weekMap.get(weekKey) || 0;
                weekMap.set(weekKey, count + 1);
            }
        }
        return Array.from(weekMap.entries())
            .map(([week, count]) => ({ week, count }))
            .sort((a, b) => a.week.localeCompare(b.week));
    }
    getWeekKey(date) {
        const year = date.getFullYear();
        const weekNumber = this.getWeekNumber(date);
        return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
    }
    getWeekNumber(date) {
        const target = new Date(date.valueOf());
        const dayNr = (date.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const firstThursday = target.valueOf();
        target.setMonth(0, 1);
        if (target.getDay() !== 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    }
}
exports.WorkoutSessionRepository = WorkoutSessionRepository;
//# sourceMappingURL=WorkoutSessionRepository.js.map