import { Between, FindManyOptions, LessThan, MoreThan, IsNull, Not } from 'typeorm';
import { ProgramEnrollment } from '../models/ProgramEnrollment';
import { EnrollmentStatus } from '../models/shared/Enums';
import { GenericRepository } from './GenericRepository';
import { 
    createQueryOptions, 
    addWhereCondition, 
    addOrderBy,
    createRawQuery
} from '../utils/typeorm-helpers';
import logger from '../utils/logger';

/**
 * Filter options for querying program enrollments
 */
export interface ProgramEnrollmentFilters {
    userId?: string;
    programId?: number;
    status?: EnrollmentStatus;
    startDateMin?: Date;
    startDateMax?: Date;
    completionDateMin?: Date;
    completionDateMax?: Date;
    currentWeekMin?: number;
    currentWeekMax?: number;
    completedWorkoutsMin?: number;
    completedWorkoutsMax?: number;
    hasRating?: boolean;
    hasFeedback?: boolean;
    includeUser?: boolean;
    includeProgram?: boolean;
    includeProgress?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

/**
 * Specialized repository for ProgramEnrollment entity
 */
export class ProgramEnrollmentRepository extends GenericRepository<ProgramEnrollment> {
    constructor() {
        super(ProgramEnrollment);
    }

    /**
     * Find program enrollments with detailed filtering options
     */
    async findWithFilters(filters: ProgramEnrollmentFilters): Promise<[ProgramEnrollment[], number]> {
        try {
            const query = createQueryOptions<ProgramEnrollment>({
                relations: this.getRequiredRelations(filters),
                take: filters.limit || 20,
                skip: filters.offset || 0
            });

            // Apply basic filters
            if (filters.userId) {
                addWhereCondition(query, 'user_id', filters.userId);
            }

            if (filters.programId) {
                addWhereCondition(query, 'program_id', filters.programId);
            }

            if (filters.status) {
                addWhereCondition(query, 'status', filters.status);
            }

            // Date range filters for startDate
            if (filters.startDateMin && filters.startDateMax) {
                addWhereCondition(query, 'startDate', Between(filters.startDateMin, filters.startDateMax));
            } else if (filters.startDateMin) {
                addWhereCondition(query, 'startDate', MoreThan(filters.startDateMin));
            } else if (filters.startDateMax) {
                addWhereCondition(query, 'startDate', LessThan(filters.startDateMax));
            }

            // Date range filters for completionDate
            if (filters.completionDateMin && filters.completionDateMax) {
                addWhereCondition(query, 'completionDate', Between(filters.completionDateMin, filters.completionDateMax));
            } else if (filters.completionDateMin) {
                addWhereCondition(query, 'completionDate', MoreThan(filters.completionDateMin));
            } else if (filters.completionDateMax) {
                addWhereCondition(query, 'completionDate', LessThan(filters.completionDateMax));
            }

            // Number range filters
            if (filters.currentWeekMin !== undefined) {
                addWhereCondition(query, 'currentWeek', MoreThan(filters.currentWeekMin));
            }
            
            if (filters.currentWeekMax !== undefined) {
                addWhereCondition(query, 'currentWeek', LessThan(filters.currentWeekMax));
            }
            
            if (filters.completedWorkoutsMin !== undefined) {
                addWhereCondition(query, 'completedWorkouts', MoreThan(filters.completedWorkoutsMin));
            }
            
            if (filters.completedWorkoutsMax !== undefined) {
                addWhereCondition(query, 'completedWorkouts', LessThan(filters.completedWorkoutsMax));
            }

            // Has rating filter
            if (filters.hasRating !== undefined) {
                if (filters.hasRating) {
                    addWhereCondition(query, 'userRating', Not(IsNull()));
                } else {
                    addWhereCondition(query, 'userRating', IsNull());
                }
            }

            // Has feedback filter
            if (filters.hasFeedback !== undefined) {
                if (filters.hasFeedback) {
                    addWhereCondition(query, 'userFeedback', Not(IsNull()));
                } else {
                    addWhereCondition(query, 'userFeedback', IsNull());
                }
            }

            // Apply sorting
            if (filters.sortBy) {
                addOrderBy(query, filters.sortBy, filters.sortDirection || 'ASC');
            } else {
                // Default sort by start date descending
                addOrderBy(query, 'startDate', 'DESC');
            }

            return await this.repository.findAndCount(query);
        } catch (error) {
            logger.error(`Error finding program enrollments with filters: ${error.message}`, { 
                error, 
                filters: JSON.stringify(filters) 
            });
            throw error;
        }
    }

    /**
     * Helper method to determine which relations to load based on filter needs
     */
    private getRequiredRelations(filters: ProgramEnrollmentFilters): string[] {
        const relations: string[] = [];
        
        if (filters.includeUser) {
            relations.push('user');
        }
        
        if (filters.includeProgram) {
            relations.push('program');
        }
        
        return relations;
    }

    /**
     * Find active enrollments for a user
     */
    async findActiveByUser(userId: string): Promise<ProgramEnrollment[]> {
        try {
            const query = createQueryOptions<ProgramEnrollment>({
                relations: ['program']
            });
            
            addWhereCondition(query, 'user_id', userId);
            addWhereCondition(query, 'status', EnrollmentStatus.ACTIVE);
            addOrderBy(query, 'startDate', 'DESC');
            
            return await this.repository.find(query);
        } catch (error) {
            logger.error(`Error finding active enrollments for user: ${error.message}`, { userId });
            throw error;
        }
    }

    /**
     * Find all enrollments for a program
     */
    async findByProgram(programId: number): Promise<ProgramEnrollment[]> {
        try {
            const query = createQueryOptions<ProgramEnrollment>({
                relations: ['user']
            });
            
            addWhereCondition(query, 'program_id', programId);
            addOrderBy(query, 'status', 'ASC');
            addOrderBy(query, 'startDate', 'DESC');
            
            return await this.repository.find(query);
        } catch (error) {
            logger.error(`Error finding enrollments by program: ${error.message}`, { programId });
            throw error;
        }
    }

    /**
     * Find completed enrollments for a program
     */
    async findCompletedByProgram(programId: number): Promise<ProgramEnrollment[]> {
        try {
            const query = createQueryOptions<ProgramEnrollment>({
                relations: ['user']
            });
            
            addWhereCondition(query, 'program_id', programId);
            addWhereCondition(query, 'status', EnrollmentStatus.COMPLETED);
            addOrderBy(query, 'completionDate', 'DESC');
            
            return await this.repository.find(query);
        } catch (error) {
            logger.error(`Error finding completed enrollments by program: ${error.message}`, { programId });
            throw error;
        }
    }

    /**
     * Update enrollment status
     */
    async updateStatus(enrollmentId: number, status: EnrollmentStatus): Promise<void> {
        try {
            await this.repository.update(enrollmentId, { 
                status,
                ...(status === EnrollmentStatus.COMPLETED ? { completionDate: new Date() } : {})
            });
            
            // If completing, increment program completion count
            if (status === EnrollmentStatus.COMPLETED) {
                const enrollment = await this.findById(enrollmentId);
                if (enrollment) {
                    // Get the TrainingProgramRepository to update the completion count
                    const { TrainingProgramRepository } = await import('./TrainingProgramRepository');
                    const programRepo = new TrainingProgramRepository();
                    await programRepo.incrementCompletionCount(enrollment.program_id);
                    await programRepo.updateSuccessRate(enrollment.program_id);
                }
            }
        } catch (error) {
            logger.error(`Error updating enrollment status: ${error.message}`, { 
                enrollmentId, 
                status 
            });
            throw error;
        }
    }

    /**
     * Update completed workouts count
     */
    async incrementCompletedWorkouts(enrollmentId: number): Promise<void> {
        try {
            await this.repository
                .createQueryBuilder()
                .update()
                .set({
                    completedWorkouts: () => "completed_workouts + 1"
                })
                .where("id = :id", { id: enrollmentId })
                .execute();
        } catch (error) {
            logger.error(`Error incrementing completed workouts: ${error.message}`, { enrollmentId });
            throw error;
        }
    }

    /**
     * Update current week
     */
    async updateCurrentWeek(enrollmentId: number, currentWeek: number): Promise<void> {
        try {
            await this.repository.update(enrollmentId, { currentWeek });
        } catch (error) {
            logger.error(`Error updating current week: ${error.message}`, { 
                enrollmentId, 
                currentWeek 
            });
            throw error;
        }
    }

    /**
     * Save user's rating and feedback
     */
    async saveRatingAndFeedback(enrollmentId: number, userRating: number, userFeedback?: string): Promise<void> {
        try {
            await this.repository.update(enrollmentId, { 
                userRating,
                ...(userFeedback ? { userFeedback } : {})
            });
            
            // Update program rating
            const enrollment = await this.findById(enrollmentId);
            if (enrollment) {
                // Get the repository to update program rating
                const { TrainingProgramRepository } = await import('./TrainingProgramRepository');
                const programRepo = new TrainingProgramRepository();
                
                // In a real implementation, you would calculate the average rating
                // Here we're just simulating it by updating directly
                const program = await programRepo.findById(enrollment.program_id);
                if (program) {
                    const totalRatings = program.ratingCount + 1;
                    const newRating = ((program.rating * program.ratingCount) + userRating) / totalRatings;
                    
                    await programRepo.update(program.id, {
                        rating: newRating,
                        ratingCount: totalRatings
                    });
                }
            }
        } catch (error) {
            logger.error(`Error saving rating and feedback: ${error.message}`, { 
                enrollmentId, 
                userRating,
                userFeedback 
            });
            throw error;
        }
    }

    /**
     * Get enrollment with full details
     */
    async getWithFullDetails(enrollmentId: number): Promise<ProgramEnrollment | null> {
        try {
            const query = createQueryOptions<ProgramEnrollment>({
                relations: ['user', 'program']
            });
            
            addWhereCondition(query, 'id', enrollmentId);
            
            return await this.repository.findOne(query);
        } catch (error) {
            logger.error(`Error getting enrollment details: ${error.message}`, { enrollmentId });
            throw error;
        }
    }
} 