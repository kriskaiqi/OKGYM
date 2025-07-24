const { Client } = require('pg');

// Database connection config
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'okgym',
  password: '123456',
  port: 5432,
};

async function checkTable() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');
    
    // Check if exercise_category table exists
    console.log('Checking if exercise_category table exists...');
    const { rows: tableExists } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'exercise_category'
      );
    `);
    
    console.log(`exercise_category table exists: ${tableExists[0].exists}`);
    
    if (tableExists[0].exists) {
      // Check column types
      console.log('Getting column information for exercise_category:');
      const { rows: columns } = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'exercise_category'
        ORDER BY ordinal_position;
      `);
      
      if (columns.length > 0) {
        columns.forEach(col => {
          console.log(`  ${col.column_name}: ${col.data_type}`);
        });
      } else {
        console.log('No columns found for exercise_category table.');
      }
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the check function
checkTable().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 