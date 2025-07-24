import { useState } from 'react';

interface UserPreferences {
  showExerciseDetails: boolean;
  showExerciseStatistics: boolean;
  showExerciseVideos: boolean;
  defaultDifficulty: string;
  [key: string]: any;
}

const defaultPreferences: UserPreferences = {
  showExerciseDetails: true,
  showExerciseStatistics: true,
  showExerciseVideos: true,
  defaultDifficulty: 'intermediate'
};

/**
 * Hook for managing user preferences
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  /**
   * Update a specific preference
   */
  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    preferences,
    updatePreference
  };
}; 