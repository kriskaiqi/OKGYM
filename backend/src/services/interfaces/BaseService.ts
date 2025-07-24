/**
 * Generic base interface for services
 * Defines standard CRUD operations that should be implemented by services
 * 
 * @typeparam T The entity type
 * @typeparam CreateDto The data transfer object for creating entities
 * @typeparam UpdateDto The data transfer object for updating entities
 * @typeparam FilterDto The data transfer object for filtering entities
 */
export interface BaseService<T, CreateDto, UpdateDto, FilterDto = any> {
  /**
   * Get entities with filtering, pagination, and sorting
   * 
   * @param filters Filter criteria
   * @returns Promise resolving to a tuple with entities array and total count
   */
  getAll(filters?: FilterDto): Promise<[T[], number]>;
  
  /**
   * Get entity by ID
   * 
   * @param id Entity ID
   * @param relations Optional relations to include
   * @returns Promise resolving to the entity or null if not found
   */
  getById(id: string | number, relations?: string[]): Promise<T>;
  
  /**
   * Create a new entity
   * 
   * @param data Entity creation data
   * @returns Promise resolving to the created entity
   */
  create(data: CreateDto): Promise<T>;
  
  /**
   * Update an existing entity
   * 
   * @param id Entity ID
   * @param data Entity update data
   * @returns Promise resolving to the updated entity
   */
  update(id: string | number, data: UpdateDto): Promise<T>;
  
  /**
   * Delete an entity
   * 
   * @param id Entity ID
   * @returns Promise resolving to true if successful
   */
  delete(id: string | number): Promise<boolean>;
} 