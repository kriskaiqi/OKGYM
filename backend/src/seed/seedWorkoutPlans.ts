import { WorkoutPlan } from '../models/WorkoutPlan';
import { WorkoutExercise } from '../models/WorkoutExercise';
import { Exercise } from '../models/Exercise';
import { WorkoutTag } from '../models/WorkoutTag';
import { ExerciseCategory, CategoryType } from '../models/ExerciseCategory';
import { Equipment } from '../models/Equipment';
import { Media, MediaType, MediaContext } from '../models/Media';
import { AppDataSource } from '../data-source';
import * as fs from 'fs';
import * as path from 'path';
import { 
  WorkoutCategory, 
  Difficulty, 
  SplitType, 
  FitnessGoal,
  ExerciseRole,
  SetType,
  SetStructure,
  MeasurementType,
  ProgressionType
} from '../models/shared/Enums';
import { 
  WorkoutMetadata,
  WorkoutStructure,
  ProgressionModel,
  WorkoutMetrics,
  ExerciseIntensity,
  ExerciseTempo,
  RangeOfMotion,
  ProgressionStrategy,
  SubstitutionOptions
} from '../models/shared/Validation';
import logger from '../utils/logger';
import { 
  ensureDirectory, 
  createPlaceholderFile, 
  createMediaRecord,
  mediaExistsForEntity
} from '../utils/mediaUtils';

/**
 * Seed the database with workout plans
 * Initially creating one plan to verify model integrity
 * 
 * NOTE: There is a mismatch between the TypeORM entity (which uses UUID) and 
 * the actual database schema (which uses integer with sequence). 
 * We need to accommodate this by NOT setting the ID and letting the database assign it.
 */
export async function seedWorkoutPlans(): Promise<void> {
  try {
    const workoutPlanRepository = AppDataSource.getRepository(WorkoutPlan);
    const exerciseRepository = AppDataSource.getRepository(Exercise);
    const workoutExerciseRepository = AppDataSource.getRepository(WorkoutExercise);
    const workoutTagRepository = AppDataSource.getRepository(WorkoutTag);
    const categoryRepository = AppDataSource.getRepository(ExerciseCategory);
    const equipmentRepository = AppDataSource.getRepository(Equipment);
    const mediaRepository = AppDataSource.getRepository(Media);
    
    // Check if we already have workout plans
    const existingCount = await workoutPlanRepository.count();
    if (existingCount > 0) {
      logger.info(`Database already has ${existingCount} workout plans. Skipping seed.`);
      return;
    }
    
    // Get available exercises
    const exercises = await exerciseRepository.find();
    if (exercises.length === 0) {
      logger.warn('No exercises found in the database. Cannot create workout plans.');
      return;
    }
    
    // Get available tags
    const tags = await workoutTagRepository.find();
    if (tags.length === 0) {
      logger.warn('No workout tags found in the database. Workout plans will be created without tags.');
    }
    
    // Get available muscle group categories
    const muscleGroups = await categoryRepository.find({
      where: { type: CategoryType.MUSCLE_GROUP }
    });
    if (muscleGroups.length === 0) {
      logger.warn('No muscle group categories found. Workout plans will be created without target muscle groups.');
    }
    
    // Get available equipment
    const equipment = await equipmentRepository.find();
    if (equipment.length === 0) {
      logger.warn('No equipment found. Workout plans will be created without equipment requirements.');
    }
    
    // Helper function to find exercises by name pattern
    const findExercisesByName = (namePatterns: string[]): Exercise[] => {
      return exercises.filter(exercise => 
        namePatterns.some(pattern => 
          exercise.name.toLowerCase().includes(pattern.toLowerCase())
        )
      );
    };
    
    // Helper function to find tags by name
    const findTagsByNames = (tagNames: string[]): WorkoutTag[] => {
      return tags.filter(tag => 
        tagNames.some(name => tag.name.toLowerCase() === name.toLowerCase())
      );
    };
    
    // Helper function to find muscle groups by name
    const findMuscleGroupsByNames = (muscleGroupNames: string[]): ExerciseCategory[] => {
      return muscleGroups.filter(mg => 
        muscleGroupNames.some(name => mg.name.toLowerCase() === name.toLowerCase())
      );
    };
    
    // Helper function to find equipment by name
    const findEquipmentByNames = (equipmentNames: string[]): Equipment[] => {
      return equipment.filter(eq => 
        equipmentNames.some(name => eq.name.toLowerCase() === name.toLowerCase())
      );
    };
    
    /**
     * Interface for exercise configuration when creating workout plans
     */
    interface ExerciseConfig {
      namePattern: string;
      order: number;
      sets: number;
      repetitions?: number;
      duration?: number;
      restTime: number;
      notes?: string;
      exerciseRole: ExerciseRole;
      setType: SetType;
      setStructure: SetStructure;
      preferredSubstitutes?: string[];
    }
    
    /**
     * Template function to create a new workout plan following the existing structure
     */
    async function createWorkoutPlan({
      name,
      description,
      difficulty,
      workoutCategory,
      estimatedDuration,
      rating = 4.5,
      ratingCount = 100,
      popularity = 80,
      estimatedCaloriesBurn = 350,
      targetMuscleGroupNames = [],
      workoutTagNames = [],
      equipmentNames = [],
      exerciseConfigs = [],
      fitnessGoals = [FitnessGoal.STRENGTH_GAIN, FitnessGoal.GENERAL_FITNESS],
    }: {
      name: string;
      description: string;
      difficulty: Difficulty;
      workoutCategory: WorkoutCategory;
      estimatedDuration: number;
      rating?: number;
      ratingCount?: number;
      popularity?: number;
      estimatedCaloriesBurn?: number;
      targetMuscleGroupNames?: string[];
      workoutTagNames?: string[];
      equipmentNames?: string[];
      exerciseConfigs?: ExerciseConfig[];
      fitnessGoals?: FitnessGoal[];
    }) {
      // 1. Create the workout plan with all required properties
      const workoutPlan = new WorkoutPlan();
      workoutPlan.name = name;
      workoutPlan.description = description;
      workoutPlan.difficulty = difficulty;
      workoutPlan.workoutCategory = workoutCategory;
      workoutPlan.estimatedDuration = estimatedDuration;
      workoutPlan.isCustom = false;
      workoutPlan.rating = rating;
      workoutPlan.ratingCount = ratingCount;
      workoutPlan.popularity = popularity;
      workoutPlan.estimatedCaloriesBurn = estimatedCaloriesBurn;
      
      // 2. Set up proper jsonb objects
      // Create metadata
      const metadata = new WorkoutMetadata();
      metadata.fitnessGoals = fitnessGoals;
      metadata.warmupIncluded = true;
      metadata.cooldownIncluded = true;
      workoutPlan.metadata = metadata;
      
      // Create workout structure
      const structure = new WorkoutStructure();
      structure.sets = 3;
      structure.circuits = 1;
      structure.rounds = 1;
      structure.restBetweenExercises = 60;
      structure.restBetweenSets = 60;
      workoutPlan.workoutStructure = structure;
      
      // Create progression model
      const progression = new ProgressionModel();
      progression.intensityIncreaseRate = 0.05;
      progression.volumeIncreaseRate = 0.1;
      progression.deloadFrequency = 6;
      progression.autoRegulate = true;
      progression.progressionType = ProgressionType.LINEAR;
      workoutPlan.progressionModel = progression;
      
      // Create metrics
      const metrics = new WorkoutMetrics();
      metrics.volumeLoad = 5000;
      metrics.density = 0.7;
      metrics.intensity = 0.6;
      metrics.totalTime = estimatedDuration * 60; // duration in seconds
      metrics.lastCalculated = new Date();
      metrics.totalRestTime = 600;
      metrics.estimatedCalories = estimatedCaloriesBurn;
      workoutPlan.metrics = metrics;
      
      // 3. Save the workout to get an ID
      const savedWorkout = await workoutPlanRepository.save(workoutPlan);
      logger.info(`Created workout plan with ID: ${savedWorkout.id}`);
      
      // 4. Set up relationships
      // Add target muscle groups
      const workoutMuscleGroups = findMuscleGroupsByNames(targetMuscleGroupNames);
      if (workoutMuscleGroups.length > 0) {
        savedWorkout.targetMuscleGroups = workoutMuscleGroups;
        await workoutPlanRepository.save(savedWorkout);
        logger.info(`Added ${workoutMuscleGroups.length} target muscle groups to workout plan`);
      }
      
      // Add workout tags
      const workoutTags = findTagsByNames(workoutTagNames);
      if (workoutTags.length > 0) {
        savedWorkout.tags = workoutTags;
        await workoutPlanRepository.save(savedWorkout);
        logger.info(`Added ${workoutTags.length} tags to workout plan`);
      }
      
      // Add equipment needed
      const workoutEquipment = findEquipmentByNames(equipmentNames);
      if (workoutEquipment.length > 0) {
        savedWorkout.equipmentNeeded = workoutEquipment;
        await workoutPlanRepository.save(savedWorkout);
        logger.info(`Added ${workoutEquipment.length} equipment items to workout plan`);
      }
      
      // 5. Add exercises to the workout
      for (const config of exerciseConfigs) {
        const matchingExercises = findExercisesByName([config.namePattern]);
        
        if (matchingExercises.length === 0) {
          logger.warn(`No exercise found matching "${config.namePattern}". Skipping.`);
          continue;
        }
        
        const exercise = matchingExercises[0];
        logger.info(`Found exercise for "${config.namePattern}": ${exercise.name} (ID: ${exercise.id})`);
        
        const workoutExercise = new WorkoutExercise();
        workoutExercise.exercise = exercise;
        workoutExercise.workoutPlan = savedWorkout;
        workoutExercise.order = config.order;
        workoutExercise.sets = config.sets;
        workoutExercise.exerciseRole = config.exerciseRole;
        workoutExercise.setType = config.setType;
        workoutExercise.setStructure = config.setStructure;
        
        // Set up the intensity object
        const intensity = new ExerciseIntensity();
        intensity.level = "moderate";
        intensity.rateOfPerceivedExertion = 7;
        intensity.percentOfOneRepMax = 70;
        intensity.weight = 0;
        intensity.resistance = 0;
        workoutExercise.intensity = intensity;
        
        // Set up tempo
        const tempo = new ExerciseTempo();
        tempo.eccentric = 2;
        tempo.pause = 0;
        tempo.concentric = 1;
        tempo.pauseAtTop = 0;
        workoutExercise.tempo = tempo;
        
        // Set up range of motion
        const rangeOfMotion = new RangeOfMotion();
        rangeOfMotion.partial = false;
        rangeOfMotion.partialType = undefined;
        rangeOfMotion.rangeRestriction = "Full range of motion";
        workoutExercise.rangeOfMotion = rangeOfMotion;
        
        // Set up progression strategy
        const progressionStrategy = new ProgressionStrategy();
        progressionStrategy.targetProgressionType = "reps_then_weight";
        progressionStrategy.progressionRate = 0.05;
        progressionStrategy.deloadFrequency = 4;
        progressionStrategy.autoRegulate = true;
        workoutExercise.progressionStrategy = progressionStrategy;
        
        // Set up substitution options
        const substitutionOptions = new SubstitutionOptions();
        substitutionOptions.allowRegressions = true;
        substitutionOptions.allowProgressions = true;
        substitutionOptions.allowEquipmentVariations = true;
        
        // Add exercise-specific alternatives
        if (config.preferredSubstitutes) {
          substitutionOptions.preferredSubstitutes = config.preferredSubstitutes;
        } else {
          // Default substitutions based on exercise name
          if (exercise.name.toLowerCase().includes('push-up')) {
            substitutionOptions.preferredSubstitutes = [
              "Incline Dumbbell Press", 
              "Dumbbell Bench Press", 
              "Decline Push-up"
            ];
          } else if (exercise.name.toLowerCase().includes('squat')) {
            substitutionOptions.preferredSubstitutes = [
              "Goblet Squat", 
              "Box Squat", 
              "Front Squat"
            ];
          } else if (exercise.name.toLowerCase().includes('plank')) {
            substitutionOptions.preferredSubstitutes = [
              "Side Plank", 
              "Bird Dog", 
              "Dead Bug"
            ];
          } else if (exercise.name.toLowerCase().includes('lunge')) {
            substitutionOptions.preferredSubstitutes = [
              "Walking Lunge", 
              "Bulgarian Split Squat", 
              "Step-Up"
            ];
          } else if (exercise.name.toLowerCase().includes('row')) {
            substitutionOptions.preferredSubstitutes = [
              "Bent-Over Row", 
              "Cable Row", 
              "T-Bar Row"
            ];
          } else if (exercise.name.toLowerCase().includes('crunch')) {
            substitutionOptions.preferredSubstitutes = [
              "Bicycle Crunch", 
              "Russian Twist", 
              "Hanging Leg Raise"
            ];
          }
        }
        
        workoutExercise.substitutionOptions = substitutionOptions;
        
        // Set repetitions or duration based on measurement type
        if (exercise.measurementType === MeasurementType.REPS && config.repetitions) {
          workoutExercise.repetitions = config.repetitions;
          workoutExercise.duration = 0;
        } else if (exercise.measurementType === MeasurementType.DURATION && config.duration) {
          workoutExercise.duration = config.duration;
          workoutExercise.repetitions = 0;
        } else if (config.repetitions) {
          workoutExercise.repetitions = config.repetitions;
          workoutExercise.duration = 0;
        } else if (config.duration) {
          workoutExercise.duration = config.duration;
          workoutExercise.repetitions = 0;
        }
        
        // Set rest time and notes
        workoutExercise.restTime = config.restTime;
        if (config.notes) {
          workoutExercise.notes = config.notes;
        }
        
        await workoutExerciseRepository.save(workoutExercise);
        logger.info(`Added exercise ${exercise.name} to workout plan at position ${config.order}`);
      }
      
      // 6. Create and add media for the workout plan
      logger.info(`Creating media for workout plan "${name}"...`);
      
      // Check if media already exists for this workout plan
      const hasImage = await mediaExistsForEntity(mediaRepository, savedWorkout.id, MediaType.IMAGE);
      const hasVideo = await mediaExistsForEntity(mediaRepository, savedWorkout.id, MediaType.VIDEO);
      
      if (!hasImage) {
        // Create thumbnail image media
        const imageMedia = createMediaRecord({
          type: MediaType.IMAGE,
          context: MediaContext.WORKOUT,
          entityName: savedWorkout.name,
          directory: 'workouts/images',
          entityId: savedWorkout.id,
          isPrimary: true,
          displayOrder: 1
        });
        
        // Create physical placeholder file
        const imagePath = path.join(imagesDir, imageMedia.filename);
        createPlaceholderFile(imagePath, savedWorkout.name);
        
        // Save image media
        const savedImageMedia = await mediaRepository.save(imageMedia);
        
        // Update workout plan with thumbnail reference
        savedWorkout.thumbnail_media_id = savedImageMedia.id;
        logger.info(`Added thumbnail image for workout plan: ${savedImageMedia.id}`);
      }
      
      if (!hasVideo) {
        // Create demonstration video media
        const videoMedia = createMediaRecord({
          type: MediaType.VIDEO,
          context: MediaContext.WORKOUT,
          entityName: savedWorkout.name,
          directory: 'workouts/videos',
          entityId: savedWorkout.id,
          isPrimary: true,
          displayOrder: 1
        });
        
        // Create physical placeholder file
        const videoPath = path.join(videosDir, videoMedia.filename);
        createPlaceholderFile(videoPath, savedWorkout.name, true);
        
        // Save video media
        const savedVideoMedia = await mediaRepository.save(videoMedia);
        
        // Update workout plan with video reference
        savedWorkout.video_media_id = savedVideoMedia.id;
        logger.info(`Added demonstration video for workout plan: ${savedVideoMedia.id}`);
      }
      
      // Save the updated workout plan with media references
      await workoutPlanRepository.save(savedWorkout);
      logger.info(`Completed creating workout plan with media: "${savedWorkout.name}"`);
      
      return savedWorkout;
    }
    
    // Create a single well-structured workout plan that matches the model
    logger.info('Creating initial workout plan...');
    
    // 1. Create the workout plan with all required properties
    // NOTE: Do not set the id field, let the database assign it using the sequence
    const fullBodyBeginnerWorkout = new WorkoutPlan();
    fullBodyBeginnerWorkout.name = 'Beginner Full Body Workout';
    fullBodyBeginnerWorkout.description = 'A comprehensive full-body workout designed for beginners to build strength and endurance across all major muscle groups.';
    fullBodyBeginnerWorkout.difficulty = Difficulty.BEGINNER;
    fullBodyBeginnerWorkout.workoutCategory = WorkoutCategory.FULL_BODY;
    fullBodyBeginnerWorkout.estimatedDuration = 30; // 30 minutes
    fullBodyBeginnerWorkout.isCustom = false;
    fullBodyBeginnerWorkout.rating = 4.5;
    fullBodyBeginnerWorkout.ratingCount = 120;
    fullBodyBeginnerWorkout.popularity = 95;
    fullBodyBeginnerWorkout.estimatedCaloriesBurn = 350;
    
    // 2. Set up proper jsonb objects
    // Create metadata
    const metadata = new WorkoutMetadata();
    metadata.fitnessGoals = [FitnessGoal.STRENGTH_GAIN, FitnessGoal.GENERAL_FITNESS];
    metadata.warmupIncluded = true;
    metadata.cooldownIncluded = true;
    fullBodyBeginnerWorkout.metadata = metadata;
    
    // Create workout structure
    const structure = new WorkoutStructure();
    structure.sets = 3;
    structure.circuits = 1;
    structure.rounds = 1;
    structure.restBetweenExercises = 60;
    structure.restBetweenSets = 60;
    fullBodyBeginnerWorkout.workoutStructure = structure;
    
    // Create progression model
    const progression = new ProgressionModel();
    progression.intensityIncreaseRate = 0.05; // 5% increase
    progression.volumeIncreaseRate = 0.1; // 10% increase
    progression.deloadFrequency = 6; // Every 6 weeks
    progression.autoRegulate = true;
    progression.progressionType = ProgressionType.LINEAR;
    fullBodyBeginnerWorkout.progressionModel = progression;
    
    // Create metrics
    const metrics = new WorkoutMetrics();
    metrics.volumeLoad = 5000;
    metrics.density = 0.7;
    metrics.intensity = 0.6;
    metrics.totalTime = 1800; // 30 minutes in seconds
    metrics.lastCalculated = new Date();
    metrics.totalRestTime = 600; // 10 minutes in seconds
    metrics.estimatedCalories = 350;
    fullBodyBeginnerWorkout.metrics = metrics;
    
    // 3. Save the workout to get an ID - let the database assign the integer ID
    const savedWorkout = await workoutPlanRepository.save(fullBodyBeginnerWorkout);
    logger.info(`Created workout plan with ID: ${savedWorkout.id}`);
    
    // 4. Set up relationships
    // Add target muscle groups
    const targetMuscleGroupNames = ['Chest', 'Back', 'Shoulders', 'Quadriceps', 'Hamstrings', 'Core'];
    const workoutMuscleGroups = findMuscleGroupsByNames(targetMuscleGroupNames);
    if (workoutMuscleGroups.length > 0) {
      savedWorkout.targetMuscleGroups = workoutMuscleGroups;
      await workoutPlanRepository.save(savedWorkout);
      logger.info(`Added ${workoutMuscleGroups.length} target muscle groups to workout plan`);
    }
    
    // Add workout tags
    const workoutTagNames = ['Beginner', 'Full Body', 'Strength'];
    const workoutTags = findTagsByNames(workoutTagNames);
    if (workoutTags.length > 0) {
      savedWorkout.tags = workoutTags;
      await workoutPlanRepository.save(savedWorkout);
      logger.info(`Added ${workoutTags.length} tags to workout plan`);
    }
    
    // Add equipment needed
    const equipmentNames = ['Dumbbells', 'Bench', 'Resistance Bands'];
    const workoutEquipment = findEquipmentByNames(equipmentNames);
    if (workoutEquipment.length > 0) {
      savedWorkout.equipmentNeeded = workoutEquipment;
      await workoutPlanRepository.save(savedWorkout);
      logger.info(`Added ${workoutEquipment.length} equipment items to workout plan`);
    }
    
    // 5. Add exercises to the workout
    // Define the exercises for this workout
    const workoutExerciseConfigs = [
      {
        namePattern: 'Push-up',
        order: 1,
        sets: 3,
        repetitions: 10,
        restTime: 60,
        notes: 'Focus on proper form, modify by performing on knees if needed.',
        exerciseRole: ExerciseRole.PRIMARY,
        setType: SetType.NORMAL,
        setStructure: SetStructure.REGULAR
      },
      {
        namePattern: 'Bodyweight Squat',
        order: 2,
        sets: 3,
        repetitions: 12,
        restTime: 60,
        notes: 'Lower until thighs are parallel to ground if possible.',
        exerciseRole: ExerciseRole.PRIMARY,
        setType: SetType.NORMAL,
        setStructure: SetStructure.REGULAR
      },
      {
        namePattern: 'Plank',
        order: 3,
        sets: 3,
        duration: 30,
        restTime: 60,
        notes: 'Hold position with straight line from head to heels.',
        exerciseRole: ExerciseRole.ACCESSORY,
        setType: SetType.NORMAL,
        setStructure: SetStructure.REGULAR
      },
      {
        namePattern: 'Forward Lunge',
        order: 4,
        sets: 2,
        repetitions: 10,
        restTime: 60,
        notes: '10 reps each leg.',
        exerciseRole: ExerciseRole.SECONDARY,
        setType: SetType.NORMAL,
        setStructure: SetStructure.REGULAR
      },
      {
        namePattern: 'Seated Row',
        order: 5,
        sets: 3,
        repetitions: 10,
        restTime: 60,
        notes: 'Pull elbows straight back, squeezing shoulder blades.',
        exerciseRole: ExerciseRole.PRIMARY,
        setType: SetType.NORMAL,
        setStructure: SetStructure.REGULAR
      },
      {
        namePattern: 'Crunch',
        order: 6,
        sets: 3,
        repetitions: 15,
        restTime: 60,
        notes: 'Focus on controlled movement through full range of motion.',
        exerciseRole: ExerciseRole.ACCESSORY,
        setType: SetType.NORMAL,
        setStructure: SetStructure.REGULAR
      }
    ];
    
    // Add each exercise to the workout
    for (const config of workoutExerciseConfigs) {
      const matchingExercises = findExercisesByName([config.namePattern]);
      
      if (matchingExercises.length === 0) {
        logger.warn(`No exercise found matching "${config.namePattern}". Skipping.`);
        continue;
      }
      
      const exercise = matchingExercises[0]; // Use the first matching exercise
      logger.info(`Found exercise for "${config.namePattern}": ${exercise.name} (ID: ${exercise.id})`);
      
      const workoutExercise = new WorkoutExercise();
      workoutExercise.exercise = exercise;
      workoutExercise.workoutPlan = savedWorkout;
      workoutExercise.order = config.order;
      workoutExercise.sets = config.sets;
      workoutExercise.exerciseRole = config.exerciseRole;
      workoutExercise.setType = config.setType;
      workoutExercise.setStructure = config.setStructure;
      
      // Set up the intensity object
      const intensity = new ExerciseIntensity();
      intensity.level = "moderate";
      intensity.rateOfPerceivedExertion = 7;
      intensity.percentOfOneRepMax = 70;
      intensity.weight = 0; // Bodyweight by default
      intensity.resistance = 0;
      workoutExercise.intensity = intensity;
      
      // Set up tempo (speed of movement)
      const tempo = new ExerciseTempo();
      tempo.eccentric = 2;  // seconds lowering
      tempo.pause = 0;      // seconds pausing at bottom
      tempo.concentric = 1; // seconds lifting
      tempo.pauseAtTop = 0; // seconds pausing at top
      workoutExercise.tempo = tempo;
      
      // Set up range of motion
      const rangeOfMotion = new RangeOfMotion();
      rangeOfMotion.partial = false;
      rangeOfMotion.partialType = undefined;
      rangeOfMotion.rangeRestriction = "Full range of motion";
      workoutExercise.rangeOfMotion = rangeOfMotion;
      
      // Set up progression strategy
      const progressionStrategy = new ProgressionStrategy();
      progressionStrategy.targetProgressionType = "reps_then_weight";
      progressionStrategy.progressionRate = 0.05;
      progressionStrategy.deloadFrequency = 4;
      progressionStrategy.autoRegulate = true;
      workoutExercise.progressionStrategy = progressionStrategy;
      
      // Set up substitution options
      const substitutionOptions = new SubstitutionOptions();
      substitutionOptions.allowRegressions = true;
      substitutionOptions.allowProgressions = true;
      substitutionOptions.allowEquipmentVariations = true;
      
      // Add exercise-specific alternatives
      if (exercise.name.toLowerCase().includes('push-up')) {
        substitutionOptions.preferredSubstitutes = [
          "Incline Dumbbell Press", 
          "Dumbbell Bench Press", 
          "Decline Push-up"
        ];
      } else if (exercise.name.toLowerCase().includes('squat')) {
        substitutionOptions.preferredSubstitutes = [
          "Goblet Squat", 
          "Box Squat", 
          "Front Squat"
        ];
      } else if (exercise.name.toLowerCase().includes('plank')) {
        substitutionOptions.preferredSubstitutes = [
          "Side Plank", 
          "Bird Dog", 
          "Dead Bug"
        ];
      } else if (exercise.name.toLowerCase().includes('lunge')) {
        substitutionOptions.preferredSubstitutes = [
          "Walking Lunge", 
          "Bulgarian Split Squat", 
          "Step-Up"
        ];
      } else if (exercise.name.toLowerCase().includes('row')) {
        substitutionOptions.preferredSubstitutes = [
          "Bent-Over Row", 
          "Cable Row", 
          "T-Bar Row"
        ];
      } else if (exercise.name.toLowerCase().includes('crunch')) {
        substitutionOptions.preferredSubstitutes = [
          "Bicycle Crunch", 
          "Russian Twist", 
          "Hanging Leg Raise"
        ];
      }
      
      workoutExercise.substitutionOptions = substitutionOptions;
      
      // Set repetitions or duration based on the exercise's measurement type
      if (exercise.measurementType === MeasurementType.REPS && config.repetitions) {
        workoutExercise.repetitions = config.repetitions;
        workoutExercise.duration = 0;
      } else if (exercise.measurementType === MeasurementType.DURATION && config.duration) {
        workoutExercise.duration = config.duration;
        workoutExercise.repetitions = 0;
      } else if (config.repetitions) {
        workoutExercise.repetitions = config.repetitions;
        workoutExercise.duration = 0;
      } else if (config.duration) {
        workoutExercise.duration = config.duration;
        workoutExercise.repetitions = 0;
      }
      
      // Set rest time and notes
      workoutExercise.restTime = config.restTime;
      if (config.notes) {
        workoutExercise.notes = config.notes;
      }
      
      const savedExercise = await workoutExerciseRepository.save(workoutExercise);
      logger.info(`Added exercise ${exercise.name} to workout plan at position ${config.order}`);
    }
    
    logger.info(`Successfully created workout plan "${savedWorkout.name}" with exercises`);
    
    // 6. Create and add media for the workout plan
    logger.info('Creating media for workout plan...');
    
    // Create directories for workout plan media
    const imagesDir = ensureDirectory(path.join(process.cwd(), 'public', 'static', 'workouts', 'images'));
    const videosDir = ensureDirectory(path.join(process.cwd(), 'public', 'static', 'workouts', 'videos'));
    
    logger.info(`Media directories prepared at:
      - Images: ${imagesDir}
      - Videos: ${videosDir}`);
    
    // Check if media already exists for this workout plan
    const hasImage = await mediaExistsForEntity(mediaRepository, savedWorkout.id, MediaType.IMAGE);
    const hasVideo = await mediaExistsForEntity(mediaRepository, savedWorkout.id, MediaType.VIDEO);
    
    if (!hasImage) {
      // Create thumbnail image media
      const imageMedia = createMediaRecord({
        type: MediaType.IMAGE,
        context: MediaContext.WORKOUT,
        entityName: savedWorkout.name,
        directory: 'workouts/images',
        entityId: savedWorkout.id,
        isPrimary: true,
        displayOrder: 1
      });
      
      // Create physical placeholder file
      const imagePath = path.join(imagesDir, imageMedia.filename);
      createPlaceholderFile(imagePath, savedWorkout.name);
      
      // Save image media
      const savedImageMedia = await mediaRepository.save(imageMedia);
      
      // Update workout plan with thumbnail reference
      savedWorkout.thumbnail_media_id = savedImageMedia.id;
      logger.info(`Added thumbnail image for workout plan: ${savedImageMedia.id}`);
    }
    
    if (!hasVideo) {
      // Create demonstration video media
      const videoMedia = createMediaRecord({
        type: MediaType.VIDEO,
        context: MediaContext.WORKOUT,
        entityName: savedWorkout.name,
        directory: 'workouts/videos',
        entityId: savedWorkout.id,
        isPrimary: true,
        displayOrder: 1
      });
      
      // Create physical placeholder file
      const videoPath = path.join(videosDir, videoMedia.filename);
      createPlaceholderFile(videoPath, savedWorkout.name, true);
      
      // Save video media
      const savedVideoMedia = await mediaRepository.save(videoMedia);
      
      // Update workout plan with video reference
      savedWorkout.video_media_id = savedVideoMedia.id;
      logger.info(`Added demonstration video for workout plan: ${savedVideoMedia.id}`);
    }
    
    // Save the updated workout plan with media references
    await workoutPlanRepository.save(savedWorkout);
    
    logger.info(`Completed creating workout plan with media: "${savedWorkout.name}"`);
    
    // Now create a second workout plan using the template function
    logger.info('Creating intermediate upper body workout plan...');
    
    // Define a new workout plan
    await createWorkoutPlan({
      name: 'Intermediate Upper Body Strength',
      description: 'An upper body-focused workout for intermediate lifters targeting chest, back, shoulders, and arms with progressive overload principles.',
      difficulty: Difficulty.INTERMEDIATE,
      workoutCategory: WorkoutCategory.UPPER_BODY,
      estimatedDuration: 45,
      rating: 4.7,
      ratingCount: 85,
      popularity: 88,
      estimatedCaloriesBurn: 400,
      targetMuscleGroupNames: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
      workoutTagNames: ['Intermediate', 'Upper Body', 'Strength', 'Hypertrophy'],
      equipmentNames: ['Dumbbells', 'Bench', 'Pull-up Bar', 'Barbells'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.MUSCLE_BUILDING],
      exerciseConfigs: [
        {
          namePattern: 'Bench Press',
          order: 1,
          sets: 4,
          repetitions: 8,
          restTime: 90,
          notes: 'Focus on controlled movement. Keep shoulders back and down.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Pull-up',
          order: 2,
          sets: 3,
          repetitions: 10,
          restTime: 90,
          notes: 'Use full range of motion. Assisted if necessary.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Shoulder Press',
          order: 3,
          sets: 3,
          repetitions: 10,
          restTime: 75,
          notes: 'Keep core tight and avoid arching back.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bicep Curl',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Avoid swinging. Focus on the contraction.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Tricep Extension',
          order: 5,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Keep elbows stationary throughout the movement.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Lateral Raise',
          order: 6,
          sets: 3,
          repetitions: 15,
          restTime: 60,
          notes: 'Use lighter weight with perfect form.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a third workout plan - Beginner Bodyweight Basics
    logger.info('Creating Beginner Bodyweight Basics workout plan...');
    
    // Define the beginner bodyweight basics workout plan
    await createWorkoutPlan({
      name: 'Beginner Bodyweight Basics',
      description: 'An introductory bodyweight workout focusing on foundational movement patterns and proper form. Perfect for beginners with no equipment.',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.FULL_BODY,
      estimatedDuration: 25,
      rating: 4.8,
      ratingCount: 115,
      popularity: 92,
      estimatedCaloriesBurn: 250,
      targetMuscleGroupNames: ['Chest', 'Back', 'Shoulders', 'Core', 'Quadriceps', 'Hamstrings', 'Glutes'],
      workoutTagNames: ['Beginner', 'Full Body', 'Strength', 'Circuit'],
      equipmentNames: [], // No equipment required
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.GENERAL_FITNESS],
      exerciseConfigs: [
        {
          namePattern: 'Push-up',
          order: 1,
          sets: 3,
          repetitions: 8,
          restTime: 60,
          notes: 'Modify to knees if needed. Focus on maintaining a straight line from head to heels.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bodyweight Squat',
          order: 2,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Keep your weight in your heels and chest up throughout the movement.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Plank',
          order: 3,
          sets: 3,
          duration: 20,
          restTime: 45,
          notes: 'Focus on keeping your body in a straight line and core engaged.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bird Dog',
          order: 4,
          sets: 2,
          repetitions: 10,
          restTime: 45,
          notes: '10 reps each side. Move slowly and with control.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Glute Bridge',
          order: 5,
          sets: 3,
          repetitions: 12,
          restTime: 45,
          notes: 'Squeeze glutes at the top of the movement and hold briefly.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Mountain Climbers',
          order: 6,
          sets: 2,
          duration: 30,
          restTime: 45,
          notes: 'Keep your hips low and core engaged throughout.',
          exerciseRole: ExerciseRole.FINISHER,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a fourth workout plan - Beginner Stability & Core
    logger.info('Creating Beginner Stability & Core workout plan...');
    
    // Define the beginner stability and core workout plan
    await createWorkoutPlan({
      name: 'Beginner Stability & Core',
      description: 'A beginner-friendly workout focusing on core strength, balance and stability. Ideal for building a strong foundation for more advanced training.',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.CORE,
      estimatedDuration: 30,
      rating: 4.6,
      ratingCount: 85,
      popularity: 82,
      estimatedCaloriesBurn: 220,
      targetMuscleGroupNames: ['Core', 'Abs', 'Obliques', 'Lower Back', 'Shoulders', 'Glutes'],
      workoutTagNames: ['Beginner', 'Core', 'Stability', 'Mobility'],
      equipmentNames: ['Stability Ball', 'Resistance Bands'],
      fitnessGoals: [FitnessGoal.GENERAL_FITNESS, FitnessGoal.STRENGTH_GAIN],
      exerciseConfigs: [
        {
          namePattern: 'Plank',
          order: 1,
          sets: 3,
          duration: 30,
          restTime: 45,
          notes: 'Focus on maintaining a neutral spine position. Brace your core throughout.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Side Plank',
          order: 2,
          sets: 2,
          duration: 20,
          restTime: 45,
          notes: '20 seconds each side. Keep your hips lifted and maintain a straight line.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Dead Bug',
          order: 3,
          sets: 3,
          repetitions: 10,
          restTime: 45,
          notes: 'Keep lower back pressed into the floor. Move with control and coordinate with breathing.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bird Dog',
          order: 4,
          sets: 3,
          repetitions: 8,
          restTime: 45,
          notes: '8 reps each side. Maintain a neutral spine and move slowly.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Glute Bridge',
          order: 5,
          sets: 3,
          repetitions: 12,
          restTime: 45,
          notes: 'Focus on posterior pelvic tilt at the top of the movement. Squeeze glutes.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Pallof Press',
          order: 6,
          sets: 2,
          repetitions: 10,
          restTime: 45,
          notes: '10 reps each side. Resist rotation as you press the band forward.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bicycle Crunch',
          order: 7,
          sets: 2,
          repetitions: 12,
          restTime: 45,
          notes: 'Focus on controlled movement rather than speed. 12 reps each side.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a fifth workout plan - Beginner Circuit Training
    logger.info('Creating Beginner Circuit Training workout plan...');
    
    // Define the beginner circuit training workout plan
    await createWorkoutPlan({
      name: 'Beginner Circuit Training',
      description: 'An energetic circuit-style workout for beginners that combines strength and cardio exercises for a full-body training experience. Great for building endurance and burning calories.',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.CIRCUIT,
      estimatedDuration: 35,
      rating: 4.7,
      ratingCount: 95,
      popularity: 88,
      estimatedCaloriesBurn: 320,
      targetMuscleGroupNames: ['Chest', 'Back', 'Shoulders', 'Core', 'Quadriceps', 'Hamstrings', 'Glutes'],
      workoutTagNames: ['Beginner', 'Circuit', 'Full Body', 'Cardio'],
      equipmentNames: ['Dumbbells', 'Kettlebell', 'Jump Rope', 'Yoga Mat'],
      fitnessGoals: [FitnessGoal.GENERAL_FITNESS, FitnessGoal.ENDURANCE, FitnessGoal.FAT_LOSS],
      exerciseConfigs: [
        {
          namePattern: 'Jumping Jack',
          order: 1,
          sets: 3,
          duration: 30,
          restTime: 15,
          notes: 'Focus on maintaining a good rhythm and keeping your core engaged.',
          exerciseRole: ExerciseRole.WARMUP,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Push-up',
          order: 2,
          sets: 3,
          repetitions: 8,
          restTime: 15,
          notes: 'Modify on knees if needed. Focus on controlled movement and full range of motion.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bodyweight Squat',
          order: 3,
          sets: 3,
          repetitions: 12,
          restTime: 15,
          notes: 'Keep weight in heels and chest up. Squat to a comfortable depth with good form.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Mountain Climbers',
          order: 4,
          sets: 3,
          duration: 30,
          restTime: 15,
          notes: 'Maintain plank position with hips low. Move at a moderate pace with control.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bent-Over Row',
          order: 5,
          sets: 3,
          repetitions: 10,
          restTime: 15,
          notes: 'Use light dumbbells. Keep back flat and pull elbows back.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Forward Lunge',
          order: 6,
          sets: 3,
          repetitions: 8,
          restTime: 15,
          notes: '8 reps each leg. Step forward with control and maintain upright posture.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Plank',
          order: 7,
          sets: 3,
          duration: 20,
          restTime: 15,
          notes: 'Focus on maintaining a straight line from head to heels. Brace your core.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'High Knees',
          order: 8,
          sets: 3,
          duration: 30,
          restTime: 60,
          notes: 'Drive knees up toward chest. Maintain an upright posture. This is the last exercise in the circuit before repeating.',
          exerciseRole: ExerciseRole.FINISHER,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a sixth workout plan - Beginner Upper Body
    logger.info('Creating Beginner Upper Body workout plan...');
    
    // Define the beginner upper body workout plan
    await createWorkoutPlan({
      name: 'Beginner Upper Body',
      description: 'A focused upper body workout designed for beginners to build strength in the chest, back, shoulders, and arms using simple, effective exercises.',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.UPPER_BODY,
      estimatedDuration: 30,
      rating: 4.6,
      ratingCount: 88,
      popularity: 85,
      estimatedCaloriesBurn: 280,
      targetMuscleGroupNames: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
      workoutTagNames: ['Beginner', 'Upper Body', 'Strength'],
      equipmentNames: ['Dumbbells', 'Resistance Bands', 'Bench'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.MUSCLE_BUILDING],
      exerciseConfigs: [
        {
          namePattern: 'Push-up',
          order: 1,
          sets: 3,
          repetitions: 8,
          restTime: 60,
          notes: 'Begin with wall push-ups or knee push-ups if standard push-ups are too challenging. Focus on maintaining a straight line from head to heels.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Seated Row',
          order: 2,
          sets: 3,
          repetitions: 10,
          restTime: 60,
          notes: 'Use resistance bands secured around a stable object. Pull elbows back while squeezing shoulder blades together.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Dumbbell Shoulder Press',
          order: 3,
          sets: 3,
          repetitions: 10,
          restTime: 60,
          notes: 'Start with light dumbbells. Keep core engaged and avoid arching your back.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Hammer Curl',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Maintain good posture and avoid swinging the weights. Keep elbows close to the body.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Tricep Pushdown',
          order: 5,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Use resistance bands secured at an overhead position. Keep elbows close to your sides throughout the movement.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Lateral Raise',
          order: 6,
          sets: 2,
          repetitions: 12,
          restTime: 60,
          notes: 'Use very light dumbbells. Raise arms to shoulder height with a slight bend in the elbows.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a seventh workout plan - Beginner Lower Body
    logger.info('Creating Beginner Lower Body workout plan...');
    
    // Define the beginner lower body workout plan
    await createWorkoutPlan({
      name: 'Beginner Lower Body',
      description: 'A beginner-friendly workout focusing on the lower body to build strength, stability, and mobility in the legs, glutes, and hips.',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.LOWER_BODY,
      estimatedDuration: 30,
      rating: 4.5,
      ratingCount: 92,
      popularity: 84,
      estimatedCaloriesBurn: 290,
      targetMuscleGroupNames: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core'],
      workoutTagNames: ['Beginner', 'Lower Body', 'Strength', 'Mobility'],
      equipmentNames: ['Dumbbells', 'Resistance Bands'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.MOBILITY],
      exerciseConfigs: [
        {
          namePattern: 'Bodyweight Squat',
          order: 1,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Focus on proper form with weight in heels, knees tracking over toes, and chest up. Descend until thighs are parallel to floor, if possible.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Glute Bridge',
          order: 2,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Squeeze glutes at the top of the movement and hold for 2 seconds. Focus on posterior pelvic tilt.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Forward Lunge',
          order: 3,
          sets: 2,
          repetitions: 10,
          restTime: 60,
          notes: '10 reps per leg. Step forward with control, keeping front knee over ankle. Return to starting position by pushing through the front heel.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Leg Curl',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Use resistance bands secured to a stable object around ankles. Maintain hip alignment throughout the movement.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Standing Calf Raise',
          order: 5,
          sets: 3,
          repetitions: 15,
          restTime: 45,
          notes: 'Rise up onto toes as high as possible, then lower with control. Can be done on a step for increased range of motion.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create an eighth workout plan - Beginner Push Workout
    logger.info('Creating Beginner Push Workout plan...');
    
    // Define the beginner push workout plan
    await createWorkoutPlan({
      name: 'Beginner Push Workout',
      description: 'A push-focused workout for beginners targeting chest, shoulders, and triceps with simple, effective movements to build pushing strength.',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.PUSH,
      estimatedDuration: 25,
      rating: 4.5,
      ratingCount: 80,
      popularity: 82,
      estimatedCaloriesBurn: 250,
      targetMuscleGroupNames: ['Chest', 'Shoulders', 'Triceps'],
      workoutTagNames: ['Beginner', 'Push', 'Strength'],
      equipmentNames: ['Dumbbells', 'Bench'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.MUSCLE_BUILDING],
      exerciseConfigs: [
        {
          namePattern: 'Push-up',
          order: 1,
          sets: 3,
          repetitions: 8,
          restTime: 60,
          notes: 'Modify on knees if needed. Focus on maintaining a straight line from head to heels and full range of motion.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Dumbbell Bench Press',
          order: 2,
          sets: 3,
          repetitions: 10,
          restTime: 60,
          notes: 'Use light dumbbells and focus on controlled movement. Lower weights until elbows are at a 90-degree angle.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Dumbbell Shoulder Press',
          order: 3,
          sets: 3,
          repetitions: 8,
          restTime: 60,
          notes: 'Keep core engaged and avoid arching back. Press weights directly overhead with control.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Tricep Pushdown',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Use resistance bands. Keep elbows close to body and fully extend arms, focusing on triceps contraction.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Lateral Raise',
          order: 5,
          sets: 2,
          repetitions: 12,
          restTime: 45,
          notes: 'Use light weights. Raise arms to shoulder height with slight bend in elbows. Focus on controlled movement.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a ninth workout plan - Beginner Pull Workout
    logger.info('Creating Beginner Pull Workout plan...');
    
    // Define the beginner pull workout plan
    await createWorkoutPlan({
      name: 'Beginner Pull Workout',
      description: 'A pull-focused workout for beginners targeting back and biceps with fundamental pulling movements to develop posterior chain strength.',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.PULL,
      estimatedDuration: 25,
      rating: 4.4,
      ratingCount: 75,
      popularity: 80,
      estimatedCaloriesBurn: 240,
      targetMuscleGroupNames: ['Back', 'Biceps', 'Shoulders'],
      workoutTagNames: ['Beginner', 'Pull', 'Strength'],
      equipmentNames: ['Resistance Bands', 'Dumbbells'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.MUSCLE_BUILDING],
      exerciseConfigs: [
        {
          namePattern: 'Seated Row',
          order: 1,
          sets: 3,
          repetitions: 10,
          restTime: 60,
          notes: 'Use resistance bands secured to a stable object. Sit with legs extended, pull bands toward torso while squeezing shoulder blades together.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Lat Pulldown',
          order: 2,
          sets: 3,
          repetitions: 10,
          restTime: 60,
          notes: 'Use resistance bands secured overhead. Pull bands down toward shoulders with arms slightly wider than shoulder-width.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bent-Over Row',
          order: 3,
          sets: 3,
          repetitions: 10,
          restTime: 60,
          notes: 'Use light dumbbells. Hinge at hips with flat back, pull weights toward torso keeping elbows close to body.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Hammer Curl',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Use light dumbbells with palms facing each other. Keep elbows close to sides and avoid swinging the weights.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Face Pull',
          order: 5,
          sets: 2,
          repetitions: 12,
          restTime: 45,
          notes: 'Use resistance bands secured at head height. Pull bands toward face with elbows high, focusing on rear deltoids.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a tenth workout plan - Beginner Mobility & Flexibility
    logger.info('Creating Beginner Mobility & Flexibility workout plan...');
    
    // Define the beginner mobility and flexibility workout plan
    await createWorkoutPlan({
      name: 'Beginner Mobility & Flexibility',
      description: 'A comprehensive mobility-focused routine designed to improve joint range of motion, reduce stiffness, and enhance overall flexibility for beginners.',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.FLEXIBILITY,
      estimatedDuration: 30,
      rating: 4.7,
      ratingCount: 95,
      popularity: 86,
      estimatedCaloriesBurn: 180,
      targetMuscleGroupNames: ['Full Body', 'Shoulders', 'Hips', 'Back', 'Chest', 'Hamstrings'],
      workoutTagNames: ['Beginner', 'Mobility', 'Flexibility', 'Recovery'],
      equipmentNames: ['Yoga Mat', 'Foam Roller'],
      fitnessGoals: [FitnessGoal.FLEXIBILITY, FitnessGoal.MOBILITY],
      exerciseConfigs: [
        {
          namePattern: 'World\'s Greatest Stretch',
          order: 1,
          sets: 2,
          repetitions: 8,
          restTime: 30,
          notes: '8 reps per side. Move through each position slowly, holding momentarily at end ranges.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Shoulder Dislocates',
          order: 2,
          sets: 2,
          repetitions: 10,
          restTime: 30,
          notes: 'Use resistance band with wide grip to start. Move arms slowly overhead and behind back in smooth, controlled motion.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Hip Flexor Stretch',
          order: 3,
          sets: 2,
          duration: 30,
          restTime: 30,
          notes: '30 seconds per side. Maintain upright posture and engage core while feeling stretch in front of hip.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Hamstring Stretch',
          order: 4,
          sets: 2,
          duration: 30,
          restTime: 30,
          notes: '30 seconds per leg. Keep back straight and hinge at hips rather than rounding spine.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Downward Dog',
          order: 5,
          sets: 2,
          duration: 30,
          restTime: 30,
          notes: 'Focus on creating an inverted V shape with body. Pedal feet gently to deepen calf and hamstring stretch.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Cat-Cow',
          order: 6,
          sets: 2,
          repetitions: 10,
          restTime: 30,
          notes: 'Move slowly between positions, coordinating breath with movement. Focus on spinal mobility.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Thread the Needle',
          order: 7,
          sets: 2,
          duration: 30,
          restTime: 30,
          notes: '30 seconds per side. Begin on all fours, thread one arm under body while rotating torso to stretch shoulders and thoracic spine.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Child\'s Pose',
          order: 8,
          sets: 2,
          duration: 45,
          restTime: 30,
          notes: 'Focus on relaxation and deep breathing. Extend arms forward to increase shoulder and back stretch.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create an eleventh workout plan - Beginner Cardio-Strength
    logger.info('Creating Beginner Cardio-Strength workout plan...');
    
    // Define the beginner cardio-strength workout plan
    await createWorkoutPlan({
      name: 'Beginner Cardio-Strength',
      description: 'A balanced workout combining cardiovascular exercise with basic strength movements, perfect for beginners looking to improve overall fitness and endurance.',
      difficulty: Difficulty.BEGINNER,
      workoutCategory: WorkoutCategory.CIRCUIT,
      estimatedDuration: 35,
      rating: 4.6,
      ratingCount: 105,
      popularity: 90,
      estimatedCaloriesBurn: 340,
      targetMuscleGroupNames: ['Full Body', 'Core', 'Chest', 'Back', 'Legs'],
      workoutTagNames: ['Beginner', 'Cardio', 'Strength', 'Circuit'],
      equipmentNames: ['Dumbbells', 'Jump Rope'],
      fitnessGoals: [FitnessGoal.ENDURANCE, FitnessGoal.STRENGTH_GAIN, FitnessGoal.FAT_LOSS],
      exerciseConfigs: [
        {
          namePattern: 'Jumping Jack',
          order: 1,
          sets: 3,
          duration: 45,
          restTime: 30,
          notes: 'Maintain good rhythm and keep core engaged. Focus on full range of motion.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Push-up',
          order: 2,
          sets: 3,
          repetitions: 8,
          restTime: 30,
          notes: 'Modify on knees if needed. Focus on maintaining proper form throughout the set.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'High Knees',
          order: 3,
          sets: 3,
          duration: 30,
          restTime: 30,
          notes: 'Drive knees up toward chest with a light jogging motion. Keep core tight and posture upright.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bodyweight Squat',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 30,
          notes: 'Focus on proper form with weight in heels. Squat to comfortable depth maintaining good posture.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Mountain Climbers',
          order: 5,
          sets: 3,
          duration: 30,
          restTime: 30,
          notes: 'Maintain plank position with hips low. Alternate bringing knees toward chest at moderate pace.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Dumbbell Shoulder Press',
          order: 6,
          sets: 3,
          repetitions: 10,
          restTime: 30,
          notes: 'Use light dumbbells. Keep core engaged and avoid arching back during the movement.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Burpee',
          order: 7,
          sets: 2,
          repetitions: 8,
          restTime: 30,
          notes: 'Modify by stepping back instead of jumping if needed. Focus on controlled movement and proper form.',
          exerciseRole: ExerciseRole.FINISHER,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a twelfth workout plan - Intermediate Upper-Lower Split: Upper Body
    logger.info('Creating Intermediate Upper-Lower Split: Upper Body workout plan...');
    
    // Define the intermediate upper-lower split: upper body workout plan
    await createWorkoutPlan({
      name: 'Intermediate Upper-Lower Split: Upper Body',
      description: 'A comprehensive upper body workout for intermediate lifters focusing on building strength and muscle development across all upper body muscle groups.',
      difficulty: Difficulty.INTERMEDIATE,
      workoutCategory: WorkoutCategory.UPPER_BODY,
      estimatedDuration: 45,
      rating: 4.7,
      ratingCount: 110,
      popularity: 92,
      estimatedCaloriesBurn: 380,
      targetMuscleGroupNames: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
      workoutTagNames: ['Intermediate', 'Upper Body', 'Strength', 'Hypertrophy'],
      equipmentNames: ['Dumbbells', 'Barbell', 'Bench', 'Cables'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.MUSCLE_BUILDING],
      exerciseConfigs: [
        {
          namePattern: 'Barbell Bench Press',
          order: 1,
          sets: 4,
          repetitions: 8,
          restTime: 90,
          notes: 'Start with a warm-up set then gradually increase weight. Keep shoulders back and down, feet planted firmly.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bent-Over Row',
          order: 2,
          sets: 4,
          repetitions: 10,
          restTime: 90,
          notes: 'Maintain neutral spine and hinge at hips. Pull weight toward lower ribs and squeeze shoulder blades together.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Military Press',
          order: 3,
          sets: 3,
          repetitions: 8,
          restTime: 90,
          notes: 'Keep core tight and avoid excessive arching in lower back. Press weight directly overhead.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Pull-up',
          order: 4,
          sets: 3,
          repetitions: 8,
          restTime: 90,
          notes: 'Use assisted pull-up machine or resistance bands if needed. Focus on full range of motion.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Incline Dumbbell Press',
          order: 5,
          sets: 3,
          repetitions: 10,
          restTime: 75,
          notes: 'Set bench to 30-45 degree incline. Lower weights with control and focus on upper chest contraction.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Lat Pulldown',
          order: 6,
          sets: 3,
          repetitions: 12,
          restTime: 75,
          notes: 'Use a slightly wider than shoulder-width grip. Pull bar to upper chest while maintaining upright posture.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Barbell Curl',
          order: 7,
          sets: 3,
          repetitions: 10,
          restTime: 60,
          notes: 'Keep elbows close to body and avoid swinging. Focus on controlled movement through full range.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Tricep Pushdown',
          order: 8,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Keep elbows fixed at sides. Fully extend arms and focus on triceps contraction at bottom of movement.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a thirteenth workout plan - Intermediate Upper-Lower Split: Lower Body
    logger.info('Creating Intermediate Upper-Lower Split: Lower Body workout plan...');
    
    // Define the intermediate upper-lower split: lower body workout plan
    await createWorkoutPlan({
      name: 'Intermediate Upper-Lower Split: Lower Body',
      description: 'A comprehensive lower body workout for intermediate lifters focusing on building strength and power in the legs, glutes, and posterior chain.',
      difficulty: Difficulty.INTERMEDIATE,
      workoutCategory: WorkoutCategory.LOWER_BODY,
      estimatedDuration: 45,
      rating: 4.6,
      ratingCount: 95,
      popularity: 88,
      estimatedCaloriesBurn: 420,
      targetMuscleGroupNames: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Lower Back'],
      workoutTagNames: ['Intermediate', 'Lower Body', 'Strength', 'Power'],
      equipmentNames: ['Barbell', 'Squat Rack', 'Dumbbells', 'Weight Plates'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.POWER_DEVELOPMENT],
      exerciseConfigs: [
        {
          namePattern: 'Barbell Back Squat',
          order: 1,
          sets: 4,
          repetitions: 8,
          restTime: 120,
          notes: 'Start with warm-up sets then increase weight. Keep chest up, weight in heels, and knees tracking over toes.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Romanian Deadlift',
          order: 2,
          sets: 3,
          repetitions: 10,
          restTime: 90,
          notes: 'Maintain neutral spine, hinge at hips rather than bending back. Feel stretch in hamstrings while keeping shoulders back.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bulgarian Split Squat',
          order: 3,
          sets: 3,
          repetitions: 10,
          restTime: 90,
          notes: '10 reps each leg. Keep front knee tracking over toe, torso upright. Hold dumbbells at sides for added resistance.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Leg Press',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 90,
          notes: 'Position feet at shoulder width, press through heels. Avoid locking knees at top of movement.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Leg Curl',
          order: 5,
          sets: 3,
          repetitions: 12,
          restTime: 75,
          notes: 'Focus on hamstring contraction. Control both the lifting and lowering phases of the movement.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Standing Calf Raise',
          order: 6,
          sets: 4,
          repetitions: 15,
          restTime: 60,
          notes: 'Fully extend ankle on each rep. Pause at top of movement for one second. Vary toe position between sets.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Glute Bridge',
          order: 7,
          sets: 3,
          repetitions: 15,
          restTime: 60,
          notes: 'Add barbell or weighted plate across hips for resistance. Focus on full hip extension and glute contraction.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a fourteenth workout plan - Intermediate Push-Pull-Legs: Push
    logger.info('Creating Intermediate Push-Pull-Legs: Push workout plan...');
    
    // Define the intermediate push-pull-legs: push workout plan
    await createWorkoutPlan({
      name: 'Intermediate Push-Pull-Legs: Push',
      description: 'A focused push workout for intermediate lifters targeting chest, shoulders, and triceps with a combination of compound and isolation movements for strength and hypertrophy.',
      difficulty: Difficulty.INTERMEDIATE,
      workoutCategory: WorkoutCategory.PUSH,
      estimatedDuration: 45,
      rating: 4.7,
      ratingCount: 102,
      popularity: 90,
      estimatedCaloriesBurn: 370,
      targetMuscleGroupNames: ['Chest', 'Shoulders', 'Triceps'],
      workoutTagNames: ['Intermediate', 'Push', 'Strength', 'Hypertrophy'],
      equipmentNames: ['Bench', 'Dumbbells', 'Cables', 'Barbell'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.MUSCLE_BUILDING],
      exerciseConfigs: [
        {
          namePattern: 'Barbell Bench Press',
          order: 1,
          sets: 4,
          repetitions: 8,
          restTime: 90,
          notes: 'Start with warm-up sets. Focus on full range of motion and controlled descent. Keep shoulders back and down throughout the movement.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Military Press',
          order: 2,
          sets: 3,
          repetitions: 8,
          restTime: 90,
          notes: 'Keep core braced and avoid excessive arching of the lower back. Press directly overhead with controlled movement.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Incline Dumbbell Press',
          order: 3,
          sets: 3,
          repetitions: 10,
          restTime: 75,
          notes: 'Set bench to 30-45 degree incline. Lower dumbbells with control and focus on upper chest activation.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Lateral Raise',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Use moderate weight with perfect form. Raise dumbbells to shoulder height with slight bend in elbows.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Cable Fly',
          order: 5,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Focus on chest contraction at the midpoint. Maintain slight bend in elbows throughout movement.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Tricep Pushdown',
          order: 6,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Keep elbows fixed at sides. Focus on full extension and triceps contraction at bottom of movement.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Overhead Tricep Extension',
          order: 7,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Can be performed with rope attachment, dumbbells, or EZ bar. Focus on full range of motion and triceps stretch.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a fifteenth workout plan - Intermediate Push-Pull-Legs: Pull
    logger.info('Creating Intermediate Push-Pull-Legs: Pull workout plan...');
    
    // Define the intermediate push-pull-legs: pull workout plan
    await createWorkoutPlan({
      name: 'Intermediate Push-Pull-Legs: Pull',
      description: 'A focused pull workout for intermediate lifters targeting back and biceps with a variety of pulling movements to develop strength and muscle growth in the posterior chain.',
      difficulty: Difficulty.INTERMEDIATE,
      workoutCategory: WorkoutCategory.PULL,
      estimatedDuration: 45,
      rating: 4.6,
      ratingCount: 95,
      popularity: 87,
      estimatedCaloriesBurn: 360,
      targetMuscleGroupNames: ['Back', 'Biceps', 'Rear Deltoids', 'Forearms'],
      workoutTagNames: ['Intermediate', 'Pull', 'Strength', 'Hypertrophy'],
      equipmentNames: ['Pull-up Bar', 'Dumbbells', 'Cables', 'Barbell'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.MUSCLE_BUILDING],
      exerciseConfigs: [
        {
          namePattern: 'Pull-up',
          order: 1,
          sets: 4,
          repetitions: 8,
          restTime: 90,
          notes: 'Start with body weight, add weight if possible. Use assisted pull-up machine or bands if needed. Focus on full range of motion.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bent-Over Row',
          order: 2,
          sets: 4,
          repetitions: 8,
          restTime: 90,
          notes: 'Keep back flat and hinge at hips. Pull barbell to lower ribcage and squeeze shoulder blades at top of movement.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Seated Row',
          order: 3,
          sets: 3,
          repetitions: 10,
          restTime: 75,
          notes: 'Maintain upright posture with chest out. Pull handles to torso while squeezing shoulder blades together.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Lat Pulldown',
          order: 4,
          sets: 3,
          repetitions: 10,
          restTime: 75,
          notes: 'Use wide grip, pull bar to upper chest while maintaining slight backward lean. Focus on latissimus engagement.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Face Pull',
          order: 5,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Set cable at head height. Pull rope attachment toward face with high elbows and external rotation at end range.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Barbell Curl',
          order: 6,
          sets: 3,
          repetitions: 10,
          restTime: 60,
          notes: 'Keep upper arms stationary and elbows close to sides. Curl with controlled movement, focusing on biceps contraction.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Hammer Curl',
          order: 7,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Maintain neutral grip throughout movement. Focus on brachialis and forearm development with controlled repetitions.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a sixteenth workout plan - Intermediate Push-Pull-Legs: Legs
    logger.info('Creating Intermediate Push-Pull-Legs: Legs workout plan...');
    
    // Define the intermediate push-pull-legs: legs workout plan
    await createWorkoutPlan({
      name: 'Intermediate Push-Pull-Legs: Legs',
      description: 'A comprehensive lower body workout for intermediate lifters focusing on developing strength, size, and power in the legs and glutes through compound and isolation movements.',
      difficulty: Difficulty.INTERMEDIATE,
      workoutCategory: WorkoutCategory.LEGS,
      estimatedDuration: 45,
      rating: 4.8,
      ratingCount: 105,
      popularity: 89,
      estimatedCaloriesBurn: 430,
      targetMuscleGroupNames: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core'],
      workoutTagNames: ['Intermediate', 'Legs', 'Strength', 'Hypertrophy'],
      equipmentNames: ['Squat Rack', 'Barbell', 'Leg Machines', 'Dumbbells'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.MUSCLE_BUILDING, FitnessGoal.POWER_DEVELOPMENT],
      exerciseConfigs: [
        {
          namePattern: 'Barbell Back Squat',
          order: 1,
          sets: 4,
          repetitions: 8,
          restTime: 120,
          notes: 'Start with warm-up sets. Focus on proper depth and maintaining neutral spine. Drive through heels and keep chest up throughout movement.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Romanian Deadlift',
          order: 2,
          sets: 3,
          repetitions: 10,
          restTime: 90,
          notes: 'Keep back flat and hinge at hips. Lower bar while maintaining slight knee bend. Focus on hamstring stretch and hip hinge pattern.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Leg Press',
          order: 3,
          sets: 3,
          repetitions: 12,
          restTime: 90,
          notes: 'Adjust seat position for proper range of motion. Lower weight under control and press through full foot, avoiding locking knees at top.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Leg Extension',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 75,
          notes: 'Focus on controlled movement and quad contraction at top of movement. Avoid excessive momentum.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Leg Curl',
          order: 5,
          sets: 3,
          repetitions: 12,
          restTime: 75,
          notes: 'Fully contract hamstrings at top of movement. Control both concentric and eccentric portions of exercise.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Standing Calf Raise',
          order: 6,
          sets: 4,
          repetitions: 15,
          restTime: 60,
          notes: 'Full range of motion from stretch at bottom to complete contraction at top. Hold peak contraction briefly on each rep.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Hip Thrust',
          order: 7,
          sets: 3,
          repetitions: 12,
          restTime: 75,
          notes: 'Position barbell across hips with padding. Drive through heels and focus on full hip extension and glute contraction at top.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a seventeenth workout plan - Intermediate Core & Conditioning
    logger.info('Creating Intermediate Core & Conditioning workout plan...');
    
    // Define the intermediate core and conditioning workout plan
    await createWorkoutPlan({
      name: 'Intermediate Core & Conditioning',
      description: 'A dynamic workout combining core strengthening exercises with conditioning elements to improve core stability, endurance, and overall fitness for intermediate-level individuals.',
      difficulty: Difficulty.INTERMEDIATE,
      workoutCategory: WorkoutCategory.CORE,
      estimatedDuration: 40,
      rating: 4.7,
      ratingCount: 98,
      popularity: 85,
      estimatedCaloriesBurn: 350,
      targetMuscleGroupNames: ['Core', 'Abs', 'Obliques', 'Lower Back', 'Shoulders', 'Hip Flexors'],
      workoutTagNames: ['Intermediate', 'Core', 'Conditioning', 'Circuit'],
      equipmentNames: ['Medicine Ball', 'Kettlebell', 'Resistance Bands', 'Plyo Box'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.ENDURANCE, FitnessGoal.FAT_LOSS],
      exerciseConfigs: [
        {
          namePattern: 'Plank',
          order: 1,
          sets: 3,
          duration: 60,
          restTime: 45,
          notes: 'Maintain neutral spine and engage core throughout. Aim to gradually increase hold time as you progress.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Russian Twist',
          order: 2,
          sets: 3,
          repetitions: 20,
          restTime: 45,
          notes: '20 total twists (10 per side). Use medicine ball or weight plate for resistance. Focus on rotation from the core, not arms.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Mountain Climbers',
          order: 3,
          sets: 3,
          duration: 45,
          restTime: 30,
          notes: 'Maintain plank position with hands directly under shoulders. Drive knees toward chest at moderate to fast pace.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Hanging Leg Raise',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 45,
          notes: 'Focus on controlled movement and avoiding swing. Engage core throughout the entire range of motion.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Kettlebell Swing',
          order: 5,
          sets: 3,
          repetitions: 15,
          restTime: 45,
          notes: 'Focus on hip hinge and explosive hip extension. Let the kettlebell float to chest height through momentum.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Pallof Press',
          order: 6,
          sets: 3,
          repetitions: 12,
          restTime: 45,
          notes: '12 reps each side. Use resistance band or cable. Resist rotation while extending arms straight out from chest.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Wood Chop',
          order: 7,
          sets: 3,
          repetitions: 10,
          restTime: 45,
          notes: '10 reps each side. Use cable machine or resistance band. Focus on rotational power through the core.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Burpee',
          order: 8,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Perform full movement including push-up and jump. Focus on maintaining proper form despite fatigue.',
          exerciseRole: ExerciseRole.FINISHER,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create an eighteenth workout plan - Intermediate HIIT Training
    logger.info('Creating Intermediate HIIT Training workout plan...');
    
    // Define the intermediate HIIT training workout plan
    await createWorkoutPlan({
      name: 'Intermediate HIIT Training',
      description: 'An efficient high-intensity interval training workout designed for intermediate fitness levels, combining cardio and resistance exercises for maximum calorie burn and conditioning benefits.',
      difficulty: Difficulty.INTERMEDIATE,
      workoutCategory: WorkoutCategory.HIIT,
      estimatedDuration: 35,
      rating: 4.8,
      ratingCount: 110,
      popularity: 93,
      estimatedCaloriesBurn: 450,
      targetMuscleGroupNames: ['Full Body', 'Core', 'Chest', 'Back', 'Legs', 'Shoulders'],
      workoutTagNames: ['Intermediate', 'HIIT', 'Cardio', 'Fat Loss'],
      equipmentNames: ['Kettlebell', 'Dumbbells', 'Jump Rope', 'Plyo Box'],
      fitnessGoals: [FitnessGoal.FAT_LOSS, FitnessGoal.ENDURANCE, FitnessGoal.ATHLETICISM],
      exerciseConfigs: [
        {
          namePattern: 'Burpee',
          order: 1,
          sets: 4,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Focus on full range of motion with push-up and jump. Scale as needed.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Kettlebell Swing',
          order: 2,
          sets: 4,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Maintain proper hip hinge form. Focus on power generation from the hips.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Mountain Climbers',
          order: 3,
          sets: 4,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Maintain plank position with core engaged. Increase speed as endurance allows.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Box Jump',
          order: 4,
          sets: 4,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Step down to reduce joint impact. Focus on soft landings and explosive jumps.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Push-up',
          order: 5,
          sets: 4,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Maintain proper plank position. Modify on knees if needed to maintain form.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'High Knees',
          order: 6,
          sets: 4,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Drive knees up toward chest with momentum. Keep core tight and posture upright.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Dumbbell Thruster',
          order: 7,
          sets: 4,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Combine squat to overhead press in one fluid movement. Use moderate weight.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Jumping Jack',
          order: 8,
          sets: 4,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Focus on full range of motion. Increase speed as conditioning improves.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Battle Ropes',
          order: 9,
          sets: 4,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Vary between waves, slams, and alternating motions. Keep core engaged and knees slightly bent.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Plank',
          order: 10,
          sets: 4,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Maintain straight line from head to heels. Engage core and glutes throughout.',
          exerciseRole: ExerciseRole.FINISHER,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        }
      ]
    });
    
    // Now create a nineteenth workout plan - Intermediate Hypertrophy Focus
    logger.info('Creating Intermediate Hypertrophy Focus workout plan...');
    
    // Define the intermediate hypertrophy focus workout plan
    await createWorkoutPlan({
      name: 'Intermediate Hypertrophy Focus',
      description: 'A comprehensive muscle-building workout designed for intermediate lifters, focusing on optimal training volume, time under tension, and progressive overload for maximum hypertrophy.',
      difficulty: Difficulty.INTERMEDIATE,
      workoutCategory: WorkoutCategory.HYPERTROPHY,
      estimatedDuration: 55,
      rating: 4.8,
      ratingCount: 115,
      popularity: 92,
      estimatedCaloriesBurn: 380,
      targetMuscleGroupNames: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'],
      workoutTagNames: ['Intermediate', 'Hypertrophy', 'Strength', 'Muscle Building'],
      equipmentNames: ['Barbell', 'Dumbbells', 'Cables', 'Bench', 'Weight Plates'],
      fitnessGoals: [FitnessGoal.MUSCLE_BUILDING, FitnessGoal.HYPERTROPHY, FitnessGoal.STRENGTH_GAIN],
      exerciseConfigs: [
        {
          namePattern: 'Barbell Bench Press',
          order: 1,
          sets: 4,
          repetitions: 10,
          restTime: 90,
          notes: 'Focus on controlled eccentric (lowering) phase of 2-3 seconds. Maintain full range of motion and proper scapular retraction.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Incline Dumbbell Press',
          order: 2,
          sets: 3,
          repetitions: 12,
          restTime: 75,
          notes: 'Set bench to 30-45 degree incline. Rotate wrists naturally through the movement. Focus on upper chest contraction.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Pull-up',
          order: 3,
          sets: 4,
          repetitions: 8,
          restTime: 90,
          notes: 'Full range of motion from dead hang to chin over bar. Add weight if possible, use assistance if needed.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Seated Row',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 75,
          notes: 'Emphasize scapular retraction at end range. Maintain upright posture and avoid momentum.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Barbell Back Squat',
          order: 5,
          sets: 4,
          repetitions: 10,
          restTime: 120,
          notes: 'Focus on depth and maintaining tension throughout the movement. Drive through heels and keep chest up.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Romanian Deadlift',
          order: 6,
          sets: 3,
          repetitions: 10,
          restTime: 90,
          notes: 'Emphasize stretch in hamstrings at bottom of movement. Maintain neutral spine and hip hinge pattern.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Military Press',
          order: 7,
          sets: 3,
          repetitions: 10,
          restTime: 90,
          notes: 'Press overhead with controlled movement. Avoid excessive arching in lower back. Full range of motion.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Barbell Curl',
          order: 8,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Final set to near failure. Focus on peak contraction and controlled eccentric. Minimize body momentum.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.DROP_SET
        }
      ]
    });
    
    // Now create a twentieth workout plan - Intermediate Power & Strength
    logger.info('Creating Intermediate Power & Strength workout plan...');
    
    // Define the intermediate power and strength workout plan
    await createWorkoutPlan({
      name: 'Intermediate Power & Strength',
      description: 'A focused workout combining explosive power movements with heavy compound lifts, designed for intermediate lifters looking to enhance strength and power development.',
      difficulty: Difficulty.INTERMEDIATE,
      workoutCategory: WorkoutCategory.POWER,
      estimatedDuration: 50,
      rating: 4.7,
      ratingCount: 90,
      popularity: 85,
      estimatedCaloriesBurn: 400,
      targetMuscleGroupNames: ['Full Body', 'Chest', 'Back', 'Legs', 'Shoulders'],
      workoutTagNames: ['Intermediate', 'Power', 'Strength', 'Explosive'],
      equipmentNames: ['Barbell', 'Squat Rack', 'Plyo Box', 'Weight Plates', 'Dumbbells'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.POWER_DEVELOPMENT, FitnessGoal.ATHLETICISM],
      exerciseConfigs: [
        {
          namePattern: 'Barbell Back Squat',
          order: 1,
          sets: 5,
          repetitions: 5,
          restTime: 180,
          notes: 'Focus on power and speed in the concentric phase. Maintain proper form with increasing loads. Full depth with controlled descent.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Box Jump',
          order: 2,
          sets: 4,
          repetitions: 6,
          restTime: 90,
          notes: 'Focus on explosive power from hips. Land softly with slight knee bend. Step down rather than jumping down to reduce joint stress.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Barbell Bench Press',
          order: 3,
          sets: 5,
          repetitions: 5,
          restTime: 180,
          notes: 'Explosive push on concentric phase. Control weight on eccentric phase. Full range of motion with proper scapular retraction.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Kettlebell Swing',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 90,
          notes: 'Focus on hip hinge and explosive hip extension. Use heavy kettlebell. Let momentum carry weight to shoulder height.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Pull-up',
          order: 5,
          sets: 4,
          repetitions: 6,
          restTime: 120,
          notes: 'Add weight if possible. Focus on explosive pulling phase. Control the descent. Full range of motion from dead hang.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Push Press',
          order: 6,
          sets: 4,
          repetitions: 6,
          restTime: 120,
          notes: 'Use leg drive to initiate the press. Control the descent. Focus on power production through the full kinetic chain.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Sumo Deadlift',
          order: 7,
          sets: 3,
          repetitions: 5,
          restTime: 180,
          notes: 'Focus on generating power from the floor. Drive through heels and maintain neutral spine throughout movement.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a twenty-first workout plan - Advanced Push-Pull
    logger.info('Creating Advanced Push-Pull workout plan...');
    
    // Define the advanced push-pull workout plan
    await createWorkoutPlan({
      name: 'Advanced Push-Pull',
      description: 'A high-volume, advanced training session alternating between pushing and pulling movements to maximize work capacity and muscle development for experienced lifters.',
      difficulty: Difficulty.ADVANCED,
      workoutCategory: WorkoutCategory.FULL_BODY,
      estimatedDuration: 60,
      rating: 4.9,
      ratingCount: 85,
      popularity: 88,
      estimatedCaloriesBurn: 450,
      targetMuscleGroupNames: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
      workoutTagNames: ['Advanced', 'Push-Pull', 'Strength', 'Hypertrophy'],
      equipmentNames: ['Barbell', 'Dumbbells', 'Cables', 'Bench', 'Pull-up Bar'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.MUSCLE_BUILDING, FitnessGoal.HYPERTROPHY],
      exerciseConfigs: [
        {
          namePattern: 'Barbell Bench Press',
          order: 1,
          sets: 5,
          repetitions: 6,
          restTime: 120,
          notes: 'Perform heavy sets with 80-85% of 1RM. Focus on explosive concentric phase and controlled eccentric phase.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Pull-up',
          order: 2,
          sets: 5,
          repetitions: 6,
          restTime: 120,
          notes: 'Add weight for resistance if necessary. Full range of motion from dead hang to chin over bar. Focus on upper back engagement.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Incline Dumbbell Press',
          order: 3,
          sets: 4,
          repetitions: 8,
          restTime: 90,
          notes: 'Use 30-45 degree incline. Lower dumbbells with control and feel stretch in chest. Press explosively without losing tension.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bent-Over Row',
          order: 4,
          sets: 4,
          repetitions: 8,
          restTime: 90,
          notes: 'Maintain hip hinge position with flat back. Pull barbell to lower ribcage and squeeze shoulder blades at top of movement.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Military Press',
          order: 5,
          sets: 4,
          repetitions: 8,
          restTime: 90,
          notes: 'Perform standing with core braced. Press bar overhead with full lockout at top. Control bar on descent to shoulder level.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Face Pull',
          order: 6,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Use rope attachment at face height. Pull with external rotation at end range focusing on rear delts and rotator cuff.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Tricep Pushdown',
          order: 7,
          sets: 3,
          repetitions: 12,
          restTime: 45,
          notes: 'Use V-bar or rope attachment. Keep elbows stationary at sides. Focus on full extension and triceps contraction.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.SUPER,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Barbell Curl',
          order: 8,
          sets: 3,
          repetitions: 12,
          restTime: 45,
          notes: 'Alternate with tricep pushdowns as superset. Control both concentric and eccentric phases. Minimize body momentum.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.SUPER,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a twenty-second workout plan - Advanced Upper Body Specialization
    logger.info('Creating Advanced Upper Body Specialization workout plan...');
    
    // Define the advanced upper body specialization workout plan
    await createWorkoutPlan({
      name: 'Advanced Upper Body Specialization',
      description: 'An intensive upper body focused workout for advanced lifters designed to drive hypertrophy and strength gains in chest, back, shoulders and arms through progressive loading and specialized techniques.',
      difficulty: Difficulty.ADVANCED,
      workoutCategory: WorkoutCategory.UPPER_BODY,
      estimatedDuration: 60,
      rating: 4.8,
      ratingCount: 80,
      popularity: 86,
      estimatedCaloriesBurn: 420,
      targetMuscleGroupNames: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
      workoutTagNames: ['Advanced', 'Upper Body', 'Hypertrophy', 'Strength'],
      equipmentNames: ['Barbell', 'Dumbbells', 'Cables', 'Bench', 'Pull-up Bar'],
      fitnessGoals: [FitnessGoal.MUSCLE_BUILDING, FitnessGoal.HYPERTROPHY, FitnessGoal.STRENGTH_GAIN],
      exerciseConfigs: [
        {
          namePattern: 'Barbell Bench Press',
          order: 1,
          sets: 5,
          repetitions: 5,
          restTime: 180,
          notes: 'Start with 2 warm-up sets, then 3 working sets. Use progressive loading with final set at RPE 9. Focus on maximal strength development.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Weighted Pull-up',
          order: 2,
          sets: 4,
          repetitions: 6,
          restTime: 180,
          notes: 'Add weight using belt or weighted vest. Maintain full range of motion from dead hang to chin over bar. Focus on upper back engagement.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Incline Dumbbell Press',
          order: 3,
          sets: 4,
          repetitions: 8,
          restTime: 120,
          notes: 'Use 30-45 degree incline. Final set performed as a drop set - reduce weight by 20% after reaching failure and continue.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.DROP_SET
        },
        {
          namePattern: 'T-Bar Row',
          order: 4,
          sets: 4,
          repetitions: 8,
          restTime: 120,
          notes: 'Use close grip handle. Pull to lower sternum while maintaining flat back. Focus on mid-back contraction at peak of movement.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Military Press',
          order: 5,
          sets: 4,
          repetitions: 6,
          restTime: 150,
          notes: 'Perform standing with strict form. Avoid excessive arching. Push press on final 1-2 reps of last set if needed to complete.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Cable Fly',
          order: 6,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Perform as superset with face pulls. Focus on chest stretch at eccentric phase and peak contraction at midpoint.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.SUPER,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Face Pull',
          order: 7,
          sets: 3,
          repetitions: 15,
          restTime: 60,
          notes: 'Perform as superset with cable flys. Focus on external rotation and rear delt activation. Control both phases of movement.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.SUPER,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Skull Crusher',
          order: 8,
          sets: 3,
          repetitions: 10,
          restTime: 60,
          notes: 'Perform as superset with barbell curls. Lower weight to forehead and extend with control. Focus on triceps isolation.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.SUPER,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Barbell Curl',
          order: 9,
          sets: 3,
          repetitions: 10,
          restTime: 90,
          notes: 'Perform as superset with skull crushers. Control eccentric phase for 3 seconds. Minimize body momentum.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.SUPER,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a twenty-third workout plan - Advanced Lower Body Power
    logger.info('Creating Advanced Lower Body Power workout plan...');
    
    // Define the advanced lower body power workout plan
    await createWorkoutPlan({
      name: 'Advanced Lower Body Power',
      description: 'A high-intensity lower body workout designed for advanced athletes focusing on developing maximum power, explosiveness, and strength in the legs and posterior chain.',
      difficulty: Difficulty.ADVANCED,
      workoutCategory: WorkoutCategory.LOWER_BODY,
      estimatedDuration: 60,
      rating: 4.9,
      ratingCount: 75,
      popularity: 84,
      estimatedCaloriesBurn: 480,
      targetMuscleGroupNames: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Lower Back'],
      workoutTagNames: ['Advanced', 'Lower Body', 'Power', 'Strength'],
      equipmentNames: ['Barbell', 'Squat Rack', 'Plyo Box', 'Weight Plates', 'Dumbbells'],
      fitnessGoals: [FitnessGoal.POWER_DEVELOPMENT, FitnessGoal.STRENGTH_GAIN, FitnessGoal.ATHLETICISM],
      exerciseConfigs: [
        {
          namePattern: 'Barbell Back Squat',
          order: 1,
          sets: 5,
          repetitions: 3,
          restTime: 240,
          notes: 'Focus on maximal power generation in concentric phase. Use heavy load (85-90% 1RM) with emphasis on bar speed. Full depth with controlled descent.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Box Jump',
          order: 2,
          sets: 4,
          repetitions: 5,
          restTime: 120,
          notes: 'Use high box (24-30"). Focus on maximum height and explosive hip extension. Land softly with athletic stance and step down between reps.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Sumo Deadlift',
          order: 3,
          sets: 4,
          repetitions: 5,
          restTime: 180,
          notes: 'Use heavy load (80-85% 1RM). Emphasize driving through floor and explosive hip extension. Maintain neutral spine throughout movement.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bulgarian Split Squat',
          order: 4,
          sets: 3,
          repetitions: 6,
          restTime: 120,
          notes: '6 reps per leg. Hold heavy dumbbells at sides. Focus on controlled eccentric and explosive concentric phase. Maintain proper alignment.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Kettlebell Swing',
          order: 5,
          sets: 4,
          repetitions: 12,
          restTime: 90,
          notes: 'Use heavy kettlebell. Focus on explosive hip hinge and power generation from posterior chain. Maintain neutral spine and proper breathing.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Standing Calf Raise',
          order: 6,
          sets: 4,
          repetitions: 10,
          restTime: 60,
          notes: 'Use heavy weight. Perform explosively on concentric phase, controlled on eccentric. Full range of motion from stretch to complete contraction.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Back Extension',
          order: 7,
          sets: 3,
          repetitions: 10,
          restTime: 60,
          notes: 'Hold weight plate at chest if needed for resistance. Focus on posterior chain development and lower back strength. Avoid hyperextension.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a twenty-fourth workout plan - Advanced Core & Stability
    logger.info('Creating Advanced Core & Stability workout plan...');
    
    // Define the advanced core and stability workout plan
    await createWorkoutPlan({
      name: 'Advanced Core & Stability',
      description: 'A challenging workout targeting deep core muscles, rotational strength, and advanced stability for experienced fitness enthusiasts seeking elite core development and functional strength.',
      difficulty: Difficulty.ADVANCED,
      workoutCategory: WorkoutCategory.CORE,
      estimatedDuration: 50,
      rating: 4.7,
      ratingCount: 70,
      popularity: 78,
      estimatedCaloriesBurn: 350,
      targetMuscleGroupNames: ['Core', 'Abs', 'Obliques', 'Lower Back', 'Hip Flexors'],
      workoutTagNames: ['Advanced', 'Core', 'Stability', 'Functional'],
      equipmentNames: ['Stability Ball', 'Bosu Ball', 'Medicine Ball', 'Resistance Bands', 'Kettlebell'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.ATHLETICISM, FitnessGoal.SKILL_DEVELOPMENT],
      exerciseConfigs: [
        {
          namePattern: 'Ab Wheel Rollout',
          order: 1,
          sets: 4,
          repetitions: 10,
          restTime: 90,
          notes: 'Perform from knees or standing (advanced). Extend fully with control while maintaining neutral spine. Focus on anti-extension strength.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Pallof Press',
          order: 2,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: '12 reps each side. Use heavy resistance band or cable. Extend arms fully while resisting rotation. Hold extended position for 2 seconds.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Hanging Leg Raise',
          order: 3,
          sets: 4,
          repetitions: 12,
          restTime: 90,
          notes: 'Raise legs to parallel (knees bent) or vertical (legs straight). Focus on controlled movement and pelvic tilt at top. Avoid swinging.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Russian Twist',
          order: 4,
          sets: 3,
          repetitions: 20,
          restTime: 60,
          notes: '20 total twists (10 per side). Use heavy medicine ball or weight plate. Feet elevated for increased difficulty. Focus on full rotation.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Plank',
          order: 5,
          sets: 3,
          duration: 90,
          restTime: 60,
          notes: 'Perform with feet on stability ball. Add arm reaches or leg lifts for increased challenge. Maintain perfect alignment throughout.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Wood Chop',
          order: 6,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: '12 reps each side. Use cable machine or medicine ball. Focus on rotational power through core. Initiate movement from hips and core.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Bird Dog',
          order: 7,
          sets: 3,
          repetitions: 15,
          restTime: 60,
          notes: '15 reps each side. Perform on stability ball or Bosu for increased challenge. Add resistance band for contralateral limbs. Focus on stability.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Dead Bug',
          order: 8,
          sets: 3,
          repetitions: 15,
          restTime: 60,
          notes: '15 reps each side. Hold medicine ball overhead or use resistance band. Focus on maintaining contact between lower back and floor throughout.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a twenty-fifth workout plan - Advanced HIIT & Conditioning
    logger.info('Creating Advanced HIIT & Conditioning workout plan...');
    
    // Define the advanced HIIT and conditioning workout plan
    await createWorkoutPlan({
      name: 'Advanced HIIT & Conditioning',
      description: 'An elite-level high intensity interval training program designed to maximize caloric expenditure, challenge cardiovascular capacity, and improve anaerobic threshold through complex exercise patterns.',
      difficulty: Difficulty.ADVANCED,
      workoutCategory: WorkoutCategory.HIIT,
      estimatedDuration: 45,
      rating: 4.8,
      ratingCount: 95,
      popularity: 90,
      estimatedCaloriesBurn: 550,
      targetMuscleGroupNames: ['Full Body', 'Core', 'Legs', 'Shoulders', 'Back'],
      workoutTagNames: ['Advanced', 'HIIT', 'Conditioning', 'Fat Loss'],
      equipmentNames: ['Kettlebell', 'Battle Ropes', 'Plyo Box', 'Medicine Ball', 'Dumbbells'],
      fitnessGoals: [FitnessGoal.ENDURANCE, FitnessGoal.FAT_LOSS, FitnessGoal.ATHLETICISM],
      exerciseConfigs: [
        {
          namePattern: 'Burpee',
          order: 1,
          sets: 5,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Add push-up and jump at top. Maintain intensity throughout all sets. Focus on proper form despite fatigue.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Box Jump',
          order: 2,
          sets: 5,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Use 24"+ box. Land softly in athletic position. Step down between jumps. Focus on explosive power.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Battle Ropes',
          order: 3,
          sets: 5,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Alternate between waves, slams, and spirals. Maintain intensity while keeping proper stance and core engagement.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Kettlebell Swing',
          order: 4,
          sets: 5,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Use heavy kettlebell. Focus on hip hinge and power generation. Maintain proper breathing pattern.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Mountain Climbers',
          order: 5,
          sets: 5,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Maintain high pace and proper plank position. Drive knees to chest with control and speed.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Dumbbell Thruster',
          order: 6,
          sets: 5,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Use moderate-heavy dumbbells. Combine squat and press in fluid motion. Maintain proper squat depth.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Medicine Ball Slam',
          order: 7,
          sets: 5,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Use heavy medicine ball. Generate power from full body. Catch and repeat without pause.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Jump Rope',
          order: 8,
          sets: 5,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Mix double unders and high knees. Maintain rhythm and intensity throughout set.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Bear Crawl',
          order: 9,
          sets: 5,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Maintain speed while keeping hips low. Forward, backward, and lateral movement patterns.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Plank',
          order: 10,
          sets: 5,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Add shoulder taps or hip dips for increased challenge. Maintain perfect alignment despite fatigue.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'Lateral Bounds',
          order: 11,
          sets: 5,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Explode laterally with maximum effort. Land softly and immediately rebound. Focus on power and stability.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        },
        {
          namePattern: 'High Knees',
          order: 12,
          sets: 5,
          duration: 40,
          restTime: 20,
          notes: '40 seconds work, 20 seconds rest. Drive knees to chest height. Maintain upright posture and arm action. Maximum effort sprint pace.',
          exerciseRole: ExerciseRole.FINISHER,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.TABATA
        }
      ]
    });
    
    // Now create a twenty-sixth workout plan - Advanced Olympic Lifting Focus
    logger.info('Creating Advanced Olympic Lifting Focus workout plan...');
    
    // Define the advanced Olympic lifting focus workout plan
    await createWorkoutPlan({
      name: 'Advanced Olympic Lifting Focus',
      description: 'A specialized training program focused on mastering the Olympic lifts and their variations. Designed for advanced lifters seeking to improve technique, power, and strength in competitive Olympic weightlifting movements.',
      difficulty: Difficulty.ADVANCED,
      workoutCategory: WorkoutCategory.POWER,
      estimatedDuration: 65,
      rating: 4.9,
      ratingCount: 65,
      popularity: 78,
      estimatedCaloriesBurn: 420,
      targetMuscleGroupNames: ['Full Body', 'Shoulders', 'Back', 'Legs', 'Core'],
      workoutTagNames: ['Advanced', 'Olympic Lifting', 'Power', 'Technique'],
      equipmentNames: ['Barbell', 'Weight Plates', 'Squat Rack', 'Plyo Box', 'Kettlebell'],
      fitnessGoals: [FitnessGoal.POWER_DEVELOPMENT, FitnessGoal.STRENGTH_GAIN, FitnessGoal.SKILL_DEVELOPMENT],
      exerciseConfigs: [
        {
          namePattern: 'Clean and Press',
          order: 1,
          sets: 5,
          repetitions: 3,
          restTime: 180,
          notes: 'Focus on technical proficiency. Start with technique-focused sets before increasing load. Full clean from floor followed by push press or jerk.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Snatch',
          order: 2,
          sets: 5,
          repetitions: 3,
          restTime: 180,
          notes: 'Emphasize proper pull sequence, hip extension, and receiving position. Start with lighter weight to perfect technique before increasing load.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Front Squat',
          order: 3,
          sets: 4,
          repetitions: 5,
          restTime: 150,
          notes: 'Focus on maintaining upright torso with elbows high. Use clean grip position. Depth should be below parallel with knees tracking over toes.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Push Press',
          order: 4,
          sets: 4,
          repetitions: 5,
          restTime: 120,
          notes: 'Use dip and drive from legs to generate momentum. Complete with locked out arms overhead. Control the bar during the descent.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Romanian Deadlift',
          order: 5,
          sets: 3,
          repetitions: 6,
          restTime: 120,
          notes: 'Emphasize hamstring activation and posterior chain development. Maintain neutral spine with slight knee bend. Control eccentric phase.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Clean Pull',
          order: 6,
          sets: 3,
          repetitions: 5,
          restTime: 120,
          notes: 'Focus on first and second pull technique. Maintain back angle during initial pull, then explode with full hip extension. Heavier than full clean weight.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a twenty-seventh workout plan - Advanced Powerlifting Training
    logger.info('Creating Advanced Powerlifting Training workout plan...');
    
    // Define the advanced powerlifting training workout plan
    await createWorkoutPlan({
      name: 'Advanced Powerlifting Training',
      description: 'A specialized powerlifting program designed to maximize strength in the squat, bench press, and deadlift through advanced programming techniques and accessory work for competitive lifters.',
      difficulty: Difficulty.ADVANCED,
      workoutCategory: WorkoutCategory.STRENGTH,
      estimatedDuration: 70,
      rating: 4.9,
      ratingCount: 80,
      popularity: 85,
      estimatedCaloriesBurn: 450,
      targetMuscleGroupNames: ['Full Body', 'Chest', 'Back', 'Legs', 'Shoulders'],
      workoutTagNames: ['Advanced', 'Powerlifting', 'Strength', 'Competition'],
      equipmentNames: ['Barbell', 'Squat Rack', 'Weight Plates', 'Bench', 'Deadlift Platform'],
      fitnessGoals: [FitnessGoal.STRENGTH_GAIN, FitnessGoal.POWER_DEVELOPMENT],
      exerciseConfigs: [
        {
          namePattern: 'Barbell Back Squat',
          order: 1,
          sets: 5,
          repetitions: 3,
          restTime: 240,
          notes: 'Perform competition-style with walkout from rack. Focus on maximal strength (85-92% 1RM). Use lifting belt for working sets. Rest 4-5 minutes between heavy sets.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Barbell Bench Press',
          order: 2,
          sets: 5,
          repetitions: 3,
          restTime: 240,
          notes: 'Use competition grip width and setup. Focus on proper leg drive and arch. Control eccentric and explode on concentric phase. Heavy load (85-90% 1RM).',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Sumo Deadlift',
          order: 3,
          sets: 4,
          repetitions: 3,
          restTime: 300,
          notes: 'Set up with competition stance width. Focus on tension before breaking bar from floor. Maintain neutral spine. Heavy load (85-90% 1RM).',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.PYRAMID,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Front Squat',
          order: 4,
          sets: 3,
          repetitions: 5,
          restTime: 180,
          notes: 'Use as accessory movement for main squat pattern. Focus on upright torso position with elbows high. Build quad strength to support competition squat.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Close-Grip Bench Press',
          order: 5,
          sets: 3,
          repetitions: 5,
          restTime: 180,
          notes: 'Use shoulder-width grip. Focus on triceps development to support lockout strength in competition bench press. Control throughout range of motion.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Good Morning',
          order: 6,
          sets: 3,
          repetitions: 8,
          restTime: 120,
          notes: 'Use to strengthen posterior chain for deadlift and squat. Maintain rigid back with hip hinge movement pattern. Focus on hamstring and lower back development.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a twenty-eighth workout plan - Advanced Hypertrophy Specialization
    logger.info('Creating Advanced Hypertrophy Specialization workout plan...');
    
    // Define the advanced hypertrophy specialization workout plan
    await createWorkoutPlan({
      name: 'Advanced Hypertrophy Specialization',
      description: 'A high-volume, scientifically designed workout program for advanced lifters focused on maximum muscle development through specialized hypertrophy techniques, time under tension, and metabolic stress.',
      difficulty: Difficulty.ADVANCED,
      workoutCategory: WorkoutCategory.HYPERTROPHY,
      estimatedDuration: 65,
      rating: 4.8,
      ratingCount: 85,
      popularity: 92,
      estimatedCaloriesBurn: 410,
      targetMuscleGroupNames: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'],
      workoutTagNames: ['Advanced', 'Hypertrophy', 'Muscle Building', 'Volume'],
      equipmentNames: ['Barbell', 'Dumbbells', 'Cables', 'Bench', 'Pull-up Bar', 'Weight Plates'],
      fitnessGoals: [FitnessGoal.MUSCLE_BUILDING, FitnessGoal.HYPERTROPHY],
      exerciseConfigs: [
        {
          namePattern: 'Incline Dumbbell Press',
          order: 1,
          sets: 4,
          repetitions: 10,
          restTime: 90,
          notes: 'Use 30° incline angle. Focus on chest stretch at bottom position and peak contraction at top. Final set as drop set - reduce weight by 20% twice after reaching failure.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.DROP_SET
        },
        {
          namePattern: 'Cable Fly',
          order: 2,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Use slight incline bench. Focus on stretching pecs at eccentric phase and squeezing at midpoint. Slow eccentric (3 seconds) with 1-second squeeze at peak contraction.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Lat Pulldown',
          order: 3,
          sets: 4,
          repetitions: 10,
          restTime: 90,
          notes: 'Use wide grip. Focus on full range of motion and lat engagement. Slow eccentric (3 seconds). Hold contraction for 1 second at bottom. Final set as drop set.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.DROP_SET
        },
        {
          namePattern: 'Seated Row',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Use close grip attachment. Focus on squeezing shoulder blades together at peak contraction. Full stretch at start position. Control both phases of movement.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Dumbbell Shoulder Press',
          order: 5,
          sets: 4,
          repetitions: 10,
          restTime: 90,
          notes: 'Perform seated with neutral grip. Control descent with 3-second eccentric. Full range of motion with brief pause at bottom. Final set as rest-pause.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REST_PAUSE
        },
        {
          namePattern: 'Lateral Raise',
          order: 6,
          sets: 3,
          repetitions: 15,
          restTime: 60,
          notes: 'Slight bend in elbows. Raise to just above shoulder height. Partial reps at end of set for metabolic stress. Control eccentric phase completely.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Barbell Curl',
          order: 7,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Perform as superset with skull crushers. Control throughout full range of motion. Focus on biceps peak contraction. Final 3 reps with slow eccentric (4 seconds).',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.SUPER,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Skull Crusher',
          order: 8,
          sets: 3,
          repetitions: 12,
          restTime: 90,
          notes: 'Perform as superset with barbell curls. Use EZ bar. Lower to forehead with control. Focus on triceps stretch and peak contraction. Keep elbows stable throughout.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.SUPER,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    // Now create a twenty-ninth workout plan - Advanced Athletic Performance
    logger.info('Creating Advanced Athletic Performance workout plan...');
    
    // Define the advanced athletic performance workout plan
    await createWorkoutPlan({
      name: 'Advanced Athletic Performance',
      description: 'A comprehensive athletic conditioning program designed for advanced athletes and sports performers, focusing on power, explosiveness, agility, and sport-specific performance enhancement.',
      difficulty: Difficulty.ADVANCED,
      workoutCategory: WorkoutCategory.SPORT_SPECIFIC,
      estimatedDuration: 60,
      rating: 4.9,
      ratingCount: 75,
      popularity: 82,
      estimatedCaloriesBurn: 480,
      targetMuscleGroupNames: ['Full Body', 'Core', 'Legs', 'Shoulders', 'Back'],
      workoutTagNames: ['Advanced', 'Athletic', 'Power', 'Sport-Specific'],
      equipmentNames: ['Plyo Box', 'Medicine Ball', 'Agility Ladder', 'Kettlebell', 'Battle Ropes', 'Dumbbells'],
      fitnessGoals: [FitnessGoal.ATHLETICISM, FitnessGoal.POWER_DEVELOPMENT, FitnessGoal.SPORT_SPECIFIC],
      exerciseConfigs: [
        {
          namePattern: 'Box Jump',
          order: 1,
          sets: 4,
          repetitions: 5,
          restTime: 120,
          notes: 'Use 24-30" box. Focus on explosive power and soft landing. Emphasize quick transition between reps. Rest fully between sets to maintain power output.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Medicine Ball Slam',
          order: 2,
          sets: 4,
          repetitions: 8,
          restTime: 90,
          notes: 'Use heavy medicine ball. Generate power from legs through core to upper body. Engage full body in explosive movement. Focus on maximum velocity.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Clean and Press',
          order: 3,
          sets: 4,
          repetitions: 6,
          restTime: 120,
          notes: 'Use barbell or dumbbells. Focus on power development through triple extension. Maintain proper technique throughout. Moderate weight with explosive execution.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Kettlebell Swing',
          order: 4,
          sets: 3,
          repetitions: 12,
          restTime: 90,
          notes: 'Use heavy kettlebell. Focus on hip hinge and power generation. Maintain neutral spine. Perform with maximum velocity while maintaining control.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Pull-up',
          order: 5,
          sets: 3,
          repetitions: 8,
          restTime: 90,
          notes: 'Add weight if necessary. Focus on explosive concentric phase. Control eccentric phase completely. Full range of motion from dead hang to chin over bar.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Lateral Bounds',
          order: 6,
          sets: 3,
          repetitions: 8,
          restTime: 90,
          notes: '8 bounds each direction. Focus on power, stability, and quick ground contact. Land with soft knees and immediately rebound. Emphasize sport-specific movement patterns.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Battle Ropes',
          order: 7,
          sets: 3,
          duration: 30,
          restTime: 60,
          notes: 'Alternate between different patterns (waves, slams, spirals). Maintain athletic stance with core engaged. Focus on power endurance and maintaining intensity throughout set.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Pallof Press',
          order: 8,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: '12 reps each side. Use cable or resistance band. Focus on core anti-rotation strength. Maintain stable position throughout movement. Essential for rotational sport activities.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Agility Ladder',
          order: 9,
          sets: 4,
          duration: 30,
          restTime: 60,
          notes: 'Perform various footwork patterns (lateral, in-out, high knees). Focus on foot speed, coordination, and agility. Maintain high intensity throughout each set.',
          exerciseRole: ExerciseRole.FINISHER,
          setType: SetType.CIRCUIT,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Row',
          order: 10,
          sets: 1,
          duration: 120,
          restTime: 0,
          notes: 'High-intensity rowing for 2 minutes. Focus on power and efficiency. Maintain strong pace throughout. Proper form with leg drive, back swing, and arm pull.',
          exerciseRole: ExerciseRole.FINISHER,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
    logger.info('Creating Advanced Functional Fitness workout plan');
    await createWorkoutPlan({
      name: 'Advanced Functional Fitness',
      description: 'Elite-level functional fitness program combining Olympic lifting, gymnastics movements, and high-intensity conditioning for peak total-body performance. Designed for experienced athletes seeking sport-specific functional capability and metabolic conditioning.',
      difficulty: Difficulty.ADVANCED,
      workoutCategory: WorkoutCategory.SPORT_SPECIFIC,
      estimatedDuration: 55,
      rating: 4.9,
      popularity: 89,
      estimatedCaloriesBurn: 650,
      targetMuscleGroupNames: ['Full Body', 'Core', 'Shoulders'],
      workoutTagNames: ['Advanced', 'HIIT', 'Strength', 'Cardio'],
      equipmentNames: [
        'Barbell',
        'Pull-up Bar',
        'Kettlebell',
        'Medicine Ball',
        'Plyo Box',
        'Jump Rope',
        'Rowing Machine'
      ],
      fitnessGoals: [
        FitnessGoal.ENDURANCE, 
        FitnessGoal.STRENGTH_GAIN, 
        FitnessGoal.ATHLETICISM
      ],
      exerciseConfigs: [
        {
          namePattern: 'Clean and Press',
          order: 1,
          sets: 5,
          repetitions: 8,
          restTime: 90,
          notes: 'Powerful combination of front squat to overhead press. Focus on timing and fluid transition between movements. Maintain solid front rack position and full hip extension at the top.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Pull-up',
          order: 2,
          sets: 4,
          repetitions: 10,
          restTime: 120,
          notes: 'Complete pull-up with full range of motion. Scale with band assistance if needed. Focus on controlled movement throughout. Power from shoulders and lats.',
          exerciseRole: ExerciseRole.PRIMARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Push-up',
          order: 3,
          sets: 3,
          repetitions: 12,
          restTime: 60,
          notes: 'Focus on proper form and maintaining a straight line from head to heels. Use resistance bands for added assistance if needed.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Squat',
          order: 4,
          sets: 3,
          repetitions: 10,
          restTime: 90,
          notes: 'Focus on proper form and maintaining a straight line from head to heels. Use resistance bands for added assistance if needed.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Deadlift',
          order: 5,
          sets: 3,
          repetitions: 8,
          restTime: 120,
          notes: 'Focus on proper technique and form. Keep spine neutral and engage core throughout the movement. Drive through heels and maintain control on both up and down phases.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Kettlebell Swing',
          order: 6,
          sets: 3,
          repetitions: 15,
          restTime: 60,
          notes: 'Focus on hip hinge movement. Generate power from the hips, not the arms. Maintain neutral spine throughout the movement.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Medicine Ball Throw',
          order: 7,
          sets: 3,
          repetitions: 12,
          restTime: 45,
          notes: 'Explosive movement against wall. Focus on full-body power generation and core stability throughout the throw.',
          exerciseRole: ExerciseRole.SECONDARY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Plank',
          order: 8,
          sets: 3,
          duration: 60,
          restTime: 45,
          notes: 'Maintain proper alignment from head to heels. Engage core throughout the entire duration. Scale with knee-down version if needed.',
          exerciseRole: ExerciseRole.ACCESSORY,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        },
        {
          namePattern: 'Row',
          order: 9,
          sets: 1,
          duration: 120,
          restTime: 0,
          notes: 'High-intensity rowing for 2 minutes. Focus on power and efficiency. Maintain strong pace throughout. Proper form with leg drive, back swing, and arm pull.',
          exerciseRole: ExerciseRole.FINISHER,
          setType: SetType.NORMAL,
          setStructure: SetStructure.REGULAR
        }
      ]
    });
    
  } catch (error) {
    logger.error('Error seeding workout plans:', error);
    throw error;
  }
} 