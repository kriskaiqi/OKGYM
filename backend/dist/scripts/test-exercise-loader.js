"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Exercise_1 = require("../models/Exercise");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const Equipment_1 = require("../models/Equipment");
const Media_1 = require("../models/Media");
const RelationshipLoader_1 = require("../utils/RelationshipLoader");
const initRelationships_1 = require("../utils/initRelationships");
const EntityRelationships_1 = require("../utils/EntityRelationships");
async function testExerciseLoader() {
    const exerciseId = process.argv[2] || '1';
    console.log(`Testing relationship loader with exercise ID: ${exerciseId}`);
    console.log('Initializing database connection...');
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('Database connection established.');
        console.log('Database initialized:', data_source_1.AppDataSource.isInitialized);
        console.log('Database driver:', data_source_1.AppDataSource.driver.options.type);
        (0, initRelationships_1.initializeRelationships)();
        console.log('Relationship system initialized.');
        console.log('\nRelationship Configuration:');
        console.log('Exercise relationship config:', JSON.stringify(EntityRelationships_1.EntityRelationships.Exercise, null, 2));
        const exerciseRepo = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
        const categoryRepo = data_source_1.AppDataSource.getRepository(ExerciseCategory_1.ExerciseCategory);
        const equipmentRepo = data_source_1.AppDataSource.getRepository(Equipment_1.Equipment);
        const mediaRepo = data_source_1.AppDataSource.getRepository(Media_1.Media);
        console.log('\nRepositories initialized:');
        console.log('Exercise repo exists:', !!exerciseRepo);
        console.log('Category repo exists:', !!categoryRepo);
        console.log('Equipment repo exists:', !!equipmentRepo);
        console.log('Media repo exists:', !!mediaRepo);
        console.log(`\nFetching exercise with ID: ${exerciseId}`);
        try {
            const rawExercise = await data_source_1.AppDataSource.query(`SELECT * FROM exercises WHERE id = $1`, [exerciseId]);
            console.log('Raw query result:', rawExercise && rawExercise.length ? 'Found exercise' : 'No exercise found');
            const exercise = await exerciseRepo.findOne({ where: { id: exerciseId } });
            if (!exercise) {
                console.error(`Exercise with ID ${exerciseId} not found.`);
                console.log('\nAvailable exercises:');
                const someExercises = await exerciseRepo.find({ take: 5 });
                someExercises.forEach(e => console.log(`- ID: ${e.id}, Name: ${e.name}`));
                await data_source_1.AppDataSource.destroy();
                process.exit(1);
            }
            console.log(`Found exercise: ${exercise.name}`);
            console.log('\nLoading categories...');
            const categories = await RelationshipLoader_1.RelationshipLoader.loadRelationship('Exercise', 'categories', exerciseId, categoryRepo);
            console.log(`Loaded ${categories.length} categories.`);
            console.log('Loading equipment...');
            const equipment = await RelationshipLoader_1.RelationshipLoader.loadRelationship('Exercise', 'equipmentOptions', exerciseId, equipmentRepo);
            console.log(`Loaded ${equipment.length} equipment items.`);
            console.log('Loading media...');
            const media = await RelationshipLoader_1.RelationshipLoader.loadRelationship('Exercise', 'media', exerciseId, mediaRepo);
            console.log(`Loaded ${media.length} media items.`);
            console.log('\nTest Results:');
            console.log(`Exercise: ${exercise.name}`);
            console.log(`Categories: ${categories.length} items`);
            if (categories.length > 0) {
                console.log('Category names:');
                categories.forEach(c => console.log(`- ${c.name || c.id}`));
            }
            console.log(`Equipment: ${equipment.length} items`);
            if (equipment.length > 0) {
                console.log('Equipment names:');
                equipment.forEach(e => console.log(`- ${e.name || e.id}`));
            }
            console.log(`Media: ${media.length} items`);
            if (media.length > 0) {
                console.log('Media IDs:');
                media.forEach(m => console.log(`- ${m.id}`));
            }
            console.log('\nTest completed successfully.');
        }
        catch (findError) {
            console.error('Error fetching exercise:', findError);
            throw findError;
        }
    }
    catch (error) {
        console.error('Error during test:', error);
        console.error('Stack trace:', error.stack);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            console.log('Database connection closed.');
        }
    }
}
testExerciseLoader().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=test-exercise-loader.js.map