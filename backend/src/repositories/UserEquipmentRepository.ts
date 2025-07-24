import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not, In, ILike } from 'typeorm';
import { UserEquipment } from '../models/UserEquipment';
import { EquipmentCategory } from '../models/shared/Enums';
import { EquipmentLocation } from '../models/UserEquipment';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying user equipment
 */
export interface UserEquipmentFilters {
    userId?: string;
    equipmentName?: string;
    equipmentNames?: string[];
    category?: EquipmentCategory;
    categories?: EquipmentCategory[];
    location?: EquipmentLocation;
    locations?: EquipmentLocation[];
    isAvailable?: boolean;
    brand?: string;
    brands?: string[];
    model?: string;
    hasWeightRange?: boolean;
    minWeight?: number;
    maxWeight?: number;
    isAdjustable?: boolean;
    hasDimensions?: boolean;
    hasResistance?: boolean;
    minResistanceLevels?: number;
    minCondition?: number;
    maxCondition?: number;
    lastUsedMinDate?: Date;
    lastUsedMaxDate?: Date;
    hasImage?: boolean;
    purchaseMinDate?: Date;
    purchaseMaxDate?: Date;
    createdMinDate?: Date;
    createdMaxDate?: Date;
    updatedMinDate?: Date;
    updatedMaxDate?: Date;
    searchTerm?: string;
    includeUser?: boolean;
    includeUsageStats?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for UserEquipment entity
 */
export class UserEquipmentRepository extends GenericRepository<UserEquipment> {
    constructor() {
        super(UserEquipment);
    }

    /**
     * Find user equipment with detailed filtering options
     */
    async findWithFilters(filters: UserEquipmentFilters): Promise<[UserEquipment[], number]> {
        try {
            const queryOptions: FindManyOptions<UserEquipment> = createQueryOptions<UserEquipment>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { updatedAt: 'DESC' };

            // Add relations if needed
            if (filters.includeUser) {
                queryOptions.relations = ['user'];
            }

            // Apply basic filters
            if (filters.userId) {
                addWhereCondition(queryOptions, 'user.id', filters.userId);
            }

            if (filters.equipmentName) {
                addWhereCondition(queryOptions, 'equipmentName', filters.equipmentName);
            }

            if (filters.equipmentNames && filters.equipmentNames.length > 0) {
                addWhereCondition(queryOptions, 'equipmentName', In(filters.equipmentNames));
            }

            if (filters.category) {
                addWhereCondition(queryOptions, 'category', filters.category);
            }

            if (filters.categories && filters.categories.length > 0) {
                addWhereCondition(queryOptions, 'category', In(filters.categories));
            }

            if (filters.location) {
                addWhereCondition(queryOptions, 'location', filters.location);
            }

            if (filters.locations && filters.locations.length > 0) {
                addWhereCondition(queryOptions, 'location', In(filters.locations));
            }

            if (filters.isAvailable !== undefined) {
                addWhereCondition(queryOptions, 'isAvailable', filters.isAvailable);
            }

            if (filters.brand) {
                addWhereCondition(queryOptions, 'brand', filters.brand);
            }

            if (filters.brands && filters.brands.length > 0) {
                addWhereCondition(queryOptions, 'brand', In(filters.brands));
            }

            if (filters.model) {
                addWhereCondition(queryOptions, 'model', filters.model);
            }

            // Condition range filters
            if (filters.minCondition !== undefined && filters.maxCondition !== undefined) {
                addWhereCondition(queryOptions, 'condition', Between(filters.minCondition, filters.maxCondition));
            } else if (filters.minCondition !== undefined) {
                addWhereCondition(queryOptions, 'condition', MoreThan(filters.minCondition));
            } else if (filters.maxCondition !== undefined) {
                addWhereCondition(queryOptions, 'condition', LessThan(filters.maxCondition));
            }

            // Purchase date range filters
            if (filters.purchaseMinDate && filters.purchaseMaxDate) {
                addWhereCondition(queryOptions, 'purchaseDate', 
                    Between(filters.purchaseMinDate, filters.purchaseMaxDate));
            } else if (filters.purchaseMinDate) {
                addWhereCondition(queryOptions, 'purchaseDate', 
                    MoreThan(filters.purchaseMinDate));
            } else if (filters.purchaseMaxDate) {
                addWhereCondition(queryOptions, 'purchaseDate', 
                    LessThan(filters.purchaseMaxDate));
            }

            // Created date range filters
            if (filters.createdMinDate && filters.createdMaxDate) {
                addWhereCondition(queryOptions, 'createdAt', 
                    Between(filters.createdMinDate, filters.createdMaxDate));
            } else if (filters.createdMinDate) {
                addWhereCondition(queryOptions, 'createdAt', 
                    MoreThan(filters.createdMinDate));
            } else if (filters.createdMaxDate) {
                addWhereCondition(queryOptions, 'createdAt', 
                    LessThan(filters.createdMaxDate));
            }

            // Updated date range filters
            if (filters.updatedMinDate && filters.updatedMaxDate) {
                addWhereCondition(queryOptions, 'updatedAt', 
                    Between(filters.updatedMinDate, filters.updatedMaxDate));
            } else if (filters.updatedMinDate) {
                addWhereCondition(queryOptions, 'updatedAt', 
                    MoreThan(filters.updatedMinDate));
            } else if (filters.updatedMaxDate) {
                addWhereCondition(queryOptions, 'updatedAt', 
                    LessThan(filters.updatedMaxDate));
            }

            // Filter for equipment with images
            if (filters.hasImage !== undefined) {
                if (filters.hasImage) {
                    addWhereCondition(queryOptions, 'imageUrl', Not(IsNull()));
                } else {
                    addWhereCondition(queryOptions, 'imageUrl', IsNull());
                }
            }

            // JSON field filters - for more complex filters, we might need to use query builder instead
            // These filters will be applied at the application level for now
            const equipment = await this.repository.findAndCount(queryOptions);
            
            // Apply JSON field filters manually for more complex conditions
            if (filters.hasWeightRange !== undefined || 
                filters.minWeight !== undefined || 
                filters.maxWeight !== undefined ||
                filters.isAdjustable !== undefined ||
                filters.hasDimensions !== undefined ||
                filters.hasResistance !== undefined ||
                filters.minResistanceLevels !== undefined) {
                
                const [items, count] = equipment;
                const filteredItems = items.filter(item => {
                    // Check if specifications exist
                    if (!item.specifications) {
                        return false;
                    }

                    // Weight range filters
                    if (filters.hasWeightRange !== undefined) {
                        if (filters.hasWeightRange && !item.specifications.weightRange) {
                            return false;
                        } else if (!filters.hasWeightRange && item.specifications.weightRange) {
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

                    // Adjustable filter
                    if (filters.isAdjustable !== undefined && 
                        item.specifications.adjustable !== filters.isAdjustable) {
                        return false;
                    }

                    // Dimensions filter
                    if (filters.hasDimensions !== undefined) {
                        if (filters.hasDimensions && !item.specifications.dimensions) {
                            return false;
                        } else if (!filters.hasDimensions && item.specifications.dimensions) {
                            return false;
                        }
                    }

                    // Resistance filters
                    if (filters.hasResistance !== undefined) {
                        if (filters.hasResistance && !item.specifications.resistance) {
                            return false;
                        } else if (!filters.hasResistance && item.specifications.resistance) {
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

            // Usage stats filters
            if (filters.lastUsedMinDate !== undefined || filters.lastUsedMaxDate !== undefined) {
                const [items, count] = equipment;
                const filteredItems = items.filter(item => {
                    // Check if usageStats exist and lastUsed is set
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

            // Search term for name and notes
            if (filters.searchTerm) {
                const searchPattern = ILike(`%${filters.searchTerm}%`);
                
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push(
                    { equipmentName: searchPattern },
                    { notes: searchPattern },
                    { brand: searchPattern },
                    { model: searchPattern }
                );
                
                queryOptions.where = whereArray;
            }

            return equipment;
        } catch (error) {
            logger.error('Error in UserEquipmentRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find equipment by category
     */
    async findByCategory(userId: string, category: EquipmentCategory): Promise<UserEquipment[]> {
        try {
            const queryOptions: FindManyOptions<UserEquipment> = createQueryOptions<UserEquipment>({});
            
            // Set sorting
            queryOptions.order = { equipmentName: 'ASC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'user.id', userId);
            addWhereCondition(queryOptions, 'category', category);
            addWhereCondition(queryOptions, 'isAvailable', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in UserEquipmentRepository.findByCategory', { error, userId, category });
            throw error;
        }
    }

    /**
     * Find equipment by location
     */
    async findByLocation(userId: string, location: EquipmentLocation): Promise<UserEquipment[]> {
        try {
            const queryOptions: FindManyOptions<UserEquipment> = createQueryOptions<UserEquipment>({});
            
            // Set sorting
            queryOptions.order = { category: 'ASC', equipmentName: 'ASC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'user.id', userId);
            addWhereCondition(queryOptions, 'location', location);
            addWhereCondition(queryOptions, 'isAvailable', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in UserEquipmentRepository.findByLocation', { error, userId, location });
            throw error;
        }
    }

    /**
     * Check if user has specific equipment
     */
    async hasEquipment(userId: string, equipmentName: string): Promise<boolean> {
        try {
            const count = await this.repository.count({
                where: {
                    user: { id: userId },
                    equipmentName,
                    isAvailable: true
                }
            });
            
            return count > 0;
        } catch (error) {
            logger.error('Error in UserEquipmentRepository.hasEquipment', { error, userId, equipmentName });
            throw error;
        }
    }

    /**
     * Get user's equipment summary
     */
    async getUserEquipmentSummary(userId: string): Promise<any> {
        try {
            // Get total count of equipment
            const totalCount = await this.repository.count({
                where: { user: { id: userId } }
            });

            // Get count by category
            const categoryDistribution = await this.repository
                .createQueryBuilder('equipment')
                .select('equipment.category', 'category')
                .addSelect('COUNT(*)', 'count')
                .where('equipment.user_id = :userId', { userId })
                .groupBy('equipment.category')
                .getRawMany();

            // Get count by location
            const locationDistribution = await this.repository
                .createQueryBuilder('equipment')
                .select('equipment.location', 'location')
                .addSelect('COUNT(*)', 'count')
                .where('equipment.user_id = :userId', { userId })
                .groupBy('equipment.location')
                .getRawMany();

            // Get availability count
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
        } catch (error) {
            logger.error('Error in UserEquipmentRepository.getUserEquipmentSummary', { error, userId });
            throw error;
        }
    }

    /**
     * Update equipment usage stats
     */
    async updateUsageStats(equipmentId: string, exerciseId?: string): Promise<void> {
        try {
            const equipment = await this.repository.findOne({
                where: { id: equipmentId }
            });
            
            if (!equipment) {
                throw new Error(`Equipment with ID ${equipmentId} not found`);
            }
            
            // Initialize usageStats if it doesn't exist
            if (!equipment.usageStats) {
                equipment.usageStats = {
                    lastUsed: new Date(),
                    usageFrequency: 1,
                    favoriteExercises: exerciseId ? [exerciseId] : [],
                    totalUses: 1
                };
            } else {
                // Update existing stats
                equipment.usageStats.lastUsed = new Date();
                equipment.usageStats.totalUses = (equipment.usageStats.totalUses || 0) + 1;
                
                // Add exercise to favorites if not already there
                if (exerciseId && equipment.usageStats.favoriteExercises) {
                    if (!equipment.usageStats.favoriteExercises.includes(exerciseId)) {
                        equipment.usageStats.favoriteExercises.push(exerciseId);
                    }
                } else if (exerciseId) {
                    equipment.usageStats.favoriteExercises = [exerciseId];
                }
            }
            
            // Save updated equipment
            await this.repository.save(equipment);
        } catch (error) {
            logger.error('Error in UserEquipmentRepository.updateUsageStats', { error, equipmentId, exerciseId });
            throw error;
        }
    }

    /**
     * Get available equipment filters for a user
     */
    async getAvailableFilters(userId: string): Promise<any> {
        try {
            // Get distinct categories used by this user
            const categories = await this.repository
                .createQueryBuilder('equipment')
                .select('DISTINCT equipment.category', 'category')
                .where('equipment.user_id = :userId', { userId })
                .getRawMany();
            
            // Get distinct locations used by this user
            const locations = await this.repository
                .createQueryBuilder('equipment')
                .select('DISTINCT equipment.location', 'location')
                .where('equipment.user_id = :userId', { userId })
                .getRawMany();
            
            // Get distinct brands used by this user
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
        } catch (error) {
            logger.error('Error in UserEquipmentRepository.getAvailableFilters', { error, userId });
            throw error;
        }
    }
} 