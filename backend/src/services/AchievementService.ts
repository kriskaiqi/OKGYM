import { AppDataSource } from '../data-source';
import { Achievement, AchievementCategory, AchievementTier } from '../models/Achievement';
import { WorkoutSession } from '../models/WorkoutSession';
import { User } from '../models/User';
import { SessionStatus } from '../models/shared/Enums';
import { Between, LessThan, MoreThan } from 'typeorm';
import logger from '../utils/logger';

/**
 * Service for handling achievements with a lazy-loading approach
 */
export class AchievementService {
  /**
   * Get and check all achievements for a user
   * This uses a lazy-loading approach: achievements are checked when requested
   */
  async getUserAchievements(userId: string): Promise<any[]> {
    try {
      // Get all possible achievements from templates
      const achievementTemplates = await AppDataSource
        .getRepository(Achievement)
        .find({
          where: { isTemplate: true, isActive: true }
        });

      // Get user's stats
      const userStats = await this.getUserStats(userId);
      
      // Check each achievement and add status information
      const processedAchievements = achievementTemplates.map(achievement => {
        const { isUnlocked, progress } = this.checkAchievementStatus(achievement, userStats);
        
        // Get proper icon based on category and tier instead of using DB icon
        const icon = this.getAchievementIcon(achievement.category, achievement.tier);
        
        return {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          tier: achievement.tier,
          points: achievement.points,
          criteriaType: achievement.criteriaType,
          criteriaDescription: achievement.criteriaDescription,
          icon: icon,
          progress: progress,
          isUnlocked: isUnlocked
        };
      });
      
      // Sort achievements: unlocked first, then by category and tier
      processedAchievements.sort((a, b) => {
        // Unlocked first
        if (a.isUnlocked && !b.isUnlocked) return -1;
        if (!a.isUnlocked && b.isUnlocked) return 1;
        
        // Then by category
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        
        // Then by tier (BRONZE -> SILVER -> GOLD -> etc)
        const tierOrder = {
          BRONZE: 1,
          SILVER: 2,
          GOLD: 3,
          PLATINUM: 4,
          DIAMOND: 5,
          MASTER: 6
        };
        
        return tierOrder[a.tier] - tierOrder[b.tier];
      });
      
      return processedAchievements;
    } catch (error) {
      logger.error('Error getting user achievements:', error);
      throw error;
    }
  }
  
  /**
   * Check if an achievement is unlocked based on user stats
   */
  private checkAchievementStatus(achievement: Achievement, userStats: any): { isUnlocked: boolean, progress: any } {
    try {
      const progressRules = typeof achievement.progressRules === 'string'
        ? JSON.parse(achievement.progressRules)
        : achievement.progressRules;
      
      // Default progress structure  
      let progress = {
        current: 0,
        required: 0,
        unit: ''
      };
      
      let isUnlocked = false;
      
      // Check different achievement types
      switch (achievement.category) {
        case AchievementCategory.MILESTONE:
          // Workout completion milestones
          if (progressRules?.workoutsCompleted) {
            const required = progressRules.workoutsCompleted;
            const current = userStats.workoutCount;
            
            progress = {
              current,
              required,
              unit: 'workouts'
            };
            
            isUnlocked = current >= required;
          }
          break;
          
        case AchievementCategory.CONSISTENCY:
          // Workout streak achievements
          if (progressRules?.streakDays) {
            const required = progressRules.streakDays;
            const current = userStats.currentStreak;
            
            progress = {
              current,
              required,
              unit: 'days'
            };
            
            isUnlocked = current >= required;
          }
          break;
          
        case AchievementCategory.PERFORMANCE:
          // Perfect Form Master achievement
          if (progressRules?.perfectFormExercises) {
            const required = progressRules.perfectFormExercises;
            const current = userStats.perfectFormExercises || 0;
            
            progress = {
              current,
              required,
              unit: 'exercises'
            };
            
            isUnlocked = current >= required;
          }
          // Personal Best Breaker achievement
          else if (progressRules?.prCount) {
            const required = progressRules.prCount;
            const current = userStats.prCount || 0;
            
            progress = {
              current,
              required,
              unit: 'PRs'
            };
            
            isUnlocked = current >= required;
          }
          else {
            // Default performance achievement
            progress = {
              current: 0,
              required: 1,
              unit: 'completion'
            };
          }
          break;
          
        case AchievementCategory.IMPROVEMENT:
          // First Body Measurement Goal achievement
          if (progressRules?.measurementGoalReached) {
            const required = progressRules.measurementGoalReached;
            const current = userStats.measurementGoalReached || 0;
            
            progress = {
              current,
              required,
              unit: 'goals'
            };
            
            isUnlocked = current >= required;
          }
          // Weight Loss achievement
          else if (progressRules?.weightLossPercentage) {
            const required = progressRules.weightLossPercentage;
            const current = userStats.weightLossPercentage || 0;
            
            progress = {
              current,
              required,
              unit: 'percent'
            };
            
            isUnlocked = current >= required;
          }
          // Volume increase achievement
          else if (progressRules?.volumeIncrease) {
            const required = progressRules.volumeIncrease;
            const current = userStats.volumeIncrease || 0;
            
            progress = {
              current,
              required,
              unit: 'kg'
            };
            
            isUnlocked = current >= required;
          }
          // For other improvement achievements
          else {
            progress = {
              current: 0,
              required: 1,
              unit: 'completion'
            };
          }
          break;
          
        case AchievementCategory.SPECIAL:
          // All-Rounder achievement
          if (progressRules?.allMuscleGroups) {
            const current = userStats.allRounderCompleted || 0;
            const required = 1; // Completed once
            
            progress = {
              current,
              required,
              unit: 'weeks'
            };
            
            isUnlocked = current >= required;
          }
          // Time-based achievements
          else if (progressRules?.morningWorkouts) {
            // Early Bird achievement - workouts before 8 AM
            const required = progressRules.morningWorkouts;
            const current = userStats.morningWorkouts || 0;
            
            progress = {
              current,
              required,
              unit: 'morning workouts'
            };
            
            isUnlocked = current >= required;
          }
          else if (progressRules?.eveningWorkouts) {
            // Night Owl achievement - workouts after 8 PM
            const required = progressRules.eveningWorkouts;
            const current = userStats.eveningWorkouts || 0;
            
            progress = {
              current,
              required,
              unit: 'evening workouts'
            };
            
            isUnlocked = current >= required;
          }
          else if (progressRules?.weekendWorkouts) {
            // Weekend Warrior achievement - workouts on weekends
            const required = progressRules.weekendWorkouts;
            const current = userStats.weekendWorkouts || 0;
            
            progress = {
              current,
              required,
              unit: 'weekend workouts'
            };
            
            isUnlocked = current >= required;
          }
          else {
            // For other achievement types
            progress = {
              current: 0,
              required: 1,
              unit: 'completion'
            };
          }
          break;
          
        default:
          // For other achievement types
          progress = {
            current: 0,
            required: 1,
            unit: 'completion'
          };
          isUnlocked = false;
      }
      
      return { isUnlocked, progress };
    } catch (error) {
      logger.error('Error checking achievement status:', error);
      return { isUnlocked: false, progress: { current: 0, required: 1, unit: 'completion' } };
    }
  }
  
  /**
   * Get appropriate UI icon based on achievement properties
   */
  private getAchievementIcon(category: AchievementCategory, tier: AchievementTier): string {
    // Map category and tier to appropriate Material UI icon
    switch (category) {
      case AchievementCategory.MILESTONE:
        switch (tier) {
          case AchievementTier.BRONZE: return 'EmojiEvents';
          case AchievementTier.SILVER: return 'EmojiEvents';
          case AchievementTier.GOLD: return 'EmojiEvents';
          case AchievementTier.PLATINUM: return 'EmojiEvents';
          default: return 'EmojiEvents';
        }
        
      case AchievementCategory.CONSISTENCY:
        switch (tier) {
          case AchievementTier.BRONZE: return 'LocalFireDepartment';
          case AchievementTier.SILVER: return 'LocalFireDepartment';
          case AchievementTier.GOLD: return 'LocalFireDepartment';
          case AchievementTier.PLATINUM: return 'LocalFireDepartment';
          default: return 'LocalFireDepartment';
        }
        
      case AchievementCategory.PERFORMANCE:
        return 'FitnessCenter';
        
      case AchievementCategory.IMPROVEMENT:
        return 'TrendingUp';
        
      case AchievementCategory.EXPLORER:
        return 'Explore';
        
      case AchievementCategory.CHALLENGE:
        return 'Flag';
        
      case AchievementCategory.SOCIAL:
        return 'People';
        
      case AchievementCategory.SPECIAL:
        return 'Star';
        
      default:
        return 'EmojiEvents';
    }
  }
  
  /**
   * Get user stats needed for achievement calculations
   */
  private async getUserStats(userId: string): Promise<any> {
    try {
      // Get total workout count
      const workoutCount = await AppDataSource
        .getRepository(WorkoutSession)
        .count({
          where: {
            user: { id: userId },
            status: SessionStatus.COMPLETED
          }
        });
      
      // Get workout dates for streak calculation
      const workoutDates = await AppDataSource
        .getRepository(WorkoutSession)
        .find({
          where: {
            user: { id: userId },
            status: SessionStatus.COMPLETED
          },
          select: ['startTime'],
          order: { startTime: 'DESC' }
        });
      
      // Calculate current streak
      const currentStreak = this.calculateStreak(workoutDates);
      
      // Get all completed workouts with time info for time-based achievements
      const completedWorkouts = await AppDataSource
        .getRepository(WorkoutSession)
        .find({
          where: {
            user: { id: userId },
            status: SessionStatus.COMPLETED
          },
          select: ['id', 'startTime', 'endTime', 'exerciseResults', 'workoutPlanId'],
          order: { startTime: 'DESC' }
        });
      
      // Get user data for weight-based achievements
      const user = await AppDataSource
        .getRepository(User)
        .findOne({
          where: { id: userId },
          select: ['stats']
        });
      
      // Calculate weight loss percentage
      let weightLossPercentage = 0;
      
      if (user && user.stats) {
        let stats;
        
        if (typeof user.stats === 'string') {
          try {
            stats = JSON.parse(user.stats);
          } catch (e) {
            logger.error('Error parsing user stats:', e);
            stats = {};
          }
        } else {
          stats = user.stats;
        }
        
        if (stats && stats.startingWeight && stats.currentWeight) {
          const startingWeight = parseFloat(stats.startingWeight);
          const currentWeight = parseFloat(stats.currentWeight);
          
          if (startingWeight > 0 && currentWeight > 0 && startingWeight > currentWeight) {
            weightLossPercentage = ((startingWeight - currentWeight) / startingWeight) * 100;
            weightLossPercentage = Math.round(weightLossPercentage * 10) / 10; // Round to 1 decimal place
          }
        }
      }
      
      // Check if any body measurement goals have been met
      let measurementGoalReached = 0;
      
      try {
        // Check if any body metrics have a target value that has been met
        const bodyMetricsWithTargets = await AppDataSource
          .getRepository('body_metrics')
          .createQueryBuilder('bm')
          .where('bm.user_id = :userId', { userId })
          .andWhere('bm.target_value IS NOT NULL')
          .getMany();
        
        if (bodyMetricsWithTargets && bodyMetricsWithTargets.length > 0) {
          // Check each metric to see if target is met
          for (const metric of bodyMetricsWithTargets) {
            // For metrics where lower is better (like weight loss)
            if (metric.desired_trend === 'DECREASING' && metric.value <= metric.target_value) {
              measurementGoalReached = 1;
              break;
            }
            // For metrics where higher is better (like muscle gains)
            else if (metric.desired_trend !== 'DECREASING' && metric.value >= metric.target_value) {
              measurementGoalReached = 1;
              break;
            }
          }
        }
      } catch (error) {
        logger.error('Error checking body measurement goals:', error);
        // Continue without failing the whole process
      }
      
      // Count morning workouts (before 8 AM)
      const morningWorkouts = completedWorkouts.filter(workout => {
        // Use startTime to determine if it's a morning workout
        if (!workout.startTime) return false;
        const workoutHour = new Date(workout.startTime).getHours();
        return workoutHour < 8; // Before 8 AM
      }).length;
      
      // Count evening workouts (after 8 PM)
      const eveningWorkouts = completedWorkouts.filter(workout => {
        // Use startTime to determine if it's an evening workout
        if (!workout.startTime) return false;
        const workoutHour = new Date(workout.startTime).getHours();
        return workoutHour >= 20; // 8 PM or later (20:00 or later in 24-hour time)
      }).length;
      
      // Count weekend workouts (Saturday or Sunday)
      const weekendWorkouts = completedWorkouts.filter(workout => {
        // Use startTime to determine if it's a weekend workout
        if (!workout.startTime) return false;
        const workoutDay = new Date(workout.startTime).getDay();
        return workoutDay === 0 || workoutDay === 6; // 0 is Sunday, 6 is Saturday
      }).length;
      
      // For Perfect Form Master: Count exercises with perfect form scores (8 or higher)
      let perfectFormExercises = new Set();
      
      // For Personal Best Breaker: Count exercises with personal records
      let prCount = 0;
      
      // For Volume Increase: Track total volume change
      let totalVolumeIncrease = 0;
      let currentTotalVolume = 0;
      let initialTotalVolume = 0;
      
      // Process workout exercise results for form scores, PRs, and volume
      let exerciseMaxWeights = new Map(); // Track max weight by exercise
      let exercisePerfectForm = new Set(); // Track exercises with perfect form
      
      // For All-Rounder: Track muscle groups trained within a week
      let allRounderAchieved = false;
      
      // Track all the workout plans for these sessions
      const workoutPlanIds = completedWorkouts.map(workout => workout.workoutPlanId);
      
      // Get all workout plans with exercises for muscle group information
      const workoutPlans = await AppDataSource
        .getRepository('workout_plans')
        .createQueryBuilder('wp')
        .leftJoinAndSelect('workout_exercises', 'we', 'we.workout_plan_id = wp.id')
        .leftJoinAndSelect('exercises', 'e', 'we.exercise_id = e.id')
        .where('wp.id IN (:...ids)', { ids: workoutPlanIds })
        .getRawMany();
      
      // Create a map of workout plan IDs to muscle groups they target
      const planMuscleGroupsMap = new Map();
      
      for (const plan of workoutPlans) {
        if (!plan.e_target_muscle_groups) continue;
        
        const planId = plan.wp_id;
        if (!planMuscleGroupsMap.has(planId)) {
          planMuscleGroupsMap.set(planId, new Set());
        }
        
        // Extract muscle groups - they could be stored in different formats
        let muscleGroups;
        try {
          if (typeof plan.e_target_muscle_groups === 'string') {
            // Handle string format, which could be a comma-separated list or JSON string
            if (plan.e_target_muscle_groups.startsWith('[')) {
              muscleGroups = JSON.parse(plan.e_target_muscle_groups);
            } else {
              muscleGroups = plan.e_target_muscle_groups.split(',').map(mg => mg.trim());
            }
          } else if (Array.isArray(plan.e_target_muscle_groups)) {
            muscleGroups = plan.e_target_muscle_groups;
          }
        } catch (e) {
          // If parsing fails, just try to use it as is
          muscleGroups = [plan.e_target_muscle_groups];
        }
        
        // Add muscle groups to the set for this plan
        if (muscleGroups && Array.isArray(muscleGroups)) {
          for (const mg of muscleGroups) {
            planMuscleGroupsMap.get(planId).add(mg);
          }
        }
      }
      
      // Group workouts by week (using startTime)
      const workoutsByWeek = new Map();
      
      for (const workout of completedWorkouts) {
        if (!workout.startTime) continue;
        
        // Get the week number for this workout
        const date = new Date(workout.startTime);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Set to previous Sunday
        weekStart.setHours(0, 0, 0, 0);
        
        const weekKey = weekStart.toISOString();
        
        if (!workoutsByWeek.has(weekKey)) {
          workoutsByWeek.set(weekKey, []);
        }
        
        workoutsByWeek.get(weekKey).push(workout);
      }
      
      // Check each week if all major muscle groups were trained
      const majorMuscleGroups = [
        'CHEST', 'BACK', 'SHOULDERS', 'LEGS', 'BICEPS', 'TRICEPS', 'CORE'
      ];
      
      // For each week, check if all major muscle groups were trained
      for (const [week, weekWorkouts] of workoutsByWeek.entries()) {
        const trainedMuscleGroups = new Set();
        
        for (const workout of weekWorkouts) {
          // Get the muscle groups for this workout's plan
          const planMuscleGroups = planMuscleGroupsMap.get(workout.workoutPlanId);
          if (planMuscleGroups) {
            for (const mg of planMuscleGroups) {
              trainedMuscleGroups.add(mg.toUpperCase());
            }
          }
        }
        
        // Check if all major muscle groups were trained this week
        const allGroupsTrained = majorMuscleGroups.every(mg => 
          trainedMuscleGroups.has(mg) ||
          // Special case for legs - count if any leg muscle was trained
          (mg === 'LEGS' && (
            trainedMuscleGroups.has('QUADRICEPS') || 
            trainedMuscleGroups.has('HAMSTRINGS') || 
            trainedMuscleGroups.has('CALVES') ||
            trainedMuscleGroups.has('GLUTES')
          ))
        );
        
        if (allGroupsTrained) {
          allRounderAchieved = true;
          break; // Found a week with all muscle groups trained
        }
      }
      
      // Process workouts starting from oldest to newest for proper volume tracking
      const orderedWorkouts = [...completedWorkouts].reverse();
      
      for (const workout of orderedWorkouts) {
        let exerciseResults = {};
        try {
          // Parse exercise results if available
          if (workout.exerciseResults) {
            if (typeof workout.exerciseResults === 'string') {
              exerciseResults = JSON.parse(workout.exerciseResults);
            } else {
              exerciseResults = workout.exerciseResults;
            }
          }
          
          // Loop through all exercises in this workout
          for (const [exerciseId, result] of Object.entries(exerciseResults)) {
            const exerciseResult = result as any;
            
            if (exerciseResult && exerciseResult.attempts && Array.isArray(exerciseResult.attempts)) {
              // Check for personal bests (weight or reps increases)
              if (exerciseResult.bestResult) {
                const currentBest = exerciseResult.bestResult;
                
                // Calculate volume for this exercise (weight × reps)
                const currentExerciseVolume = 
                  (currentBest.weight || 0) * (currentBest.reps || 0);
                  
                // Update total current volume
                currentTotalVolume += currentExerciseVolume;
                
                // Check if we've seen this exercise before
                if (exerciseMaxWeights.has(exerciseId)) {
                  const prevBest = exerciseMaxWeights.get(exerciseId);
                  const prevVolume = (prevBest.weight || 0) * (prevBest.reps || 0);
                  
                  // If current is better than previous, count as PR
                  if (currentExerciseVolume > prevVolume) {
                    // This is a new PR
                    if (!prevBest.prRecorded) {
                      prCount++;
                      // Mark that we've recorded a PR for this exercise
                      currentBest.prRecorded = true;
                    }
                  }
                } else {
                  // First time seeing this exercise
                  initialTotalVolume += currentExerciseVolume;
                }
                
                // Update max weights map with latest best
                exerciseMaxWeights.set(exerciseId, currentBest);
              }
              
              // Check for perfect form scores
              for (const attempt of exerciseResult.attempts) {
                // Consider form score 8 or higher as "perfect" (form scores are on scale of 0-10)
                if (attempt.formScore && attempt.formScore >= 8) {
                  exercisePerfectForm.add(exerciseId);
                }
              }
            }
          }
        } catch (error) {
          logger.error('Error parsing exercise results for achievement stats:', error);
        }
      }
      
      // Count unique exercises with perfect form
      perfectFormExercises = exercisePerfectForm;
      
      // Calculate total volume increase
      totalVolumeIncrease = Math.max(0, currentTotalVolume - initialTotalVolume);
      
      // Convert from raw kg to kg (for display purposes)
      const volumeIncreaseKg = Math.floor(totalVolumeIncrease);
      
      return {
        workoutCount,
        currentStreak,
        morningWorkouts,
        eveningWorkouts,
        weekendWorkouts,
        perfectFormExercises: perfectFormExercises.size,
        prCount,
        volumeIncrease: volumeIncreaseKg,
        allRounderCompleted: allRounderAchieved ? 1 : 0,
        weightLossPercentage,
        measurementGoalReached
      };
    } catch (error) {
      logger.error('Error getting user stats for achievements:', error);
      return {
        workoutCount: 0,
        currentStreak: 0,
        morningWorkouts: 0,
        eveningWorkouts: 0,
        weekendWorkouts: 0,
        perfectFormExercises: 0,
        prCount: 0,
        volumeIncrease: 0,
        allRounderCompleted: 0,
        weightLossPercentage: 0,
        measurementGoalReached: 0
      };
    }
  }
  
  /**
   * Calculate workout streak based on workout dates
   */
  private calculateStreak(workoutDates: WorkoutSession[]): number {
    if (!workoutDates || workoutDates.length === 0) {
      return 0;
    }
    
    // Get unique dates (in case there are multiple workouts per day)
    const uniqueDates = new Set<string>();
    workoutDates.forEach(session => {
      if (session.startTime) {
        const dateStr = new Date(session.startTime).toISOString().split('T')[0];
        uniqueDates.add(dateStr);
      }
    });
    
    // Convert unique dates to array and sort
    const sortedDates = Array.from(uniqueDates).sort().map(d => new Date(d));
    
    // Calculate streak based on consecutive days
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If most recent workout is not today or yesterday, streak is broken
    const mostRecent = sortedDates[sortedDates.length - 1];
    const timeDiff = today.getTime() - mostRecent.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff > 1) {
      return 0; // Streak is broken
    }
    
    // Count consecutive days
    for (let i = sortedDates.length - 1; i > 0; i--) {
      const currentDate = sortedDates[i];
      const prevDate = sortedDates[i - 1];
      
      const dayDiff = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24)
      );
      
      if (dayDiff === 1) {
        streak++;
      } else {
        break; // Streak is broken
      }
    }
    
    return streak;
  }
}

export const achievementService = new AchievementService(); 