"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramWorkoutRepository = void 0;
const typeorm_1 = require("typeorm");
const ProgramWorkout_1 = require("../models/ProgramWorkout");
const Enums_1 = require("../models/shared/Enums");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class ProgramWorkoutRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(ProgramWorkout_1.ProgramWorkout);
    }
    async findWithFilters(filters) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: this.getRequiredRelations(filters),
                take: filters.limit || 20,
                skip: filters.offset || 0
            });
            if (filters.programId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'program', { id: filters.programId });
            }
            if (filters.workoutId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'workout', { id: filters.workoutId });
            }
            if (filters.minWeek !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'week', (0, typeorm_1.MoreThanOrEqual)(filters.minWeek));
            }
            if (filters.maxWeek !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'week', (0, typeorm_1.LessThanOrEqual)(filters.maxWeek));
            }
            if (filters.dayOfWeek) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'day', filters.dayOfWeek);
            }
            if (filters.isOptional !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'isOptional', filters.isOptional);
            }
            if (filters.isDeload !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'isDeload', filters.isDeload);
            }
            if (filters.sortBy) {
                const direction = filters.sortDirection || 'ASC';
                const validSortFields = ['week', 'day', 'order'];
                if (validSortFields.includes(filters.sortBy)) {
                    (0, typeorm_helpers_1.addOrderBy)(query, filters.sortBy, direction);
                }
            }
            else {
                (0, typeorm_helpers_1.addOrderBy)(query, 'week', 'ASC');
                (0, typeorm_helpers_1.addOrderBy)(query, 'day', 'ASC');
                (0, typeorm_helpers_1.addOrderBy)(query, 'order', 'ASC');
            }
            return await this.repository.findAndCount(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding program workouts with filters: ${error.message}`, {
                error,
                filters: JSON.stringify(filters)
            });
            throw error;
        }
    }
    getRequiredRelations(filters) {
        const relations = [];
        if (filters.includeProgram) {
            relations.push('program');
        }
        if (filters.includeWorkout) {
            relations.push('workout');
        }
        if (filters.includeWorkoutDetails) {
            relations.push('workout.exercises');
            relations.push('workout.exercises.exercise');
        }
        return relations;
    }
    async findByWeek(programId, weekNumber) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: ['workout', 'workout.exercises', 'workout.exercises.exercise']
            });
            (0, typeorm_helpers_1.addWhereCondition)(query, 'program', { id: programId });
            (0, typeorm_helpers_1.addWhereCondition)(query, 'week', weekNumber);
            (0, typeorm_helpers_1.addOrderBy)(query, 'day', 'ASC');
            (0, typeorm_helpers_1.addOrderBy)(query, 'order', 'ASC');
            return await this.repository.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding program workouts by week: ${error.message}`, {
                programId,
                weekNumber
            });
            throw error;
        }
    }
    async findByDay(programId, weekNumber, dayOfWeek) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: ['workout', 'workout.exercises', 'workout.exercises.exercise']
            });
            (0, typeorm_helpers_1.addWhereCondition)(query, 'program', { id: programId });
            (0, typeorm_helpers_1.addWhereCondition)(query, 'week', weekNumber);
            (0, typeorm_helpers_1.addWhereCondition)(query, 'day', dayOfWeek);
            (0, typeorm_helpers_1.addOrderBy)(query, 'order', 'ASC');
            return await this.repository.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding program workouts by day: ${error.message}`, {
                programId,
                weekNumber,
                dayOfWeek
            });
            throw error;
        }
    }
    async findByWorkoutPlan(workoutPlanId) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: ['program']
            });
            (0, typeorm_helpers_1.addWhereCondition)(query, 'workout', { id: workoutPlanId });
            (0, typeorm_helpers_1.addOrderBy)(query, 'program.name', 'ASC');
            return await this.repository.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding program workouts by workout plan: ${error.message}`, {
                workoutPlanId
            });
            throw error;
        }
    }
    async createMany(programWorkouts) {
        try {
            const entities = this.repository.create(programWorkouts);
            return await this.repository.save(entities);
        }
        catch (error) {
            logger_1.default.error(`Error creating multiple program workouts: ${error.message}`);
            throw error;
        }
    }
    async getProgramSchedule(programId) {
        try {
            const workouts = await this.findWithFilters({
                programId,
                includeWorkout: true,
                includeWorkoutDetails: true,
                limit: 1000
            });
            const schedule = {};
            workouts[0].forEach(workout => {
                const weekKey = `Week ${workout.week}`;
                const dayKey = Enums_1.DayOfWeek[workout.day];
                if (!schedule[weekKey]) {
                    schedule[weekKey] = {};
                }
                if (!schedule[weekKey][dayKey]) {
                    schedule[weekKey][dayKey] = [];
                }
                schedule[weekKey][dayKey].push(workout);
            });
            Object.keys(schedule).forEach(week => {
                Object.keys(schedule[week]).forEach(day => {
                    schedule[week][day].sort((a, b) => a.order - b.order);
                });
            });
            return schedule;
        }
        catch (error) {
            logger_1.default.error(`Error getting program schedule: ${error.message}`, { programId });
            throw error;
        }
    }
    async getWithFullDetails(programWorkoutId) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: [
                    'program',
                    'workout',
                    'workout.exercises',
                    'workout.exercises.exercise',
                    'workout.targetMuscleGroups'
                ]
            });
            (0, typeorm_helpers_1.addWhereCondition)(query, 'id', programWorkoutId);
            return await this.repository.findOne(query);
        }
        catch (error) {
            logger_1.default.error(`Error getting program workout details: ${error.message}`, {
                programWorkoutId
            });
            throw error;
        }
    }
}
exports.ProgramWorkoutRepository = ProgramWorkoutRepository;
//# sourceMappingURL=ProgramWorkoutRepository.js.map