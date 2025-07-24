import { AppDataSource } from "../data-source";
import { Exercise } from "../models/Exercise";

async function countExercises() {
    try {
        // Initialize the database connection
        await AppDataSource.initialize();
        console.log("Database connection initialized");

        // Get the repository
        const exerciseRepository = AppDataSource.getRepository(Exercise);

        // Count total exercises
        const count = await exerciseRepository.count();
        console.log(`Total number of exercises: ${count}`);

        // Get all exercise names
        const exercises = await exerciseRepository.find({
            select: ["name"]
        });

        // Check for duplicates
        const exerciseNames = exercises.map(e => e.name);
        const duplicates = exerciseNames.filter((name, index) => 
            exerciseNames.indexOf(name) !== index
        );

        if (duplicates.length > 0) {
            console.log("Found duplicate exercises:");
            duplicates.forEach(name => console.log(`- ${name}`));
        } else {
            console.log("No duplicate exercises found");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        // Close the database connection
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log("Database connection closed");
        }
    }
}

// Run the function
countExercises(); 