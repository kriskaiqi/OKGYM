"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedWorkoutTags = seedWorkoutTags;
const WorkoutTag_1 = require("../models/WorkoutTag");
const data_source_1 = require("../data-source");
const logger_1 = __importDefault(require("../utils/logger"));
const Enums_1 = require("../models/shared/Enums");
async function seedWorkoutTags() {
    try {
        const tagRepository = data_source_1.AppDataSource.getRepository(WorkoutTag_1.WorkoutTag);
        const existingCount = await tagRepository.count();
        if (existingCount > 0) {
            logger_1.default.info(`Database already has ${existingCount} workout tags. Skipping seed.`);
            return;
        }
        const workoutTagsData = [
            {
                name: 'Beginner',
                description: 'Suitable for individuals new to fitness training.',
                category: Enums_1.TagCategory.DIFFICULTY,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#4CAF50',
                icon: 'fitness_center',
                displayOrder: 1,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Novice', 'Entry Level'],
                    appliesTo: [Enums_1.WorkoutCategory.STRENGTH, Enums_1.WorkoutCategory.CARDIO, Enums_1.WorkoutCategory.FLEXIBILITY]
                }
            },
            {
                name: 'Intermediate',
                description: 'For those with some fitness experience looking to progress.',
                category: Enums_1.TagCategory.DIFFICULTY,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#FF9800',
                icon: 'fitness_center',
                displayOrder: 2,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Moderate', 'Mid-Level']
                }
            },
            {
                name: 'Advanced',
                description: 'Challenging workouts for experienced fitness enthusiasts.',
                category: Enums_1.TagCategory.DIFFICULTY,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#F44336',
                icon: 'fitness_center',
                displayOrder: 3,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Expert', 'High Level']
                }
            },
            {
                name: 'Strength',
                description: 'Focused on building muscular strength and power.',
                category: Enums_1.TagCategory.WORKOUT_TYPE,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#3F51B5',
                icon: 'fitness_center',
                displayOrder: 4,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Power', 'Resistance'],
                    appliesTo: [Enums_1.WorkoutCategory.STRENGTH],
                    relatedTags: [5, 11, 12, 13],
                    autoApplyCriteria: {
                        muscleGroups: ['CHEST', 'BACK', 'SHOULDERS', 'LEGS'],
                        difficulty: 'INTERMEDIATE'
                    }
                }
            },
            {
                name: 'Hypertrophy',
                description: 'Designed for muscle growth and size development.',
                category: Enums_1.TagCategory.WORKOUT_TYPE,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#673AB7',
                icon: 'fitness_center',
                displayOrder: 5,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Muscle Building', 'Growth'],
                    relatedTags: [4, 11, 12, 13]
                }
            },
            {
                name: 'Fat Loss',
                description: 'Aimed at reducing body fat and improving body composition.',
                category: Enums_1.TagCategory.GOAL,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#E91E63',
                icon: 'whatshot',
                displayOrder: 6,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Weight Loss', 'Cutting'],
                    relatedTags: [7, 8],
                    autoApplyCriteria: {
                        muscleGroups: ['FULL_BODY'],
                        duration: {
                            min: 20,
                            max: 60
                        }
                    }
                }
            },
            {
                name: 'Cardio',
                description: 'Emphasizes cardiovascular endurance and stamina.',
                category: Enums_1.TagCategory.WORKOUT_TYPE,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#00BCD4',
                icon: 'directions_run',
                displayOrder: 7,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Endurance', 'Aerobic'],
                    appliesTo: [Enums_1.WorkoutCategory.CARDIO, Enums_1.WorkoutCategory.ENDURANCE]
                }
            },
            {
                name: 'HIIT',
                description: 'High-Intensity Interval Training for efficient fat burning and fitness improvements.',
                category: Enums_1.TagCategory.WORKOUT_TYPE,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#FF5722',
                icon: 'flash_on',
                displayOrder: 8,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Interval Training', 'Tabata'],
                    appliesTo: [Enums_1.WorkoutCategory.HIIT, Enums_1.WorkoutCategory.CIRCUIT]
                }
            },
            {
                name: 'Mobility',
                description: 'Focuses on joint mobility and range of motion.',
                category: Enums_1.TagCategory.WORKOUT_TYPE,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#2196F3',
                icon: 'accessibility',
                displayOrder: 9,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Joint Health', 'Movement'],
                    appliesTo: [Enums_1.WorkoutCategory.FLEXIBILITY]
                }
            },
            {
                name: 'Recovery',
                description: 'Low-intensity sessions designed for active recovery and rejuvenation.',
                category: Enums_1.TagCategory.WORKOUT_TYPE,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#8BC34A',
                icon: 'spa',
                displayOrder: 10,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Rest Day', 'Regeneration'],
                    appliesTo: [Enums_1.WorkoutCategory.RECOVERY, Enums_1.WorkoutCategory.FLEXIBILITY]
                }
            },
            {
                name: 'Full Body',
                description: 'Targets all major muscle groups in a single session.',
                category: Enums_1.TagCategory.BODY_PART,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#9C27B0',
                icon: 'person',
                displayOrder: 11,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Total Body', 'Complete Workout'],
                    appliesTo: [Enums_1.WorkoutCategory.FULL_BODY]
                }
            },
            {
                name: 'Upper Body',
                description: 'Focuses on chest, back, shoulders, and arms.',
                category: Enums_1.TagCategory.BODY_PART,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#795548',
                icon: 'accessibility',
                displayOrder: 12,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Upper Split', 'Push Pull'],
                    appliesTo: [Enums_1.WorkoutCategory.UPPER_BODY, Enums_1.WorkoutCategory.PUSH, Enums_1.WorkoutCategory.PULL]
                }
            },
            {
                name: 'Lower Body',
                description: 'Targets legs, glutes, and lower body muscles.',
                category: Enums_1.TagCategory.BODY_PART,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#607D8B',
                icon: 'accessibility',
                displayOrder: 13,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Leg Day', 'Lower Split'],
                    appliesTo: [Enums_1.WorkoutCategory.LOWER_BODY, Enums_1.WorkoutCategory.LEGS]
                }
            },
            {
                name: 'Core',
                description: 'Emphasizes abdominal and core muscle development.',
                category: Enums_1.TagCategory.BODY_PART,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#FFC107',
                icon: 'accessibility',
                displayOrder: 14,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Abs', 'Midsection'],
                    appliesTo: [Enums_1.WorkoutCategory.CORE]
                }
            },
            {
                name: 'Circuit',
                description: 'Structured as a series of exercises performed with minimal rest.',
                category: Enums_1.TagCategory.WORKOUT_TYPE,
                scope: Enums_1.TagScope.SYSTEM,
                color: '#009688',
                icon: 'loop',
                displayOrder: 15,
                isActive: true,
                usageCount: 0,
                metadata: {
                    aliases: ['Round-Based', 'Station Training'],
                    appliesTo: [Enums_1.WorkoutCategory.CIRCUIT]
                }
            }
        ];
        for (const tagData of workoutTagsData) {
            const tag = new WorkoutTag_1.WorkoutTag();
            Object.assign(tag, tagData);
            await tagRepository.save(tag);
        }
        logger_1.default.info(`Successfully seeded ${workoutTagsData.length} workout tags`);
    }
    catch (error) {
        logger_1.default.error('Error seeding workout tags:', error);
        throw error;
    }
}
//# sourceMappingURL=seedWorkoutTags.js.map