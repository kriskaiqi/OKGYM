"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
async function fixExercisesColumnMigration() {
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
            console.log("Creating default workout plan for orphaned exercises if needed...");
            const defaultWorkout = await queryRunner.query(`
                SELECT id FROM workout_plans 
                WHERE name = 'Default Workout Plan for Orphaned Exercises'
                LIMIT 1
            `);
            let defaultWorkoutId;
            if (defaultWorkout.length === 0) {
                const result = await queryRunner.query(`
                    INSERT INTO workout_plans (
                        id, name, description, difficulty, "estimatedDuration", "isCustom", 
                        "workoutCategory", "estimatedCaloriesBurn", "createdAt", "updatedAt"
                    ) 
                    VALUES (
                        gen_random_uuid(), 
                        'Default Workout Plan for Orphaned Exercises', 
                        'This workout plan contains exercises that were orphaned during a database migration', 
                        'BEGINNER', 30, true, 'OTHER', 100, NOW(), NOW()
                    )
                    RETURNING id
                `);
                defaultWorkoutId = result[0].id;
                console.log(`Created default workout plan with ID: ${defaultWorkoutId}`);
            }
            else {
                defaultWorkoutId = defaultWorkout[0].id;
                console.log(`Using existing default workout plan with ID: ${defaultWorkoutId}`);
            }
            const columnExists = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'workout_exercises' AND column_name = 'workout_plan_id'
            `);
            if (columnExists.length > 0) {
                console.log("workout_plan_id column exists, creating backup copy...");
                await queryRunner.query(`
                    ALTER TABLE workout_exercises 
                    ADD COLUMN workout_plan_id_temp uuid
                `);
                await queryRunner.query(`
                    UPDATE workout_exercises 
                    SET workout_plan_id_temp = workout_plan_id
                `);
                await queryRunner.query(`
                    UPDATE workout_exercises 
                    SET workout_plan_id_temp = '${defaultWorkoutId}'
                    WHERE workout_plan_id_temp IS NULL
                `);
                console.log("Dropping original workout_plan_id column...");
                await queryRunner.query(`
                    ALTER TABLE workout_exercises 
                    DROP COLUMN workout_plan_id
                `);
                console.log("Creating new workout_plan_id column with NOT NULL constraint...");
                await queryRunner.query(`
                    ALTER TABLE workout_exercises 
                    ADD COLUMN workout_plan_id uuid NOT NULL DEFAULT '${defaultWorkoutId}'
                `);
                await queryRunner.query(`
                    UPDATE workout_exercises 
                    SET workout_plan_id = workout_plan_id_temp
                `);
                console.log("Dropping temporary column...");
                await queryRunner.query(`
                    ALTER TABLE workout_exercises 
                    DROP COLUMN workout_plan_id_temp
                `);
                console.log("Removing default constraint...");
                await queryRunner.query(`
                    ALTER TABLE workout_exercises 
                    ALTER COLUMN workout_plan_id DROP DEFAULT
                `);
                console.log("Recreating foreign key constraint...");
                await queryRunner.query(`
                    ALTER TABLE workout_exercises 
                    ADD CONSTRAINT "FK_d7cfe2372e71da68eddcf4940ee" 
                    FOREIGN KEY ("workout_plan_id") 
                    REFERENCES "workout_plans"("id") 
                    ON DELETE CASCADE
                `);
                console.log("Recreating indexes...");
                await queryRunner.query(`
                    CREATE INDEX "idx_fk_workout_exercise_plan" ON "workout_exercises"("workout_plan_id")
                `);
            }
            else {
                console.log("workout_plan_id column doesn't exist, creating it with correct constraints...");
                await queryRunner.query(`
                    ALTER TABLE workout_exercises 
                    ADD COLUMN workout_plan_id uuid NOT NULL DEFAULT '${defaultWorkoutId}'
                `);
                await queryRunner.query(`
                    ALTER TABLE workout_exercises 
                    ADD CONSTRAINT "FK_d7cfe2372e71da68eddcf4940ee" 
                    FOREIGN KEY ("workout_plan_id") 
                    REFERENCES "workout_plans"("id") 
                    ON DELETE CASCADE
                `);
                await queryRunner.query(`
                    CREATE INDEX "idx_fk_workout_exercise_plan" ON "workout_exercises"("workout_plan_id")
                `);
                await queryRunner.query(`
                    ALTER TABLE workout_exercises 
                    ALTER COLUMN workout_plan_id DROP DEFAULT
                `);
            }
            await queryRunner.commitTransaction();
            console.log("Successfully fixed workout_exercises table migration!");
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error("Error details:", error);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
        await dataSource.destroy();
        console.log("Data Source has been destroyed!");
    }
    catch (error) {
        console.error("Error during migration fix:", error);
        await dataSource.destroy();
        process.exit(1);
    }
}
fixExercisesColumnMigration();
//# sourceMappingURL=fix-exercises-migration.js.map