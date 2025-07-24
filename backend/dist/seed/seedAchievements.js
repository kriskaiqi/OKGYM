"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAchievements = seedAchievements;
const Achievement_1 = require("../models/Achievement");
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
async function seedAchievements() {
    try {
        const achievementRepository = data_source_1.AppDataSource.getRepository(Achievement_1.Achievement);
        const existingCount = await achievementRepository.count();
        if (existingCount > 0) {
            logger_1.default.info(`Database already has ${existingCount} achievements. Skipping seed.`);
            return;
        }
        const achievementsData = [
            {
                name: 'First Workout Complete',
                description: 'Completed your first workout. This is the beginning of your fitness journey!',
                category: Achievement_1.AchievementCategory.MILESTONE,
                tier: Achievement_1.AchievementTier.BRONZE,
                points: 10,
                icon: 'emoji_events',
                criteriaType: Achievement_1.AchievementCriteriaType.COUNT,
                criteriaDescription: 'Complete your first workout',
                progress: {
                    current: 0,
                    required: 1,
                    unit: 'workouts'
                },
                progressRules: {
                    workoutsCompleted: 1
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: '10 Workouts',
                description: 'Completed 10 workouts. You\'re building consistency!',
                category: Achievement_1.AchievementCategory.MILESTONE,
                tier: Achievement_1.AchievementTier.BRONZE,
                points: 25,
                icon: 'emoji_events',
                criteriaType: Achievement_1.AchievementCriteriaType.COUNT,
                criteriaDescription: 'Complete 10 workouts',
                progress: {
                    current: 0,
                    required: 10,
                    unit: 'workouts'
                },
                progressRules: {
                    workoutsCompleted: 10
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: '50 Workouts',
                description: 'Completed 50 workouts. Your dedication is impressive!',
                category: Achievement_1.AchievementCategory.MILESTONE,
                tier: Achievement_1.AchievementTier.SILVER,
                points: 100,
                icon: 'emoji_events',
                criteriaType: Achievement_1.AchievementCriteriaType.COUNT,
                criteriaDescription: 'Complete 50 workouts',
                progress: {
                    current: 0,
                    required: 50,
                    unit: 'workouts'
                },
                progressRules: {
                    workoutsCompleted: 50
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: '100 Workouts',
                description: 'Completed 100 workouts. You\'re now firmly in the fitness lifestyle!',
                category: Achievement_1.AchievementCategory.MILESTONE,
                tier: Achievement_1.AchievementTier.GOLD,
                points: 250,
                icon: 'emoji_events',
                criteriaType: Achievement_1.AchievementCriteriaType.COUNT,
                criteriaDescription: 'Complete 100 workouts',
                progress: {
                    current: 0,
                    required: 100,
                    unit: 'workouts'
                },
                progressRules: {
                    workoutsCompleted: 100
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: '365 Workouts',
                description: 'Completed 365 workouts. You\'ve reached an elite level of dedication!',
                category: Achievement_1.AchievementCategory.MILESTONE,
                tier: Achievement_1.AchievementTier.PLATINUM,
                points: 500,
                icon: 'emoji_events',
                criteriaType: Achievement_1.AchievementCriteriaType.COUNT,
                criteriaDescription: 'Complete 365 workouts',
                progress: {
                    current: 0,
                    required: 365,
                    unit: 'workouts'
                },
                progressRules: {
                    workoutsCompleted: 365
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: '3-Day Streak',
                description: 'Completed workouts for 3 consecutive days. Building momentum!',
                category: Achievement_1.AchievementCategory.CONSISTENCY,
                tier: Achievement_1.AchievementTier.BRONZE,
                points: 15,
                icon: 'local_fire_department',
                criteriaType: Achievement_1.AchievementCriteriaType.STREAK,
                criteriaDescription: 'Complete workouts for 3 consecutive days',
                progress: {
                    current: 0,
                    required: 3,
                    unit: 'days'
                },
                progressRules: {
                    streakDays: 3
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: '7-Day Streak',
                description: 'Completed workouts for 7 consecutive days. A full week of dedication!',
                category: Achievement_1.AchievementCategory.CONSISTENCY,
                tier: Achievement_1.AchievementTier.BRONZE,
                points: 50,
                icon: 'local_fire_department',
                criteriaType: Achievement_1.AchievementCriteriaType.STREAK,
                criteriaDescription: 'Complete workouts for 7 consecutive days',
                progress: {
                    current: 0,
                    required: 7,
                    unit: 'days'
                },
                progressRules: {
                    streakDays: 7
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: '14-Day Streak',
                description: 'Completed workouts for 14 consecutive days. Two weeks strong!',
                category: Achievement_1.AchievementCategory.CONSISTENCY,
                tier: Achievement_1.AchievementTier.SILVER,
                points: 100,
                icon: 'local_fire_department',
                criteriaType: Achievement_1.AchievementCriteriaType.STREAK,
                criteriaDescription: 'Complete workouts for 14 consecutive days',
                progress: {
                    current: 0,
                    required: 14,
                    unit: 'days'
                },
                progressRules: {
                    streakDays: 14
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: '30-Day Streak',
                description: 'Completed workouts for 30 consecutive days. A month of discipline!',
                category: Achievement_1.AchievementCategory.CONSISTENCY,
                tier: Achievement_1.AchievementTier.GOLD,
                points: 250,
                icon: 'local_fire_department',
                criteriaType: Achievement_1.AchievementCriteriaType.STREAK,
                criteriaDescription: 'Complete workouts for 30 consecutive days',
                progress: {
                    current: 0,
                    required: 30,
                    unit: 'days'
                },
                progressRules: {
                    streakDays: 30
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: '90-Day Streak',
                description: 'Completed workouts for 90 consecutive days. Extraordinary consistency!',
                category: Achievement_1.AchievementCategory.CONSISTENCY,
                tier: Achievement_1.AchievementTier.PLATINUM,
                points: 500,
                icon: 'local_fire_department',
                criteriaType: Achievement_1.AchievementCriteriaType.STREAK,
                criteriaDescription: 'Complete workouts for 90 consecutive days',
                progress: {
                    current: 0,
                    required: 90,
                    unit: 'days'
                },
                progressRules: {
                    streakDays: 90
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: '5% Weight Loss',
                description: 'Lost 5% of your initial body weight. Your hard work is paying off!',
                category: Achievement_1.AchievementCategory.IMPROVEMENT,
                tier: Achievement_1.AchievementTier.SILVER,
                points: 100,
                icon: 'trending_down',
                criteriaType: Achievement_1.AchievementCriteriaType.PERCENTAGE,
                criteriaDescription: 'Lose 5% of your initial body weight',
                progress: {
                    current: 0,
                    required: 5,
                    unit: 'percent'
                },
                progressRules: {
                    weightLossPercentage: 5
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: '10kg Total Volume Increase',
                description: 'Increased your total lifting volume by 10kg. Getting stronger!',
                category: Achievement_1.AchievementCategory.IMPROVEMENT,
                tier: Achievement_1.AchievementTier.SILVER,
                points: 75,
                icon: 'fitness_center',
                criteriaType: Achievement_1.AchievementCriteriaType.THRESHOLD,
                criteriaDescription: 'Increase your total lifting volume by 10kg',
                progress: {
                    current: 0,
                    required: 10,
                    unit: 'kg'
                },
                progressRules: {
                    volumeIncrease: 10
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: 'First Body Measurement Goal',
                description: 'Reached your first body measurement goal. Tangible progress!',
                category: Achievement_1.AchievementCategory.IMPROVEMENT,
                tier: Achievement_1.AchievementTier.SILVER,
                points: 75,
                icon: 'straighten',
                criteriaType: Achievement_1.AchievementCriteriaType.COMPLETION,
                criteriaDescription: 'Reach one of your body measurement goals',
                progress: {
                    current: 0,
                    required: 1,
                    unit: 'goals'
                },
                progressRules: {
                    measurementGoalReached: 1
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: 'Perfect Form Master',
                description: 'Achieved perfect form scores on 5 different exercises.',
                category: Achievement_1.AchievementCategory.PERFORMANCE,
                tier: Achievement_1.AchievementTier.GOLD,
                points: 100,
                icon: 'analytics',
                criteriaType: Achievement_1.AchievementCriteriaType.COUNT,
                criteriaDescription: 'Get perfect form scores on 5 different exercises',
                progress: {
                    current: 0,
                    required: 5,
                    unit: 'exercises'
                },
                progressRules: {
                    perfectFormExercises: 5
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: 'Personal Best Breaker',
                description: 'Set new personal records in 3 different exercises.',
                category: Achievement_1.AchievementCategory.PERFORMANCE,
                tier: Achievement_1.AchievementTier.SILVER,
                points: 80,
                icon: 'leaderboard',
                criteriaType: Achievement_1.AchievementCriteriaType.COUNT,
                criteriaDescription: 'Set new PRs in 3 different exercises',
                progress: {
                    current: 0,
                    required: 3,
                    unit: 'PRs'
                },
                progressRules: {
                    prCount: 3
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: 'Early Bird',
                description: 'Completed 5 workouts before 8 AM. Rise and grind!',
                category: Achievement_1.AchievementCategory.SPECIAL,
                tier: Achievement_1.AchievementTier.BRONZE,
                points: 50,
                icon: 'wb_sunny',
                criteriaType: Achievement_1.AchievementCriteriaType.COUNT,
                criteriaDescription: 'Complete 5 workouts before 8 AM',
                progress: {
                    current: 0,
                    required: 5,
                    unit: 'morning workouts'
                },
                progressRules: {
                    morningWorkouts: 5
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: 'Night Owl',
                description: 'Completed 5 workouts after 8 PM. Burning the midnight oil!',
                category: Achievement_1.AchievementCategory.SPECIAL,
                tier: Achievement_1.AchievementTier.BRONZE,
                points: 50,
                icon: 'nightlight',
                criteriaType: Achievement_1.AchievementCriteriaType.COUNT,
                criteriaDescription: 'Complete 5 workouts after 8 PM',
                progress: {
                    current: 0,
                    required: 5,
                    unit: 'evening workouts'
                },
                progressRules: {
                    eveningWorkouts: 5
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: 'Weekend Warrior',
                description: 'Completed 8 weekend workouts. Making the most of your free time!',
                category: Achievement_1.AchievementCategory.SPECIAL,
                tier: Achievement_1.AchievementTier.SILVER,
                points: 75,
                icon: 'weekend',
                criteriaType: Achievement_1.AchievementCriteriaType.COUNT,
                criteriaDescription: 'Complete 8 weekend workouts',
                progress: {
                    current: 0,
                    required: 8,
                    unit: 'weekend workouts'
                },
                progressRules: {
                    weekendWorkouts: 8
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: 'Program Completer',
                description: 'Completed a full training program from start to finish. Commitment pays off!',
                category: Achievement_1.AchievementCategory.MILESTONE,
                tier: Achievement_1.AchievementTier.GOLD,
                points: 150,
                icon: 'assignment_turned_in',
                criteriaType: Achievement_1.AchievementCriteriaType.COMPLETION,
                criteriaDescription: 'Complete a full training program',
                progress: {
                    current: 0,
                    required: 1,
                    unit: 'programs'
                },
                progressRules: {
                    programsCompleted: 1
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            },
            {
                name: 'All-Rounder',
                description: 'Trained all major muscle groups in a single week. Balanced development!',
                category: Achievement_1.AchievementCategory.SPECIAL,
                tier: Achievement_1.AchievementTier.GOLD,
                points: 100,
                icon: 'sports_gymnastics',
                criteriaType: Achievement_1.AchievementCriteriaType.COMPLETION,
                criteriaDescription: 'Train all major muscle groups in one week',
                progress: {
                    current: 0,
                    required: 1,
                    unit: 'weeks'
                },
                progressRules: {
                    allMuscleGroups: true,
                    timeframe: '1 week'
                },
                isTemplate: true,
                isActive: true,
                isSecret: false
            }
        ];
        for (const achievementData of achievementsData) {
            try {
                const achievement = new Achievement_1.Achievement();
                achievement.name = achievementData.name;
                achievement.description = achievementData.description;
                achievement.category = achievementData.category;
                achievement.tier = achievementData.tier;
                achievement.points = achievementData.points;
                achievement.icon = achievementData.icon;
                achievement.criteriaType = achievementData.criteriaType;
                achievement.criteriaDescription = achievementData.criteriaDescription;
                achievement.progress = achievementData.progress;
                achievement.progressRules = achievementData.progressRules;
                achievement.isTemplate = achievementData.isTemplate;
                achievement.isActive = achievementData.isActive;
                achievement.isSecret = achievementData.isSecret;
                try {
                    await achievementRepository
                        .createQueryBuilder()
                        .insert()
                        .into(Achievement_1.Achievement)
                        .values({
                        name: achievement.name,
                        description: achievement.description,
                        category: achievement.category,
                        tier: achievement.tier,
                        points: achievement.points,
                        icon: achievement.icon,
                        criteriaType: achievement.criteriaType,
                        criteriaDescription: achievement.criteriaDescription,
                        progress: achievement.progress,
                        progressRules: achievement.progressRules,
                        isTemplate: achievement.isTemplate,
                        isActive: achievement.isActive,
                        isSecret: achievement.isSecret,
                        isUnlocked: false,
                        unlockedAt: undefined,
                        expiresAt: undefined
                    })
                        .execute();
                    logger_1.default.info(`Created achievement: ${achievement.name}`);
                }
                catch (saveError) {
                    logger_1.default.error(`Error saving achievement ${achievementData.name}:`, {
                        error: saveError instanceof Error ? saveError.message : 'Unknown error',
                        stack: saveError instanceof Error ? saveError.stack : undefined
                    });
                }
            }
            catch (error) {
                logger_1.default.error(`Error processing achievement ${achievementData.name}:`, error);
            }
        }
        logger_1.default.info(`Successfully seeded ${achievementsData.length} achievements`);
    }
    catch (error) {
        logger_1.default.error('Error seeding achievements:', error);
        throw error;
    }
}
//# sourceMappingURL=seedAchievements.js.map