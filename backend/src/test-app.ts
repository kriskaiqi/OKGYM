import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./models/User";
import { WorkoutPlan } from "./models/WorkoutPlan";
import { WorkoutExercise } from "./models/WorkoutExercise";
import { Exercise } from "./models/Exercise";
import { ExerciseDetails } from "./models/ExerciseDetails";
import { ExerciseCategory } from "./models/ExerciseCategory";
import { Equipment } from "./models/Equipment";
import { Media } from "./models/Media";
import { VideoTutorial } from "./models/VideoTutorial";
import { ExerciseFormAnalysis, FormCorrectionPoint } from "./models/ExerciseFormAnalysis";
import { WorkoutSession } from "./models/WorkoutSession";
import { MetricTracking } from "./models/MetricTracking";
import { Feedback } from "./models/Feedback";
import { WorkoutRating } from "./models/WorkoutRating";
import { Achievement } from "./models/Achievement";
import { BodyMetric } from "./models/BodyMetric";
import { Notification } from "./models/Notification";
import { FitnessGoal } from "./models/FitnessGoal";
import { ProgramEnrollment } from "./models/ProgramEnrollment";
import { TrainingProgram } from "./models/TrainingProgram";

// Create a minimal data source with essential entities to test relationships
const minimalDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "okgym",
    synchronize: true,
    logging: true,
    entities: [
        User, 
        WorkoutPlan, 
        WorkoutExercise, 
        Exercise, 
        ExerciseDetails,
        ExerciseCategory,
        Equipment,
        Media,
        VideoTutorial,
        ExerciseFormAnalysis,
        FormCorrectionPoint,
        WorkoutSession,
        MetricTracking,
        Feedback,
        WorkoutRating,
        Achievement,
        BodyMetric,
        Notification,
        FitnessGoal,
        ProgramEnrollment,
        TrainingProgram
    ]
});

// Start the app
const startApp = async () => {
    try {
        // Initialize database connection
        await minimalDataSource.initialize();
        console.log('Database connection established');
        
        // Create a basic user
        const user = new User();
        user.email = "test@example.com";
        user.firstName = "Test";
        user.lastName = "User";
        
        // Log user object
        console.log('User object:', user);
        
        // Clean up
        await minimalDataSource.destroy();
        console.log('Connection closed');
    } catch (err) {
        console.error("Error:", err);
    }
};

// Run the app
startApp(); 