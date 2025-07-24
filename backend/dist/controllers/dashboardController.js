"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardData = exports.getWorkoutStats = exports.getNotifications = exports.getWeeklyActivity = exports.getBodyMetrics = exports.getFitnessGoals = exports.getAchievements = exports.getScheduledWorkouts = exports.getRecommendedWorkouts = exports.getRecentWorkouts = void 0;
const database_1 = require("../config/database");
const WorkoutSession_1 = require("../models/WorkoutSession");
const Achievement_1 = require("../models/Achievement");
const FitnessGoal_1 = require("../models/FitnessGoal");
const BodyMetric_1 = require("../models/BodyMetric");
const Notification_1 = require("../models/Notification");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const typeorm_1 = require("typeorm");
const Enums_1 = require("../models/shared/Enums");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const RelationshipLoader_1 = require("../utils/RelationshipLoader");
const WorkoutSessionService_1 = require("../services/WorkoutSessionService");
const sessionService = new WorkoutSessionService_1.WorkoutSessionService();
const getRecentWorkouts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const userId = req.user.id;
        const workouts = await database_1.AppDataSource
            .getRepository(WorkoutSession_1.WorkoutSession)
            .find({
            where: { user: { id: userId } },
            order: { startTime: 'DESC' },
            take: limit
        });
        if (workouts.length > 0) {
            const workoutIds = workouts.map(w => w.id);
            const [workoutPlansMap, summariesMap] = await Promise.all([
                RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('WorkoutSession', 'workoutPlan', workoutIds, database_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan)),
                RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('WorkoutSession', 'summary', workoutIds, database_1.AppDataSource.getRepository(WorkoutSession_1.WorkoutSummary))
            ]);
            workouts.forEach(workout => {
                var _a, _b;
                workout.workoutPlan = (_a = workoutPlansMap.get(workout.id)) === null || _a === void 0 ? void 0 : _a[0];
                workout.summary = (_b = summariesMap.get(workout.id)) === null || _b === void 0 ? void 0 : _b[0];
            });
        }
        res.json(workouts);
    }
    catch (error) {
        logger_1.default.error('Error fetching recent workouts:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching recent workouts', 500, error));
    }
};
exports.getRecentWorkouts = getRecentWorkouts;
const getRecommendedWorkouts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const userId = req.user.id;
        const workouts = await database_1.AppDataSource
            .getRepository(WorkoutSession_1.WorkoutSession)
            .find({
            where: {
                user: { id: userId },
                status: Enums_1.SessionStatus.COMPLETED
            },
            order: { startTime: 'DESC' },
            take: limit
        });
        if (workouts.length > 0) {
            const workoutIds = workouts.map(w => w.id);
            const [workoutPlansMap, summariesMap] = await Promise.all([
                RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('WorkoutSession', 'workoutPlan', workoutIds, database_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan)),
                RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('WorkoutSession', 'summary', workoutIds, database_1.AppDataSource.getRepository(WorkoutSession_1.WorkoutSummary))
            ]);
            workouts.forEach(workout => {
                var _a, _b;
                workout.workoutPlan = (_a = workoutPlansMap.get(workout.id)) === null || _a === void 0 ? void 0 : _a[0];
                workout.summary = (_b = summariesMap.get(workout.id)) === null || _b === void 0 ? void 0 : _b[0];
            });
        }
        res.json(workouts);
    }
    catch (error) {
        logger_1.default.error('Error fetching recommended workouts:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching recommended workouts', 500, error));
    }
};
exports.getRecommendedWorkouts = getRecommendedWorkouts;
const getScheduledWorkouts = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const userId = req.user.id;
        const workouts = await database_1.AppDataSource
            .getRepository(WorkoutSession_1.WorkoutSession)
            .find({
            where: {
                user: { id: userId },
                status: Enums_1.SessionStatus.PENDING,
                startTime: (0, typeorm_1.Between)(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
            },
            order: { startTime: 'ASC' },
            take: limit
        });
        if (workouts.length > 0) {
            const workoutIds = workouts.map(w => w.id);
            const [workoutPlansMap, summariesMap] = await Promise.all([
                RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('WorkoutSession', 'workoutPlan', workoutIds, database_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan)),
                RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('WorkoutSession', 'summary', workoutIds, database_1.AppDataSource.getRepository(WorkoutSession_1.WorkoutSummary))
            ]);
            workouts.forEach(workout => {
                var _a, _b;
                workout.workoutPlan = (_a = workoutPlansMap.get(workout.id)) === null || _a === void 0 ? void 0 : _a[0];
                workout.summary = (_b = summariesMap.get(workout.id)) === null || _b === void 0 ? void 0 : _b[0];
            });
        }
        res.json(workouts);
    }
    catch (error) {
        logger_1.default.error('Error fetching scheduled workouts:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching scheduled workouts', 500, error));
    }
};
exports.getScheduledWorkouts = getScheduledWorkouts;
const getAchievements = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 5;
        const achievements = await database_1.AppDataSource
            .getRepository(Achievement_1.Achievement)
            .find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            take: limit
        });
        res.json(achievements);
    }
    catch (error) {
        logger_1.default.error('Error fetching achievements:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching achievements', 500, error));
    }
};
exports.getAchievements = getAchievements;
const getFitnessGoals = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 3;
        const goals = await database_1.AppDataSource
            .getRepository(FitnessGoal_1.FitnessGoal)
            .find({
            where: { user: { id: userId } },
            order: { deadline: 'ASC' },
            take: limit
        });
        res.json(goals);
    }
    catch (error) {
        logger_1.default.error('Error fetching fitness goals:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching fitness goals', 500, error));
    }
};
exports.getFitnessGoals = getFitnessGoals;
const getBodyMetrics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 5;
        const metrics = await database_1.AppDataSource
            .getRepository(BodyMetric_1.BodyMetric)
            .find({
            where: { user: { id: userId } },
            order: { measurementDate: 'DESC' },
            take: limit
        });
        res.json(metrics);
    }
    catch (error) {
        logger_1.default.error('Error fetching body metrics:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching body metrics', 500, error));
    }
};
exports.getBodyMetrics = getBodyMetrics;
const getWeeklyActivity = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const workouts = await database_1.AppDataSource
            .getRepository(WorkoutSession_1.WorkoutSession)
            .find({
            where: {
                user: { id: userId },
                status: Enums_1.SessionStatus.COMPLETED,
                startTime: (0, typeorm_1.Between)(weekStart, new Date())
            }
        });
        const activity = Array(7).fill(0);
        workouts.forEach(workout => {
            if (workout.startTime) {
                const dayIndex = new Date(workout.startTime).getDay();
                activity[dayIndex]++;
            }
        });
        res.json(activity);
    }
    catch (error) {
        logger_1.default.error('Error fetching weekly activity:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching weekly activity', 500, error));
    }
};
exports.getWeeklyActivity = getWeeklyActivity;
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 5;
        const notifications = await database_1.AppDataSource
            .getRepository(Notification_1.Notification)
            .find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            take: limit
        });
        res.json(notifications);
    }
    catch (error) {
        logger_1.default.error('Error fetching notifications:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching notifications', 500, error));
    }
};
exports.getNotifications = getNotifications;
const getWorkoutStats = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const workouts = await database_1.AppDataSource
            .getRepository(WorkoutSession_1.WorkoutSession)
            .find({
            where: {
                user: { id: userId },
                status: Enums_1.SessionStatus.COMPLETED,
                startTime: (0, typeorm_1.Between)(startDate, new Date())
            },
            order: { startTime: 'ASC' }
        });
        if (workouts.length > 0) {
            const workoutIds = workouts.map(w => w.id);
            const summariesMap = await RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch('WorkoutSession', 'summary', workoutIds, database_1.AppDataSource.getRepository(WorkoutSession_1.WorkoutSummary));
            workouts.forEach(workout => {
                var _a;
                workout.summary = (_a = summariesMap.get(workout.id)) === null || _a === void 0 ? void 0 : _a[0];
            });
        }
        const stats = {
            totalWorkouts: workouts.length,
            totalDuration: workouts.reduce((sum, workout) => { var _a; return sum + (((_a = workout.summary) === null || _a === void 0 ? void 0 : _a.totalDuration) || 0); }, 0),
            averageDuration: workouts.length > 0
                ? workouts.reduce((sum, workout) => { var _a; return sum + (((_a = workout.summary) === null || _a === void 0 ? void 0 : _a.totalDuration) || 0); }, 0) / workouts.length
                : 0,
            totalCaloriesBurned: workouts.reduce((sum, workout) => { var _a; return sum + (((_a = workout.summary) === null || _a === void 0 ? void 0 : _a.caloriesBurned) || 0); }, 0),
            averageCaloriesBurned: workouts.length > 0
                ? workouts.reduce((sum, workout) => { var _a; return sum + (((_a = workout.summary) === null || _a === void 0 ? void 0 : _a.caloriesBurned) || 0); }, 0) / workouts.length
                : 0
        };
        res.json(stats);
    }
    catch (error) {
        logger_1.default.error('Error fetching workout stats:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching workout stats', 500, error));
    }
};
exports.getWorkoutStats = getWorkoutStats;
const getDashboardData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        logger_1.default.info(`Fetching dashboard data for user ${userId}`);
        const today = new Date();
        const dayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        logger_1.default.info(`Week start date: ${weekStart.toISOString()}`);
        const weeklySessionsResult = await sessionService.getUserSessions(userId, {
            status: Enums_1.SessionStatus.COMPLETED,
            startDateMin: weekStart,
            limit: undefined
        });
        const weeklyActivity = weeklySessionsResult[0];
        logger_1.default.info(`Found ${weeklyActivity.length} completed sessions for current week`);
        const recentSessionsResult = await sessionService.getUserSessions(userId, {
            status: Enums_1.SessionStatus.COMPLETED,
            limit: 5
        });
        const recentSessions = recentSessionsResult[0];
        const activity = Array(7).fill(0);
        weeklyActivity.forEach(workout => {
            if (workout.startTime) {
                const startTime = new Date(workout.startTime);
                const dayIndex = startTime.getDay();
                activity[dayIndex]++;
            }
        });
        const totalWorkouts = weeklyActivity.length;
        let totalDurationSeconds = 0;
        let totalCaloriesBurned = 0;
        weeklyActivity.forEach((workout) => {
            let duration = 0;
            if (typeof workout.totalDuration === 'number') {
                duration = workout.totalDuration;
            }
            else if (workout.summary && typeof workout.summary.totalDuration === 'number') {
                duration = workout.summary.totalDuration;
            }
            let calories = 0;
            if (typeof workout.caloriesBurned === 'number') {
                calories = workout.caloriesBurned;
            }
            else if (workout.summary && typeof workout.summary.caloriesBurned === 'number') {
                calories = workout.summary.caloriesBurned;
            }
            totalDurationSeconds += duration;
            totalCaloriesBurned += calories;
            logger_1.default.info(`Processing workout ${workout.id}: duration=${duration}s, calories=${calories}`);
        });
        const stats = {
            totalWorkouts,
            totalDuration: totalDurationSeconds,
            averageDuration: totalWorkouts > 0 ? Math.round(totalDurationSeconds / totalWorkouts) : 0,
            totalCaloriesBurned: Math.round(totalCaloriesBurned),
            averageCaloriesBurned: totalWorkouts > 0 ? Math.round(totalCaloriesBurned / totalWorkouts) : 0
        };
        logger_1.default.info(`Dashboard stats: ${JSON.stringify(stats)}`);
        const formattedSessions = recentSessions.map(session => {
            var _a, _b;
            return ({
                id: session.id,
                workoutPlan: session.workoutPlan,
                startTime: session.startTime,
                endTime: session.endTime,
                status: session.status,
                totalDuration: session.totalDuration || (((_a = session.summary) === null || _a === void 0 ? void 0 : _a.totalDuration) || 0),
                caloriesBurned: session.caloriesBurned || (((_b = session.summary) === null || _b === void 0 ? void 0 : _b.caloriesBurned) || 0)
            });
        });
        res.json({
            recentWorkouts: formattedSessions,
            recommendedWorkouts: [],
            achievements: [],
            goals: [],
            metrics: [],
            notifications: [],
            weeklyActivity: activity,
            stats
        });
    }
    catch (error) {
        logger_1.default.error('Error fetching dashboard data:', error);
        next(new errors_1.AppError(errors_1.ErrorType.SERVICE_ERROR, 'Error fetching dashboard data', 500, error));
    }
};
exports.getDashboardData = getDashboardData;
//# sourceMappingURL=dashboardController.js.map