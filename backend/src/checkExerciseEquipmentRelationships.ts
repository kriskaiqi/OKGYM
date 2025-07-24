import { AppDataSource } from './data-source';
import { Exercise } from './models/Exercise';
import { Equipment } from './models/Equipment';
import logger from './utils/logger';

/**
 * Script to diagnose issues with exercise-equipment relationships
 */
async function checkExerciseEquipmentRelationships() {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Database connection initialized');
    }

    // 1. Count exercises and equipment
    const exerciseCount = await AppDataSource.getRepository(Exercise).count();
    const equipmentCount = await AppDataSource.getRepository(Equipment).count();
    console.log(`Total exercises: ${exerciseCount}`);
    console.log(`Total equipment items: ${equipmentCount}`);

    // 2. Count junction table entries
    const junctionCount = await AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_equipment"
    `);
    console.log(`Exercise-equipment relationships: ${junctionCount[0].count}`);

    // 3. Check specific equipment (Ab Roller Wheel)
    const abRollerEquipment = await AppDataSource.getRepository(Equipment)
      .createQueryBuilder('equipment')
      .where('LOWER(equipment.name) = :name', { name: 'ab roller wheel' })
      .getOne();

    if (abRollerEquipment) {
      console.log(`Found Ab Roller Wheel equipment with ID: ${abRollerEquipment.id}`);
      
      // 4. Check exercises associated with Ab Roller Wheel
      const abRollerExercises = await AppDataSource.query(`
        SELECT e.id, e.name 
        FROM exercise e
        JOIN exercise_equipment ee ON e.id = ee.exercise_id
        WHERE ee.equipment_id = '${abRollerEquipment.id}'
      `);
      
      console.log(`Exercises associated with Ab Roller Wheel: ${abRollerExercises.length}`);
      abRollerExercises.forEach((ex: any) => {
        console.log(`- ${ex.name} (${ex.id})`);
      });

      // 5. Check exercise names that should be associated with Ab Roller Wheel
      const potentialAbRollerExercises = await AppDataSource.getRepository(Exercise)
        .createQueryBuilder('exercise')
        .where('LOWER(exercise.name) LIKE :pattern1 OR LOWER(exercise.name) LIKE :pattern2', {
          pattern1: '%ab roller%',
          pattern2: '%ab wheel%'
        })
        .getMany();
      
      console.log(`Exercises with 'ab roller' or 'ab wheel' in name: ${potentialAbRollerExercises.length}`);
      potentialAbRollerExercises.forEach(ex => {
        console.log(`- ${ex.name} (${ex.id})`);
      });
    } else {
      console.log('Ab Roller Wheel equipment not found!');
    }

    // 6. Equipment with most exercises
    const equipmentWithMostExercises = await AppDataSource.query(`
      SELECT e.name, COUNT(ee.exercise_id) as exercise_count
      FROM equipment e
      JOIN exercise_equipment ee ON e.id = ee.equipment_id
      GROUP BY e.id, e.name
      ORDER BY exercise_count DESC
      LIMIT 5
    `);
    
    console.log('Equipment with most exercises:');
    equipmentWithMostExercises.forEach((item: any) => {
      console.log(`- ${item.name}: ${item.exercise_count} exercises`);
    });

    // 7. Equipment with no exercises
    const equipmentWithNoExercises = await AppDataSource.query(`
      SELECT e.id, e.name
      FROM equipment e
      LEFT JOIN exercise_equipment ee ON e.id = ee.equipment_id
      WHERE ee.exercise_id IS NULL
    `);
    
    console.log(`Equipment with no associated exercises: ${equipmentWithNoExercises.length}`);
    if (equipmentWithNoExercises.length <= 10) {
      equipmentWithNoExercises.forEach((item: any) => {
        console.log(`- ${item.name} (${item.id})`);
      });
    } else {
      console.log('First 10 equipment with no exercises:');
      equipmentWithNoExercises.slice(0, 10).forEach((item: any) => {
        console.log(`- ${item.name} (${item.id})`);
      });
    }

  } catch (error) {
    console.error('Error checking exercise-equipment relationships:', error);
  } finally {
    // Close the database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

// Run the diagnostic function
checkExerciseEquipmentRelationships().catch(error => {
  console.error('Unhandled error:', error);
}); 