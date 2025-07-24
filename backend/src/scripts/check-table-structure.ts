import { AppDataSource } from '../data-source';

/**
 * Check the structure of the workout_sessions table
 */
async function checkTableStructure() {
  console.log('Checking structure of workout_sessions table...');
  
  try {
    // Initialize database
    await AppDataSource.initialize();
    console.log('Database connection established.');
    
    // Query table structure
    const tableInfo = await AppDataSource.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'workout_sessions'
      ORDER BY ordinal_position
    `);
    
    console.log('\nColumns in workout_sessions table:');
    tableInfo.forEach((column: any) => {
      console.log(`- ${column.column_name} (${column.data_type}, ${column.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
    });
    
    // Check for test data
    const countResult = await AppDataSource.query('SELECT COUNT(*) FROM workout_sessions');
    console.log(`\nTotal records in workout_sessions table: ${countResult[0].count}`);
    
    if (parseInt(countResult[0].count) > 0) {
      const sampleData = await AppDataSource.query('SELECT * FROM workout_sessions LIMIT 1');
      console.log('\nSample data (first row):');
      console.log(sampleData[0]);
    }
    
    console.log('\nCheck completed successfully.');
  } catch (error) {
    console.error('Error during check:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

// Run the check
checkTableStructure().catch(console.error); 