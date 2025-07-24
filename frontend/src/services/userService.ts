import axios from 'axios';
import api from './api';
import { User } from '../types/user';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Type for user profile response from API
export interface UserProfileResponse {
  user: User;
  stats: UserStats;
  fitnessGoals: any[];
  bodyMetrics: any[];
  favoriteWorkouts: any[];
  recentActivities: any[];
  achievements: any[];
}

// Structure for user progress data
export interface UserProgress {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  weeklyGoalProgress: number;
  weeklyGoal: number;
  level: number;
}

// Type for activity item
export interface ActivityItem {
  id: string | number;
  type: string;
  date: Date;
  details: any;
}

// Structure for user statistics
export interface UserStats {
  lastWorkoutDate?: Date;
  currentWeight?: number;
  startingWeight?: number;
  weightUnit?: string;
  weightHistory?: {
    date: Date;
    weight: number;
  }[];
}

export const userService = {
  /**
   * Get the current user's profile with all related data
   */
  getUserProfile: async (): Promise<UserProfileResponse | null> => {
    try {
      // Add stronger cache-busting parameters
      const timestamp = new Date().getTime();
      const uniqueId = Math.random().toString(36).substring(2, 15);
      // Use the original endpoint with enhanced cache-busting
      const response = await api.get(`/api/users/profile?_t=${timestamp}&_u=${uniqueId}&_nocache=true`);
      console.log(`Fetching profile with timestamp: ${timestamp}, uniqueId: ${uniqueId}`);
      const profileData = response.data.data;
      
      // Convert string dates to Date objects
      if (profileData.stats?.lastWorkoutDate) {
        profileData.stats.lastWorkoutDate = new Date(profileData.stats.lastWorkoutDate);
      }
      
      if (profileData.recentActivities?.length) {
        profileData.recentActivities = profileData.recentActivities.map((activity: any) => ({
          ...activity,
          date: new Date(activity.createdAt || activity.date)
        }));
      }
      
      return profileData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  /**
   * Get the user's progress data
   */
  getUserProgress: async (): Promise<UserProgress | null> => {
    try {
      const response = await api.get('/api/users/progress');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      // Return mock data as fallback
      return {
        currentStreak: 3,
        longestStreak: 5,
        totalWorkouts: 12,
        weeklyGoalProgress: 3,
        weeklyGoal: 5,
        level: 2
      };
    }
  },

  /**
   * Get recent activity for the user
   */
  getRecentActivity: async (limit: number = 5): Promise<ActivityItem[]> => {
    try {
      const response = await api.get('/api/users/activity', {
        params: { limit }
      });
      
      // Handle the response data structure
      const activityData = response.data?.data || [];
      
      // Convert string dates to Date objects
      return activityData.map((item: any) => ({
        ...item,
        date: new Date(item.timestamp || item.date)
      }));
    } catch (error) {
      console.error('Error fetching user activity:', error);
      // Return mock data as fallback
      return [
        { 
          id: 1, 
          type: 'workout_completed', 
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), 
          details: { 
            name: 'Full Body Strength', 
            duration: 45, 
            caloriesBurned: 320 
          } 
        },
        { 
          id: 2, 
          type: 'achievement_unlocked', 
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 
          details: { 
            name: 'Early Riser', 
            description: 'Complete 5 workouts before 8 AM' 
          } 
        },
        { 
          id: 3, 
          type: 'progress_update', 
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
          details: { 
            metric: 'weight', 
            value: 168, 
            change: -2 
          } 
        }
      ];
    }
  },

  /**
   * Get user workout statistics
   */
  getUserStats: async (): Promise<UserStats | null> => {
    try {
      const response = await api.get('/api/users/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      
      // Return mock/fallback data for now
      return {
        totalWorkouts: 12,
        totalExercises: 148,
        totalDuration: 720, // 12 hours
        averageRating: 4.2,
        favoriteCategory: 'Strength',
        streakDays: 3
      } as any;
    }
  },
  
  /**
   * Update user profile data
   */
  updateProfile: async (profileData: Partial<User>): Promise<User | null> => {
    try {
      const response = await api.put('/api/users/profile', profileData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  },

  /**
   * Get user's favorite workouts
   */
  getFavoriteWorkouts: async (): Promise<any[]> => {
    try {
      const response = await api.get('/api/users/favorites/workouts');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching favorite workouts:', error);
      return [];
    }
  },

  /**
   * Toggle a workout as favorite/unfavorite
   * @param workoutId ID of the workout to toggle
   * @param isFavorite Whether to add (true) or remove (false) from favorites
   * @returns Success status
   */
  toggleFavoriteWorkout: async (workoutId: string | number, isFavorite: boolean): Promise<boolean> => {
    try {
      const action = isFavorite ? 'add' : 'remove';
      console.log(`Toggle favorite API call: workoutId=${workoutId}, action=${action}`);
      
      const response = await api.post(`/api/users/favorites/workout/${workoutId}`, { action });
      console.log('Toggle favorite API response:', response.data);
      
      // Check for detailed response
      const responseData = response.data.data || {};
      
      // Verify the response indicates the action was performed successfully
      if (responseData.success) {
        if (responseData.action === action && responseData.workoutId == workoutId) {
          console.log(`Successfully ${isFavorite ? 'added to' : 'removed from'} favorites: Workout ${workoutId}`);
          
          // Force a refresh of favorite workouts data
          if (!isFavorite) {
            console.log('Refreshing favorites after removal');
            // We can optionally fetch the latest favorites here to ensure consistency
            await userService.getFavoriteWorkouts();
          }
          
          return true;
        }
      }
      
      // If we get here, something went wrong
      console.error('API returned unexpected result:', response.data);
      return false;
    } catch (error) {
      console.error(`Error ${isFavorite ? 'adding' : 'removing'} workout from favorites:`, error);
      return false;
    }
  }
};

export default userService; 