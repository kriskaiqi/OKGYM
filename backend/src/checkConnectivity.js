const { Client } = require('pg');

async function checkDbConnectivity() {
  console.log('Testing database connectivity...');
  
  // Get DB details from environment or use defaults
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "5432");
  const username = process.env.DB_USERNAME || "postgres";
  const password = process.env.DB_PASSWORD || "123456";
  const database = process.env.DB_NAME || "okgym";
  
  console.log(`Connecting to PostgreSQL at ${host}:${port} as ${username}`);
  
  const client = new Client({
    host,
    port,
    user: username,
    password,
    database
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database!');
    
    // Simple query to test functionality
    const result = await client.query('SELECT NOW()');
    console.log(`Current database time: ${result.rows[0].now}`);
    
    // Check tables
    console.log('\nChecking tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`Found ${tablesResult.rowCount} tables:`);
    tablesResult.rows.forEach(row => console.log(`- ${row.table_name}`));
    
    // Check for exercise_category table specifically
    console.log('\nLooking for exercise_category table...');
    const categoryTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'exercise_category'
      );
    `);
    
    if (categoryTableResult.rows[0].exists) {
      console.log('✅ exercise_category table exists');
      
      // Check content
      const contentResult = await client.query('SELECT COUNT(*) FROM exercise_category');
      console.log(`Table contains ${contentResult.rows[0].count} entries`);
      
      // Check structure
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'exercise_category'
      `);
      
      console.log('Table structure:');
      columnsResult.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('❌ exercise_category table does NOT exist!');
      
      // Look for potential alternatives
      console.log('\nLooking for alternative tables...');
      const alternativeResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (
          table_name LIKE '%exercise%category%' OR 
          table_name LIKE '%category%exercise%'
        )
      `);
      
      if (alternativeResult.rowCount > 0) {
        console.log('Found potential alternatives:');
        alternativeResult.rows.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
      } else {
        console.log('No alternative tables found');
      }
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
  } finally {
    await client.end().catch(console.error);
    console.log('Connection closed');
  }
}

checkDbConnectivity().catch(console.error); 