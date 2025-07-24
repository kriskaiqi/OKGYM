const { Client } = require('pg');

async function checkWorkoutRepository() {
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
    
    // Check join tables for workout 1
    console.log('\n--- CHECKING JOIN TABLES FOR WORKOUT ID 1 ---');
    
    // Check muscle groups
    const muscleGroupsResult = await client.query(`
      SELECT wm.workout_id, wm.category_id, ec.name as category_name 
      FROM workout_muscle_group wm
      JOIN exercise_categories ec ON wm.category_id = ec.id
      WHERE wm.workout_id = 1
    `);
    
    console.log('Muscle groups for workout 1:', muscleGroupsResult.rows);
    
    // Check tags
    const tagsResult = await client.query(`
      SELECT wt.workout_id, wt.tag_id, t.name as tag_name 
      FROM workout_tag_map wt
      JOIN workout_tags t ON wt.tag_id = t.id
      WHERE wt.workout_id = 1
    `);
    
    console.log('Tags for workout 1:', tagsResult.rows);
    
    // Check exercises
    const exercisesResult = await client.query(`
      SELECT we.workout_plan_id, we.exercise_id, e.name as exercise_name 
      FROM workout_exercises we
      JOIN exercises e ON we.exercise_id = e.id
      WHERE we.workout_plan_id = 1
    `);
    
    console.log('Exercises for workout 1:', exercisesResult.rows);
    
    // Simulating a repository query - Updated with correct column names
    console.log('\n--- SIMULATING REPOSITORY QUERY ---');
    try {
        const repositoryQueryResult = await client.query(`
            SELECT 
                wp.id, 
                wp.name, 
                wp.description, 
                wp."workoutCategory", 
                wp.difficulty, 
                wp."estimatedDuration",
                wp."isCustom", 
                wp.popularity, 
                wp.rating
            FROM workout_plans wp
            LEFT JOIN workout_muscle_group wmg ON wp.id = wmg.workout_id
            LEFT JOIN workout_tag_map wtm ON wp.id = wtm.workout_id
            WHERE wp.id = 1
            GROUP BY wp.id
        `);
        console.log('Repository query result:', repositoryQueryResult.rows);
    } catch (error) {
        console.error('Error in repository query:', error);
    }
    
    // Check why no workout plans are showing up in the frontend
    console.log('\n--- CHECKING ALL WORKOUT PLANS ---');
    try {
        const allWorkoutsResult = await client.query(`
            SELECT 
                wp.id, 
                wp.name, 
                wp.description, 
                wp."workoutCategory", 
                wp.difficulty, 
                wp."estimatedDuration",
                wp."isCustom", 
                wp.popularity 
            FROM workout_plans wp
            ORDER BY wp.id
        `);
        console.log(`Found ${allWorkoutsResult.rows.length} workout plans in the database:`);
        allWorkoutsResult.rows.forEach(workout => {
            console.log(`ID: ${workout.id}, Name: ${workout.name}, Category: ${workout.workoutCategory}, Difficulty: ${workout.difficulty}`);
        });
    } catch (error) {
        console.error('Error retrieving all workout plans:', error);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

// Run the function
checkWorkoutRepository(); 