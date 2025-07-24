const { Client } = require('pg');

async function fixWorkoutJoinTables() {
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
    
    // Check if tables exist
    const tablesExist = await checkTables(client);
    
    if (!tablesExist.workout_tag_map) {
      console.log('Creating workout_tag_map table');
      await createWorkoutTagMapTable(client);
    } else {
      console.log('workout_tag_map table already exists');
    }
    
    if (!tablesExist.workout_muscle_group) {
      console.log('Creating workout_muscle_group table');
      await createWorkoutMuscleGroupTable(client);
    } else {
      console.log('workout_muscle_group table already exists');
    }
    
    if (!tablesExist.workout_equipment) {
      console.log('Creating workout_equipment table');
      await createWorkoutEquipmentTable(client);
    } else {
      console.log('workout_equipment table already exists');
    }
    
    // Create some sample data
    const workoutCount = await getWorkoutCount(client);
    if (workoutCount > 0) {
      // Add sample relationships if there are any workouts
      await addSampleRelationships(client);
    } else {
      console.log('No workouts found. Skipping sample relationships');
    }
    
    console.log('Join tables setup complete');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

async function checkTables(client) {
  const tableCheckQuery = `
    SELECT 
      EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workout_tag_map') as workout_tag_map,
      EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workout_muscle_group') as workout_muscle_group,
      EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workout_equipment') as workout_equipment
  `;
  
  const result = await client.query(tableCheckQuery);
  console.log('Table check result:', result.rows[0]);
  return result.rows[0];
}

async function createWorkoutTagMapTable(client) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS workout_tag_map (
      workout_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (workout_id, tag_id),
      CONSTRAINT fk_workout_tags_workout_id FOREIGN KEY (workout_id) REFERENCES workout_plans(id) ON DELETE CASCADE,
      CONSTRAINT fk_workout_tags_tag_id FOREIGN KEY (tag_id) REFERENCES workout_tags(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_workout_tag_map_workout_id ON workout_tag_map(workout_id);
    CREATE INDEX IF NOT EXISTS idx_workout_tag_map_tag_id ON workout_tag_map(tag_id);
  `;
  
  await client.query(createTableQuery);
  console.log('workout_tag_map table created');
}

async function createWorkoutMuscleGroupTable(client) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS workout_muscle_group (
      workout_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      PRIMARY KEY (workout_id, category_id),
      CONSTRAINT fk_workout_muscle_group_workout_id FOREIGN KEY (workout_id) REFERENCES workout_plans(id) ON DELETE CASCADE,
      CONSTRAINT fk_workout_muscle_group_category_id FOREIGN KEY (category_id) REFERENCES exercise_categories(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_workout_muscle_group_workout_id ON workout_muscle_group(workout_id);
    CREATE INDEX IF NOT EXISTS idx_workout_muscle_group_category_id ON workout_muscle_group(category_id);
  `;
  
  await client.query(createTableQuery);
  console.log('workout_muscle_group table created');
}

async function createWorkoutEquipmentTable(client) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS workout_equipment (
      workout_id INTEGER NOT NULL,
      equipment_id UUID NOT NULL,
      PRIMARY KEY (workout_id, equipment_id),
      CONSTRAINT fk_workout_equipment_workout_id FOREIGN KEY (workout_id) REFERENCES workout_plans(id) ON DELETE CASCADE,
      CONSTRAINT fk_workout_equipment_equipment_id FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_workout_equipment_workout_id ON workout_equipment(workout_id);
    CREATE INDEX IF NOT EXISTS idx_workout_equipment_equipment_id ON workout_equipment(equipment_id);
  `;
  
  await client.query(createTableQuery);
  console.log('workout_equipment table created');
}

async function getWorkoutCount(client) {
  const countQuery = `SELECT COUNT(*) as count FROM workout_plans`;
  const result = await client.query(countQuery);
  console.log(`Found ${result.rows[0].count} workouts`);
  return parseInt(result.rows[0].count);
}

async function addSampleRelationships(client) {
  // Check if there are any workout tags
  const tagCountQuery = `SELECT COUNT(*) as count FROM workout_tags`;
  const tagResult = await client.query(tagCountQuery);
  const tagCount = parseInt(tagResult.rows[0].count);
  
  if (tagCount === 0) {
    console.log('No workout tags found. Creating sample tags');
    await createSampleTags(client);
  }
  
  // Check if there are any categories
  const categoryCountQuery = `SELECT COUNT(*) as count FROM exercise_categories`;
  const categoryResult = await client.query(categoryCountQuery);
  const categoryCount = parseInt(categoryResult.rows[0].count);
  
  if (categoryCount === 0) {
    console.log('No exercise categories found. Please run the category setup script first');
  } else {
    console.log(`Found ${categoryCount} exercise categories`);
  }
  
  // Get workout IDs
  const workoutQuery = `SELECT id FROM workout_plans LIMIT 5`;
  const workoutResult = await client.query(workoutQuery);
  const workouts = workoutResult.rows;
  
  if (workouts.length > 0) {
    // Get tag IDs
    const tagQuery = `SELECT id FROM workout_tags`;
    const tagResult = await client.query(tagQuery);
    const tags = tagResult.rows;
    
    // Get category IDs
    const categoryQuery = `SELECT id FROM exercise_categories`;
    const categoryResult = await client.query(categoryQuery);
    const categories = categoryResult.rows;
    
    // Get equipment IDs
    const equipmentQuery = `SELECT id FROM equipment`;
    const equipmentResult = await client.query(equipmentQuery);
    const equipment = equipmentResult.rows;
    
    for (const workout of workouts) {
      console.log(`Adding relationships for workout ID ${workout.id}`);
      
      // Add tag relationships (if tags exist)
      if (tags.length > 0) {
        // Assign 1-3 random tags to each workout
        const tagCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < tagCount && i < tags.length; i++) {
          try {
            await client.query(
              `INSERT INTO workout_tag_map (workout_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [workout.id, tags[i].id]
            );
          } catch (error) {
            console.error(`Error adding tag ${tags[i].id} to workout ${workout.id}:`, error.message);
          }
        }
      }
      
      // Add category relationships (if categories exist)
      if (categories.length > 0) {
        // Assign 1-2 random categories to each workout
        const categoryCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < categoryCount && i < categories.length; i++) {
          try {
            await client.query(
              `INSERT INTO workout_muscle_group (workout_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [workout.id, categories[i].id]
            );
          } catch (error) {
            console.error(`Error adding category ${categories[i].id} to workout ${workout.id}:`, error.message);
          }
        }
      }
      
      // Add equipment relationships (if equipment exists)
      if (equipment.length > 0) {
        // Assign 1-3 random equipment to each workout
        const equipmentCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < equipmentCount && i < equipment.length; i++) {
          try {
            await client.query(
              `INSERT INTO workout_equipment (workout_id, equipment_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [workout.id, equipment[i].id]
            );
          } catch (error) {
            console.error(`Error adding equipment ${equipment[i].id} to workout ${workout.id}:`, error.message);
          }
        }
      }
    }
  }
}

async function createSampleTags(client) {
  const sampleTags = [
    { name: 'HIIT', description: 'High-Intensity Interval Training' },
    { name: 'Strength', description: 'Strength training workouts' },
    { name: 'Cardio', description: 'Cardiovascular workouts' },
    { name: 'Flexibility', description: 'Flexibility and mobility workouts' },
    { name: 'Endurance', description: 'Endurance building workouts' }
  ];
  
  for (const tag of sampleTags) {
    try {
      await client.query(
        `INSERT INTO workout_tags (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
        [tag.name, tag.description]
      );
    } catch (error) {
      console.error(`Error creating tag ${tag.name}:`, error.message);
    }
  }
  
  console.log('Sample tags created');
}

// Run the function
fixWorkoutJoinTables(); 