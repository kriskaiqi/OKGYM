import { AppDataSource } from '../data-source';

async function checkJoinTable() {
  try {
    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection established.");
    }

    console.log("Checking for exercise_category join table...");
    const result = await AppDataSource.query(`
      SELECT * FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'exercise_category'
    `);

    if (result.length > 0) {
      console.log("Table found:", result);
      
      // Check the columns
      const columns = await AppDataSource.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'exercise_category'
      `);
      
      console.log("Table columns:", columns);
      
      // Check for foreign keys
      const foreignKeys = await AppDataSource.query(`
        SELECT
          kcu.column_name,
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
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = 'exercise_category'
      `);
      
      console.log("Foreign keys:", foreignKeys);
      
      // Get sample data
      const sampleData = await AppDataSource.query(`
        SELECT * FROM exercise_category LIMIT 10
      `);
      
      console.log("Sample data:", sampleData);
    } else {
      console.log("Table not found - checking if it has a different name...");
      
      // Check for similarly named tables
      const similarTables = await AppDataSource.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        AND (table_name LIKE '%exercise%category%' OR table_name LIKE '%category%exercise%')
      `);
      
      if (similarTables.length > 0) {
        console.log("Found similar tables:", similarTables);
      } else {
        console.log("No similar tables found.");
      }
      
      // Check other possible naming formats
      const otherNamingFormats = await AppDataSource.query(`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        AND (
          table_name = 'exercise_categories_exercises' OR
          table_name = 'exercises_exercise_categories' OR
          table_name = 'exercise_to_category' OR
          table_name = 'category_to_exercise'
        )
      `);
      
      if (otherNamingFormats.length > 0) {
        console.log("Found tables with alternative naming formats:", otherNamingFormats);
      } else {
        console.log("No tables with alternative naming formats found.");
      }
    }

    console.log("Check completed successfully.");
  } catch (error) {
    console.error("Error during database check:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed.");
    }
  }
}

// Run the function
checkJoinTable(); 