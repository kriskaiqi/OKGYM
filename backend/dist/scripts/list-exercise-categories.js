"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
async function listExerciseCategories() {
    try {
        logger_1.default.info("Initializing database connection");
        await data_source_1.AppDataSource.initialize();
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const exercises = await queryRunner.query(`
        SELECT 
          e.id as exercise_id,
          e.name as exercise_name,
          e.level as exercise_level,
          e."movementPattern" as movement_pattern,
          array_agg(ec.category_id) as category_ids,
          array_agg(c.name) as category_names
        FROM 
          exercises e
        LEFT JOIN 
          exercise_category ec ON e.id = ec.exercise_id
        LEFT JOIN 
          exercise_categories c ON ec.category_id = c.id
        GROUP BY 
          e.id, e.name, e.level, e."movementPattern"
        ORDER BY 
          e.name
      `);
            logger_1.default.info(`Found ${exercises.length} exercises with categories:`);
            exercises.forEach((ex) => {
                logger_1.default.info(`Exercise: ${ex.exercise_name} (${ex.exercise_id})`);
                logger_1.default.info(`  Level: ${ex.exercise_level}`);
                logger_1.default.info(`  Movement: ${ex.movement_pattern || 'Not specified'}`);
                if (ex.category_ids && ex.category_ids[0] !== null) {
                    logger_1.default.info(`  Categories:`);
                    ex.category_ids.forEach((catId, index) => {
                        logger_1.default.info(`    - ${ex.category_names[index]} (ID: ${catId})`);
                    });
                }
                else {
                    logger_1.default.info(`  Categories: None assigned`);
                }
                logger_1.default.info(``);
            });
        }
        catch (error) {
            logger_1.default.error("Error listing exercise categories:", error);
        }
        finally {
            await queryRunner.release();
        }
    }
    catch (error) {
        logger_1.default.error("Error in listExerciseCategories:", error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info("Database connection closed");
        }
    }
}
listExerciseCategories();
//# sourceMappingURL=list-exercise-categories.js.map