import { DataSource } from "typeorm";
import { config } from "../config";

async function getEnumValues() {
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

        try {
            // Get enum values for workoutCategory
            const enumValues = await queryRunner.query(`
                SELECT e.enumlabel
                FROM pg_type t 
                JOIN pg_enum e ON t.oid = e.enumtypid  
                WHERE t.typname = 'workout_plans_workoutcategory_enum'
                ORDER BY e.enumsortorder
            `);
            
            console.log("Valid workout category enum values:");
            console.log(JSON.stringify(enumValues, null, 2));
            
            // Get sample values from existing records
            const sampleValues = await queryRunner.query(`
                SELECT DISTINCT "workoutCategory"
                FROM workout_plans
                LIMIT 10
            `);
            
            console.log("\nSample workout category values in the database:");
            console.log(JSON.stringify(sampleValues, null, 2));
            
            // Get column types for workout_exercises
            const columnTypes = await queryRunner.query(`
                SELECT column_name, data_type, is_nullable, udt_name
                FROM information_schema.columns
                WHERE table_name = 'workout_exercises'
                ORDER BY ordinal_position
            `);
            
            console.log("\nColumn types for workout_exercises table:");
            console.log(JSON.stringify(columnTypes, null, 2));
            
            // Get foreign key details for workout_exercises
            const foreignKeys = await queryRunner.query(`
                SELECT
                    tc.constraint_name,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM
                    information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage ccu
                    ON ccu.constraint_name = tc.constraint_name
                WHERE
                    tc.constraint_type = 'FOREIGN KEY'
                    AND tc.table_name = 'workout_exercises'
            `);
            
            console.log("\nForeign keys for workout_exercises table:");
            console.log(JSON.stringify(foreignKeys, null, 2));
        } finally {
            await queryRunner.release();
        }

        await dataSource.destroy();
        console.log("\nData Source has been destroyed!");
    } catch (error) {
        console.error("Error:", error);
        await dataSource.destroy();
        process.exit(1);
    }
}

getEnumValues(); 