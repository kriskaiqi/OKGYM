import { AppDataSource } from '../data-source';
import { Exercise } from '../models/Exercise';
import { ExerciseCategory } from '../models/ExerciseCategory';

/**
 * This script examines how the relationship between Exercise and ExerciseCategory
 * is configured in the application.
 */
async function checkRelationships() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connection established.');

    // Check database for existing join table
    console.log('\nChecking database for exercise_category join table:');
    try {
      const result = await AppDataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'exercise_category'
        )
      `);
      
      console.log('Does exercise_category table exist?', result[0].exists);
      
      if (result[0].exists === true) {
        // If table exists, show its structure
        const columns = await AppDataSource.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'exercise_category'
        `);
        
        console.log('exercise_category table columns:');
        columns.forEach((col: any) => {
          console.log(`- ${col.column_name} (${col.data_type})`);
        });
        
        // Show sample data
        const sampleData = await AppDataSource.query('SELECT * FROM exercise_category LIMIT 5');
        console.log('Sample data:', sampleData);
      } else {
        console.log('Table does not exist, checking for alternative naming formats');
        
        // Check for tables that might contain both exercise and category
        const tables = await AppDataSource.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND (table_name LIKE '%exercise%' AND table_name LIKE '%category%')
        `);
        
        if (tables.length > 0) {
          console.log('Possible alternative tables found:');
          tables.forEach((t: any) => console.log(`- ${t.table_name}`));
          
          // Check the first alternative table's structure
          if (tables[0] && tables[0].table_name) {
            const altTableName = tables[0].table_name;
            const altColumns = await AppDataSource.query(`
              SELECT column_name, data_type 
              FROM information_schema.columns 
              WHERE table_name = '${altTableName}'
            `);
            
            console.log(`\nStructure of ${altTableName}:`);
            altColumns.forEach((col: any) => {
              console.log(`- ${col.column_name} (${col.data_type})`);
            });
          }
        } else {
          console.log('No alternative tables found');
        }
      }
    } catch (err) {
      console.error('Error querying join table:', err);
    }
    
    // Check for direct foreign keys between exercises and categories
    console.log('\nChecking for direct foreign keys between exercises and categories:');
    try {
      const foreignKeys = await AppDataSource.query(`
        SELECT
            tc.table_schema, 
            tc.constraint_name, 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_schema AS foreign_table_schema,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE 
            tc.constraint_type = 'FOREIGN KEY' AND
            ((tc.table_name = 'exercises' AND ccu.table_name = 'exercise_categories') OR
             (tc.table_name = 'exercise_categories' AND ccu.table_name = 'exercises'))
      `);
      
      if (foreignKeys.length > 0) {
        console.log('Found direct foreign keys:');
        foreignKeys.forEach((fk: any) => {
          console.log(`- ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      } else {
        console.log('No direct foreign keys found');
      }
    } catch (err) {
      console.error('Error checking foreign keys:', err);
    }
    
    // Try loading an exercise with its categories
    console.log('\nTrying to load an exercise with its categories:');
    try {
      const exerciseRepo = AppDataSource.getRepository(Exercise);
      const exercise = await exerciseRepo.findOne({
        where: {},
        relations: {
          categories: true
        }
      });
      
      if (exercise) {
        console.log(`Found exercise: ${exercise.name}`);
        console.log(`Categories loaded: ${exercise.categories ? exercise.categories.length : 0}`);
        if (exercise.categories && exercise.categories.length > 0) {
          console.log('Categories:', exercise.categories.map(c => c.name).join(', '));
        }
      } else {
        console.log('No exercises found');
      }
    } catch (err) {
      console.error('Error loading exercise with categories:', err);
      
      // If the previous query failed, try a simpler query
      try {
        const exerciseRepo = AppDataSource.getRepository(Exercise);
        const exercise = await exerciseRepo.findOne({
          where: {}
        });
        
        if (exercise) {
          console.log(`Found exercise without relations: ${exercise.name}`);
          console.log('Properties:', Object.keys(exercise));
          
          // Check if categories exists as a property
          if ('categories' in exercise) {
            console.log('Categories property exists but might not be loaded');
          } else {
            console.log('Categories property does not exist on the exercise object');
          }
        }
      } catch (innerErr) {
        console.error('Error loading basic exercise:', innerErr);
      }
    }
    
  } catch (error) {
    console.error('Error in checking relationships:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\nDatabase connection closed.');
    }
  }
}

// Run the check
checkRelationships().catch(console.error); 