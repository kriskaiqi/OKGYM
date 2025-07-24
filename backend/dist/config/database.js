"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../models/User");
const WorkoutSession_1 = require("../models/WorkoutSession");
const Achievement_1 = require("../models/Achievement");
const FitnessGoal_1 = require("../models/FitnessGoal");
const BodyMetric_1 = require("../models/BodyMetric");
const Notification_1 = require("../models/Notification");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const WorkoutExercise_1 = require("../models/WorkoutExercise");
const Exercise_1 = require("../models/Exercise");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const Equipment_1 = require("../models/Equipment");
const WorkoutTag_1 = require("../models/WorkoutTag");
const Media_1 = require("../models/Media");
const MetricTracking_1 = require("../models/MetricTracking");
const Feedback_1 = require("../models/Feedback");
const WorkoutRating_1 = require("../models/WorkoutRating");
const ExerciseFormAnalysis_1 = require("../models/ExerciseFormAnalysis");
const TrainingProgram_1 = require("../models/TrainingProgram");
const ProgramWorkout_1 = require("../models/ProgramWorkout");
const ProgramEnrollment_1 = require("../models/ProgramEnrollment");
const ExerciseDetails_1 = require("../models/ExerciseDetails");
const VideoTutorial_1 = require("../models/VideoTutorial");
const UserProgress_1 = require("../models/UserProgress");
const UserActivity_1 = require("../models/UserActivity");
require("../models/index");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'okgym',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    entities: [
        User_1.User,
        WorkoutSession_1.WorkoutSession,
        WorkoutPlan_1.WorkoutPlan,
        WorkoutExercise_1.WorkoutExercise,
        Exercise_1.Exercise,
        ExerciseCategory_1.ExerciseCategory,
        Equipment_1.Equipment,
        WorkoutTag_1.WorkoutTag,
        Achievement_1.Achievement,
        FitnessGoal_1.FitnessGoal,
        BodyMetric_1.BodyMetric,
        Notification_1.Notification,
        Media_1.Media,
        MetricTracking_1.MetricTracking,
        Feedback_1.Feedback,
        WorkoutRating_1.WorkoutRating,
        ExerciseFormAnalysis_1.ExerciseFormAnalysis,
        TrainingProgram_1.TrainingProgram,
        ProgramWorkout_1.ProgramWorkout,
        ProgramEnrollment_1.ProgramEnrollment,
        ExerciseDetails_1.ExerciseDetails,
        VideoTutorial_1.VideoTutorial,
        UserProgress_1.UserProgress,
        UserActivity_1.UserActivity
    ],
    migrations: ['src/migrations/*.ts'],
    subscribers: ['src/subscribers/*.ts']
});
//# sourceMappingURL=database.js.map