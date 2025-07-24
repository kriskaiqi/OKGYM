import { BodyArea, MetricValueType, MeasurementUnit, TrendDirection } from '../../models/shared/Enums';

/**
 * Filter options for querying body metrics
 */
export interface BodyMetricFilters {
    // Common filters
    userId?: string;
    searchTerm?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    includeRelations?: string[];
    
    // Date range filters
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    
    // Value range filters
    valueRange?: {
        min?: number;
        max?: number;
    };
    
    // Entity-specific filters
    bodyArea?: BodyArea | BodyArea[];
    valueType?: MetricValueType;
    unit?: MeasurementUnit;
    source?: string;
    desiredTrend?: TrendDirection;
    hasTarget?: boolean;
    targetMet?: boolean;
} 