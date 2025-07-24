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
exports.WorkoutPlan = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const WorkoutExercise_1 = require("./WorkoutExercise");
const User_1 = require("./User");
const WorkoutTag_1 = require("./WorkoutTag");
const ExerciseCategory_1 = require("./ExerciseCategory");
const Equipment_1 = require("./Equipment");
const WorkoutSession_1 = require("./WorkoutSession");
const Enums_1 = require("./shared/Enums");
const Validation_1 = require("./shared/Validation");
const ModelUtils = __importStar(require("./shared/Utils"));
const Constants_1 = require("./shared/Constants");
let WorkoutPlan = class WorkoutPlan {
    constructor() {
        this.name = '';
        this.description = '';
        this.difficulty = Enums_1.Difficulty.BEGINNER;
        this.workoutCategory = Enums_1.WorkoutCategory.FULL_BODY;
        this.metadata = new Validation_1.WorkoutMetadata();
        this.workoutStructure = new Validation_1.WorkoutStructure();
        this.progressionModel = new Validation_1.ProgressionModel();
    }
    updateMetricsCache(metrics) {
        const updatedMetrics = ModelUtils.deepCopy(this.metrics);
        Object.assign(updatedMetrics, metrics);
        updatedMetrics.lastCalculated = new Date();
        updatedMetrics.cacheTimeoutMinutes = Constants_1.TIME_CONSTANTS.DEFAULT_CACHE_TIMEOUT_MINUTES;
        return updatedMetrics;
    }
    calculateIntensity() {
        var _a;
        if (ModelUtils.isCacheValid(this.metrics.lastCalculated) && this.metrics.intensity > 0) {
            return this.metrics.intensity;
        }
        const intensity = ModelUtils.calculateWorkoutIntensity(this.difficulty, this.workoutCategory, this.workoutStructure, ((_a = this.equipmentNeeded) === null || _a === void 0 ? void 0 : _a.length) || 0, this.exercises);
        this.metrics = this.updateMetricsCache({ intensity });
        return intensity;
    }
    calculateEstimatedTime() {
        var _a, _b;
        if (ModelUtils.isCacheValid(this.metrics.lastCalculated) && this.metrics.totalTime > 0) {
            return this.metrics.totalTime;
        }
        const totalTime = ModelUtils.calculateWorkoutTime(this.estimatedDuration, ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.warmupIncluded) || false, ((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.cooldownIncluded) || false, this.exercises, this.workoutStructure);
        this.metrics = this.updateMetricsCache({
            totalTime,
            totalRestTime: totalTime - this.estimatedDuration
        });
        return totalTime;
    }
    getPrimaryMuscleGroups() {
        var _a;
        const muscleGroups = new Set();
        (_a = this.exercises) === null || _a === void 0 ? void 0 : _a.forEach(exercise => {
            exercise.exercise.form.muscles.primary.forEach(muscle => {
                muscleGroups.add(muscle);
            });
        });
        return Array.from(muscleGroups);
    }
    isBalanced() {
        const muscleGroups = this.getPrimaryMuscleGroups();
        const opposingPairs = [
            ['chest', 'back'],
            ['quadriceps', 'hamstrings'],
            ['biceps', 'triceps'],
            ['anterior deltoid', 'posterior deltoid']
        ];
        return opposingPairs.some(([muscle1, muscle2]) => muscleGroups.includes(muscle1) && muscleGroups.includes(muscle2));
    }
    calculateNextProgression() {
        var _a, _b;
        if (!((_a = this.progressionModel) === null || _a === void 0 ? void 0 : _a.progressionType)) {
            return { intensityMultiplier: 1, volumeMultiplier: 1, deload: false };
        }
        const currentWeek = Math.floor((Date.now() - this.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const deloadFrequency = this.progressionModel.deloadFrequency || 4;
        const isDeloadWeek = deloadFrequency > 0 && currentWeek % deloadFrequency === 0;
        if (isDeloadWeek) {
            return { intensityMultiplier: 0.6, volumeMultiplier: 0.7, deload: true };
        }
        const weekProgress = (_b = this.progressionModel.weeklyProgression) === null || _b === void 0 ? void 0 : _b[currentWeek];
        if (weekProgress) {
            return {
                intensityMultiplier: weekProgress.intensityMultiplier,
                volumeMultiplier: weekProgress.volumeMultiplier,
                deload: false
            };
        }
        switch (this.progressionModel.progressionType) {
            case Enums_1.ProgressionType.LINEAR:
                return {
                    intensityMultiplier: 1 + (currentWeek * 0.05),
                    volumeMultiplier: 1 + (currentWeek * 0.025),
                    deload: false
                };
            case Enums_1.ProgressionType.UNDULATING:
                return {
                    intensityMultiplier: 1 + (Math.sin(currentWeek * Math.PI / 2) * 0.15),
                    volumeMultiplier: 1 + (Math.cos(currentWeek * Math.PI / 2) * 0.15),
                    deload: false
                };
            case Enums_1.ProgressionType.WAVE:
                const waveWeek = currentWeek % 3;
                return {
                    intensityMultiplier: 1 + (waveWeek * 0.1),
                    volumeMultiplier: 1 - (waveWeek * 0.05),
                    deload: false
                };
            default:
                return { intensityMultiplier: 1, volumeMultiplier: 1, deload: false };
        }
    }
    generateVariation(options) {
        var _a, _b, _c;
        const variation = {
            name: `${this.name} (Variation)`,
            description: this.description,
            difficulty: this.difficulty,
            workoutCategory: this.workoutCategory,
            estimatedDuration: this.estimatedDuration,
            workoutStructure: Object.assign({}, this.workoutStructure),
            metadata: Object.assign({}, this.metadata)
        };
        if (options.intensityChange) {
            if (options.intensityChange > 0 && this.difficulty !== Enums_1.Difficulty.ADVANCED) {
                variation.difficulty = Object.values(Enums_1.Difficulty)[Object.values(Enums_1.Difficulty).indexOf(this.difficulty) + 1];
            }
            else if (options.intensityChange < 0 && this.difficulty !== Enums_1.Difficulty.BEGINNER) {
                variation.difficulty = Object.values(Enums_1.Difficulty)[Object.values(Enums_1.Difficulty).indexOf(this.difficulty) - 1];
            }
        }
        if (options.volumeChange && variation.workoutStructure) {
            variation.workoutStructure.totalSets = Math.max(1, Math.round((((_a = this.workoutStructure) === null || _a === void 0 ? void 0 : _a.totalSets) || 1) * (1 + options.volumeChange)));
        }
        if (options.timeConstraint) {
            const timeRatio = options.timeConstraint / this.estimatedDuration;
            variation.estimatedDuration = options.timeConstraint;
            if (variation.workoutStructure) {
                variation.workoutStructure.restBetweenExercises =
                    Math.max(30, Math.round((((_b = this.workoutStructure) === null || _b === void 0 ? void 0 : _b.restBetweenExercises) || 60) * timeRatio));
                variation.workoutStructure.restBetweenSets =
                    Math.max(30, Math.round((((_c = this.workoutStructure) === null || _c === void 0 ? void 0 : _c.restBetweenSets) || 60) * timeRatio));
            }
        }
        if (options.excludeEquipment && this.equipmentNeeded) {
            variation.equipmentIds = this.equipmentNeeded
                .filter(eq => { var _a; return !((_a = options.excludeEquipment) === null || _a === void 0 ? void 0 : _a.includes(String(eq.id))); })
                .map(eq => String(eq.id));
        }
        return variation;
    }
    calculateVolumeLoad() {
        if (ModelUtils.isCacheValid(this.metrics.lastCalculated) && this.metrics.volumeLoad > 0) {
            return this.metrics.volumeLoad;
        }
        const volumeLoad = this.exercises.reduce((total, exercise) => {
            var _a;
            const weight = ((_a = exercise.intensity) === null || _a === void 0 ? void 0 : _a.weight) || 0;
            const reps = exercise.repetitions || 0;
            const sets = exercise.sets || 0;
            return total + ModelUtils.calculateVolumeLoad(weight, reps, sets);
        }, 0);
        this.metrics = this.updateMetricsCache({ volumeLoad });
        return volumeLoad;
    }
    calculateDensity() {
        if (ModelUtils.isCacheValid(this.metrics.lastCalculated) && this.metrics.density > 0) {
            return this.metrics.density;
        }
        const totalTime = this.calculateEstimatedTime();
        if (totalTime <= 0)
            return 0;
        const volumeLoad = this.calculateVolumeLoad();
        const density = ModelUtils.calculateDensity(volumeLoad, totalTime);
        this.metrics = this.updateMetricsCache({
            density,
            volumeLoad,
            totalTime
        });
        return density;
    }
    getTotalWorkTime() {
        if (!this.exercises || this.exercises.length === 0)
            return 0;
        return this.exercises.reduce((total, exercise) => {
            let workTimePerSet = 0;
            if (exercise.duration > 0) {
                workTimePerSet = exercise.duration;
            }
            else if (exercise.repetitions > 0) {
                workTimePerSet = exercise.repetitions * 3;
            }
            else {
                workTimePerSet = 30;
            }
            return total + (workTimePerSet * exercise.sets);
        }, 0);
    }
    getTotalRestTime() {
        var _a, _b;
        if (ModelUtils.isCacheValid(this.metrics.lastCalculated) && this.metrics.totalRestTime) {
            return this.metrics.totalRestTime;
        }
        let totalRestTime = 0;
        if (this.workoutStructure) {
            const { restBetweenExercises, restBetweenSets, totalSets } = this.workoutStructure;
            if (restBetweenExercises)
                totalRestTime += (((_a = this.exercises) === null || _a === void 0 ? void 0 : _a.length) - 1 || 0) * restBetweenExercises;
            if (restBetweenSets && totalSets)
                totalRestTime += totalSets * restBetweenSets;
        }
        else if (((_b = this.exercises) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            totalRestTime = this.exercises.reduce((total, exercise) => {
                return total + (exercise.restTime || 0) * (exercise.sets || 1);
            }, 0);
        }
        this.metrics = this.updateMetricsCache({ totalRestTime });
        return totalRestTime;
    }
    calculateWorkToRestRatio() {
        const totalWorkTime = this.getTotalWorkTime();
        const totalRestTime = this.getTotalRestTime();
        if (totalRestTime === 0)
            return 0;
        return totalWorkTime / totalRestTime;
    }
    getFitnessGoals() {
        var _a;
        const goals = new Set();
        if ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.fitnessGoals) {
            this.metadata.fitnessGoals.forEach(goal => goals.add(goal));
        }
        switch (this.workoutCategory) {
            case Enums_1.WorkoutCategory.STRENGTH:
                goals.add(Enums_1.FitnessGoal.STRENGTH_GAIN);
                break;
            case Enums_1.WorkoutCategory.HYPERTROPHY:
                goals.add(Enums_1.FitnessGoal.HYPERTROPHY);
                goals.add(Enums_1.FitnessGoal.MUSCLE_BUILDING);
                break;
            case Enums_1.WorkoutCategory.ENDURANCE:
                goals.add(Enums_1.FitnessGoal.ENDURANCE);
                break;
            case Enums_1.WorkoutCategory.CARDIO:
                goals.add(Enums_1.FitnessGoal.ENDURANCE);
                goals.add(Enums_1.FitnessGoal.FAT_LOSS);
                break;
            case Enums_1.WorkoutCategory.HIIT:
                goals.add(Enums_1.FitnessGoal.FAT_LOSS);
                goals.add(Enums_1.FitnessGoal.ENDURANCE);
                break;
            case Enums_1.WorkoutCategory.FLEXIBILITY:
                goals.add(Enums_1.FitnessGoal.FLEXIBILITY);
                goals.add(Enums_1.FitnessGoal.MOBILITY);
                break;
            case Enums_1.WorkoutCategory.RECOVERY:
                goals.add(Enums_1.FitnessGoal.ACTIVE_RECOVERY);
                break;
            case Enums_1.WorkoutCategory.POWER:
                goals.add(Enums_1.FitnessGoal.POWER_DEVELOPMENT);
                break;
            case Enums_1.WorkoutCategory.SPORT_SPECIFIC:
                goals.add(Enums_1.FitnessGoal.SPORT_SPECIFIC);
                goals.add(Enums_1.FitnessGoal.ATHLETICISM);
                break;
            case Enums_1.WorkoutCategory.SKILL:
                goals.add(Enums_1.FitnessGoal.SKILL_DEVELOPMENT);
                break;
            default:
                goals.add(Enums_1.FitnessGoal.GENERAL_FITNESS);
        }
        return Array.from(goals);
    }
    getTrainingPrograms() {
        if (!this.programWorkouts)
            return Promise.resolve([]);
        const programs = [...new Set(this.programWorkouts.map(pw => pw.program))];
        return Promise.resolve(programs);
    }
};
exports.WorkoutPlan = WorkoutPlan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], WorkoutPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Index)("idx_workout_name"),
    __metadata("design:type", String)
], WorkoutPlan.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Index)("idx_workout_description"),
    __metadata("design:type", String)
], WorkoutPlan.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.Difficulty,
        default: Enums_1.Difficulty.BEGINNER
    }),
    (0, class_validator_1.IsEnum)(Enums_1.Difficulty),
    (0, typeorm_1.Index)("idx_workout_difficulty"),
    __metadata("design:type", String)
], WorkoutPlan.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => ExerciseCategory_1.ExerciseCategory, {
        eager: true
    }),
    (0, typeorm_1.JoinTable)({
        name: "workout_muscle_group",
        joinColumn: { name: "workout_id" },
        inverseJoinColumn: { name: "category_id" }
    }),
    __metadata("design:type", Array)
], WorkoutPlan.prototype, "targetMuscleGroups", void 0);
__decorate([
    (0, typeorm_1.Column)("int"),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(180),
    (0, typeorm_1.Index)("idx_workout_estimatedDuration"),
    __metadata("design:type", Number)
], WorkoutPlan.prototype, "estimatedDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Index)("idx_workout_isCustom"),
    __metadata("design:type", Boolean)
], WorkoutPlan.prototype, "isCustom", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], WorkoutPlan.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)("int", { default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutPlan.prototype, "ratingCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutPlan.prototype, "popularity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.WorkoutCategory,
        default: Enums_1.WorkoutCategory.FULL_BODY
    }),
    (0, class_validator_1.IsEnum)(Enums_1.WorkoutCategory),
    (0, typeorm_1.Index)("idx_workout_category"),
    __metadata("design:type", String)
], WorkoutPlan.prototype, "workoutCategory", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => WorkoutTag_1.WorkoutTag, {
        eager: true
    }),
    (0, typeorm_1.JoinTable)({
        name: "workout_tag_map",
        joinColumn: { name: "workout_id" },
        inverseJoinColumn: { name: "tag_id" }
    }),
    __metadata("design:type", Array)
], WorkoutPlan.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, typeorm_1.Index)("idx_workout_estimatedCaloriesBurn"),
    __metadata("design:type", Number)
], WorkoutPlan.prototype, "estimatedCaloriesBurn", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)("idx_workout_video_media_id"),
    __metadata("design:type", String)
], WorkoutPlan.prototype, "video_media_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)("idx_workout_thumbnail_media_id"),
    __metadata("design:type", String)
], WorkoutPlan.prototype, "thumbnail_media_id", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => Equipment_1.Equipment, {
        eager: true
    }),
    (0, typeorm_1.JoinTable)({
        name: "workout_equipment",
        joinColumn: { name: "workout_id" },
        inverseJoinColumn: { name: "equipment_id" }
    }),
    __metadata("design:type", Array)
], WorkoutPlan.prototype, "equipmentNeeded", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => WorkoutExercise_1.WorkoutExercise, workoutExercise => workoutExercise.workoutPlan, {
        cascade: true,
        eager: true
    }),
    __metadata("design:type", Array)
], WorkoutPlan.prototype, "exercises", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, user => user.createdWorkouts, {
        onDelete: "SET NULL",
        nullable: true
    }),
    (0, typeorm_1.JoinColumn)({ name: "creator_id" }),
    (0, typeorm_1.Index)("idx_workout_creator"),
    __metadata("design:type", User_1.User)
], WorkoutPlan.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)("idx_workout_creator_id"),
    __metadata("design:type", String)
], WorkoutPlan.prototype, "creator_id", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => WorkoutPlan, {
        nullable: true,
        onDelete: "SET NULL"
    }),
    (0, typeorm_1.JoinTable)({
        name: "workout_plan_combinations",
        joinColumn: { name: "workout_id" },
        inverseJoinColumn: { name: "related_workout_id" }
    }),
    __metadata("design:type", Array)
], WorkoutPlan.prototype, "relatedWorkouts", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Validation_1.WorkoutMetadata),
    __metadata("design:type", Validation_1.WorkoutMetadata)
], WorkoutPlan.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Validation_1.WorkoutStructure),
    __metadata("design:type", Validation_1.WorkoutStructure)
], WorkoutPlan.prototype, "workoutStructure", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Validation_1.ProgressionModel),
    __metadata("design:type", Validation_1.ProgressionModel)
], WorkoutPlan.prototype, "progressionModel", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", {
        default: {
            volumeLoad: 0,
            density: 0,
            intensity: 0,
            totalTime: 0,
            lastCalculated: new Date(),
            totalRestTime: 0,
            estimatedCalories: 0
        }
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => Validation_1.WorkoutMetrics),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Validation_1.WorkoutMetrics)
], WorkoutPlan.prototype, "metrics", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)("idx_workout_createdAt"),
    __metadata("design:type", Date)
], WorkoutPlan.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    (0, typeorm_1.Index)("idx_workout_updatedAt"),
    __metadata("design:type", Date)
], WorkoutPlan.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User_1.User, user => user.favoriteWorkouts),
    __metadata("design:type", Array)
], WorkoutPlan.prototype, "favoritedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User_1.User, user => user.workoutHistory),
    __metadata("design:type", Array)
], WorkoutPlan.prototype, "workoutHistoryOf", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => WorkoutSession_1.WorkoutSession, session => session.workoutPlan),
    __metadata("design:type", Array)
], WorkoutPlan.prototype, "sessions", void 0);
exports.WorkoutPlan = WorkoutPlan = __decorate([
    (0, typeorm_1.Entity)("workout_plans"),
    (0, typeorm_1.Index)("idx_workout_search", ["name", "workoutCategory", "difficulty"]),
    (0, typeorm_1.Index)("idx_workout_rating", ["rating", "ratingCount"]),
    (0, typeorm_1.Index)("idx_workout_popularity", ["popularity", "workoutCategory"]),
    (0, typeorm_1.Index)("idx_workout_newest", ["createdAt", "workoutCategory"]),
    (0, typeorm_1.Index)("idx_workout_filter", ["difficulty", "workoutCategory", "estimatedDuration"]),
    (0, typeorm_1.Index)("IDX_workout_difficulty_category", ["difficulty", "workoutCategory"]),
    (0, typeorm_1.Index)("IDX_workout_creator_custom", ["creator_id", "isCustom"]),
    (0, typeorm_1.Index)("idx_workout_tags_join", { synchronize: false }),
    (0, typeorm_1.Index)("idx_workout_equipment_join", { synchronize: false }),
    (0, typeorm_1.Index)("idx_workout_exercises_join", { synchronize: false }),
    (0, typeorm_1.Index)("idx_workout_programWorkouts_join", { synchronize: false }),
    (0, typeorm_1.Index)("idx_workout_relatedWorkouts_join", { synchronize: false }),
    (0, typeorm_1.Index)("idx_workout_trainingPrograms_join", { synchronize: false }),
    (0, typeorm_1.Index)("idx_workout_metadata_join", { synchronize: false }),
    (0, typeorm_1.Index)("idx_workout_structure_join", { synchronize: false }),
    (0, typeorm_1.Index)("idx_workout_progression_join", { synchronize: false }),
    (0, typeorm_1.Index)("idx_workout_favoritedBy_join", { synchronize: false }),
    (0, typeorm_1.Index)("idx_workout_workoutHistoryOf_join", { synchronize: false })
], WorkoutPlan);
//# sourceMappingURL=WorkoutPlan.js.map