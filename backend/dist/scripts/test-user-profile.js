"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const services_1 = require("../services");
const logger_1 = __importDefault(require("../utils/logger"));
const User_1 = require("../models/User");
const RelationshipLoader_1 = require("../utils/RelationshipLoader");
async function testUserProfile() {
    var _a, _b, _c, _d, _e;
    try {
        await data_source_1.AppDataSource.initialize();
        logger_1.default.info('Database connection initialized');
        let userId = process.argv[2];
        if (!userId) {
            logger_1.default.info('No user ID provided, finding first user in database...');
            const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
            const firstUser = await userRepo.findOne({ where: {} });
            if (!firstUser) {
                logger_1.default.error('No users found in database');
                process.exit(1);
            }
            userId = firstUser.id;
            logger_1.default.info(`Using first user found: ${userId}`);
        }
        logger_1.default.info('Test 1: Testing direct relationship loading...');
        const fitnessGoals = await RelationshipLoader_1.RelationshipLoader.loadUserFitnessGoals(userId);
        logger_1.default.info(`Loaded ${fitnessGoals.length} fitness goals`);
        const bodyMetrics = await RelationshipLoader_1.RelationshipLoader.loadUserBodyMetrics(userId);
        logger_1.default.info(`Loaded ${bodyMetrics.length} body metrics`);
        const favoriteWorkouts = await RelationshipLoader_1.RelationshipLoader.loadUserFavoriteWorkouts(userId);
        logger_1.default.info(`Loaded ${favoriteWorkouts.length} favorite workouts`);
        logger_1.default.info('Test 2: Testing complete profile loading...');
        const profile = await services_1.services.user.getUserProfile(userId);
        logger_1.default.info('User profile retrieved successfully:');
        console.log(JSON.stringify({
            user: {
                id: profile.user.id,
                email: profile.user.email,
                firstName: profile.user.firstName,
                lastName: profile.user.lastName
            },
            stats: profile.stats,
            relationships: {
                fitnessGoals: ((_a = profile.fitnessGoals) === null || _a === void 0 ? void 0 : _a.length) || 0,
                bodyMetrics: ((_b = profile.bodyMetrics) === null || _b === void 0 ? void 0 : _b.length) || 0,
                favoriteWorkouts: ((_c = profile.favoriteWorkouts) === null || _c === void 0 ? void 0 : _c.length) || 0,
                recentActivities: ((_d = profile.recentActivities) === null || _d === void 0 ? void 0 : _d.length) || 0,
                achievements: ((_e = profile.achievements) === null || _e === void 0 ? void 0 : _e.length) || 0
            }
        }, null, 2));
        logger_1.default.info('User profile tests completed successfully');
    }
    catch (error) {
        logger_1.default.error('Error testing user profile', error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            logger_1.default.info('Database connection closed');
        }
    }
}
testUserProfile();
//# sourceMappingURL=test-user-profile.js.map