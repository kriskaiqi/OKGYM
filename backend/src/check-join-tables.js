const { Client } = require('pg');

async function checkJoinTables() {
  console.log('Checking database for join tables...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/okgym'
  });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check for all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nAll tables in database:');
    tablesResult.rows.forEach(row => console.log(row.table_name));
    
    // Look for exercise category tables
    console.log('\nPossible exercise category join tables:');
    const joinTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (
        table_name LIKE '%exercise%category%' OR 
        table_name LIKE '%category%exercise%'
      )
    `);
    
    if (joinTablesResult.rows.length === 0) {
      console.log('No exercise category join tables found');
    } else {
      for (const row of joinTablesResult.rows) {
        console.log(`\nFound table: ${row.table_name}`);
        
        // Check columns
        const columnsResult = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = '${row.table_name}'
        `);
        
        console.log(`Columns for ${row.table_name}:`);
        columnsResult.rows.forEach(col => {
          console.log(`  ${col.column_name} (${col.data_type})`);
        });
        
        // Check sample data
        const dataResult = await client.query(`
          SELECT * FROM "${row.table_name}" LIMIT 5
        `);
        
        console.log(`Sample data (${dataResult.rowCount} rows):`);
        console.log(JSON.stringify(dataResult.rows, null, 2));
      }
    }
    
    // Specifically check for expected table name
    const specificCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'exercise_category'
      );
    `);
    
    console.log('\nSpecific check for exercise_category table:');
    console.log('Exists:', specificCheck.rows[0].exists);
    
    if (specificCheck.rows[0].exists) {
      // Check data in the expected table
      const dataResult = await client.query(`
        SELECT * FROM exercise_category LIMIT 5
      `);
      
      console.log(`Sample data (${dataResult.rowCount} rows):`);
      console.log(JSON.stringify(dataResult.rows, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

checkJoinTables().catch(console.error); 