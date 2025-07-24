import { AppDataSource } from '../data-source';

/**
 * Simple script to check table names in the database
 */
async function checkTables() {
  try {
    // Initialize database
    await AppDataSource.initialize();
    console.log('Database connection established.');
    
    // Get all tables
    const tables = await AppDataSource.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );
    
    console.log('Tables in database:');
    tables.forEach((table: { table_name: string }) => {
      console.log(`- ${table.table_name}`);
    });
    
    // Look for tables related to exercises and categories
    console.log('\nExercise-related tables:');
    const exerciseTables = tables.filter((table: { table_name: string }) => 
      table.table_name.includes('exercise')
    );
    
    exerciseTables.forEach((table: { table_name: string }) => {
      console.log(`- ${table.table_name}`);
    });
    
    // Check table schema for one of the tables
    if (exerciseTables.length > 0) {
      const tableName = exerciseTables[0].table_name;
      console.log(`\nSchema for table ${tableName}:`);
      
      const columns = await AppDataSource.query(
        `SELECT column_name, data_type 
         FROM information_schema.columns 
         WHERE table_name = $1`,
        [tableName]
      );
      
      columns.forEach((column: { column_name: string, data_type: string }) => {
        console.log(`- ${column.column_name} (${column.data_type})`);
      });
    }
    
    console.log('\nTest completed successfully.');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

// Run the test
checkTables().catch(console.error); 