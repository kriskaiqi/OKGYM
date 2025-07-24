"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WorkoutPlanService_1 = require("../services/WorkoutPlanService");
const CacheManager_1 = require("../services/CacheManager");
const Enums_1 = require("../models/shared/Enums");
CacheManager_1.cacheManager.get = async () => null;
CacheManager_1.cacheManager.set = async () => { };
CacheManager_1.cacheManager.delete = async () => { };
CacheManager_1.cacheManager.deleteByPattern = async () => { };
const originalModuleTransaction = require('../utils/transaction-helper');
originalModuleTransaction.executeTransaction = async (callback) => {
    try {
        return await callback();
    }
    catch (error) {
        console.error('Transaction failed', error);
        throw error;
    }
};
const originalLogger = require('../utils/logger');
originalLogger.default.info = (...args) => console.log(...args);
originalLogger.default.error = (...args) => console.error(...args);
originalLogger.default.warn = (...args) => console.warn(...args);
originalLogger.default.debug = (...args) => { };
const mockExercise = {
    id: 1,
    name: 'Test Exercise',
    description: 'A test exercise',
    difficulty: Enums_1.Difficulty.BEGINNER,
    equipment: [],
    targetMuscleGroups: [],
    instructions: []
};
const mockWorkoutExercise = {
    id: 1,
    workout_plan_id: 1,
    exercise_id: 1,
    exercise: mockExercise,
    sets: 3,
    repetitions: 10,
    restTime: 60,
    intensity: 'MODERATE',
    order: 0,
    duration: 0,
    notes: '',
    setType: 'STRAIGHT'
};
const mockWorkoutPlan = {
    id: 1,
    name: 'Test Workout',
    description: 'A test workout plan',
    difficulty: Enums_1.Difficulty.BEGINNER,
    workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
    targetMuscleGroups: [],
    exercises: [mockWorkoutExercise],
    estimatedDuration: 30,
    isCustom: true,
    creator_id: 'user1',
    popularity: 0,
    rating: 0,
    ratingCount: 0,
    canBeModifiedBy: (userId) => userId === 'user1'
};
const workoutPlanRepo = {
    findById: async (id) => {
        console.log(`Finding workout plan with ID ${id}`);
        return Object.assign(Object.assign({}, mockWorkoutPlan), { id });
    },
    findWithFilters: async () => {
        return [[mockWorkoutPlan], 1];
    },
    create: async (data) => {
        console.log(`Creating workout plan: ${data.name}`);
        return Object.assign(Object.assign({}, mockWorkoutPlan), data);
    },
    save: async (entity) => {
        return entity;
    },
    update: async (id, data) => {
        console.log(`Updating workout plan ${id} with`, data);
        Object.assign(mockWorkoutPlan, data);
        return;
    },
    delete: async (id) => {
        console.log(`Deleting workout plan ${id}`);
        return { affected: 1 };
    }
};
const workoutExerciseRepo = {
    findById: async (id) => {
        console.log(`Finding workout exercise with ID ${id}`);
        return Object.assign(Object.assign({}, mockWorkoutExercise), { id });
    },
    find: async () => {
        return [mockWorkoutExercise];
    },
    create: async (data) => {
        console.log(`Creating workout exercise`, data);
        return Object.assign(Object.assign({}, mockWorkoutExercise), data);
    },
    save: async (entity) => {
        return entity;
    },
    update: async (id, data) => {
        console.log(`Updating workout exercise ${id} with`, data);
        return;
    },
    delete: async (id) => {
        console.log(`Deleting workout exercise ${id}`);
        return { affected: 1 };
    }
};
const exerciseRepo = {
    findById: async (id) => {
        console.log(`Finding exercise with ID ${id}`);
        return Object.assign(Object.assign({}, mockExercise), { id });
    }
};
async function runTests() {
    var _a, _b, _c;
    console.log('===== Running WorkoutPlanService Tests =====');
    const service = new WorkoutPlanService_1.WorkoutPlanService(workoutPlanRepo, workoutExerciseRepo, exerciseRepo);
    service.handleError = (error, message, context) => {
        console.error(`ERROR: ${message}`, error);
        return null;
    };
    try {
        console.log('\n----- Test: getWorkoutPlanById -----');
        const workoutPlan = await service.getWorkoutPlanById(1, 'user1');
        console.log('Result:', workoutPlan === null || workoutPlan === void 0 ? void 0 : workoutPlan.name);
        console.log('\n----- Test: createWorkoutPlan -----');
        const newPlan = await service.createWorkoutPlan({
            name: 'New Workout',
            description: 'A new workout plan'
        }, 'user1');
        console.log('Result:', newPlan === null || newPlan === void 0 ? void 0 : newPlan.name);
        console.log('\n----- Test: updateWorkoutPlan -----');
        const updatedPlan = await service.updateWorkoutPlan(1, {
            name: 'Updated Workout',
            difficulty: Enums_1.Difficulty.ADVANCED
        }, 'user1');
        console.log('Result:', updatedPlan === null || updatedPlan === void 0 ? void 0 : updatedPlan.name, updatedPlan === null || updatedPlan === void 0 ? void 0 : updatedPlan.difficulty);
        console.log('\n----- Test: addExerciseToWorkoutPlan -----');
        const planWithNewExercise = await service.addExerciseToWorkoutPlan(1, {
            exercise_id: 2,
            sets: 4,
            repetitions: 12
        }, 'user1');
        console.log('Result:', (_a = planWithNewExercise === null || planWithNewExercise === void 0 ? void 0 : planWithNewExercise.exercises) === null || _a === void 0 ? void 0 : _a.length);
        console.log('\n----- Test: updateExerciseInWorkoutPlan -----');
        const planWithUpdatedExercise = await service.updateExerciseInWorkoutPlan(1, 1, {
            sets: 5,
            repetitions: 8
        }, 'user1');
        console.log('Result:', (_c = (_b = planWithUpdatedExercise === null || planWithUpdatedExercise === void 0 ? void 0 : planWithUpdatedExercise.exercises) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.sets);
    }
    catch (error) {
        console.error('Test failed:', error);
    }
    console.log('\n===== Tests completed =====');
}
runTests().catch(console.error);
//# sourceMappingURL=debug-test.js.map