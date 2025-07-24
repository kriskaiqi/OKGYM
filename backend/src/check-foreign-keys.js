const { Client } = require('pg');

// Database connection config
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'okgym',
  password: '123456',
  port: 5432,
};

async function checkForeignKeys() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');
    
    // Check foreign keys for exercise_category table
    console.log('Checking foreign keys for exercise_category table:');
    const { rows: foreignKeys } = await client.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
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
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'exercise_category';
    `);
    
    if (foreignKeys.length > 0) {
      console.log('Foreign keys found:');
      foreignKeys.forEach(fk => {
        console.log(`  ${fk.constraint_name}: ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('No foreign keys found for exercise_category table.');
    }
    
    // Check indexes
    console.log('\nChecking indexes for exercise_category table:');
    const { rows: indexes } = await client.query(`
      SELECT
        indexname,
        indexdef
      FROM
        pg_indexes
      WHERE
        tablename = 'exercise_category';
    `);
    
    if (indexes.length > 0) {
      console.log('Indexes found:');
      indexes.forEach(idx => {
        console.log(`  ${idx.indexname}: ${idx.indexdef}`);
      });
    } else {
      console.log('No indexes found for exercise_category table.');
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the check function
checkForeignKeys().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 