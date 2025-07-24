"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Exercise_1 = require("../models/Exercise");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
async function checkExerciseCategoryTable() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
            console.log('Database connection established');
        }
        const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'exercise_category'
      );
    `;
        const tableExists = await data_source_1.AppDataSource.query(tableExistsQuery);
        console.log('Junction table exists:', tableExists[0].exists);
        if (tableExists[0].exists) {
            const tableStructureQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'exercise_category'
        ORDER BY ordinal_position;
      `;
            const tableStructure = await data_source_1.AppDataSource.query(tableStructureQuery);
            console.log('Junction table structure:');
            console.table(tableStructure);
            const countQuery = `
        SELECT COUNT(*) FROM exercise_category;
      `;
            const countResult = await data_source_1.AppDataSource.query(countQuery);
            console.log('Number of records in junction table:', countResult[0].count);
            const sampleQuery = `
        SELECT * FROM exercise_category LIMIT 5;
      `;
            const sampleRecords = await data_source_1.AppDataSource.query(sampleQuery);
            console.log('Sample records from junction table:');
            console.log(sampleRecords);
            const exerciseRepository = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
            const exerciseCount = await exerciseRepository.count();
            const exercisesWithCategoriesQuery = `
        SELECT COUNT(DISTINCT exercise_id) 
        FROM exercise_category;
      `;
            const exercisesWithCategories = await data_source_1.AppDataSource.query(exercisesWithCategoriesQuery);
            console.log('Total exercises:', exerciseCount);
            console.log('Exercises with categories:', exercisesWithCategories[0].count);
            const categoryRepository = data_source_1.AppDataSource.getRepository(ExerciseCategory_1.ExerciseCategory);
            const categoryCount = await categoryRepository.count();
            const categoriesWithExercisesQuery = `
        SELECT COUNT(DISTINCT category_id) 
        FROM exercise_category;
      `;
            const categoriesWithExercises = await data_source_1.AppDataSource.query(categoriesWithExercisesQuery);
            console.log('Total categories:', categoryCount);
            console.log('Categories with exercises:', categoriesWithExercises[0].count);
            const topCategoriesQuery = `
        SELECT ec.category_id, exc.name, COUNT(ec.exercise_id) as exercise_count
        FROM exercise_category ec
        JOIN exercise_categories exc ON ec.category_id = exc.id
        GROUP BY ec.category_id, exc.name
        ORDER BY exercise_count DESC
        LIMIT 5;
      `;
            const topCategories = await data_source_1.AppDataSource.query(topCategoriesQuery);
            console.log('Top 5 categories by exercise count:');
            console.table(topCategories);
        }
        console.log('Check completed successfully');
    }
    catch (error) {
        console.error('Error checking exercise_category table:', error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            console.log('Database connection closed');
        }
        process.exit(0);
    }
}
checkExerciseCategoryTable();
//# sourceMappingURL=check-exercise-category.js.map