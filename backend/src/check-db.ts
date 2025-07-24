import "reflect-metadata";
import { DataSource } from "typeorm";

// Basic database connection test
async function testDbConnection() {
  console.log('Testing database connection...');
  
  const testConnection = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "okgym",
    synchronize: false,
    logging: true,
  });

  try {
    await testConnection.initialize();
    console.log('✅ Database connection successful!');
    await testConnection.destroy();
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
  }
}

// Run the test
testDbConnection(); 