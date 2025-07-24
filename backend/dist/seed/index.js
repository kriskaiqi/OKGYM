"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeeds = runSeeds;
const data_source_1 = require("../data-source");
const seedExerciseCategories_1 = require("./seedExerciseCategories");
const seedEquipment_1 = require("./seedEquipment");
const seedExercises_1 = require("./seedExercises");
const seedMedia_1 = require("./seedMedia");
const seedWorkoutTags_1 = require("./seedWorkoutTags");
const seedAchievements_1 = require("./seedAchievements");
const seedAudioCues_1 = require("./seedAudioCues");
const seedUsers_1 = require("./seedUsers");
const seedWorkoutPlans_1 = require("./seedWorkoutPlans");
const seedWorkouts_1 = require("./seedWorkouts");
const seedExerciseCategoryJunction_1 = require("./seedExerciseCategoryJunction");
const seedExerciseEquipment_1 = require("./seedExerciseEquipment");
const seedExerciseMedia_1 = require("./seedExerciseMedia");
const logger_1 = __importDefault(require("../utils/logger"));
async function runSeeds() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            logger_1.default.info('Database connection initialized for seeding');
        }
        logger_1.default.info('Phase 1: Seeding foundation tables (no dependencies)...');
        await (0, seedExerciseCategories_1.seedExerciseCategories)();
        await (0, seedWorkoutTags_1.seedWorkoutTags)();
        await (0, seedAudioCues_1.seedAudioCues)();
        logger_1.default.info('Phase 2: Seeding core reference data...');
        try {
            await (0, seedEquipment_1.seedEquipment)();
        }
        catch (equipError) {
            logger_1.default.error('Error seeding equipment (continuing):', {
                message: equipError instanceof Error ? equipError.message : 'Unknown error'
            });
        }
        logger_1.default.info('Phase 3: Seeding supporting entities...');
        try {
            await (0, seedAchievements_1.seedAchievements)();
        }
        catch (achieveError) {
            logger_1.default.error('Error seeding achievements (continuing):', {
                message: achieveError instanceof Error ? achieveError.message : 'Unknown error'
            });
        }
        try {
            await (0, seedMedia_1.seedMedia)();
        }
        catch (mediaError) {
            logger_1.default.error('Error seeding media (continuing):', {
                message: mediaError instanceof Error ? mediaError.message : 'Unknown error'
            });
        }
        try {
            await (0, seedExercises_1.seedExercises)();
        }
        catch (exerciseError) {
            logger_1.default.error('Error seeding exercises (continuing):', {
                message: exerciseError instanceof Error ? exerciseError.message : 'Unknown error'
            });
        }
        try {
            logger_1.default.info('Starting to seed exercise-category junction table...');
            await (0, seedExerciseCategoryJunction_1.seedExerciseCategoryJunction)();
        }
        catch (junctionError) {
            logger_1.default.error('Error seeding exercise-category junction table (continuing):', {
                message: junctionError instanceof Error ? junctionError.message : 'Unknown error'
            });
        }
        try {
            logger_1.default.info('Starting to seed exercise-equipment junction table...');
            await (0, seedExerciseEquipment_1.seedExerciseEquipment)();
        }
        catch (exerciseEquipError) {
            logger_1.default.error('Error seeding exercise-equipment junction table (continuing):', {
                message: exerciseEquipError instanceof Error ? exerciseEquipError.message : 'Unknown error'
            });
        }
        try {
            logger_1.default.info('Starting to seed exercise media...');
            await (0, seedExerciseMedia_1.seedExerciseMedia)();
        }
        catch (exerciseMediaError) {
            logger_1.default.error('Error seeding exercise media (continuing):', {
                message: exerciseMediaError instanceof Error ? exerciseMediaError.message : 'Unknown error'
            });
        }
        try {
            await (0, seedWorkoutPlans_1.seedWorkoutPlans)();
        }
        catch (workoutPlanError) {
            logger_1.default.error('Error seeding workout plans (continuing):', {
                message: workoutPlanError instanceof Error ? workoutPlanError.message : 'Unknown error'
            });
        }
        try {
            await (0, seedWorkouts_1.seedWorkouts)();
        }
        catch (workoutError) {
            logger_1.default.error('Error seeding legacy workout plans (continuing):', {
                message: workoutError instanceof Error ? workoutError.message : 'Unknown error'
            });
        }
        try {
            await (0, seedUsers_1.seedUsers)();
        }
        catch (userError) {
            logger_1.default.error('Error seeding users (continuing):', {
                message: userError instanceof Error ? userError.message : 'Unknown error'
            });
        }
        logger_1.default.info('All seeds completed successfully');
    }
    catch (error) {
        logger_1.default.error('Error running seeds:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            errorObj: error
        });
        throw error;
    }
    finally {
    }
}
//# sourceMappingURL=index.js.map