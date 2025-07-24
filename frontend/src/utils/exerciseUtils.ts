import { ExerciseType } from '../hooks/useAudioCues';

/**
 * Maps exercise muscle groups to exercise types for audio cues
 */
export function getExerciseTypeFromMuscleGroups(muscleGroups: string[]): ExerciseType {
  const normalizedGroups = muscleGroups.map(group => group.toLowerCase());
  
  // Check for lower body exercises
  if (
    normalizedGroups.includes('quads') || 
    normalizedGroups.includes('glutes') || 
    normalizedGroups.includes('hamstrings') || 
    normalizedGroups.includes('calves')
  ) {
    return ExerciseType.LOWER_BODY;
  }
  
  // Check for upper body push exercises
  if (
    normalizedGroups.includes('chest') || 
    normalizedGroups.includes('shoulders') || 
    normalizedGroups.includes('triceps')
  ) {
    return ExerciseType.UPPER_BODY_PUSH;
  }
  
  // Check for upper body pull exercises
  if (
    normalizedGroups.includes('back') || 
    normalizedGroups.includes('lats') || 
    normalizedGroups.includes('biceps') ||
    normalizedGroups.includes('forearms')
  ) {
    return ExerciseType.UPPER_BODY_PULL;
  }
  
  // Check for core exercises
  if (
    normalizedGroups.includes('abs') || 
    normalizedGroups.includes('core') || 
    normalizedGroups.includes('obliques')
  ) {
    return ExerciseType.CORE;
  }
  
  // Check for isolation exercises (default for small muscle groups)
  if (
    normalizedGroups.includes('deltoids') || 
    normalizedGroups.includes('traps') || 
    normalizedGroups.includes('biceps') || 
    normalizedGroups.includes('triceps')
  ) {
    return ExerciseType.ISOLATION;
  }
  
  // Default to isolation if nothing matches
  return ExerciseType.ISOLATION;
}

/**
 * Identifies if an exercise is likely to be explosive based on its name
 */
export function isExplosiveExercise(exerciseName: string): boolean {
  const lowercaseName = exerciseName.toLowerCase();
  
  const explosiveKeywords = [
    'jump', 'explosive', 'plyometric', 'power', 'clean', 'snatch', 'jerk',
    'swing', 'sprint', 'throw', 'slam', 'box', 'burpee', 'clap'
  ];
  
  return explosiveKeywords.some(keyword => lowercaseName.includes(keyword));
}

/**
 * Gets the appropriate exercise type for audio cues
 */
export function getExerciseType(exercise: { 
  name: string; 
  muscleGroups?: string[] 
}): ExerciseType {
  // First check if it's an explosive exercise based on name
  if (isExplosiveExercise(exercise.name)) {
    return ExerciseType.EXPLOSIVE;
  }
  
  // Then check based on muscle groups
  if (exercise.muscleGroups && exercise.muscleGroups.length > 0) {
    return getExerciseTypeFromMuscleGroups(exercise.muscleGroups);
  }
  
  // Default to isolation if we can't determine
  return ExerciseType.ISOLATION;
} 