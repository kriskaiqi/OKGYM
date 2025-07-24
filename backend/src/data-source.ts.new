import { DataSource } from "typeorm";
import { config } from "./config";

/**
 * TypeORM DataSource configuration with simplified entity loading
 */
export const AppDataSource = new DataSource({
    type: "postgres",
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    synchronize: true,
    logging: false, // Set to false to reduce console noise
    entities: [`${__dirname}/models/*.{ts,js}`],
    migrations: [`${__dirname}/migrations/*.{ts,js}`],
    subscribers: [`${__dirname}/subscribers/*.{ts,js}`],
}); 