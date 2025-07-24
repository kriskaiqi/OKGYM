import { DeleteResult, EntityTarget, FindManyOptions, FindOneOptions, Repository, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { AppDataSource } from '../data-source';
import { BaseRepository } from './BaseRepository';
import logger from '../utils/logger';

/**
 * Generic implementation of the BaseRepository interface
 * Provides common CRUD operations for any entity type
 */
export class GenericRepository<T extends ObjectLiteral> implements BaseRepository<T> {
    protected repository: Repository<T>;

    constructor(entityClass: EntityTarget<T>) {
        this.repository = AppDataSource.getRepository(entityClass);
    }

    async findById(id: string | number): Promise<T | null> {
        return this.repository.findOneBy({ id } as any);
    }

    async findByIds(ids: (string | number)[]): Promise<T[]> {
        return this.repository.findByIds(ids as any);
    }

    async find(options?: FindManyOptions<T>): Promise<T[]> {
        return this.repository.find(options || {});
    }

    async findOne(options: FindOneOptions<T>): Promise<T | null> {
        return this.repository.findOne(options);
    }

    async count(options?: FindManyOptions<T>): Promise<number> {
        return this.repository.count(options || {});
    }

    async create(data: Partial<T>): Promise<T> {
        const entity = this.repository.create(data as any);
        const result = await this.repository.save(entity);
        return result as unknown as T;
    }

    async update(id: string | number, data: Partial<T>): Promise<T | null> {
        await this.repository.update(id, data as any);
        return this.findById(id);
    }

    async delete(id: string | number): Promise<DeleteResult> {
        return this.repository.delete(id);
    }

    /**
     * Save one or more entities
     * @param entity Entity or entities to save
     * @returns The saved entity/entities
     */
    async save(entity: T | T[]): Promise<T | T[]> {
        return this.repository.save(entity as any);
    }
} 