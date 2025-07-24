import { AppDataSource } from '../../data-source';
import { Exercise } from '../../models/Exercise';
import logger from '../../utils/logger';

async function examineExerciseData(): Promise<void> {
  try {
    // Initialize the data source
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized');
    }

    // Get a sample exercise
    const exercise = await AppDataSource.getRepository(Exercise).findOne({
      where: {},
      select: ['id', 'name', 'form']
    });

    if (exercise) {
      logger.info(`Sample exercise: ${exercise.name} (${exercise.id})`);
      logger.info(`Form data structure:`);
      logger.info(JSON.stringify(exercise.form, null, 2));

      // Check if there are any equipmentNames in the seed data
      const exerciseData = await AppDataSource.query(`
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name = 'exercises' 
        AND column_name = 'equipment_names'
      `);
      
      logger.info(`Equipment names column exists: ${parseInt(exerciseData[0].count) > 0}`);

      // Look for any exercises with equipment in their form data
      const exercisesWithEquipment = await AppDataSource.query(`
        SELECT id, name, form->'equipment' as equipment
        FROM exercises
        WHERE form->'equipment' IS NOT NULL
        LIMIT 5
      `);

      logger.info(`Found ${exercisesWithEquipment.length} exercises with equipment in form data`);
      if (exercisesWithEquipment.length > 0) {
        exercisesWithEquipment.forEach((ex: any) => {
          logger.info(`- ${ex.name}: ${ex.equipment}`);
        });
      }

      // Check total exercises
      const totalExercises = await AppDataSource.getRepository(Exercise).count();
      logger.info(`Total exercises in database: ${totalExercises}`);
    } else {
      logger.warn('No exercises found in the database');
    }

    // Shutdown connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error examining exercise data:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the function
examineExerciseData()
  .then(() => {
    logger.info('Exercise data examination completed successfully');
    process.exit(0);
  })
  .catch(error => {
    logger.error('Failed to examine exercise data:', error);
    process.exit(1);
  }); 