"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const User_1 = require("../models/User");
const WorkoutPlan_1 = require("../models/WorkoutPlan");
const data_source_1 = require("../data-source");
const Enums_1 = require("../models/shared/Enums");
const BodyMetric_1 = require("../models/BodyMetric");
const FitnessGoal_1 = require("../models/FitnessGoal");
const FitnessGoal_2 = require("../models/FitnessGoal");
const logger_1 = __importDefault(require("../utils/logger"));
const bcryptjs_1 = require("bcryptjs");
async function seedUsers() {
    var _a, _b, _c, _d;
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const workoutRepository = data_source_1.AppDataSource.getRepository(WorkoutPlan_1.WorkoutPlan);
        const bodyMetricRepository = data_source_1.AppDataSource.getRepository(BodyMetric_1.BodyMetric);
        const fitnessGoalRepository = data_source_1.AppDataSource.getRepository(FitnessGoal_1.FitnessGoal);
        const existingCount = await userRepository.count();
        if (existingCount > 0) {
            logger_1.default.info(`Database already has ${existingCount} users. Skipping seed.`);
            return;
        }
        const allWorkouts = await workoutRepository.find();
        if (allWorkouts.length === 0) {
            logger_1.default.warn('No workouts found in the database. Users will be created without workout history.');
        }
        const hashPassword = async (password) => {
            return await (0, bcryptjs_1.hash)(password, 10);
        };
        const usersData = [
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@okgym.com',
                password: await hashPassword('Admin123!'),
                userRole: User_1.UserRole.ADMIN,
                isAdmin: true,
                isPremium: true,
                gender: Enums_1.Gender.FEMALE,
                birthYear: 1990,
                height: 172,
                mainGoal: Enums_1.FitnessGoal.GENERAL_FITNESS,
                activityLevel: Enums_1.ActivityLevel.MODERATELY_ACTIVE,
                fitnessLevel: Enums_1.Difficulty.INTERMEDIATE,
                preferences: {
                    dateOfBirth: '1990-05-15'
                },
                stats: {
                    weightUnit: Enums_1.MeasurementUnit.METRIC,
                    currentWeight: 65,
                    startingWeight: 65,
                    weightHistory: [
                        {
                            date: new Date(),
                            weight: 65
                        }
                    ]
                }
            },
            {
                firstName: 'Premium',
                lastName: 'User',
                email: 'premium@example.com',
                password: await hashPassword('Password123!'),
                userRole: User_1.UserRole.USER,
                isAdmin: false,
                isPremium: true,
                gender: Enums_1.Gender.MALE,
                birthYear: 1988,
                height: 180,
                mainGoal: Enums_1.FitnessGoal.STRENGTH_GAIN,
                activityLevel: Enums_1.ActivityLevel.VERY_ACTIVE,
                fitnessLevel: Enums_1.Difficulty.ADVANCED,
                preferences: {
                    dateOfBirth: '1988-08-12'
                },
                stats: {
                    weightUnit: Enums_1.MeasurementUnit.METRIC,
                    currentWeight: 78,
                    startingWeight: 75,
                    weightHistory: [
                        {
                            date: new Date(),
                            weight: 78
                        }
                    ]
                }
            },
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: await hashPassword('Password123!'),
                userRole: User_1.UserRole.USER,
                isAdmin: false,
                isPremium: false,
                gender: Enums_1.Gender.MALE,
                birthYear: 1992,
                height: 175,
                mainGoal: Enums_1.FitnessGoal.HYPERTROPHY,
                activityLevel: Enums_1.ActivityLevel.MODERATELY_ACTIVE,
                fitnessLevel: Enums_1.Difficulty.INTERMEDIATE,
                preferences: {
                    dateOfBirth: '1992-03-25'
                },
                stats: {
                    weightUnit: Enums_1.MeasurementUnit.METRIC,
                    currentWeight: 70,
                    startingWeight: 72,
                    weightHistory: [
                        {
                            date: new Date(),
                            weight: 70
                        }
                    ]
                }
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                password: await hashPassword('Password123!'),
                userRole: User_1.UserRole.USER,
                isAdmin: false,
                isPremium: false,
                gender: Enums_1.Gender.FEMALE,
                birthYear: 1995,
                height: 165,
                mainGoal: Enums_1.FitnessGoal.FAT_LOSS,
                activityLevel: Enums_1.ActivityLevel.LIGHTLY_ACTIVE,
                fitnessLevel: Enums_1.Difficulty.BEGINNER,
                preferences: {
                    dateOfBirth: '1995-11-18'
                },
                stats: {
                    weightUnit: Enums_1.MeasurementUnit.METRIC,
                    currentWeight: 62,
                    startingWeight: 68,
                    weightHistory: [
                        {
                            date: new Date(),
                            weight: 62
                        }
                    ]
                }
            },
            {
                firstName: 'Alex',
                lastName: 'Johnson',
                email: 'alex@example.com',
                password: await hashPassword('Password123!'),
                userRole: User_1.UserRole.USER,
                isAdmin: false,
                isPremium: false,
                gender: Enums_1.Gender.OTHER,
                birthYear: 1997,
                height: 170,
                mainGoal: Enums_1.FitnessGoal.ENDURANCE,
                activityLevel: Enums_1.ActivityLevel.MODERATELY_ACTIVE,
                fitnessLevel: Enums_1.Difficulty.INTERMEDIATE,
                preferences: {
                    dateOfBirth: '1997-06-30'
                },
                stats: {
                    weightUnit: Enums_1.MeasurementUnit.METRIC,
                    currentWeight: 68,
                    startingWeight: 68,
                    weightHistory: [
                        {
                            date: new Date(),
                            weight: 68
                        }
                    ]
                }
            }
        ];
        for (const userData of usersData) {
            const user = new User_1.User();
            Object.assign(user, userData);
            const savedUser = await userRepository.save(user);
            logger_1.default.info(`Created user: ${savedUser.firstName} ${savedUser.lastName} (${savedUser.email})`);
            if ((_a = userData.stats) === null || _a === void 0 ? void 0 : _a.currentWeight) {
                const bodyMetric = new BodyMetric_1.BodyMetric();
                bodyMetric.user = savedUser;
                bodyMetric.bodyArea = Enums_1.BodyArea.FULL_BODY;
                bodyMetric.valueType = Enums_1.MetricValueType.WEIGHT;
                bodyMetric.value = userData.stats.currentWeight;
                bodyMetric.unit = Enums_1.MeasurementUnit.KILOGRAM;
                bodyMetric.measurementDate = new Date();
                bodyMetric.metadata = {
                    notes: 'Initial weight record'
                };
                bodyMetric.targetValue = userData.stats.currentWeight;
                if (userData.mainGoal === Enums_1.FitnessGoal.FAT_LOSS || userData.mainGoal === Enums_1.FitnessGoal.WEIGHT_LOSS) {
                    bodyMetric.desiredTrend = Enums_1.TrendDirection.DECREASING;
                }
                else if (userData.mainGoal === Enums_1.FitnessGoal.MUSCLE_BUILDING || userData.mainGoal === Enums_1.FitnessGoal.HYPERTROPHY || userData.mainGoal === Enums_1.FitnessGoal.STRENGTH_GAIN) {
                    bodyMetric.desiredTrend = Enums_1.TrendDirection.INCREASING;
                }
                else {
                    bodyMetric.desiredTrend = Enums_1.TrendDirection.STABLE;
                }
                bodyMetric.source = 'manual';
                await bodyMetricRepository.save(bodyMetric);
            }
            const fitnessGoal = new FitnessGoal_1.FitnessGoal();
            fitnessGoal.user = savedUser;
            fitnessGoal.title = `${userData.mainGoal} Goal`;
            if (userData.mainGoal === Enums_1.FitnessGoal.FAT_LOSS || userData.mainGoal === Enums_1.FitnessGoal.WEIGHT_LOSS) {
                fitnessGoal.type = FitnessGoal_2.GoalType.WEIGHT_LOSS;
                fitnessGoal.target = ((_b = userData.stats) === null || _b === void 0 ? void 0 : _b.currentWeight) ? userData.stats.currentWeight - 5 : 0;
            }
            else if (userData.mainGoal === Enums_1.FitnessGoal.MUSCLE_BUILDING || userData.mainGoal === Enums_1.FitnessGoal.HYPERTROPHY) {
                fitnessGoal.type = FitnessGoal_2.GoalType.MUSCLE_GAIN;
                fitnessGoal.target = ((_c = userData.stats) === null || _c === void 0 ? void 0 : _c.currentWeight) ? userData.stats.currentWeight + 5 : 0;
            }
            else if (userData.mainGoal === Enums_1.FitnessGoal.STRENGTH_GAIN) {
                fitnessGoal.type = FitnessGoal_2.GoalType.STRENGTH;
                fitnessGoal.target = 0;
            }
            else if (userData.mainGoal === Enums_1.FitnessGoal.ENDURANCE) {
                fitnessGoal.type = FitnessGoal_2.GoalType.ENDURANCE;
                fitnessGoal.target = 0;
            }
            else {
                fitnessGoal.type = FitnessGoal_2.GoalType.CUSTOM;
                fitnessGoal.target = 0;
            }
            fitnessGoal.current = ((_d = userData.stats) === null || _d === void 0 ? void 0 : _d.currentWeight) || 0;
            fitnessGoal.unit = Enums_1.MeasurementUnit.KILOGRAM;
            fitnessGoal.startDate = new Date();
            fitnessGoal.deadline = new Date();
            fitnessGoal.deadline.setMonth(fitnessGoal.deadline.getMonth() + 3);
            fitnessGoal.status = FitnessGoal_2.GoalStatus.ACTIVE;
            fitnessGoal.description = `Achieve ${fitnessGoal.type} goal in the next 3 months`;
            fitnessGoal.user_id = savedUser.id;
            fitnessGoal.progress = fitnessGoal.calculateProgress();
            await fitnessGoalRepository.save(fitnessGoal);
            logger_1.default.info(`Successfully created user ${savedUser.email} with basic profile data`);
        }
        logger_1.default.info(`Successfully seeded ${usersData.length} users with related data`);
    }
    catch (error) {
        logger_1.default.error('Error seeding users:', error);
        logger_1.default.error('Error seeding users (continuing):', { message: error.message });
    }
}
//# sourceMappingURL=seedUsers.js.map