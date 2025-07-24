import { Achievement, AchievementCategory, AchievementTier, AchievementCriteriaType } from '../models/Achievement';
import { AppDataSource } from '../data-source';
import logger from '../utils/logger';

/**
 * Seed the database with user achievements for tracking accomplishments
 */
export async function seedAchievements(): Promise<void> {
  try {
    const achievementRepository = AppDataSource.getRepository(Achievement);
    
    // Check if we already have achievements
    const existingCount = await achievementRepository.count();
    if (existingCount > 0) {
      logger.info(`Database already has ${existingCount} achievements. Skipping seed.`);
      return;
    }
    
    // Create achievements data
    const achievementsData = [
      // Workout Completion Achievements
      {
        name: 'First Workout Complete',
        description: 'Completed your first workout. This is the beginning of your fitness journey!',
        category: AchievementCategory.MILESTONE,
        tier: AchievementTier.BRONZE,
        points: 10,
        icon: 'emoji_events',
        criteriaType: AchievementCriteriaType.COUNT,
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
        category: AchievementCategory.MILESTONE,
        tier: AchievementTier.BRONZE,
        points: 25,
        icon: 'emoji_events',
        criteriaType: AchievementCriteriaType.COUNT,
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
        category: AchievementCategory.MILESTONE,
        tier: AchievementTier.SILVER,
        points: 100,
        icon: 'emoji_events',
        criteriaType: AchievementCriteriaType.COUNT,
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
        category: AchievementCategory.MILESTONE,
        tier: AchievementTier.GOLD,
        points: 250,
        icon: 'emoji_events',
        criteriaType: AchievementCriteriaType.COUNT,
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
        category: AchievementCategory.MILESTONE,
        tier: AchievementTier.PLATINUM,
        points: 500,
        icon: 'emoji_events',
        criteriaType: AchievementCriteriaType.COUNT,
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
      
      // Streak-based Achievements
      {
        name: '3-Day Streak',
        description: 'Completed workouts for 3 consecutive days. Building momentum!',
        category: AchievementCategory.CONSISTENCY,
        tier: AchievementTier.BRONZE,
        points: 15,
        icon: 'local_fire_department',
        criteriaType: AchievementCriteriaType.STREAK,
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
        category: AchievementCategory.CONSISTENCY,
        tier: AchievementTier.BRONZE,
        points: 50,
        icon: 'local_fire_department',
        criteriaType: AchievementCriteriaType.STREAK,
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
        category: AchievementCategory.CONSISTENCY,
        tier: AchievementTier.SILVER,
        points: 100,
        icon: 'local_fire_department',
        criteriaType: AchievementCriteriaType.STREAK,
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
        category: AchievementCategory.CONSISTENCY,
        tier: AchievementTier.GOLD,
        points: 250,
        icon: 'local_fire_department',
        criteriaType: AchievementCriteriaType.STREAK,
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
        category: AchievementCategory.CONSISTENCY,
        tier: AchievementTier.PLATINUM,
        points: 500,
        icon: 'local_fire_department',
        criteriaType: AchievementCriteriaType.STREAK,
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
      
      // Progress-based Achievements
      {
        name: '5% Weight Loss',
        description: 'Lost 5% of your initial body weight. Your hard work is paying off!',
        category: AchievementCategory.IMPROVEMENT,
        tier: AchievementTier.SILVER,
        points: 100,
        icon: 'trending_down',
        criteriaType: AchievementCriteriaType.PERCENTAGE,
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
        category: AchievementCategory.IMPROVEMENT,
        tier: AchievementTier.SILVER,
        points: 75,
        icon: 'fitness_center',
        criteriaType: AchievementCriteriaType.THRESHOLD,
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
        category: AchievementCategory.IMPROVEMENT,
        tier: AchievementTier.SILVER,
        points: 75,
        icon: 'straighten',
        criteriaType: AchievementCriteriaType.COMPLETION,
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
        category: AchievementCategory.PERFORMANCE,
        tier: AchievementTier.GOLD,
        points: 100,
        icon: 'analytics',
        criteriaType: AchievementCriteriaType.COUNT,
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
        category: AchievementCategory.PERFORMANCE,
        tier: AchievementTier.SILVER,
        points: 80,
        icon: 'leaderboard',
        criteriaType: AchievementCriteriaType.COUNT,
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
      
      // Special Achievements
      {
        name: 'Early Bird',
        description: 'Completed 5 workouts before 8 AM. Rise and grind!',
        category: AchievementCategory.SPECIAL,
        tier: AchievementTier.BRONZE,
        points: 50,
        icon: 'wb_sunny',
        criteriaType: AchievementCriteriaType.COUNT,
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
        category: AchievementCategory.SPECIAL,
        tier: AchievementTier.BRONZE,
        points: 50,
        icon: 'nightlight',
        criteriaType: AchievementCriteriaType.COUNT,
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
        category: AchievementCategory.SPECIAL,
        tier: AchievementTier.SILVER,
        points: 75,
        icon: 'weekend',
        criteriaType: AchievementCriteriaType.COUNT,
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
        category: AchievementCategory.MILESTONE,
        tier: AchievementTier.GOLD,
        points: 150,
        icon: 'assignment_turned_in',
        criteriaType: AchievementCriteriaType.COMPLETION,
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
        category: AchievementCategory.SPECIAL,
        tier: AchievementTier.GOLD,
        points: 100,
        icon: 'sports_gymnastics',
        criteriaType: AchievementCriteriaType.COMPLETION,
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
    
    // Save achievements to the database
    for (const achievementData of achievementsData) {
      try {
        // Create a clean achievement object with only the basic properties
        // This avoids issues with entity relationships
        const achievement = new Achievement();
        
        // Only assign scalar properties, not relationships
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
        
        // Use QueryBuilder to insert without loading relations
        try {
          await achievementRepository
            .createQueryBuilder()
            .insert()
            .into(Achievement)
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
              // No need to provide workoutSessionId since it's now nullable
              isUnlocked: false,
              unlockedAt: undefined,
              expiresAt: undefined
            })
            .execute();
          
          logger.info(`Created achievement: ${achievement.name}`);
        } catch (saveError) {
          logger.error(`Error saving achievement ${achievementData.name}:`, {
            error: saveError instanceof Error ? saveError.message : 'Unknown error',
            stack: saveError instanceof Error ? saveError.stack : undefined
          });
          // Continue to next achievement instead of failing the entire process
        }
      } catch (error) {
        logger.error(`Error processing achievement ${achievementData.name}:`, error);
        // Continue to next achievement instead of failing the entire process
      }
    }
    
    logger.info(`Successfully seeded ${achievementsData.length} achievements`);
  } catch (error) {
    logger.error('Error seeding achievements:', error);
    throw error;
  }
} 