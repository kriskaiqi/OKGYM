import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { WorkoutSession } from '../models/WorkoutSession';
import { Achievement } from '../models/Achievement';
import { FitnessGoal } from '../models/FitnessGoal';
import { BodyMetric } from '../models/BodyMetric';
import { Notification } from '../models/Notification';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { Exercise } from '../models/Exercise';
import { ExerciseCategory } from '../models/ExerciseCategory';
import { Equipment } from '../models/Equipment';
import { WorkoutTag } from '../models/WorkoutTag';
import { Media } from '../models/Media';
import { WorkoutSummary } from '../models/WorkoutSession';
import { MetricTracking } from '../models/MetricTracking';
import { Feedback } from '../models/Feedback';
import { WorkoutRating } from '../models/WorkoutRating';
import { ExerciseFormAnalysis } from '../models/ExerciseFormAnalysis';
import { TrainingProgram } from '../models/TrainingProgram';
import { ProgramWorkout } from '../models/ProgramWorkout';
import { ProgramEnrollment } from '../models/ProgramEnrollment';
import { ExerciseDetails } from '../models/ExerciseDetails';
import { VideoTutorial } from '../models/VideoTutorial';
import { UserProgress } from '../models/UserProgress';
import { UserActivity } from '../models/UserActivity';

// Import all entities to ensure proper registration
import '../models/index';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'okgym',
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in development
  logging: process.env.NODE_ENV !== 'production',
  entities: [
    User,
    WorkoutSession,
    WorkoutPlan,
    WorkoutExercise, 
    Exercise,
    ExerciseCategory,
    Equipment,
    WorkoutTag,
    Achievement,
    FitnessGoal,
    BodyMetric,
    Notification,
    Media,
    MetricTracking,
    Feedback,
    WorkoutRating,
    ExerciseFormAnalysis,
    TrainingProgram,
    ProgramWorkout,
    ProgramEnrollment,
    ExerciseDetails,
    VideoTutorial,
    UserProgress,
    UserActivity
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts']
}); 