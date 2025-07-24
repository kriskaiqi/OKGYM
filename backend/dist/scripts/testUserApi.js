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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const User_1 = require("../models/User");
const Enums_1 = require("../models/shared/Enums");
const logger_1 = __importDefault(require("../utils/logger"));
dotenv.config();
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
let authToken;
async function testUserApi() {
    try {
        logger_1.default.info("Starting User API tests...");
        await login();
        await testBasicFilters();
        await testPaginationAndSorting();
        await testDemographicFilters();
        await testPreferenceFilters();
        await testCombinedFilters();
        logger_1.default.info("All User API tests completed successfully");
    }
    catch (error) {
        logger_1.default.error("Error in User API tests", {
            error: error instanceof Error ? error.message : String(error)
        });
    }
}
async function login() {
    try {
        const response = await axios_1.default.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'Password123'
        });
        authToken = response.data.data.token;
        logger_1.default.info("Admin login successful");
    }
    catch (error) {
        logger_1.default.error("Login failed", {
            error: error instanceof Error ? error.message : String(error)
        });
        throw new Error("Login failed. Cannot continue tests.");
    }
}
async function apiRequest(endpoint, params = {}) {
    try {
        const response = await axios_1.default.get(`${API_URL}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${authToken}`
            },
            params
        });
        return response.data;
    }
    catch (error) {
        logger_1.default.error(`API request failed: ${endpoint}`, {
            error: error instanceof Error ? error.message : String(error),
            params
        });
        throw error;
    }
}
async function testBasicFilters() {
    logger_1.default.info("Testing basic filters API...");
    const trainersResponse = await apiRequest('/users', { role: User_1.UserRole.TRAINER });
    logger_1.default.info(`API found ${trainersResponse.data.length} trainers`);
    const inactiveResponse = await apiRequest('/users', { status: User_1.UserStatus.INACTIVE });
    logger_1.default.info(`API found ${inactiveResponse.data.length} inactive users`);
    const searchResponse = await apiRequest('/users', { searchTerm: 'Jane' });
    logger_1.default.info(`API found ${searchResponse.data.length} users matching 'Jane'`);
}
async function testPaginationAndSorting() {
    var _a, _b;
    logger_1.default.info("Testing pagination and sorting API...");
    const page1Response = await apiRequest('/users', { limit: 3, offset: 0 });
    const page2Response = await apiRequest('/users', { limit: 3, offset: 3 });
    logger_1.default.info(`API Page 1: ${page1Response.data.length} users, Total: ${page1Response.metadata.totalItems}`);
    logger_1.default.info(`API Page 2: ${page2Response.data.length} users, Total: ${page2Response.metadata.totalItems}`);
    const ascResponse = await apiRequest('/users', { sortBy: 'firstName', sortDirection: 'ASC' });
    const descResponse = await apiRequest('/users', { sortBy: 'firstName', sortDirection: 'DESC' });
    logger_1.default.info(`API Sorted ASC first user: ${(_a = ascResponse.data[0]) === null || _a === void 0 ? void 0 : _a.firstName}`);
    logger_1.default.info(`API Sorted DESC first user: ${(_b = descResponse.data[0]) === null || _b === void 0 ? void 0 : _b.firstName}`);
}
async function testDemographicFilters() {
    logger_1.default.info("Testing demographic filters API...");
    const femaleResponse = await apiRequest('/users', { gender: Enums_1.Gender.FEMALE });
    logger_1.default.info(`API found ${femaleResponse.data.length} female users`);
    const activeResponse = await apiRequest('/users', { activityLevel: Enums_1.ActivityLevel.VERY_ACTIVE });
    logger_1.default.info(`API found ${activeResponse.data.length} very active users`);
    const beginnerResponse = await apiRequest('/users', { minimumFitnessLevel: Enums_1.Difficulty.BEGINNER });
    logger_1.default.info(`API found ${beginnerResponse.data.length} beginner users`);
}
async function testPreferenceFilters() {
    logger_1.default.info("Testing preference filters API...");
    const gymResponse = await apiRequest('/users', {
        preferredLocation: Enums_1.WorkoutLocation.GYM,
        includePreferences: true
    });
    logger_1.default.info(`API found ${gymResponse.data.length} users who prefer gym workouts`);
    const cardioResponse = await apiRequest('/users', {
        exercisePreferences: [Enums_1.ExercisePreference.CARDIO_FOCUSED],
        includePreferences: true
    });
    logger_1.default.info(`API found ${cardioResponse.data.length} users who prefer cardio`);
    const coreResponse = await apiRequest('/users', {
        targetBodyAreas: [Enums_1.BodyArea.CORE],
        includePreferences: true
    });
    logger_1.default.info(`API found ${coreResponse.data.length} users who target core`);
}
async function testCombinedFilters() {
    logger_1.default.info("Testing combined filters API...");
    const combinedResponse = await apiRequest('/users', {
        role: User_1.UserRole.USER,
        gender: Enums_1.Gender.FEMALE,
        fitnessLevel: Enums_1.Difficulty.BEGINNER,
        includePreferences: true
    });
    logger_1.default.info(`API found ${combinedResponse.data.length} female beginner users`);
    const complexResponse = await apiRequest('/users', {
        role: User_1.UserRole.USER,
        status: User_1.UserStatus.ACTIVE,
        preferredLocation: Enums_1.WorkoutLocation.HOME,
        exercisePreferences: [Enums_1.ExercisePreference.NO_EQUIPMENT],
        limit: 5,
        offset: 0,
        sortBy: "firstName",
        sortDirection: "ASC",
        includePreferences: true
    });
    logger_1.default.info(`API Complex filter found ${complexResponse.data.length} users out of ${complexResponse.metadata.totalItems} total`);
}
testUserApi()
    .then(() => console.log("API test script completed"))
    .catch(err => console.error("API test script failed:", err));
//# sourceMappingURL=testUserApi.js.map