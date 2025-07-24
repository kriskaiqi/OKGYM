import axios from 'axios';
import { 
  Exercise, 
  ExerciseFilterOptions, 
  CreateExerciseRequest,
  UpdateExerciseRequest,
  ExerciseRelation,
  RelationType
} from '../types/exercise';
import api from './api';

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// URL to the exercises endpoint
const EXERCISES_API_URL = `${API_BASE_URL}/api/exercises`;

console.log('Exercises API URL:', EXERCISES_API_URL);

// API response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  page?: number;
  limit?: number;
  error?: string;
}

/**
 * Normalizes exercise data to ensure proper structure
 * @param exercise The exercise data to normalize
 * @returns Normalized exercise data
 */
const normalizeExerciseData = (exercise: any): Exercise | null => {
  if (!exercise) return null;
  
  // Log exercise data for debugging
  console.log('Normalizing exercise data:', {
    id: exercise.id,
    name: exercise.name,
    hasEquipment: !!exercise.equipment,
    equipmentType: exercise.equipment ? typeof exercise.equipment : 'undefined',
    equipmentValue: exercise.equipment,
    hasMedia: !!exercise.media,
    mediaCount: exercise.media ? (Array.isArray(exercise.media) ? exercise.media.length : 'not an array') : 0
  });
  
  // Ensure muscleGroups is an array
  let muscleGroups = exercise.muscleGroups;
  if (!muscleGroups) {
    muscleGroups = [];
  } else if (!Array.isArray(muscleGroups)) {
    // If it's a string, convert to single item array
    muscleGroups = typeof muscleGroups === 'string' ? muscleGroups.split(',').map(g => g.trim()) : [];
  }
  
  // Ensure equipment is an array
  let equipment = exercise.equipment;
  if (!equipment) {
    equipment = [];
  } else if (!Array.isArray(equipment)) {
    // If it's a string, convert to array more robustly
    equipment = typeof equipment === 'string' ? equipment.split(',').map(e => e.trim()) : [equipment.toString()];
  }
  
  // Ensure instructions is an array
  let instructions = exercise.instructions;
  if (!instructions) {
    instructions = [];
  } else if (!Array.isArray(instructions)) {
    instructions = typeof instructions === 'string' ? instructions.split('\n').map(i => i.trim()) : [];
  }
  
  // Process stats if they exist
  let stats = exercise.stats;
  if (stats) {
    // If stats is a string, try to parse it as JSON
    if (typeof stats === 'string') {
      try {
        stats = JSON.parse(stats);
        console.log('Parsed stats from string:', stats);
      } catch (e) {
        console.error('Failed to parse stats JSON:', e);
        stats = undefined;
      }
    }
  }
  
  // Ensure media is preserved
  const media = exercise.media || [];
  
  // Return normalized data
  return {
    ...exercise,
    muscleGroups,
    equipment,
    instructions,
    stats,
    media // Ensure media is included
  };
};

/**
 * Service for interacting with the exercises API
 */
export const exerciseService = {
  /**
   * Get all exercises with optional filtering
   * @param filterOptions Optional filter criteria
   * @returns Promise with exercise response data
   */
  async getExercises(filterOptions?: ExerciseFilterOptions): Promise<ApiResponse<Exercise[]>> {
    try {  
      const response = await axios.get(EXERCISES_API_URL, { 
        params: filterOptions,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // If data is in an array, normalize each item
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map((exercise: any) => normalizeExerciseData(exercise));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      // Return structured error response
      return {
        success: false,
        data: [],
        error: axios.isAxiosError(error) 
          ? `${error.response?.status || 'Network'} Error: ${error.response?.data?.error || error.message}`
          : 'Unknown error fetching exercises'
      };
    }
  },

  /**
   * Search for exercises by name or other criteria
   * @param query Search query term
   * @returns Promise with exercise response data
   */
  async searchExercises(query: string): Promise<ApiResponse<Exercise[]>> {
    try {
      const response = await axios.get(EXERCISES_API_URL, {
        params: { search: query },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching exercises:', error);
      return {
        success: false,
        data: [],
        error: axios.isAxiosError(error)
          ? `${error.response?.status || 'Network'} Error: ${error.response?.data?.error || error.message}`
          : 'Unknown error searching exercises'
      };
    }
  },

  /**
   * Get exercise by ID
   * @param id Exercise ID
   * @returns Promise with the exercise data
   */
  async getExerciseById(id: string): Promise<Exercise | null> {
    if (!id) {
      console.error('Invalid exercise ID:', id);
      return null;
    }
    
    try {
      const response = await axios.get(`${EXERCISES_API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      let exerciseData;
      // Handle different response structures
      if (response.data?.data) {
        exerciseData = response.data.data;
      } else if (response.data && !response.data.data) {
        // Some APIs return the data directly without a data property
        exerciseData = response.data;
      } else {
        return null;
      }
      
      // Normalize the data before returning
      return normalizeExerciseData(exerciseData);
    } catch (error) {
      console.error(`Error fetching exercise ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new exercise
   */
  createExercise: async (exercise: CreateExerciseRequest): Promise<Exercise | null> => {
    try {
      const response = await axios.post(EXERCISES_API_URL, exercise, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data?.data || response.data || null;
    } catch (error) {
      console.error('Error creating exercise:', error);
      return null;
    }
  },

  /**
   * Update an existing exercise
   */
  updateExercise: async (id: string, exercise: UpdateExerciseRequest): Promise<Exercise | null> => {
    try {
      const response = await axios.put(`${EXERCISES_API_URL}/${id}`, exercise, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data?.data || response.data || null;
    } catch (error) {
      console.error(`Error updating exercise with ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Delete an exercise
   */
  deleteExercise: async (id: string): Promise<boolean> => {
    try {
      await axios.delete(`${EXERCISES_API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return true;
    } catch (error) {
      console.error(`Error deleting exercise with ID ${id}:`, error);
      return false;
    }
  },

  /**
   * Get related exercises by type
   */
  getRelatedExercises: async (exerciseId: string, type?: RelationType): Promise<ApiResponse<Exercise[]>> => {
    try {
      const endpoint = type 
        ? `${EXERCISES_API_URL}/${exerciseId}/${type.toLowerCase()}s` 
        : `${EXERCISES_API_URL}/${exerciseId}/related`;
        
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Return a structured API response
      return {
        success: true,
        data: response.data?.data || []
      };
    } catch (error) {
      console.error(`Error fetching related exercises for ${exerciseId}:`, error);
      return {
        success: false,
        data: [],
        error: axios.isAxiosError(error)
          ? `${error.response?.status || 'Network'} Error: ${error.response?.data?.error || error.message}`
          : 'Unknown error fetching related exercises'
      };
    }
  },
  
  /**
   * Add a relationship between exercises
   */
  createRelationship: async (sourceId: string, targetId: string, type: RelationType, notes?: string): Promise<boolean> => {
    try {
      await axios.post(`${EXERCISES_API_URL}/${sourceId}/relations`, {
        targetExerciseId: targetId,
        type,
        description: notes
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error creating exercise relationship:', error);
      return false;
    }
  },
  
  /**
   * Remove a relationship
   */
  deleteRelationship: async (relationId: string): Promise<boolean> => {
    try {
      await axios.delete(`${EXERCISES_API_URL}/relations/${relationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return true;
    } catch (error) {
      console.error(`Error deleting exercise relationship:`, error);
      return false;
    }
  },

  /**
   * Get equipment details by ID
   * @param id Equipment ID
   * @returns Promise with the equipment data
   */
  async getEquipmentById(id: string): Promise<any | null> {
    if (!id) return null;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/equipment/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data?.data || response.data || null;
    } catch (error) {
      console.error(`Error fetching equipment ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Fetches all equipment
   * @returns Promise with array of equipment
   */
  async getAllEquipment(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/equipment`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching equipment:', error);
      return [];
    }
  },

  /**
   * Get exercises that use a specific equipment
   * @param equipmentId ID of the equipment
   * @param filterOptions Optional filter options
   * @returns Promise with exercise response data
   */
  async getExercisesByEquipment(equipmentId: string, filterOptions?: ExerciseFilterOptions): Promise<ApiResponse<Exercise[]>> {
    if (!equipmentId) {
      console.error('Invalid equipment ID');
      return {
        success: false,
        data: [],
        error: 'Invalid equipment ID'
      };
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/equipment/${equipmentId}/exercises`, {
        params: filterOptions,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // If data is in an array, normalize each item
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        response.data.data = response.data.data
          .map((exercise: any) => normalizeExerciseData(exercise))
          .filter((exercise: Exercise | null): exercise is Exercise => exercise !== null);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching exercises for equipment ${equipmentId}:`, error);
      return {
        success: false,
        data: [],
        error: axios.isAxiosError(error)
          ? `${error.response?.status || 'Network'} Error: ${error.response?.data?.error || error.message}`
          : 'Unknown error fetching exercises for this equipment'
      };
    }
  },

  /**
   * Get multiple exercises by their IDs
   * @param exerciseIds Array of exercise IDs to fetch
   * @returns Promise with an array of exercises
   */
  async getExercisesByIds(exerciseIds: string[]): Promise<Exercise[]> {
    try {
      if (!exerciseIds || exerciseIds.length === 0) return [];
      
      // Deduplicate IDs to avoid redundant requests
      const uniqueIds = Array.from(new Set(exerciseIds));
      
      // Log the IDs we're requesting for debugging
      console.log(`Fetching ${uniqueIds.length} unique exercise IDs`);
      
      // If there are too many IDs, split into multiple requests to avoid URL length limits
      if (uniqueIds.length > 30) {
        console.log('Large number of IDs detected, processing in batches');
        const batches = [];
        for (let i = 0; i < uniqueIds.length; i += 30) {
          batches.push(uniqueIds.slice(i, i + 30));
        }
        
        const results = [];
        for (const batch of batches) {
          const batchResults = await this.fetchBatchOfExercises(batch);
          results.push(...batchResults);
        }
        return results;
      }
      
      return await this.fetchBatchOfExercises(uniqueIds);
    } catch (error) {
      console.error('Error fetching exercises by IDs:', error);
      return [];
    }
  },
  
  /**
   * Helper function to fetch a batch of exercises by IDs
   * @param exerciseIds Array of exercise IDs to fetch
   * @returns Promise with exercise data
   */
  async fetchBatchOfExercises(exerciseIds: string[]): Promise<Exercise[]> {
    try {
      // Instead of using /batch which might be confused with an ID,
      // use a query parameter approach with the main exercises endpoint
      const response = await api.get(`${EXERCISES_API_URL}`, {
        params: { 
          ids: exerciseIds.join(','),
          batch: true // Add a batch flag to differentiate from regular requests
        }
      });
      
      const exercises = response.data?.data || [];
      
      // Normalize each exercise before returning
      return exercises.map((exercise: any) => normalizeExerciseData(exercise)).filter(Boolean);
    } catch (error) {
      console.error('Error fetching batch of exercises:', error);
      
      // Fall back to individual requests if batch request fails
      console.log('Falling back to individual exercise requests');
      const exercises = [];
      for (const id of exerciseIds) {
        try {
          const exercise = await this.getExerciseById(id);
          if (exercise) {
            exercises.push(exercise);
          }
        } catch (e) {
          console.warn(`Failed to fetch individual exercise ${id}:`, e);
        }
      }
      return exercises;
    }
  }
};

// Empty export to make this a module
export {};