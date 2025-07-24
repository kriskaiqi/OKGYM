"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutTagRepository = void 0;
const typeorm_1 = require("typeorm");
const WorkoutTag_1 = require("../models/WorkoutTag");
const Enums_1 = require("../models/shared/Enums");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class WorkoutTagRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(WorkoutTag_1.WorkoutTag);
    }
    async findWithFilters(filters) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });
            if (filters.category) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "category", filters.category);
            }
            if (filters.scope) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "scope", filters.scope);
            }
            if (filters.isActive !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "isActive", filters.isActive);
            }
            if (filters.createdBy) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "createdBy", filters.createdBy);
            }
            if (filters.searchTerm) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "name", (0, typeorm_helpers_1.createRawQuery)(alias => `LOWER(${alias}) LIKE LOWER(:term)`, { term: `%${filters.searchTerm}%` }));
            }
            if (filters.workoutPlanId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT t.id FROM workout_tags t
                        JOIN workout_tags_mapping wtm ON t.id = wtm.tag_id
                        WHERE wtm.workout_id = :workoutId
                    )`, { workoutId: filters.workoutPlanId }));
            }
            if (filters.programId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT t.id FROM workout_tags t
                        JOIN program_tags_mapping ptm ON t.id = ptm.tag_id
                        WHERE ptm.program_id = :programId
                    )`, { programId: filters.programId }));
            }
            if (filters.equipmentId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT t.id FROM workout_tags t
                        JOIN equipment_tags_mapping etm ON t.id = etm.tag_id
                        WHERE etm.equipment_id = :equipmentId
                    )`, { equipmentId: filters.equipmentId }));
            }
            if (filters.sortBy) {
                (0, typeorm_helpers_1.addOrderBy)(query, filters.sortBy, filters.sortDirection || 'ASC');
            }
            else {
                (0, typeorm_helpers_1.addOrderBy)(query, "displayOrder", "ASC");
                (0, typeorm_helpers_1.addOrderBy)(query, "name", "ASC");
            }
            const [tags, total] = await this.repository.findAndCount(query);
            return [tags, total];
        }
        catch (error) {
            logger_1.default.error(`Error finding workout tags with filters: ${error.message}`, {
                error,
                filters: JSON.stringify(filters)
            });
            throw error;
        }
    }
    async findByCategory(category) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)();
            (0, typeorm_helpers_1.addWhereCondition)(query, "category", category);
            (0, typeorm_helpers_1.addWhereCondition)(query, "isActive", true);
            (0, typeorm_helpers_1.addOrderBy)(query, "displayOrder", "ASC");
            return await this.repository.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding tags by category: ${error.message}`, { category });
            throw error;
        }
    }
    async findByScope(scope) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)();
            (0, typeorm_helpers_1.addWhereCondition)(query, "scope", scope);
            (0, typeorm_helpers_1.addWhereCondition)(query, "isActive", true);
            (0, typeorm_helpers_1.addOrderBy)(query, "displayOrder", "ASC");
            return await this.repository.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding tags by scope: ${error.message}`, { scope });
            throw error;
        }
    }
    getRequiredRelations(filters) {
        const relations = [];
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
    async findSystemTags() {
        return this.findByScope(Enums_1.TagScope.SYSTEM);
    }
    async findUserDefinedTags() {
        return this.findByScope(Enums_1.TagScope.USER);
    }
    async findPopularTags(limit = 20) {
        return this.repository.find({
            where: { isActive: true },
            order: { usageCount: 'DESC' },
            take: limit
        });
    }
    async findByIds(ids) {
        if (!ids.length)
            return [];
        return this.repository.find({
            where: {
                id: (0, typeorm_1.In)(ids),
                isActive: true
            }
        });
    }
    async findByWorkoutPlan(workoutPlanId) {
        return this.repository
            .createQueryBuilder('tag')
            .innerJoin('tag.workouts', 'workoutPlan')
            .where('workoutPlan.id = :workoutPlanId', { workoutPlanId })
            .andWhere('tag.isActive = :isActive', { isActive: true })
            .orderBy('tag.displayOrder', 'ASC')
            .addOrderBy('tag.name', 'ASC')
            .getMany();
    }
    async incrementUsageCount(tagId) {
        await this.repository
            .createQueryBuilder()
            .update()
            .set({
            usageCount: () => "usage_count + 1"
        })
            .where("id = :id", { id: tagId })
            .execute();
    }
    async getTagsForAutoComplete(term, limit = 10) {
        return this.repository.find({
            where: {
                name: (0, typeorm_1.Like)(`%${term}%`),
                isActive: true
            },
            take: limit,
            order: { usageCount: 'DESC' }
        });
    }
}
exports.WorkoutTagRepository = WorkoutTagRepository;
//# sourceMappingURL=WorkoutTagRepository.js.map