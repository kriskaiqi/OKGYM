import { AppDataSource } from '../../data-source';
import { Exercise } from '../../models/Exercise';
import { Equipment } from '../../models/Equipment';
import logger from '../../utils/logger';

async function checkExerciseEquipment(): Promise<void> {
  try {
    // Initialize the data source
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection initialized');
    }

    // Get all exercise-equipment relationships
    const relationships = await AppDataSource.query(`
      SELECT e.name as exercise_name, eq.name as equipment_name
      FROM exercise_equipment ee
      JOIN exercises e ON ee.exercise_id = e.id
      JOIN equipment eq ON ee.equipment_id = eq.id
      ORDER BY e.name
    `);

    logger.info(`Found ${relationships.length} exercise-equipment relationships`);

    // Group by exercise name for better viewing
    const exerciseEquipmentMap = new Map<string, string[]>();
    relationships.forEach((rel: any) => {
      if (!exerciseEquipmentMap.has(rel.exercise_name)) {
        exerciseEquipmentMap.set(rel.exercise_name, []);
      }
      exerciseEquipmentMap.get(rel.exercise_name)?.push(rel.equipment_name);
    });

    logger.info(`Exercise to equipment mappings:`);
    for (const [exerciseName, equipmentList] of exerciseEquipmentMap.entries()) {
      logger.info(`- ${exerciseName}: ${equipmentList.join(', ')}`);
    }

    // Check equipment coverage
    const totalExercises = await AppDataSource.getRepository(Exercise).count();
    const exercisesWithEquipment = exerciseEquipmentMap.size;
    const coveragePercentage = (exercisesWithEquipment / totalExercises) * 100;

    logger.info(`Equipment coverage: ${exercisesWithEquipment}/${totalExercises} exercises (${coveragePercentage.toFixed(2)}%)`);

    // Shutdown connection
    await AppDataSource.destroy();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error checking exercise equipment:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the function
checkExerciseEquipment()
  .then(() => {
    logger.info('Exercise equipment check completed successfully');
    process.exit(0);
  })
  .catch(error => {
    logger.error('Failed to check exercise equipment:', error);
    process.exit(1);
  }); 