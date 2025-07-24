// Core models
export { Exercise } from './Exercise';
export { WorkoutExercise } from './WorkoutExercise';
export { WorkoutPlan } from './WorkoutPlan';
export { 
    WorkoutSession, 
    WorkoutSummary, 
    ExerciseResult, 
    BestResult,
    ExerciseAttempt,
    PlannedExercise,
    ActualExercise,
    ExerciseSequence,
    ExerciseSummary,
    Coordinates,
    LocationData,
    EnvironmentData,
    HealthData
} from './WorkoutSession';
export { User, UserPreferences, UserStats } from './User';
export { MetricTracking } from './MetricTracking';
export { Feedback } from './Feedback';
export { WorkoutRating } from './WorkoutRating';
export { ExerciseFormAnalysis, FormCorrectionPoint } from './ExerciseFormAnalysis';
export { Achievement } from './Achievement';
export { AudioCue, AudioCueData } from './AudioCue';

// Enums and shared types
export {
    SessionStatus,
    ExerciseStatus,
    UserRole,
    ExerciseType,
    WorkoutCategory,
    Difficulty,
    SetType,
    SetStructure,
    ExerciseRole,
    MetricType,
    FitnessGoal
} from './shared/Enums';

// Validation types
export {
    ExerciseIntensity,
    ExerciseTempo,
    RangeOfMotion,
    ProgressionStrategy,
    SubstitutionOptions
} from './shared/Validation';

// Constants
export {
    PROGRESSION_CONSTANTS,
    TIME_CONSTANTS
} from './shared/Constants';

// Supporting models
export { ExerciseDetails } from './ExerciseDetails';
export { ExerciseCategory, CategoryType } from './ExerciseCategory';
export { Equipment } from './Equipment';
export { WorkoutTag } from './WorkoutTag';
export { Media, MediaType, MediaContext, MediaQuality } from './Media';
export { VideoTutorial } from './VideoTutorial';
export { TrainingProgram } from './TrainingProgram';
export { ProgramWorkout } from './ProgramWorkout';
export { ProgramEnrollment } from './ProgramEnrollment';
export { BodyMetric } from './BodyMetric';
export { Notification } from './Notification';