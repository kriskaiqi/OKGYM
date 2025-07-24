import api from './api';
import { workoutService } from './workoutService';
import { userService } from './userService';
import { WorkoutPlan, WorkoutSortOption } from '../types/workout';
import { UserProgress } from './userService';

export interface DashboardData {
  recentWorkouts: any[];
  recommendedWorkouts: any[];
  achievements: any[];
  goals: any[];
  metrics: any[];
  notifications: any[];
  weeklyActivity: number[];
  stats: {
    totalWorkouts: number;
    totalDuration: number;
    averageDuration: number;
    totalCaloriesBurned: number;
    averageCaloriesBurned: number;
  };
}

export const dashboardService = {
  /**
   * Fetch all dashboard data in a single call
   */
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      console.log('Making API request to /api/dashboard');
      // Try to get data from dedicated dashboard endpoint
      const response = await api.get('/api/dashboard');
      console.log('Raw API response:', response.data);
      
      // Transform the data to ensure ID compatibility
      const transformed = {
        ...response.data,
        // Ensure both number and UUID string IDs are handled properly
        recentWorkouts: response.data.recentWorkouts?.map((workout: any) => {
          if (workout.workoutPlan) {
            // Ensure workoutPlan.id is properly handled regardless of type
            return {
              ...workout,
              workoutPlan: {
                ...workout.workoutPlan,
                // Convert ID to string if it's not already
                id: String(workout.workoutPlan.id)
              }
            };
          }
          return workout;
        }) || [],
        // Apply similar transformation to recommended workouts
        recommendedWorkouts: response.data.recommendedWorkouts?.map((workout: any) => {
          if (workout.workoutPlan) {
            return {
              ...workout,
              workoutPlan: {
                ...workout.workoutPlan,
                id: String(workout.workoutPlan.id)
              }
            };
          }
          return workout;
        }) || []
      };
      
      return transformed;
    } catch (error) {
      console.error('Error fetching dashboard data, using fallback methods:', error);
      
      // Fallback: fetch data from individual services
      return dashboardService.getDashboardDataFallback();
    }
  },
  
  /**
   * Fallback method to get dashboard data from individual services
   */
  getDashboardDataFallback: async (): Promise<DashboardData> => {
    try {
      // Get recent workouts (completed by the user)
      const recentWorkoutsPromise = workoutService.getWorkoutPlans({ 
        limit: 5,
        sortBy: WorkoutSortOption.NEWEST,
        sortOrder: 'DESC'
      }).catch(err => {
        console.warn('Error fetching recent workouts:', err);
        return { data: [], total: 0 };
      });
      
      // Get recommended workouts
      const recommendedWorkoutsPromise = workoutService.getWorkoutPlans({
        sortBy: WorkoutSortOption.POPULARITY,
        sortOrder: 'DESC',
        limit: 4
      }).catch(err => {
        console.warn('Error fetching recommended workouts:', err);
        return { data: [], total: 0 };
      });
      
      // Get user progress
      const userProgressPromise = userService.getUserProgress()
        .catch(err => {
          console.warn('Error fetching user progress:', err);
          return { totalWorkouts: 0, streak: 0, completionRate: 0 };
        });
      
      // Get recent activity
      const recentActivityPromise = userService.getRecentActivity(5)
        .catch(err => {
          console.warn('Error fetching recent activity:', err);
          return { daily: Array(7).fill(0) };
        });
      
      // Wait for all promises to resolve
      const [
        recentWorkoutsData,
        recommendedWorkoutsData,
        userProgressData,
        recentActivity
      ] = await Promise.all([
        recentWorkoutsPromise,
        recommendedWorkoutsPromise,
        userProgressPromise,
        recentActivityPromise
      ]);
      
      // Set up weekly activity data with defaults if not available
      // Handle both possible return types from recentActivity
      const weeklyActivity = Array.isArray(recentActivity) 
        ? Array(7).fill(0) // Default if it's an array without daily property
        : recentActivity?.daily || Array(7).fill(0);
      
      // Ensure workout IDs are always handled as strings
      const recentWorkouts = recentWorkoutsData.data?.map((workout: any) => ({
        ...workout,
        // Convert ID to string if it's not already
        id: String(workout.id)
      })) || [];
      
      const recommendedWorkouts = recommendedWorkoutsData.data?.map((workout: any) => ({
        ...workout,
        // Convert ID to string if it's not already
        id: String(workout.id)
      })) || [];
      
      return {
        recentWorkouts,
        recommendedWorkouts,
        achievements: [],
        goals: [],
        metrics: [],
        notifications: [],
        weeklyActivity,
        stats: {
          totalWorkouts: userProgressData?.totalWorkouts || 0,
          // Use safe defaults for properties that might not exist on UserProgress
          totalDuration: (userProgressData as any)?.totalDuration || 0,
          averageDuration: (userProgressData as any)?.averageDuration || 0,
          totalCaloriesBurned: (userProgressData as any)?.totalCaloriesBurned || 0,
          averageCaloriesBurned: (userProgressData as any)?.averageCaloriesBurned || 0
        }
      };
    } catch (error) {
      console.error('Error in fallback dashboard data fetching:', error);
      
      // Return empty data as last resort
      return {
        recentWorkouts: [],
        recommendedWorkouts: [],
        achievements: [],
        goals: [],
        metrics: [],
        notifications: [],
        weeklyActivity: Array(7).fill(0),
        stats: {
          totalWorkouts: 0,
          totalDuration: 0,
          averageDuration: 0,
          totalCaloriesBurned: 0,
          averageCaloriesBurned: 0
        }
      };
    }
  }
};

export default dashboardService; 