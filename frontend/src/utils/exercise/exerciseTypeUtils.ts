// Utility functions for exercise type detection

// Exercise type definitions
export const EXERCISE_TYPES = {
  SQUAT: 'squat',
  DEADLIFT: 'deadlift',
  BENCH_PRESS: 'bench_press',
  LUNGE: 'lunge',
  PLANK: 'plank',
  BICEP_CURL: 'bicep_curl',
  SITUP: 'situp',
  SHOULDER_PRESS: 'shoulder_press',
  PUSHUP: 'pushup',
  LATERAL_RAISE: 'lateral_raise'
  // Add more exercise types as needed
} as const;

// Exercise name mappings
const EXERCISE_MAPPINGS = {
  // Squat variations
  [EXERCISE_TYPES.SQUAT]: [
    'Front Squat',
    'Barbell Back Squat',
    'Goblet Squat',
    'Box Squat',
    'Bodyweight Squat'
  ],
  
  // Deadlift variations - for future expansion
  [EXERCISE_TYPES.DEADLIFT]: [
    'Conventional Deadlift',
    'Sumo Deadlift',
    'Romanian Deadlift',
    'Stiff Leg Deadlift',
    'Trap Bar Deadlift'
  ],
  
  // Bench press variations
  [EXERCISE_TYPES.BENCH_PRESS]: [
    'Bench Press',
    'Dumbbell Bench Press',
    'Barbell Bench Press',
    'Close-Grip Bench Press',
    'Incline Bench Press',
    'Decline Bench Press'
  ],
  
  // Bicep curl variations
  [EXERCISE_TYPES.BICEP_CURL]: [
    'Barbell Curl',
    'Dumbbell Bicep Curl',
    'Hammer Curl',
    'Preacher Curl',
    'Concentration Curl',
    'Zottman Curl'
  ],
  
  // Lunge variations
  [EXERCISE_TYPES.LUNGE]: [
    'Forward Lunge',
    'Walking Lunge'
  ],
  
  // Plank variations
  [EXERCISE_TYPES.PLANK]: [
    'Plank'
  ],
  
  // Situp variations
  [EXERCISE_TYPES.SITUP]: [
    'Sit Up',
    'Sit-up',
    'Crunches',
    'Abdominal Crunches',
    'Ab Crunches'
  ],
  
  // Shoulder press variations
  [EXERCISE_TYPES.SHOULDER_PRESS]: [
    'Military Press',
    'Dumbbell Shoulder Press',
    'Push Press',
    'Arnold Press'
  ],

  // Pushup variations
  [EXERCISE_TYPES.PUSHUP]: [
    'Push-up',
    'Decline Push-up',
    'Diamond Push-Up'
  ],
  
  // Lateral raise variations
  [EXERCISE_TYPES.LATERAL_RAISE]: [
    'Lateral Raise',
    'Dumbbell Lateral Raise',
    'Side Lateral Raise',
    'Side Raise',
    'Shoulder Lateral Raise'
  ],
  
  // Add more mappings as needed
};

/**
 * Determines the exercise type from the exercise name
 * @param exerciseName Name of the exercise to check
 * @returns The exercise type or undefined if not found
 */
export const getExerciseType = (exerciseName: string): string | undefined => {
  if (!exerciseName) return undefined;
  
  const normalizedName = exerciseName.toLowerCase();
  
  // Find the first matching exercise type
  return Object.entries(EXERCISE_MAPPINGS).find(([_, names]) => 
    names.some(name => normalizedName.includes(name.toLowerCase()))
  )?.[0];
};

/**
 * Determines if an exercise is of a specific type
 * @param exerciseName Name of the exercise to check
 * @param exerciseType Type to check against
 * @returns True if the exercise is of the specified type
 */
export const isExerciseType = (exerciseName: string, exerciseType: string): boolean => {
  return getExerciseType(exerciseName) === exerciseType;
};

/**
 * Checks if an exercise is a squat variation
 * @param exerciseName Name of the exercise to check
 * @returns True if the exercise is a squat type
 */
export const isSquatExercise = (exerciseName: string): boolean => {
  return isExerciseType(exerciseName, EXERCISE_TYPES.SQUAT);
};

/**
 * Checks if an exercise is a bicep curl variation
 * @param exerciseName Name of the exercise to check
 * @returns True if the exercise is a bicep curl type
 */
export const isBicepCurlExercise = (exerciseName: string): boolean => {
  return isExerciseType(exerciseName, EXERCISE_TYPES.BICEP_CURL);
};

/**
 * Checks if an exercise is a lunge variation
 * @param exerciseName Name of the exercise to check
 * @returns True if the exercise is a lunge type
 */
export const isLungeExercise = (exerciseName: string): boolean => {
  return isExerciseType(exerciseName, EXERCISE_TYPES.LUNGE);
};

/**
 * Checks if an exercise is a plank variation
 * @param exerciseName Name of the exercise to check
 * @returns True if the exercise is a plank type
 */
export const isPlankExercise = (exerciseName: string): boolean => {
  return isExerciseType(exerciseName, EXERCISE_TYPES.PLANK);
};

/**
 * Checks if an exercise is a situp variation
 * @param exerciseName Name of the exercise to check
 * @returns True if the exercise is a situp type
 */
export const isSitupExercise = (exerciseName: string): boolean => {
  return isExerciseType(exerciseName, EXERCISE_TYPES.SITUP);
};

/**
 * Checks if an exercise is a shoulder press variation
 * @param exerciseName Name of the exercise to check
 * @returns True if the exercise is a shoulder press type
 */
export const isShoulderPressExercise = (exerciseName: string): boolean => {
  return isExerciseType(exerciseName, EXERCISE_TYPES.SHOULDER_PRESS);
};

/**
 * Checks if an exercise is a bench press variation
 * @param exerciseName Name of the exercise to check
 * @returns True if the exercise is a bench press type
 */
export const isBenchPressExercise = (exerciseName: string): boolean => {
  return isExerciseType(exerciseName, EXERCISE_TYPES.BENCH_PRESS);
};

/**
 * Checks if an exercise is a pushup variation
 * @param exerciseName Name of the exercise to check
 * @returns True if the exercise is a pushup type
 */
export const isPushupExercise = (exerciseName: string): boolean => {
  return isExerciseType(exerciseName, EXERCISE_TYPES.PUSHUP);
};

/**
 * Checks if an exercise is a lateral raise variation
 * @param exerciseName Name of the exercise to check
 * @returns True if the exercise is a lateral raise type
 */
export const isLateralRaiseExercise = (exerciseName: string): boolean => {
  return isExerciseType(exerciseName, EXERCISE_TYPES.LATERAL_RAISE);
}; 