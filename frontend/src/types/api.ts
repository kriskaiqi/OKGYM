/**
 * Common API response interfaces
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  count?: number;
}

/**
 * Error response from API
 */
export interface ErrorResponse {
  status: number;
  message: string;
  errors?: string[];
  timestamp?: string;
}

/**
 * Common sort options for API requests
 */
export type SortOrder = 'ASC' | 'DESC';

/**
 * Base filter options for paginated requests
 */
export interface BasePaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export interface ApiErrorDetails {
  field?: string;
  message: string;
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
} 