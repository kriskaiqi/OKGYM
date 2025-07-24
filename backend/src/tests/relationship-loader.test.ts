import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { RelationshipLoader } from '../utils/RelationshipLoader';
import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { cacheManager } from '../services/CacheManager';

// Mock AppDataSource and cacheManager
jest.mock('../data-source', () => ({
  AppDataSource: {
    createQueryBuilder: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawMany: jest.fn()
  }
}));

jest.mock('../services/CacheManager', () => ({
  cacheManager: {
    get: jest.fn(),
    set: jest.fn()
  }
}));

describe('RelationshipLoader', () => {
  let mockRepository: Partial<Repository<any>>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a mock repository
    mockRepository = {
      findBy: jest.fn().mockResolvedValue([
        { id: '1', name: 'Test Entity 1' },
        { id: '2', name: 'Test Entity 2' }
      ])
    };

    // Setup AppDataSource mock for this test
    const mockQueryBuilder: any = AppDataSource.createQueryBuilder as jest.Mock;
    mockQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { categoryId: '1' },
        { categoryId: '2' }
      ])
    });
  });

  describe('loadRelationship', () => {
    it('should load a relationship without using cache when useCache is false', async () => {
      // Setup
      const entityId = '123';
      const entityName = 'Exercise';
      const relationshipName = 'categories';
      
      // Act
      const result = await RelationshipLoader.loadRelationship(
        entityName,
        relationshipName,
        entityId,
        mockRepository as Repository<any>,
        { useCache: false }
      );
      
      // Assert
      expect(cacheManager.get).not.toHaveBeenCalled();
      expect(mockRepository.findBy).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
    
    it('should use cache when available and useCache is true', async () => {
      // Setup
      const entityId = '123';
      const entityName = 'Exercise';
      const relationshipName = 'categories';
      const cachedData = [{ id: '1', name: 'Cached Entity' }];
      
      // Mock cache hit
      (cacheManager.get as jest.Mock).mockResolvedValue(cachedData);
      
      // Act
      const result = await RelationshipLoader.loadRelationship(
        entityName,
        relationshipName,
        entityId,
        mockRepository as Repository<any>
      );
      
      // Assert
      expect(cacheManager.get).toHaveBeenCalled();
      expect(mockRepository.findBy).not.toHaveBeenCalled();
      expect(result).toBe(cachedData);
    });
  });
  
  describe('loadRelationshipBatch', () => {
    it('should load relationships for multiple entities in batch', async () => {
      // Setup
      const entityIds = ['123', '456'];
      const entityName = 'Exercise';
      const relationshipName = 'categories';
      
      // Mock the raw query results
      const mockQueryBuilder: any = AppDataSource.createQueryBuilder as jest.Mock;
      mockQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { entity_id: '123', relation_id: '1' },
          { entity_id: '123', relation_id: '2' },
          { entity_id: '456', relation_id: '1' }
        ])
      });
      
      // Act
      const result = await RelationshipLoader.loadRelationshipBatch(
        entityName,
        relationshipName,
        entityIds,
        mockRepository as Repository<any>,
        { useCache: false }
      );
      
      // Assert
      expect(result).toBeInstanceOf(Map);
      expect(result.get('123')).toHaveLength(2);
      expect(result.get('456')).toHaveLength(1);
    });
  });
}); 