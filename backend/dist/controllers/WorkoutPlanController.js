"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanController = exports.ReorderExercisesDto = exports.UpdateExerciseDto = exports.AddExerciseDto = exports.UpdateWorkoutPlanDto = exports.CreateWorkoutPlanDto = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
class CreateWorkoutPlanDto {
}
exports.CreateWorkoutPlanDto = CreateWorkoutPlanDto;
class UpdateWorkoutPlanDto {
}
exports.UpdateWorkoutPlanDto = UpdateWorkoutPlanDto;
class AddExerciseDto {
}
exports.AddExerciseDto = AddExerciseDto;
class UpdateExerciseDto {
}
exports.UpdateExerciseDto = UpdateExerciseDto;
class ReorderExercisesDto {
}
exports.ReorderExercisesDto = ReorderExercisesDto;
class WorkoutPlanController {
    constructor(workoutPlanService) {
        this.workoutPlanService = workoutPlanService;
        this.createWorkoutPlan = async (req, res) => {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
                }
                const workoutPlan = await this.workoutPlanService.createWorkoutPlan(req.body, userId);
                res.status(201).json(workoutPlan);
            }
            catch (error) {
                this.handleError(error, res);
            }
        };
        this.getWorkoutPlan = async (req, res) => {
            var _a;
            try {
                const id = parseInt(req.params.id, 10);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const workoutPlan = await this.workoutPlanService.getWorkoutPlanById(id, userId);
                res.json(workoutPlan);
            }
            catch (error) {
                this.handleError(error, res);
            }
        };
        this.updateWorkoutPlan = async (req, res) => {
            var _a;
            try {
                const id = parseInt(req.params.id, 10);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
                }
                const workoutPlan = await this.workoutPlanService.updateWorkoutPlan(id, req.body, userId);
                res.json(workoutPlan);
            }
            catch (error) {
                this.handleError(error, res);
            }
        };
        this.deleteWorkoutPlan = async (req, res) => {
            var _a;
            try {
                const id = parseInt(req.params.id, 10);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
                }
                await this.workoutPlanService.deleteWorkoutPlan(id, userId);
                res.status(204).send('');
            }
            catch (error) {
                this.handleError(error, res);
            }
        };
        this.getWorkoutPlans = async (req, res) => {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const result = await this.workoutPlanService.getWorkoutPlans(req.query, userId);
                res.json(result);
            }
            catch (error) {
                this.handleError(error, res);
            }
        };
        this.addExercise = async (req, res) => {
            var _a;
            try {
                const workoutPlanId = parseInt(req.params.id, 10);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
                }
                const workoutPlan = await this.workoutPlanService.addExerciseToWorkoutPlan(workoutPlanId, req.body, userId);
                res.status(201).json(workoutPlan);
            }
            catch (error) {
                this.handleError(error, res);
            }
        };
        this.updateExercise = async (req, res) => {
            var _a;
            try {
                const workoutPlanId = parseInt(req.params.id, 10);
                const exerciseId = parseInt(req.params.exerciseId, 10);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
                }
                const workoutPlan = await this.workoutPlanService.updateExerciseInWorkoutPlan(workoutPlanId, exerciseId, req.body, userId);
                res.json(workoutPlan);
            }
            catch (error) {
                this.handleError(error, res);
            }
        };
        this.removeExercise = async (req, res) => {
            var _a;
            try {
                const workoutPlanId = parseInt(req.params.id, 10);
                const exerciseId = parseInt(req.params.exerciseId, 10);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
                }
                const workoutPlan = await this.workoutPlanService.removeExerciseFromWorkoutPlan(workoutPlanId, exerciseId, userId);
                res.json(workoutPlan);
            }
            catch (error) {
                this.handleError(error, res);
            }
        };
        this.reorderExercises = async (req, res) => {
            var _a;
            try {
                const workoutPlanId = parseInt(req.params.id, 10);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw new errors_1.AppError(errors_1.ErrorType.AUTHORIZATION_ERROR, 'User not authenticated', 401);
                }
                const workoutPlan = await this.workoutPlanService.reorderExercisesInWorkoutPlan(workoutPlanId, req.body.exercises, userId);
                res.json(workoutPlan);
            }
            catch (error) {
                this.handleError(error, res);
            }
        };
    }
    handleError(error, res) {
        if (error instanceof errors_1.AppError) {
            res.status(error.statusCode).json({
                error: error.message,
                type: error.type
            });
            return;
        }
        logger_1.default.error('Controller error:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        res.status(500).json({
            error: 'Internal server error',
            type: errors_1.ErrorType.SERVICE_ERROR
        });
    }
}
exports.WorkoutPlanController = WorkoutPlanController;
//# sourceMappingURL=WorkoutPlanController.js.map