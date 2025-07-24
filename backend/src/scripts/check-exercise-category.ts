import { AppDataSource } from '../data-source';
import logger from '../utils/logger';
import { Exercise } from '../models/Exercise';
import { ExerciseCategory } from '../models/ExerciseCategory';

/**
 * Script to check the exercise_category junction table
 */
async function checkExerciseCategoryTable() {
  try {
    // Initialize database connection if not already initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Database connection established');
    }
    
    // Check if the junction table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'exercise_category'
      );
    `;
    
    const tableExists = await AppDataSource.query(tableExistsQuery);
    console.log('Junction table exists:', tableExists[0].exists);
    
    if (tableExists[0].exists) {
      // Get junction table structure
      const tableStructureQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'exercise_category'
        ORDER BY ordinal_position;
      `;
      
      const tableStructure = await AppDataSource.query(tableStructureQuery);
      console.log('Junction table structure:');
      console.table(tableStructure);
      
      // Count records in junction table
      const countQuery = `
        SELECT COUNT(*) FROM exercise_category;
      `;
      
      const countResult = await AppDataSource.query(countQuery);
      console.log('Number of records in junction table:', countResult[0].count);
      
      // Sample records from junction table
      const sampleQuery = `
        SELECT * FROM exercise_category LIMIT 5;
      `;
      
      const sampleRecords = await AppDataSource.query(sampleQuery);
      console.log('Sample records from junction table:');
      console.log(sampleRecords);
      
      // Check how many exercises have categories
      const exerciseRepository = AppDataSource.getRepository(Exercise);
      const exerciseCount = await exerciseRepository.count();
      
      const exercisesWithCategoriesQuery = `
        SELECT COUNT(DISTINCT exercise_id) 
        FROM exercise_category;
      `;
      
      const exercisesWithCategories = await AppDataSource.query(exercisesWithCategoriesQuery);
      console.log('Total exercises:', exerciseCount);
      console.log('Exercises with categories:', exercisesWithCategories[0].count);
      
      // Check category distribution
      const categoryRepository = AppDataSource.getRepository(ExerciseCategory);
      const categoryCount = await categoryRepository.count();
      
      const categoriesWithExercisesQuery = `
        SELECT COUNT(DISTINCT category_id) 
        FROM exercise_category;
      `;
      
      const categoriesWithExercises = await AppDataSource.query(categoriesWithExercisesQuery);
      console.log('Total categories:', categoryCount);
      console.log('Categories with exercises:', categoriesWithExercises[0].count);
      
      // Get top 5 categories by exercise count
      const topCategoriesQuery = `
        SELECT ec.category_id, exc.name, COUNT(ec.exercise_id) as exercise_count
        FROM exercise_category ec
        JOIN exercise_categories exc ON ec.category_id = exc.id
        GROUP BY ec.category_id, exc.name
        ORDER BY exercise_count DESC
        LIMIT 5;
      `;
      
      const topCategories = await AppDataSource.query(topCategoriesQuery);
      console.log('Top 5 categories by exercise count:');
      console.table(topCategories);
    }
    
    console.log('Check completed successfully');
    
  } catch (error) {
    console.error('Error checking exercise_category table:', error);
  } finally {
    // Close the database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
    
    process.exit(0);
  }
}

// Run the check function
checkExerciseCategoryTable(); 