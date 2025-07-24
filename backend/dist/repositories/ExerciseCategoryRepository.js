"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseCategoryRepository = void 0;
const typeorm_1 = require("typeorm");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const GenericRepository_1 = require("./GenericRepository");
const logger_1 = __importDefault(require("../utils/logger"));
const CacheManager_1 = require("../services/CacheManager");
const config_1 = require("../config");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
class ExerciseCategoryCacheKeys {
    static forFilters(filters) {
        const keyParts = ['category:filters'];
        if (filters.type)
            keyParts.push(`type:${filters.type}`);
        if (filters.isActive !== undefined)
            keyParts.push(`active:${filters.isActive}`);
        if (filters.parentId === null)
            keyParts.push('parent:null');
        else if (filters.parentId !== undefined)
            keyParts.push(`parent:${filters.parentId}`);
        if (filters.searchTerm)
            keyParts.push(`search:${filters.searchTerm}`);
        if (filters.hasExercises !== undefined)
            keyParts.push(`hasExer:${filters.hasExercises}`);
        if (filters.limit)
            keyParts.push(`limit:${filters.limit}`);
        if (filters.offset)
            keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy)
            keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        if (filters.includeExercises)
            keyParts.push('incl:exercises');
        if (filters.includeChildCategories)
            keyParts.push('incl:children');
        if (filters.includeEquipment)
            keyParts.push('incl:equipment');
        if (filters.includeWorkouts)
            keyParts.push('incl:workouts');
        if (filters.includePrograms)
            keyParts.push('incl:programs');
        return keyParts.join(':');
    }
    static forCategory(id, relations = []) {
        if (relations.length === 0)
            return `category:${id}`;
        return `category:${id}:${relations.sort().join('-')}`;
    }
    static forTopLevel() {
        return 'category:top-level';
    }
    static forType(type) {
        return `category:type:${type}`;
    }
    static forChildren(parentId) {
        return `category:children:${parentId}`;
    }
    static forWithExercises(limit) {
        return `category:with-exercises:${limit}`;
    }
    static forHierarchy() {
        return 'category:hierarchy';
    }
}
class ExerciseCategoryRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        var _a, _b;
        super(ExerciseCategory_1.ExerciseCategory);
        this.cacheTTL = ((_b = (_a = config_1.config.cache) === null || _a === void 0 ? void 0 : _a.ttl) === null || _b === void 0 ? void 0 : _b.exercise) || 3600;
    }
    async findWithFilters(filters) {
        const cacheKey = ExerciseCategoryCacheKeys.forFilters(filters);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            logger_1.default.debug(`Returning cached categories for filters`, { filters });
            return cached;
        }
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });
            if (filters.type) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "type", filters.type);
            }
            if (filters.isActive !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "isActive", filters.isActive);
            }
            if (filters.parentId === null) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "parentId", (0, typeorm_1.IsNull)());
            }
            else if (filters.parentId !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "parentId", filters.parentId);
            }
            if (filters.searchTerm) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "name", (0, typeorm_1.Like)(`%${filters.searchTerm}%`));
            }
            if (filters.sortBy) {
                (0, typeorm_helpers_1.addOrderBy)(query, filters.sortBy, filters.sortDirection || 'ASC');
            }
            else {
                (0, typeorm_helpers_1.addOrderBy)(query, "displayOrder", "ASC");
                (0, typeorm_helpers_1.addOrderBy)(query, "name", "ASC");
            }
            const [categories, total] = await this.repository.findAndCount(query);
            if (filters.includeChildCategories && categories.length > 0) {
                const parentIds = categories.map(category => category.id);
                const childCategories = await this.findChildrenForParents(parentIds);
                categories.forEach(category => {
                    category.childCategories = childCategories.filter(child => child.parentId === category.id);
                });
            }
            await CacheManager_1.cacheManager.set(cacheKey, [categories, total], { ttl: this.cacheTTL });
            return [categories, total];
        }
        catch (error) {
            logger_1.default.error(`Error finding categories with filters: ${error.message}`, {
                error,
                filters: JSON.stringify(filters)
            });
            throw error;
        }
    }
    async findById(id, relations = []) {
        const cacheKey = ExerciseCategoryCacheKeys.forCategory(id, relations);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            logger_1.default.debug('Category detail served from cache', { id });
            return cached;
        }
        const start = Date.now();
        const category = await this.repository.findOne({
            where: { id },
            relations
        });
        const duration = Date.now() - start;
        if (duration > 100) {
            logger_1.default.warn(`Slow query detected in ExerciseCategoryRepository.findById: ${duration}ms`, { id, duration });
        }
        if (category) {
            await CacheManager_1.cacheManager.set(cacheKey, category, { ttl: this.cacheTTL });
        }
        return category;
    }
    async findTopLevelCategories() {
        const cacheKey = ExerciseCategoryCacheKeys.forTopLevel();
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const categories = await this.repository.find({
            where: {
                parentId: (0, typeorm_1.IsNull)(),
                isActive: true
            },
            order: {
                displayOrder: 'ASC',
                name: 'ASC'
            }
        });
        await CacheManager_1.cacheManager.set(cacheKey, categories, { ttl: this.cacheTTL });
        return categories;
    }
    async findByType(type) {
        const cacheKey = ExerciseCategoryCacheKeys.forType(type);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const categories = await this.repository.find({
            where: {
                type,
                isActive: true
            },
            order: {
                displayOrder: 'ASC',
                name: 'ASC'
            }
        });
        await CacheManager_1.cacheManager.set(cacheKey, categories, { ttl: this.cacheTTL });
        return categories;
    }
    async findChildCategories(parentId) {
        const cacheKey = ExerciseCategoryCacheKeys.forChildren(parentId);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const categories = await this.repository.find({
            where: {
                parentId,
                isActive: true
            },
            order: {
                displayOrder: 'ASC',
                name: 'ASC'
            }
        });
        await CacheManager_1.cacheManager.set(cacheKey, categories, { ttl: this.cacheTTL });
        return categories;
    }
    async findWithExercises(limit = 20) {
        const cacheKey = ExerciseCategoryCacheKeys.forWithExercises(limit);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const categories = await this.repository.find({
            relations: ['exercises'],
            where: { isActive: true },
            order: { displayOrder: 'ASC' },
            take: limit
        });
        const filteredCategories = categories.filter(category => category.exercises && category.exercises.length > 0);
        await CacheManager_1.cacheManager.set(cacheKey, filteredCategories, { ttl: this.cacheTTL });
        return filteredCategories;
    }
    async findByIds(ids) {
        if (!ids.length)
            return [];
        const cacheKey = `category:ids:${ids.sort().join(',')}`;
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const categories = await this.repository.find({
            where: {
                id: (0, typeorm_1.In)(ids),
                isActive: true
            }
        });
        await CacheManager_1.cacheManager.set(cacheKey, categories, { ttl: this.cacheTTL });
        return categories;
    }
    async getHierarchy() {
        const cacheKey = ExerciseCategoryCacheKeys.forHierarchy();
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const start = Date.now();
        const topLevel = await this.findTopLevelCategories();
        for (const category of topLevel) {
            category.childCategories = await this.findChildCategories(category.id);
        }
        const duration = Date.now() - start;
        if (duration > 200) {
            logger_1.default.warn(`Slow query detected in ExerciseCategoryRepository.getHierarchy: ${duration}ms`, {
                duration,
                topLevelCount: topLevel.length
            });
        }
        await CacheManager_1.cacheManager.set(cacheKey, topLevel, { ttl: this.cacheTTL });
        return topLevel;
    }
    async getCategoryWithExercises(categoryId) {
        const relations = ['exercises', 'exercises.equipmentOptions', 'childCategories'];
        const cacheKey = ExerciseCategoryCacheKeys.forCategory(categoryId, relations);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const category = await this.repository.findOne({
            where: { id: categoryId },
            relations
        });
        if (category) {
            await CacheManager_1.cacheManager.set(cacheKey, category, { ttl: this.cacheTTL });
        }
        return category;
    }
    async create(data) {
        const category = await super.create(data);
        await this.invalidateCategoryCaches();
        return category;
    }
    async update(id, data) {
        const category = await super.update(id, data);
        if (category) {
            await this.invalidateCategoryCache(id);
            await this.invalidateCategoryCaches();
        }
        return category;
    }
    async delete(id) {
        const result = await super.delete(id);
        await this.invalidateCategoryCache(id);
        await this.invalidateCategoryCaches();
        return result;
    }
    async invalidateCategoryCache(id) {
        await CacheManager_1.cacheManager.deleteByPattern(`category:${id}*`);
        logger_1.default.debug(`Invalidated cache for category: ${id}`);
    }
    async invalidateCategoryCaches() {
        await CacheManager_1.cacheManager.deleteByPattern('category:filters*');
        await CacheManager_1.cacheManager.deleteByPattern('category:top-level*');
        await CacheManager_1.cacheManager.deleteByPattern('category:type*');
        await CacheManager_1.cacheManager.deleteByPattern('category:children*');
        await CacheManager_1.cacheManager.deleteByPattern('category:with-exercises*');
        await CacheManager_1.cacheManager.deleteByPattern('category:hierarchy*');
        await CacheManager_1.cacheManager.deleteByPattern('category:ids*');
        logger_1.default.debug('Invalidated category list caches');
    }
    getRequiredRelations(filters) {
        const relations = [];
        if (filters.includeExercises || filters.hasExercises) {
            relations.push('exercises');
        }
        if (filters.includeChildCategories) {
            relations.push('childCategories');
        }
        if (filters.includeEquipment) {
            relations.push('equipment');
        }
        if (filters.includeWorkouts) {
            relations.push('workouts');
        }
        if (filters.includePrograms) {
            relations.push('programs');
        }
        return relations;
    }
    applySorting(query, filters) {
        if (filters.sortBy) {
            const validSortFields = ['name', 'displayOrder', 'type', 'createdAt'];
            const direction = filters.sortDirection || 'ASC';
            if (validSortFields.includes(filters.sortBy)) {
                query.order = { [filters.sortBy]: direction };
            }
        }
        else {
            query.order = {
                displayOrder: 'ASC',
                name: 'ASC'
            };
        }
    }
    async findChildrenForParents(parentIds) {
        if (!parentIds.length)
            return [];
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)();
            (0, typeorm_helpers_1.addWhereCondition)(query, "parentId", (0, typeorm_1.In)(parentIds));
            (0, typeorm_helpers_1.addWhereCondition)(query, "isActive", true);
            (0, typeorm_helpers_1.addOrderBy)(query, "displayOrder", "ASC");
            return await this.repository.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding children for parents: ${error.message}`, { parentIds });
            return [];
        }
    }
}
exports.ExerciseCategoryRepository = ExerciseCategoryRepository;
//# sourceMappingURL=ExerciseCategoryRepository.js.map