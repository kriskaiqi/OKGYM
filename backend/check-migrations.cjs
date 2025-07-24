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
    migrations: [path.join(__dirname, "src/migrations/**/*.ts")],
});

AppDataSource.initialize()
    .then(async () => {
        const pendingMigrations = await AppDataSource.showMigrations();
        console.log("Pending migrations:", pendingMigrations);
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error checking migrations:", error);
        process.exit(1);
    }); 