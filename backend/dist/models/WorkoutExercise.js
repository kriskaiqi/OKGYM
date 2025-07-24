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
var WorkoutExercise_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutExercise = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const Exercise_1 = require("./Exercise");
const WorkoutPlan_1 = require("./WorkoutPlan");
const Enums_1 = require("./shared/Enums");
const shared_1 = require("./shared");
const ModelUtils = __importStar(require("./shared/Utils"));
let WorkoutExercise = WorkoutExercise_1 = class WorkoutExercise {
    calculateVolume() {
        var _a;
        const weight = ((_a = this.intensity) === null || _a === void 0 ? void 0 : _a.weight) || 0;
        const reps = this.repetitions || 0;
        return ModelUtils.calculateVolumeLoad(weight, reps, this.sets);
    }
    calculateTotalTime() {
        return ModelUtils.calculateExerciseTime(this.sets, this.repetitions, this.duration, this.restTime, this.tempo);
    }
    getRelativeIntensity() {
        var _a, _b;
        if ((_a = this.intensity) === null || _a === void 0 ? void 0 : _a.rateOfPerceivedExertion) {
            return ModelUtils.normalize(this.intensity.rateOfPerceivedExertion, 1, 10);
        }
        if ((_b = this.intensity) === null || _b === void 0 ? void 0 : _b.percentOfOneRepMax) {
            return ModelUtils.normalize(this.intensity.percentOfOneRepMax, 0, 100);
        }
        if (this.repetitions <= 5) {
            return shared_1.PROGRESSION_CONSTANTS.LOW_REPS_INTENSITY;
        }
        else if (this.repetitions <= 12) {
            return shared_1.PROGRESSION_CONSTANTS.MEDIUM_REPS_INTENSITY;
        }
        else {
            return shared_1.PROGRESSION_CONSTANTS.HIGH_REPS_INTENSITY;
        }
    }
    generateSessionPlanItem() {
        return {
            exerciseId: this.exercise_id,
            order: this.order,
            targetRepetitions: this.repetitions,
            targetDuration: this.duration,
            targetSets: this.sets,
            restTime: this.restTime,
            notes: this.notes
        };
    }
    createAttempt(formScore, completedReps, completedDuration) {
        var _a, _b;
        return {
            timestamp: new Date(),
            repetitions: completedReps !== undefined ? completedReps : this.repetitions,
            duration: completedDuration !== undefined ? completedDuration : this.duration,
            formScore: Math.max(0, Math.min(1, formScore)),
            weight: (_a = this.intensity) === null || _a === void 0 ? void 0 : _a.weight,
            resistance: (_b = this.intensity) === null || _b === void 0 ? void 0 : _b.resistance,
            notes: this.notes
        };
    }
    allowsSubstitution() {
        var _a, _b, _c, _d;
        return ((_a = this.substitutionOptions) === null || _a === void 0 ? void 0 : _a.allowEquipmentVariations) === true ||
            ((_b = this.substitutionOptions) === null || _b === void 0 ? void 0 : _b.allowProgressions) === true ||
            ((_c = this.substitutionOptions) === null || _c === void 0 ? void 0 : _c.allowRegressions) === true ||
            (((_d = this.substitutionOptions) === null || _d === void 0 ? void 0 : _d.preferredSubstitutes) !== undefined &&
                this.substitutionOptions.preferredSubstitutes.length > 0);
    }
    getProgression(strategy = 'auto') {
        var _a, _b, _c;
        const progressionType = ((_a = this.progressionStrategy) === null || _a === void 0 ? void 0 : _a.targetProgressionType) || strategy;
        const progressionValues = ModelUtils.getExerciseProgression(progressionType, (_b = this.intensity) === null || _b === void 0 ? void 0 : _b.weight, this.repetitions, this.sets, this.duration, this.restTime, (_c = this.progressionStrategy) === null || _c === void 0 ? void 0 : _c.progressionRate);
        const result = {};
        if (progressionValues.weight !== undefined && this.intensity) {
            result.intensity = Object.assign(Object.assign({}, this.intensity), { weight: progressionValues.weight });
        }
        if (progressionValues.repetitions !== undefined) {
            result.repetitions = progressionValues.repetitions;
        }
        if (progressionValues.sets !== undefined) {
            result.sets = progressionValues.sets;
        }
        if (progressionValues.duration !== undefined) {
            result.duration = progressionValues.duration;
        }
        if (progressionValues.restTime !== undefined) {
            result.restTime = progressionValues.restTime;
        }
        return result;
    }
    scaleIntensity(factor) {
        var _a;
        if (factor === 1.0)
            return {};
        const result = ModelUtils.scaleExerciseIntensity((_a = this.intensity) === null || _a === void 0 ? void 0 : _a.weight, this.repetitions, this.duration, this.restTime, factor);
        const update = {
            restTime: result.restTime
        };
        if (result.repetitions !== undefined) {
            update.repetitions = result.repetitions;
        }
        if (result.duration !== undefined) {
            update.duration = result.duration;
        }
        if (result.weight !== undefined && this.intensity) {
            update.intensity = Object.assign(Object.assign({}, this.intensity), { weight: result.weight });
        }
        return update;
    }
    scaleVolume(factor) {
        if (factor === 1.0)
            return {};
        const result = ModelUtils.scaleExerciseVolume(this.sets, this.repetitions, this.duration, factor);
        const update = {};
        if (result.sets !== undefined) {
            update.sets = result.sets;
        }
        if (result.repetitions !== undefined) {
            update.repetitions = result.repetitions;
        }
        if (result.duration !== undefined) {
            update.duration = result.duration;
        }
        return update;
    }
    generateRegression() {
        var _a;
        const result = ModelUtils.generateExerciseRegression((_a = this.intensity) === null || _a === void 0 ? void 0 : _a.weight, this.repetitions, this.duration, this.sets, this.restTime);
        const update = {
            restTime: result.restTime
        };
        if (result.sets !== undefined) {
            update.sets = result.sets;
        }
        if (result.repetitions !== undefined) {
            update.repetitions = result.repetitions;
        }
        if (result.duration !== undefined) {
            update.duration = result.duration;
        }
        if (result.weight !== undefined && this.intensity) {
            update.intensity = Object.assign(Object.assign({}, this.intensity), { weight: result.weight });
        }
        return update;
    }
    generateProgression() {
        var _a;
        const result = ModelUtils.generateExerciseProgression((_a = this.intensity) === null || _a === void 0 ? void 0 : _a.weight, this.repetitions, this.duration, this.sets, this.restTime);
        const update = {
            restTime: result.restTime
        };
        if (result.sets !== undefined) {
            update.sets = result.sets;
        }
        if (result.repetitions !== undefined) {
            update.repetitions = result.repetitions;
        }
        if (result.duration !== undefined) {
            update.duration = result.duration;
        }
        if (result.weight !== undefined && this.intensity) {
            update.intensity = Object.assign(Object.assign({}, this.intensity), { weight: result.weight });
        }
        return update;
    }
    clone(modifications = {}) {
        const clone = new WorkoutExercise_1();
        clone.order = this.order;
        clone.repetitions = this.repetitions;
        clone.duration = this.duration;
        clone.restTime = this.restTime;
        clone.notes = this.notes;
        clone.sets = this.sets;
        clone.setType = this.setType;
        clone.setStructure = this.setStructure;
        clone.exerciseRole = this.exerciseRole;
        clone.exercise_id = this.exercise_id;
        if (this.intensity) {
            clone.intensity = Object.assign({}, this.intensity);
        }
        if (this.tempo) {
            clone.tempo = Object.assign({}, this.tempo);
        }
        if (this.rangeOfMotion) {
            clone.rangeOfMotion = Object.assign({}, this.rangeOfMotion);
        }
        if (this.progressionStrategy) {
            clone.progressionStrategy = Object.assign({}, this.progressionStrategy);
        }
        if (this.substitutionOptions) {
            clone.substitutionOptions = Object.assign({}, this.substitutionOptions);
            if (this.substitutionOptions.preferredSubstitutes) {
                clone.substitutionOptions.preferredSubstitutes = [...this.substitutionOptions.preferredSubstitutes];
            }
        }
        Object.assign(clone, modifications);
        return clone;
    }
    createSubstitution(newExerciseId) {
        return this.clone({
            exercise_id: newExerciseId,
            rangeOfMotion: undefined
        });
    }
    createSuperset(otherExercise) {
        this.setType = Enums_1.SetType.SUPER;
        const secondaryExercise = otherExercise.clone({
            setType: Enums_1.SetType.SUPER,
            order: this.order + 0.1,
            restTime: this.restTime
        });
        return [this, secondaryExercise];
    }
    createDropSet(dropCount = 1, intensityReduction = 0.8) {
        var _a;
        this.setStructure = Enums_1.SetStructure.DROP_SET;
        const exercises = [this];
        const dropSets = ModelUtils.calculateDropSets((_a = this.intensity) === null || _a === void 0 ? void 0 : _a.weight, this.repetitions, this.restTime, dropCount, intensityReduction);
        dropSets.forEach((dropConfig, index) => {
            const dropSet = this.clone({
                order: this.order + ((index + 1) * 0.1),
                setStructure: Enums_1.SetStructure.DROP_SET,
                sets: 1,
                restTime: dropConfig.restTime,
                repetitions: dropConfig.repetitions
            });
            if (dropConfig.weight !== undefined && dropSet.intensity) {
                dropSet.intensity.weight = dropConfig.weight;
            }
            exercises.push(dropSet);
        });
        return exercises;
    }
    validate() {
        var _a, _b;
        const errors = [];
        if (!this.exercise_id) {
            errors.push("Exercise ID is required");
        }
        if (this.sets <= 0) {
            errors.push("Sets must be greater than 0");
        }
        const hasDuration = this.duration > 0;
        const hasReps = this.repetitions > 0;
        if (!hasDuration && !hasReps) {
            errors.push("Either repetitions or duration must be specified");
        }
        if (this.tempo) {
            const { eccentric, concentric, pause, pauseAtTop } = this.tempo;
            const totalTempo = (eccentric || 0) + (concentric || 0) + (pause || 0) + (pauseAtTop || 0);
            if (totalTempo > 0 && !hasReps) {
                errors.push("Tempo can only be specified for repetition-based exercises");
            }
        }
        if (((_a = this.rangeOfMotion) === null || _a === void 0 ? void 0 : _a.partial) && !this.rangeOfMotion.partialType) {
            errors.push("When using partial range of motion, the type must be specified");
        }
        if (this.progressionStrategy) {
            const { targetProgressionType, progressionRate } = this.progressionStrategy;
            if (targetProgressionType === 'weight' && ((_b = this.intensity) === null || _b === void 0 ? void 0 : _b.weight) === undefined) {
                errors.push("Weight progression requires weight to be specified");
            }
            if (progressionRate !== undefined && progressionRate <= 0) {
                errors.push("Progression rate must be greater than 0");
            }
            if (this.progressionStrategy.deloadFrequency !== undefined &&
                this.progressionStrategy.deloadFrequency <= 0) {
                errors.push("Deload frequency must be greater than 0");
            }
        }
        return errors;
    }
};
exports.WorkoutExercise = WorkoutExercise;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], WorkoutExercise.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutExercise.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutExercise.prototype, "repetitions", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutExercise.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 30 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutExercise.prototype, "restTime", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => shared_1.ExerciseIntensity),
    __metadata("design:type", shared_1.ExerciseIntensity)
], WorkoutExercise.prototype, "intensity", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkoutExercise.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], WorkoutExercise.prototype, "sets", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.SetType,
        default: Enums_1.SetType.NORMAL
    }),
    (0, class_validator_1.IsEnum)(Enums_1.SetType),
    __metadata("design:type", String)
], WorkoutExercise.prototype, "setType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutExercise, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "superset_with_exercise_id" }),
    (0, typeorm_1.Index)("idx_fk_workout_exercise_superset"),
    __metadata("design:type", WorkoutExercise)
], WorkoutExercise.prototype, "supersetWith", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkoutExercise.prototype, "superset_with_exercise_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.SetStructure,
        default: Enums_1.SetStructure.REGULAR
    }),
    (0, class_validator_1.IsEnum)(Enums_1.SetStructure),
    __metadata("design:type", String)
], WorkoutExercise.prototype, "setStructure", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => shared_1.ExerciseTempo),
    __metadata("design:type", shared_1.ExerciseTempo)
], WorkoutExercise.prototype, "tempo", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => shared_1.RangeOfMotion),
    __metadata("design:type", shared_1.RangeOfMotion)
], WorkoutExercise.prototype, "rangeOfMotion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.ExerciseRole,
        default: Enums_1.ExerciseRole.PRIMARY
    }),
    (0, class_validator_1.IsEnum)(Enums_1.ExerciseRole),
    __metadata("design:type", String)
], WorkoutExercise.prototype, "exerciseRole", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => shared_1.ProgressionStrategy),
    __metadata("design:type", shared_1.ProgressionStrategy)
], WorkoutExercise.prototype, "progressionStrategy", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => shared_1.SubstitutionOptions),
    __metadata("design:type", shared_1.SubstitutionOptions)
], WorkoutExercise.prototype, "substitutionOptions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], WorkoutExercise.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], WorkoutExercise.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exercise_1.Exercise, exercise => exercise.workoutExercises, {
        nullable: false,
        onDelete: "RESTRICT"
    }),
    (0, typeorm_1.JoinColumn)({ name: "exercise_id" }),
    (0, typeorm_1.Index)("idx_fk_workout_exercise_exercise"),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Exercise_1.Exercise)
], WorkoutExercise.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], WorkoutExercise.prototype, "exercise_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutPlan_1.WorkoutPlan, workoutPlan => workoutPlan.exercises, {
        nullable: false,
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "workout_plan_id" }),
    (0, typeorm_1.Index)("idx_fk_workout_exercise_plan"),
    __metadata("design:type", WorkoutPlan_1.WorkoutPlan)
], WorkoutExercise.prototype, "workoutPlan", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], WorkoutExercise.prototype, "workout_plan_id", void 0);
exports.WorkoutExercise = WorkoutExercise = WorkoutExercise_1 = __decorate([
    (0, typeorm_1.Entity)("workout_exercises"),
    (0, typeorm_1.Index)("idx_workout_exercise_order", ["workoutPlan", "order"])
], WorkoutExercise);
//# sourceMappingURL=WorkoutExercise.js.map