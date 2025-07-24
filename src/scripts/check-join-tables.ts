import { AppDataSource } from '../data-source';

async function findJoinTables() {
  try {
    console.log("Database connection established.");

    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection established.");
    }

    // Now add the check for exercise_category table
    await checkExerciseCategoryTable();
    
    // Original function code...
    console.log('\nSearching for potential exercise-category join tables:');

    // Find tables containing "exercise" and "category"
    const joinTablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (table_name LIKE '%exercise%category%' OR table_name LIKE '%category%exercise%')
    `;
    
    const joinTables = await AppDataSource.query(joinTablesQuery);
    
    if (joinTables.length === 0) {
      console.log('No direct join tables found with "exercise" and "category" in the name.');
    }
    
    // ... rest of the original function
  } catch (error) {
    console.error("Error during database check:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed.");
    }
  }
}

async function checkExerciseCategoryTable() {
  console.log("Specifically checking for exercise_category join table...");
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
    try {
      const sampleData = await AppDataSource.query(`
        SELECT * FROM exercise_category LIMIT 10
      `);
      
      console.log("Sample data:", sampleData);
    } catch (error) {
      console.error("Error querying sample data:", error.message);
    }
  } else {
    console.log("exercise_category table not found - checking if it has a different name...");
    
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

      // For each alternative table, check its structure
      for (const tableRow of otherNamingFormats) {
        const tableName = tableRow.table_name;
        console.log(`\nChecking alternative table: ${tableName}`);
        
        // Check columns
        const columns = await AppDataSource.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
        `, [tableName]);
        
        console.log("Columns:", columns);
        
        // Check foreign keys
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
            AND tc.table_name = $1
        `, [tableName]);
        
        console.log("Foreign keys:", foreignKeys);
        
        // Get sample data
        try {
          const sampleData = await AppDataSource.query(`
            SELECT * FROM "${tableName}" LIMIT 10
          `);
          
          console.log("Sample data:", sampleData);
        } catch (error) {
          console.error(`Error querying sample data from ${tableName}:`, error.message);
        }
      }
    } else {
      console.log("No tables with alternative naming formats found.");
    }
  }
}

// Run the function
findJoinTables(); 