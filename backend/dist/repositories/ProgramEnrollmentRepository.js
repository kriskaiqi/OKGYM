"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramEnrollmentRepository = void 0;
const typeorm_1 = require("typeorm");
const ProgramEnrollment_1 = require("../models/ProgramEnrollment");
const Enums_1 = require("../models/shared/Enums");
const GenericRepository_1 = require("./GenericRepository");
const typeorm_helpers_1 = require("../utils/typeorm-helpers");
const logger_1 = __importDefault(require("../utils/logger"));
class ProgramEnrollmentRepository extends GenericRepository_1.GenericRepository {
    constructor() {
        super(ProgramEnrollment_1.ProgramEnrollment);
    }
    async findWithFilters(filters) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: this.getRequiredRelations(filters),
                take: filters.limit || 20,
                skip: filters.offset || 0
            });
            if (filters.userId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'user_id', filters.userId);
            }
            if (filters.programId) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'program_id', filters.programId);
            }
            if (filters.status) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'status', filters.status);
            }
            if (filters.startDateMin && filters.startDateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'startDate', (0, typeorm_1.Between)(filters.startDateMin, filters.startDateMax));
            }
            else if (filters.startDateMin) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'startDate', (0, typeorm_1.MoreThan)(filters.startDateMin));
            }
            else if (filters.startDateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'startDate', (0, typeorm_1.LessThan)(filters.startDateMax));
            }
            if (filters.completionDateMin && filters.completionDateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'completionDate', (0, typeorm_1.Between)(filters.completionDateMin, filters.completionDateMax));
            }
            else if (filters.completionDateMin) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'completionDate', (0, typeorm_1.MoreThan)(filters.completionDateMin));
            }
            else if (filters.completionDateMax) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'completionDate', (0, typeorm_1.LessThan)(filters.completionDateMax));
            }
            if (filters.currentWeekMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'currentWeek', (0, typeorm_1.MoreThan)(filters.currentWeekMin));
            }
            if (filters.currentWeekMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'currentWeek', (0, typeorm_1.LessThan)(filters.currentWeekMax));
            }
            if (filters.completedWorkoutsMin !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'completedWorkouts', (0, typeorm_1.MoreThan)(filters.completedWorkoutsMin));
            }
            if (filters.completedWorkoutsMax !== undefined) {
                (0, typeorm_helpers_1.addWhereCondition)(query, 'completedWorkouts', (0, typeorm_1.LessThan)(filters.completedWorkoutsMax));
            }
            if (filters.hasRating !== undefined) {
                if (filters.hasRating) {
                    (0, typeorm_helpers_1.addWhereCondition)(query, 'userRating', (0, typeorm_1.Not)((0, typeorm_1.IsNull)()));
                }
                else {
                    (0, typeorm_helpers_1.addWhereCondition)(query, 'userRating', (0, typeorm_1.IsNull)());
                }
            }
            if (filters.hasFeedback !== undefined) {
                if (filters.hasFeedback) {
                    (0, typeorm_helpers_1.addWhereCondition)(query, 'userFeedback', (0, typeorm_1.Not)((0, typeorm_1.IsNull)()));
                }
                else {
                    (0, typeorm_helpers_1.addWhereCondition)(query, 'userFeedback', (0, typeorm_1.IsNull)());
                }
            }
            if (filters.sortBy) {
                (0, typeorm_helpers_1.addOrderBy)(query, filters.sortBy, filters.sortDirection || 'ASC');
            }
            else {
                (0, typeorm_helpers_1.addOrderBy)(query, 'startDate', 'DESC');
            }
            return await this.repository.findAndCount(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding program enrollments with filters: ${error.message}`, {
                error,
                filters: JSON.stringify(filters)
            });
            throw error;
        }
    }
    getRequiredRelations(filters) {
        const relations = [];
        if (filters.includeUser) {
            relations.push('user');
        }
        if (filters.includeProgram) {
            relations.push('program');
        }
        return relations;
    }
    async findActiveByUser(userId) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: ['program']
            });
            (0, typeorm_helpers_1.addWhereCondition)(query, 'user_id', userId);
            (0, typeorm_helpers_1.addWhereCondition)(query, 'status', Enums_1.EnrollmentStatus.ACTIVE);
            (0, typeorm_helpers_1.addOrderBy)(query, 'startDate', 'DESC');
            return await this.repository.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding active enrollments for user: ${error.message}`, { userId });
            throw error;
        }
    }
    async findByProgram(programId) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: ['user']
            });
            (0, typeorm_helpers_1.addWhereCondition)(query, 'program_id', programId);
            (0, typeorm_helpers_1.addOrderBy)(query, 'status', 'ASC');
            (0, typeorm_helpers_1.addOrderBy)(query, 'startDate', 'DESC');
            return await this.repository.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding enrollments by program: ${error.message}`, { programId });
            throw error;
        }
    }
    async findCompletedByProgram(programId) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: ['user']
            });
            (0, typeorm_helpers_1.addWhereCondition)(query, 'program_id', programId);
            (0, typeorm_helpers_1.addWhereCondition)(query, 'status', Enums_1.EnrollmentStatus.COMPLETED);
            (0, typeorm_helpers_1.addOrderBy)(query, 'completionDate', 'DESC');
            return await this.repository.find(query);
        }
        catch (error) {
            logger_1.default.error(`Error finding completed enrollments by program: ${error.message}`, { programId });
            throw error;
        }
    }
    async updateStatus(enrollmentId, status) {
        try {
            await this.repository.update(enrollmentId, Object.assign({ status }, (status === Enums_1.EnrollmentStatus.COMPLETED ? { completionDate: new Date() } : {})));
            if (status === Enums_1.EnrollmentStatus.COMPLETED) {
                const enrollment = await this.findById(enrollmentId);
                if (enrollment) {
                    const { TrainingProgramRepository } = await Promise.resolve().then(() => __importStar(require('./TrainingProgramRepository')));
                    const programRepo = new TrainingProgramRepository();
                    await programRepo.incrementCompletionCount(enrollment.program_id);
                    await programRepo.updateSuccessRate(enrollment.program_id);
                }
            }
        }
        catch (error) {
            logger_1.default.error(`Error updating enrollment status: ${error.message}`, {
                enrollmentId,
                status
            });
            throw error;
        }
    }
    async incrementCompletedWorkouts(enrollmentId) {
        try {
            await this.repository
                .createQueryBuilder()
                .update()
                .set({
                completedWorkouts: () => "completed_workouts + 1"
            })
                .where("id = :id", { id: enrollmentId })
                .execute();
        }
        catch (error) {
            logger_1.default.error(`Error incrementing completed workouts: ${error.message}`, { enrollmentId });
            throw error;
        }
    }
    async updateCurrentWeek(enrollmentId, currentWeek) {
        try {
            await this.repository.update(enrollmentId, { currentWeek });
        }
        catch (error) {
            logger_1.default.error(`Error updating current week: ${error.message}`, {
                enrollmentId,
                currentWeek
            });
            throw error;
        }
    }
    async saveRatingAndFeedback(enrollmentId, userRating, userFeedback) {
        try {
            await this.repository.update(enrollmentId, Object.assign({ userRating }, (userFeedback ? { userFeedback } : {})));
            const enrollment = await this.findById(enrollmentId);
            if (enrollment) {
                const { TrainingProgramRepository } = await Promise.resolve().then(() => __importStar(require('./TrainingProgramRepository')));
                const programRepo = new TrainingProgramRepository();
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
        }
        catch (error) {
            logger_1.default.error(`Error saving rating and feedback: ${error.message}`, {
                enrollmentId,
                userRating,
                userFeedback
            });
            throw error;
        }
    }
    async getWithFullDetails(enrollmentId) {
        try {
            const query = (0, typeorm_helpers_1.createQueryOptions)({
                relations: ['user', 'program']
            });
            (0, typeorm_helpers_1.addWhereCondition)(query, 'id', enrollmentId);
            return await this.repository.findOne(query);
        }
        catch (error) {
            logger_1.default.error(`Error getting enrollment details: ${error.message}`, { enrollmentId });
            throw error;
        }
    }
}
exports.ProgramEnrollmentRepository = ProgramEnrollmentRepository;
//# sourceMappingURL=ProgramEnrollmentRepository.js.map