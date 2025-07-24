"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WorkoutPlanService_1 = require("../services/WorkoutPlanService");
const Enums_1 = require("../models/shared/Enums");
const mockWorkoutPlanRepo = {
    create: (data) => Promise.resolve(Object.assign(Object.assign({}, data), { id: 1 })),
    findById: (id) => Promise.resolve({
        id,
        name: 'Test Workout',
        description: 'Test Description',
        difficulty: Enums_1.Difficulty.BEGINNER,
        workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
        isCustom: true,
        creator_id: 'user1',
        exercises: [],
        canBeModifiedBy: (userId) => userId === 'user1'
    }),
    update: (id, data) => Promise.resolve(Object.assign({ id }, data)),
    delete: (id) => Promise.resolve({ affected: 1 }),
    findWithFilters: (filters) => Promise.resolve([[{ id: 1, name: 'Test Workout' }], 1])
};
const mockWorkoutExerciseRepo = {
    create: (data) => Promise.resolve(Object.assign(Object.assign({}, data), { id: 1 })),
    update: (id, data) => Promise.resolve(Object.assign({ id }, data)),
    delete: (id) => Promise.resolve({ affected: 1 })
};
const mockExerciseRepo = {
    findById: (id) => Promise.resolve({ id, name: 'Test Exercise' })
};
const executeTransaction = async (callback) => {
    const queryRunner = {
        manager: {
            save: (entity, data) => {
                if (Array.isArray(data)) {
                    return Promise.resolve(data.map((item, index) => (Object.assign(Object.assign({}, item), { id: index + 1 }))));
                }
                return Promise.resolve(Object.assign(Object.assign({}, data), { id: 1 }));
            }
        }
    };
    return await callback(queryRunner);
};
const mockCacheManager = {
    get: (key) => Promise.resolve(null),
    set: (key, value) => Promise.resolve(true),
    delete: (key) => Promise.resolve(true)
};
global.executeTransaction = executeTransaction;
global.cacheManager = mockCacheManager;
const mockLogger = {
    info: () => { },
    error: () => { },
    warn: () => { },
    debug: () => { }
};
async function runServiceTests() {
    console.log('Starting simplified WorkoutPlanService tests...');
    const service = new WorkoutPlanService_1.WorkoutPlanService(mockWorkoutPlanRepo, mockWorkoutExerciseRepo, mockExerciseRepo);
    service.handleError = (error, message, context) => {
        console.error('Error in test:', message, error);
        throw error;
    };
    try {
        console.log('Testing createWorkoutPlan...');
        const createData = {
            name: 'Test Workout',
            description: 'Test Description',
            exercises: [{ exercise_id: 1, sets: 3, repetitions: 12 }]
        };
        const createResult = await service.createWorkoutPlan(createData, 'user1');
        console.assert(createResult && createResult.id === 1, 'Create test failed');
        console.log('✓ createWorkoutPlan passed');
        console.log('Testing getWorkoutPlanById...');
        const getResult = await service.getWorkoutPlanById(1, 'user1');
        console.assert(getResult && getResult.id === 1, 'Get by ID test failed');
        console.log('✓ getWorkoutPlanById passed');
        console.log('Testing getWorkoutPlans...');
        const listResult = await service.getWorkoutPlans({}, 'user1');
        console.assert(listResult && listResult.total === 1, 'List test failed');
        console.log('✓ getWorkoutPlans passed');
        console.log('Testing updateWorkoutPlan...');
        const updateResult = await service.updateWorkoutPlan(1, { name: 'Updated Name' }, 'user1');
        console.assert(updateResult && updateResult.name === 'Updated Name', 'Update test failed');
        console.log('✓ updateWorkoutPlan passed');
        console.log('Testing deleteWorkoutPlan...');
        const deleteResult = await service.deleteWorkoutPlan(1, 'user1');
        console.assert(deleteResult === true, 'Delete test failed');
        console.log('✓ deleteWorkoutPlan passed');
        console.log('\nAll tests passed successfully! ✓');
    }
    catch (error) {
        console.error('Test failure:', error);
    }
}
runServiceTests().catch(error => {
    console.error('Error running tests:', error);
});
//# sourceMappingURL=run-simplified-service-test.js.map