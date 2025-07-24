import { DataSource } from "typeorm";
import { config } from "../config";

async function fixExercisesColumnMigration() {
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
            // Step 1: Get the column type of the workout_plans.id
            const idColumnType = await queryRunner.query(`
                SELECT data_type
                FROM information_schema.columns
                WHERE table_name = 'workout_plans' AND column_name = 'id'
            `);

            console.log("workout_plans.id column type:", idColumnType[0]?.data_type || "unknown");
            const isUuid = idColumnType[0]?.data_type === 'uuid';

            // Step 2: Create a default workout plan for any orphaned exercises
            console.log("Creating default workout plan for orphaned exercises if needed...");
            const defaultWorkout = await queryRunner.query(`
                SELECT id FROM workout_plans 
                WHERE name = 'Default Workout Plan for Orphaned Exercises'
                LIMIT 1
            `);
            
            let defaultWorkoutId;
            
            if (defaultWorkout.length === 0) {
                // Create default workout plan with correct id type
                let insertQuery;
                if (isUuid) {
                    insertQuery = `
                        INSERT INTO workout_plans (
                            name, description, difficulty, "estimatedDuration", "isCustom", 
                            "workoutCategory", "estimatedCaloriesBurn", "createdAt", "updatedAt"
                        ) 
                        VALUES (
                            'Default Workout Plan for Orphaned Exercises', 
                            'This workout plan contains exercises that were orphaned during a database migration', 
                            'BEGINNER', 30, true, 'OTHER', 100, NOW(), NOW()
                        )
                        RETURNING id
                    `;
                } else {
                    insertQuery = `
                        INSERT INTO workout_plans (
                            name, description, difficulty, "estimatedDuration", "isCustom", 
                            "workoutCategory", "estimatedCaloriesBurn", "createdAt", "updatedAt"
                        ) 
                        VALUES (
                            'Default Workout Plan for Orphaned Exercises', 
                            'This workout plan contains exercises that were orphaned during a database migration', 
                            'BEGINNER', 30, true, 'OTHER', 100, NOW(), NOW()
                        )
                        RETURNING id
                    `;
                }
                
                const result = await queryRunner.query(insertQuery);
                defaultWorkoutId = result[0].id;
                console.log(`Created default workout plan with ID: ${defaultWorkoutId}`);
            } else {
                defaultWorkoutId = defaultWorkout[0].id;
                console.log(`Using existing default workout plan with ID: ${defaultWorkoutId}`);
            }

            // Step 3: Determine column type for workout_exercises.workout_plan_id
            let workoutPlanIdType = 'uuid';
            
            if (!isUuid) {
                // If workout_plans.id is not uuid, then workout_plan_id should match
                workoutPlanIdType = idColumnType[0]?.data_type || 'integer';
            }
            
            console.log(`Using ${workoutPlanIdType} as the type for workout_plan_id column`);

            // Step 4: Check if workout_plan_id column exists
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'workout_exercises' AND column_name = 'workout_plan_id'
            `);

            if (columnExists.length > 0) {
                console.log("workout_plan_id column exists, creating backup copy...");
                
                // Check if we need to fix NULL values
                const nullValues = await queryRunner.query(`
                    SELECT COUNT(*) as null_count
                    FROM workout_exercises
                    WHERE workout_plan_id IS NULL
                `);
                
                const nullCount = parseInt(nullValues[0].null_count);
                
                if (nullCount > 0) {
                    console.log(`Found ${nullCount} rows with NULL workout_plan_id, fixing...`);
                    
                    // Update NULL values with default workout ID
                    await queryRunner.query(`
                        UPDATE workout_exercises
                        SET workout_plan_id = ${isUuid ? `'${defaultWorkoutId}'` : defaultWorkoutId}
                        WHERE workout_plan_id IS NULL
                    `);
                    
                    console.log("Updated NULL values with default workout plan");
                }
                
                // Now add the NOT NULL constraint if needed
                const columnNullable = await queryRunner.query(`
                    SELECT is_nullable
                    FROM information_schema.columns
                    WHERE table_name = 'workout_exercises' AND column_name = 'workout_plan_id'
                `);
                
                if (columnNullable[0]?.is_nullable === 'YES') {
                    console.log("Adding NOT NULL constraint to existing column...");
                    await queryRunner.query(`
                        ALTER TABLE workout_exercises
                        ALTER COLUMN workout_plan_id SET NOT NULL
                    `);
                    console.log("Added NOT NULL constraint");
                }
                
                // Check and recreate the foreign key constraint if needed
                const fkExists = await queryRunner.query(`
                    SELECT constraint_name
                    FROM information_schema.table_constraints
                    WHERE table_name = 'workout_exercises'
                    AND constraint_type = 'FOREIGN KEY'
                    AND constraint_name = 'FK_d7cfe2372e71da68eddcf4940ee'
                `);
                
                if (fkExists.length === 0) {
                    console.log("Recreating foreign key constraint...");
                    await queryRunner.query(`
                        ALTER TABLE workout_exercises
                        ADD CONSTRAINT "FK_d7cfe2372e71da68eddcf4940ee"
                        FOREIGN KEY ("workout_plan_id")
                        REFERENCES "workout_plans"("id")
                        ON DELETE CASCADE
                    `);
                    console.log("Recreated foreign key constraint");
                }
                
                // Check and recreate the index if needed
                const indexExists = await queryRunner.query(`
                    SELECT indexname
                    FROM pg_indexes
                    WHERE tablename = 'workout_exercises'
                    AND indexname = 'idx_fk_workout_exercise_plan'
                `);
                
                if (indexExists.length === 0) {
                    console.log("Recreating index...");
                    await queryRunner.query(`
                        CREATE INDEX "idx_fk_workout_exercise_plan" ON "workout_exercises"("workout_plan_id")
                    `);
                    console.log("Recreated index");
                }
            } else {
                console.log("workout_plan_id column doesn't exist, creating it with correct constraints...");
                
                // Create column with appropriate type and default
                await queryRunner.query(`
                    ALTER TABLE workout_exercises
                    ADD COLUMN workout_plan_id ${workoutPlanIdType} NOT NULL DEFAULT ${isUuid ? `'${defaultWorkoutId}'` : defaultWorkoutId}
                `);
                
                console.log("Added workout_plan_id column with default value");
                
                // Add foreign key constraint
                await queryRunner.query(`
                    ALTER TABLE workout_exercises
                    ADD CONSTRAINT "FK_d7cfe2372e71da68eddcf4940ee"
                    FOREIGN KEY ("workout_plan_id")
                    REFERENCES "workout_plans"("id")
                    ON DELETE CASCADE
                `);
                
                console.log("Added foreign key constraint");
                
                // Create index
                await queryRunner.query(`
                    CREATE INDEX "idx_fk_workout_exercise_plan" ON "workout_exercises"("workout_plan_id")
                `);
                
                console.log("Created index");
                
                // Remove default constraint now that data is populated
                await queryRunner.query(`
                    ALTER TABLE workout_exercises
                    ALTER COLUMN workout_plan_id DROP DEFAULT
                `);
                
                console.log("Removed default constraint");
            }

            await queryRunner.commitTransaction();
            console.log("Successfully fixed workout_exercises table migration!");
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error("Error details:", error);
            throw error;
        } finally {
            await queryRunner.release();
        }

        await dataSource.destroy();
        console.log("Data Source has been destroyed!");
    } catch (error) {
        console.error("Error during migration fix:", error);
        await dataSource.destroy();
        process.exit(1);
    }
}

fixExercisesColumnMigration(); 