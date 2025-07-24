"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanRepository = void 0;
const typeorm_1 = require("typeorm");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const GenericRepository_1 = require("./GenericRepository");
const logger_1 = __importDefault(require("../utils/logger"));
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const idCompatibility_1 = require("../utils/idCompatibility");
class WorkoutPlanRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(WorkoutPlan_1.WorkoutPlan);
    }
    async findWithFilters(filters) {
        var _a, _b, _c, _d;
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });
            if (filters.difficulty) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "difficulty", filters.difficulty);
            }
            if (filters.workoutCategory) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "workoutCategory", filters.workoutCategory);
            }
            if (filters.isCustom !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "isCustom", filters.isCustom);
            }
            if (filters.creatorId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "creatorId", filters.creatorId);
            }
            if (filters.minDuration !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "estimatedDuration", (0, typeorm_1.MoreThanOrEqual)(filters.minDuration));
            }
            if (filters.maxDuration !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "estimatedDuration", (0, typeorm_1.LessThanOrEqual)(filters.maxDuration));
            }
            if (filters.searchTerm) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "name", (0, typeorm_helpers_1.createRawQuery)(alias => `LOWER(${alias}) LIKE LOWER(:term)`, { term: `%${filters.searchTerm}%` }));
            }
            if ((_a = filters.fitnessGoals) === null || _a === void 0 ? void 0 : _a.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "fitnessGoals", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} ?| ARRAY[:...goals]`, { goals: filters.fitnessGoals }));
            }
            if (filters.progressionType) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "progressionModel", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias}->>'type' = :progType`, { progType: filters.progressionType }));
            }
            if (filters.splitType) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "workoutStructure", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias}->>'splitType' = :splitType`, { splitType: filters.splitType }));
            }
            if ((_b = filters.categoryIds) === null || _b === void 0 ? void 0 : _b.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT wp.id FROM workout_plans wp
                        JOIN workout_muscle_group wcm ON wp.id = wcm.workout_id
                        WHERE wcm.category_id IN (:...categoryIds)
                    )`, { categoryIds: filters.categoryIds }));
            }
            if ((_c = filters.equipmentIds) === null || _c === void 0 ? void 0 : _c.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT wp.id FROM workout_plans wp
                        JOIN workout_equipment we ON wp.id = we.workout_id
                        WHERE we.equipment_id IN (:...equipmentIds)
                    )`, { equipmentIds: filters.equipmentIds }));
            }
            if ((_d = filters.tagIds) === null || _d === void 0 ? void 0 : _d.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT wp.id FROM workout_plans wp
                        JOIN workout_tag_map wtm ON wp.id = wtm.workout_id
                        WHERE wtm.tag_id IN (:...tagIds)
                    )`, { tagIds: filters.tagIds }));
            }
            if (filters.sortBy) {
                (0, typeorm_helpers_1.addOrderBy)(query, filters.sortBy, filters.sortDirection || 'ASC');
            }
            else {
                (0, typeorm_helpers_1.addOrderBy)(query, "createdAt", "DESC");
            }
            const [workouts, total] = await this.repository.findAndCount(query);
            return [workouts, total];
        }
        catch (error) {
            logger_1.default.error(`Error finding workout plans with filters: ${error.message}`, {
                error,
                filters: JSON.stringify(filters)
            });
            throw error;
        }
    }
    async findPopular(limit = 10) {
        return this.repository.find({
            where: { isCustom: false },
            order: { popularity: 'DESC', rating: 'DESC' },
            take: limit,
            relations: ['targetMuscleGroups', 'tags']
        });
    }
    async findByMuscleGroup(categoryId, limit = 20, offset = 0) {
        return this.repository
            .createQueryBuilder('workout')
            .innerJoin('workout.targetMuscleGroups', 'category')
            .leftJoinAndSelect('workout.exercises', 'exercise')
            .leftJoinAndSelect('exercise.exercise', 'exerciseDetails')
            .leftJoinAndSelect('workout.targetMuscleGroups', 'muscleGroups')
            .leftJoinAndSelect('workout.tags', 'tags')
            .leftJoinAndSelect('workout.equipmentNeeded', 'equipment')
            .where('category.id = :categoryId', { categoryId })
            .take(limit)
            .skip(offset)
            .getManyAndCount();
    }
    async findByEquipment(equipmentId, limit = 20, offset = 0) {
        return this.repository
            .createQueryBuilder('workout')
            .innerJoin('workout.equipmentNeeded', 'equipment')
            .leftJoinAndSelect('workout.exercises', 'exercise')
            .leftJoinAndSelect('exercise.exercise', 'exerciseDetails')
            .leftJoinAndSelect('workout.targetMuscleGroups', 'muscleGroups')
            .leftJoinAndSelect('workout.tags', 'tags')
            .leftJoinAndSelect('workout.equipmentNeeded', 'equipmentFull')
            .where('equipment.id = :equipmentId', { equipmentId })
            .take(limit)
            .skip(offset)
            .getManyAndCount();
    }
    async findByTag(tagId, limit = 20, offset = 0) {
        return this.repository
            .createQueryBuilder('workout')
            .innerJoin('workout.tags', 'tag')
            .leftJoinAndSelect('workout.exercises', 'exercise')
            .leftJoinAndSelect('exercise.exercise', 'exerciseDetails')
            .leftJoinAndSelect('workout.targetMuscleGroups', 'muscleGroups')
            .leftJoinAndSelect('workout.tags', 'tags')
            .leftJoinAndSelect('workout.equipmentNeeded', 'equipment')
            .where('tag.id = :tagId', { tagId })
            .take(limit)
            .skip(offset)
            .getManyAndCount();
    }
    async findByCreator(userId, limit = 20, offset = 0) {
        return this.repository.findAndCount({
            where: { creator_id: userId },
            relations: [
                'exercises',
                'exercises.exercise',
                'targetMuscleGroups',
                'tags',
                'equipmentNeeded'
            ],
            take: limit,
            skip: offset
        });
    }
    async getWithFullDetails(id) {
        const start = Date.now();
        const result = await this.repository.findOne({
            where: (0, idCompatibility_1.createIdWhereCondition)(id),
            relations: [
                'exercises',
                'exercises.exercise',
                'exercises.exercise.categories',
                'exercises.exercise.equipmentOptions',
                'targetMuscleGroups',
                'tags',
                'equipmentNeeded',
                'creator'
            ]
        });
        const duration = Date.now() - start;
        if (duration > 100) {
            logger_1.default.warn(`Slow query detected in WorkoutPlanRepository.getWithFullDetails: ${duration}ms`, {
                id,
                duration
            });
        }
        return result;
    }
    async countByCategory(category) {
        return this.repository.countBy({ workoutCategory: category });
    }
    getRequiredRelations(filters) {
        const relations = [];
        if (filters.includeExercises) {
            relations.push('exercises');
            relations.push('exercises.exercise');
        }
        if (filters.includePrograms) {
            relations.push('programs');
        }
        if (filters.includeCategories) {
            relations.push('categories');
        }
        if (filters.includeTags) {
            relations.push('tags');
        }
        if (filters.includeMedia) {
            relations.push('thumbnail');
            relations.push('video');
        }
        if (filters.includeMetrics) {
            relations.push('metrics');
        }
        return relations;
    }
}
exports.WorkoutPlanRepository = WorkoutPlanRepository;
//# sourceMappingURL=WorkoutPlanRepository.js.map