import { Exercise } from '../models/Exercise';
import { Equipment } from '../models/Equipment';
import { AppDataSource } from '../data-source';
import logger from '../utils/logger';

/**
 * Seed the junction table between exercises and equipment
 * This creates connections between exercises and their relevant equipment options
 * based on exercise name, types, and other attributes since the form.equipment field
 * isn't populated.
 */
export async function seedExerciseEquipment(): Promise<void> {
  try {
    logger.info('Starting to seed exercise-equipment junction table...');
    
    // Check if junction entries already exist
    const existingCount = await AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_equipment"
    `);
    
    if (parseInt(existingCount[0].count) > 0) {
      logger.info(`Found ${existingCount[0].count} existing entries in exercise_equipment junction table. Skipping seeding.`);
      return;
    }
    
    // Load all exercises and equipment
    const exercisesFromRepo = await AppDataSource.getRepository(Exercise).find({
      select: ['id', 'name', 'description', 'level', 'types', 'movementPattern']
    });
    const allEquipment = await AppDataSource.getRepository(Equipment).find();
    
    logger.info(`Found ${exercisesFromRepo.length} exercises and ${allEquipment.length} equipment items to process.`);
    
    if (allEquipment.length === 0) {
      logger.warn('No equipment found. Make sure equipment is seeded first.');
      return;
    }

    // Create a mapping of equipment by name for easier lookup
    const equipmentByName = new Map<string, Equipment>();
    allEquipment.forEach(equipment => {
      equipmentByName.set(equipment.name.toLowerCase(), equipment);
    });
    
    // Create a batch array to hold all the values for insertion
    const junctionEntries: Array<{exercise_id: string, equipment_id: string}> = [];
    
    // Process each exercise
    for (const exercise of exercisesFromRepo) {
      logger.info(`Processing equipment for exercise: ${exercise.name} (${exercise.id})`);
      
      try {
        const matchingEquipment: Equipment[] = [];
        
        // 1. Match based on exercise name containing equipment name
        for (const equipment of allEquipment) {
          // Check if the exercise name contains the equipment name
          if (exercise.name.toLowerCase().includes(equipment.name.toLowerCase())) {
            matchingEquipment.push(equipment);
            logger.info(`Matched ${exercise.name} with ${equipment.name} based on name inclusion`);
          }
        }
        
        // 2. Match based on common patterns in exercise names
        if (exercise.name.toLowerCase().includes('dumbbell')) {
          const dumbbells = equipmentByName.get('dumbbells');
          if (dumbbells && !matchingEquipment.includes(dumbbells)) {
            matchingEquipment.push(dumbbells);
            logger.info(`Matched ${exercise.name} with Dumbbells based on name pattern`);
          }
        }
        
        if (exercise.name.toLowerCase().includes('barbell')) {
          const barbell = equipmentByName.get('barbell');
          if (barbell && !matchingEquipment.includes(barbell)) {
            matchingEquipment.push(barbell);
            logger.info(`Matched ${exercise.name} with Barbell based on name pattern`);
          }
        }
        
        if (exercise.name.toLowerCase().includes('kettlebell')) {
          const kettlebell = equipmentByName.get('kettlebell');
          if (kettlebell && !matchingEquipment.includes(kettlebell)) {
            matchingEquipment.push(kettlebell);
            logger.info(`Matched ${exercise.name} with Kettlebell based on name pattern`);
          }
        }
        
        if (exercise.name.toLowerCase().includes('rope') || 
            exercise.name.toLowerCase().includes('jump rope')) {
          const jumpRope = equipmentByName.get('jump rope');
          if (jumpRope && !matchingEquipment.includes(jumpRope)) {
            matchingEquipment.push(jumpRope);
            logger.info(`Matched ${exercise.name} with Jump Rope based on name pattern`);
          }
        }
        
        if (exercise.name.toLowerCase().includes('bench press') || 
            exercise.name.toLowerCase().includes('incline') || 
            exercise.name.toLowerCase().includes('decline') ||
            exercise.name.toLowerCase().includes('bench fly')) {
          const bench = equipmentByName.get('adjustable bench');
          if (bench && !matchingEquipment.includes(bench)) {
            matchingEquipment.push(bench);
            logger.info(`Matched ${exercise.name} with Adjustable Bench based on name pattern`);
          }
        }
        
        if (exercise.name.toLowerCase().includes('squat rack') || 
            exercise.name.toLowerCase().includes('power rack') || 
            exercise.name.toLowerCase().includes('squat') && exercise.name.toLowerCase().includes('barbell')) {
          const rack = equipmentByName.get('squat rack');
          if (rack && !matchingEquipment.includes(rack)) {
            matchingEquipment.push(rack);
            logger.info(`Matched ${exercise.name} with Squat Rack based on name pattern`);
          }
        }
        
        if (exercise.name.toLowerCase().includes('resistance band')) {
          const bands = equipmentByName.get('resistance bands');
          if (bands && !matchingEquipment.includes(bands)) {
            matchingEquipment.push(bands);
            logger.info(`Matched ${exercise.name} with Resistance Bands based on name pattern`);
          }
        }
        
        if (exercise.name.toLowerCase().includes('medicine ball')) {
          const medBall = equipmentByName.get('medicine ball');
          if (medBall && !matchingEquipment.includes(medBall)) {
            matchingEquipment.push(medBall);
            logger.info(`Matched ${exercise.name} with Medicine Ball based on name pattern`);
          }
        }
        
        if (exercise.name.toLowerCase().includes('pull-up') || 
            exercise.name.toLowerCase().includes('pullup') || 
            exercise.name.toLowerCase().includes('chin-up') ||
            exercise.name.toLowerCase().includes('chinup')) {
          const pullUpBar = equipmentByName.get('pull-up bar');
          if (pullUpBar && !matchingEquipment.includes(pullUpBar)) {
            matchingEquipment.push(pullUpBar);
            logger.info(`Matched ${exercise.name} with Pull-up Bar based on name pattern`);
          }
        }
        
        if (exercise.name.toLowerCase().includes('row machine') || 
            exercise.name.toLowerCase().includes('rowing machine')) {
          const rowingMachine = equipmentByName.get('rowing machine');
          if (rowingMachine && !matchingEquipment.includes(rowingMachine)) {
            matchingEquipment.push(rowingMachine);
            logger.info(`Matched ${exercise.name} with Rowing Machine based on name pattern`);
          }
        }
        
        if (exercise.name.toLowerCase().includes('treadmill')) {
          const treadmill = equipmentByName.get('treadmill');
          if (treadmill && !matchingEquipment.includes(treadmill)) {
            matchingEquipment.push(treadmill);
            logger.info(`Matched ${exercise.name} with Treadmill based on name pattern`);
          }
        }
        
        // 3. Match based on exercise types and common bodyweight exercises
        const isBodyweight = 
          exercise.name.toLowerCase().includes('push-up') || 
          exercise.name.toLowerCase().includes('pushup') ||
          exercise.name.toLowerCase().includes('sit-up') ||
          exercise.name.toLowerCase().includes('situp') ||
          exercise.name.toLowerCase().includes('plank') ||
          exercise.name.toLowerCase().includes('crunch') ||
          exercise.name.toLowerCase().includes('lunge') ||
          exercise.name.toLowerCase().includes('bodyweight squat') ||
          exercise.name.toLowerCase().includes('burpee') ||
          exercise.name.toLowerCase().includes('mountain climber') ||
          exercise.name.toLowerCase().includes('jumping jack') ||
          exercise.name.toLowerCase().includes('high knee');
        
        if (isBodyweight) {
          // For bodyweight floor exercises, add yoga mat
          const yogaMat = equipmentByName.get('yoga mat');
          if (yogaMat && !matchingEquipment.includes(yogaMat)) {
            matchingEquipment.push(yogaMat);
            logger.info(`Matched bodyweight exercise ${exercise.name} with Yoga Mat`);
          }
        }
        
        // 4. For stretches and yoga poses, add yoga mat
        const isStretchOrYoga = 
          exercise.name.toLowerCase().includes('stretch') ||
          exercise.name.toLowerCase().includes('yoga') ||
          exercise.name.toLowerCase().includes('pose') ||
          exercise.name.toLowerCase().includes('mobility');
        
        if (isStretchOrYoga) {
          const yogaMat = equipmentByName.get('yoga mat');
          if (yogaMat && !matchingEquipment.includes(yogaMat)) {
            matchingEquipment.push(yogaMat);
            logger.info(`Matched stretch/yoga exercise ${exercise.name} with Yoga Mat`);
          }
        }
        
        // 5. For foam rolling exercises
        if (exercise.name.toLowerCase().includes('foam roll') ||
            exercise.name.toLowerCase().includes('myofascial release')) {
          const foamRoller = equipmentByName.get('foam roller');
          if (foamRoller && !matchingEquipment.includes(foamRoller)) {
            matchingEquipment.push(foamRoller);
            logger.info(`Matched ${exercise.name} with Foam Roller based on name pattern`);
          }
        }
        
        // 6. For battle rope exercises
        if (exercise.name.toLowerCase().includes('battle rope') ||
            exercise.name.toLowerCase().includes('rope slams') ||
            exercise.name.toLowerCase().includes('rope waves')) {
          const battleRopes = equipmentByName.get('battle ropes');
          if (battleRopes && !matchingEquipment.includes(battleRopes)) {
            matchingEquipment.push(battleRopes);
            logger.info(`Matched ${exercise.name} with Battle Ropes based on name pattern`);
          }
        }
        
        // 7. For stability ball exercises
        if (exercise.name.toLowerCase().includes('stability ball') ||
            exercise.name.toLowerCase().includes('exercise ball') ||
            exercise.name.toLowerCase().includes('swiss ball')) {
          const stabilityBall = equipmentByName.get('stability ball');
          if (stabilityBall && !matchingEquipment.includes(stabilityBall)) {
            matchingEquipment.push(stabilityBall);
            logger.info(`Matched ${exercise.name} with Stability Ball based on name pattern`);
          }
        }
        
        // 8. For ab roller exercises
        if (exercise.name.toLowerCase().includes('ab roller') ||
            exercise.name.toLowerCase().includes('ab wheel')) {
          const abRoller = equipmentByName.get('ab roller wheel');
          if (abRoller && !matchingEquipment.includes(abRoller)) {
            matchingEquipment.push(abRoller);
            logger.info(`Matched ${exercise.name} with Ab Roller Wheel based on name pattern`);
          }
        }
        
        logger.info(`Found ${matchingEquipment.length} matching equipment items for ${exercise.name}`);
        
        // Add entries to the batch array
        for (const equipment of matchingEquipment) {
          junctionEntries.push({
            exercise_id: exercise.id,
            equipment_id: equipment.id
          });
        }
      } catch (error) {
        logger.error(`Error processing equipment for exercise ${exercise.name}:`, error);
        // Continue with the next exercise instead of failing the whole process
      }
    }
    
    // Insert entries in batches to avoid overwhelming the database
    if (junctionEntries.length > 0) {
      logger.info(`Inserting ${junctionEntries.length} entries into exercise_equipment junction table...`);
      
      // Use a more efficient batched approach for better performance
      const batchSize = 100;
      for (let i = 0; i < junctionEntries.length; i += batchSize) {
        const batch = junctionEntries.slice(i, i + batchSize);
        
        // Build VALUES part of the query
        const values = batch.map(entry => 
          `('${entry.exercise_id}', '${entry.equipment_id}')`
        ).join(', ');
        
        // Execute the batch insert query
        await AppDataSource.query(`
          INSERT INTO "exercise_equipment" ("exercise_id", "equipment_id")
          VALUES ${values}
          ON CONFLICT ("exercise_id", "equipment_id") DO NOTHING
        `);
      }
      
      logger.info(`Successfully inserted ${junctionEntries.length} entries into exercise_equipment junction table`);
    } else {
      logger.warn('No matching equipment found for any exercises');
    }
    
  } catch (error) {
    logger.error('Error seeding exercise-equipment junction table:', error);
    throw error;
  }
} 