"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseConfig = exports.ProgressionModel = exports.WorkoutStructure = exports.ExerciseStats = exports.PopularityStats = exports.AITracking = exports.AIModel = exports.AIModelConfig = exports.ExerciseForm = exports.SafetyInfo = exports.ExecutionSteps = exports.JointInfo = exports.JointRange = exports.CompletionStats = exports.RatingStats = exports.MetricStats = exports.LocationData = exports.Coordinates = exports.WeeklyProgression = exports.SubstitutionOptions = exports.WorkoutMetrics = exports.CachedMetrics = exports.MuscleGroup = exports.WorkoutMetadata = exports.ProgressionStrategy = exports.RangeOfMotion = exports.ExerciseTempo = exports.ExerciseIntensity = exports.ScaleOfTen = exports.NormalizedScore = exports.NumericalRange = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const Enums_1 = require("./Enums");
class NumericalRange {
}
exports.NumericalRange = NumericalRange;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], NumericalRange.prototype, "min", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], NumericalRange.prototype, "max", void 0);
class NormalizedScore {
}
exports.NormalizedScore = NormalizedScore;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], NormalizedScore.prototype, "score", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], NormalizedScore.prototype, "lastUpdated", void 0);
class ScaleOfTen {
}
exports.ScaleOfTen = ScaleOfTen;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], ScaleOfTen.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ScaleOfTen.prototype, "description", void 0);
class ExerciseIntensity {
}
exports.ExerciseIntensity = ExerciseIntensity;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseIntensity.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseIntensity.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseIntensity.prototype, "resistance", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseIntensity.prototype, "percentOfOneRepMax", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseIntensity.prototype, "rateOfPerceivedExertion", void 0);
class ExerciseTempo {
}
exports.ExerciseTempo = ExerciseTempo;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseTempo.prototype, "eccentric", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseTempo.prototype, "pause", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseTempo.prototype, "concentric", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseTempo.prototype, "pauseAtTop", void 0);
class RangeOfMotion {
}
exports.RangeOfMotion = RangeOfMotion;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], RangeOfMotion.prototype, "partial", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RangeOfMotion.prototype, "partialType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RangeOfMotion.prototype, "rangeRestriction", void 0);
class ProgressionStrategy {
}
exports.ProgressionStrategy = ProgressionStrategy;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProgressionStrategy.prototype, "targetProgressionType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ProgressionStrategy.prototype, "progressionRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ProgressionStrategy.prototype, "deloadFrequency", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ProgressionStrategy.prototype, "autoRegulate", void 0);
class WorkoutMetadata {
}
exports.WorkoutMetadata = WorkoutMetadata;
__decorate([
    (0, class_validator_1.IsEnum)(Enums_1.SpaceRequirement),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkoutMetadata.prototype, "spaceRequired", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Enums_1.NoiseLevel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkoutMetadata.prototype, "noise", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], WorkoutMetadata.prototype, "targetAudience", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Enums_1.MobilityLevel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WorkoutMetadata.prototype, "mobility", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], WorkoutMetadata.prototype, "warmupIncluded", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], WorkoutMetadata.prototype, "cooldownIncluded", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(Enums_1.FitnessGoal, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], WorkoutMetadata.prototype, "fitnessGoals", void 0);
class MuscleGroup {
}
exports.MuscleGroup = MuscleGroup;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], MuscleGroup.prototype, "primary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], MuscleGroup.prototype, "secondary", void 0);
class CachedMetrics {
    isCacheValid(maxAgeMinutes) {
        const timeout = maxAgeMinutes || this.cacheTimeoutMinutes || 60;
        const ageInMinutes = (Date.now() - this.lastCalculated.getTime()) / (60 * 1000);
        return ageInMinutes < timeout;
    }
}
exports.CachedMetrics = CachedMetrics;
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CachedMetrics.prototype, "lastCalculated", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CachedMetrics.prototype, "cacheTimeoutMinutes", void 0);
class WorkoutMetrics extends CachedMetrics {
}
exports.WorkoutMetrics = WorkoutMetrics;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutMetrics.prototype, "volumeLoad", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutMetrics.prototype, "density", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], WorkoutMetrics.prototype, "intensity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutMetrics.prototype, "totalTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutMetrics.prototype, "totalRestTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutMetrics.prototype, "averageHeartRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutMetrics.prototype, "estimatedCalories", void 0);
class SubstitutionOptions {
}
exports.SubstitutionOptions = SubstitutionOptions;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SubstitutionOptions.prototype, "allowRegressions", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SubstitutionOptions.prototype, "allowProgressions", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], SubstitutionOptions.prototype, "allowEquipmentVariations", void 0);
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SubstitutionOptions.prototype, "preferredSubstitutes", void 0);
class WeeklyProgression {
}
exports.WeeklyProgression = WeeklyProgression;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], WeeklyProgression.prototype, "intensityMultiplier", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], WeeklyProgression.prototype, "volumeMultiplier", void 0);
class Coordinates {
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
}
exports.LocationData = LocationData;
__decorate([
    (0, class_validator_1.IsString)(),
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
class MetricStats {
}
exports.MetricStats = MetricStats;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MetricStats.prototype, "avg", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MetricStats.prototype, "min", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MetricStats.prototype, "max", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], MetricStats.prototype, "lastCalculated", void 0);
class RatingStats {
}
exports.RatingStats = RatingStats;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], RatingStats.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RatingStats.prototype, "count", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], RatingStats.prototype, "distribution", void 0);
class CompletionStats {
}
exports.CompletionStats = CompletionStats;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CompletionStats.prototype, "rate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CompletionStats.prototype, "total", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CompletionStats.prototype, "successful", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CompletionStats.prototype, "lastUpdated", void 0);
class JointRange {
}
exports.JointRange = JointRange;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], JointRange.prototype, "min", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], JointRange.prototype, "max", void 0);
class JointInfo {
}
exports.JointInfo = JointInfo;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], JointInfo.prototype, "primary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => JointRange),
    __metadata("design:type", Object)
], JointInfo.prototype, "rangeOfMotion", void 0);
class ExecutionSteps {
}
exports.ExecutionSteps = ExecutionSteps;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ExecutionSteps.prototype, "setup", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ExecutionSteps.prototype, "steps", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExecutionSteps.prototype, "tempo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ExecutionSteps.prototype, "keyPoints", void 0);
class SafetyInfo {
}
exports.SafetyInfo = SafetyInfo;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SafetyInfo.prototype, "prerequisites", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SafetyInfo.prototype, "cautions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SafetyInfo.prototype, "tips", void 0);
class ExerciseForm {
}
exports.ExerciseForm = ExerciseForm;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MuscleGroup),
    __metadata("design:type", MuscleGroup)
], ExerciseForm.prototype, "muscles", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => JointInfo),
    __metadata("design:type", JointInfo)
], ExerciseForm.prototype, "joints", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ExecutionSteps),
    __metadata("design:type", ExecutionSteps)
], ExerciseForm.prototype, "execution", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SafetyInfo),
    __metadata("design:type", SafetyInfo)
], ExerciseForm.prototype, "safety", void 0);
class AIModelConfig {
}
exports.AIModelConfig = AIModelConfig;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], AIModelConfig.prototype, "threshold", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], AIModelConfig.prototype, "minConfidence", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AIModelConfig.prototype, "parameters", void 0);
class AIModel {
}
exports.AIModel = AIModel;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AIModel.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AIModel.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AIModel.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AIModel.prototype, "version", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(Enums_1.TrackingFeature, { each: true }),
    __metadata("design:type", Array)
], AIModel.prototype, "features", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AIModelConfig),
    __metadata("design:type", AIModelConfig)
], AIModel.prototype, "config", void 0);
class AITracking {
}
exports.AITracking = AITracking;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AIModel),
    __metadata("design:type", Array)
], AITracking.prototype, "models", void 0);
class PopularityStats {
}
exports.PopularityStats = PopularityStats;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PopularityStats.prototype, "score", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['up', 'down', 'stable']),
    __metadata("design:type", String)
], PopularityStats.prototype, "trend", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], PopularityStats.prototype, "lastUpdated", void 0);
class ExerciseStats {
}
exports.ExerciseStats = ExerciseStats;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MetricStats),
    __metadata("design:type", MetricStats)
], ExerciseStats.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MetricStats),
    __metadata("design:type", MetricStats)
], ExerciseStats.prototype, "calories", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CompletionStats),
    __metadata("design:type", CompletionStats)
], ExerciseStats.prototype, "completion", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RatingStats),
    __metadata("design:type", RatingStats)
], ExerciseStats.prototype, "rating", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PopularityStats),
    __metadata("design:type", PopularityStats)
], ExerciseStats.prototype, "popularity", void 0);
class WorkoutStructure {
}
exports.WorkoutStructure = WorkoutStructure;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], WorkoutStructure.prototype, "sets", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], WorkoutStructure.prototype, "circuits", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], WorkoutStructure.prototype, "rounds", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], WorkoutStructure.prototype, "restBetweenExercises", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(30),
    (0, class_validator_1.Max)(600),
    __metadata("design:type", Number)
], WorkoutStructure.prototype, "restBetweenSets", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(30),
    (0, class_validator_1.Max)(600),
    __metadata("design:type", Number)
], WorkoutStructure.prototype, "restBetweenCircuits", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.ProgressionType),
    __metadata("design:type", String)
], WorkoutStructure.prototype, "progressionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], WorkoutStructure.prototype, "workToRestRatio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WorkoutStructure.prototype, "autoAdjustRest", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutStructure.prototype, "totalSets", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WorkoutStructure.prototype, "totalReps", void 0);
class ProgressionModel {
}
exports.ProgressionModel = ProgressionModel;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], ProgressionModel.prototype, "intensityIncreaseRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], ProgressionModel.prototype, "volumeIncreaseRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ProgressionModel.prototype, "deloadFrequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ProgressionModel.prototype, "autoRegulate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], ProgressionModel.prototype, "rpeTarget", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.ProgressionType),
    __metadata("design:type", String)
], ProgressionModel.prototype, "progressionType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ProgressionModel.prototype, "weeklyProgression", void 0);
class ExerciseConfig {
}
exports.ExerciseConfig = ExerciseConfig;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExerciseConfig.prototype, "exerciseId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExerciseConfig.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ExerciseConfig.prototype, "sets", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseConfig.prototype, "repetitions", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseConfig.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseConfig.prototype, "distance", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ExerciseConfig.prototype, "restTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExerciseConfig.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ExerciseConfig.prototype, "intensity", void 0);
//# sourceMappingURL=Validation.js.map