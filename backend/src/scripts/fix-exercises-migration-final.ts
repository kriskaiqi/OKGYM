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
            // Step 1: Create a default workout plan for any orphaned exercises
            console.log("Creating default workout plan for orphaned exercises if needed...");
            const defaultWorkout = await queryRunner.query(`
                SELECT id FROM workout_plans 
                WHERE name = 'Default Workout Plan for Orphaned Exercises'
                LIMIT 1
            `);
            
            let defaultWorkoutId;
            
            if (defaultWorkout.length === 0) {
                // Create default workout plan with integer id type and valid enum value
                const insertQuery = `
                    INSERT INTO workout_plans (
                        name, description, difficulty, "estimatedDuration", "isCustom", 
                        "workoutCategory", "estimatedCaloriesBurn", "createdAt", "updatedAt"
                    ) 
                    VALUES (
                        'Default Workout Plan for Orphaned Exercises', 
                        'This workout plan contains exercises that were orphaned during a database migration', 
                        'BEGINNER', 30, true, 'FULL_BODY', 100, NOW(), NOW()
                    )
                    RETURNING id
                `;
                
                const result = await queryRunner.query(insertQuery);
                defaultWorkoutId = result[0].id;
                console.log(`Created default workout plan with ID: ${defaultWorkoutId}`);
            } else {
                defaultWorkoutId = defaultWorkout[0].id;
                console.log(`Using existing default workout plan with ID: ${defaultWorkoutId}`);
            }

            // Step 2: Check if workout_plan_id column exists
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'workout_exercises' AND column_name = 'workout_plan_id'
            `);

            // Step 3: Check if there are NULL values
            if (columnExists.length > 0) {
                const nullValues = await queryRunner.query(`
                    SELECT COUNT(*) as null_count
                    FROM workout_exercises
                    WHERE workout_plan_id IS NULL
                `);
                
                const nullCount = parseInt(nullValues[0].null_count);
                console.log(`Found ${nullCount} rows with NULL workout_plan_id`);
                
                if (nullCount > 0) {
                    // Update NULL values with the default workout ID
                    console.log(`Updating NULL values with default workout ID ${defaultWorkoutId}...`);
                    await queryRunner.query(`
                        UPDATE workout_exercises
                        SET workout_plan_id = ${defaultWorkoutId}
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
                } else {
                    console.log("Column already has NOT NULL constraint");
                }
                
                // Check foreign key constraint
                const fkExists = await queryRunner.query(`
                    SELECT constraint_name
                    FROM information_schema.table_constraints
                    WHERE table_name = 'workout_exercises'
                    AND constraint_type = 'FOREIGN KEY'
                    AND constraint_name = 'FK_d7cfe2372e71da68eddcf4940ee'
                `);
                
                if (fkExists.length === 0) {
                    console.log("Foreign key constraint missing, recreating...");
                    // First check if there's any other FK on this column
                    const otherFk = await queryRunner.query(`
                        SELECT constraint_name
                        FROM information_schema.table_constraints tc
                        JOIN information_schema.key_column_usage kcu
                            ON tc.constraint_name = kcu.constraint_name
                        WHERE tc.table_name = 'workout_exercises'
                        AND tc.constraint_type = 'FOREIGN KEY'
                        AND kcu.column_name = 'workout_plan_id'
                    `);
                    
                    // Drop any existing FKs on this column
                    if (otherFk.length > 0) {
                        for (const fk of otherFk) {
                            console.log(`Dropping existing FK: ${fk.constraint_name}`);
                            await queryRunner.query(`
                                ALTER TABLE workout_exercises
                                DROP CONSTRAINT "${fk.constraint_name}"
                            `);
                        }
                    }
                    
                    // Add the proper FK with CASCADE
                    await queryRunner.query(`
                        ALTER TABLE workout_exercises
                        ADD CONSTRAINT "FK_d7cfe2372e71da68eddcf4940ee"
                        FOREIGN KEY ("workout_plan_id")
                        REFERENCES "workout_plans"("id")
                        ON DELETE CASCADE
                    `);
                    console.log("Added foreign key constraint with ON DELETE CASCADE");
                } else {
                    console.log("Foreign key constraint already exists");
                    
                    // Check if ON DELETE CASCADE is set
                    const fkDetails = await queryRunner.query(`
                        SELECT rc.delete_rule
                        FROM information_schema.referential_constraints rc
                        WHERE rc.constraint_name = 'FK_d7cfe2372e71da68eddcf4940ee'
                    `);
                    
                    if (fkDetails.length > 0 && fkDetails[0].delete_rule !== 'CASCADE') {
                        console.log(`Current delete rule: ${fkDetails[0].delete_rule}, updating to CASCADE...`);
                        // Drop and recreate the FK with CASCADE
                        await queryRunner.query(`
                            ALTER TABLE workout_exercises
                            DROP CONSTRAINT "FK_d7cfe2372e71da68eddcf4940ee"
                        `);
                        
                        await queryRunner.query(`
                            ALTER TABLE workout_exercises
                            ADD CONSTRAINT "FK_d7cfe2372e71da68eddcf4940ee"
                            FOREIGN KEY ("workout_plan_id")
                            REFERENCES "workout_plans"("id")
                            ON DELETE CASCADE
                        `);
                        console.log("Updated foreign key constraint to ON DELETE CASCADE");
                    } else {
                        console.log("Foreign key already has correct ON DELETE CASCADE rule");
                    }
                }
                
                // Check for index
                const indexExists = await queryRunner.query(`
                    SELECT indexname
                    FROM pg_indexes
                    WHERE tablename = 'workout_exercises'
                    AND indexname = 'idx_fk_workout_exercise_plan'
                `);
                
                if (indexExists.length === 0) {
                    console.log("Creating index on workout_plan_id...");
                    await queryRunner.query(`
                        CREATE INDEX "idx_fk_workout_exercise_plan" ON "workout_exercises"("workout_plan_id")
                    `);
                    console.log("Created index");
                } else {
                    console.log("Index already exists");
                }
            } else {
                console.log("workout_plan_id column doesn't exist, creating it with all constraints...");
                
                // Add the column with default value and NOT NULL
                await queryRunner.query(`
                    ALTER TABLE workout_exercises
                    ADD COLUMN workout_plan_id integer NOT NULL DEFAULT ${defaultWorkoutId}
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
                
                // Remove default constraint
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