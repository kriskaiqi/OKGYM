import { DataSource } from "typeorm";
import { User } from "./models/User";
import { WorkoutSession } from "./models/WorkoutSession";
import { MetricTracking } from "./models/MetricTracking";
import { Feedback } from "./models/Feedback";
import { WorkoutRating } from "./models/WorkoutRating";
import { ExerciseFormAnalysis, FormCorrectionPoint } from "./models/ExerciseFormAnalysis";
import { Achievement } from "./models/Achievement";
import { ProgramEnrollment } from "./models/ProgramEnrollment";
import { WorkoutPlan } from "./models/WorkoutPlan";
import { TrainingProgram } from "./models/TrainingProgram";
import { Exercise } from "./models/Exercise";
import { ExerciseCategory } from "./models/ExerciseCategory";
import { BodyMetric } from "./models/BodyMetric";
import { Notification } from "./models/Notification";
import { FitnessGoal } from "./models/FitnessGoal";
import { Media } from "./models/Media";
import { VideoTutorial } from "./models/VideoTutorial";
import { Equipment } from "./models/Equipment";
import { WorkoutExercise } from "./models/WorkoutExercise";
import { ExerciseDetails } from "./models/ExerciseDetails";
import { WorkoutTag } from "./models/WorkoutTag";
import { ProgramWorkout } from "./models/ProgramWorkout";
import { UserProgress } from "./models/UserProgress";
import { UserActivity } from "./models/UserActivity";
import { AudioCue } from "./models/AudioCue";
import logger from "./utils/logger";

// Register all entities - this step is important for TypeORM to recognize entities
// This helps avoid "No metadata for Entity was found" errors
import "./models/index";

// Test database connectivity
export async function testDatabaseConnection() {
  try {
    logger.info('Testing database connection...');
    const testConnection = new DataSource({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "123456",
      database: process.env.DB_NAME || "okgym",
      synchronize: false,
      logging: true,
      entities: [
        User,
        WorkoutSession, 
        WorkoutPlan,
        Exercise,
        Achievement,
        BodyMetric,
        Notification,
        FitnessGoal,
        WorkoutExercise,
        // Include all entity classes explicitly
        MetricTracking,
        Feedback,
        WorkoutRating,
        ExerciseFormAnalysis,
        FormCorrectionPoint,
        ProgramEnrollment,
        TrainingProgram,
        ExerciseCategory,
        Media,
        VideoTutorial,
        Equipment,
        ExerciseDetails,
        WorkoutTag,
        ProgramWorkout,
        UserProgress,
        UserActivity,
        AudioCue
      ],
    });
    
    await testConnection.initialize();
    logger.info('Database connection test successful');
    await testConnection.destroy();
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      details: JSON.stringify(error, null, 2)
    });
    return false;
  }
}

/**
 * TypeORM DataSource configuration
 */
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "okgym",
    synchronize: false, // Disabled to prevent schema changes - using ID compatibility layer instead
    logging: process.env.NODE_ENV === "development",
    entities: [
      User,
      WorkoutSession, 
      WorkoutPlan,
      Exercise,
      Achievement,
      BodyMetric,
      Notification,
      FitnessGoal,
      WorkoutExercise,
      // Include all entity classes explicitly
      MetricTracking,
      Feedback,
      WorkoutRating,
      ExerciseFormAnalysis,
      FormCorrectionPoint,
      ProgramEnrollment,
      TrainingProgram,
      ExerciseCategory,
      Media,
      VideoTutorial,
      Equipment,
      ExerciseDetails,
      WorkoutTag,
      ProgramWorkout,
      UserProgress,
      UserActivity,
      AudioCue
    ],
    subscribers: [],
    migrations: [],
}); 