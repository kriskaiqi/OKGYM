const { DataSource } = require("typeorm");
require("dotenv").config();

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "okgym",
    entities: ["src/models/**/*.ts"],
    migrations: ["src/migrations/**/*.ts"],
    synchronize: false, // Set to false for production
    logging: true,
});

module.exports = AppDataSource; 