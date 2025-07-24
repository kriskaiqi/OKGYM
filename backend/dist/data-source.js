"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
exports.testDatabaseConnection = testDatabaseConnection;
const typeorm_1 = require("typeorm");
const User_1 = require("./models/User");
const WorkoutSession_1 = require("./models/WorkoutSession");
const MetricTracking_1 = require("./models/MetricTracking");
const Feedback_1 = require("./models/Feedback");
const WorkoutRating_1 = require("./models/WorkoutRating");
const ExerciseFormAnalysis_1 = require("./models/ExerciseFormAnalysis");
const Achievement_1 = require("./models/Achievement");
const ProgramEnrollment_1 = require("./models/ProgramEnrollment");
const WorkoutPlan_1 = require("./models/WorkoutPlan");
const TrainingProgram_1 = require("./models/TrainingProgram");
const Exercise_1 = require("./models/Exercise");
const ExerciseCategory_1 = require("./models/ExerciseCategory");
const BodyMetric_1 = require("./models/BodyMetric");
const Notification_1 = require("./models/Notification");
const FitnessGoal_1 = require("./models/FitnessGoal");
const Media_1 = require("./models/Media");
const VideoTutorial_1 = require("./models/VideoTutorial");
const Equipment_1 = require("./models/Equipment");
const WorkoutExercise_1 = require("./models/WorkoutExercise");
const ExerciseDetails_1 = require("./models/ExerciseDetails");
const WorkoutTag_1 = require("./models/WorkoutTag");
const ProgramWorkout_1 = require("./models/ProgramWorkout");
const UserProgress_1 = require("./models/UserProgress");
const UserActivity_1 = require("./models/UserActivity");
const AudioCue_1 = require("./models/AudioCue");
const logger_1 = __importDefault(require("./utils/logger"));
require("./models/index");
async function testDatabaseConnection() {
    try {
        logger_1.default.info('Testing database connection...');
        const testConnection = new typeorm_1.DataSource({
            type: "postgres",
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT || "5432"),
            username: process.env.DB_USERNAME || "postgres",
            password: process.env.DB_PASSWORD || "123456",
            database: process.env.DB_NAME || "okgym",
            synchronize: false,
            logging: true,
            entities: [
                User_1.User,
                WorkoutSession_1.WorkoutSession,
                WorkoutPlan_1.WorkoutPlan,
                Exercise_1.Exercise,
                Achievement_1.Achievement,
                BodyMetric_1.BodyMetric,
                Notification_1.Notification,
                FitnessGoal_1.FitnessGoal,
                WorkoutExercise_1.WorkoutExercise,
                MetricTracking_1.MetricTracking,
                Feedback_1.Feedback,
                WorkoutRating_1.WorkoutRating,
                ExerciseFormAnalysis_1.ExerciseFormAnalysis,
                ExerciseFormAnalysis_1.FormCorrectionPoint,
                ProgramEnrollment_1.ProgramEnrollment,
                TrainingProgram_1.TrainingProgram,
                ExerciseCategory_1.ExerciseCategory,
                Media_1.Media,
                VideoTutorial_1.VideoTutorial,
                Equipment_1.Equipment,
                ExerciseDetails_1.ExerciseDetails,
                WorkoutTag_1.WorkoutTag,
                ProgramWorkout_1.ProgramWorkout,
                UserProgress_1.UserProgress,
                UserActivity_1.UserActivity,
                AudioCue_1.AudioCue
            ],
        });
        await testConnection.initialize();
        logger_1.default.info('Database connection test successful');
        await testConnection.destroy();
        return true;
    }
    catch (error) {
        logger_1.default.error('Database connection test failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            details: JSON.stringify(error, null, 2)
        });
        return false;
    }
}
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "okgym",
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
    entities: [
        User_1.User,
        WorkoutSession_1.WorkoutSession,
        WorkoutPlan_1.WorkoutPlan,
        Exercise_1.Exercise,
        Achievement_1.Achievement,
        BodyMetric_1.BodyMetric,
        Notification_1.Notification,
        FitnessGoal_1.FitnessGoal,
        WorkoutExercise_1.WorkoutExercise,
        MetricTracking_1.MetricTracking,
        Feedback_1.Feedback,
        WorkoutRating_1.WorkoutRating,
        ExerciseFormAnalysis_1.ExerciseFormAnalysis,
        ExerciseFormAnalysis_1.FormCorrectionPoint,
        ProgramEnrollment_1.ProgramEnrollment,
        TrainingProgram_1.TrainingProgram,
        ExerciseCategory_1.ExerciseCategory,
        Media_1.Media,
        VideoTutorial_1.VideoTutorial,
        Equipment_1.Equipment,
        ExerciseDetails_1.ExerciseDetails,
        WorkoutTag_1.WorkoutTag,
        ProgramWorkout_1.ProgramWorkout,
        UserProgress_1.UserProgress,
        UserActivity_1.UserActivity,
        AudioCue_1.AudioCue
    ],
    subscribers: [],
    migrations: [],
});
//# sourceMappingURL=data-source.js.map