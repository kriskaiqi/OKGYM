const { Client } = require('pg');

// Connection configuration
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'okgym',
  password: '123456',
  port: 5432,
});

async function checkJoins() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check exercise_categories table
    const categoriesQuery = await client.query('SELECT COUNT(*) FROM exercise_categories');
    console.log('Categories count:', categoriesQuery.rows[0].count);
    
    // Check exercise_category join table
    const joinQuery = await client.query('SELECT COUNT(*) FROM exercise_category');
    console.log('Join table count:', joinQuery.rows[0].count);
    
    // Check for specific category (CARDIO = 117)
    const cardioQuery = await client.query(`
      SELECT e.id, e.name 
      FROM exercises e 
      JOIN exercise_category ec ON e.id = ec.exercise_id 
      WHERE ec.category_id = 117 
      LIMIT 5
    `);
    console.log('Exercises with CARDIO category:', cardioQuery.rows);
    
    // Test the query that would be used with categoryIds filter
    console.log('\nTesting category filter query:');
    const testFilterQuery = await client.query(`
      SELECT e.id, e.name 
      FROM exercises e 
      JOIN exercise_category ec ON e.id = ec.exercise_id 
      WHERE ec.category_id IN (117) 
      LIMIT 5
    `);
    console.log('Query result:', testFilterQuery.rows);
    
  } catch (error) {
    console.error('Error checking joins:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

checkJoins(); 