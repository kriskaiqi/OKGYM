"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingProgramRepository = void 0;
const typeorm_1 = require("typeorm");
const TrainingProgram_1 = require("../models/TrainingProgram");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class TrainingProgramRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(TrainingProgram_1.TrainingProgram);
    }
    async findWithFilters(filters) {
        var _a;
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: this.getRequiredRelations(filters),
                take: filters.limit || 20,
                skip: filters.offset || 0
            });
            if (filters.difficulty) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "difficulty", filters.difficulty);
            }
            if (filters.category) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "category", filters.category);
            }
            if (filters.programStructure) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "programStructure", filters.programStructure);
            }
            if (filters.splitType) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "splitType", filters.splitType);
            }
            if (filters.isPublished !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "isPublished", filters.isPublished);
            }
            if (filters.creatorId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "creator_id", filters.creatorId);
            }
            if (filters.minDurationWeeks !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "durationWeeks", (0, typeorm_1.MoreThanOrEqual)(filters.minDurationWeeks));
            }
            if (filters.maxDurationWeeks !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "durationWeeks", (0, typeorm_1.LessThanOrEqual)(filters.maxDurationWeeks));
            }
            if (filters.minWorkoutsPerWeek !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "workoutsPerWeek", (0, typeorm_1.MoreThanOrEqual)(filters.minWorkoutsPerWeek));
            }
            if (filters.maxWorkoutsPerWeek !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "workoutsPerWeek", (0, typeorm_1.LessThanOrEqual)(filters.maxWorkoutsPerWeek));
            }
            if ((_a = filters.fitnessGoals) === null || _a === void 0 ? void 0 : _a.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "metadata", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias}->>'fitnessGoals' ?| ARRAY[:...goals]`, { goals: filters.fitnessGoals }));
            }
            if (filters.categoryIds && filters.categoryIds.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT tp.id FROM training_programs tp
                        JOIN program_muscle_groups pmg ON tp.id = pmg.program_id
                        WHERE pmg.category_id IN (:...categoryIds)
                    )`, { categoryIds: filters.categoryIds }));
            }
            if (filters.equipmentIds && filters.equipmentIds.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT tp.id FROM training_programs tp
                        JOIN program_equipment pe ON tp.id = pe.program_id
                        WHERE pe.equipment_id IN (:...equipmentIds)
                    )`, { equipmentIds: filters.equipmentIds }));
            }
            if (filters.tagIds && filters.tagIds.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT tp.id FROM training_programs tp
                        JOIN program_tags pt ON tp.id = pt.program_id
                        WHERE pt.tag_id IN (:...tagIds)
                    )`, { tagIds: filters.tagIds }));
            }
            if (filters.searchTerm) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "name", (0, typeorm_helpers_1.createRawQuery)(alias => `LOWER(${alias}) LIKE LOWER(:term)`, { term: `%${filters.searchTerm}%` }));
            }
            if (filters.sortBy) {
                (0, typeorm_helpers_1.addOrderBy)(query, filters.sortBy, filters.sortDirection || 'ASC');
            }
            else {
                (0, typeorm_helpers_1.addOrderBy)(query, "enrollmentCount", "DESC");
                (0, typeorm_helpers_1.addOrderBy)(query, "rating", "DESC");
            }
            return await this.repository.findAndCount(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding training programs with filters: ${error.message}`, {
                error,
                filters: JSON.stringify(filters)
            });
            throw error;
        }
    }
    getRequiredRelations(filters) {
        const relations = [];
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
    async findPopular(limit = 10) {
        const query = (0, typeorm_helpers_1.createQueryOptions)({
            relations: ['targetMuscleGroups', 'tags'],
            take: limit
        });
        (0, typeorm_helpers_1.addWhereCondition)(query, 'isPublished', true);
        (0, typeorm_helpers_1.addOrderBy)(query, 'enrollmentCount', 'DESC');
        (0, typeorm_helpers_1.addOrderBy)(query, 'rating', 'DESC');
        return this.repository.find(query);
    }
    async findByMuscleGroup(categoryId, limit = 20, offset = 0) {
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
    async findByEquipment(equipmentId, limit = 20, offset = 0) {
        const query = (0, typeorm_helpers_1.createQueryOptions)({
            relations: ['programWorkouts', 'targetMuscleGroups', 'tags', 'requiredEquipment'],
            take: limit,
            skip: offset
        });
        (0, typeorm_helpers_1.addWhereCondition)(query, 'requiredEquipment', { id: equipmentId });
        (0, typeorm_helpers_1.addWhereCondition)(query, 'isPublished', true);
        return this.repository.findAndCount(query);
    }
    async findByTag(tagId, limit = 20, offset = 0) {
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
    async findByCreator(userId, limit = 20, offset = 0) {
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
    async getWithFullDetails(id) {
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
    async getProgramWeek(programId, weekNumber) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: [
                    'programWorkouts',
                    'programWorkouts.workout'
                ]
            });
            (0, typeorm_helpers_1.addWhereCondition)(query, 'id', programId);
            const program = await this.repository.findOne(query);
            if (program && program.programWorkouts) {
                program.programWorkouts = program.programWorkouts.filter(workout => workout.week === weekNumber);
                if (program.programWorkouts.length > 0) {
                    return program;
                }
            }
            return null;
        }
        catch (error) {
            logger_1.default.error(`Error getting program week: ${error.message}`, {
                programId,
                weekNumber
            });
            throw error;
        }
    }
    async incrementEnrollmentCount(programId) {
        await this.repository
            .createQueryBuilder()
            .update()
            .set({
            enrollmentCount: () => "enrollment_count + 1"
        })
            .where("id = :id", { id: programId })
            .execute();
    }
    async incrementCompletionCount(programId) {
        await this.repository
            .createQueryBuilder()
            .update()
            .set({
            completionCount: () => "completion_count + 1"
        })
            .where("id = :id", { id: programId })
            .execute();
    }
    async updateSuccessRate(programId) {
        const program = await this.findById(programId);
        if (program && program.enrollmentCount > 0) {
            const successRate = (program.completionCount / program.enrollmentCount) * 100;
            await this.repository.update(programId, { successRate });
        }
    }
}
exports.TrainingProgramRepository = TrainingProgramRepository;
//# sourceMappingURL=TrainingProgramRepository.js.map