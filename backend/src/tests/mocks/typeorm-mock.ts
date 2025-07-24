import { DataSource } from 'typeorm';
import { User } from '../../models/User';
import { WorkoutPlan } from '../../models/WorkoutPlan';
import { WorkoutExercise } from '../../models/WorkoutExercise';
import { Exercise } from '../../models/Exercise';
import { Equipment } from '../../models/Equipment';
import { ExerciseCategory } from '../../models/ExerciseCategory';
import { Media } from '../../models/Media';
import { TrainingProgram } from '../../models/TrainingProgram';
import { ProgramWorkout } from '../../models/ProgramWorkout';
import { WorkoutTag } from '../../models/WorkoutTag';
import { ProgramEnrollment } from '../../models/ProgramEnrollment';
import { ExerciseDetails } from '../../models/ExerciseDetails';
import { MetricTracking } from '../../models/MetricTracking';
import { Feedback } from '../../models/Feedback';
import { ExerciseRelation } from '../../models/ExerciseRelation';
import { WorkoutSession } from '../../models/WorkoutSession';
import { Achievement, UserAchievement } from '../../models/Achievement';
import { FitnessGoal } from '../../models/FitnessGoal';
import { BodyMetric } from '../../models/BodyMetric';
import { Notification } from '../../models/Notification';
import { WorkoutRating } from '../../models/WorkoutRating';
import { ExerciseFormAnalysis } from '../../models/ExerciseFormAnalysis';

// Create a fully mocked DataSource for testing without a real database
class MockRepository {
  metadata = {
    tableName: 'mock_table',
    columns: []
  };
  
  async find() { return []; }
  async findOne() { return {}; }
  async findOneBy() { return {}; }
  async save(entity: any) { return entity; }
  async update() { return { affected: 1 }; }
  async delete() { return { affected: 1 }; }
  async clear() { return { affected: 0 }; }
  createQueryBuilder() {
    return {
      select: () => this,
      where: () => this,
      andWhere: () => this,
      orWhere: () => this,
      innerJoinAndSelect: () => this,
      leftJoinAndSelect: () => this,
      orderBy: () => this,
      addOrderBy: () => this,
      take: () => this,
      skip: () => this,
      getOne: () => ({}),
      getMany: () => [],
      getManyAndCount: () => [[], 0]
    };
  }
}

// Create a mock DataSource
const dataSourceMock = {
  isInitialized: false,
  
  initialize: jest.fn().mockImplementation(async function(this: any) {
    this.isInitialized = true;
    return this;
  }),
  
  destroy: jest.fn().mockImplementation(async function(this: any) {
    this.isInitialized = false;
    return this;
  }),
  
  getRepository: jest.fn().mockImplementation(() => {
    return new MockRepository();
  }),
  
  transaction: jest.fn().mockImplementation(async (callback) => {
    return callback({
      getRepository: () => new MockRepository(),
      manager: {
        save: async (entity: any, data: any) => data,
        remove: async () => {},
        getRepository: () => new MockRepository()
      }
    });
  }),
  
  createQueryRunner: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn().mockImplementation((entity, data) => data),
      find: jest.fn().mockReturnValue([]),
      findOne: jest.fn().mockReturnValue({}),
      update: jest.fn().mockReturnValue({ affected: 1 }),
      delete: jest.fn().mockReturnValue({ affected: 1 }),
      getRepository: () => new MockRepository()
    }
  })),
  
  // Add mock metadata to mimic TypeORM behavior
  entityMetadatas: [
    { name: 'User', tableName: 'users' },
    { name: 'WorkoutPlan', tableName: 'workout_plans' },
    { name: 'WorkoutExercise', tableName: 'workout_exercises' },
    { name: 'Exercise', tableName: 'exercises' },
    { name: 'ExerciseCategory', tableName: 'exercise_categories' }
  ]
};

// Export with the correct type casting
export const mockDataSource = dataSourceMock as unknown as DataSource; 