/**
 * Utilities for handling image URLs throughout the application
 */

/**
 * Get the correct URL for an image, ensuring it has the proper static path prefix
 * @param url The image URL from the database or component
 * @returns Properly formatted image URL
 */
export const getImageUrl = (url: string | undefined | null): string => {
  if (!url) {
    console.warn('Empty URL provided to getImageUrl, using placeholder');
    return '/static/images/placeholder.jpg';
  }
  
  // Log the incoming URL for debugging
  console.log(`Processing URL in getImageUrl: ${url}`);
  
  // If URL already starts with http/https, it's external
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If URL already starts with /static/ or /images/, don't modify it
  if (url.startsWith('/static/') || url.startsWith('/images/')) {
    return url;
  }
  
  // Add /static/ prefix to other URLs that don't have it
  return `/static${url.startsWith('/') ? '' : '/'}${url}`;
};

/**
 * Media object interface matching the database structure
 */
interface MediaItem {
  id?: string;
  uuid?: string;
  type: string;
  context?: string;
  url: string;
  thumbnailUrl?: string | null;
  filename?: string;
  mimeType?: string;
  isPrimary?: boolean;
  displayOrder?: number;
  entityType?: string;
  entityStringId?: string;
}

/**
 * Get the proper equipment image URL
 * @param nameOrUrl The equipment name or URL
 * @param media Optional media array from the equipment object
 * @param entityId Optional entity ID to match with media items
 * @returns Formatted equipment image URL
 */
export const getEquipmentImageUrl = (
  nameOrUrl: string | undefined | null,
  media?: MediaItem[],
  entityId?: string | number
): string => {
  // First check if media array is available
  if (media && media.length > 0) {
    console.log('Equipment media array found:', media);
    
    // Filter media for this specific entity if ID is provided
    let relevantMedia = media;
    if (entityId) {
      relevantMedia = media.filter(m => 
        (m.entityType === 'equipment' || m.entityType === 'EQUIPMENT') && 
        (m.entityStringId === entityId.toString() || m.entityStringId === String(entityId))
      );
      console.log(`Filtered media for equipment ID ${entityId}:`, relevantMedia);
      
      // If no matching media found by ID, fall back to all media
      if (relevantMedia.length === 0) {
        console.log(`No media found for equipment ID ${entityId}, using all media items`);
        relevantMedia = media;
      }
    }
    
    // Look for primary image first
    const primaryImage = relevantMedia.find(m => 
      m.type === 'IMAGE' && m.isPrimary === true
    );
    
    if (primaryImage && primaryImage.url) {
      console.log('Using primary image from media:', primaryImage.url);
      return getImageUrl(primaryImage.url);
    }
    
    // Then look for any image
    const anyImage = relevantMedia.find(m => m.type === 'IMAGE');
    if (anyImage && anyImage.url) {
      console.log('Using first available image from media:', anyImage.url);
      return getImageUrl(anyImage.url);
    }
    
    // If no image found but there's a video with a thumbnail, use that
    const videoMedia = relevantMedia.find(m => m.type === 'VIDEO' && m.thumbnailUrl);
    if (videoMedia && videoMedia.thumbnailUrl) {
      console.log('Using video thumbnail from media:', videoMedia.thumbnailUrl);
      return getImageUrl(videoMedia.thumbnailUrl);
    }
  }

  // If no media is available, use fallback logic
  if (!nameOrUrl) {
    console.warn('No name or URL provided for equipment, using placeholder');
    return '/static/images/placeholder.jpg';
  }
  
  // If it's already a URL, process it
  if (nameOrUrl.includes('/')) {
    console.log('Using provided URL for equipment:', nameOrUrl);
    return getImageUrl(nameOrUrl);
  }
  
  // Convert equipment name to filename format
  const filename = nameOrUrl.toLowerCase().replace(/\s+/g, '-');
  const constructedUrl = `/static/images/equipment/${filename}.jpg`;
  console.log(`Constructed equipment URL from name "${nameOrUrl}":`, constructedUrl);
  return constructedUrl;
};

/**
 * Get the proper exercise image URL
 * @param nameOrUrl The exercise name or URL
 * @param media Optional media array from the exercise object
 * @param entityId Optional entity ID to match with media items
 * @returns Formatted exercise image URL
 */
export const getExerciseImageUrl = (
  nameOrUrl: string | undefined | null, 
  media?: MediaItem[],
  entityId?: string | number
): string => {
  // First check if media array is available
  if (media && media.length > 0) {
    console.log('Exercise media array found:', media);
    
    // Filter media for this specific entity if ID is provided
    let relevantMedia = media;
    if (entityId) {
      relevantMedia = media.filter(m => 
        (m.entityType === 'exercise' || m.entityType === 'EXERCISE') && 
        (m.entityStringId === entityId.toString() || m.entityStringId === String(entityId))
      );
      console.log(`Filtered media for exercise ID ${entityId}:`, relevantMedia);
      
      // If no matching media found by ID, fall back to all media
      if (relevantMedia.length === 0) {
        console.log(`No media found for exercise ID ${entityId}, using all media items`);
        relevantMedia = media;
      }
    }
    
    // Look for primary image first
    const primaryImage = relevantMedia.find(m => 
      m.type === 'IMAGE' && m.isPrimary === true
    );
    
    if (primaryImage && primaryImage.url) {
      console.log('Using primary image from media:', primaryImage.url);
      return getImageUrl(primaryImage.url);
    }
    
    // Then look for any image
    const anyImage = relevantMedia.find(m => m.type === 'IMAGE');
    if (anyImage && anyImage.url) {
      console.log('Using first available image from media:', anyImage.url);
      return getImageUrl(anyImage.url);
    }
    
    // If no image found but there's a video with a thumbnail, use that
    const videoMedia = relevantMedia.find(m => m.type === 'VIDEO' && m.thumbnailUrl);
    if (videoMedia && videoMedia.thumbnailUrl) {
      console.log('Using video thumbnail from media:', videoMedia.thumbnailUrl);
      return getImageUrl(videoMedia.thumbnailUrl);
    }
  }

  // If no media is available, use fallback logic
  if (!nameOrUrl) {
    console.warn('No name or URL provided for exercise, using placeholder');
    return '/static/images/exercises/placeholder.jpg';
  }
  
  // If it's already a URL, process it
  if (nameOrUrl.includes('/')) {
    console.log('Using provided URL for exercise:', nameOrUrl);
    return getImageUrl(nameOrUrl);
  }
  
  // Convert exercise name to filename format
  const filename = nameOrUrl.toLowerCase().replace(/\s+/g, '-');
  const constructedUrl = `/static/exercises/images/${filename}.jpg`;
  console.log(`Constructed exercise URL from name "${nameOrUrl}":`, constructedUrl);
  return constructedUrl;
};

/**
 * Get fallback image URL for workout category
 * Always returns a valid static path that exists on the server
 */
const getWorkoutCategoryFallbackImage = (category: string): string => {
  // Use a single placeholder for all categories
  // This ensures we don't have 404 errors for missing category images
  return '/static/images/workouts/placeholder.jpg';
  
  // Previous approach that caused 404 errors:
  // // Default path for all categories
  // const basePath = '/static/images/workouts';
  // 
  // // Format the category name
  // const formattedCategory = category.toLowerCase().replace(/_/g, '-');
  // 
  // // Try the category-specific image first (this may not exist for all categories)
  // const categoryImagePath = `${basePath}/${formattedCategory}.jpg`;
  // 
  // // For now, always return the category path. The image error handler in the component
  // // will catch missing images and fall back to placeholder
  // return categoryImagePath;
};

/**
 * Get the proper workout image URL
 * @param nameOrUrl The workout name or URL or category
 * @param media Optional media array from the workout object
 * @param entityId Optional entity ID to match with media items
 * @returns Formatted workout image URL
 */
export const getWorkoutImageUrl = (
  nameOrUrl: string | undefined | null,
  media?: MediaItem[],
  entityId?: string | number
): string => {
  // First check if media array is available
  if (media && media.length > 0) {
    console.log('Workout media array found:', media);
    
    // Filter media for this specific entity if ID is provided
    let relevantMedia = media;
    if (entityId) {
      relevantMedia = media.filter(m => 
        (m.entityType === 'workout' || m.entityType === 'WORKOUT' || m.entityType === 'workoutPlan') && 
        (m.entityStringId === entityId.toString() || m.entityStringId === String(entityId))
      );
      console.log(`Filtered media for workout ID ${entityId}:`, relevantMedia);
      
      // If no matching media found by ID, fall back to all media
      if (relevantMedia.length === 0) {
        console.log(`No media found for workout ID ${entityId}, using all media items`);
        relevantMedia = media;
      }
    }
    
    // Look for primary image first
    const primaryImage = relevantMedia.find(m => 
      m.type === 'IMAGE' && m.isPrimary === true
    );
    
    if (primaryImage && primaryImage.url) {
      console.log('Using primary image from media:', primaryImage.url);
      return getImageUrl(primaryImage.url);
    }
    
    // Then look for any image
    const anyImage = relevantMedia.find(m => m.type === 'IMAGE');
    if (anyImage && anyImage.url) {
      console.log('Using first available image from media:', anyImage.url);
      return getImageUrl(anyImage.url);
    }
    
    // If no image found but there's a video with a thumbnail, use that
    const videoMedia = relevantMedia.find(m => m.type === 'VIDEO' && m.thumbnailUrl);
    if (videoMedia && videoMedia.thumbnailUrl) {
      console.log('Using video thumbnail from media:', videoMedia.thumbnailUrl);
      return getImageUrl(videoMedia.thumbnailUrl);
    }
  }
  
  // If no media is available, use fallback logic
  if (!nameOrUrl) {
    console.warn('No name or URL provided for workout, using placeholder');
    return '/static/images/workouts/placeholder.jpg';
  }
  
  // If it's already a URL, process it
  if (nameOrUrl.includes('/')) {
    console.log('Using provided URL for workout:', nameOrUrl);
    return getImageUrl(nameOrUrl);
  }
  
  // Check if nameOrUrl might be a category
  if (nameOrUrl.includes('_') || nameOrUrl.toUpperCase() === nameOrUrl) {
    // Likely a category - get fallback image
    return getWorkoutCategoryFallbackImage(nameOrUrl);
  }
  
  // Convert workout name to filename format as last resort
  const filename = nameOrUrl.toLowerCase().replace(/\s+/g, '-');
  const constructedUrl = `/static/workouts/images/${filename}.jpg`;
  console.log(`Constructed workout URL from name "${nameOrUrl}":`, constructedUrl);
  return constructedUrl;
};

/**
 * Get a video URL for any entity type from its media array
 * @param media Array of media items
 * @param entityId Optional entity ID to match with media items
 * @param entityType Type of entity ('equipment', 'exercise', 'workout', etc.)
 * @param entityName Optional entity name to use for fallback URL construction
 * @returns Video URL if found, undefined otherwise
 */
export const getVideoUrl = (
  media?: MediaItem[],
  entityId?: string | number,
  entityType?: string,
  entityName?: string
): string | undefined => {
  if (!media || media.length === 0) {
    console.log('No media array provided for video lookup');
    
    // Name-based fallback similar to image URL construction
    if (entityName && entityType) {
      // Convert entity name to filename format (lowercase, spaces to hyphens)
      const filename = entityName.toLowerCase().replace(/\s+/g, '-');
      let videoPath = '';
      
      // Construct path based on entity type
      switch(entityType.toLowerCase()) {
        case 'exercise':
          videoPath = `/static/exercises/videos/${filename}.mp4`;
          console.log(`Constructed exercise video URL from name "${entityName}":`, videoPath);
          return videoPath;
        case 'equipment':
          videoPath = `/static/videos/equipment/${filename}.mp4`;
          console.log(`Constructed equipment video URL from name "${entityName}":`, videoPath);
          return videoPath;
        case 'workout':
        case 'workoutplan':
          videoPath = `/static/workouts/videos/${filename}.mp4`;
          console.log(`Constructed workout video URL from name "${entityName}":`, videoPath);
          return videoPath;
        default:
          return undefined;
      }
    }
    
    return undefined;
  }

  console.log(`Looking for video in media array for ${entityType || 'entity'} ${entityId || ''}`);
  
  // Filter media for this specific entity if ID and type are provided
  let relevantMedia = media;
  if (entityId && entityType) {
    const normalizedEntityType = entityType.toLowerCase();
    relevantMedia = media.filter(m => 
      (m.entityType?.toLowerCase() === normalizedEntityType) && 
      (m.entityStringId === entityId.toString() || m.entityStringId === String(entityId))
    );
    
    // If no matching media found by ID and type, fall back to all media
    if (relevantMedia.length === 0) {
      console.log(`No media found for ${entityType} ID ${entityId}, using all media items`);
      relevantMedia = media;
    }
  }
  
  // Look for primary video first
  const primaryVideo = relevantMedia.find(m => 
    m.type === 'VIDEO' && m.isPrimary === true
  );
  
  if (primaryVideo && primaryVideo.url) {
    console.log('Found primary video:', primaryVideo.url);
    return getMediaUrl(primaryVideo.url);
  }
  
  // Then look for any video
  const anyVideo = relevantMedia.find(m => m.type === 'VIDEO');
  if (anyVideo && anyVideo.url) {
    console.log('Found first available video:', anyVideo.url);
    return getMediaUrl(anyVideo.url);
  }
  
  console.log('No video found in media array');
  
  // Second fallback to name-based approach if we have entity name but couldn't find video in media
  if (entityName && entityType) {
    // Convert entity name to filename format (lowercase, spaces to hyphens)
    const filename = entityName.toLowerCase().replace(/\s+/g, '-');
    let videoPath = '';
    
    // Construct path based on entity type
    switch(entityType.toLowerCase()) {
      case 'exercise':
        videoPath = `/static/exercises/videos/${filename}.mp4`;
        console.log(`Falling back to constructed exercise video URL:`, videoPath);
        return videoPath;
      case 'equipment':
        videoPath = `/static/videos/equipment/${filename}.mp4`;
        console.log(`Falling back to constructed equipment video URL:`, videoPath);
        return videoPath;
      case 'workout':
      case 'workoutplan':
        videoPath = `/static/workouts/videos/${filename}.mp4`;
        console.log(`Falling back to constructed workout video URL:`, videoPath);
        return videoPath;
    }
  }
  
  return undefined;
};

/**
 * Get the correct URL for any media file (image or video)
 * @param url The media URL from the database or component
 * @returns Properly formatted media URL
 */
export const getMediaUrl = (url: string | undefined | null): string => {
  if (!url) {
    console.warn('Empty URL provided to getMediaUrl');
    return '';
  }
  
  // Log the incoming URL for debugging
  console.log(`Processing URL in getMediaUrl: ${url}`);
  
  // If URL already starts with http/https, it's external
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If URL already starts with /static/ or /videos/ or /images/, don't modify it
  if (url.startsWith('/static/') || url.startsWith('/videos/') || url.startsWith('/images/')) {
    return url;
  }
  
  // Add /static/ prefix to other URLs that don't have it
  return `/static${url.startsWith('/') ? '' : '/'}${url}`;
}; 