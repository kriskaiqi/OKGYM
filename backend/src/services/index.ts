/**
 * Service layer exports
 * This file centralizes all service exports to simplify imports
 * 
 * As services are implemented, they should be added to this file.
 */

// Service interfaces
export * from './interfaces/BaseService';

// Core services
export * from './UserService';
export * from './authService';

// Exercise and workout services
export * from './ExerciseService';
// export * from './WorkoutPlanService';
// export * from './WorkoutSessionService';

// Tracking and progress services
// export * from './BodyMetricService';
export * from './MetricTrackingService';
// export * from './UserProgressService';

// Training program services
// export * from './TrainingProgramService';
// export * from './ProgramEnrollmentService';

// Engagement services
// export * from './NotificationService';
// export * from './AchievementService';
// export * from './FeedbackService';

// Import service classes
import { UserService } from './UserService';
import { AuthService } from './authService';
import { ExerciseService } from './ExerciseService';
import { MetricTrackingService } from './MetricTrackingService';
import { repositories } from '../repositories';
import { cacheManager } from './CacheManager';
import { MetricsService } from './MetricsService';
import { User } from '../models/User';
import { AppDataSource } from '../data-source';
import { UserRepository } from '../repositories/UserRepository';

// Create shared instances that can be reused
const metricsService = new MetricsService();

/**
 * Service instances
 * Provides a convenient way to get service instances
 * 
 * Uncomment services as they are implemented
 */
export const services = {
  // Core services
  user: new UserService(),
  auth: new AuthService(
    new UserRepository(),
    cacheManager,
    metricsService
  ),
  
  // Exercise and workout services
  // Remove direct instantiation of ExerciseService since it requires specific arguments
  // exercise: new ExerciseService(),
  // workoutPlan: new WorkoutPlanService(),
  // workoutSession: new WorkoutSessionService(),
  
  // Tracking and progress services
  // bodyMetric: new BodyMetricService(),
  metricTracking: new MetricTrackingService(),
  // userProgress: new UserProgressService(),
  
  // Training program services
  // trainingProgram: new TrainingProgramService(),
  // programEnrollment: new ProgramEnrollmentService(),
  
  // Engagement services
  // notification: new NotificationService(),
  // achievement: new AchievementService(),
  // feedback: new FeedbackService()
}; 