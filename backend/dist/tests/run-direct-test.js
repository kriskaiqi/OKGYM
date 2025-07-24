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
global.executeTransaction = async function (callback) {
    const queryRunner = {
        manager: {
            save: (entity, data) => {
                if (Array.isArray(data)) {
                    return Promise.resolve(data.map((item, index) => (Object.assign(Object.assign({}, item), { id: index + 1 }))));
                }
                return Promise.resolve(Object.assign(Object.assign({}, data), { id: 1 }));
            }
        },
        connect: () => Promise.resolve(),
        startTransaction: () => Promise.resolve(),
        commitTransaction: () => Promise.resolve(),
        rollbackTransaction: () => Promise.resolve(),
        release: () => Promise.resolve()
    };
    try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const result = await callback(queryRunner);
        await queryRunner.commitTransaction();
        await queryRunner.release();
        return result;
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        throw error;
    }
};
global.cacheManager = {
    get: (key) => Promise.resolve(null),
    set: (key, value, options) => Promise.resolve(true),
    delete: (key) => Promise.resolve(true)
};
async function runDirectTest() {
    console.log('Starting direct WorkoutPlanService test...');
    try {
        const service = new WorkoutPlanService_1.WorkoutPlanService(mockWorkoutPlanRepo, mockWorkoutExerciseRepo, mockExerciseRepo);
        const createData = {
            name: 'Test Workout',
            description: 'Test Description',
            difficulty: Enums_1.Difficulty.BEGINNER,
            workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
            isCustom: true,
            exercises: [
                { exercise_id: 1, sets: 3, repetitions: 12, order: 1 }
            ]
        };
        console.log('Testing createWorkoutPlan...');
        const result = await service.createWorkoutPlan(createData, 'user1');
        console.log('Result:', result);
        console.log('✓ createWorkoutPlan test passed');
        console.log('\nAll tests completed successfully!');
    }
    catch (error) {
        console.error('Test failed with error:', error);
    }
}
runDirectTest().catch(error => {
    console.error('Uncaught error:', error);
});
//# sourceMappingURL=run-direct-test.js.map