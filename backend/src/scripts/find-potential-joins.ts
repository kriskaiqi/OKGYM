import { AppDataSource } from "../data-source";

async function findPotentialJoinTables() {
  try {
    console.log("Database connection established.");

    // Initialize the database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection established.");
    }

    // Find all tables that might be join tables for exercises
    const exerciseJoinTablesQuery = `
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
        AND table_name LIKE '%exercise%'
        AND table_name != 'exercises'
        AND table_name != 'exercise_details'
        AND table_name != 'exercise_form_analysis'
        AND table_name != 'exercise_specific_analysis'
    `;
    
    const potentialJoinTables = await AppDataSource.query(exerciseJoinTablesQuery);
    console.log("Potential join tables for exercises:", potentialJoinTables.map(t => t.table_name));

    // For each potential join table, check its columns
    for (const tableRow of potentialJoinTables) {
      const tableName = tableRow.table_name;
      
      // Get columns of the table
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
      `;
      
      const columns = await AppDataSource.query(columnsQuery, [tableName]);
      console.log(`\nTable: ${tableName}`);
      console.log("Columns:", columns.map(c => `${c.column_name} (${c.data_type})`));
      
      // Check for foreign keys
      const foreignKeysQuery = `
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
      `;
      
      const foreignKeys = await AppDataSource.query(foreignKeysQuery, [tableName]);
      
      if (foreignKeys.length > 0) {
        console.log("Foreign keys:");
        for (const fk of foreignKeys) {
          console.log(`  ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        }
        
        // If this table has a foreign key to exercises and another table, it's likely a join table
        const exerciseFk = foreignKeys.find(fk => fk.foreign_table_name === 'exercises');
        if (exerciseFk) {
          const otherFks = foreignKeys.filter(fk => fk.foreign_table_name !== 'exercises');
          if (otherFks.length > 0) {
            console.log(`\n✅ ${tableName} appears to be a join table between exercises and:`, 
              otherFks.map(fk => fk.foreign_table_name).join(', '));
              
            // Get sample data from the join table
            try {
              const sampleDataQuery = `SELECT * FROM "${tableName}" LIMIT 5`;
              const sampleData = await AppDataSource.query(sampleDataQuery);
              console.log("Sample data:", JSON.stringify(sampleData, null, 2));
            } catch (error) {
              console.log("Could not fetch sample data:", error.message);
            }
          }
        }
      } else {
        console.log("No foreign keys found.");
      }
    }

    // Look for custom relationship patterns (JSON arrays or column patterns)
    console.log("\nChecking for embedded relationships in exercises table...");
    const exerciseColumnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'exercises'
    `;
    
    const exerciseColumns = await AppDataSource.query(exerciseColumnsQuery);
    const jsonColumns = exerciseColumns.filter(col => 
      col.data_type === 'json' || col.data_type === 'jsonb');
    
    if (jsonColumns.length > 0) {
      console.log("JSON columns that might contain relationships:", 
        jsonColumns.map(c => `${c.column_name} (${c.data_type})`));
      
      // For each JSON column, check a sample to see if it contains category IDs
      for (const jsonCol of jsonColumns) {
        try {
          const sampleQuery = `
            SELECT id, "${jsonCol.column_name}" 
            FROM exercises 
            WHERE "${jsonCol.column_name}" IS NOT NULL 
            LIMIT 5
          `;
          const samples = await AppDataSource.query(sampleQuery);
          console.log(`\nSample data for ${jsonCol.column_name}:`, JSON.stringify(samples, null, 2));
        } catch (error) {
          console.log(`Error getting sample for ${jsonCol.column_name}:`, error.message);
        }
      }
    }

    console.log("\nTest completed successfully.");
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
findPotentialJoinTables(); 