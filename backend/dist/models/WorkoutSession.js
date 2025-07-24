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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutSession = exports.HealthData = exports.EnvironmentData = exports.LocationData = exports.Coordinates = exports.WorkoutSummary = exports.ExerciseSummary = exports.ExerciseSequence = exports.ActualExercise = exports.PlannedExercise = exports.ExerciseResult = exports.ExerciseAttempt = exports.BestResult = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const WorkoutPlan_1 = require("./WorkoutPlan");
const User_1 = require("./User");
const MetricTracking_1 = require("./MetricTracking");
const Feedback_1 = require("./Feedback");
const WorkoutRating_1 = require("./WorkoutRating");
const ExerciseFormAnalysis_1 = require("./ExerciseFormAnalysis");
const Achievement_1 = require("./Achievement");
const Enums_1 = require("./shared/Enums");
const ModelUtils = __importStar(require("./shared/Utils"));
class BestResult {
    constructor() {
        this.formScore = 0;
    }
}
exports.BestResult = BestResult;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BestResult.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BestResult.prototype, "reps", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BestResult.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], BestResult.prototype, "formScore", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BestResult.prototype, "difficultyScore", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BestResult.prototype, "notes", void 0);
class ExerciseAttempt {
    constructor() {
        this.timestamp = new Date();
        this.repetitions = 0;
        this.duration = 0;
        this.formScore = 0;
        this.weight = 0;
        this.resistance = 0;
        this.notes = '';
    }
}
exports.ExerciseAttempt = ExerciseAttempt;
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ExerciseAttempt.prototype, "timestamp", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ExerciseAttempt.prototype, "repetitions", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ExerciseAttempt.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], ExerciseAttempt.prototype, "formScore", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseAttempt.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseAttempt.prototype, "resistance", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseAttempt.prototype, "notes", void 0);
class ExerciseResult {
    constructor() {
        this.status = Enums_1.ExerciseStatus.PENDING;
        this.attempts = [];
        this.bestResult = new BestResult();
        this.feedback = '';
        this.difficultyRating = 5;
    }
}
exports.ExerciseResult = ExerciseResult;
__decorate([
    (0, class_validator_1.IsEnum)(Enums_1.ExerciseStatus),
    __metadata("design:type", String)
], ExerciseResult.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ExerciseAttempt),
    __metadata("design:type", Array)
], ExerciseResult.prototype, "attempts", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BestResult),
    __metadata("design:type", BestResult)
], ExerciseResult.prototype, "bestResult", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseResult.prototype, "feedback", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseResult.prototype, "difficultyRating", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseResult.prototype, "skipReason", void 0);
class PlannedExercise {
    constructor() {
        this.exerciseId = '';
        this.order = 1;
        this.targetRepetitions = 0;
        this.targetDuration = 0;
        this.targetSets = 1;
        this.restTime = 0;
        this.notes = '';
    }
}
exports.PlannedExercise = PlannedExercise;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PlannedExercise.prototype, "exerciseId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PlannedExercise.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PlannedExercise.prototype, "targetRepetitions", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PlannedExercise.prototype, "targetDuration", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PlannedExercise.prototype, "targetSets", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PlannedExercise.prototype, "restTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PlannedExercise.prototype, "notes", void 0);
class ActualExercise {
    constructor() {
        this.exerciseId = '';
        this.order = 1;
        this.startTime = new Date();
        this.status = Enums_1.ExerciseStatus.PENDING;
        this.completedSets = 0;
        this.notes = '';
    }
}
exports.ActualExercise = ActualExercise;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ActualExercise.prototype, "exerciseId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ActualExercise.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ActualExercise.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], ActualExercise.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Enums_1.ExerciseStatus),
    __metadata("design:type", String)
], ActualExercise.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ActualExercise.prototype, "completedSets", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ActualExercise.prototype, "notes", void 0);
class ExerciseSequence {
    constructor() {
        this.originalPlan = [];
        this.actualSequence = [];
    }
}
exports.ExerciseSequence = ExerciseSequence;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PlannedExercise),
    __metadata("design:type", Array)
], ExerciseSequence.prototype, "originalPlan", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ActualExercise),
    __metadata("design:type", Array)
], ExerciseSequence.prototype, "actualSequence", void 0);
class ExerciseSummary {
    constructor() {
        this.exerciseId = '';
        this.name = '';
        this.totalAttempts = 0;
        this.bestResult = new BestResult();
    }
}
exports.ExerciseSummary = ExerciseSummary;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExerciseSummary.prototype, "exerciseId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExerciseSummary.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ExerciseSummary.prototype, "totalAttempts", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BestResult),
    __metadata("design:type", BestResult)
], ExerciseSummary.prototype, "bestResult", void 0);
class WorkoutSummary {
    constructor() {
        this.totalExercises = 0;
        this.uniqueExercises = 0;
        this.totalDuration = 0;
        this.caloriesBurned = 0;
        this.averageHeartRate = 0;
        this.peakHeartRate = 0;
        this.difficultyRating = 5;
        this.focusAreas = [];
        this.muscleGroups = [];
        this.totalSets = 0;
        this.totalReps = 0;
        this.formScore = 0;
        this.exerciseSummaries = [];
    }
}
exports.WorkoutSummary = WorkoutSummary;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutSummary.prototype, "totalExercises", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutSummary.prototype, "uniqueExercises", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutSummary.prototype, "totalDuration", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutSummary.prototype, "caloriesBurned", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], WorkoutSummary.prototype, "averageHeartRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], WorkoutSummary.prototype, "peakHeartRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], WorkoutSummary.prototype, "difficultyRating", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], WorkoutSummary.prototype, "focusAreas", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], WorkoutSummary.prototype, "muscleGroups", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutSummary.prototype, "totalSets", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutSummary.prototype, "totalReps", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], WorkoutSummary.prototype, "formScore", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ExerciseSummary),
    __metadata("design:type", Array)
], WorkoutSummary.prototype, "exerciseSummaries", void 0);
class Coordinates {
    constructor() {
        this.latitude = 0;
        this.longitude = 0;
    }
}
exports.Coordinates = Coordinates;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], Coordinates.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], Coordinates.prototype, "longitude", void 0);
class LocationData {
    constructor() {
        this.type = Enums_1.WorkoutLocation.HOME;
        this.address = '';
    }
}
exports.LocationData = LocationData;
__decorate([
    (0, class_validator_1.IsEnum)(Enums_1.WorkoutLocation),
    __metadata("design:type", String)
], LocationData.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Coordinates),
    __metadata("design:type", Coordinates)
], LocationData.prototype, "coordinates", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LocationData.prototype, "address", void 0);
class EnvironmentData {
}
exports.EnvironmentData = EnvironmentData;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvironmentData.prototype, "temperature", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvironmentData.prototype, "humidity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], EnvironmentData.prototype, "weather", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], EnvironmentData.prototype, "altitude", void 0);
class HealthData {
}
exports.HealthData = HealthData;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], HealthData.prototype, "avgHeartRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], HealthData.prototype, "peakHeartRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], HealthData.prototype, "caloriesBurned", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], HealthData.prototype, "stepsCount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], HealthData.prototype, "weightBefore", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], HealthData.prototype, "weightAfter", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], HealthData.prototype, "stressLevel", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], HealthData.prototype, "hydrationLevel", void 0);
let WorkoutSession = class WorkoutSession {
    constructor() {
        this.id = '';
        this.userId = '';
        this.workoutPlanId = '';
        this.status = Enums_1.SessionStatus.ACTIVE;
        this.exerciseSequence = new ExerciseSequence();
        this.exerciseResults = {};
        this.summary = new WorkoutSummary();
        this.totalDuration = 0;
        this.caloriesBurned = 0;
        this.difficultyRating = 1;
        this.userFeedback = '';
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    calculateDuration() {
        if (this.startTime && this.endTime) {
            return Math.round((this.endTime.getTime() - this.startTime.getTime()) / (60 * 1000));
        }
        else if (this.summary.totalDuration > 0) {
            return this.summary.totalDuration;
        }
        return 0;
    }
    isComplete() {
        var _a;
        if (!((_a = this.exerciseSequence) === null || _a === void 0 ? void 0 : _a.actualSequence))
            return false;
        return this.exerciseSequence.actualSequence.every(exercise => exercise.status === Enums_1.ExerciseStatus.COMPLETED ||
            exercise.status === Enums_1.ExerciseStatus.SKIPPED);
    }
    calculateVolumeLoad() {
        let totalVolume = 0;
        if (!this.exerciseResults)
            return 0;
        Object.values(this.exerciseResults).forEach(result => {
            result.attempts.forEach(attempt => {
                const weight = attempt.weight || 0;
                totalVolume += weight * attempt.repetitions;
            });
        });
        return totalVolume;
    }
    calculateAverageFormScore() {
        if (!this.exerciseResults)
            return 0;
        const scores = [];
        Object.values(this.exerciseResults).forEach(result => {
            result.attempts.forEach(attempt => {
                scores.push(attempt.formScore);
            });
        });
        if (scores.length === 0)
            return 0;
        return ModelUtils.normalize(scores.reduce((sum, score) => sum + score, 0) / scores.length, 0, 10);
    }
};
exports.WorkoutSession = WorkoutSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], WorkoutSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "user_id" }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], WorkoutSession.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "workout_plan_id" }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], WorkoutSession.prototype, "workoutPlanId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "user_id", referencedColumnName: "id" }),
    __metadata("design:type", User_1.User)
], WorkoutSession.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutPlan_1.WorkoutPlan),
    (0, typeorm_1.JoinColumn)({ name: "workout_plan_id", referencedColumnName: "id" }),
    __metadata("design:type", WorkoutPlan_1.WorkoutPlan)
], WorkoutSession.prototype, "workoutPlan", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => MetricTracking_1.MetricTracking, metric => metric.workoutSession),
    __metadata("design:type", Array)
], WorkoutSession.prototype, "metrics", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Feedback_1.Feedback, feedback => feedback.workoutSession),
    __metadata("design:type", Array)
], WorkoutSession.prototype, "feedback", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => WorkoutRating_1.WorkoutRating, rating => rating.workoutSession),
    __metadata("design:type", Array)
], WorkoutSession.prototype, "ratings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ExerciseFormAnalysis_1.ExerciseFormAnalysis, analysis => analysis.workoutSession),
    __metadata("design:type", Array)
], WorkoutSession.prototype, "formAnalysis", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Achievement_1.Achievement, achievement => achievement.workoutSession),
    __metadata("design:type", Array)
], WorkoutSession.prototype, "achievements", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Enums_1.SessionStatus,
        default: Enums_1.SessionStatus.ACTIVE
    }),
    (0, class_validator_1.IsEnum)(Enums_1.SessionStatus),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], WorkoutSession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ExerciseSequence),
    __metadata("design:type", ExerciseSequence)
], WorkoutSession.prototype, "exerciseSequence", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { default: {} }),
    __metadata("design:type", Object)
], WorkoutSession.prototype, "exerciseResults", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", {
        default: {
            totalDuration: 0,
            caloriesBurned: 0,
            totalExercises: 0,
            uniqueExercises: 0,
            totalSets: 0,
            totalReps: 0,
            formScore: 0,
            focusAreas: [],
            muscleGroups: [],
            exerciseSummaries: []
        }
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkoutSummary),
    __metadata("design:type", WorkoutSummary)
], WorkoutSession.prototype, "summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], WorkoutSession.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], WorkoutSession.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "totalDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "caloriesBurned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], WorkoutSession.prototype, "difficultyRating", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkoutSession.prototype, "userFeedback", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocationData),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", LocationData)
], WorkoutSession.prototype, "locationData", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => EnvironmentData),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", EnvironmentData)
], WorkoutSession.prototype, "environmentData", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => HealthData),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", HealthData)
], WorkoutSession.prototype, "healthData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WorkoutSession.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WorkoutSession.prototype, "updatedAt", void 0);
exports.WorkoutSession = WorkoutSession = __decorate([
    (0, typeorm_1.Entity)("workout_sessions"),
    (0, typeorm_1.Index)(["user", "status"]),
    (0, typeorm_1.Index)(["workoutPlan", "status"]),
    (0, typeorm_1.Index)(["startTime", "endTime"])
], WorkoutSession);
//# sourceMappingURL=WorkoutSession.js.map