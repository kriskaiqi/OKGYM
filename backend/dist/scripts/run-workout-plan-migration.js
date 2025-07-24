"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("../config");
const _1709250000000_UpdateWorkoutPlanPrimaryKey_1 = require("../migrations/1709250000000-UpdateWorkoutPlanPrimaryKey");
async function runMigration() {
    const dataSource = new typeorm_1.DataSource({
        type: "postgres",
        host: config_1.config.database.host,
        port: config_1.config.database.port,
        username: config_1.config.database.username,
        password: config_1.config.database.password,
        database: config_1.config.database.database,
        synchronize: false,
        logging: true,
        migrations: [_1709250000000_UpdateWorkoutPlanPrimaryKey_1.UpdateWorkoutPlanPrimaryKey1709250000000],
    });
    try {
        await dataSource.initialize();
        console.log("Data Source has been initialized!");
        const migration = new _1709250000000_UpdateWorkoutPlanPrimaryKey_1.UpdateWorkoutPlanPrimaryKey1709250000000();
        await migration.up(dataSource.createQueryRunner());
        console.log("Migration completed successfully!");
        await dataSource.destroy();
        console.log("Data Source has been destroyed!");
    }
    catch (error) {
        console.error("Error during migration:", error);
        await dataSource.destroy();
        process.exit(1);
    }
}
runMigration();
//# sourceMappingURL=run-workout-plan-migration.js.map