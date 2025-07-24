"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const workout_plan_mock_1 = require("../workout-plan-mock");
const User_1 = require("../../models/User");
const WorkoutPlan_1 = require("../../models/WorkoutPlan");
const Exercise_1 = require("../../models/Exercise");
const WorkoutExercise_1 = require("../../models/WorkoutExercise");
const ExerciseCategory_1 = require("../../models/ExerciseCategory");
const Enums_1 = require("../../models/shared/Enums");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = __importDefault(require("../../app"));
describe('WorkoutPlanController Integration Tests', () => {
    let testApp;
    let testUser;
    let testToken;
    let testExercise;
    let testWorkoutPlan;
    let testCategory;
    beforeAll(async () => {
        testApp = app_1.default;
        testCategory = new ExerciseCategory_1.ExerciseCategory();
        Object.assign(testCategory, {
            name: 'Test Category',
            description: 'Test Description',
            type: 'muscle_group',
            icon: 'test-icon',
            color: '#000000'
        });
        await workout_plan_mock_1.testDataSource.getRepository(ExerciseCategory_1.ExerciseCategory).save(testCategory);
        testUser = new User_1.User();
        testUser.id = '123e4567-e89b-12d3-a456-426614174000';
        testUser.email = 'test@example.com';
        testUser.firstName = 'Test';
        testUser.lastName = 'User';
        testUser.password = 'hashedPassword123';
        testUser.userRole = Enums_1.UserRole.USER;
        await workout_plan_mock_1.testDataSource.getRepository(User_1.User).save(testUser);
        testToken = jsonwebtoken_1.default.sign({
            userId: testUser.id,
            email: testUser.email,
            userRole: testUser.userRole
        }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
        testExercise = new Exercise_1.Exercise();
        Object.assign(testExercise, {
            name: 'Test Exercise',
            description: 'Test Exercise Description',
            level: Enums_1.Difficulty.BEGINNER,
            targetMuscleGroups: [Enums_1.MuscleGroup.CHEST, Enums_1.MuscleGroup.TRICEPS],
            equipmentOptions: [],
            measurementType: Enums_1.MeasurementType.REPS,
            types: [Enums_1.ExerciseType.STRENGTH_COMPOUND],
            movementPattern: Enums_1.MovementPattern.PUSH,
            categories: [testCategory],
            stats: {
                duration: { avg: 0, min: 0, max: 0 },
                calories: { avg: 0, min: 0, max: 0 },
                completion: { rate: 0, total: 0, successful: 0 },
                rating: { value: 0, count: 0, distribution: {} },
                popularity: { score: 0, trend: 'stable', lastUpdated: new Date() }
            }
        });
        await workout_plan_mock_1.testDataSource.getRepository(Exercise_1.Exercise).save(testExercise);
    });
    beforeEach(async () => {
        await workout_plan_mock_1.testDataSource.getRepository(WorkoutPlan_1.WorkoutPlan).clear();
        await workout_plan_mock_1.testDataSource.getRepository(WorkoutExercise_1.WorkoutExercise).clear();
        testWorkoutPlan = new WorkoutPlan_1.WorkoutPlan();
        testWorkoutPlan.name = 'Test Workout Plan';
        testWorkoutPlan.description = 'Test Description';
        testWorkoutPlan.difficulty = Enums_1.Difficulty.BEGINNER;
        testWorkoutPlan.workoutCategory = Enums_1.WorkoutCategory.FULL_BODY;
        testWorkoutPlan.estimatedDuration = 30;
        testWorkoutPlan.isCustom = true;
        testWorkoutPlan.creator_id = testUser.id;
        testWorkoutPlan.rating = 0;
        testWorkoutPlan.ratingCount = 0;
        testWorkoutPlan.popularity = 0;
        testWorkoutPlan.estimatedCaloriesBurn = 0;
        testWorkoutPlan.targetMuscleGroups = [testCategory];
        testWorkoutPlan.exercises = [];
        testWorkoutPlan.tags = [];
        testWorkoutPlan.equipmentNeeded = [];
        const savedWorkoutPlan = await workout_plan_mock_1.testDataSource.getRepository(WorkoutPlan_1.WorkoutPlan).save(testWorkoutPlan);
        testWorkoutPlan.id = savedWorkoutPlan.id;
    });
    describe('GET /api/workout-plans', () => {
        it('should return a list of workout plans', async () => {
            const response = await (0, supertest_1.default)(testApp)
                .get('/api/workout-plans')
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(200);
            expect(response.body.workoutPlans).toBeDefined();
            expect(Array.isArray(response.body.workoutPlans)).toBe(true);
            expect(response.body.total).toBeDefined();
        });
        it('should filter workout plans by difficulty', async () => {
            const response = await (0, supertest_1.default)(testApp)
                .get('/api/workout-plans')
                .query({ difficulty: Enums_1.Difficulty.BEGINNER })
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(200);
            expect(response.body.workoutPlans.every((plan) => plan.difficulty === Enums_1.Difficulty.BEGINNER)).toBe(true);
        });
        it('should return only user\'s workout plans when userPlansOnly is true', async () => {
            const response = await (0, supertest_1.default)(testApp)
                .get('/api/workout-plans')
                .query({ userPlansOnly: true })
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(200);
            expect(response.body.workoutPlans.every((plan) => plan.creator_id === testUser.id)).toBe(true);
        });
    });
    describe('GET /api/workout-plans/:id', () => {
        it('should return a specific workout plan', async () => {
            const response = await (0, supertest_1.default)(testApp)
                .get(`/api/workout-plans/${testWorkoutPlan.id}`)
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(testWorkoutPlan.id);
            expect(response.body.name).toBe(testWorkoutPlan.name);
        });
        it('should return 404 for non-existent workout plan', async () => {
            const response = await (0, supertest_1.default)(testApp)
                .get('/api/workout-plans/999999')
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(404);
        });
    });
    describe('POST /api/workout-plans', () => {
        it('should create a new workout plan', async () => {
            const response = await (0, supertest_1.default)(testApp)
                .post('/api/workout-plans')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                name: 'New Workout Plan',
                description: 'New Description',
                difficulty: Enums_1.Difficulty.BEGINNER,
                workoutCategory: Enums_1.WorkoutCategory.FULL_BODY,
                estimatedDuration: 30,
                exercises: [{
                        exercise_id: testExercise.id,
                        sets: 3,
                        repetitions: 12,
                        intensity: Enums_1.ExerciseIntensity.MODERATE,
                        setType: Enums_1.SetType.STRAIGHT,
                        order: 1
                    }]
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('New Workout Plan');
            const workoutPlan = await workout_plan_mock_1.testDataSource.getRepository(WorkoutPlan_1.WorkoutPlan).findOne({
                where: { id: response.body.id },
                relations: ['exercises']
            });
            expect(workoutPlan).toBeDefined();
            expect(workoutPlan === null || workoutPlan === void 0 ? void 0 : workoutPlan.exercises.length).toBe(1);
        });
        it('should validate required fields', async () => {
            const response = await (0, supertest_1.default)(testApp)
                .post('/api/workout-plans')
                .set('Authorization', `Bearer ${testToken}`)
                .send({});
            expect(response.status).toBe(400);
        });
    });
    describe('PUT /api/workout-plans/:id', () => {
        it('should update an existing workout plan', async () => {
            const updates = {
                name: 'Updated Workout Plan',
                description: 'Updated Description'
            };
            const response = await (0, supertest_1.default)(testApp)
                .put(`/api/workout-plans/${testWorkoutPlan.id}`)
                .set('Authorization', `Bearer ${testToken}`)
                .send(updates);
            expect(response.status).toBe(200);
            expect(response.body.name).toBe(updates.name);
            expect(response.body.description).toBe(updates.description);
        });
        it('should prevent unauthorized updates', async () => {
            const unauthorizedUser = new User_1.User();
            Object.assign(unauthorizedUser, {
                id: '123e4567-e89b-12d3-a456-426614174999',
                email: 'unauthorized@example.com',
                firstName: 'Unauthorized',
                lastName: 'User',
                password: 'hashedPassword123',
                userRole: Enums_1.UserRole.USER
            });
            await workout_plan_mock_1.testDataSource.getRepository(User_1.User).save(unauthorizedUser);
            const unauthorizedToken = jsonwebtoken_1.default.sign({
                userId: unauthorizedUser.id,
                email: unauthorizedUser.email,
                userRole: unauthorizedUser.userRole
            }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
            const response = await (0, supertest_1.default)(testApp)
                .put(`/api/workout-plans/${testWorkoutPlan.id}`)
                .set('Authorization', `Bearer ${unauthorizedToken}`)
                .send({ name: 'Unauthorized Update' });
            expect(response.status).toBe(403);
        });
    });
    describe('DELETE /api/workout-plans/:id', () => {
        it('should delete a workout plan', async () => {
            const response = await (0, supertest_1.default)(testApp)
                .delete(`/api/workout-plans/${testWorkoutPlan.id}`)
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(200);
            const verifyResponse = await (0, supertest_1.default)(testApp)
                .get(`/api/workout-plans/${testWorkoutPlan.id}`)
                .set('Authorization', `Bearer ${testToken}`);
            expect(verifyResponse.status).toBe(404);
        });
        it('should prevent unauthorized deletions', async () => {
            const unauthorizedUser = new User_1.User();
            Object.assign(unauthorizedUser, {
                id: '123e4567-e89b-12d3-a456-426614174999',
                email: 'unauthorized2@example.com',
                firstName: 'Unauthorized',
                lastName: 'User',
                password: 'hashedPassword123',
                userRole: Enums_1.UserRole.USER
            });
            await workout_plan_mock_1.testDataSource.getRepository(User_1.User).save(unauthorizedUser);
            const unauthorizedToken = jsonwebtoken_1.default.sign({
                userId: unauthorizedUser.id,
                email: unauthorizedUser.email,
                userRole: unauthorizedUser.userRole
            }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
            const response = await (0, supertest_1.default)(testApp)
                .delete(`/api/workout-plans/${testWorkoutPlan.id}`)
                .set('Authorization', `Bearer ${unauthorizedToken}`);
            expect(response.status).toBe(403);
        });
    });
    describe('POST /api/workout-plans/:id/exercises', () => {
        it('should add an exercise to a workout plan', async () => {
            const exerciseData = {
                exercise_id: testExercise.id,
                sets: 3,
                repetitions: 12,
                intensity: Enums_1.ExerciseIntensity.MODERATE,
                setType: Enums_1.SetType.STRAIGHT,
                order: 1
            };
            const response = await (0, supertest_1.default)(testApp)
                .post(`/api/workout-plans/${testWorkoutPlan.id}/exercises`)
                .set('Authorization', `Bearer ${testToken}`)
                .send(exerciseData);
            expect(response.status).toBe(200);
            const workoutPlan = await workout_plan_mock_1.testDataSource.getRepository(WorkoutPlan_1.WorkoutPlan).findOne({
                where: { id: testWorkoutPlan.id },
                relations: ['exercises']
            });
            expect(workoutPlan).toBeDefined();
            expect(workoutPlan === null || workoutPlan === void 0 ? void 0 : workoutPlan.exercises.length).toBe(1);
            expect(workoutPlan === null || workoutPlan === void 0 ? void 0 : workoutPlan.exercises[0].exercise_id).toBe(testExercise.id);
        });
    });
    describe('PUT /api/workout-plans/:id/exercises/:exerciseId', () => {
        it('should update an exercise in a workout plan', async () => {
            const workoutExercise = new WorkoutExercise_1.WorkoutExercise();
            Object.assign(workoutExercise, {
                workout_plan_id: testWorkoutPlan.id,
                exercise_id: testExercise.id,
                sets: 3,
                repetitions: 12,
                order: 1
            });
            await workout_plan_mock_1.testDataSource.getRepository(WorkoutExercise_1.WorkoutExercise).save(workoutExercise);
            const updates = {
                sets: 4,
                repetitions: 15
            };
            const response = await (0, supertest_1.default)(testApp)
                .put(`/api/workout-plans/${testWorkoutPlan.id}/exercises/${workoutExercise.id}`)
                .set('Authorization', `Bearer ${testToken}`)
                .send(updates);
            expect(response.status).toBe(200);
            expect(response.body.exercises[0].sets).toBe(updates.sets);
            expect(response.body.exercises[0].repetitions).toBe(updates.repetitions);
        });
    });
    describe('DELETE /api/workout-plans/:id/exercises/:exerciseId', () => {
        it('should remove an exercise from a workout plan', async () => {
            const workoutExercise = new WorkoutExercise_1.WorkoutExercise();
            Object.assign(workoutExercise, {
                workout_plan_id: testWorkoutPlan.id,
                exercise_id: testExercise.id,
                sets: 3,
                repetitions: 12,
                order: 1
            });
            await workout_plan_mock_1.testDataSource.getRepository(WorkoutExercise_1.WorkoutExercise).save(workoutExercise);
            const response = await (0, supertest_1.default)(testApp)
                .delete(`/api/workout-plans/${testWorkoutPlan.id}/exercises/${workoutExercise.id}`)
                .set('Authorization', `Bearer ${testToken}`);
            expect(response.status).toBe(200);
            expect(response.body.exercises).toHaveLength(0);
        });
    });
    describe('PUT /api/workout-plans/:id/exercises/reorder', () => {
        it('should reorder exercises in a workout plan', async () => {
            const exercise1 = new WorkoutExercise_1.WorkoutExercise();
            Object.assign(exercise1, {
                workout_plan_id: testWorkoutPlan.id,
                exercise_id: testExercise.id,
                sets: 3,
                repetitions: 12,
                order: 1
            });
            await workout_plan_mock_1.testDataSource.getRepository(WorkoutExercise_1.WorkoutExercise).save(exercise1);
            const exercise2 = new WorkoutExercise_1.WorkoutExercise();
            Object.assign(exercise2, {
                workout_plan_id: testWorkoutPlan.id,
                exercise_id: testExercise.id,
                sets: 3,
                repetitions: 12,
                order: 2
            });
            await workout_plan_mock_1.testDataSource.getRepository(WorkoutExercise_1.WorkoutExercise).save(exercise2);
            const reorderData = [
                { id: exercise1.id, order: 2 },
                { id: exercise2.id, order: 1 }
            ];
            const response = await (0, supertest_1.default)(testApp)
                .put(`/api/workout-plans/${testWorkoutPlan.id}/exercises/reorder`)
                .set('Authorization', `Bearer ${testToken}`)
                .send(reorderData);
            expect(response.status).toBe(200);
            expect(response.body.exercises[0].id).toBe(exercise2.id);
            expect(response.body.exercises[1].id).toBe(exercise1.id);
        });
    });
});
//# sourceMappingURL=WorkoutPlanController.test.js.map