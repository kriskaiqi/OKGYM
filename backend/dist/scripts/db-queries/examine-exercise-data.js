"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../../data-source");
const Exercise_1 = require("../../models/Exercise");
const logger_1 = __importDefault(require("../../utils/logger"));
async function examineExerciseData() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized');
        }
        const exercise = await data_source_1.AppDataSource.getRepository(Exercise_1.Exercise).findOne({
            where: {},
            select: ['id', 'name', 'form']
        });
        if (exercise) {
            logger_1.default.info(`Sample exercise: ${exercise.name} (${exercise.id})`);
            logger_1.default.info(`Form data structure:`);
            logger_1.default.info(JSON.stringify(exercise.form, null, 2));
            const exerciseData = await data_source_1.AppDataSource.query(`
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name = 'exercises' 
        AND column_name = 'equipment_names'
      `);
            logger_1.default.info(`Equipment names column exists: ${parseInt(exerciseData[0].count) > 0}`);
            const exercisesWithEquipment = await data_source_1.AppDataSource.query(`
        SELECT id, name, form->'equipment' as equipment
        FROM exercises
        WHERE form->'equipment' IS NOT NULL
        LIMIT 5
      `);
            logger_1.default.info(`Found ${exercisesWithEquipment.length} exercises with equipment in form data`);
            if (exercisesWithEquipment.length > 0) {
                exercisesWithEquipment.forEach((ex) => {
                    logger_1.default.info(`- ${ex.name}: ${ex.equipment}`);
                });
            }
            const totalExercises = await data_source_1.AppDataSource.getRepository(Exercise_1.Exercise).count();
            logger_1.default.info(`Total exercises in database: ${totalExercises}`);
        }
        else {
            logger_1.default.warn('No exercises found in the database');
        }
        await data_source_1.AppDataSource.destroy();
        logger_1.default.info('Database connection closed');
    }
    catch (error) {
        logger_1.default.error('Error examining exercise data:', error);
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
        }
        process.exit(1);
    }
}
examineExerciseData()
    .then(() => {
    logger_1.default.info('Exercise data examination completed successfully');
    process.exit(0);
})
    .catch(error => {
    logger_1.default.error('Failed to examine exercise data:', error);
    process.exit(1);
});
//# sourceMappingURL=examine-exercise-data.js.map