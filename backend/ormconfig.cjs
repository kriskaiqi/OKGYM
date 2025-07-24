const { DataSource } = require("typeorm");
const path = require("path");
require("dotenv").config();

module.exports = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "okgym",
    synchronize: false,
    logging: true,
    entities: [path.join(__dirname, "src/models/*.{ts,js}")],
    migrations: [path.join(__dirname, "src/migrations/*.{ts,js}")],
    subscribers: [],
}); 