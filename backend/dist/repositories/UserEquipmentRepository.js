"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEquipmentRepository = void 0;
const typeorm_1 = require("typeorm");
const UserEquipment_1 = require("../models/UserEquipment");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class UserEquipmentRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(UserEquipment_1.UserEquipment);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { updatedAt: 'DESC' };
            if (filters.includeUser) {
                queryOptions.relations = ['user'];
            }
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', filters.userId);
            }
            if (filters.equipmentName) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'equipmentName', filters.equipmentName);
            }
            if (filters.equipmentNames && filters.equipmentNames.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'equipmentName', (0, typeorm_1.In)(filters.equipmentNames));
            }
            if (filters.category) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', filters.category);
            }
            if (filters.categories && filters.categories.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', (0, typeorm_1.In)(filters.categories));
            }
            if (filters.location) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'location', filters.location);
            }
            if (filters.locations && filters.locations.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'location', (0, typeorm_1.In)(filters.locations));
            }
            if (filters.isAvailable !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isAvailable', filters.isAvailable);
            }
            if (filters.brand) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'brand', filters.brand);
            }
            if (filters.brands && filters.brands.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'brand', (0, typeorm_1.In)(filters.brands));
            }
            if (filters.model) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'model', filters.model);
            }
            if (filters.minCondition !== undefined && filters.maxCondition !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'condition', (0, typeorm_1.Between)(filters.minCondition, filters.maxCondition));
            }
            else if (filters.minCondition !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'condition', (0, typeorm_1.MoreThan)(filters.minCondition));
            }
            else if (filters.maxCondition !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'condition', (0, typeorm_1.LessThan)(filters.maxCondition));
            }
            if (filters.purchaseMinDate && filters.purchaseMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'purchaseDate', (0, typeorm_1.Between)(filters.purchaseMinDate, filters.purchaseMaxDate));
            }
            else if (filters.purchaseMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'purchaseDate', (0, typeorm_1.MoreThan)(filters.purchaseMinDate));
            }
            else if (filters.purchaseMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'purchaseDate', (0, typeorm_1.LessThan)(filters.purchaseMaxDate));
            }
            if (filters.createdMinDate && filters.createdMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.Between)(filters.createdMinDate, filters.createdMaxDate));
            }
            else if (filters.createdMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.MoreThan)(filters.createdMinDate));
            }
            else if (filters.createdMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'createdAt', (0, typeorm_1.LessThan)(filters.createdMaxDate));
            }
            if (filters.updatedMinDate && filters.updatedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'updatedAt', (0, typeorm_1.Between)(filters.updatedMinDate, filters.updatedMaxDate));
            }
            else if (filters.updatedMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'updatedAt', (0, typeorm_1.MoreThan)(filters.updatedMinDate));
            }
            else if (filters.updatedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'updatedAt', (0, typeorm_1.LessThan)(filters.updatedMaxDate));
            }
            if (filters.hasImage !== undefined) {
                if (filters.hasImage) {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'imageUrl', (0, typeorm_1.Not)((0, typeorm_1.IsNull)()));
                }
                else {
                    (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'imageUrl', (0, typeorm_1.IsNull)());
                }
            }
            const equipment = await this.repository.findAndCount(queryOptions);
            if (filters.hasWeightRange !== undefined ||
                filters.minWeight !== undefined ||
                filters.maxWeight !== undefined ||
                filters.isAdjustable !== undefined ||
                filters.hasDimensions !== undefined ||
                filters.hasResistance !== undefined ||
                filters.minResistanceLevels !== undefined) {
                const [items, count] = equipment;
                const filteredItems = items.filter(item => {
                    if (!item.specifications) {
                        return false;
                    }
                    if (filters.hasWeightRange !== undefined) {
                        if (filters.hasWeightRange && !item.specifications.weightRange) {
                            return false;
                        }
                        else if (!filters.hasWeightRange && item.specifications.weightRange) {
                            return false;
                        }
                    }
                    if (filters.minWeight !== undefined &&
                        (!item.specifications.weightRange ||
                            item.specifications.weightRange.min < filters.minWeight)) {
                        return false;
                    }
                    if (filters.maxWeight !== undefined &&
                        (!item.specifications.weightRange ||
                            item.specifications.weightRange.max > filters.maxWeight)) {
                        return false;
                    }
                    if (filters.isAdjustable !== undefined &&
                        item.specifications.adjustable !== filters.isAdjustable) {
                        return false;
                    }
                    if (filters.hasDimensions !== undefined) {
                        if (filters.hasDimensions && !item.specifications.dimensions) {
                            return false;
                        }
                        else if (!filters.hasDimensions && item.specifications.dimensions) {
                            return false;
                        }
                    }
                    if (filters.hasResistance !== undefined) {
                        if (filters.hasResistance && !item.specifications.resistance) {
                            return false;
                        }
                        else if (!filters.hasResistance && item.specifications.resistance) {
                            return false;
                        }
                    }
                    if (filters.minResistanceLevels !== undefined &&
                        (!item.specifications.resistance ||
                            item.specifications.resistance.levels < filters.minResistanceLevels)) {
                        return false;
                    }
                    return true;
                });
                return [filteredItems, filteredItems.length];
            }
            if (filters.lastUsedMinDate !== undefined || filters.lastUsedMaxDate !== undefined) {
                const [items, count] = equipment;
                const filteredItems = items.filter(item => {
                    if (!item.usageStats || !item.usageStats.lastUsed) {
                        return false;
                    }
                    const lastUsed = new Date(item.usageStats.lastUsed);
                    if (filters.lastUsedMinDate && lastUsed < filters.lastUsedMinDate) {
                        return false;
                    }
                    if (filters.lastUsedMaxDate && lastUsed > filters.lastUsedMaxDate) {
                        return false;
                    }
                    return true;
                });
                return [filteredItems, filteredItems.length];
            }
            if (filters.searchTerm) {
                const searchPattern = (0, typeorm_1.ILike)(`%${filters.searchTerm}%`);
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push({ equipmentName: searchPattern }, { notes: searchPattern }, { brand: searchPattern }, { model: searchPattern });
                queryOptions.where = whereArray;
            }
            return equipment;
        }
        catch (error) {
            logger_1.default.error('Error in UserEquipmentRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findByCategory(userId, category) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { equipmentName: 'ASC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', category);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isAvailable', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserEquipmentRepository.findByCategory', { error, userId, category });
            throw error;
        }
    }
    async findByLocation(userId, location) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { category: 'ASC', equipmentName: 'ASC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'location', location);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isAvailable', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in UserEquipmentRepository.findByLocation', { error, userId, location });
            throw error;
        }
    }
    async hasEquipment(userId, equipmentName) {
        try {
            const count = await this.repository.count({
                where: {
                    user: { id: userId },
                    equipmentName,
                    isAvailable: true
                }
            });
            return count > 0;
        }
        catch (error) {
            logger_1.default.error('Error in UserEquipmentRepository.hasEquipment', { error, userId, equipmentName });
            throw error;
        }
    }
    async getUserEquipmentSummary(userId) {
        try {
            const totalCount = await this.repository.count({
                where: { user: { id: userId } }
            });
            const categoryDistribution = await this.repository
                .createQueryBuilder('equipment')
                .select('equipment.category', 'category')
                .addSelect('COUNT(*)', 'count')
                .where('equipment.user_id = :userId', { userId })
                .groupBy('equipment.category')
                .getRawMany();
            const locationDistribution = await this.repository
                .createQueryBuilder('equipment')
                .select('equipment.location', 'location')
                .addSelect('COUNT(*)', 'count')
                .where('equipment.user_id = :userId', { userId })
                .groupBy('equipment.location')
                .getRawMany();
            const availableCount = await this.repository.count({
                where: {
                    user: { id: userId },
                    isAvailable: true
                }
            });
            return {
                totalCount,
                availableCount,
                unavailableCount: totalCount - availableCount,
                categoryDistribution,
                locationDistribution
            };
        }
        catch (error) {
            logger_1.default.error('Error in UserEquipmentRepository.getUserEquipmentSummary', { error, userId });
            throw error;
        }
    }
    async updateUsageStats(equipmentId, exerciseId) {
        try {
            const equipment = await this.repository.findOne({
                where: { id: equipmentId }
            });
            if (!equipment) {
                throw new Error(`Equipment with ID ${equipmentId} not found`);
            }
            if (!equipment.usageStats) {
                equipment.usageStats = {
                    lastUsed: new Date(),
                    usageFrequency: 1,
                    favoriteExercises: exerciseId ? [exerciseId] : [],
                    totalUses: 1
                };
            }
            else {
                equipment.usageStats.lastUsed = new Date();
                equipment.usageStats.totalUses = (equipment.usageStats.totalUses || 0) + 1;
                if (exerciseId && equipment.usageStats.favoriteExercises) {
                    if (!equipment.usageStats.favoriteExercises.includes(exerciseId)) {
                        equipment.usageStats.favoriteExercises.push(exerciseId);
                    }
                }
                else if (exerciseId) {
                    equipment.usageStats.favoriteExercises = [exerciseId];
                }
            }
            await this.repository.save(equipment);
        }
        catch (error) {
            logger_1.default.error('Error in UserEquipmentRepository.updateUsageStats', { error, equipmentId, exerciseId });
            throw error;
        }
    }
    async getAvailableFilters(userId) {
        try {
            const categories = await this.repository
                .createQueryBuilder('equipment')
                .select('DISTINCT equipment.category', 'category')
                .where('equipment.user_id = :userId', { userId })
                .getRawMany();
            const locations = await this.repository
                .createQueryBuilder('equipment')
                .select('DISTINCT equipment.location', 'location')
                .where('equipment.user_id = :userId', { userId })
                .getRawMany();
            const brands = await this.repository
                .createQueryBuilder('equipment')
                .select('DISTINCT equipment.brand', 'brand')
                .where('equipment.user_id = :userId', { userId })
                .andWhere('equipment.brand IS NOT NULL')
                .getRawMany();
            return {
                categories: categories.map(c => c.category),
                locations: locations.map(l => l.location),
                brands: brands.map(b => b.brand)
            };
        }
        catch (error) {
            logger_1.default.error('Error in UserEquipmentRepository.getAvailableFilters', { error, userId });
            throw error;
        }
    }
}
exports.UserEquipmentRepository = UserEquipmentRepository;
//# sourceMappingURL=UserEquipmentRepository.js.map