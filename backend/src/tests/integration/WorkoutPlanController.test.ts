import { Express } from 'express-serve-static-core';
import request from 'supertest';
import { testDataSource } from '../workout-plan-mock';
import { User } from '../../models/User';
import { WorkoutPlan } from '../../models/WorkoutPlan';
import { Exercise } from '../../models/Exercise';
import { WorkoutExercise } from '../../models/WorkoutExercise';
import { ExerciseCategory } from '../../models/ExerciseCategory';
import { 
  Difficulty, 
  WorkoutCategory, 
  ExerciseIntensity, 
  SetType, 
  UserRole,
  MeasurementType,
  ExerciseType,
  MovementPattern,
  MuscleGroup
} from '../../models/shared/Enums';
import jwt from 'jsonwebtoken';
import app from '../../app';

describe('WorkoutPlanController Integration Tests', () => {
  let testApp: Express;
  let testUser: User;
  let testToken: string;
  let testExercise: Exercise;
  let testWorkoutPlan: WorkoutPlan;
  let testCategory: ExerciseCategory;

  beforeAll(async () => {
    testApp = app;

    // Create test category
    testCategory = new ExerciseCategory();
    Object.assign(testCategory, {
      name: 'Test Category',
      description: 'Test Description',
      type: 'muscle_group',
      icon: 'test-icon',
      color: '#000000'
    });
    await testDataSource.getRepository(ExerciseCategory).save(testCategory);

    // Create test user
    testUser = new User();
    testUser.id = '123e4567-e89b-12d3-a456-426614174000';
    testUser.email = 'test@example.com';
    testUser.firstName = 'Test';
    testUser.lastName = 'User';
    testUser.password = 'hashedPassword123';
    testUser.userRole = UserRole.USER;
    await testDataSource.getRepository(User).save(testUser);

    // Generate JWT token
    testToken = jwt.sign(
      { 
        userId: testUser.id,
        email: testUser.email,
        userRole: testUser.userRole
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test exercise with Object.assign to bypass TypeScript checks
    testExercise = new Exercise();
    Object.assign(testExercise, {
      name: 'Test Exercise',
      description: 'Test Exercise Description',
      level: Difficulty.BEGINNER,
      targetMuscleGroups: [MuscleGroup.CHEST, MuscleGroup.TRICEPS],
      equipmentOptions: [],
      measurementType: MeasurementType.REPS,
      types: [ExerciseType.STRENGTH_COMPOUND],
      movementPattern: MovementPattern.PUSH,
      categories: [testCategory],
      stats: {
        duration: { avg: 0, min: 0, max: 0 },
        calories: { avg: 0, min: 0, max: 0 },
        completion: { rate: 0, total: 0, successful: 0 },
        rating: { value: 0, count: 0, distribution: {} },
        popularity: { score: 0, trend: 'stable', lastUpdated: new Date() }
      }
    });
    
    await testDataSource.getRepository(Exercise).save(testExercise);
  });

  beforeEach(async () => {
    // Clean up before each test
    await testDataSource.getRepository(WorkoutPlan).clear();
    await testDataSource.getRepository(WorkoutExercise).clear();

    // Create a fresh workout plan before each test
    testWorkoutPlan = new WorkoutPlan();
    testWorkoutPlan.name = 'Test Workout Plan';
    testWorkoutPlan.description = 'Test Description';
    testWorkoutPlan.difficulty = Difficulty.BEGINNER;
    testWorkoutPlan.workoutCategory = WorkoutCategory.FULL_BODY;
    testWorkoutPlan.estimatedDuration = 30;
    testWorkoutPlan.isCustom = true;
    testWorkoutPlan.creator_id = testUser.id;
    // Initialize required properties
    testWorkoutPlan.rating = 0;
    testWorkoutPlan.ratingCount = 0;
    testWorkoutPlan.popularity = 0;
    testWorkoutPlan.estimatedCaloriesBurn = 0;
    testWorkoutPlan.targetMuscleGroups = [testCategory];
    testWorkoutPlan.exercises = [];
    testWorkoutPlan.tags = [];
    testWorkoutPlan.equipmentNeeded = [];
    
    const savedWorkoutPlan = await testDataSource.getRepository(WorkoutPlan).save(testWorkoutPlan);
    testWorkoutPlan.id = savedWorkoutPlan.id;
  });

  describe('GET /api/workout-plans', () => {
    it('should return a list of workout plans', async () => {
      const response = await request(testApp)
        .get('/api/workout-plans')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.workoutPlans).toBeDefined();
      expect(Array.isArray(response.body.workoutPlans)).toBe(true);
      expect(response.body.total).toBeDefined();
    });

    it('should filter workout plans by difficulty', async () => {
      const response = await request(testApp)
        .get('/api/workout-plans')
        .query({ difficulty: Difficulty.BEGINNER })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.workoutPlans.every((plan: WorkoutPlan) => 
        plan.difficulty === Difficulty.BEGINNER
      )).toBe(true);
    });

    it('should return only user\'s workout plans when userPlansOnly is true', async () => {
      const response = await request(testApp)
        .get('/api/workout-plans')
        .query({ userPlansOnly: true })
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.workoutPlans.every((plan: WorkoutPlan) => 
        plan.creator_id === testUser.id
      )).toBe(true);
    });
  });

  describe('GET /api/workout-plans/:id', () => {
    it('should return a specific workout plan', async () => {
      const response = await request(testApp)
        .get(`/api/workout-plans/${testWorkoutPlan.id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testWorkoutPlan.id);
      expect(response.body.name).toBe(testWorkoutPlan.name);
    });

    it('should return 404 for non-existent workout plan', async () => {
      const response = await request(testApp)
        .get('/api/workout-plans/999999')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/workout-plans', () => {
    it('should create a new workout plan', async () => {
      const response = await request(testApp)
        .post('/api/workout-plans')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'New Workout Plan',
          description: 'New Description',
          difficulty: Difficulty.BEGINNER,
          workoutCategory: WorkoutCategory.FULL_BODY,
          estimatedDuration: 30,
          exercises: [{
            exercise_id: testExercise.id,
            sets: 3,
            repetitions: 12,
            intensity: ExerciseIntensity.MODERATE,
            setType: SetType.STRAIGHT,
            order: 1
          }]
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('New Workout Plan');
      
      // Verify exercise was added
      const workoutPlan = await testDataSource.getRepository(WorkoutPlan).findOne({
        where: { id: response.body.id },
        relations: ['exercises']
      });
      
      expect(workoutPlan).toBeDefined();
      expect(workoutPlan?.exercises.length).toBe(1);
    });

    it('should validate required fields', async () => {
      const response = await request(testApp)
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

      const response = await request(testApp)
        .put(`/api/workout-plans/${testWorkoutPlan.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updates.name);
      expect(response.body.description).toBe(updates.description);
    });

    it('should prevent unauthorized updates', async () => {
      const unauthorizedUser = new User();
      Object.assign(unauthorizedUser, {
        id: '123e4567-e89b-12d3-a456-426614174999',
        email: 'unauthorized@example.com',
        firstName: 'Unauthorized',
        lastName: 'User',
        password: 'hashedPassword123',
        userRole: UserRole.USER
      });
      await testDataSource.getRepository(User).save(unauthorizedUser);
      const unauthorizedToken = jwt.sign(
        { 
          userId: unauthorizedUser.id,
          email: unauthorizedUser.email,
          userRole: unauthorizedUser.userRole
        },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(testApp)
        .put(`/api/workout-plans/${testWorkoutPlan.id}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send({ name: 'Unauthorized Update' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/workout-plans/:id', () => {
    it('should delete a workout plan', async () => {
      const response = await request(testApp)
        .delete(`/api/workout-plans/${testWorkoutPlan.id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);

      // Verify deletion
      const verifyResponse = await request(testApp)
        .get(`/api/workout-plans/${testWorkoutPlan.id}`)
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(verifyResponse.status).toBe(404);
    });

    it('should prevent unauthorized deletions', async () => {
      const unauthorizedUser = new User();
      Object.assign(unauthorizedUser, {
        id: '123e4567-e89b-12d3-a456-426614174999',
        email: 'unauthorized2@example.com',
        firstName: 'Unauthorized',
        lastName: 'User',
        password: 'hashedPassword123',
        userRole: UserRole.USER
      });
      await testDataSource.getRepository(User).save(unauthorizedUser);
      const unauthorizedToken = jwt.sign(
        { 
          userId: unauthorizedUser.id,
          email: unauthorizedUser.email,
          userRole: unauthorizedUser.userRole
        },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(testApp)
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
        intensity: ExerciseIntensity.MODERATE,
        setType: SetType.STRAIGHT,
        order: 1
      };

      const response = await request(testApp)
        .post(`/api/workout-plans/${testWorkoutPlan.id}/exercises`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(exerciseData);

      expect(response.status).toBe(200);
      
      // Verify exercise was added
      const workoutPlan = await testDataSource.getRepository(WorkoutPlan).findOne({
        where: { id: testWorkoutPlan.id },
        relations: ['exercises']
      });
      
      expect(workoutPlan).toBeDefined();
      expect(workoutPlan?.exercises.length).toBe(1);
      expect(workoutPlan?.exercises[0].exercise_id).toBe(testExercise.id);
    });
  });

  describe('PUT /api/workout-plans/:id/exercises/:exerciseId', () => {
    it('should update an exercise in a workout plan', async () => {
      // First add an exercise
      const workoutExercise = new WorkoutExercise();
      Object.assign(workoutExercise, {
        workout_plan_id: testWorkoutPlan.id,
        exercise_id: testExercise.id,
        sets: 3,
        repetitions: 12,
        order: 1
      });
      await testDataSource.getRepository(WorkoutExercise).save(workoutExercise);

      const updates = {
        sets: 4,
        repetitions: 15
      };

      const response = await request(testApp)
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
      // First add an exercise
      const workoutExercise = new WorkoutExercise();
      Object.assign(workoutExercise, {
        workout_plan_id: testWorkoutPlan.id,
        exercise_id: testExercise.id,
        sets: 3,
        repetitions: 12,
        order: 1
      });
      await testDataSource.getRepository(WorkoutExercise).save(workoutExercise);

      const response = await request(testApp)
        .delete(`/api/workout-plans/${testWorkoutPlan.id}/exercises/${workoutExercise.id}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.exercises).toHaveLength(0);
    });
  });

  describe('PUT /api/workout-plans/:id/exercises/reorder', () => {
    it('should reorder exercises in a workout plan', async () => {
      // Add two exercises
      const exercise1 = new WorkoutExercise();
      Object.assign(exercise1, {
        workout_plan_id: testWorkoutPlan.id,
        exercise_id: testExercise.id,
        sets: 3,
        repetitions: 12,
        order: 1
      });
      await testDataSource.getRepository(WorkoutExercise).save(exercise1);

      const exercise2 = new WorkoutExercise();
      Object.assign(exercise2, {
        workout_plan_id: testWorkoutPlan.id,
        exercise_id: testExercise.id,
        sets: 3,
        repetitions: 12,
        order: 2
      });
      await testDataSource.getRepository(WorkoutExercise).save(exercise2);

      const reorderData = [
        { id: exercise1.id, order: 2 },
        { id: exercise2.id, order: 1 }
      ];

      const response = await request(testApp)
        .put(`/api/workout-plans/${testWorkoutPlan.id}/exercises/reorder`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(reorderData);

      expect(response.status).toBe(200);
      expect(response.body.exercises[0].id).toBe(exercise2.id);
      expect(response.body.exercises[1].id).toBe(exercise1.id);
    });
  });
}); 