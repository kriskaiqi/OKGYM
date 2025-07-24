import { DataSource } from "typeorm";
import { config } from "../config";
import { UpdateWorkoutPlanPrimaryKey1709250000000 } from "../migrations/1709250000000-UpdateWorkoutPlanPrimaryKey";

async function runMigration() {
    const dataSource = new DataSource({
        type: "postgres",
        host: config.database.host,
        port: config.database.port,
        username: config.database.username,
        password: config.database.password,
        database: config.database.database,
        synchronize: false,
        logging: true,
        migrations: [UpdateWorkoutPlanPrimaryKey1709250000000],
    });

    try {
        await dataSource.initialize();
        console.log("Data Source has been initialized!");

        const migration = new UpdateWorkoutPlanPrimaryKey1709250000000();
        await migration.up(dataSource.createQueryRunner());
        console.log("Migration completed successfully!");

        await dataSource.destroy();
        console.log("Data Source has been destroyed!");
    } catch (error) {
        console.error("Error during migration:", error);
        await dataSource.destroy();
        process.exit(1);
    }
}

runMigration(); 