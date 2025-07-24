"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentRepository = void 0;
const typeorm_1 = require("typeorm");
const Equipment_1 = require("../models/Equipment");
const GenericRepository_1 = require("./GenericRepository");
const logger_1 = __importDefault(require("../utils/logger"));
const CacheManager_1 = require("../services/CacheManager");
const config_1 = require("../config");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
class EquipmentCacheKeys {
    static forFilters(filters) {
        var _a, _b, _c, _d, _e;
        const keyParts = ['equipment:filters'];
        if (filters.category)
            keyParts.push(`cat:${filters.category}`);
        if (filters.difficulty)
            keyParts.push(`diff:${filters.difficulty}`);
        if (filters.costTier)
            keyParts.push(`cost:${filters.costTier}`);
        if (filters.spaceRequired)
            keyParts.push(`space:${filters.spaceRequired}`);
        if (filters.searchTerm)
            keyParts.push(`search:${filters.searchTerm}`);
        if (filters.manufacturer)
            keyParts.push(`mfr:${filters.manufacturer}`);
        if (filters.limit)
            keyParts.push(`limit:${filters.limit}`);
        if (filters.offset)
            keyParts.push(`offset:${filters.offset}`);
        if (filters.sortBy)
            keyParts.push(`sort:${filters.sortBy}:${filters.sortDirection || 'ASC'}`);
        if (((_a = filters.priceRange) === null || _a === void 0 ? void 0 : _a.min) !== undefined)
            keyParts.push(`pmin:${filters.priceRange.min}`);
        if (((_b = filters.priceRange) === null || _b === void 0 ? void 0 : _b.max) !== undefined)
            keyParts.push(`pmax:${filters.priceRange.max}`);
        if ((_c = filters.muscleGroupIds) === null || _c === void 0 ? void 0 : _c.length)
            keyParts.push(`musc:${filters.muscleGroupIds.sort().join(',')}`);
        if ((_d = filters.trainingTypeIds) === null || _d === void 0 ? void 0 : _d.length)
            keyParts.push(`train:${filters.trainingTypeIds.sort().join(',')}`);
        if ((_e = filters.exerciseIds) === null || _e === void 0 ? void 0 : _e.length)
            keyParts.push(`exer:${filters.exerciseIds.sort().join(',')}`);
        if (filters.includeExercises)
            keyParts.push('incl:exercises');
        if (filters.includeMuscleGroups)
            keyParts.push('incl:muscleGroups');
        if (filters.includeTrainingTypes)
            keyParts.push('incl:trainingTypes');
        if (filters.includeWorkouts)
            keyParts.push('incl:workouts');
        if (filters.includePrograms)
            keyParts.push('incl:programs');
        if (filters.includeMedia)
            keyParts.push('incl:media');
        return keyParts.join(':');
    }
    static forEquipment(id, relations = []) {
        if (relations.length === 0)
            return `equipment:${id}`;
        return `equipment:${id}:${relations.sort().join('-')}`;
    }
    static forPopular(limit) {
        return `equipment:popular:${limit}`;
    }
    static forCategory(category) {
        return `equipment:category:${category}`;
    }
}
class EquipmentRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        var _a, _b;
        super(Equipment_1.Equipment);
        this.cacheTTL = ((_b = (_a = config_1.config.cache) === null || _a === void 0 ? void 0 : _a.ttl) === null || _b === void 0 ? void 0 : _b.exercise) || 3600;
    }
    async findWithFilters(filters) {
        var _a, _b, _c, _d, _e;
        const cacheKey = EquipmentCacheKeys.forFilters(filters);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            logger_1.default.debug(`Returning cached equipment for filters`, { filters });
            return cached;
        }
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: this.getRequiredRelations(filters),
                take: filters.limit,
                skip: filters.offset
            });
            if (filters.category) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "category", filters.category);
            }
            if (filters.difficulty) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "difficulty", filters.difficulty);
            }
            if (filters.costTier) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "costTier", filters.costTier);
            }
            if (filters.spaceRequired) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "spaceRequired", filters.spaceRequired);
            }
            if (filters.manufacturer) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "manufacturer", (0, typeorm_1.Like)(`%${filters.manufacturer}%`));
            }
            if (filters.searchTerm) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "name", (0, typeorm_helpers_1.createRawQuery)(alias => `LOWER(${alias}) LIKE LOWER(:term)`, { term: `%${filters.searchTerm}%` }));
            }
            if (((_a = filters.priceRange) === null || _a === void 0 ? void 0 : _a.min) !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "averagePrice", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} >= :minPrice`, { minPrice: filters.priceRange.min }));
            }
            if (((_b = filters.priceRange) === null || _b === void 0 ? void 0 : _b.max) !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "averagePrice", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} <= :maxPrice`, { maxPrice: filters.priceRange.max }));
            }
            if ((_c = filters.muscleGroupIds) === null || _c === void 0 ? void 0 : _c.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT e.id FROM equipment e
                        JOIN equipment_muscle_groups emg ON e.id = emg.equipment_id
                        WHERE emg.category_id IN (:...muscleGroupIds)
                    )`, { muscleGroupIds: filters.muscleGroupIds }));
            }
            if ((_d = filters.trainingTypeIds) === null || _d === void 0 ? void 0 : _d.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT e.id FROM equipment e
                        JOIN equipment_training_types ett ON e.id = ett.equipment_id
                        WHERE ett.tag_id IN (:...trainingTypeIds)
                    )`, { trainingTypeIds: filters.trainingTypeIds }));
            }
            if ((_e = filters.exerciseIds) === null || _e === void 0 ? void 0 : _e.length) {
                (0, typeorm_helpers_1.addWhereCondition)(query, "id", (0, typeorm_helpers_1.createRawQuery)(alias => `${alias} IN (
                        SELECT e.id FROM equipment e
                        JOIN exercise_equipment ee ON e.id = ee.equipment_id
                        WHERE ee.exercise_id IN (:...exerciseIds)
                    )`, { exerciseIds: filters.exerciseIds }));
            }
            if (filters.sortBy) {
                (0, typeorm_helpers_1.addOrderBy)(query, filters.sortBy, filters.sortDirection || 'ASC');
            }
            else {
                (0, typeorm_helpers_1.addOrderBy)(query, "name", "ASC");
            }
            const [equipment, total] = await this.repository.findAndCount(query);
            await CacheManager_1.cacheManager.set(cacheKey, [equipment, total], { ttl: this.cacheTTL });
            return [equipment, total];
        }
        catch (error) {
            logger_1.default.error(`Error finding equipment with filters: ${error.message}`, {
                error,
                filters: JSON.stringify(filters)
            });
            throw error;
        }
    }
    async findById(id, relations = []) {
        const cacheKey = EquipmentCacheKeys.forEquipment(id, relations);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            logger_1.default.debug('Equipment detail served from cache', { id });
            return cached;
        }
        const start = Date.now();
        const equipment = await this.repository.findOne({
            where: { id },
            relations
        });
        const duration = Date.now() - start;
        if (duration > 100) {
            logger_1.default.warn(`Slow query detected in EquipmentRepository.findById: ${duration}ms`, { id, duration });
        }
        if (equipment) {
            await CacheManager_1.cacheManager.set(cacheKey, equipment, { ttl: this.cacheTTL });
        }
        return equipment;
    }
    async findPopular(limit = 10) {
        const cacheKey = EquipmentCacheKeys.forPopular(limit);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const equipment = await this.repository
            .createQueryBuilder('equipment')
            .leftJoin('equipment.exercises', 'exercises')
            .select('equipment')
            .addSelect('COUNT(exercises.id)', 'exerciseCount')
            .groupBy('equipment.id')
            .orderBy('exerciseCount', 'DESC')
            .take(limit)
            .getMany();
        await CacheManager_1.cacheManager.set(cacheKey, equipment, { ttl: this.cacheTTL });
        return equipment;
    }
    async findByCategory(category, limit = 20) {
        const cacheKey = EquipmentCacheKeys.forCategory(category);
        const cached = await CacheManager_1.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        const equipment = await this.repository.find({
            where: { category },
            take: limit,
            relations: ['image']
        });
        await CacheManager_1.cacheManager.set(cacheKey, equipment, { ttl: this.cacheTTL });
        return equipment;
    }
    async create(data) {
        const equipment = await super.create(data);
        await this.invalidateEquipmentCaches();
        return equipment;
    }
    async update(id, data) {
        const equipment = await super.update(id, data);
        if (equipment) {
            await this.invalidateEquipmentCache(id);
            await this.invalidateEquipmentCaches();
        }
        return equipment;
    }
    async delete(id) {
        const result = await super.delete(id);
        await this.invalidateEquipmentCache(id);
        await this.invalidateEquipmentCaches();
        return result;
    }
    async invalidateEquipmentCache(id) {
        await CacheManager_1.cacheManager.deleteByPattern(`equipment:${id}*`);
        logger_1.default.debug(`Invalidated cache for equipment: ${id}`);
    }
    async invalidateEquipmentCaches() {
        await CacheManager_1.cacheManager.deleteByPattern('equipment:filters*');
        await CacheManager_1.cacheManager.deleteByPattern('equipment:popular*');
        await CacheManager_1.cacheManager.deleteByPattern('equipment:category*');
        logger_1.default.debug('Invalidated equipment list caches');
    }
    getRequiredRelations(filters) {
        const relations = [];
        if (filters.includeExercises) {
            relations.push('exercises');
        }
        if (filters.includeMuscleGroups) {
            relations.push('muscleGroupsTargeted');
        }
        if (filters.includeTrainingTypes) {
            relations.push('trainingTypes');
        }
        if (filters.includeWorkouts) {
            relations.push('workouts');
        }
        if (filters.includePrograms) {
            relations.push('programs');
        }
        if (filters.includeMedia) {
            relations.push('image', 'video');
        }
        return relations;
    }
}
exports.EquipmentRepository = EquipmentRepository;
//# sourceMappingURL=EquipmentRepository.js.map