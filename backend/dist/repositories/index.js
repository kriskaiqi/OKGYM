"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositories = void 0;
__exportStar(require("./BaseRepository"), exports);
__exportStar(require("./GenericRepository"), exports);
__exportStar(require("./AIModelConfigurationRepository"), exports);
__exportStar(require("./AudioCueRepository"), exports);
__exportStar(require("./BodyMetricRepository"), exports);
__exportStar(require("./EquipmentRepository"), exports);
__exportStar(require("./ExerciseCategoryRepository"), exports);
__exportStar(require("./ExerciseFormAnalysisRepository"), exports);
__exportStar(require("./ExerciseRepository"), exports);
__exportStar(require("./ExerciseSpecificAnalysisRepository"), exports);
__exportStar(require("./FitnessGoalRepository"), exports);
__exportStar(require("./MediaRepository"), exports);
__exportStar(require("./ProgramEnrollmentRepository"), exports);
__exportStar(require("./ProgramWorkoutRepository"), exports);
__exportStar(require("./TrainingProgramRepository"), exports);
__exportStar(require("./UserActivityRepository"), exports);
__exportStar(require("./UserProgressRepository"), exports);
__exportStar(require("./UserRepository"), exports);
__exportStar(require("./UserScheduleRepository"), exports);
__exportStar(require("./VideoTutorialRepository"), exports);
__exportStar(require("./WorkoutExerciseRepository"), exports);
__exportStar(require("./WorkoutPlanRepository"), exports);
__exportStar(require("./WorkoutSessionRepository"), exports);
__exportStar(require("./WorkoutTagRepository"), exports);
__exportStar(require("./WorkoutRatingRepository"), exports);
__exportStar(require("./FeedbackRepository"), exports);
__exportStar(require("./NotificationRepository"), exports);
__exportStar(require("./AchievementRepository"), exports);
__exportStar(require("./MetricTrackingRepository"), exports);
__exportStar(require("./UserEquipmentRepository"), exports);
__exportStar(require("./ExerciseRelationRepository"), exports);
__exportStar(require("./ExerciseDetailsRepository"), exports);
__exportStar(require("./interfaces/BodyMetricFilters"), exports);
const AIModelConfigurationRepository_1 = require("./AIModelConfigurationRepository");
const AudioCueRepository_1 = require("./AudioCueRepository");
const BodyMetricRepository_1 = require("./BodyMetricRepository");
const EquipmentRepository_1 = require("./EquipmentRepository");
const ExerciseCategoryRepository_1 = require("./ExerciseCategoryRepository");
const ExerciseFormAnalysisRepository_1 = require("./ExerciseFormAnalysisRepository");
const ExerciseRepository_1 = require("./ExerciseRepository");
const ExerciseSpecificAnalysisRepository_1 = require("./ExerciseSpecificAnalysisRepository");
const FitnessGoalRepository_1 = require("./FitnessGoalRepository");
const MediaRepository_1 = require("./MediaRepository");
const ProgramEnrollmentRepository_1 = require("./ProgramEnrollmentRepository");
const ProgramWorkoutRepository_1 = require("./ProgramWorkoutRepository");
const TrainingProgramRepository_1 = require("./TrainingProgramRepository");
const UserActivityRepository_1 = require("./UserActivityRepository");
const UserProgressRepository_1 = require("./UserProgressRepository");
const UserRepository_1 = require("./UserRepository");
const UserScheduleRepository_1 = require("./UserScheduleRepository");
const VideoTutorialRepository_1 = require("./VideoTutorialRepository");
const WorkoutExerciseRepository_1 = require("./WorkoutExerciseRepository");
const WorkoutPlanRepository_1 = require("./WorkoutPlanRepository");
const WorkoutSessionRepository_1 = require("./WorkoutSessionRepository");
const WorkoutTagRepository_1 = require("./WorkoutTagRepository");
const WorkoutRatingRepository_1 = require("./WorkoutRatingRepository");
const FeedbackRepository_1 = require("./FeedbackRepository");
const NotificationRepository_1 = require("./NotificationRepository");
const AchievementRepository_1 = require("./AchievementRepository");
const MetricTrackingRepository_1 = require("./MetricTrackingRepository");
const UserEquipmentRepository_1 = require("./UserEquipmentRepository");
const ExerciseRelationRepository_1 = require("./ExerciseRelationRepository");
const ExerciseDetailsRepository_1 = require("./ExerciseDetailsRepository");
exports.repositories = {
    aiModelConfiguration: new AIModelConfigurationRepository_1.AIModelConfigurationRepository(),
    audioCue: new AudioCueRepository_1.AudioCueRepository(),
    bodyMetric: new BodyMetricRepository_1.BodyMetricRepository(),
    equipment: new EquipmentRepository_1.EquipmentRepository(),
    exerciseCategory: new ExerciseCategoryRepository_1.ExerciseCategoryRepository(),
    exerciseFormAnalysis: new ExerciseFormAnalysisRepository_1.ExerciseFormAnalysisRepository(),
    exercise: new ExerciseRepository_1.ExerciseRepository(),
    exerciseSpecificAnalysis: new ExerciseSpecificAnalysisRepository_1.ExerciseSpecificAnalysisRepository(),
    fitnessGoal: new FitnessGoalRepository_1.FitnessGoalRepository(),
    media: new MediaRepository_1.MediaRepository(),
    programEnrollment: new ProgramEnrollmentRepository_1.ProgramEnrollmentRepository(),
    programWorkout: new ProgramWorkoutRepository_1.ProgramWorkoutRepository(),
    trainingProgram: new TrainingProgramRepository_1.TrainingProgramRepository(),
    userActivity: new UserActivityRepository_1.UserActivityRepository(),
    userProgress: new UserProgressRepository_1.UserProgressRepository(),
    user: new UserRepository_1.UserRepository(),
    userSchedule: new UserScheduleRepository_1.UserScheduleRepository(),
    scheduleItem: new UserScheduleRepository_1.ScheduleItemRepository(),
    videoTutorial: new VideoTutorialRepository_1.VideoTutorialRepository(),
    workoutExercise: new WorkoutExerciseRepository_1.WorkoutExerciseRepository(),
    workoutPlan: new WorkoutPlanRepository_1.WorkoutPlanRepository(),
    workoutSession: new WorkoutSessionRepository_1.WorkoutSessionRepository(),
    workoutTag: new WorkoutTagRepository_1.WorkoutTagRepository(),
    workoutRating: new WorkoutRatingRepository_1.WorkoutRatingRepository(),
    feedback: new FeedbackRepository_1.FeedbackRepository(),
    notification: new NotificationRepository_1.NotificationRepository(),
    achievement: new AchievementRepository_1.AchievementRepository(),
    metricTracking: new MetricTrackingRepository_1.MetricTrackingRepository(),
    userEquipment: new UserEquipmentRepository_1.UserEquipmentRepository(),
    exerciseRelation: new ExerciseRelationRepository_1.ExerciseRelationRepository(),
    exerciseDetails: new ExerciseDetailsRepository_1.ExerciseDetailsRepository()
};
//# sourceMappingURL=index.js.map