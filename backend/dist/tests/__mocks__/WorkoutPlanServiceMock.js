"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanServiceMock = void 0;
const Enums_1 = require("../../models/shared/Enums");
const mockResolvedValue = (value) => {
    return () => Promise.resolve(value);
};
class WorkoutPlanServiceMock {
    constructor() {
        this.getWorkoutPlans = mockResolvedValue({
            workoutPlans: [
                {
                    id: 1,
                    name: 'Test Workout Plan',
                    description: 'Test Description',
                    difficulty: Enums_1.Difficulty.BEGINNER,
                    workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
                    exercises: []
                }
            ],
            total: 1
        });
        this.getWorkoutPlanById = mockResolvedValue({
            id: 1,
            name: 'Test Workout Plan',
            description: 'Test Description',
            difficulty: Enums_1.Difficulty.BEGINNER,
            workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
            exercises: []
        });
        this.createWorkoutPlan = mockResolvedValue({
            id: 1,
            name: 'New Workout Plan',
            description: 'New Description',
            difficulty: Enums_1.Difficulty.BEGINNER,
            workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
            exercises: []
        });
        this.updateWorkoutPlan = mockResolvedValue({
            id: 1,
            name: 'Updated Workout Plan',
            description: 'Updated Description',
            difficulty: Enums_1.Difficulty.BEGINNER,
            workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
            exercises: []
        });
        this.deleteWorkoutPlan = mockResolvedValue(true);
    }
}
exports.WorkoutPlanServiceMock = WorkoutPlanServiceMock;
//# sourceMappingURL=WorkoutPlanServiceMock.js.map