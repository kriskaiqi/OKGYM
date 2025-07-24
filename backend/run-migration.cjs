require('ts-node/register');
require('dotenv').config();
const { DataSource } = require('typeorm');
const path = require('path');

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "123456",
    database: "okgym",
    entities: [path.join(__dirname, "src/models/**/*.ts")],
    migrations: [
        path.join(__dirname, "src/migrations/1709800000001-UpdateWorkoutSessionFixed.ts"),
        path.join(__dirname, "src/migrations/1709900000000-UpdateExerciseEnums.ts"),
        path.join(__dirname, "src/migrations/1710169200000-CreateUsersTable.ts"),
        path.join(__dirname, "src/migrations/1710420000000-ConsolidateExerciseRelations.ts"),
        path.join(__dirname, "src/migrations/1710507600000-EntityOptimizationIndexes.ts"),
        path.join(__dirname, "src/migrations/1741914029558-ModelOptimizations202503140900.ts"),
        path.join(__dirname, "src/migrations/1741913899888-ModelOptimizations202503140858.ts"),
        path.join(__dirname, "src/migrations/1741914899888-AdditionalIndexOptimizations.ts")
    ],
});

AppDataSource.initialize()
    .then(async () => {
        console.log("Running pending migrations...");
        try {
            await AppDataSource.runMigrations();
            console.log("Migrations completed successfully");
        } catch (error) {
            console.error("Error during migration:", error);
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error initializing database:", error);
        process.exit(1);
    }); 