"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeRelationships = initializeRelationships;
const Exercise_1 = require("../models/Exercise");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const Equipment_1 = require("../models/Equipment");
const Media_1 = require("../models/Media");
const WorkoutTag_1 = require("../models/WorkoutTag");
const ExerciseRelation_1 = require("../models/ExerciseRelation");
const User_1 = require("../models/User");
const WorkoutSession_1 = require("../models/WorkoutSession");
const Achievement_1 = require("../models/Achievement");
const Notification_1 = require("../models/Notification");
const FitnessGoal_1 = require("../models/FitnessGoal");
const BodyMetric_1 = require("../models/BodyMetric");
const WorkoutExercise_1 = require("../models/WorkoutExercise");
const RelationshipGenerator_1 = require("./RelationshipGenerator");
const logger_1 = __importDefault(require("../utils/logger"));
function initializeRelationships() {
    try {
        const entityClasses = {
            Exercise: Exercise_1.Exercise,
            WorkoutPlan: WorkoutPlan_1.WorkoutPlan,
            ExerciseCategory: ExerciseCategory_1.ExerciseCategory,
            Equipment: Equipment_1.Equipment,
            Media: Media_1.Media,
            WorkoutTag: WorkoutTag_1.WorkoutTag,
            ExerciseRelation: ExerciseRelation_1.ExerciseRelation,
            User: User_1.User,
            WorkoutSession: WorkoutSession_1.WorkoutSession,
            Achievement: Achievement_1.Achievement,
            Notification: Notification_1.Notification,
            FitnessGoal: FitnessGoal_1.FitnessGoal,
            BodyMetric: BodyMetric_1.BodyMetric,
            WorkoutExercise: WorkoutExercise_1.WorkoutExercise
        };
        (0, RelationshipGenerator_1.applyRelationshipDecorators)(entityClasses);
        logger_1.default.info('Initialized relationship system successfully');
    }
    catch (error) {
        logger_1.default.error('Failed to initialize relationship system', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
    }
}
//# sourceMappingURL=initRelationships.js.map