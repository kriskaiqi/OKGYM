import { Repository } from 'typeorm';
import { Exercise } from '../models/Exercise';
import { WorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { AppDataSource } from '../data-source';
import logger from '../utils/logger';
import { 
  Difficulty, 
  MeasurementType, 
  WorkoutCategory, 
  MuscleGroup as EnumMuscleGroup,
  ExerciseType,
  MovementPattern
} from '../models/shared/Enums';

// Type assertion helper function to convert between enum types
function convertMuscleGroups(groups: EnumMuscleGroup[]): any[] {
  return groups as any[];
}

export class DatabaseSeeder {
  private exerciseRepo: Repository<Exercise>;
  private workoutPlanRepo: Repository<WorkoutPlan>;
  private workoutExerciseRepo: Repository<WorkoutExercise>;

  constructor() {
    this.exerciseRepo = AppDataSource.getRepository(Exercise);
    this.workoutPlanRepo = AppDataSource.getRepository(WorkoutPlan);
    this.workoutExerciseRepo = AppDataSource.getRepository(WorkoutExercise);
  }

  /**
   * Seed the database with initial data
   */
  public async seedDatabase(): Promise<void> {
    await this.seedExercises();
    await this.seedWorkoutPlans();
  }

  /**
   * Seed exercises if none exist
   */
  private async seedExercises(): Promise<void> {
    const count = await this.exerciseRepo.count();
    
    if (count === 0) {
      logger.info('No exercises found in database. Seeding exercise data...');
      
      // Define exercise data
      const pushupData = new Exercise();
      pushupData.name = 'Push-up';
      pushupData.description = 'A classic bodyweight exercise that works your chest, shoulders, and triceps.';
      pushupData.measurementType = MeasurementType.REPS;
      pushupData.types = [ExerciseType.STRENGTH_COMPOUND];
      pushupData.level = Difficulty.BEGINNER;
      pushupData.movementPattern = MovementPattern.PUSH;
      pushupData.targetMuscleGroups = convertMuscleGroups([
        EnumMuscleGroup.CHEST, 
        EnumMuscleGroup.SHOULDERS, 
        EnumMuscleGroup.TRICEPS
      ]);
      pushupData.synergistMuscleGroups = convertMuscleGroups([
        EnumMuscleGroup.CORE
      ]);
      pushupData.trackingFeatures = [];
      
      const squatData = new Exercise();
      squatData.name = 'Squat';
      squatData.description = 'A fundamental lower body exercise that targets the quadriceps, hamstrings, and glutes.';
      squatData.measurementType = MeasurementType.REPS;
      squatData.types = [ExerciseType.STRENGTH_COMPOUND];
      squatData.level = Difficulty.BEGINNER;
      squatData.movementPattern = MovementPattern.SQUAT;
      squatData.targetMuscleGroups = convertMuscleGroups([
        EnumMuscleGroup.QUADRICEPS, 
        EnumMuscleGroup.HAMSTRINGS, 
        EnumMuscleGroup.GLUTES
      ]);
      squatData.synergistMuscleGroups = convertMuscleGroups([
        EnumMuscleGroup.CORE, 
        EnumMuscleGroup.LOWER_BACK
      ]);
      squatData.trackingFeatures = [];
      
      const plankData = new Exercise();
      plankData.name = 'Plank';
      plankData.description = 'An isometric core exercise that improves stability and strengthens the abdominals.';
      plankData.measurementType = MeasurementType.DURATION;
      plankData.types = [ExerciseType.CORE];
      plankData.level = Difficulty.BEGINNER;
      plankData.movementPattern = MovementPattern.CORE;
      plankData.targetMuscleGroups = convertMuscleGroups([
        EnumMuscleGroup.CORE, 
        EnumMuscleGroup.ABS
      ]);
      plankData.synergistMuscleGroups = convertMuscleGroups([
        EnumMuscleGroup.SHOULDERS, 
        EnumMuscleGroup.LOWER_BACK
      ]);
      plankData.trackingFeatures = [];
      
      const benchPressData = new Exercise();
      benchPressData.name = 'Bench Press';
      benchPressData.description = 'A compound upper-body exercise that targets the chest, shoulders, and triceps.';
      benchPressData.measurementType = MeasurementType.REPS;
      benchPressData.types = [ExerciseType.STRENGTH_COMPOUND];
      benchPressData.level = Difficulty.INTERMEDIATE;
      benchPressData.movementPattern = MovementPattern.PUSH;
      benchPressData.targetMuscleGroups = convertMuscleGroups([
        EnumMuscleGroup.CHEST, 
        EnumMuscleGroup.SHOULDERS, 
        EnumMuscleGroup.TRICEPS
      ]);
      benchPressData.synergistMuscleGroups = convertMuscleGroups([
        EnumMuscleGroup.CORE
      ]);
      benchPressData.trackingFeatures = [];
      
      const deadliftData = new Exercise();
      deadliftData.name = 'Deadlift';
      deadliftData.description = 'A compound exercise that works the entire posterior chain.';
      deadliftData.measurementType = MeasurementType.REPS;
      deadliftData.types = [ExerciseType.STRENGTH_COMPOUND];
      deadliftData.level = Difficulty.ADVANCED;
      deadliftData.movementPattern = MovementPattern.HINGE;
      deadliftData.targetMuscleGroups = convertMuscleGroups([
        EnumMuscleGroup.BACK, 
        EnumMuscleGroup.GLUTES, 
        EnumMuscleGroup.HAMSTRINGS
      ]);
      deadliftData.synergistMuscleGroups = convertMuscleGroups([
        EnumMuscleGroup.CORE, 
        EnumMuscleGroup.LOWER_BACK, 
        EnumMuscleGroup.FOREARMS
      ]);
      deadliftData.trackingFeatures = [];
      
      const exercises = [
        pushupData,
        squatData,
        plankData,
        benchPressData,
        deadliftData
      ];
      
      // Save exercises to database
      for (const exerciseData of exercises) {
        await this.exerciseRepo.save(exerciseData);
      }
      
      logger.info(`Successfully seeded ${exercises.length} exercises`);
    } else {
      logger.info(`Database already contains ${count} exercises. Skipping seed.`);
    }
  }
  
  /**
   * Seed workout plans if none exist
   */
  private async seedWorkoutPlans(): Promise<void> {
    const count = await this.workoutPlanRepo.count();
    
    if (count === 0) {
      logger.info('No workout plans found in database. Seeding workout plans...');
      
      // Get exercises for workouts
      const pushup = await this.exerciseRepo.findOne({ where: { name: 'Push-up' } });
      const squat = await this.exerciseRepo.findOne({ where: { name: 'Squat' } });
      const plank = await this.exerciseRepo.findOne({ where: { name: 'Plank' } });
      
      if (!pushup || !squat || !plank) {
        logger.error('Required exercises not found. Cannot seed workout plans.');
        return;
      }
      
      // Create a simple beginner workout
      const beginnerWorkout = new WorkoutPlan();
      beginnerWorkout.name = 'Beginner Full Body Workout';
      beginnerWorkout.description = 'A simple full-body workout for beginners using just bodyweight exercises.';
      beginnerWorkout.difficulty = Difficulty.BEGINNER;
      beginnerWorkout.estimatedDuration = 30;
      beginnerWorkout.isCustom = false;
      beginnerWorkout.workoutCategory = WorkoutCategory.FULL_BODY;
      beginnerWorkout.rating = 4.5;
      beginnerWorkout.ratingCount = 10;
      beginnerWorkout.popularity = 100;
      beginnerWorkout.estimatedCaloriesBurn = 150;
      
      await this.workoutPlanRepo.save(beginnerWorkout);
      
      // Add exercises to the workout
      const workoutExercise1 = new WorkoutExercise();
      workoutExercise1.workoutPlan = beginnerWorkout;
      workoutExercise1.exercise = pushup;
      workoutExercise1.order = 0;
      workoutExercise1.sets = 3;
      workoutExercise1.repetitions = 10;
      workoutExercise1.duration = 0;
      workoutExercise1.restTime = 60;
      
      const workoutExercise2 = new WorkoutExercise();
      workoutExercise2.workoutPlan = beginnerWorkout;
      workoutExercise2.exercise = squat;
      workoutExercise2.order = 1;
      workoutExercise2.sets = 3;
      workoutExercise2.repetitions = 15;
      workoutExercise2.duration = 0;
      workoutExercise2.restTime = 60;
      
      const workoutExercise3 = new WorkoutExercise();
      workoutExercise3.workoutPlan = beginnerWorkout;
      workoutExercise3.exercise = plank;
      workoutExercise3.order = 2;
      workoutExercise3.sets = 3;
      workoutExercise3.repetitions = 0;
      workoutExercise3.duration = 30;
      workoutExercise3.restTime = 60;
      
      const workoutExercises = [
        workoutExercise1,
        workoutExercise2,
        workoutExercise3
      ];
      
      for (const workoutExercise of workoutExercises) {
        await this.workoutExerciseRepo.save(workoutExercise);
      }
      
      logger.info('Successfully seeded 1 workout plan with 3 exercises');
    } else {
      logger.info(`Database already contains ${count} workout plans. Skipping seed.`);
    }
  }
} 