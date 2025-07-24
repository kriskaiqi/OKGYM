import axios from 'axios';
import { EquipmentTypes } from '../types';

// Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// URL to the equipment endpoint
const EQUIPMENT_API_URL = `${API_BASE_URL}/api/equipment`;

// API response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  page?: number;
  limit?: number;
  error?: string;
}

// Media item interface
interface MediaItem {
  id: string;
  uuid?: string;  // Add optional uuid property
  type: string;
  url: string;
  thumbnailUrl: string | null;
  isPrimary: boolean;
  displayOrder: number;
  entityType: string;
  entityStringId: string;
}

/**
 * Normalizes equipment data to ensure proper structure
 * @param equipment The equipment data to normalize
 * @returns Normalized equipment data
 */
const normalizeEquipmentData = (equipment: any): EquipmentTypes.Equipment | null => {
  if (!equipment) return null;
  
  console.log('Raw equipment data received:', equipment);
  
  // Ensure muscleGroupsTargeted is an array
  let muscleGroupsTargeted = equipment.muscleGroupsTargeted;
  if (!muscleGroupsTargeted) {
    muscleGroupsTargeted = [];
  } else if (!Array.isArray(muscleGroupsTargeted)) {
    // If it's a string, convert to array
    muscleGroupsTargeted = typeof muscleGroupsTargeted === 'string' 
      ? muscleGroupsTargeted.split(',').map((g: string) => g.trim()) 
      : [];
  }
  
  // Process media data from the API
  let imageUrl = equipment.imageUrl;
  let videoUrl = equipment.videoUrl;
  let media: MediaItem[] = equipment.media || [];
  
  // If we have direct media objects from the database
  if (Array.isArray(media) && media.length > 0) {
    console.log('Processing media data:', media);
    
    // Normalize media array to ensure consistent structure
    media = media.map((item: any) => ({
      id: item.id || item.uuid || '',
      type: item.type || '',
      url: item.url || '',
      thumbnailUrl: item.thumbnailUrl || null,
      isPrimary: item.isPrimary === true,
      displayOrder: item.displayOrder || 0,
      entityType: item.entityType || 'equipment',
      entityStringId: item.entityStringId || equipment.id
    }));
    
    // Find primary image or first image
    const primaryImage = media.find((m: MediaItem) => m.type === 'IMAGE' && m.isPrimary === true) ||
                         media.find((m: MediaItem) => m.type === 'IMAGE');
    
    // Find primary video or first video
    const primaryVideo = media.find((m: MediaItem) => m.type === 'VIDEO' && m.isPrimary === true) ||
                         media.find((m: MediaItem) => m.type === 'VIDEO');
    
    // Use the URLs directly from the media objects
    if (primaryImage && primaryImage.url) {
      imageUrl = primaryImage.url;
      console.log('Using image URL from media:', imageUrl);
    }
    
    if (primaryVideo && primaryVideo.url) {
      videoUrl = primaryVideo.url;
      console.log('Using video URL from media:', videoUrl);
    }
  } else if (equipment.image && equipment.image.url) {
    // Some APIs might return nested image/video objects instead of a media array
    imageUrl = equipment.image.url;
    console.log('Using image URL from nested image object:', imageUrl);
    
    // Create media item from image object
    media.push({
      id: equipment.image.id || '',
      type: 'IMAGE',
      url: equipment.image.url,
      thumbnailUrl: null,
      isPrimary: true,
      displayOrder: 1,
      entityType: 'equipment',
      entityStringId: equipment.id
    });
  } 
  
  if (equipment.video && equipment.video.url) {
    videoUrl = equipment.video.url;
    console.log('Using video URL from nested video object:', videoUrl);
    
    // Create media item from video object
    media.push({
      id: equipment.video.id || '',
      type: 'VIDEO',
      url: equipment.video.url,
      thumbnailUrl: equipment.video.thumbnailUrl || null,
      isPrimary: true,
      displayOrder: 2,
      entityType: 'equipment',
      entityStringId: equipment.id
    });
  }
  
  // Return normalized data
  const normalized = {
    ...equipment,
    muscleGroupsTargeted,
    imageUrl,
    videoUrl,
    media
  };
  
  console.log('Normalized equipment data:', normalized);
  return normalized;
};

/**
 * Service for interacting with the equipment API
 */
export const equipmentService = {
  /**
   * Get all equipment with optional filtering
   * @param filterOptions Optional filter criteria
   * @returns Promise with equipment response data
   */
  async getEquipment(filterOptions?: EquipmentTypes.EquipmentFilterOptions): Promise<ApiResponse<EquipmentTypes.Equipment[]>> {
    try {
      // Log filter options without alerts
      console.log('EQUIPMENT SERVICE CALLED with filters:', JSON.stringify(filterOptions));
      
      // Basic error checking
      if (!filterOptions) filterOptions = { page: 1, limit: 12 };
      
      // Create a direct parameter object with type annotation
      const params: Record<string, any> = {
        page: filterOptions.page || 1,
        limit: filterOptions.limit || 12
      };
      
      // Only add filters that have values and convert to strings for API compatibility
      if (filterOptions.category) 
        params['category'] = String(filterOptions.category);
      
      if (filterOptions.muscleGroup) 
        params['muscleGroup'] = String(filterOptions.muscleGroup);
      
      if (filterOptions.difficulty) 
        params['difficulty'] = String(filterOptions.difficulty);
      
      if (filterOptions.search && filterOptions.search.trim() !== '') 
        params['search'] = filterOptions.search.trim();
      
      // Log what we're sending
      console.log('Requesting equipment with params:', params);
      const fullUrl = `${EQUIPMENT_API_URL}?${new URLSearchParams(params).toString()}`;
      console.log('Full URL:', fullUrl);
      
      // Add timestamp to query parameters to prevent caching issues
      const cacheParam = `&_t=${new Date().getTime()}`;
      const noCacheUrl = fullUrl + cacheParam;
      console.log('No-cache URL:', noCacheUrl);
      
      // Try a direct fetch first as a more reliable method
      try {
        console.log('⚠️ Attempting direct fetch with URL:', noCacheUrl);
        const token = localStorage.getItem('token');
        const response = await fetch(noCacheUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Direct fetch successful:', data);
          
          // Process the response similarly to the axios path
          if (!data) {
            return { success: false, data: [], error: 'Empty response from direct fetch' };
          }
          
          if (data && data.data && Array.isArray(data.data)) {
            const normalizedData = data.data
              .map((item: any) => normalizeEquipmentData(item))
              .filter((item: EquipmentTypes.Equipment | null): item is EquipmentTypes.Equipment => item !== null);
            
            return {
              success: true,
              data: normalizedData,
              count: data.count || normalizedData.length,
              page: data.page,
              limit: data.limit
            };
          }
          
          // If the data is a direct array
          if (Array.isArray(data)) {
            const normalizedData = data
              .map((item: any) => normalizeEquipmentData(item))
              .filter((item: EquipmentTypes.Equipment | null): item is EquipmentTypes.Equipment => item !== null);
            
            return {
              success: true,
              data: normalizedData,
              count: normalizedData.length
            };
          }
          
          // If we get here, the data format is unexpected
          console.warn('Unexpected data format from direct fetch:', data);
        } else {
          console.error('❌ Direct fetch failed:', response.status, response.statusText);
          // Try to get the error message from the response
          try {
            const errorData = await response.json();
            console.error('Error details:', errorData);
          } catch (e) {
            console.error('Could not parse error response');
          }
        }
      } catch (fetchError) {
        console.error('❌ Direct fetch error:', fetchError);
        // Continue to axios as fallback
      }
      
      // Fallback to original axios implementation
      console.log('⚠️ Falling back to axios implementation');
      const response = await axios.get(EQUIPMENT_API_URL, { 
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Log the response without alerts
      console.log('API response status:', response.status);
      console.log('API response data:', response.data);
      
      // Handle empty response
      if (!response.data) {
        return { success: false, data: [], error: 'Empty response' };
      }
      
      // Handle array response
      if (Array.isArray(response.data)) {
        const normalizedData = response.data
          .map((item: any) => normalizeEquipmentData(item))
          .filter((item: EquipmentTypes.Equipment | null): item is EquipmentTypes.Equipment => item !== null);
        
        return {
          success: true,
          data: normalizedData,
          count: normalizedData.length
        };
      }
      
      // Handle standard response object
      if (response.data && response.data.data) {
        const normalizedData = response.data.data
          .map((item: any) => normalizeEquipmentData(item))
          .filter((item: EquipmentTypes.Equipment | null): item is EquipmentTypes.Equipment => item !== null);
        
        return {
          success: true,
          data: normalizedData,
          count: response.data.count || normalizedData.length,
          page: response.data.page,
          limit: response.data.limit
        };
      }
      
      // Fallback for unexpected format
      return {
        success: false,
        data: [],
        error: 'Unexpected response format'
      };
    } catch (error) {
      console.error('Error fetching equipment:', error);
      
      return {
        success: false,
        data: [],
        error: axios.isAxiosError(error)
          ? `${error.response?.status || 'Network'} Error: ${error.message}`
          : 'Unknown error fetching equipment'
      };
    }
  },

  /**
   * Search for equipment by name or other criteria
   * @param query Search query term
   * @returns Promise with equipment response data
   */
  async searchEquipment(query: string): Promise<ApiResponse<EquipmentTypes.Equipment[]>> {
    try {
      const response = await axios.get(EQUIPMENT_API_URL, {
        params: { search: query },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching equipment:', error);
      return {
        success: false,
        data: [],
        error: axios.isAxiosError(error)
          ? `${error.response?.status || 'Network'} Error: ${error.response?.data?.error || error.message}`
          : 'Unknown error searching equipment'
      };
    }
  },

  /**
   * Get equipment by ID
   * @param id Equipment ID
   * @returns Promise with the equipment data
   * @throws Error with details about the failure
   */
  async getEquipmentById(id: string): Promise<EquipmentTypes.Equipment | null> {
    if (!id) {
      console.error('Invalid equipment ID:', id);
      throw new Error('Invalid equipment ID provided');
    }
    
    try {
      // Log the request for debugging
      console.log(`Fetching equipment with ID: ${id}`);
      
      // First try with normal request
      try {
        const response = await axios.get(`${EQUIPMENT_API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 10000 // 10 second timeout
        });
        
        if (response.data && response.data.success) {
          return response.data.data;
        }
        
        return null;
      } catch (originalError: any) {
        // If we get a 500 error, try fetching from the main equipment list and filtering
        if (originalError.response && originalError.response.status === 500) {
          console.warn(`Server error (500) for equipment ID ${id}, trying to find from list...`);
          
          try {
            // Attempt to find the equipment in the complete list
            const allEquipmentResponse = await axios.get(`${EQUIPMENT_API_URL}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              },
              timeout: 15000 // Slightly longer timeout for list
            });
            
            if (allEquipmentResponse.data && allEquipmentResponse.data.success && 
                Array.isArray(allEquipmentResponse.data.data)) {
              // Find the equipment with matching ID
              const equipment = allEquipmentResponse.data.data.find(
                (item: any) => item.id === id
              );
              
              if (equipment) {
                console.log(`Found equipment ${id} in the equipment list`);
                return equipment;
              }
            }
          } catch (fallbackError) {
            console.error(`Fallback attempt to get equipment from list failed:`, fallbackError);
            // Continue to throw the original error
          }
        }
        
        // If the fallback failed or this wasn't a 500 error, rethrow
        throw originalError;
      }
    } catch (error: any) {
      console.error(`Error fetching equipment ${id}:`, error);
      throw error;
    }
  }
}; 