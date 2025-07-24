"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
async function fixColumnTypeMismatch() {
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
            const columnInfo = await queryRunner.query(`
                SELECT data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'workout_exercises' AND column_name = 'workout_plan_id'
            `);
            if (columnInfo.length > 0) {
                const dataType = columnInfo[0].data_type;
                const isNullable = columnInfo[0].is_nullable === 'YES';
                console.log(`Current workout_plan_id column type: ${dataType}, Nullable: ${isNullable}`);
                if (dataType !== 'uuid') {
                    console.log("Creating a default workout plan with UUID...");
                    const workoutPlanIdType = await queryRunner.query(`
                        SELECT data_type 
                        FROM information_schema.columns
                        WHERE table_name = 'workout_plans' AND column_name = 'id'
                    `);
                    if (workoutPlanIdType.length > 0 && workoutPlanIdType[0].data_type === 'uuid') {
                        const categoryValue = await queryRunner.query(`
                            SELECT "workoutCategory" FROM workout_plans LIMIT 1
                        `);
                        const workoutCategory = categoryValue.length > 0 ?
                            categoryValue[0].workoutCategory : 'FULL_BODY';
                        const defaultWorkout = await queryRunner.query(`
                            SELECT id FROM workout_plans 
                            WHERE name = 'Default UUID Workout Plan'
                            LIMIT 1
                        `);
                        let defaultUuidWorkoutId;
                        if (defaultWorkout.length === 0) {
                            const newWorkout = await queryRunner.query(`
                                INSERT INTO workout_plans (
                                    name, description, difficulty, "estimatedDuration", "isCustom", 
                                    "workoutCategory", "estimatedCaloriesBurn", "createdAt", "updatedAt"
                                ) 
                                VALUES (
                                    'Default UUID Workout Plan', 
                                    'This workout plan is used for type conversion', 
                                    'BEGINNER', 30, true, '${workoutCategory}', 100, NOW(), NOW()
                                )
                                RETURNING id
                            `);
                            defaultUuidWorkoutId = newWorkout[0].id;
                            console.log(`Created default workout plan with UUID: ${defaultUuidWorkoutId}`);
                        }
                        else {
                            defaultUuidWorkoutId = defaultWorkout[0].id;
                            console.log(`Using existing default workout plan with UUID: ${defaultUuidWorkoutId}`);
                        }
                        console.log("Creating a temporary UUID column...");
                        await queryRunner.query(`
                            ALTER TABLE workout_exercises
                            ADD COLUMN workout_plan_id_uuid uuid DEFAULT '${defaultUuidWorkoutId}'
                        `);
                        console.log("Mapping integer IDs to UUIDs for workout plans...");
                        const needsJoin = await queryRunner.query(`
                            SELECT EXISTS (
                                SELECT 1 
                                FROM workout_exercises 
                                WHERE workout_plan_id IS NOT NULL
                            ) as has_data
                        `);
                        if (needsJoin[0].has_data) {
                            await queryRunner.query(`
                                UPDATE workout_exercises we
                                SET workout_plan_id_uuid = wp.id
                                FROM workout_plans wp
                                WHERE we.workout_plan_id = wp.id::text::integer
                            `);
                        }
                        const nullCount = await queryRunner.query(`
                            SELECT COUNT(*) as count
                            FROM workout_exercises
                            WHERE workout_plan_id_uuid IS NULL
                        `);
                        console.log(`Found ${nullCount[0].count} exercises with NULL UUID references`);
                        if (parseInt(nullCount[0].count) > 0) {
                            await queryRunner.query(`
                                UPDATE workout_exercises
                                SET workout_plan_id_uuid = '${defaultUuidWorkoutId}'
                                WHERE workout_plan_id_uuid IS NULL
                            `);
                        }
                        const fkConstraints = await queryRunner.query(`
                            SELECT tc.constraint_name
                            FROM information_schema.table_constraints tc
                            JOIN information_schema.key_column_usage kcu
                                ON tc.constraint_name = kcu.constraint_name
                            WHERE tc.table_name = 'workout_exercises'
                                AND tc.constraint_type = 'FOREIGN KEY'
                                AND kcu.column_name = 'workout_plan_id'
                        `);
                        for (const fk of fkConstraints) {
                            console.log(`Dropping foreign key constraint: ${fk.constraint_name}`);
                            await queryRunner.query(`
                                ALTER TABLE workout_exercises
                                DROP CONSTRAINT "${fk.constraint_name}"
                            `);
                        }
                        const indexes = await queryRunner.query(`
                            SELECT indexname
                            FROM pg_indexes
                            WHERE tablename = 'workout_exercises'
                                AND indexdef LIKE '%workout_plan_id%'
                        `);
                        for (const idx of indexes) {
                            console.log(`Dropping index: ${idx.indexname}`);
                            await queryRunner.query(`
                                DROP INDEX "${idx.indexname}"
                            `);
                        }
                        console.log("Dropping the integer workout_plan_id column...");
                        await queryRunner.query(`
                            ALTER TABLE workout_exercises
                            DROP COLUMN workout_plan_id
                        `);
                        console.log("Renaming UUID column to workout_plan_id...");
                        await queryRunner.query(`
                            ALTER TABLE workout_exercises
                            RENAME COLUMN workout_plan_id_uuid TO workout_plan_id
                        `);
                        console.log("Setting NOT NULL constraint...");
                        await queryRunner.query(`
                            ALTER TABLE workout_exercises
                            ALTER COLUMN workout_plan_id SET NOT NULL
                        `);
                        console.log("Adding foreign key constraint...");
                        await queryRunner.query(`
                            ALTER TABLE workout_exercises
                            ADD CONSTRAINT "FK_d7cfe2372e71da68eddcf4940ee"
                            FOREIGN KEY ("workout_plan_id")
                            REFERENCES "workout_plans"("id")
                            ON DELETE CASCADE
                        `);
                        console.log("Creating index on workout_plan_id...");
                        await queryRunner.query(`
                            CREATE INDEX "idx_fk_workout_exercise_plan"
                            ON "workout_exercises"("workout_plan_id")
                        `);
                        console.log("Column type conversion completed successfully!");
                    }
                    else {
                        console.error("Workout plans id is not UUID type, cannot convert workout_exercises.workout_plan_id to UUID");
                    }
                }
                else {
                    console.log("The workout_plan_id column is already UUID type, no conversion needed.");
                }
            }
            else {
                console.log("workout_plan_id column does not exist in workout_exercises table.");
            }
            await queryRunner.commitTransaction();
            console.log("Transaction committed successfully!");
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
        console.error("Error during column type fix:", error);
        await dataSource.destroy();
        process.exit(1);
    }
}
fixColumnTypeMismatch();
//# sourceMappingURL=fix-column-type-mismatch.js.map