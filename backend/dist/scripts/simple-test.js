"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const EntityRelationships_1 = require("../utils/EntityRelationships");
const models_1 = require("../models");
async function simpleTest() {
    console.log('Starting simple entity metadata test...');
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('Database connection established.');
        console.log('\nChecking WorkoutPlan metadata:');
        const workoutPlanMetadata = data_source_1.AppDataSource.getMetadata(models_1.WorkoutPlan);
        console.log(`WorkoutPlan metadata exists: ${!!workoutPlanMetadata}`);
        if (workoutPlanMetadata) {
            console.log(`Table name: ${workoutPlanMetadata.tableName}`);
            console.log(`Columns: ${workoutPlanMetadata.columns.map(c => c.propertyName).join(', ')}`);
            console.log(`Primary columns: ${workoutPlanMetadata.primaryColumns.map(c => c.propertyName).join(', ')}`);
        }
        console.log('\nTrying to query WorkoutPlan:');
        try {
            const workoutPlans = await data_source_1.AppDataSource.getRepository(models_1.WorkoutPlan).find({
                take: 3
            });
            console.log(`Found ${workoutPlans.length} workout plans`);
            workoutPlans.forEach(wp => {
                console.log(`- ID: ${wp.id}, Name: ${wp.name}`);
            });
        }
        catch (queryError) {
            console.error('Error querying WorkoutPlan:', queryError);
        }
        console.log('\nRelationship configuration for Exercise.categories:');
        console.log(JSON.stringify(EntityRelationships_1.EntityRelationships.Exercise.categories, null, 2));
        console.log('\nTesting direct SQL for exercise categories...');
        const exercises = await data_source_1.AppDataSource.query('SELECT id, name FROM exercises LIMIT 1');
        if (!exercises || exercises.length === 0) {
            console.log('No exercises found in database.');
            return;
        }
        const exerciseId = exercises[0].id;
        console.log(`Testing with exercise ID: ${exerciseId}, Name: ${exercises[0].name}`);
        const joinConfig = EntityRelationships_1.EntityRelationships.Exercise.categories;
        const joinTableQuery = `
      SELECT * FROM ${joinConfig.joinTable}
      WHERE ${joinConfig.entityIdField} = $1
    `;
        const joinResults = await data_source_1.AppDataSource.query(joinTableQuery, [exerciseId]);
        console.log(`Found ${joinResults.length} join table entries.`);
        const categoryIds = joinResults.map(r => r[joinConfig.relationIdField]);
        console.log('Category IDs:', categoryIds);
        if (categoryIds.length > 0) {
            const categories = await data_source_1.AppDataSource.query(`SELECT id, name FROM exercise_categories WHERE id IN (${categoryIds.map((_, i) => `$${i + 1}`).join(',')})`, categoryIds);
            console.log(`\nFound ${categories.length} related categories:`);
            categories.forEach(c => console.log(`- ${c.name} (${c.id})`));
        }
        console.log('\nTest completed successfully.');
    }
    catch (error) {
        console.error('Error during test:', error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            console.log('Database connection closed.');
        }
    }
}
simpleTest().catch(console.error);
//# sourceMappingURL=simple-test.js.map