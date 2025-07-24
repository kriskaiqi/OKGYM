// Import at the top
import { 
  Difficulty,
  FitnessGoal,
  ExerciseType,
  MovementPattern,
  MediaType,
  CategoryType,
  ExerciseIntensity,
  TrackingFeature,
  MeasurementType,
  ExerciseRole
} from './enums';

// Import equipment types specifically to avoid naming conflicts
import * as EquipmentTypes from './equipment';

// Export workout and exercise types
export * from './exercise';
export * from './workout';
export * from './user';
export * from './dashboard';
export type { ExerciseError as SquatFormError } from './ai/exercise';

// Re-export equipment with more specific naming to avoid conflicts
export { EquipmentTypes };

// Export API types
export * from './api';

// Export AI types
export * from './ai/analysis';
export * from './ai/mediapipe';

// Export specific enums
export {
  Difficulty,
  FitnessGoal,
  ExerciseType,
  MovementPattern,
  MediaType,
  CategoryType,
  ExerciseIntensity,
  TrackingFeature,
  MeasurementType,
  ExerciseRole
}; 