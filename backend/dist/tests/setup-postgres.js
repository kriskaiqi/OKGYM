"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDataSource = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const typeorm_1 = require("typeorm");
const User_1 = require("../models/User");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const WorkoutExercise_1 = require("../models/WorkoutExercise");
const Exercise_1 = require("../models/Exercise");
const Equipment_1 = require("../models/Equipment");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const Media_1 = require("../models/Media");
const TrainingProgram_1 = require("../models/TrainingProgram");
const ProgramWorkout_1 = require("../models/ProgramWorkout");
const WorkoutTag_1 = require("../models/WorkoutTag");
const ProgramEnrollment_1 = require("../models/ProgramEnrollment");
const ExerciseDetails_1 = require("../models/ExerciseDetails");
const MetricTracking_1 = require("../models/MetricTracking");
const Feedback_1 = require("../models/Feedback");
const ExerciseRelation_1 = require("../models/ExerciseRelation");
const Enums_1 = require("../models/shared/Enums");
const WorkoutSession_1 = require("../models/WorkoutSession");
const Achievement_1 = require("../models/Achievement");
const FitnessGoal_1 = require("../models/FitnessGoal");
const BodyMetric_1 = require("../models/BodyMetric");
const Notification_1 = require("../models/Notification");
const WorkoutRating_1 = require("../models/WorkoutRating");
const ExerciseFormAnalysis_1 = require("../models/ExerciseFormAnalysis");
dotenv_1.default.config({ path: '.env.test' });
jest.setTimeout(30000);
exports.testDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_DATABASE || 'okgym_test',
    schema: process.env.DB_SCHEMA || 'public',
    entities: [
        User_1.User,
        WorkoutPlan_1.WorkoutPlan,
        WorkoutExercise_1.WorkoutExercise,
        Exercise_1.Exercise,
        Equipment_1.Equipment,
        ExerciseCategory_1.ExerciseCategory,
        Media_1.Media,
        TrainingProgram_1.TrainingProgram,
        ProgramWorkout_1.ProgramWorkout,
        WorkoutTag_1.WorkoutTag,
        ProgramEnrollment_1.ProgramEnrollment,
        ExerciseDetails_1.ExerciseDetails,
        MetricTracking_1.MetricTracking,
        Feedback_1.Feedback,
        ExerciseRelation_1.ExerciseRelation,
        WorkoutSession_1.WorkoutSession,
        Achievement_1.Achievement,
        Achievement_1.UserAchievement,
        FitnessGoal_1.FitnessGoal,
        BodyMetric_1.BodyMetric,
        Notification_1.Notification,
        WorkoutRating_1.WorkoutRating,
        ExerciseFormAnalysis_1.ExerciseFormAnalysis
    ],
    synchronize: true,
    dropSchema: true,
    logging: false
});
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn().mockImplementation((token, secret) => {
        if (token && token.startsWith('valid')) {
            return { userId: 'test-user-id', userRole: Enums_1.UserRole.USER };
        }
        else if (token && token.startsWith('admin')) {
            return { userId: 'admin-user-id', userRole: Enums_1.UserRole.ADMIN };
        }
        else {
            throw new Error('Invalid token');
        }
    }),
    sign: jest.fn().mockImplementation((payload, secret, options) => {
        if (payload.userRole === Enums_1.UserRole.ADMIN) {
            return 'admin-token';
        }
        else {
            return 'valid-token';
        }
    }),
}));
beforeAll(async () => {
    try {
        await exports.testDataSource.initialize();
        console.log('PostgreSQL connection initialized for tests');
    }
    catch (error) {
        console.error('Error during PostgreSQL DataSource initialization:', error);
        throw error;
    }
});
afterAll(async () => {
    if (exports.testDataSource.isInitialized) {
        await exports.testDataSource.destroy();
        console.log('PostgreSQL connection closed');
    }
});
const originalConsoleError = console.error;
console.error = (...args) => {
    var _a, _b;
    if (((_a = args[0]) === null || _a === void 0 ? void 0 : _a.includes('expected error message')) ||
        ((_b = args[0]) === null || _b === void 0 ? void 0 : _b.includes('another expected error'))) {
        return;
    }
    originalConsoleError(...args);
};
//# sourceMappingURL=setup-postgres.js.map