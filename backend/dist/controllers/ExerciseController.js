"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseController = void 0;
const ExerciseService_1 = require("../services/ExerciseService");
const errors_1 = require("../utils/errors");
const Exercise_1 = require("../models/Exercise");
const ExerciseCategory_1 = require("../models/ExerciseCategory");
const Equipment_1 = require("../models/Equipment");
const Media_1 = require("../models/Media");
const ExerciseRelation_1 = require("../models/ExerciseRelation");
const logger_1 = __importDefault(require("../utils/logger"));
const data_source_1 = require("../data-source");
class ExerciseController {
    constructor(exerciseService) {
        if (exerciseService) {
            this.exerciseService = exerciseService;
        }
        else {
            const exerciseRepository = data_source_1.AppDataSource.getRepository(Exercise_1.Exercise);
            const categoryRepository = data_source_1.AppDataSource.getRepository(ExerciseCategory_1.ExerciseCategory);
            const equipmentRepository = data_source_1.AppDataSource.getRepository(Equipment_1.Equipment);
            const mediaRepository = data_source_1.AppDataSource.getRepository(Media_1.Media);
            const relationRepository = data_source_1.AppDataSource.getRepository(ExerciseRelation_1.ExerciseRelation);
            const { cacheManager } = require('../services/CacheManager');
            this.exerciseService = new ExerciseService_1.ExerciseService(exerciseRepository, categoryRepository, equipmentRepository, mediaRepository, relationRepository, cacheManager);
            logger_1.default.info('ExerciseService initialized successfully in ExerciseController');
        }
    }
    async createExercise(req, res) {
        try {
            const exercise = await this.exerciseService.createExercise(req.body);
            return res.status(201).json({
                success: true,
                data: exercise
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to create exercise'
            });
        }
    }
    async getExerciseById(req, res) {
        try {
            const { id } = req.params;
            const exercise = await this.exerciseService.getExerciseById(id);
            if (!exercise) {
                return res.status(404).json({
                    success: false,
                    error: 'Exercise not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: exercise
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve exercise'
            });
        }
    }
    async updateExercise(req, res) {
        try {
            const { id } = req.params;
            const updatedExercise = await this.exerciseService.updateExercise(id, req.body);
            return res.status(200).json({
                success: true,
                data: updatedExercise
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to update exercise'
            });
        }
    }
    async deleteExercise(req, res) {
        try {
            const { id } = req.params;
            await this.exerciseService.deleteExercise(id);
            return res.status(200).json({
                success: true,
                message: 'Exercise deleted successfully'
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to delete exercise'
            });
        }
    }
    async getAllExercises(req, res) {
        try {
            if (!data_source_1.AppDataSource.isInitialized) {
                logger_1.default.error('Database connection not initialized in getAllExercises');
                return res.status(500).json({
                    success: false,
                    error: 'Database connection not available',
                    details: 'The application is still initializing, please try again in a moment'
                });
            }
            try {
                const [exercises, count] = await this.exerciseService.getAllExercises(req.query);
                logger_1.default.debug(`Retrieved ${exercises.length} exercises out of ${count} total`);
                return res.status(200).json({
                    success: true,
                    data: exercises,
                    count,
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 20
                });
            }
            catch (serviceError) {
                logger_1.default.error('Exercise service error in getAllExercises', {
                    error: serviceError instanceof Error ? {
                        message: serviceError.message,
                        name: serviceError.name,
                        stack: serviceError.stack
                    } : serviceError,
                    query: req.query
                });
                if (serviceError instanceof errors_1.AppError) {
                    return res.status(serviceError.statusCode).json({
                        success: false,
                        error: serviceError.message,
                        details: serviceError.details || {},
                        code: serviceError.type
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve exercises',
                    details: serviceError instanceof Error ? serviceError.message : 'Unknown service error'
                });
            }
        }
        catch (error) {
            logger_1.default.error('Unhandled error in getAllExercises controller', {
                error: error instanceof Error ? {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                } : error
            });
            return res.status(500).json({
                success: false,
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'An unexpected error occurred'
            });
        }
    }
    getMockExercises() {
        return [
            {
                id: "mock-1",
                name: "Push-Up",
                description: "A classic bodyweight exercise for upper body strength",
                measurementType: "REPS",
                types: ["STRENGTH"],
                level: "BEGINNER",
                muscleGroups: ["CHEST", "SHOULDERS", "TRICEPS"],
                equipment: [],
                estimatedDuration: 60,
                calories: 8,
                instructions: ["Start in plank position", "Lower body to ground", "Push back up"],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: "mock-2",
                name: "Squat",
                description: "A fundamental lower body exercise",
                measurementType: "REPS",
                types: ["STRENGTH"],
                level: "BEGINNER",
                muscleGroups: ["QUADS", "GLUTES", "HAMSTRINGS"],
                equipment: [],
                estimatedDuration: 60,
                calories: 8,
                instructions: ["Stand with feet shoulder-width apart", "Lower body as if sitting", "Rise back to standing"],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: "mock-3",
                name: "Plank",
                description: "Core stabilization exercise",
                measurementType: "TIME",
                types: ["CORE", "ISOMETRIC"],
                level: "BEGINNER",
                muscleGroups: ["CORE", "SHOULDERS"],
                equipment: [],
                estimatedDuration: 30,
                calories: 5,
                instructions: ["Start in push-up position on forearms", "Keep body straight", "Hold position"],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
    }
    async getExerciseCategories(req, res) {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
            const [categories, total] = await this.exerciseService.getExerciseCategories({ page, limit });
            return res.status(200).json({
                success: true,
                count: total,
                data: categories,
                page,
                limit
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve categories'
            });
        }
    }
    async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await this.exerciseService.getCategoryById(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    error: 'Category not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: category
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve category'
            });
        }
    }
    async createCategory(req, res) {
        try {
            const category = await this.exerciseService.createCategory(req.body);
            return res.status(201).json({
                success: true,
                data: category
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to create category'
            });
        }
    }
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const category = await this.exerciseService.updateCategory(id, req.body);
            return res.status(200).json({
                success: true,
                data: category
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to update category'
            });
        }
    }
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            await this.exerciseService.deleteCategory(id);
            return res.status(200).json({
                success: true,
                message: 'Category deleted successfully'
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to delete category'
            });
        }
    }
    async getExercisesByCategory(req, res) {
        try {
            const { id } = req.params;
            const filterOptions = this.parseFilterOptions(req.query);
            const [exercises, total] = await this.exerciseService.findExercisesByCategory(id, filterOptions);
            return res.status(200).json({
                success: true,
                count: total,
                data: exercises,
                page: filterOptions.page || 1,
                limit: filterOptions.limit || 20
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve exercises by category'
            });
        }
    }
    async getAllEquipment(req, res) {
        try {
            const filterOptions = this.parseFilterOptions(req.query);
            if (!filterOptions.page)
                filterOptions.page = 1;
            if (!filterOptions.limit)
                filterOptions.limit = 20;
            console.log('Equipment filter options:', filterOptions);
            const [equipment, total] = await this.exerciseService.getAllEquipment(filterOptions);
            return res.status(200).json({
                success: true,
                count: total,
                data: equipment,
                page: filterOptions.page,
                limit: filterOptions.limit
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve equipment'
            });
        }
    }
    async getEquipmentById(req, res) {
        try {
            const { id } = req.params;
            const equipment = await this.exerciseService.getEquipmentById(id);
            if (!equipment) {
                return res.status(404).json({
                    success: false,
                    error: 'Equipment not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: equipment
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve equipment'
            });
        }
    }
    async createEquipment(req, res) {
        try {
            const equipment = await this.exerciseService.createEquipment(req.body);
            return res.status(201).json({
                success: true,
                data: equipment
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to create equipment'
            });
        }
    }
    async updateEquipment(req, res) {
        try {
            const { id } = req.params;
            const equipment = await this.exerciseService.updateEquipment(id, req.body);
            return res.status(200).json({
                success: true,
                data: equipment
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to update equipment'
            });
        }
    }
    async deleteEquipment(req, res) {
        try {
            const { id } = req.params;
            await this.exerciseService.deleteEquipment(id);
            return res.status(200).json({
                success: true,
                message: 'Equipment deleted successfully'
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to delete equipment'
            });
        }
    }
    async getExercisesByEquipment(req, res) {
        try {
            const { id } = req.params;
            const filterOptions = this.parseFilterOptions(req.query);
            const [exercises, total] = await this.exerciseService.findExercisesByEquipment(id, filterOptions);
            return res.status(200).json({
                success: true,
                count: total,
                data: exercises,
                page: filterOptions.page || 1,
                limit: filterOptions.limit || 20
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve exercises by equipment'
            });
        }
    }
    async searchExercises(req, res) {
        try {
            const searchQuery = req.query.q;
            if (!searchQuery) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required'
                });
            }
            const filterOptions = this.parseFilterOptions(req.query);
            const [exercises, total] = await this.exerciseService.searchExercises(searchQuery, filterOptions);
            return res.status(200).json({
                success: true,
                count: total,
                data: exercises,
                page: filterOptions.page || 1,
                limit: filterOptions.limit || 20
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to search exercises'
            });
        }
    }
    async getExercisesByMuscleGroup(req, res) {
        try {
            const { muscleGroup } = req.params;
            const filterOptions = this.parseFilterOptions(req.query);
            const [exercises, total] = await this.exerciseService.getExercisesByMuscleGroup(muscleGroup, filterOptions);
            return res.status(200).json({
                success: true,
                count: total,
                data: exercises,
                page: filterOptions.page || 1,
                limit: filterOptions.limit || 20
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve exercises by muscle group'
            });
        }
    }
    async getExercisesByDifficulty(req, res) {
        try {
            const { difficulty } = req.params;
            const filterOptions = this.parseFilterOptions(req.query);
            const [exercises, total] = await this.exerciseService.getExercisesByDifficulty(difficulty, filterOptions);
            return res.status(200).json({
                success: true,
                count: total,
                data: exercises,
                page: filterOptions.page || 1,
                limit: filterOptions.limit || 20
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve exercises by difficulty'
            });
        }
    }
    async getExercisesByMovementPattern(req, res) {
        try {
            const { movementPattern } = req.params;
            const filterOptions = this.parseFilterOptions(req.query);
            const [exercises, total] = await this.exerciseService.getExercisesByMovementPattern(movementPattern, filterOptions);
            return res.status(200).json({
                success: true,
                count: total,
                data: exercises,
                page: filterOptions.page || 1,
                limit: filterOptions.limit || 20
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve exercises by movement pattern'
            });
        }
    }
    async getPopularExercises(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
            const [exercises, total] = await this.exerciseService.getPopularExercises(limit);
            return res.status(200).json({
                success: true,
                count: total,
                data: exercises
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve popular exercises'
            });
        }
    }
    async getRelatedExercises(req, res) {
        try {
            const { id } = req.params;
            const filterOptions = this.parseFilterOptions(req.query);
            const [exercises, total] = await this.exerciseService.getRelatedExercises(id, filterOptions);
            return res.status(200).json({
                success: true,
                count: total,
                data: exercises,
                page: filterOptions.page || 1,
                limit: filterOptions.limit || 20
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve related exercises'
            });
        }
    }
    async createExerciseRelation(req, res) {
        try {
            const { id: sourceExerciseId } = req.params;
            const relationData = Object.assign({ sourceExerciseId }, req.body);
            const relation = await this.exerciseService.createExerciseRelation(relationData);
            return res.status(201).json({
                success: true,
                data: relation
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to create exercise relation'
            });
        }
    }
    async removeExerciseRelation(req, res) {
        try {
            const { relationId } = req.params;
            await this.exerciseService.removeExerciseRelation(relationId);
            return res.status(200).json({
                success: true,
                message: 'Exercise relation deleted successfully'
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to delete exercise relation'
            });
        }
    }
    async getExerciseAlternatives(req, res) {
        try {
            const { id } = req.params;
            const filterOptions = this.parseFilterOptions(req.query);
            const [alternatives, total] = await this.exerciseService.getExerciseAlternatives(id, filterOptions);
            return res.status(200).json({
                success: true,
                count: total,
                data: alternatives,
                page: filterOptions.page || 1,
                limit: filterOptions.limit || 20
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve exercise alternatives'
            });
        }
    }
    async getExerciseProgressions(req, res) {
        try {
            const { id } = req.params;
            const { direction } = req.query;
            const filterOptions = this.parseFilterOptions(req.query);
            const directionValue = direction;
            const [progressions, total] = await this.exerciseService.getExerciseProgressions(id, directionValue, filterOptions);
            return res.status(200).json({
                success: true,
                count: total,
                data: progressions,
                direction: direction || 'all',
                page: filterOptions.page || 1,
                limit: filterOptions.limit || 20
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return res.status(error.statusCode).json({
                    success: false,
                    error: error.message
                });
            }
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve exercise progressions'
            });
        }
    }
    parseFilterOptions(query) {
        const filterOptions = {};
        if (query.page)
            filterOptions.page = parseInt(query.page, 10);
        if (query.limit)
            filterOptions.limit = parseInt(query.limit, 10);
        if (query.type)
            filterOptions.type = query.type;
        if (query.difficulty)
            filterOptions.difficulty = query.difficulty;
        if (query.muscleGroup)
            filterOptions.muscleGroup = query.muscleGroup;
        if (query.equipment)
            filterOptions.equipment = query.equipment;
        if (query.search)
            filterOptions.search = query.search;
        if (query.category) {
            filterOptions.category = query.category;
        }
        if (query.categoryId) {
            filterOptions.categoryIds = [parseInt(query.categoryId, 10)];
        }
        if (query.categoryIds) {
            if (Array.isArray(query.categoryIds)) {
                filterOptions.categoryIds = query.categoryIds.map((id) => parseInt(id, 10));
            }
            else if (typeof query.categoryIds === 'string') {
                filterOptions.categoryIds = query.categoryIds.split(',').map(id => parseInt(id.trim(), 10));
            }
        }
        return filterOptions;
    }
}
exports.ExerciseController = ExerciseController;
//# sourceMappingURL=ExerciseController.js.map