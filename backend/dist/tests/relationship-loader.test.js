"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const RelationshipLoader_1 = require("../utils/RelationshipLoader");
const data_source_1 = require("../data-source");
const CacheManager_1 = require("../services/CacheManager");
globals_1.jest.mock('../data-source', () => ({
    AppDataSource: {
        createQueryBuilder: globals_1.jest.fn().mockReturnThis(),
        select: globals_1.jest.fn().mockReturnThis(),
        from: globals_1.jest.fn().mockReturnThis(),
        where: globals_1.jest.fn().mockReturnThis(),
        andWhere: globals_1.jest.fn().mockReturnThis(),
        getRawMany: globals_1.jest.fn()
    }
}));
globals_1.jest.mock('../services/CacheManager', () => ({
    cacheManager: {
        get: globals_1.jest.fn(),
        set: globals_1.jest.fn()
    }
}));
(0, globals_1.describe)('RelationshipLoader', () => {
    let mockRepository;
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        mockRepository = {
            findBy: globals_1.jest.fn().mockResolvedValue([
                { id: '1', name: 'Test Entity 1' },
                { id: '2', name: 'Test Entity 2' }
            ])
        };
        const mockQueryBuilder = data_source_1.AppDataSource.createQueryBuilder;
        mockQueryBuilder.mockReturnValue({
            select: globals_1.jest.fn().mockReturnThis(),
            from: globals_1.jest.fn().mockReturnThis(),
            where: globals_1.jest.fn().mockReturnThis(),
            andWhere: globals_1.jest.fn().mockReturnThis(),
            getRawMany: globals_1.jest.fn().mockResolvedValue([
                { categoryId: '1' },
                { categoryId: '2' }
            ])
        });
    });
    (0, globals_1.describe)('loadRelationship', () => {
        (0, globals_1.it)('should load a relationship without using cache when useCache is false', async () => {
            const entityId = '123';
            const entityName = 'Exercise';
            const relationshipName = 'categories';
            const result = await RelationshipLoader_1.RelationshipLoader.loadRelationship(entityName, relationshipName, entityId, mockRepository, { useCache: false });
            (0, globals_1.expect)(CacheManager_1.cacheManager.get).not.toHaveBeenCalled();
            (0, globals_1.expect)(mockRepository.findBy).toHaveBeenCalled();
            (0, globals_1.expect)(result).toHaveLength(2);
        });
        (0, globals_1.it)('should use cache when available and useCache is true', async () => {
            const entityId = '123';
            const entityName = 'Exercise';
            const relationshipName = 'categories';
            const cachedData = [{ id: '1', name: 'Cached Entity' }];
            CacheManager_1.cacheManager.get.mockResolvedValue(cachedData);
            const result = await RelationshipLoader_1.RelationshipLoader.loadRelationship(entityName, relationshipName, entityId, mockRepository);
            (0, globals_1.expect)(CacheManager_1.cacheManager.get).toHaveBeenCalled();
            (0, globals_1.expect)(mockRepository.findBy).not.toHaveBeenCalled();
            (0, globals_1.expect)(result).toBe(cachedData);
        });
    });
    (0, globals_1.describe)('loadRelationshipBatch', () => {
        (0, globals_1.it)('should load relationships for multiple entities in batch', async () => {
            const entityIds = ['123', '456'];
            const entityName = 'Exercise';
            const relationshipName = 'categories';
            const mockQueryBuilder = data_source_1.AppDataSource.createQueryBuilder;
            mockQueryBuilder.mockReturnValue({
                select: globals_1.jest.fn().mockReturnThis(),
                from: globals_1.jest.fn().mockReturnThis(),
                where: globals_1.jest.fn().mockReturnThis(),
                getRawMany: globals_1.jest.fn().mockResolvedValue([
                    { entity_id: '123', relation_id: '1' },
                    { entity_id: '123', relation_id: '2' },
                    { entity_id: '456', relation_id: '1' }
                ])
            });
            const result = await RelationshipLoader_1.RelationshipLoader.loadRelationshipBatch(entityName, relationshipName, entityIds, mockRepository, { useCache: false });
            (0, globals_1.expect)(result).toBeInstanceOf(Map);
            (0, globals_1.expect)(result.get('123')).toHaveLength(2);
            (0, globals_1.expect)(result.get('456')).toHaveLength(1);
        });
    });
});
//# sourceMappingURL=relationship-loader.test.js.map