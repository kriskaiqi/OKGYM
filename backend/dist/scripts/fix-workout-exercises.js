"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
async function fixWorkoutExercises() {
    const dataSource = new typeorm_1.DataSource({
        type: "postgres",
        host: config_1.config.database.host,
        port: config_1.config.database.port,
        username: config_1.config.database.username,
        password: config_1.config.database.password,
        database: config_1.config.database.database,
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
            const nullCheck = await queryRunner.query(`
                SELECT COUNT(*) as null_count 
                FROM workout_exercises 
                WHERE workout_plan_id IS NULL
            `);
            const nullCount = parseInt(nullCheck[0].null_count);
            console.log(`Found ${nullCount} exercises with NULL workout_plan_id`);
            if (nullCount > 0) {
                console.log("Handling NULL workout_plan_id values...");
                const defaultWorkout = await queryRunner.query(`
                    SELECT id FROM workout_plans 
                    WHERE name = 'Default Workout Plan for Orphaned Exercises'
                    LIMIT 1
                `);
                let defaultWorkoutId;
                if (defaultWorkout.length === 0) {
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
                }
                else {
                    defaultWorkoutId = defaultWorkout[0].id;
                }
                console.log(`Assigning orphaned exercises to workout plan ${defaultWorkoutId}...`);
                await queryRunner.query(`
                    UPDATE workout_exercises 
                    SET workout_plan_id = '${defaultWorkoutId}' 
                    WHERE workout_plan_id IS NULL
                `);
            }
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
            }
            else {
                console.log("NOT NULL constraint already exists or column structure is different.");
            }
            await queryRunner.commitTransaction();
            console.log("Successfully fixed workout_exercises table!");
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
        await dataSource.destroy();
        console.log("Data Source has been destroyed!");
    }
    catch (error) {
        console.error("Error during workout_exercises fix:", error);
        await dataSource.destroy();
        process.exit(1);
    }
}
fixWorkoutExercises();
//# sourceMappingURL=fix-workout-exercises.js.map