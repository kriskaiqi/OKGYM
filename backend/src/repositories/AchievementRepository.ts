import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not, In, ILike } from 'typeorm';
import { Achievement, AchievementCategory, AchievementTier, AchievementCriteriaType } from '../models/Achievement';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying achievements
 */
export interface AchievementFilters {
    userId?: string;
    category?: AchievementCategory;
    categories?: AchievementCategory[];
    tier?: AchievementTier;
    tiers?: AchievementTier[];
    criteriaType?: AchievementCriteriaType;
    criteriaTypes?: AchievementCriteriaType[];
    exerciseId?: string;
    workoutSessionId?: string;
    isTemplate?: boolean;
    isSecret?: boolean;
    isActive?: boolean;
    isUnlocked?: boolean;
    unlockedMinDate?: Date;
    unlockedMaxDate?: Date;
    minPoints?: number;
    maxPoints?: number;
    hasPrerequisites?: boolean;
    searchTerm?: string;
    createdMinDate?: Date;
    createdMaxDate?: Date;
    expiresMinDate?: Date;
    expiresMaxDate?: Date;
    includeUser?: boolean;
    includeExercise?: boolean;
    includeWorkoutSession?: boolean;
    includePrerequisites?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for Achievement entity
 */
export class AchievementRepository extends GenericRepository<Achievement> {
    constructor() {
        super(Achievement);
    }

    /**
     * Find achievements with detailed filtering options
     */
    async findWithFilters(filters: AchievementFilters): Promise<[Achievement[], number]> {
        try {
            const queryOptions: FindManyOptions<Achievement> = createQueryOptions<Achievement>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { updatedAt: 'DESC' };

            // Add relations if needed
            const relations: string[] = [];
            if (filters.includeUser) relations.push('user');
            if (filters.includeExercise) relations.push('exercise');
            if (filters.includeWorkoutSession) relations.push('workoutSession');
            if (filters.includePrerequisites) relations.push('prerequisites');
            
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }

            // Apply basic filters
            if (filters.userId) {
                addWhereCondition(queryOptions, 'user.id', filters.userId);
            }

            if (filters.category) {
                addWhereCondition(queryOptions, 'category', filters.category);
            }

            if (filters.categories && filters.categories.length > 0) {
                addWhereCondition(queryOptions, 'category', In(filters.categories));
            }

            if (filters.tier) {
                addWhereCondition(queryOptions, 'tier', filters.tier);
            }

            if (filters.tiers && filters.tiers.length > 0) {
                addWhereCondition(queryOptions, 'tier', In(filters.tiers));
            }

            if (filters.criteriaType) {
                addWhereCondition(queryOptions, 'criteriaType', filters.criteriaType);
            }

            if (filters.criteriaTypes && filters.criteriaTypes.length > 0) {
                addWhereCondition(queryOptions, 'criteriaType', In(filters.criteriaTypes));
            }

            if (filters.exerciseId) {
                addWhereCondition(queryOptions, 'exercise.id', filters.exerciseId);
            }

            if (filters.workoutSessionId) {
                addWhereCondition(queryOptions, 'workoutSession.id', filters.workoutSessionId);
            }

            if (filters.isTemplate !== undefined) {
                addWhereCondition(queryOptions, 'isTemplate', filters.isTemplate);
            }

            if (filters.isSecret !== undefined) {
                addWhereCondition(queryOptions, 'isSecret', filters.isSecret);
            }

            if (filters.isActive !== undefined) {
                addWhereCondition(queryOptions, 'isActive', filters.isActive);
            }

            if (filters.isUnlocked !== undefined) {
                addWhereCondition(queryOptions, 'isUnlocked', filters.isUnlocked);
            }

            // Points range filters
            if (filters.minPoints !== undefined && filters.maxPoints !== undefined) {
                addWhereCondition(queryOptions, 'points', Between(filters.minPoints, filters.maxPoints));
            } else if (filters.minPoints !== undefined) {
                addWhereCondition(queryOptions, 'points', MoreThan(filters.minPoints));
            } else if (filters.maxPoints !== undefined) {
                addWhereCondition(queryOptions, 'points', LessThan(filters.maxPoints));
            }

            // Unlocked date range filters
            if (filters.unlockedMinDate && filters.unlockedMaxDate) {
                addWhereCondition(queryOptions, 'unlockedAt', 
                    Between(filters.unlockedMinDate, filters.unlockedMaxDate));
            } else if (filters.unlockedMinDate) {
                addWhereCondition(queryOptions, 'unlockedAt', 
                    MoreThan(filters.unlockedMinDate));
            } else if (filters.unlockedMaxDate) {
                addWhereCondition(queryOptions, 'unlockedAt', 
                    LessThan(filters.unlockedMaxDate));
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

            // Expires date range filters
            if (filters.expiresMinDate && filters.expiresMaxDate) {
                addWhereCondition(queryOptions, 'expiresAt', 
                    Between(filters.expiresMinDate, filters.expiresMaxDate));
            } else if (filters.expiresMinDate) {
                addWhereCondition(queryOptions, 'expiresAt', 
                    MoreThan(filters.expiresMinDate));
            } else if (filters.expiresMaxDate) {
                addWhereCondition(queryOptions, 'expiresAt', 
                    LessThan(filters.expiresMaxDate));
            }

            // Search term for name and description
            if (filters.searchTerm) {
                const searchPattern = ILike(`%${filters.searchTerm}%`);
                
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push(
                    { name: searchPattern },
                    { description: searchPattern },
                    { criteriaDescription: searchPattern }
                );
                
                queryOptions.where = whereArray;
            }

            // Has prerequisites filter
            if (filters.hasPrerequisites !== undefined) {
                // This requires a more complex query with JOIN
                // We'll use a raw query approach for this specific case
                const [achievements, count] = await this.repository.findAndCount(queryOptions);
                
                if (filters.hasPrerequisites) {
                    // Filter only achievements with prerequisites
                    const achievementsWithPrerequisites = await this.repository
                        .createQueryBuilder('achievement')
                        .innerJoin('achievement_prerequisites', 'ap', 'achievement.id = ap.achievement_id')
                        .where('achievement.id IN (:...ids)', { ids: achievements.map(a => a.id) })
                        .getMany();
                    
                    const filteredIds = new Set(achievementsWithPrerequisites.map(a => a.id));
                    return [achievements.filter(a => filteredIds.has(a.id)), filteredIds.size];
                } else {
                    // Filter only achievements without prerequisites
                    const achievementsWithPrerequisites = await this.repository
                        .createQueryBuilder('achievement')
                        .innerJoin('achievement_prerequisites', 'ap', 'achievement.id = ap.achievement_id')
                        .where('achievement.id IN (:...ids)', { ids: achievements.map(a => a.id) })
                        .getMany();
                    
                    const filteredIds = new Set(achievementsWithPrerequisites.map(a => a.id));
                    return [achievements.filter(a => !filteredIds.has(a.id)), achievements.length - filteredIds.size];
                }
            }

            return await this.repository.findAndCount(queryOptions);
        } catch (error) {
            logger.error('Error in AchievementRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find achievements by category
     */
    async findByCategory(category: AchievementCategory, limit: number = 20): Promise<Achievement[]> {
        try {
            const queryOptions: FindManyOptions<Achievement> = createQueryOptions<Achievement>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { tier: 'ASC', name: 'ASC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'category', category);
            addWhereCondition(queryOptions, 'isActive', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in AchievementRepository.findByCategory', { error, category, limit });
            throw error;
        }
    }

    /**
     * Find achievements by tier
     */
    async findByTier(tier: AchievementTier, limit: number = 20): Promise<Achievement[]> {
        try {
            const queryOptions: FindManyOptions<Achievement> = createQueryOptions<Achievement>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { category: 'ASC', name: 'ASC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'tier', tier);
            addWhereCondition(queryOptions, 'isActive', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in AchievementRepository.findByTier', { error, tier, limit });
            throw error;
        }
    }

    /**
     * Find user's unlocked achievements
     */
    async findUserUnlocked(userId: string, limit: number = 20): Promise<Achievement[]> {
        try {
            const queryOptions: FindManyOptions<Achievement> = createQueryOptions<Achievement>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { unlockedAt: 'DESC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'user.id', userId);
            addWhereCondition(queryOptions, 'isUnlocked', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in AchievementRepository.findUserUnlocked', { error, userId, limit });
            throw error;
        }
    }

    /**
     * Find user's available achievements (not unlocked yet)
     */
    async findUserAvailable(userId: string, limit: number = 20): Promise<Achievement[]> {
        try {
            const queryOptions: FindManyOptions<Achievement> = createQueryOptions<Achievement>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { tier: 'ASC', category: 'ASC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'user.id', userId);
            addWhereCondition(queryOptions, 'isUnlocked', false);
            addWhereCondition(queryOptions, 'isActive', true);
            
            // Do not include secret achievements
            addWhereCondition(queryOptions, 'isSecret', false);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in AchievementRepository.findUserAvailable', { error, userId, limit });
            throw error;
        }
    }

    /**
     * Find achievements associated with an exercise
     */
    async findByExercise(exerciseId: string): Promise<Achievement[]> {
        try {
            const queryOptions: FindManyOptions<Achievement> = createQueryOptions<Achievement>({});
            
            // Set sorting
            queryOptions.order = { tier: 'ASC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'exercise.id', exerciseId);
            addWhereCondition(queryOptions, 'isActive', true);

            return await this.repository.find(queryOptions);
        } catch (error) {
            logger.error('Error in AchievementRepository.findByExercise', { error, exerciseId });
            throw error;
        }
    }

    /**
     * Check if achievement is unlocked
     */
    async isUnlocked(achievementId: string): Promise<boolean> {
        try {
            const achievement = await this.repository.findOne({
                where: { id: achievementId }
            });
            
            return achievement ? achievement.isUnlocked : false;
        } catch (error) {
            logger.error('Error in AchievementRepository.isUnlocked', { error, achievementId });
            throw error;
        }
    }

    /**
     * Get user's achievement stats
     */
    async getUserAchievementStats(userId: string): Promise<any> {
        try {
            const totalCount = await this.repository.count({
                where: { user: { id: userId } }
            });
            
            const unlockedCount = await this.repository.count({
                where: { 
                    user: { id: userId },
                    isUnlocked: true
                }
            });
            
            const categoryDistribution = await this.repository
                .createQueryBuilder('achievement')
                .select('achievement.category', 'category')
                .addSelect('COUNT(*)', 'count')
                .addSelect('SUM(CASE WHEN achievement.is_unlocked = true THEN 1 ELSE 0 END)', 'unlocked')
                .where('achievement.user_id = :userId', { userId })
                .groupBy('achievement.category')
                .getRawMany();
            
            const tierDistribution = await this.repository
                .createQueryBuilder('achievement')
                .select('achievement.tier', 'tier')
                .addSelect('COUNT(*)', 'count')
                .addSelect('SUM(CASE WHEN achievement.is_unlocked = true THEN 1 ELSE 0 END)', 'unlocked')
                .where('achievement.user_id = :userId', { userId })
                .groupBy('achievement.tier')
                .getRawMany();
            
            const totalPoints = await this.repository
                .createQueryBuilder('achievement')
                .select('SUM(achievement.points)', 'totalPoints')
                .where('achievement.user_id = :userId', { userId })
                .andWhere('achievement.is_unlocked = :isUnlocked', { isUnlocked: true })
                .getRawOne();
            
            return {
                totalCount,
                unlockedCount,
                completionRate: totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0,
                totalPoints: totalPoints ? parseInt(totalPoints.totalPoints) || 0 : 0,
                categoryDistribution,
                tierDistribution
            };
        } catch (error) {
            logger.error('Error in AchievementRepository.getUserAchievementStats', { error, userId });
            throw error;
        }
    }

    /**
     * Create achievement from template
     */
    async createFromTemplate(templateId: string, userId: string): Promise<Achievement> {
        try {
            // Find the template achievement
            const template = await this.repository.findOne({
                where: {
                    id: templateId,
                    isTemplate: true
                }
            });
            
            if (!template) {
                throw new Error(`Achievement template with ID ${templateId} not found`);
            }
            
            // Create a new achievement based on the template but with a new ID
            const newAchievement = new Achievement();
            
            // Copy the relevant properties from the template
            Object.assign(newAchievement, {
                name: template.name,
                description: template.description,
                category: template.category,
                tier: template.tier,
                criteriaType: template.criteriaType,
                criteriaDescription: template.criteriaDescription,
                points: template.points,
                isSecret: template.isSecret,
                isActive: template.isActive,
                isTemplate: false,
                isUnlocked: false,
                currentProgress: 0,
                user: { id: userId }
            });
            
            // Save and return the new achievement
            return await this.repository.save(newAchievement);
        } catch (error) {
            logger.error('Error in AchievementRepository.createFromTemplate', { error, templateId, userId });
            throw error;
        }
    }

    /**
     * Update achievement progress
     */
    async updateProgress(achievementId: string, amount: number): Promise<boolean> {
        try {
            const achievement = await this.repository.findOne({
                where: { id: achievementId }
            });
            
            if (!achievement) {
                throw new Error(`Achievement with ID ${achievementId} not found`);
            }
            
            // Use the achievement's updateProgress method
            const isUnlocked = achievement.updateProgress(amount);
            
            // If the achievement was just unlocked, set the unlockedAt date
            if (isUnlocked && !achievement.unlockedAt) {
                achievement.unlockedAt = new Date();
            }
            
            // Save the updated achievement
            await this.repository.save(achievement);
            
            return isUnlocked;
        } catch (error) {
            logger.error('Error in AchievementRepository.updateProgress', { error, achievementId, amount });
            throw error;
        }
    }

    /**
     * Get achievement completion percentage
     */
    async getCompletionPercentage(achievementId: string): Promise<number> {
        try {
            const achievement = await this.repository.findOne({
                where: { id: achievementId }
            });
            
            if (!achievement) {
                throw new Error(`Achievement with ID ${achievementId} not found`);
            }
            
            return achievement.calculateCompletionPercentage();
        } catch (error) {
            logger.error('Error in AchievementRepository.getCompletionPercentage', { error, achievementId });
            throw error;
        }
    }
} 