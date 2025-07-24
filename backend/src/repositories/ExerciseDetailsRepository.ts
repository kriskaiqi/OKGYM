import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not } from 'typeorm';
import { ExerciseDetails } from '../models/ExerciseDetails';
import { GenericRepository } from './GenericRepository';
import { createQueryOptions, addWhereCondition } from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying exercise details
 */
export interface ExerciseDetailsFilters {
    exerciseId?: string;
    minOverallScore?: number;
    maxOverallScore?: number;
    minRepCount?: number;
    maxRepCount?: number;
    minConfidenceScore?: number;
    maxConfidenceScore?: number;
    hasFormAnalysis?: boolean;
    hasRepData?: boolean;
    hasRawData?: boolean;
    analyzedMinDate?: Date;
    analyzedMaxDate?: Date;
    createdMinDate?: Date;
    createdMaxDate?: Date;
    updatedMinDate?: Date;
    updatedMaxDate?: Date;
    includeExercise?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for ExerciseDetails entity
 */
export class ExerciseDetailsRepository extends GenericRepository<ExerciseDetails> {
    constructor() {
        super(ExerciseDetails);
    }

    /**
     * Find exercise details with detailed filtering options
     */
    async findWithFilters(filters: ExerciseDetailsFilters): Promise<[ExerciseDetails[], number]> {
        try {
            const queryOptions: FindManyOptions<ExerciseDetails> = createQueryOptions<ExerciseDetails>({});

            // Set pagination
            queryOptions.take = filters.limit || 20;
            queryOptions.skip = filters.offset || 0;
            
            // Set sorting
            queryOptions.order = filters.sortBy 
                ? { [filters.sortBy]: filters.sortDirection || 'DESC' } 
                : { updated_at: 'DESC' };

            // Add relations if needed
            if (filters.includeExercise) {
                queryOptions.relations = ['exercise'];
            }

            // Apply basic filters
            if (filters.exerciseId) {
                addWhereCondition(queryOptions, 'exercise_id', filters.exerciseId);
            }

            // Confidence score range filters
            if (filters.minConfidenceScore !== undefined && filters.maxConfidenceScore !== undefined) {
                addWhereCondition(queryOptions, 'confidenceScore', 
                    Between(filters.minConfidenceScore, filters.maxConfidenceScore));
            } else if (filters.minConfidenceScore !== undefined) {
                addWhereCondition(queryOptions, 'confidenceScore', 
                    MoreThan(filters.minConfidenceScore));
            } else if (filters.maxConfidenceScore !== undefined) {
                addWhereCondition(queryOptions, 'confidenceScore', 
                    LessThan(filters.maxConfidenceScore));
            }

            // Analyzed date range filters
            if (filters.analyzedMinDate && filters.analyzedMaxDate) {
                addWhereCondition(queryOptions, 'analyzedAt', 
                    Between(filters.analyzedMinDate, filters.analyzedMaxDate));
            } else if (filters.analyzedMinDate) {
                addWhereCondition(queryOptions, 'analyzedAt', 
                    MoreThan(filters.analyzedMinDate));
            } else if (filters.analyzedMaxDate) {
                addWhereCondition(queryOptions, 'analyzedAt', 
                    LessThan(filters.analyzedMaxDate));
            }

            // Created date range filters
            if (filters.createdMinDate && filters.createdMaxDate) {
                addWhereCondition(queryOptions, 'created_at', 
                    Between(filters.createdMinDate, filters.createdMaxDate));
            } else if (filters.createdMinDate) {
                addWhereCondition(queryOptions, 'created_at', 
                    MoreThan(filters.createdMinDate));
            } else if (filters.createdMaxDate) {
                addWhereCondition(queryOptions, 'created_at', 
                    LessThan(filters.createdMaxDate));
            }

            // Updated date range filters
            if (filters.updatedMinDate && filters.updatedMaxDate) {
                addWhereCondition(queryOptions, 'updated_at', 
                    Between(filters.updatedMinDate, filters.updatedMaxDate));
            } else if (filters.updatedMinDate) {
                addWhereCondition(queryOptions, 'updated_at', 
                    MoreThan(filters.updatedMinDate));
            } else if (filters.updatedMaxDate) {
                addWhereCondition(queryOptions, 'updated_at', 
                    LessThan(filters.updatedMaxDate));
            }

            // JSON field filters will be applied after initial query
            const details = await this.repository.findAndCount(queryOptions);
            
            // Apply JSON field filters manually for more complex conditions
            if (filters.hasFormAnalysis !== undefined || 
                filters.minOverallScore !== undefined || 
                filters.maxOverallScore !== undefined ||
                filters.hasRepData !== undefined ||
                filters.minRepCount !== undefined ||
                filters.maxRepCount !== undefined ||
                filters.hasRawData !== undefined) {
                
                const [items, count] = details;
                const filteredItems = items.filter(item => {
                    // Form analysis filters
                    if (filters.hasFormAnalysis !== undefined) {
                        if (filters.hasFormAnalysis && !item.formAnalysis) {
                            return false;
                        } else if (!filters.hasFormAnalysis && item.formAnalysis) {
                            return false;
                        }
                    }

                    if (item.formAnalysis) {
                        if (filters.minOverallScore !== undefined && 
                            item.formAnalysis.overallScore < filters.minOverallScore) {
                            return false;
                        }

                        if (filters.maxOverallScore !== undefined && 
                            item.formAnalysis.overallScore > filters.maxOverallScore) {
                            return false;
                        }
                    } else if (filters.minOverallScore !== undefined || filters.maxOverallScore !== undefined) {
                        return false;
                    }

                    // Rep data filters
                    if (filters.hasRepData !== undefined) {
                        if (filters.hasRepData && !item.repData) {
                            return false;
                        } else if (!filters.hasRepData && item.repData) {
                            return false;
                        }
                    }

                    if (item.repData) {
                        if (filters.minRepCount !== undefined && 
                            item.repData.count < filters.minRepCount) {
                            return false;
                        }

                        if (filters.maxRepCount !== undefined && 
                            item.repData.count > filters.maxRepCount) {
                            return false;
                        }
                    } else if (filters.minRepCount !== undefined || filters.maxRepCount !== undefined) {
                        return false;
                    }

                    // Raw data filters
                    if (filters.hasRawData !== undefined) {
                        if (filters.hasRawData && !item.rawData) {
                            return false;
                        } else if (!filters.hasRawData && item.rawData) {
                            return false;
                        }
                    }

                    return true;
                });

                return [filteredItems, filteredItems.length];
            }

            return details;
        } catch (error) {
            logger.error('Error in ExerciseDetailsRepository.findWithFilters', { error, filters });
            throw error;
        }
    }

    /**
     * Find latest details for an exercise
     */
    async findLatestForExercise(exerciseId: string): Promise<ExerciseDetails | null> {
        try {
            const queryOptions: FindManyOptions<ExerciseDetails> = createQueryOptions<ExerciseDetails>({});
            
            // Set limit and sorting
            queryOptions.take = 1;
            queryOptions.order = { analyzedAt: 'DESC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'exercise_id', exerciseId);

            const results = await this.repository.find(queryOptions);
            return results.length > 0 ? results[0] : null;
        } catch (error) {
            logger.error('Error in ExerciseDetailsRepository.findLatestForExercise', { error, exerciseId });
            throw error;
        }
    }

    /**
     * Find details with feedback
     */
    async findWithFeedback(exerciseId: string): Promise<ExerciseDetails[]> {
        try {
            // Perform raw query to filter by JSON field existence
            const result = await this.repository.find({
                where: { 
                    exercise_id: exerciseId 
                },
                order: { analyzedAt: 'DESC' }
            });

            // Filter results with feedback manually
            return result.filter(detail => 
                detail.formAnalysis && 
                detail.formAnalysis.feedback && 
                detail.formAnalysis.feedback.length > 0
            );
        } catch (error) {
            logger.error('Error in ExerciseDetailsRepository.findWithFeedback', { error, exerciseId });
            throw error;
        }
    }

    /**
     * Analyze form score progression over time
     */
    async getFormScoreProgression(exerciseId: string, limit: number = 20): Promise<any> {
        try {
            const queryOptions: FindManyOptions<ExerciseDetails> = createQueryOptions<ExerciseDetails>({});
            
            // Set pagination and sorting
            queryOptions.take = limit;
            queryOptions.order = { analyzedAt: 'ASC' };

            // Add where conditions
            addWhereCondition(queryOptions, 'exercise_id', exerciseId);

            const details = await this.repository.find(queryOptions);
            
            // Extract score and date information
            const progression = details
                .filter(detail => detail.formAnalysis && detail.formAnalysis.overallScore !== undefined)
                .map(detail => ({
                    date: detail.analyzedAt,
                    score: detail.formAnalysis!.overallScore,
                    confidenceScore: detail.confidenceScore,
                    repCount: detail.repData ? detail.repData.count : 0,
                    id: detail.id
                }));
            
            // Calculate statistics
            let stats: any = { dataPoints: progression.length };
            if (progression.length > 0) {
                const scores = progression.map(p => p.score);
                stats.minScore = Math.min(...scores);
                stats.maxScore = Math.max(...scores);
                stats.avgScore = scores.reduce((sum, val) => sum + val, 0) / scores.length;
                
                // Calculate improvement
                if (progression.length >= 2) {
                    const firstScore = progression[0].score;
                    const lastScore = progression[progression.length - 1].score;
                    stats.improvement = lastScore - firstScore;
                    stats.improvementPercent = (stats.improvement / firstScore) * 100;
                }
            }
            
            return {
                progression,
                stats
            };
        } catch (error) {
            logger.error('Error in ExerciseDetailsRepository.getFormScoreProgression', { error, exerciseId, limit });
            throw error;
        }
    }

    /**
     * Get common issues from exercise details
     */
    async getCommonIssues(exerciseId: string): Promise<any> {
        try {
            const details = await this.repository.find({
                where: { exercise_id: exerciseId }
            });
            
            // Collect all issues
            const issueOccurrences: Record<string, number> = {};
            let totalIssues = 0;
            
            details.forEach(detail => {
                if (detail.formAnalysis && detail.formAnalysis.detectedIssues) {
                    detail.formAnalysis.detectedIssues.forEach((issue: string) => {
                        issueOccurrences[issue] = (issueOccurrences[issue] || 0) + 1;
                        totalIssues++;
                    });
                }
            });
            
            // Convert to array and sort by frequency
            const issues = Object.entries(issueOccurrences)
                .map(([issue, count]) => ({
                    issue,
                    count,
                    frequency: (count / details.length) * 100
                }))
                .sort((a, b) => b.count - a.count);
            
            return {
                issues,
                totalIssues,
                totalDetails: details.length,
                averageIssuesPerSession: totalIssues / details.length
            };
        } catch (error) {
            logger.error('Error in ExerciseDetailsRepository.getCommonIssues', { error, exerciseId });
            throw error;
        }
    }

    /**
     * Create exercise details with tracking data
     */
    async createWithTrackingData(
        exerciseId: string, 
        formAnalysis: any, 
        repData: any, 
        rawData: any,
        confidenceScore: number = 0.8
    ): Promise<ExerciseDetails> {
        try {
            const exerciseDetail = this.repository.create({
                exercise_id: exerciseId,
                formAnalysis,
                repData,
                rawData,
                confidenceScore,
                analyzedAt: new Date()
            });
            
            return await this.repository.save(exerciseDetail);
        } catch (error) {
            logger.error('Error in ExerciseDetailsRepository.createWithTrackingData', 
                { error, exerciseId, confidenceScore });
            throw error;
        }
    }

    /**
     * Update form analysis for existing detail
     */
    async updateFormAnalysis(detailId: string, formAnalysis: any): Promise<ExerciseDetails> {
        try {
            const detail = await this.repository.findOne({
                where: { id: detailId }
            });
            
            if (!detail) {
                throw new Error(`Exercise detail with ID ${detailId} not found`);
            }
            
            detail.formAnalysis = formAnalysis;
            
            return await this.repository.save(detail);
        } catch (error) {
            logger.error('Error in ExerciseDetailsRepository.updateFormAnalysis', { error, detailId });
            throw error;
        }
    }

    /**
     * Remove raw data from old details to save space
     */
    async removeRawDataFromOldDetails(exerciseId: string, keepCount: number = 3): Promise<number> {
        try {
            // Get all details for the exercise, sorted from newest to oldest
            const details = await this.repository.find({
                where: { exercise_id: exerciseId },
                order: { analyzedAt: 'DESC' }
            });
            
            // Skip if there are not enough details
            if (details.length <= keepCount) {
                return 0;
            }
            
            // Get the details to modify (all but the most recent keepCount)
            const detailsToModify = details.slice(keepCount);
            
            // Count details with raw data
            const detailsWithRawData = detailsToModify.filter(d => d.rawData !== null);
            
            // Update details to remove raw data
            if (detailsWithRawData.length > 0) {
                for (const detail of detailsWithRawData) {
                    // Replace null with an empty object that satisfies the type requirements
                    detail.rawData = { timestamps: [] };
                }
                
                await this.repository.save(detailsWithRawData);
            }
            
            return detailsWithRawData.length;
        } catch (error) {
            logger.error('Error in ExerciseDetailsRepository.removeRawDataFromOldDetails', 
                { error, exerciseId, keepCount });
            throw error;
        }
    }
} 