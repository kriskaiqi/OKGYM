import { DataSource } from "typeorm";
import { config } from "../config";

async function listDependencies() {
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
            // Get all foreign key constraints
            const foreignKeys = await queryRunner.query(`
                SELECT
                    tc.constraint_name,
                    tc.table_name,
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY'
                AND (tc.table_name = 'workout_plans' OR ccu.table_name = 'workout_plans')
            `);

            console.log("\nForeign Key Constraints:");
            console.log(JSON.stringify(foreignKeys, null, 2));

            // Get all indexes
            const indexes = await queryRunner.query(`
                SELECT
                    tablename,
                    indexname,
                    indexdef
                FROM pg_indexes
                WHERE tablename = 'workout_plans'
            `);

            console.log("\nIndexes:");
            console.log(JSON.stringify(indexes, null, 2));

            // Get all views that reference the table
            const views = await queryRunner.query(`
                SELECT
                    viewname,
                    definition
                FROM pg_views
                WHERE definition LIKE '%workout_plans%'
            `);

            console.log("\nViews:");
            console.log(JSON.stringify(views, null, 2));

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

listDependencies(); 