const { Client } = require('pg');

// Database connection config
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'okgym',
  password: '123456',
  port: 5432,
};

async function checkCategoryTables() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database');
    
    // Check exercise_categories table
    console.log('\n1. Checking exercise_categories table...');
    const { rows: categories } = await client.query(`
      SELECT * FROM exercise_categories LIMIT 10
    `);
    
    console.log(`Found ${categories.length} categories`);
    if (categories.length > 0) {
      console.log('Sample category:');
      console.log(categories[0]);
    }
    
    // Check join table exercise_category
    console.log('\n2. Checking exercise_category join table...');
    try {
      const { rows: joinEntries } = await client.query(`
        SELECT * FROM exercise_category LIMIT 10
      `);
      
      console.log(`Found ${joinEntries.length} exercise-category relationships`);
      if (joinEntries.length > 0) {
        console.log('Sample relationship:');
        console.log(joinEntries[0]);
      }
    } catch (error) {
      console.log('Error querying exercise_category table:', error.message);
    }
    
    // Check all join tables related to categories
    console.log('\n3. Checking all category-related tables in the database...');
    const { rows: tables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%category%' OR table_name LIKE '%categor%'
    `);
    
    console.log('Category-related tables found:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    // Check relationships in Exercise model
    console.log('\n4. Checking if exercises have a categories relationship column...');
    const { rows: exerciseColumns } = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'exercises'
      AND column_name LIKE '%categor%'
    `);
    
    if (exerciseColumns.length > 0) {
      console.log('Category-related columns in exercises table:');
      exerciseColumns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('No category-related columns found in exercises table');
    }
    
    // Check if there's another join table
    console.log('\n5. Checking for other potential join tables...');
    const { rows: otherJoins } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (
        (table_name LIKE '%exercise%' AND table_name LIKE '%join%') OR
        (table_name LIKE '%exercise%' AND table_name LIKE '%relation%') OR
        (table_name LIKE '%exercise%' AND table_name LIKE '%map%')
      )
    `);
    
    console.log('Other potential join tables:');
    if (otherJoins.length > 0) {
      otherJoins.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    } else {
      console.log('No other potential join tables found');
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the check function
checkCategoryTables().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 