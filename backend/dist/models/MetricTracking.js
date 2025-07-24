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
exports.MetricTracking = exports.MetricMetadata = exports.ValidationRules = exports.MetricCorrelation = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const User_1 = require("./User");
const Exercise_1 = require("./Exercise");
const WorkoutSession_1 = require("./WorkoutSession");
const Enums_1 = require("./shared/Enums");
const ModelUtils = __importStar(require("./shared/Utils"));
class MetricCorrelation {
}
exports.MetricCorrelation = MetricCorrelation;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MetricCorrelation.prototype, "metricId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-1),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], MetricCorrelation.prototype, "correlation", void 0);
class ValidationRules {
}
exports.ValidationRules = ValidationRules;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ValidationRules.prototype, "min", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ValidationRules.prototype, "max", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ValidationRules.prototype, "step", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ValidationRules.prototype, "allowedValues", void 0);
class MetricMetadata {
}
exports.MetricMetadata = MetricMetadata;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MetricMetadata.prototype, "previousValue", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], MetricMetadata.prototype, "previousDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MetricMetadata.prototype, "changePercent", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MetricMetadata.prototype, "movingAverage", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], MetricMetadata.prototype, "standardDeviation", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MetricCorrelation),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], MetricMetadata.prototype, "relatedMetrics", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], MetricMetadata.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], MetricMetadata.prototype, "conditions", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MetricMetadata.prototype, "device", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MetricMetadata.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ValidationRules),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", ValidationRules)
], MetricMetadata.prototype, "validationRules", void 0);
let MetricTracking = class MetricTracking {
    constructor() {
        this.id = '';
        this.workoutSessionId = '';
    }
    calculateChangePercentage(previousValue) {
        var _a;
        const prevValue = previousValue || ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.previousValue);
        if (!prevValue)
            return 0;
        return ModelUtils.normalize(((this.value - prevValue) / prevValue) * 100, -100, 100);
    }
    isTargetMet() {
        if (!this.target)
            return false;
        if (this.trend === Enums_1.TrendDirection.DECREASING) {
            return this.value <= this.target;
        }
        return this.value >= this.target;
    }
    calculateProgress(startValue) {
        var _a;
        if (!this.target)
            return 0;
        const start = startValue || ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.previousValue) || 0;
        const current = this.value;
        if (this.trend === Enums_1.TrendDirection.DECREASING) {
            if (start <= this.target)
                return 100;
            const range = start - this.target;
            const progress = start - current;
            return ModelUtils.normalize((progress / range) * 100, 0, 100);
        }
        if (this.target <= start)
            return 100;
        const range = this.target - start;
        const progress = current - start;
        return ModelUtils.normalize((progress / range) * 100, 0, 100);
    }
};
exports.MetricTracking = MetricTracking;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MetricTracking.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_1.User)
], MetricTracking.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.MetricCategory
    }),
    (0, class_validator_1.IsEnum)(Enums_1.MetricCategory),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], MetricTracking.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MetricTracking.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.MetricValueType,
        default: Enums_1.MetricValueType.NUMERIC
    }),
    (0, class_validator_1.IsEnum)(Enums_1.MetricValueType),
    __metadata("design:type", String)
], MetricTracking.prototype, "valueType", void 0);
__decorate([
    (0, typeorm_1.Column)("float"),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MetricTracking.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], MetricTracking.prototype, "compoundValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MetricTracking.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Exercise_1.Exercise, { nullable: true, onDelete: "SET NULL" }),
    (0, typeorm_1.JoinColumn)({ name: "exercise_id" }),
    (0, typeorm_1.Index)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Exercise_1.Exercise)
], MetricTracking.prototype, "exercise", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => WorkoutSession_1.WorkoutSession, workoutSession => workoutSession.metrics),
    (0, typeorm_1.JoinColumn)({ name: "workout_session_id", referencedColumnName: "id" }),
    __metadata("design:type", WorkoutSession_1.WorkoutSession)
], MetricTracking.prototype, "workoutSession", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "workout_session_id" }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MetricTracking.prototype, "workoutSessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp with time zone" }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], MetricTracking.prototype, "recordedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MetricTracking.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MetricTracking.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], MetricTracking.prototype, "target", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.TrendDirection,
        nullable: true
    }),
    (0, class_validator_1.IsEnum)(Enums_1.TrendDirection),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MetricTracking.prototype, "trend", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MetricTracking.prototype, "isBaseline", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], MetricTracking.prototype, "confidence", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => MetricMetadata),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", MetricMetadata)
], MetricTracking.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], MetricTracking.prototype, "isMigrated", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MetricTracking.prototype, "legacyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], MetricTracking.prototype, "legacyData", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], MetricTracking.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], MetricTracking.prototype, "updatedAt", void 0);
exports.MetricTracking = MetricTracking = __decorate([
    (0, typeorm_1.Entity)("metric_tracking"),
    (0, typeorm_1.Index)(["user", "category", "name"]),
    (0, typeorm_1.Index)(["exercise", "category"]),
    (0, typeorm_1.Index)(["workoutSession", "category"]),
    (0, typeorm_1.Check)(`"value" >= 0`)
], MetricTracking);
//# sourceMappingURL=MetricTracking.js.map