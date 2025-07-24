import axios from 'axios';
import api from './api'; // Import the configured api instance with interceptors
import { 
  WorkoutPlan, 
  WorkoutPlanFilterOptions, 
  CreateWorkoutPlanRequest, 
  WorkoutProgress,
  WorkoutCategory 
} from '../types/workout';
import { ApiResponse, PaginatedResponse } from '../types/api';
import { getWorkoutImageUrl as getImageUrlUtil, getImageUrl } from '../utils/imageUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Type for workout plan ID (can be number or string UUID)
 */
export type WorkoutPlanId = string | number;

/**
 * Media item interface
 */
interface MediaItem {
  id: string;
  uuid?: string;
  type: string;
  url: string;
  thumbnailUrl: string | null;
  isPrimary: boolean;
  displayOrder: number;
  entityType: string;
  entityStringId: string;
}

/**
 * Generate placeholder image URL based on workout category
 */
const getWorkoutImageUrl = (category: WorkoutCategory, media?: MediaItem[], workoutId?: WorkoutPlanId): string => {
  // First try to use the utility function with media if available
  if (media && media.length > 0) {
    return getImageUrlUtil(category.toString(), media, workoutId);
  }
  
  // Just use the placeholder image for all categories
  // This avoids 404 errors for missing category images
  return '/static/images/workouts/placeholder.jpg';
};

/**
 * Normalize media data to ensure consistent structure
 */
const normalizeMediaData = (rawMedia: any[] | undefined, entityId: string): MediaItem[] => {
  if (!rawMedia || !Array.isArray(rawMedia) || rawMedia.length === 0) {
    return [];
  }
  
  console.log('Normalizing workout media data:', rawMedia);
  
  // Map media items to a consistent structure
  return rawMedia.map((item: any) => ({
    id: item.id || item.uuid || '',
    uuid: item.uuid || item.id || '',  // Include uuid for better matching
    type: item.type || '',
    url: item.url || '',
    thumbnailUrl: item.thumbnailUrl || null,
    isPrimary: item.isPrimary === true,
    displayOrder: item.displayOrder || 0,
    entityType: item.entityType || 'workout',
    entityStringId: item.entityStringId || entityId
  }));
};

/**
 * Normalize exercise data for consistent structure
 */
const normalizeExerciseData = (exercise: any) => {
  if (!exercise) return null;
  
  // Ensure basic properties exist
  const normalizedExercise = {
    ...exercise,
    id: exercise.id || null,
    name: exercise.name || 'Unknown Exercise',
    description: exercise.description || '',
    // Handle various array properties
    muscleGroups: Array.isArray(exercise.muscleGroups) 
      ? exercise.muscleGroups 
      : (typeof exercise.muscleGroups === 'string' ? [exercise.muscleGroups] : []),
    equipment: Array.isArray(exercise.equipment) 
      ? exercise.equipment 
      : (typeof exercise.equipment === 'string' ? [exercise.equipment] : []),
    instructions: Array.isArray(exercise.instructions) 
      ? exercise.instructions 
      : (typeof exercise.instructions === 'string' ? [exercise.instructions] : [])
  };
  
  return normalizedExercise;
};

/**
 * Normalize a workout plan to ensure consistent structure
 */
const normalizeWorkoutPlan = (workoutPlan: any): WorkoutPlan => {
  if (!workoutPlan) {
    console.warn('Null or undefined workout plan passed to normalizer');
    return {
      id: '',
      name: 'Unknown Workout',
      description: '',
      difficulty: 'BEGINNER',
      workoutCategory: WorkoutCategory.CUSTOM,
      exercises: [],
      estimatedDuration: 0,
      isCustom: true,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: '',
      imageUrl: getWorkoutImageUrl(WorkoutCategory.CUSTOM),  // No workout ID for default
      media: [],
      popularity: 0,
      estimatedCaloriesBurn: 0,
      severity: 'LOW'
    } as unknown as WorkoutPlan;
  }
  
  console.log('Normalizing workout plan:', workoutPlan);
  
  // Process media data from the API
  let imageUrl = workoutPlan.imageUrl;
  let videoUrl = workoutPlan.videoUrl;
  let media: MediaItem[] = workoutPlan.media || [];
  
  // If we have direct media objects from the database
  if (Array.isArray(media) && media.length > 0) {
    console.log('Processing workout media data:', media);
    
    // Normalize media array to ensure consistent structure - matching equipment approach
    media = media.map((item: any) => ({
      id: item.id || item.uuid || '',
      uuid: item.uuid || item.id || '',  // Include uuid for better matching
      type: item.type || '',
      url: item.url || '',
      thumbnailUrl: item.thumbnailUrl || null,
      isPrimary: item.isPrimary === true,
      displayOrder: item.displayOrder || 0,
      entityType: item.entityType || 'workout',
      entityStringId: item.entityStringId || workoutPlan.id || ''
    }));
    
    // Find primary image or first image - exact same logic as equipment
    const primaryImage = media.find((m: MediaItem) => m.type === 'IMAGE' && m.isPrimary === true) ||
                        media.find((m: MediaItem) => m.type === 'IMAGE');
    
    // Find primary video or first video
    const primaryVideo = media.find((m: MediaItem) => m.type === 'VIDEO' && m.isPrimary === true) ||
                        media.find((m: MediaItem) => m.type === 'VIDEO');
    
    // Use the URLs directly from the media objects
    if (primaryImage && primaryImage.url) {
      imageUrl = primaryImage.url;
      console.log('Using image URL from workout media:', imageUrl);
    }
    
    if (primaryVideo && primaryVideo.url) {
      videoUrl = primaryVideo.url;
      console.log('Using video URL from workout media:', videoUrl);
    }
  } else if (workoutPlan.image && workoutPlan.image.url) {
    // Handle nested image object like equipment does
    imageUrl = workoutPlan.image.url;
    console.log('Using image URL from nested workout image object:', imageUrl);
    
    // Create media item from image object
    media.push({
      id: workoutPlan.image.id || '',
      uuid: workoutPlan.image.uuid || workoutPlan.image.id || '',
      type: 'IMAGE',
      url: workoutPlan.image.url,
      thumbnailUrl: null,
      isPrimary: true,
      displayOrder: 1,
      entityType: 'workout',
      entityStringId: workoutPlan.id || ''
    });
  }
  
  if (workoutPlan.video && workoutPlan.video.url) {
    videoUrl = workoutPlan.video.url;
    console.log('Using video URL from nested workout video object:', videoUrl);
    
    // Create media item from video object
    media.push({
      id: workoutPlan.video.id || '',
      uuid: workoutPlan.video.uuid || workoutPlan.video.id || '',
      type: 'VIDEO',
      url: workoutPlan.video.url,
      thumbnailUrl: workoutPlan.video.thumbnailUrl || null,
      isPrimary: true,
      displayOrder: 2,
      entityType: 'workout',
      entityStringId: workoutPlan.id
    });
  }
  
  // If still no image URL, use direct name-based path to workout image
  if (!imageUrl) {
    if (workoutPlan.name) {
      // Try name-based approach first
      const filename = workoutPlan.name.toLowerCase().replace(/\s+/g, '-');
      imageUrl = `/static/workouts/images/${filename}.jpg`;
      console.log(`Using name-based image for workout: ${imageUrl}`);
    } else {
      // If no name, fall back to category
      const category = workoutPlan.workoutCategory || WorkoutCategory.CUSTOM;
      imageUrl = getWorkoutImageUrl(category);
      console.log('Using category-based image for workout:', imageUrl);
    }
  } else {
    // Make sure existing URL is properly formatted
    imageUrl = getImageUrl(imageUrl);
  }

  // Normalize the workout plan
  return {
    ...workoutPlan,
    name: workoutPlan.name || 'Unnamed Workout',
    description: workoutPlan.description || 'No description available',
    difficulty: workoutPlan.difficulty || 'BEGINNER',
    estimatedDuration: workoutPlan.estimatedDuration || 0,
    rating: workoutPlan.rating !== undefined ? workoutPlan.rating : null,
    ratingCount: workoutPlan.ratingCount || 0,
    exercises: Array.isArray(workoutPlan.exercises) ? workoutPlan.exercises : [],
    imageUrl,
    videoUrl,
    media
  };
};

/**
 * Service for workout-related API calls
 */
export const workoutService = {
  /**
   * Get all workout plans with filtering options
   */
  getWorkoutPlans: async (filters: WorkoutPlanFilterOptions = {}): Promise<{ data: WorkoutPlan[], total: number }> => {
    try {
      // Ensure correct pagination parameters
      const page = parseInt(String(filters.page || 1), 10);
      const limit = parseInt(String(filters.limit || 9), 10);
      const offset = (page - 1) * limit; // Calculate offset for server-side pagination
      
      // Add cache busting
      const cacheBuster = new Date().getTime();
      
      // Create a clean request object with all parameters explicitly spelled out
      const requestParams = {
        page,
        limit,
        offset, // Add offset for backends that use it
        skip: offset, // Alternative name for offset
        _t: cacheBuster, // Cache busting
        
        // Other filter params
        search: filters.search,
        difficulty: filters.difficulty,
        categoryIds: filters.categoryIds?.join(','),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        isCustom: filters.isCustom
      };
      
      // Make the API call with explicit parameters
      const response = await api.get('/api/workouts', { params: requestParams });
      
      // Handle backend array response in format [plans, count]
      if (Array.isArray(response.data) && response.data.length === 2 && Array.isArray(response.data[0])) {
        const [plans, total] = response.data;
        
        // Normalize each workout plan
        const normalizedData = plans.map((plan: any) => normalizeWorkoutPlan(plan));
        
        return {
          data: normalizedData,
          total: total || normalizedData.length
        };
      }
      
      // Transform backend response format to match what the component expects
      // The backend returns { workoutPlans: [...], total: number }
      // But the component expects { data: [...], total: number }
      if (response.data && response.data.workoutPlans) {
        const data = response.data.workoutPlans.map((plan: any) => normalizeWorkoutPlan(plan));
        
        return {
          data,
          total: response.data.total || data.length
        };
      }
      
      // Handle case where response may already be in the expected format
      if (response.data && Array.isArray(response.data.data)) {
        const data = response.data.data.map((plan: any) => normalizeWorkoutPlan(plan));
        
        return {
          data,
          total: response.data.total || data.length
        };
      }
      
      // Handle case where response might be an array directly (but not [plans, count] format)
      if (Array.isArray(response.data)) {
        // Normalize each workout plan
        const normalizedData = response.data.map((plan: any) => normalizeWorkoutPlan(plan));
        
        return {
          data: normalizedData,
          total: response.data.length
        };
      }
      
      // Default fallback - empty data
      console.warn('Unexpected API response format:', response.data);
      return {
        data: [],
        total: 0
      };
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      // Return empty data on error
      return {
        data: [],
        total: 0
      };
    }
  },

  /**
   * Get a workout plan by ID
   */
  getWorkoutPlanById: async (id: WorkoutPlanId): Promise<WorkoutPlan> => {
    try {
      console.log(`Fetching workout plan with ID: ${id}`);
      const response = await api.get(`/api/workouts/${id}`);
      console.log('Workout plan API response:', response);
      
      if (!response.data) {
        console.error('Empty response when fetching workout plan');
        throw new Error('Empty response when fetching workout');
      }
      
      // Check response format - could be direct or nested in data property
      let workoutPlan = response.data.data ? response.data.data : response.data;
      
      // Normalize the workout plan data
      const normalizedWorkout = normalizeWorkoutPlan(workoutPlan);
      
      // Ensure exercises are properly formatted
      if (normalizedWorkout.exercises) {
        // Log the exercises to debug any issues
        console.log('Response contains exercises:', normalizedWorkout.exercises);
        
        // Validate exercise data structure
        normalizedWorkout.exercises = normalizedWorkout.exercises
          .filter((ex: any) => ex && typeof ex === 'object')
          .map((ex: any) => {
            // Ensure the exercise has required properties or provide defaults
            const exerciseData = {
              ...ex,
              order: typeof ex.order === 'number' ? ex.order : 0,
              sets: ex.sets || 3,
              repetitions: ex.repetitions || 0,
              duration: ex.duration || 0,
              restTime: ex.restTime || 30
            };
            
            // Create/normalize the exercise property if it exists
            if (ex.exercise) {
              exerciseData.exercise = normalizeExerciseData(ex.exercise);
            } else {
              // Try to extract exerciseId from different possible property names
              const exerciseId = (ex as any).exerciseId || (ex as any).exercise_id;
              if (exerciseId) {
                // Create a minimal reference structure
                exerciseData.exercise = { id: exerciseId };
              } else {
                console.warn('Exercise missing required reference ID:', ex);
                exerciseData.exercise = { id: null };
              }
            }
            
            return exerciseData;
          });
          
        console.log('Normalized exercises:', normalizedWorkout.exercises);
      } else {
        console.warn('Workout plan has no exercises array:', normalizedWorkout);
        normalizedWorkout.exercises = [];
      }
      
      return normalizedWorkout;
    } catch (error) {
      console.error('Error fetching workout plan by ID:', error);
      throw error;
    }
  },

  /**
   * Create a new workout plan
   */
  createWorkoutPlan: async (workoutPlan: CreateWorkoutPlanRequest): Promise<WorkoutPlan> => {
    try {
      const response = await api.post('/api/workouts', workoutPlan);
      return response.data;
    } catch (error) {
      console.error('Error creating workout plan:', error);
      throw error;
    }
  },

  /**
   * Update an existing workout plan
   */
  updateWorkoutPlan: async (id: WorkoutPlanId, workoutPlan: Partial<CreateWorkoutPlanRequest>): Promise<WorkoutPlan> => {
    try {
      const response = await api.put(`/api/workouts/${id}`, workoutPlan);
      return response.data;
    } catch (error) {
      console.error('Error updating workout plan:', error);
      throw error;
    }
  },

  /**
   * Delete a workout plan
   */
  deleteWorkoutPlan: async (id: WorkoutPlanId): Promise<boolean> => {
    try {
      await api.delete(`/api/workouts/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      throw error;
    }
  },

  /**
   * Start a workout session
   */
  startWorkout: async (workoutId: WorkoutPlanId): Promise<any> => {
    try {
      // Import here to avoid circular dependency
      const { default: sessionService } = await import('./sessionService');
      
      // Use the sessionService's startSession method which is already set up to handle type differences
      const response = await sessionService.startSession(workoutId);
      return response;
    } catch (error) {
      console.error(`Error starting workout session for plan ID ${workoutId}:`, error);
      throw error;
    }
  },

  /**
   * Complete a workout session
   */
  completeWorkout: async (workoutId: WorkoutPlanId, data: any): Promise<any> => {
    try {
      const response = await api.post(`/api/workouts/${workoutId}/complete`, data);
      return response.data;
    } catch (error) {
      console.error('Error completing workout:', error);
      throw error;
    }
  }
};

/**
 * Service for handling workout-related API requests
 */
export class WorkoutService {
  private baseUrl = '/api/workouts';

  /**
   * Get all workout plans with optional filtering
   * @param filterOptions Filter options for workouts
   * @returns Paginated list of workout plans
   */
  async getWorkoutPlans(filterOptions?: WorkoutPlanFilterOptions): Promise<PaginatedResponse<WorkoutPlan>> {
    try {
      const params = this.buildQueryParams(filterOptions);
      const response = await api.get<ApiResponse<PaginatedResponse<WorkoutPlan>>>(
        this.baseUrl,
        { params }
      );
      return response.data.data || { data: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      throw error;
    }
  }

  /**
   * Get a workout plan by ID
   * @param id Workout plan ID
   * @returns Workout plan details
   */
  async getWorkoutPlanById(id: number): Promise<WorkoutPlan> {
    try {
      const response = await api.get<ApiResponse<WorkoutPlan>>(`${this.baseUrl}/${id}`);
      if (!response.data.data) {
        throw new Error('Workout plan not found');
      }
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching workout plan with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new workout plan
   * @param workoutPlan Workout plan data
   * @returns Created workout plan
   */
  async createWorkoutPlan(workoutPlan: CreateWorkoutPlanRequest): Promise<WorkoutPlan> {
    try {
      const response = await api.post<ApiResponse<WorkoutPlan>>(this.baseUrl, workoutPlan);
      if (!response.data.data) {
        throw new Error('Failed to create workout plan');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error creating workout plan:', error);
      throw error;
    }
  }

  /**
   * Update an existing workout plan
   * @param id Workout plan ID
   * @param workoutPlan Updated workout plan data
   * @returns Updated workout plan
   */
  async updateWorkoutPlan(id: number, workoutPlan: Partial<CreateWorkoutPlanRequest>): Promise<WorkoutPlan> {
    try {
      const response = await api.put<ApiResponse<WorkoutPlan>>(`${this.baseUrl}/${id}`, workoutPlan);
      if (!response.data.data) {
        throw new Error('Failed to update workout plan');
      }
      return response.data.data;
    } catch (error) {
      console.error(`Error updating workout plan with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a workout plan
   * @param id Workout plan ID
   * @returns Success status
   */
  async deleteWorkoutPlan(id: number): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
      return response.data.success;
    } catch (error) {
      console.error(`Error deleting workout plan with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search workout plans by keyword
   * @param searchQuery Search keyword
   * @param filterOptions Additional filter options
   * @returns Paginated list of matching workout plans
   */
  async searchWorkoutPlans(
    searchQuery: string,
    filterOptions?: WorkoutPlanFilterOptions
  ): Promise<PaginatedResponse<WorkoutPlan>> {
    try {
      const params = this.buildQueryParams({
        ...filterOptions,
        search: searchQuery
      });
      
      const response = await api.get<ApiResponse<PaginatedResponse<WorkoutPlan>>>(
        `${this.baseUrl}/search`,
        { params }
      );
      
      return response.data.data || { data: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
      console.error('Error searching workout plans:', error);
      throw error;
    }
  }

  /**
   * Get popular workout plans
   * @param limit Maximum number of plans to return
   * @returns List of popular workout plans
   */
  async getPopularWorkoutPlans(limit: number = 10): Promise<WorkoutPlan[]> {
    try {
      const response = await api.get<ApiResponse<WorkoutPlan[]>>(
        `${this.baseUrl}/popular`,
        { params: { limit } }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching popular workout plans:', error);
      throw error;
    }
  }

  /**
   * Get user's custom workout plans
   * @returns List of user's custom workout plans
   */
  async getUserWorkoutPlans(): Promise<WorkoutPlan[]> {
    try {
      const response = await api.get<ApiResponse<WorkoutPlan[]>>(`${this.baseUrl}/user`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching user workout plans:', error);
      throw error;
    }
  }

  /**
   * Helper method to build query parameters from filter options
   * @param filterOptions Filter options
   * @returns Query parameters object
   */
  private buildQueryParams(filterOptions?: WorkoutPlanFilterOptions): Record<string, any> {
    if (!filterOptions) return {};
    
    const params: Record<string, any> = {};
    
    if (filterOptions.difficulty) {
      params.difficulty = filterOptions.difficulty;
    }
    
    if (filterOptions.categoryIds?.length) {
      params.categoryIds = filterOptions.categoryIds.join(',');
    }
    
    if (filterOptions.duration?.min !== undefined) {
      params.minDuration = filterOptions.duration.min;
    }
    
    if (filterOptions.duration?.max !== undefined) {
      params.maxDuration = filterOptions.duration.max;
    }
    
    if (filterOptions.isCustom !== undefined) {
      params.isCustom = filterOptions.isCustom;
    }
    
    if (filterOptions.isFavorite !== undefined) {
      params.isFavorite = filterOptions.isFavorite;
    }
    
    if (filterOptions.creatorId) {
      params.creatorId = filterOptions.creatorId;
    }
    
    if (filterOptions.search) {
      params.search = filterOptions.search;
    }
    
    if (filterOptions.page) {
      params.page = filterOptions.page;
    }
    
    if (filterOptions.limit) {
      params.limit = filterOptions.limit;
    }
    
    if (filterOptions.sortBy) {
      params.sortBy = filterOptions.sortBy;
      params.sortOrder = filterOptions.sortOrder || 'ASC';
    }
    
    return params;
  }

  /**
   * Toggle a workout as favorite/unfavorite
   * @param workoutId ID of the workout to toggle
   * @param isFavorite Whether to favorite (true) or unfavorite (false) the workout
   * @returns Success status
   */
  async toggleFavoriteWorkout(workoutId: WorkoutPlanId, isFavorite: boolean): Promise<boolean> {
    try {
      const action = isFavorite ? 'add' : 'remove';
      const response = await api.post<ApiResponse<{ success: boolean }>>(
        `/api/users/favorites/workout/${workoutId}`,
        { action }
      );
      return response.data.data?.success || false;
    } catch (error) {
      console.error(`Error ${isFavorite ? 'adding' : 'removing'} workout from favorites:`, error);
      return false;
    }
  }

  /**
   * Get user's favorite workouts
   * @returns List of user's favorite workout plans
   */
  async getFavoriteWorkouts(): Promise<WorkoutPlan[]> {
    try {
      const response = await api.get<ApiResponse<WorkoutPlan[]>>(`/api/users/favorites/workouts`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching favorite workout plans:', error);
      return [];
    }
  }
}

// Export a singleton instance for use throughout the application
export const workoutServiceInstance = new WorkoutService(); 