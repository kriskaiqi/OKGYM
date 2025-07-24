/**
 * Format a duration in seconds to a human-readable string (MM:SS format)
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds && seconds !== 0) return '–';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format a date to a human-readable string
 */
export const formatDate = (date: Date | string): string => {
  if (!date) return '–';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
};

/**
 * Format a number as a percentage
 */
export const formatPercentage = (value: number): string => {
  if (value === undefined || value === null) return '–';
  return `${Math.round(value * 100)}%`;
};

/**
 * Format an array or string into an array
 * @param value Array, string, or undefined value to format
 * @returns Formatted array
 */
export const formatArrayOrString = (value: string[] | string | any | undefined): string[] => {
  if (!value) {
    return [];
  }
  
  // If it's already an array
  if (Array.isArray(value)) {
    // Ensure all elements are strings
    return value.map(item => {
      if (typeof item === 'object' && item !== null) {
        return item.name || item.value || JSON.stringify(item);
      }
      return String(item);
    });
  }
  
  // If it's an object, extract key information or stringify it
  if (typeof value === 'object' && value !== null) {
    if (value.name) return [value.name];
    if (value.value) return [value.value]; 
    return [JSON.stringify(value)];
  }
  
  // If it's a comma-separated string, split it
  if (typeof value === 'string' && value.includes(',')) {
    return value.split(',').map(item => item.trim());
  }

  // If it's a simple string or other type
  return [String(value)];
}; 