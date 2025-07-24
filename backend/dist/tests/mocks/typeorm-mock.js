"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDataSource = void 0;
class MockRepository {
    constructor() {
        this.metadata = {
            tableName: 'mock_table',
            columns: []
        };
    }
    async find() { return []; }
    async findOne() { return {}; }
    async findOneBy() { return {}; }
    async save(entity) { return entity; }
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
const dataSourceMock = {
    isInitialized: false,
    initialize: jest.fn().mockImplementation(async function () {
        this.isInitialized = true;
        return this;
    }),
    destroy: jest.fn().mockImplementation(async function () {
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
                save: async (entity, data) => data,
                remove: async () => { },
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
    entityMetadatas: [
        { name: 'User', tableName: 'users' },
        { name: 'WorkoutPlan', tableName: 'workout_plans' },
        { name: 'WorkoutExercise', tableName: 'workout_exercises' },
        { name: 'Exercise', tableName: 'exercises' },
        { name: 'ExerciseCategory', tableName: 'exercise_categories' }
    ]
};
exports.mockDataSource = dataSourceMock;
//# sourceMappingURL=typeorm-mock.js.map