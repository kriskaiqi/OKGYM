const { Client } = require('pg');

async function checkWorkoutExercisesStructure() {
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
    
    // Check workout_exercises table structure
    console.log('\n--- WORKOUT EXERCISES TABLE STRUCTURE ---');
    const tableStructureResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'workout_exercises'
      ORDER BY ordinal_position
    `);
    
    console.log(tableStructureResult.rows);
    
    // Check workout relationship data
    console.log('\n--- WORKOUT RELATIONSHIP DATA ---');
    const workoutRelationshipResult = await client.query(`
      SELECT 
        w.id as workout_id, 
        w.name as workout_name, 
        (SELECT COUNT(*) FROM workout_muscle_group wm WHERE wm.workout_id = w.id) as muscle_group_count,
        (SELECT COUNT(*) FROM workout_tag_map wt WHERE wt.workout_id = w.id) as tag_count,
        (SELECT COUNT(*) FROM workout_exercises we WHERE we.workout_plan_id = w.id) as exercise_count
      FROM workout_plans w
    `);
    
    console.log(workoutRelationshipResult.rows);
    
    // Check sample muscle groups for a workout
    console.log('\n--- SAMPLE MUSCLE GROUPS FOR WORKOUT ---');
    const muscleGroupResult = await client.query(`
      SELECT w.id, w.name as workout_name, c.id as category_id, c.name as category_name
      FROM workout_plans w
      JOIN workout_muscle_group wm ON w.id = wm.workout_id
      JOIN exercise_categories c ON wm.category_id = c.id
      LIMIT 5
    `);
    
    console.log(muscleGroupResult.rows);
    
    // Check sample tags for a workout
    console.log('\n--- SAMPLE TAGS FOR WORKOUT ---');
    const tagResult = await client.query(`
      SELECT w.id, w.name as workout_name, t.id as tag_id, t.name as tag_name
      FROM workout_plans w
      JOIN workout_tag_map wt ON w.id = wt.workout_id
      JOIN workout_tags t ON wt.tag_id = t.id
      LIMIT 5
    `);
    
    console.log(tagResult.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the function
checkWorkoutExercisesStructure(); 