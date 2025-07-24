import { DataSource } from "typeorm";
import { config } from "../config";

async function fixWorkoutExercises() {
    const dataSource = new DataSource({
        type: "postgres",
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        synchronize: false,
        logging: true,
    });

    try {
        await dataSource.initialize();
        console.log("Data Source has been initialized!");

        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check if there are NULL values in workout_plan_id
            const nullCheck = await queryRunner.query(`
                SELECT COUNT(*) as null_count 
                FROM workout_exercises 
                WHERE workout_plan_id IS NULL
            `);
            
            const nullCount = parseInt(nullCheck[0].null_count);
            console.log(`Found ${nullCount} exercises with NULL workout_plan_id`);

            if (nullCount > 0) {
                console.log("Handling NULL workout_plan_id values...");
                
                // Option 1: Create a default workout plan for orphaned exercises
                // First check if we have a default workout plan
                const defaultWorkout = await queryRunner.query(`
                    SELECT id FROM workout_plans 
                    WHERE name = 'Default Workout Plan for Orphaned Exercises'
                    LIMIT 1
                `);
                
                let defaultWorkoutId;
                
                if (defaultWorkout.length === 0) {
                    // Create a default workout plan
                    console.log("Creating default workout plan for orphaned exercises...");
                    const result = await queryRunner.query(`
                        INSERT INTO workout_plans (
                            name, description, difficulty, "estimatedDuration", "isCustom", 
                            "workoutCategory", "estimatedCaloriesBurn", created_at, updated_at
                        ) 
                        VALUES (
                            'Default Workout Plan for Orphaned Exercises', 
                            'This workout plan contains exercises that were orphaned during a database migration', 
                            'BEGINNER', 30, true, 'OTHER', 100, NOW(), NOW()
                        )
                        RETURNING id
                    `);
                    defaultWorkoutId = result[0].id;
                } else {
                    defaultWorkoutId = defaultWorkout[0].id;
                }
                
                // Update the NULL workout_plan_id values with the default workout plan id
                console.log(`Assigning orphaned exercises to workout plan ${defaultWorkoutId}...`);
                await queryRunner.query(`
                    UPDATE workout_exercises 
                    SET workout_plan_id = '${defaultWorkoutId}' 
                    WHERE workout_plan_id IS NULL
                `);
            }

            // Now we can safely apply the NOT NULL constraint if needed
            console.log("Checking if NOT NULL constraint is needed...");
            const columnInfo = await queryRunner.query(`
                SELECT is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'workout_exercises' AND column_name = 'workout_plan_id'
            `);
            
            if (columnInfo.length > 0 && columnInfo[0].is_nullable === 'YES') {
                console.log("Adding NOT NULL constraint to workout_plan_id...");
                await queryRunner.query(`
                    ALTER TABLE workout_exercises 
                    ALTER COLUMN workout_plan_id SET NOT NULL
                `);
            } else {
                console.log("NOT NULL constraint already exists or column structure is different.");
            }

            await queryRunner.commitTransaction();
            console.log("Successfully fixed workout_exercises table!");
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }

        await dataSource.destroy();
        console.log("Data Source has been destroyed!");
    } catch (error) {
        console.error("Error during workout_exercises fix:", error);
        await dataSource.destroy();
        process.exit(1);
    }
}

fixWorkoutExercises(); 