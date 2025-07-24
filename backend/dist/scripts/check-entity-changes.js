"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
async function checkEntityChanges() {
    const dataSource = new typeorm_1.DataSource({
        type: "postgres",
        host: config_1.config.database.host,
        port: config_1.config.database.port,
        username: config_1.config.database.username,
        password: config_1.config.database.password,
        database: config_1.config.database.database,
        synchronize: false,
        logging: true,
        entities: ["src/models/**/*.ts"]
    });
    try {
        console.log("Initializing data source...");
        await dataSource.initialize();
        console.log("Data source initialized successfully!");
        console.log("\nChecking workout_plans table structure:");
        const workoutPlansStructure = await dataSource.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'workout_plans' AND column_name = 'id'
    `);
        console.log("workout_plans.id:", workoutPlansStructure);
        console.log("\nChecking workout_exercises table structure:");
        const workoutExercisesStructure = await dataSource.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'workout_exercises' AND column_name = 'workout_plan_id'
    `);
        console.log("workout_exercises.workout_plan_id:", workoutExercisesStructure);
        console.log("\nChecking foreign key constraints:");
        const foreignKeyConstraints = await dataSource.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'workout_exercises'
        AND kcu.column_name = 'workout_plan_id';
    `);
        console.log("Foreign key constraints:", foreignKeyConstraints);
        console.log("\nTesting TypeORM query with the updated entities:");
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        console.log("Running query to check if TypeORM can query the tables correctly...");
        const count = await queryRunner.query(`
      SELECT COUNT(*) FROM workout_exercises
    `);
        console.log("Number of workout exercises:", count);
        console.log("\nRunning query to test the relationship...");
        const joinQuery = await queryRunner.query(`
      SELECT 
        we.id as exercise_id, 
        we.workout_plan_id, 
        wp.id as workout_id, 
        wp.name as workout_name
      FROM workout_exercises we
      JOIN workout_plans wp ON we.workout_plan_id = wp.id
      LIMIT 3
    `);
        console.log("Join query results:", joinQuery);
        await queryRunner.release();
    }
    catch (error) {
        console.error("Error:", error);
    }
    finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
            console.log("Data source destroyed.");
        }
    }
}
checkEntityChanges()
    .then(() => console.log("Completed checking entity changes."))
    .catch(error => console.error("Failed:", error));
//# sourceMappingURL=check-entity-changes.js.map