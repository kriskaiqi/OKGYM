import { Request, Response, NextFunction } from 'express';
// This is a template file, so we comment out the service import that doesn't exist yet
// import { EntityNameService } from '../../services/EntityNameService';
import { handleApiError } from '../../utils/error-handler';
import { formatResponse } from '../../utils/response-formatter';

/**
 * Template for entity controller implementation
 * Replace EntityName with the actual entity name
 */
export class EntityNameController {
  private service: any; // EntityNameService;

  constructor() {
    // Commented out since this is a template
    // this.service = new EntityNameService();
    this.service = {}; // Placeholder
  }

  /**
   * Get all entities with filtering
   */
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      // Add pagination params to filters
      const paginatedFilters = {
        ...filters,
        limit,
        offset: (page - 1) * limit
      };
      
      const [entities, total] = await this.service.getAll(paginatedFilters);
      
      // Use formatResponse instead of formatPaginatedResponse
      return formatResponse(res, {
        data: entities,
        metadata: {
          page,
          pageSize: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total
        }
      });
    } catch (error) {
      return handleApiError(error, req, res);
    }
  };

  /**
   * Get entity by ID
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const relations = req.query.include?.toString().split(',') || [];
      
      const entity = await this.service.getById(id, relations);
      
      // Use formatResponse instead of formatSuccessResponse
      return formatResponse(res, { data: entity });
    } catch (error) {
      return handleApiError(error, req, res);
    }
  };

  /**
   * Create entity
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const entity = await this.service.create(data);
      
      // Use formatResponse instead of formatSuccessResponse
      return formatResponse(res, { 
        data: entity,
        message: 'Entity created successfully'
      }, 201);
    } catch (error) {
      return handleApiError(error, req, res);
    }
  };

  /**
   * Update entity
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const data = req.body;
      
      const entity = await this.service.update(id, data);
      
      // Use formatResponse instead of formatSuccessResponse
      return formatResponse(res, { 
        data: entity,
        message: 'Entity updated successfully'
      });
    } catch (error) {
      return handleApiError(error, req, res);
    }
  };

  /**
   * Delete entity
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      
      await this.service.delete(id);
      
      // Use formatResponse instead of formatSuccessResponse
      return formatResponse(res, { 
        message: 'Entity deleted successfully'
      });
    } catch (error) {
      return handleApiError(error, req, res);
    }
  };

  /**
   * Example of a custom endpoint for a domain-specific operation
   */
  performComplexOperation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const operationData = req.body;
      
      const result = await this.service.performComplexOperation(id, operationData);
      
      // Use formatResponse instead of formatSuccessResponse
      return formatResponse(res, { 
        data: result,
        message: 'Operation completed successfully'
      });
    } catch (error) {
      return handleApiError(error, req, res);
    }
  };
} 