"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const User_1 = require("./models/User");
const WorkoutPlan_1 = require("./models/WorkoutPlan");
const WorkoutExercise_1 = require("./models/WorkoutExercise");
const Exercise_1 = require("./models/Exercise");
const ExerciseDetails_1 = require("./models/ExerciseDetails");
const ExerciseCategory_1 = require("./models/ExerciseCategory");
const Equipment_1 = require("./models/Equipment");
const Media_1 = require("./models/Media");
const VideoTutorial_1 = require("./models/VideoTutorial");
const ExerciseFormAnalysis_1 = require("./models/ExerciseFormAnalysis");
const WorkoutSession_1 = require("./models/WorkoutSession");
const MetricTracking_1 = require("./models/MetricTracking");
const Feedback_1 = require("./models/Feedback");
const WorkoutRating_1 = require("./models/WorkoutRating");
const Achievement_1 = require("./models/Achievement");
const BodyMetric_1 = require("./models/BodyMetric");
const Notification_1 = require("./models/Notification");
const FitnessGoal_1 = require("./models/FitnessGoal");
const ProgramEnrollment_1 = require("./models/ProgramEnrollment");
const TrainingProgram_1 = require("./models/TrainingProgram");
const minimalDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "okgym",
    synchronize: true,
    logging: true,
    entities: [
        User_1.User,
        WorkoutPlan_1.WorkoutPlan,
        WorkoutExercise_1.WorkoutExercise,
        Exercise_1.Exercise,
        ExerciseDetails_1.ExerciseDetails,
        ExerciseCategory_1.ExerciseCategory,
        Equipment_1.Equipment,
        Media_1.Media,
        VideoTutorial_1.VideoTutorial,
        ExerciseFormAnalysis_1.ExerciseFormAnalysis,
        ExerciseFormAnalysis_1.FormCorrectionPoint,
        WorkoutSession_1.WorkoutSession,
        MetricTracking_1.MetricTracking,
        Feedback_1.Feedback,
        WorkoutRating_1.WorkoutRating,
        Achievement_1.Achievement,
        BodyMetric_1.BodyMetric,
        Notification_1.Notification,
        FitnessGoal_1.FitnessGoal,
        ProgramEnrollment_1.ProgramEnrollment,
        TrainingProgram_1.TrainingProgram
    ]
});
const startApp = async () => {
    try {
        await minimalDataSource.initialize();
        console.log('Database connection established');
        const user = new User_1.User();
        user.email = "test@example.com";
        user.firstName = "Test";
        user.lastName = "User";
        console.log('User object:', user);
        await minimalDataSource.destroy();
        console.log('Connection closed');
    }
    catch (err) {
        console.error("Error:", err);
    }
};
startApp();
//# sourceMappingURL=test-app.js.map