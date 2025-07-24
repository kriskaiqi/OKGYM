"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementRepository = void 0;
const typeorm_1 = require("typeorm");
const Achievement_1 = require("../models/Achievement");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class AchievementRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(Achievement_1.Achievement);
    }
    async findWithFilters(filters) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            queryOptions.order = filters.sortBy
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' }
                : { updatedAt: 'DESC' };
            const relations = [];
            if (filters.includeUser)
                relations.push('user');
            if (filters.includeExercise)
                relations.push('exercise');
            if (filters.includeWorkoutSession)
                relations.push('workoutSession');
            if (filters.includePrerequisites)
                relations.push('prerequisites');
            if (relations.length > 0) {
                queryOptions.relations = relations;
            }
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', filters.userId);
            }
            if (filters.category) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', filters.category);
            }
            if (filters.categories && filters.categories.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', (0, typeorm_1.In)(filters.categories));
            }
            if (filters.tier) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'tier', filters.tier);
            }
            if (filters.tiers && filters.tiers.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'tier', (0, typeorm_1.In)(filters.tiers));
            }
            if (filters.criteriaType) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'criteriaType', filters.criteriaType);
            }
            if (filters.criteriaTypes && filters.criteriaTypes.length > 0) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'criteriaType', (0, typeorm_1.In)(filters.criteriaTypes));
            }
            if (filters.exerciseId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise.id', filters.exerciseId);
            }
            if (filters.workoutSessionId) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'workoutSession.id', filters.workoutSessionId);
            }
            if (filters.isTemplate !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isTemplate', filters.isTemplate);
            }
            if (filters.isSecret !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isSecret', filters.isSecret);
            }
            if (filters.isActive !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isActive', filters.isActive);
            }
            if (filters.isUnlocked !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isUnlocked', filters.isUnlocked);
            }
            if (filters.minPoints !== undefined && filters.maxPoints !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'points', (0, typeorm_1.Between)(filters.minPoints, filters.maxPoints));
            }
            else if (filters.minPoints !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'points', (0, typeorm_1.MoreThan)(filters.minPoints));
            }
            else if (filters.maxPoints !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'points', (0, typeorm_1.LessThan)(filters.maxPoints));
            }
            if (filters.unlockedMinDate && filters.unlockedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'unlockedAt', (0, typeorm_1.Between)(filters.unlockedMinDate, filters.unlockedMaxDate));
            }
            else if (filters.unlockedMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'unlockedAt', (0, typeorm_1.MoreThan)(filters.unlockedMinDate));
            }
            else if (filters.unlockedMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'unlockedAt', (0, typeorm_1.LessThan)(filters.unlockedMaxDate));
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
            if (filters.expiresMinDate && filters.expiresMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'expiresAt', (0, typeorm_1.Between)(filters.expiresMinDate, filters.expiresMaxDate));
            }
            else if (filters.expiresMinDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'expiresAt', (0, typeorm_1.MoreThan)(filters.expiresMinDate));
            }
            else if (filters.expiresMaxDate) {
                (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'expiresAt', (0, typeorm_1.LessThan)(filters.expiresMaxDate));
            }
            if (filters.searchTerm) {
                const searchPattern = (0, typeorm_1.ILike)(`%${filters.searchTerm}%`);
                if (!queryOptions.where) {
                    queryOptions.where = [];
                }
                const whereArray = Array.isArray(queryOptions.where) ? queryOptions.where : [queryOptions.where];
                whereArray.push({ name: searchPattern }, { description: searchPattern }, { criteriaDescription: searchPattern });
                queryOptions.where = whereArray;
            }
            if (filters.hasPrerequisites !== undefined) {
                const [achievements, count] = await this.repository.findAndCount(queryOptions);
                if (filters.hasPrerequisites) {
                    const achievementsWithPrerequisites = await this.repository
                        .createQueryBuilder('achievement')
                        .innerJoin('achievement_prerequisites', 'ap', 'achievement.id = ap.achievement_id')
                        .where('achievement.id IN (:...ids)', { ids: achievements.map(a => a.id) })
                        .getMany();
                    const filteredIds = new Set(achievementsWithPrerequisites.map(a => a.id));
                    return [achievements.filter(a => filteredIds.has(a.id)), filteredIds.size];
                }
                else {
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
        }
        catch (error) {
            logger_1.default.error('Error in AchievementRepository.findWithFilters', { error, filters });
            throw error;
        }
    }
    async findByCategory(category, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { tier: 'ASC', name: 'ASC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'category', category);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isActive', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AchievementRepository.findByCategory', { error, category, limit });
            throw error;
        }
    }
    async findByTier(tier, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { category: 'ASC', name: 'ASC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'tier', tier);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isActive', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AchievementRepository.findByTier', { error, tier, limit });
            throw error;
        }
    }
    async findUserUnlocked(userId, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { unlockedAt: 'DESC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isUnlocked', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AchievementRepository.findUserUnlocked', { error, userId, limit });
            throw error;
        }
    }
    async findUserAvailable(userId, limit = 20) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.take = limit;
            queryOptions.order = { tier: 'ASC', category: 'ASC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'user.id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isUnlocked', false);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isActive', true);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isSecret', false);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AchievementRepository.findUserAvailable', { error, userId, limit });
            throw error;
        }
    }
    async findByExercise(exerciseId) {
        try {
            const queryOptions = (0, typeorm_helpers_1.createQueryOptions)({});
            queryOptions.order = { tier: 'ASC' };
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'exercise.id', exerciseId);
            (0, typeorm_helpers_1.addWhereCondition)(queryOptions, 'isActive', true);
            return await this.repository.find(queryOptions);
        }
        catch (error) {
            logger_1.default.error('Error in AchievementRepository.findByExercise', { error, exerciseId });
            throw error;
        }
    }
    async isUnlocked(achievementId) {
        try {
            const achievement = await this.repository.findOne({
                where: { id: achievementId }
            });
            return achievement ? achievement.isUnlocked : false;
        }
        catch (error) {
            logger_1.default.error('Error in AchievementRepository.isUnlocked', { error, achievementId });
            throw error;
        }
    }
    async getUserAchievementStats(userId) {
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
        }
        catch (error) {
            logger_1.default.error('Error in AchievementRepository.getUserAchievementStats', { error, userId });
            throw error;
        }
    }
    async createFromTemplate(templateId, userId) {
        try {
            const template = await this.repository.findOne({
                where: {
                    id: templateId,
                    isTemplate: true
                }
            });
            if (!template) {
                throw new Error(`Achievement template with ID ${templateId} not found`);
            }
            const newAchievement = new Achievement_1.Achievement();
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
            return await this.repository.save(newAchievement);
        }
        catch (error) {
            logger_1.default.error('Error in AchievementRepository.createFromTemplate', { error, templateId, userId });
            throw error;
        }
    }
    async updateProgress(achievementId, amount) {
        try {
            const achievement = await this.repository.findOne({
                where: { id: achievementId }
            });
            if (!achievement) {
                throw new Error(`Achievement with ID ${achievementId} not found`);
            }
            const isUnlocked = achievement.updateProgress(amount);
            if (isUnlocked && !achievement.unlockedAt) {
                achievement.unlockedAt = new Date();
            }
            await this.repository.save(achievement);
            return isUnlocked;
        }
        catch (error) {
            logger_1.default.error('Error in AchievementRepository.updateProgress', { error, achievementId, amount });
            throw error;
        }
    }
    async getCompletionPercentage(achievementId) {
        try {
            const achievement = await this.repository.findOne({
                where: { id: achievementId }
            });
            if (!achievement) {
                throw new Error(`Achievement with ID ${achievementId} not found`);
            }
            return achievement.calculateCompletionPercentage();
        }
        catch (error) {
            logger_1.default.error('Error in AchievementRepository.getCompletionPercentage', { error, achievementId });
            throw error;
        }
    }
}
exports.AchievementRepository = AchievementRepository;
//# sourceMappingURL=AchievementRepository.js.map