"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const dotenv_1 = require("dotenv");
const logger_1 = __importDefault(require("../utils/logger"));
(0, dotenv_1.config)({ path: path_1.default.resolve(__dirname, "../../.env") });
async function fixAchievementTable() {
    logger_1.default.info("Starting achievement table fix process...");
    const connection = await (0, typeorm_1.createConnection)({
        type: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "123456",
        database: process.env.DB_DATABASE || "okgym",
        entities: [path_1.default.join(__dirname, "../models/**/*.ts")],
        synchronize: false,
        logging: true
    });
    try {
        logger_1.default.info("Connected to database");
        const queryRunner = connection.createQueryRunner();
        const foreignKeyQuery = `
      SELECT 
        tc.constraint_name 
      FROM 
        information_schema.table_constraints AS tc 
      JOIN 
        information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE 
        tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'achievement' 
        AND kcu.column_name = 'workout_session_id'
    `;
        const foreignKeys = await queryRunner.query(foreignKeyQuery);
        if (foreignKeys && foreignKeys.length > 0) {
            for (const fk of foreignKeys) {
                logger_1.default.info(`Dropping foreign key constraint: ${fk.constraint_name}`);
                await queryRunner.query(`ALTER TABLE achievement DROP CONSTRAINT "${fk.constraint_name}"`);
            }
        }
        logger_1.default.info("Modifying workout_session_id column to be nullable");
        await queryRunner.query(`ALTER TABLE achievement ALTER COLUMN workout_session_id DROP NOT NULL`);
        logger_1.default.info("Adding foreign key constraint with ON DELETE SET NULL");
        await queryRunner.query(`
      ALTER TABLE achievement
      ADD CONSTRAINT fk_achievement_workout_session
      FOREIGN KEY (workout_session_id) 
      REFERENCES workout_session(id) 
      ON DELETE SET NULL
    `);
        logger_1.default.info("Updating existing rows with empty strings to NULL");
        await queryRunner.query(`
      UPDATE achievement 
      SET workout_session_id = NULL 
      WHERE workout_session_id = ''
    `);
        logger_1.default.info("Achievement table modification completed successfully");
    }
    catch (error) {
        logger_1.default.error("Error modifying achievement table:", error);
        throw error;
    }
    finally {
        await connection.close();
        logger_1.default.info("Database connection closed");
    }
}
fixAchievementTable()
    .then(() => {
    logger_1.default.info("Script executed successfully");
    process.exit(0);
})
    .catch((error) => {
    logger_1.default.error("Script execution failed:", error);
    process.exit(1);
});
//# sourceMappingURL=fixAchievementTable.js.map