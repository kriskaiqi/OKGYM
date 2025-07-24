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
exports.Exercise = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const ExerciseDetails_1 = require("./ExerciseDetails");
const WorkoutExercise_1 = require("./WorkoutExercise");
const Enums_1 = require("./shared/Enums");
const Validation_1 = require("./shared/Validation");
const ModelUtils = __importStar(require("./shared/Utils"));
let Exercise = class Exercise {
    constructor() {
        this.targetMuscleGroups = [];
        this.synergistMuscleGroups = [];
    }
    calculateComplexity() {
        var _a;
        return ModelUtils.calculateExerciseComplexity(this.level, this.types, ((_a = this.equipmentOptions) === null || _a === void 0 ? void 0 : _a.length) || 0, this.movementPattern, this.form);
    }
    getRelatedExercises(type) {
        return Promise.resolve([]);
    }
};
exports.Exercise = Exercise;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Exercise.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)("idx_exercise_name"),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Exercise.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], Exercise.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.MeasurementType,
        default: Enums_1.MeasurementType.REPS
    }),
    (0, class_validator_1.IsEnum)(Enums_1.MeasurementType),
    (0, typeorm_1.Index)("idx_exercise_measurement"),
    __metadata("design:type", String)
], Exercise.prototype, "measurementType", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array"),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsEnum)(Enums_1.ExerciseType, { each: true }),
    __metadata("design:type", Array)
], Exercise.prototype, "types", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.Difficulty,
        default: Enums_1.Difficulty.BEGINNER
    }),
    (0, class_validator_1.IsEnum)(Enums_1.Difficulty),
    (0, typeorm_1.Index)("idx_exercise_level"),
    __metadata("design:type", String)
], Exercise.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.MovementPattern,
        nullable: true
    }),
    (0, class_validator_1.IsEnum)(Enums_1.MovementPattern),
    (0, typeorm_1.Index)("idx_exercise_movement"),
    __metadata("design:type", String)
], Exercise.prototype, "movementPattern", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => WorkoutExercise_1.WorkoutExercise, workoutExercise => workoutExercise.exercise, {
        onDelete: "RESTRICT"
    }),
    __metadata("design:type", Array)
], Exercise.prototype, "workoutExercises", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ExerciseDetails_1.ExerciseDetails, details => details.exercise, {
        cascade: true,
        onDelete: "CASCADE"
    }),
    __metadata("design:type", Array)
], Exercise.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { default: [] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(Enums_1.TrackingFeature, { each: true }),
    __metadata("design:type", Array)
], Exercise.prototype, "trackingFeatures", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { default: [] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(Validation_1.MuscleGroup, { each: true }),
    __metadata("design:type", Array)
], Exercise.prototype, "targetMuscleGroups", void 0);
__decorate([
    (0, typeorm_1.Column)("simple-array", { default: [] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(Validation_1.MuscleGroup, { each: true }),
    __metadata("design:type", Array)
], Exercise.prototype, "synergistMuscleGroups", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Validation_1.ExerciseForm),
    __metadata("design:type", Validation_1.ExerciseForm)
], Exercise.prototype, "form", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Validation_1.AIModelConfig),
    __metadata("design:type", Validation_1.AIModelConfig)
], Exercise.prototype, "aiConfig", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", {
        default: () => "'{ \"duration\": {\"avg\": 0, \"min\": 0, \"max\": 0}, \"calories\": {\"avg\": 0, \"min\": 0, \"max\": 0}, \"completion\": {\"rate\": 0, \"total\": 0, \"successful\": 0}, \"rating\": {\"value\": 0, \"count\": 0, \"distribution\": {}}, \"popularity\": {\"score\": 0, \"trend\": \"stable\", \"lastUpdated\": \"1970-01-01T00:00:00.000Z\"} }'::jsonb"
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Validation_1.ExerciseStats),
    __metadata("design:type", Validation_1.ExerciseStats)
], Exercise.prototype, "stats", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Exercise.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Exercise.prototype, "updatedAt", void 0);
exports.Exercise = Exercise = __decorate([
    (0, typeorm_1.Entity)("exercises"),
    (0, typeorm_1.Index)("idx_exercise_name_measurement", ["name", "measurementType"])
], Exercise);
//# sourceMappingURL=Exercise.js.map