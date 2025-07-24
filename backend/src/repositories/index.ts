/**
 * Repository layer exports
 * This file centralizes all repository exports to simplify imports
 */

// Base repositories
export * from './BaseRepository';
export * from './GenericRepository';

// Entity-specific repositories
export * from './AIModelConfigurationRepository';
export * from './AudioCueRepository';
export * from './BodyMetricRepository';
export * from './EquipmentRepository';
export * from './ExerciseCategoryRepository';
export * from './ExerciseFormAnalysisRepository';
export * from './ExerciseRepository';
export * from './ExerciseSpecificAnalysisRepository';
export * from './FitnessGoalRepository';
export * from './MediaRepository';
export * from './ProgramEnrollmentRepository';
export * from './ProgramWorkoutRepository';
export * from './TrainingProgramRepository';
export * from './UserActivityRepository';
export * from './UserProgressRepository';
export * from './UserRepository';
export * from './UserScheduleRepository';
export * from './VideoTutorialRepository';
export * from './WorkoutExerciseRepository';
export * from './WorkoutPlanRepository';
export * from './WorkoutSessionRepository';
export * from './WorkoutTagRepository';
export * from './WorkoutRatingRepository';
export * from './FeedbackRepository';
export * from './NotificationRepository';
export * from './AchievementRepository';
export * from './MetricTrackingRepository';
export * from './UserEquipmentRepository';
export * from './ExerciseRelationRepository';
export * from './ExerciseDetailsRepository';

// Filter interfaces
export * from './interfaces/BodyMetricFilters';

/**
 * Repository factory
 * Provides a convenient way to get repository instances
 */
import { AIModelConfigurationRepository } from './AIModelConfigurationRepository';
import { AudioCueRepository } from './AudioCueRepository';
import { BodyMetricRepository } from './BodyMetricRepository';
import { EquipmentRepository } from './EquipmentRepository';
import { ExerciseCategoryRepository } from './ExerciseCategoryRepository';
import { ExerciseFormAnalysisRepository } from './ExerciseFormAnalysisRepository';
import { ExerciseRepository } from './ExerciseRepository';
import { ExerciseSpecificAnalysisRepository } from './ExerciseSpecificAnalysisRepository';
import { FitnessGoalRepository } from './FitnessGoalRepository';
import { MediaRepository } from './MediaRepository';
import { ProgramEnrollmentRepository } from './ProgramEnrollmentRepository';
import { ProgramWorkoutRepository } from './ProgramWorkoutRepository';
import { TrainingProgramRepository } from './TrainingProgramRepository';
import { UserActivityRepository } from './UserActivityRepository';
import { UserProgressRepository } from './UserProgressRepository';
import { UserRepository } from './UserRepository';
import { UserScheduleRepository, ScheduleItemRepository } from './UserScheduleRepository';
import { VideoTutorialRepository } from './VideoTutorialRepository';
import { WorkoutExerciseRepository } from './WorkoutExerciseRepository';
import { WorkoutPlanRepository } from './WorkoutPlanRepository';
import { WorkoutSessionRepository } from './WorkoutSessionRepository';
import { WorkoutTagRepository } from './WorkoutTagRepository';
import { WorkoutRatingRepository } from './WorkoutRatingRepository';
import { FeedbackRepository } from './FeedbackRepository';
import { NotificationRepository } from './NotificationRepository';
import { AchievementRepository } from './AchievementRepository';
import { MetricTrackingRepository } from './MetricTrackingRepository';
import { UserEquipmentRepository } from './UserEquipmentRepository';
import { ExerciseRelationRepository } from './ExerciseRelationRepository';
import { ExerciseDetailsRepository } from './ExerciseDetailsRepository';

/**
 * Repository instances
 */
export const repositories = {
    aiModelConfiguration: new AIModelConfigurationRepository(),
    audioCue: new AudioCueRepository(),
    bodyMetric: new BodyMetricRepository(),
    equipment: new EquipmentRepository(),
    exerciseCategory: new ExerciseCategoryRepository(),
    exerciseFormAnalysis: new ExerciseFormAnalysisRepository(),
    exercise: new ExerciseRepository(),
    exerciseSpecificAnalysis: new ExerciseSpecificAnalysisRepository(),
    fitnessGoal: new FitnessGoalRepository(),
    media: new MediaRepository(),
    programEnrollment: new ProgramEnrollmentRepository(),
    programWorkout: new ProgramWorkoutRepository(),
    trainingProgram: new TrainingProgramRepository(),
    userActivity: new UserActivityRepository(),
    userProgress: new UserProgressRepository(),
    user: new UserRepository(),
    userSchedule: new UserScheduleRepository(),
    scheduleItem: new ScheduleItemRepository(),
    videoTutorial: new VideoTutorialRepository(),
    workoutExercise: new WorkoutExerciseRepository(),
    workoutPlan: new WorkoutPlanRepository(),
    workoutSession: new WorkoutSessionRepository(),
    workoutTag: new WorkoutTagRepository(),
    workoutRating: new WorkoutRatingRepository(),
    feedback: new FeedbackRepository(),
    notification: new NotificationRepository(),
    achievement: new AchievementRepository(),
    metricTracking: new MetricTrackingRepository(),
    userEquipment: new UserEquipmentRepository(),
    exerciseRelation: new ExerciseRelationRepository(),
    exerciseDetails: new ExerciseDetailsRepository()
}; 