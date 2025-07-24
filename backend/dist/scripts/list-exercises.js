"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Exercise_1 = require("../models/Exercise");
const logger_1 = __importDefault(require("../utils/logger"));
async function listExercises() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized');
        }
        const exerciseRepository = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
        const exercises = await exerciseRepository.find({
            order: { name: 'ASC' }
        });
        console.log(`Found ${exercises.length} exercises in the database:\n`);
        exercises.forEach((exercise, index) => {
            console.log(`${index + 1}. ${exercise.name} (ID: ${exercise.id})`);
            console.log(`   Level: ${exercise.level}`);
            console.log(`   Movement: ${exercise.movementPattern || 'Not specified'}`);
            console.log(`   Target Muscles: ${exercise.targetMuscleGroups || 'Not specified'}`);
            console.log(`   Synergist Muscles: ${exercise.synergistMuscleGroups || 'Not specified'}`);
            console.log('');
        });
    }
    catch (error) {
        logger_1.default.error('Error listing exercises:', error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed');
        }
        process.exit(0);
    }
}
listExercises();
//# sourceMappingURL=list-exercises.js.map