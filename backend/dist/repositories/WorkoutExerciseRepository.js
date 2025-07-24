"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutExerciseRepository = void 0;
const typeorm_1 = require("typeorm");
const WorkoutExercise_1 = require("../models/WorkoutExercise");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
function idToString(id) {
    return (id === null || id === void 0 ? void 0 : id.toString()) || '';
}
function idsAreEqual(id1, id2) {
    return idToString(id1) === idToString(id2);
}
class WorkoutExerciseRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(WorkoutExercise_1.WorkoutExercise);
    }
    async findWithFilters(filters) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });
            if (filters.workoutPlanId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "workoutPlanId", filters.workoutPlanId);
            }
            if (filters.exerciseId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "exerciseId", filters.exerciseId);
            }
            if (filters.setType) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "setType", filters.setType);
            }
            if (filters.setStructure) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "setStructure", filters.setStructure);
            }
            if (filters.exerciseRole) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "role", filters.exerciseRole);
            }
            if (filters.minReps !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "repetitions", (0, typeorm_1.MoreThanOrEqual)(filters.minReps));
            }
            if (filters.maxReps !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "repetitions", (0, typeorm_1.LessThanOrEqual)(filters.maxReps));
            }
            if (filters.minDuration !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "duration", (0, typeorm_1.MoreThanOrEqual)(filters.minDuration));
            }
            if (filters.maxDuration !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "duration", (0, typeorm_1.LessThanOrEqual)(filters.maxDuration));
            }
            if (filters.minSets !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "sets", (0, typeorm_1.MoreThanOrEqual)(filters.minSets));
            }
            if (filters.maxSets !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "sets", (0, typeorm_1.LessThanOrEqual)(filters.maxSets));
            }
            if (filters.hasSuperset !== undefined) {
                if (filters.hasSuperset) {
                    (0, typeorm_helpers_1.addWhereCondition)(query, "supersetWithId", (0, typeorm_1.Not)((0, typeorm_1.IsNull)()));
                }
                else {
                    (0, typeorm_helpers_1.addWhereCondition)(query, "supersetWithId", (0, typeorm_1.IsNull)());
                }
            }
            if (filters.sortBy) {
                (0, typeorm_helpers_1.addOrderBy)(query, filters.sortBy, filters.sortDirection || 'ASC');
            }
            else {
                (0, typeorm_helpers_1.addOrderBy)(query, "order", "ASC");
            }
            const [exercises, total] = await this.repository.findAndCount(query);
            return [exercises, total];
        }
        catch (error) {
            logger_1.default.error(`Error finding workout exercises with filters: ${error.message}`, {
                error,
                filters: JSON.stringify(filters)
            });
            throw error;
        }
    }
    getRequiredRelations(filters) {
        const relations = [];
        if (filters.includeExercise) {
            relations.push('exercise');
        }
        if (filters.includeWorkoutPlan) {
            relations.push('workoutPlan');
        }
        if (filters.hasSuperset) {
            relations.push('supersetWith');
        }
        return relations;
    }
    async findByWorkoutPlan(workoutPlanId) {
        return this.repository.find({
            where: { workoutPlan: { id: workoutPlanId } },
            relations: ['exercise', 'exercise.categories', 'exercise.equipmentOptions'],
            order: { order: 'ASC' }
        });
    }
    async findSupersets(workoutPlanId) {
        const query = (0, typeorm_helpers_1.createQueryOptions)({
            relations: ['exercise']
        });
        (0, typeorm_helpers_1.addWhereCondition)(query, 'workoutPlan', { id: workoutPlanId });
        (0, typeorm_helpers_1.addWhereCondition)(query, 'supersetWithExerciseId', (0, typeorm_1.Not)((0, typeorm_1.IsNull)()));
        return this.repository.find(query);
    }
    async findWorkoutsByExercise(exerciseId) {
        const query = (0, typeorm_helpers_1.createQueryOptions)({
            relations: ['workoutPlan']
        });
        (0, typeorm_helpers_1.addWhereCondition)(query, 'exercise', { id: exerciseId });
        (0, typeorm_helpers_1.addOrderBy)(query, 'createdAt', 'DESC');
        return this.repository.find(query);
    }
    async updateExerciseOrder(workoutExerciseId, newOrder) {
        await this.repository.update(workoutExerciseId, { order: newOrder });
    }
    async createMany(workoutExercises) {
        const entities = this.repository.create(workoutExercises);
        return this.repository.save(entities);
    }
    async getWithFullDetails(workoutExerciseId) {
        return this.repository.findOne({
            where: { id: workoutExerciseId },
            relations: [
                'exercise',
                'exercise.categories',
                'exercise.equipmentOptions',
                'workoutPlan'
            ]
        });
    }
}
exports.WorkoutExerciseRepository = WorkoutExerciseRepository;
//# sourceMappingURL=WorkoutExerciseRepository.js.map