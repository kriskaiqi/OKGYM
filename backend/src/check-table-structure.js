const { Client } = require('pg');

async function checkTableStructure() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'okgym',
    password: '123456',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check workout_plans table
    console.log('\n--- WORKOUT PLANS TABLE ---');
    const workoutPlansResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'workout_plans'
    `);
    console.log(workoutPlansResult.rows);
    
    // Check workout_tags table
    console.log('\n--- WORKOUT TAGS TABLE ---');
    const workoutTagsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'workout_tags'
    `);
    console.log(workoutTagsResult.rows);
    
    // Check equipment table
    console.log('\n--- EQUIPMENT TABLE ---');
    const equipmentResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'equipment'
    `);
    console.log(equipmentResult.rows);
    
    // Check exercise_categories table
    console.log('\n--- EXERCISE CATEGORIES TABLE ---');
    const categoriesResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'exercise_categories'
    `);
    console.log(categoriesResult.rows);
    
    // Check if there are any workouts
    console.log('\n--- WORKOUT COUNT ---');
    const workoutCountResult = await client.query('SELECT COUNT(*) FROM workout_plans');
    console.log(`Total workouts: ${workoutCountResult.rows[0].count}`);
    
    if (parseInt(workoutCountResult.rows[0].count) > 0) {
      // Get sample workout data
      console.log('\n--- SAMPLE WORKOUT DATA ---');
      const sampleWorkoutResult = await client.query('SELECT id, name, difficulty FROM workout_plans LIMIT 3');
      console.log(sampleWorkoutResult.rows);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the function
checkTableStructure(); 