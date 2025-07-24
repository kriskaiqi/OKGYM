"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const metadataArgsStorage = {
    tables: [],
    columns: [],
    relations: [],
    relationCounts: [],
    indices: [],
    uniques: [],
    checks: [],
    exclusions: [],
    generations: [],
    inheritances: [],
    embeddeds: [],
    entityListeners: [],
    transactionEntityListeners: [],
};
exports.AppDataSource = {
    isInitialized: true,
    createQueryRunner: jest.fn().mockImplementation(() => ({
        manager: {
            save: jest.fn().mockImplementation((Entity, data) => {
                if (Array.isArray(data)) {
                    return Promise.resolve(data.map((item, index) => (Object.assign(Object.assign({}, item), { id: index + 1 }))));
                }
                return Promise.resolve(Object.assign(Object.assign({}, data), { id: 1 }));
            }),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            update: jest.fn().mockImplementation((Entity, id, data) => {
                return Promise.resolve(Object.assign(Object.assign({}, data), { id }));
            })
        },
        connect: jest.fn().mockResolvedValue(undefined),
        startTransaction: jest.fn().mockResolvedValue(undefined),
        commitTransaction: jest.fn().mockResolvedValue(undefined),
        rollbackTransaction: jest.fn().mockResolvedValue(undefined),
        release: jest.fn().mockResolvedValue(undefined),
        isTransactionActive: true,
    })),
    getRepository: jest.fn().mockImplementation(() => ({
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([[], 0])
        })
    })),
    manager: {
        transaction: jest.fn().mockImplementation(async (cb) => {
            const mockManager = {
                save: jest.fn().mockImplementation((Entity, data) => {
                    if (Array.isArray(data)) {
                        return Promise.resolve(data.map((item, index) => (Object.assign(Object.assign({}, item), { id: index + 1 }))));
                    }
                    return Promise.resolve(Object.assign(Object.assign({}, data), { id: 1 }));
                }),
                delete: jest.fn().mockResolvedValue({ affected: 1 }),
                update: jest.fn().mockImplementation((Entity, id, data) => {
                    return Promise.resolve(Object.assign(Object.assign({}, data), { id }));
                }),
            };
            return await cb(mockManager);
        })
    },
    hasMetadata: jest.fn().mockReturnValue(true),
    getMetadata: jest.fn().mockImplementation(() => ({
        name: 'MockEntity',
        tableName: 'mock_entity',
        target: class MockEntity {
        },
        columns: [],
        relations: []
    })),
    driver: {
        options: {
            type: 'postgres',
            database: 'test_db'
        }
    },
    metadataArgsStorage
};
global.TypeORMMetadataArgsStorage = metadataArgsStorage;
//# sourceMappingURL=database.js.map