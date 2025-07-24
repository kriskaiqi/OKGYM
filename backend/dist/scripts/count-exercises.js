"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const Exercise_1 = require("../models/Exercise");
async function countExercises() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log("Database connection initialized");
        const exerciseRepository = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
        const count = await exerciseRepository.count();
        console.log(`Total number of exercises: ${count}`);
        const exercises = await exerciseRepository.find({
            select: ["name"]
        });
        const exerciseNames = exercises.map(e => e.name);
        const duplicates = exerciseNames.filter((name, index) => exerciseNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
            console.log("Found duplicate exercises:");
            duplicates.forEach(name => console.log(`- ${name}`));
        }
        else {
            console.log("No duplicate exercises found");
        }
    }
    catch (error) {
        console.error("Error:", error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            console.log("Database connection closed");
        }
    }
}
countExercises();
//# sourceMappingURL=count-exercises.js.map