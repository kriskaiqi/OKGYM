"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
async function testDbConnection() {
    console.log('Testing database connection...');
    const testConnection = new typeorm_1.DataSource({
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
    }
    catch (error) {
        console.error('❌ Database connection failed:');
        console.error(error);
    }
}
testDbConnection();
//# sourceMappingURL=check-db.js.map