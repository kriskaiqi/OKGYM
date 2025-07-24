import { AppDataSource } from '../data-source';
import { Exercise } from '../models/Exercise';
import { ExerciseCategory, CategoryType } from '../models/ExerciseCategory';
import { MuscleGroup } from '../models/shared/Validation';
import logger from '../utils/logger';

/**
 * Seed the junction table between exercises and categories based on exercise metadata
 * This creates connections between exercises and their relevant categories like muscle groups.
 * This approach ensures we don't change the database schema but properly populate the junction table.
 */
export async function seedExerciseCategoryJunction(): Promise<void> {
  try {
    logger.info('Starting to seed exercise-category junction table...');
    
    // Check if junction entries already exist
    const existingCount = await AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_category"
    `);
    
    if (parseInt(existingCount[0].count) > 0) {
      logger.info(`Found ${existingCount[0].count} existing entries in exercise_category junction table. Skipping seeding.`);
      return;
    }
    
    // Load all exercises and categories
    const exercises = await AppDataSource.getRepository(Exercise).find();
    const categories = await AppDataSource.getRepository(ExerciseCategory).find();
    
    logger.info(`Found ${exercises.length} exercises and ${categories.length} categories to process.`);
    
    if (exercises.length === 0 || categories.length === 0) {
      logger.warn('No exercises or categories found. Make sure those are seeded first.');
      return;
    }
    
    // Create a batch array to hold all the values for insertion
    const junctionEntries: Array<{exercise_id: string, category_id: number}> = [];
    
    // Process each exercise
    for (const exercise of exercises) {
      logger.info(`Processing categories for exercise: ${exercise.name} (${exercise.id})`);
      
      try {
        // Match by exercise type (compound, isolation, etc.)
        const typeMatches = categories.filter(cat => 
          cat.type === CategoryType.MOVEMENT_PATTERN && 
          exercise.types.some(t => t.includes(cat.name.toUpperCase()) || cat.name.toUpperCase().includes(String(t)))
        );
        
        // Match by muscle group (primary and secondary)
        const muscleGroupMatches = categories.filter(cat => 
          cat.type === CategoryType.MUSCLE_GROUP && 
          (exercise.targetMuscleGroups.some(m => cat.name.toUpperCase() === String(m)) || 
           exercise.synergistMuscleGroups.some(m => cat.name.toUpperCase() === String(m)))
        );
        
        // Match by equipment (we'll check if the exercise has equipmentOptions array property)
        const equipmentMatches = categories.filter(cat => 
          cat.type === CategoryType.EQUIPMENT && 
          exercise.equipmentOptions?.some(e => cat.name.includes(e.name))
        );
        
        // Match by difficulty level
        const levelMatches = categories.filter(cat => 
          cat.type === CategoryType.EXPERIENCE_LEVEL && 
          (cat.name.toUpperCase().includes(String(exercise.level)))
        );
        
        // Match by movement pattern
        const movementMatches = categories.filter(cat => 
          cat.type === CategoryType.MOVEMENT_PATTERN && 
          exercise.movementPattern && cat.name.toUpperCase().includes(String(exercise.movementPattern))
        );
        
        // Combine all matches
        const allMatches = [
          ...typeMatches, 
          ...muscleGroupMatches, 
          ...equipmentMatches,
          ...levelMatches,
          ...movementMatches
        ];
        
        // Remove duplicates by category ID
        const uniqueMatches = allMatches.filter((cat, index, self) => 
          self.findIndex(c => c.id === cat.id) === index
        );
        
        logger.info(`Found ${uniqueMatches.length} matching categories for ${exercise.name}`);
        
        // Add entries to the batch array
        for (const category of uniqueMatches) {
          junctionEntries.push({
            exercise_id: exercise.id,
            category_id: category.id
          });
        }
      } catch (error) {
        logger.error(`Error processing categories for exercise ${exercise.name}:`, error);
        // Continue with the next exercise instead of failing the whole process
      }
    }
    
    // Insert entries in batches to avoid overwhelming the database
    if (junctionEntries.length > 0) {
      logger.info(`Inserting ${junctionEntries.length} entries into exercise_category junction table...`);
      
      // Use a more efficient batched approach for better performance
      const batchSize = 100;
      for (let i = 0; i < junctionEntries.length; i += batchSize) {
        const batch = junctionEntries.slice(i, i + batchSize);
        
        // Build VALUES part of the query
        const values = batch.map(entry => 
          `('${entry.exercise_id}', ${entry.category_id})`
        ).join(', ');
        
        // Execute the batch insert query
        await AppDataSource.query(`
          INSERT INTO "exercise_category" ("exercise_id", "category_id")
          VALUES ${values}
          ON CONFLICT ("exercise_id", "category_id") DO NOTHING
        `);
      }
      
      logger.info(`Successfully inserted ${junctionEntries.length} entries into exercise_category junction table`);
    } else {
      logger.warn('No matching categories found for any exercises');
    }
    
  } catch (error) {
    logger.error('Error seeding exercise-category junction table:', error);
    throw error;
  }
} 