import { AppDataSource } from "../data-source";
import { WorkoutPlan } from "../models/WorkoutPlan";
import logger from "../utils/logger";

async function verifyWorkoutPlans() {
  try {
    logger.info("Initializing database connection...");
    await AppDataSource.initialize();
    logger.info("Database connection established successfully");

    // Query all workout plans with relations
    const workoutPlans = await AppDataSource.getRepository(WorkoutPlan)
      .createQueryBuilder("workoutPlan")
      .leftJoinAndSelect("workoutPlan.exercises", "workoutExercise")
      .leftJoinAndSelect("workoutExercise.exercise", "exercise")
      .leftJoinAndSelect("workoutPlan.targetMuscleGroups", "muscleGroup")
      .leftJoinAndSelect("workoutPlan.tags", "tag")
      .leftJoinAndSelect("workoutPlan.equipmentNeeded", "equipment")
      .getMany();

    logger.info(`Found ${workoutPlans.length} workout plans in the database:`);
    
    // Display details for each workout plan
    for (const plan of workoutPlans) {
      logger.info(`\n[Workout Plan] ID: ${plan.id}, Name: ${plan.name}, Difficulty: ${plan.difficulty}`);
      logger.info(`Description: ${plan.description || 'None'}`);
      logger.info(`Duration: ${plan.estimatedDuration} minutes`);
      
      // Display muscle groups
      if (plan.targetMuscleGroups && plan.targetMuscleGroups.length > 0) {
        logger.info(`Muscle Groups: ${plan.targetMuscleGroups.map(mg => mg.name).join(', ')}`);
      } else {
        logger.info('Muscle Groups: None');
      }
      
      // Display tags
      if (plan.tags && plan.tags.length > 0) {
        logger.info(`Tags: ${plan.tags.map(tag => tag.name).join(', ')}`);
      } else {
        logger.info('Tags: None');
      }
      
      // Display equipment
      if (plan.equipmentNeeded && plan.equipmentNeeded.length > 0) {
        logger.info(`Equipment: ${plan.equipmentNeeded.map(eq => eq.name).join(', ')}`);
      } else {
        logger.info('Equipment: None');
      }
      
      // Display exercises
      if (plan.exercises && plan.exercises.length > 0) {
        logger.info(`\nExercises (${plan.exercises.length}):`);
        let index = 1;
        
        for (const workoutExercise of plan.exercises) {
          try {
            if (workoutExercise && workoutExercise.exercise) {
              const exercise = workoutExercise.exercise;
              const exerciseTypes = exercise.types && exercise.types.length > 0 
                ? exercise.types.join(', ') 
                : 'N/A';
              
              logger.info(`  ${index}. ${exercise.name} - ${exerciseTypes}`);
              logger.info(`     Sets: ${workoutExercise.sets}, Reps: ${workoutExercise.repetitions || 'N/A'}, Duration: ${workoutExercise.duration || 'N/A'}s`);
              logger.info(`     Rest: ${workoutExercise.restTime}s, Role: ${workoutExercise.exerciseRole}`);
              
              if (workoutExercise.notes) {
                logger.info(`     Notes: ${workoutExercise.notes}`);
              }
              
              index++;
            } else {
              logger.warn(`  ${index}. Invalid exercise data - missing exercise reference`);
              index++;
            }
          } catch (err) {
            logger.error(`Error displaying exercise at position ${index}:`, err);
            index++;
          }
        }
      } else {
        logger.info('\nExercises: None');
      }
    }

    // Check if there are workout plans without exercises
    const emptyWorkouts = workoutPlans.filter(plan => !plan.exercises || plan.exercises.length === 0);
    if (emptyWorkouts.length > 0) {
      logger.warn(`\nWarning: Found ${emptyWorkouts.length} workout plans without exercises:`);
      emptyWorkouts.forEach(plan => {
        logger.warn(`  - ${plan.name} (ID: ${plan.id})`);
      });
    }

    logger.info("\nVerification complete");
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed");
    }
    
  } catch (error) {
    logger.error("Error verifying workout plans:", error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info("Database connection closed after error");
    }
  }
}

verifyWorkoutPlans(); 