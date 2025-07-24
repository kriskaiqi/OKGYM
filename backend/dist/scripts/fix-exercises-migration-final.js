"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
async function fixExercisesColumnMigration() {
    var _a;
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
                const nullValues = await queryRunner.query(`
                    SELECT COUNT(*) as null_count
                    FROM workout_exercises
                    WHERE workout_plan_id IS NULL
                `);
                const nullCount = parseInt(nullValues[0].null_count);
                console.log(`Found ${nullCount} rows with NULL workout_plan_id`);
                if (nullCount > 0) {
                    console.log(`Updating NULL values with default workout ID ${defaultWorkoutId}...`);
                    await queryRunner.query(`
                        UPDATE workout_exercises
                        SET workout_plan_id = ${defaultWorkoutId}
                        WHERE workout_plan_id IS NULL
                    `);
                    console.log("Updated NULL values with default workout plan");
                }
                const columnNullable = await queryRunner.query(`
                    SELECT is_nullable
                    FROM information_schema.columns
                    WHERE table_name = 'workout_exercises' AND column_name = 'workout_plan_id'
                `);
                if (((_a = columnNullable[0]) === null || _a === void 0 ? void 0 : _a.is_nullable) === 'YES') {
                    console.log("Adding NOT NULL constraint to existing column...");
                    await queryRunner.query(`
                        ALTER TABLE workout_exercises
                        ALTER COLUMN workout_plan_id SET NOT NULL
                    `);
                    console.log("Added NOT NULL constraint");
                }
                else {
                    console.log("Column already has NOT NULL constraint");
                }
                const fkExists = await queryRunner.query(`
                    SELECT constraint_name
                    FROM information_schema.table_constraints
                    WHERE table_name = 'workout_exercises'
                    AND constraint_type = 'FOREIGN KEY'
                    AND constraint_name = 'FK_d7cfe2372e71da68eddcf4940ee'
                `);
                if (fkExists.length === 0) {
                    console.log("Foreign key constraint missing, recreating...");
                    const otherFk = await queryRunner.query(`
                        SELECT constraint_name
                        FROM information_schema.table_constraints tc
                        JOIN information_schema.key_column_usage kcu
                            ON tc.constraint_name = kcu.constraint_name
                        WHERE tc.table_name = 'workout_exercises'
                        AND tc.constraint_type = 'FOREIGN KEY'
                        AND kcu.column_name = 'workout_plan_id'
                    `);
                    if (otherFk.length > 0) {
                        for (const fk of otherFk) {
                            console.log(`Dropping existing FK: ${fk.constraint_name}`);
                            await queryRunner.query(`
                                ALTER TABLE workout_exercises
                                DROP CONSTRAINT "${fk.constraint_name}"
                            `);
                        }
                    }
                    await queryRunner.query(`
                        ALTER TABLE workout_exercises
                        ADD CONSTRAINT "FK_d7cfe2372e71da68eddcf4940ee"
                        FOREIGN KEY ("workout_plan_id")
                        REFERENCES "workout_plans"("id")
                        ON DELETE CASCADE
                    `);
                    console.log("Added foreign key constraint with ON DELETE CASCADE");
                }
                else {
                    console.log("Foreign key constraint already exists");
                    const fkDetails = await queryRunner.query(`
                        SELECT rc.delete_rule
                        FROM information_schema.referential_constraints rc
                        WHERE rc.constraint_name = 'FK_d7cfe2372e71da68eddcf4940ee'
                    `);
                    if (fkDetails.length > 0 && fkDetails[0].delete_rule !== 'CASCADE') {
                        console.log(`Current delete rule: ${fkDetails[0].delete_rule}, updating to CASCADE...`);
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
                    }
                    else {
                        console.log("Foreign key already has correct ON DELETE CASCADE rule");
                    }
                }
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
                }
                else {
                    console.log("Index already exists");
                }
            }
            else {
                console.log("workout_plan_id column doesn't exist, creating it with all constraints...");
                await queryRunner.query(`
                    ALTER TABLE workout_exercises
                    ADD COLUMN workout_plan_id integer NOT NULL DEFAULT ${defaultWorkoutId}
                `);
                console.log("Added workout_plan_id column with default value");
                await queryRunner.query(`
                    ALTER TABLE workout_exercises
                    ADD CONSTRAINT "FK_d7cfe2372e71da68eddcf4940ee"
                    FOREIGN KEY ("workout_plan_id")
                    REFERENCES "workout_plans"("id")
                    ON DELETE CASCADE
                `);
                console.log("Added foreign key constraint");
                await queryRunner.query(`
                    CREATE INDEX "idx_fk_workout_exercise_plan" ON "workout_exercises"("workout_plan_id")
                `);
                console.log("Created index");
                await queryRunner.query(`
                    ALTER TABLE workout_exercises
                    ALTER COLUMN workout_plan_id DROP DEFAULT
                `);
                console.log("Removed default constraint");
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
//# sourceMappingURL=fix-exercises-migration-final.js.map