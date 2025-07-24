"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Exercise_1 = require("../models/Exercise");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const Equipment_1 = require("../models/Equipment");
const Media_1 = require("../models/Media");
const RelationshipLoader_1 = require("../utils/RelationshipLoader");
const initRelationships_1 = require("../utils/initRelationships");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const WorkoutTag_1 = require("../models/WorkoutTag");
async function verifyRelationships() {
    console.log('Initializing database connection...');
    await data_source_1.AppDataSource.initialize();
    try {
        console.log('Initializing relationship system...');
        (0, initRelationships_1.initializeRelationships)();
        const exerciseRepo = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
        const categoryRepo = data_source_1.AppDataSource.getRepository(ExerciseCategory_1.ExerciseCategory);
        const equipmentRepo = data_source_1.AppDataSource.getRepository(Equipment_1.Equipment);
        const mediaRepo = data_source_1.AppDataSource.getRepository(Media_1.Media);
        const workoutPlanRepo = data_source_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan);
        const tagRepo = data_source_1.AppDataSource.getRepository(WorkoutTag_1.WorkoutTag);
        console.log('\n=== EXERCISE RELATIONSHIP TEST ===');
        const exercises = await exerciseRepo.find({ take: 2 });
        if (exercises.length === 0) {
            console.log('No exercises found in database');
            return;
        }
        for (const exercise of exercises) {
            console.log(`\nTesting with exercise: ${exercise.id} - ${exercise.name}`);
            console.log('Loading relationships...');
            const categories = await RelationshipLoader_1.RelationshipLoader.loadRelationship('Exercise', 'categories', exercise.id, categoryRepo);
            const equipment = await RelationshipLoader_1.RelationshipLoader.loadRelationship('Exercise', 'equipmentOptions', exercise.id, equipmentRepo);
            const media = await RelationshipLoader_1.RelationshipLoader.loadRelationship('Exercise', 'media', exercise.id, mediaRepo);
            console.log('Results:');
            console.log(`- Categories: ${categories.length} items`);
            console.log(`- Equipment: ${equipment.length} items`);
            console.log(`- Media: ${media.length} items`);
            if (categories.length)
                console.log(`  First category: ${categories[0].name || categories[0].id}`);
            if (equipment.length)
                console.log(`  First equipment: ${equipment[0].name || equipment[0].id}`);
            if (media.length)
                console.log(`  First media: ${media[0].id}`);
        }
        console.log('\n=== BATCH LOADING TEST ===');
        const exerciseIds = exercises.map(e => e.id);
        console.log(`Testing batch loading for ${exerciseIds.length} exercises...`);
        const categoriesMap = await RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('Exercise', 'categories', exerciseIds, categoryRepo);
        console.log('Batch loading results:');
        for (const exercise of exercises) {
            const cats = categoriesMap.get(exercise.id) || [];
            console.log(`- Exercise ${exercise.name}: ${cats.length} categories`);
        }
        console.log('\n=== WORKOUT PLAN RELATIONSHIP TEST ===');
        const workoutPlans = await workoutPlanRepo.find({ take: 2 });
        if (workoutPlans.length === 0) {
            console.log('No workout plans found in database');
        }
        else {
            for (const plan of workoutPlans) {
                console.log(`\nTesting with workout plan: ${plan.id} - ${plan.name}`);
                console.log('Loading relationships...');
                const tags = await RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutPlan', 'tags', plan.id, tagRepo);
                const targetMuscleGroups = await RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutPlan', 'targetMuscleGroups', plan.id, categoryRepo);
                const equipmentNeeded = await RelationshipLoader_1.RelationshipLoader.loadRelationship('WorkoutPlan', 'equipmentNeeded', plan.id, equipmentRepo);
                console.log('Results:');
                console.log(`- Tags: ${tags.length} items`);
                console.log(`- Target Muscle Groups: ${targetMuscleGroups.length} items`);
                console.log(`- Equipment Needed: ${equipmentNeeded.length} items`);
                if (tags.length)
                    console.log(`  First tag: ${tags[0].name || tags[0].id}`);
                if (targetMuscleGroups.length)
                    console.log(`  First muscle group: ${targetMuscleGroups[0].name || targetMuscleGroups[0].id}`);
                if (equipmentNeeded.length)
                    console.log(`  First equipment: ${equipmentNeeded[0].name || equipmentNeeded[0].id}`);
            }
        }
        console.log('\nVerification completed successfully.');
    }
    catch (error) {
        console.error('Error during verification:', error);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
        console.log('Database connection closed.');
    }
}
verifyRelationships().catch(error => {
    console.error('Verification script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=verify-relationships.js.map