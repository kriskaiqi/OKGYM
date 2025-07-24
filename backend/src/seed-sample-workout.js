const { Client } = require('pg');

async function seedSampleWorkout() {
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
    
    // Check if we already have a workout
    const workoutCountResult = await client.query('SELECT COUNT(*) FROM workout_plans');
    const workoutCount = parseInt(workoutCountResult.rows[0].count);
    
    let workoutId;
    
    if (workoutCount === 0) {
      console.log('No workouts found, creating a sample workout');
      
      // Create a sample workout
      const insertWorkoutResult = await client.query(`
        INSERT INTO workout_plans (
          name, 
          description, 
          difficulty, 
          estimatedDuration, 
          isCustom, 
          workoutCategory,
          estimatedCaloriesBurn,
          "createdAt",
          "updatedAt"
        ) VALUES (
          'Full Body Workout', 
          'A comprehensive full body workout targeting all major muscle groups', 
          'BEGINNER', 
          45, 
          false, 
          'FULL_BODY',
          300,
          NOW(),
          NOW()
        ) RETURNING id
      `);
      
      workoutId = insertWorkoutResult.rows[0].id;
      console.log(`Created workout with ID: ${workoutId}`);
    } else {
      // Get the ID of an existing workout
      const workoutResult = await client.query('SELECT id FROM workout_plans LIMIT 1');
      workoutId = workoutResult.rows[0].id;
      console.log(`Using existing workout with ID: ${workoutId}`);
    }
    
    // Get exercise categories
    const categoriesResult = await client.query('SELECT id, name FROM exercise_categories LIMIT 3');
    const categories = categoriesResult.rows;
    
    if (categories.length > 0) {
      console.log('Adding muscle group relationships to workout');
      
      // Add workout to muscle groups
      for (const category of categories) {
        try {
          await client.query(`
            INSERT INTO workout_muscle_group (workout_id, category_id) 
            VALUES ($1, $2) 
            ON CONFLICT DO NOTHING
          `, [workoutId, category.id]);
          
          console.log(`Added category ${category.name} (${category.id}) to workout`);
        } catch (error) {
          console.error(`Error adding category ${category.id} to workout:`, error.message);
        }
      }
    }
    
    // Check if workout_tags table has any tags
    const tagCountResult = await client.query('SELECT COUNT(*) FROM workout_tags');
    const tagCount = parseInt(tagCountResult.rows[0].count);
    
    if (tagCount === 0) {
      console.log('Creating sample workout tags');
      
      // Create sample tags
      const sampleTags = [
        { name: 'HIIT', description: 'High-Intensity Interval Training' },
        { name: 'Strength', description: 'Strength training workouts' },
        { name: 'Cardio', description: 'Cardiovascular workouts' },
        { name: 'Flexibility', description: 'Flexibility and mobility workouts' },
        { name: 'Endurance', description: 'Endurance building workouts' }
      ];
      
      for (const tag of sampleTags) {
        const insertTagResult = await client.query(`
          INSERT INTO workout_tags (name, description, "isActive", "usageCount", created_at, updated_at)
          VALUES ($1, $2, true, 0, NOW(), NOW())
          RETURNING id
        `, [tag.name, tag.description]);
        
        console.log(`Created tag ${tag.name} with ID: ${insertTagResult.rows[0].id}`);
      }
    }
    
    // Get workout tags
    const tagsResult = await client.query('SELECT id, name FROM workout_tags LIMIT 3');
    const tags = tagsResult.rows;
    
    if (tags.length > 0) {
      console.log('Adding tag relationships to workout');
      
      // Add workout to tags
      for (const tag of tags) {
        try {
          await client.query(`
            INSERT INTO workout_tag_map (workout_id, tag_id) 
            VALUES ($1, $2) 
            ON CONFLICT DO NOTHING
          `, [workoutId, tag.id]);
          
          console.log(`Added tag ${tag.name} (${tag.id}) to workout`);
        } catch (error) {
          console.error(`Error adding tag ${tag.id} to workout:`, error.message);
        }
      }
    }
    
    // Add exercises to the workout plan
    const exercisesResult = await client.query('SELECT id, name FROM exercises LIMIT 5');
    const exercises = exercisesResult.rows;
    
    if (exercises.length > 0) {
      console.log('Adding exercises to workout');
      
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];
        try {
          await client.query(`
            INSERT INTO workout_exercises (
              exercise_id, 
              workout_plan_id, 
              "order", 
              repetitions, 
              sets, 
              duration, 
              "restTime",
              intensity,
              tempo,
              "rangeOfMotion",
              "exerciseRole",
              "setType",
              "progressionStrategy",
              "substitutionOptions",
              created_at,
              updated_at
            ) VALUES (
              $1, $2, $3, 12, 3, 60, 30, 
              '{"level": "MEDIUM", "value": 70}', 
              '{"eccentric": 2, "concentric": 2, "hold": 1, "rest": 0}',
              '{"upper": 90, "lower": 0}',
              'PRIMARY',
              'STANDARD',
              '{"type": "LINEAR", "increment": 5}',
              '{"options": []}',
              NOW(), 
              NOW()
            )
            ON CONFLICT DO NOTHING
          `, [exercise.id, workoutId, i + 1]);
          
          console.log(`Added exercise ${exercise.name} (${exercise.id}) to workout`);
        } catch (error) {
          console.error(`Error adding exercise ${exercise.id} to workout:`, error.message);
        }
      }
    }
    
    console.log('Sample workout setup complete');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
seedSampleWorkout(); 