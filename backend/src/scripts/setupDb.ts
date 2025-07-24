import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

async function setupDatabase() {
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: "postgres", // Connect to default postgres database
    synchronize: false,
    logging: true,
    entities: [],
    migrations: [],
    subscribers: [],
  });

  try {
    await dataSource.initialize();
    console.log('Connected to PostgreSQL');

    // Check if database exists
    const result = await dataSource.query(
      "SELECT 1 FROM pg_database WHERE datname = 'okgym'"
    );

    if (result.length === 0) {
      // Create database if it doesn't exist
      await dataSource.query('CREATE DATABASE okgym');
      console.log('Database "okgym" created successfully');
    } else {
      console.log('Database "okgym" already exists');
    }
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await dataSource.destroy();
  }
}

setupDatabase(); 