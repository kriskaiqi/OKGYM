"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedExerciseEquipment = seedExerciseEquipment;
const Exercise_1 = require("../models/Exercise");
const Equipment_1 = require("../models/Equipment");
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
async function seedExerciseEquipment() {
    try {
        logger_1.default.info('Starting to seed exercise-equipment junction table...');
        const existingCount = await data_source_1.AppDataSource.query(`
      SELECT COUNT(*) FROM "exercise_equipment"
    `);
        if (parseInt(existingCount[0].count) > 0) {
            logger_1.default.info(`Found ${existingCount[0].count} existing entries in exercise_equipment junction table. Skipping seeding.`);
            return;
        }
        const exercisesFromRepo = await data_source_1.AppDataSource.getRepository(Exercise_1.Exercise).find({
            select: ['id', 'name', 'description', 'level', 'types', 'movementPattern']
        });
        const allEquipment = await data_source_1.AppDataSource.getRepository(Equipment_1.Equipment).find();
        logger_1.default.info(`Found ${exercisesFromRepo.length} exercises and ${allEquipment.length} equipment items to process.`);
        if (allEquipment.length === 0) {
            logger_1.default.warn('No equipment found. Make sure equipment is seeded first.');
            return;
        }
        const equipmentByName = new Map();
        allEquipment.forEach(equipment => {
            equipmentByName.set(equipment.name.toLowerCase(), equipment);
        });
        const junctionEntries = [];
        for (const exercise of exercisesFromRepo) {
            logger_1.default.info(`Processing equipment for exercise: ${exercise.name} (${exercise.id})`);
            try {
                const matchingEquipment = [];
                for (const equipment of allEquipment) {
                    if (exercise.name.toLowerCase().includes(equipment.name.toLowerCase())) {
                        matchingEquipment.push(equipment);
                        logger_1.default.info(`Matched ${exercise.name} with ${equipment.name} based on name inclusion`);
                    }
                }
                if (exercise.name.toLowerCase().includes('dumbbell')) {
                    const dumbbells = equipmentByName.get('dumbbells');
                    if (dumbbells && !matchingEquipment.includes(dumbbells)) {
                        matchingEquipment.push(dumbbells);
                        logger_1.default.info(`Matched ${exercise.name} with Dumbbells based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('barbell')) {
                    const barbell = equipmentByName.get('barbell');
                    if (barbell && !matchingEquipment.includes(barbell)) {
                        matchingEquipment.push(barbell);
                        logger_1.default.info(`Matched ${exercise.name} with Barbell based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('kettlebell')) {
                    const kettlebell = equipmentByName.get('kettlebell');
                    if (kettlebell && !matchingEquipment.includes(kettlebell)) {
                        matchingEquipment.push(kettlebell);
                        logger_1.default.info(`Matched ${exercise.name} with Kettlebell based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('rope') ||
                    exercise.name.toLowerCase().includes('jump rope')) {
                    const jumpRope = equipmentByName.get('jump rope');
                    if (jumpRope && !matchingEquipment.includes(jumpRope)) {
                        matchingEquipment.push(jumpRope);
                        logger_1.default.info(`Matched ${exercise.name} with Jump Rope based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('bench press') ||
                    exercise.name.toLowerCase().includes('incline') ||
                    exercise.name.toLowerCase().includes('decline') ||
                    exercise.name.toLowerCase().includes('bench fly')) {
                    const bench = equipmentByName.get('adjustable bench');
                    if (bench && !matchingEquipment.includes(bench)) {
                        matchingEquipment.push(bench);
                        logger_1.default.info(`Matched ${exercise.name} with Adjustable Bench based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('squat rack') ||
                    exercise.name.toLowerCase().includes('power rack') ||
                    exercise.name.toLowerCase().includes('squat') && exercise.name.toLowerCase().includes('barbell')) {
                    const rack = equipmentByName.get('squat rack');
                    if (rack && !matchingEquipment.includes(rack)) {
                        matchingEquipment.push(rack);
                        logger_1.default.info(`Matched ${exercise.name} with Squat Rack based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('resistance band')) {
                    const bands = equipmentByName.get('resistance bands');
                    if (bands && !matchingEquipment.includes(bands)) {
                        matchingEquipment.push(bands);
                        logger_1.default.info(`Matched ${exercise.name} with Resistance Bands based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('medicine ball')) {
                    const medBall = equipmentByName.get('medicine ball');
                    if (medBall && !matchingEquipment.includes(medBall)) {
                        matchingEquipment.push(medBall);
                        logger_1.default.info(`Matched ${exercise.name} with Medicine Ball based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('pull-up') ||
                    exercise.name.toLowerCase().includes('pullup') ||
                    exercise.name.toLowerCase().includes('chin-up') ||
                    exercise.name.toLowerCase().includes('chinup')) {
                    const pullUpBar = equipmentByName.get('pull-up bar');
                    if (pullUpBar && !matchingEquipment.includes(pullUpBar)) {
                        matchingEquipment.push(pullUpBar);
                        logger_1.default.info(`Matched ${exercise.name} with Pull-up Bar based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('row machine') ||
                    exercise.name.toLowerCase().includes('rowing machine')) {
                    const rowingMachine = equipmentByName.get('rowing machine');
                    if (rowingMachine && !matchingEquipment.includes(rowingMachine)) {
                        matchingEquipment.push(rowingMachine);
                        logger_1.default.info(`Matched ${exercise.name} with Rowing Machine based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('treadmill')) {
                    const treadmill = equipmentByName.get('treadmill');
                    if (treadmill && !matchingEquipment.includes(treadmill)) {
                        matchingEquipment.push(treadmill);
                        logger_1.default.info(`Matched ${exercise.name} with Treadmill based on name pattern`);
                    }
                }
                const isBodyweight = exercise.name.toLowerCase().includes('push-up') ||
                    exercise.name.toLowerCase().includes('pushup') ||
                    exercise.name.toLowerCase().includes('sit-up') ||
                    exercise.name.toLowerCase().includes('situp') ||
                    exercise.name.toLowerCase().includes('plank') ||
                    exercise.name.toLowerCase().includes('crunch') ||
                    exercise.name.toLowerCase().includes('lunge') ||
                    exercise.name.toLowerCase().includes('bodyweight squat') ||
                    exercise.name.toLowerCase().includes('burpee') ||
                    exercise.name.toLowerCase().includes('mountain climber') ||
                    exercise.name.toLowerCase().includes('jumping jack') ||
                    exercise.name.toLowerCase().includes('high knee');
                if (isBodyweight) {
                    const yogaMat = equipmentByName.get('yoga mat');
                    if (yogaMat && !matchingEquipment.includes(yogaMat)) {
                        matchingEquipment.push(yogaMat);
                        logger_1.default.info(`Matched bodyweight exercise ${exercise.name} with Yoga Mat`);
                    }
                }
                const isStretchOrYoga = exercise.name.toLowerCase().includes('stretch') ||
                    exercise.name.toLowerCase().includes('yoga') ||
                    exercise.name.toLowerCase().includes('pose') ||
                    exercise.name.toLowerCase().includes('mobility');
                if (isStretchOrYoga) {
                    const yogaMat = equipmentByName.get('yoga mat');
                    if (yogaMat && !matchingEquipment.includes(yogaMat)) {
                        matchingEquipment.push(yogaMat);
                        logger_1.default.info(`Matched stretch/yoga exercise ${exercise.name} with Yoga Mat`);
                    }
                }
                if (exercise.name.toLowerCase().includes('foam roll') ||
                    exercise.name.toLowerCase().includes('myofascial release')) {
                    const foamRoller = equipmentByName.get('foam roller');
                    if (foamRoller && !matchingEquipment.includes(foamRoller)) {
                        matchingEquipment.push(foamRoller);
                        logger_1.default.info(`Matched ${exercise.name} with Foam Roller based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('battle rope') ||
                    exercise.name.toLowerCase().includes('rope slams') ||
                    exercise.name.toLowerCase().includes('rope waves')) {
                    const battleRopes = equipmentByName.get('battle ropes');
                    if (battleRopes && !matchingEquipment.includes(battleRopes)) {
                        matchingEquipment.push(battleRopes);
                        logger_1.default.info(`Matched ${exercise.name} with Battle Ropes based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('stability ball') ||
                    exercise.name.toLowerCase().includes('exercise ball') ||
                    exercise.name.toLowerCase().includes('swiss ball')) {
                    const stabilityBall = equipmentByName.get('stability ball');
                    if (stabilityBall && !matchingEquipment.includes(stabilityBall)) {
                        matchingEquipment.push(stabilityBall);
                        logger_1.default.info(`Matched ${exercise.name} with Stability Ball based on name pattern`);
                    }
                }
                if (exercise.name.toLowerCase().includes('ab roller') ||
                    exercise.name.toLowerCase().includes('ab wheel')) {
                    const abRoller = equipmentByName.get('ab roller wheel');
                    if (abRoller && !matchingEquipment.includes(abRoller)) {
                        matchingEquipment.push(abRoller);
                        logger_1.default.info(`Matched ${exercise.name} with Ab Roller Wheel based on name pattern`);
                    }
                }
                logger_1.default.info(`Found ${matchingEquipment.length} matching equipment items for ${exercise.name}`);
                for (const equipment of matchingEquipment) {
                    junctionEntries.push({
                        exercise_id: exercise.id,
                        equipment_id: equipment.id
                    });
                }
            }
            catch (error) {
                logger_1.default.error(`Error processing equipment for exercise ${exercise.name}:`, error);
            }
        }
        if (junctionEntries.length > 0) {
            logger_1.default.info(`Inserting ${junctionEntries.length} entries into exercise_equipment junction table...`);
            const batchSize = 100;
            for (let i = 0; i < junctionEntries.length; i += batchSize) {
                const batch = junctionEntries.slice(i, i + batchSize);
                const values = batch.map(entry => `('${entry.exercise_id}', '${entry.equipment_id}')`).join(', ');
                await data_source_1.AppDataSource.query(`
          INSERT INTO "exercise_equipment" ("exercise_id", "equipment_id")
          VALUES ${values}
          ON CONFLICT ("exercise_id", "equipment_id") DO NOTHING
        `);
            }
            logger_1.default.info(`Successfully inserted ${junctionEntries.length} entries into exercise_equipment junction table`);
        }
        else {
            logger_1.default.warn('No matching equipment found for any exercises');
        }
    }
    catch (error) {
        logger_1.default.error('Error seeding exercise-equipment junction table:', error);
        throw error;
    }
}
//# sourceMappingURL=seedExerciseEquipment.js.map