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
exports.BodyMetric = exports.BodyMetricMetadata = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const User_1 = require("./User");
const Enums_1 = require("./shared/Enums");
const ModelUtils = __importStar(require("./shared/Utils"));
class BodyMetricMetadata {
}
exports.BodyMetricMetadata = BodyMetricMetadata;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BodyMetricMetadata.prototype, "previousValue", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], BodyMetricMetadata.prototype, "previousDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BodyMetricMetadata.prototype, "changeAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BodyMetricMetadata.prototype, "changePercent", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BodyMetricMetadata.prototype, "device", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BodyMetricMetadata.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BodyMetricMetadata.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BodyMetricMetadata.prototype, "confidence", void 0);
let BodyMetric = class BodyMetric {
    calculateChangePercentage(previousValue) {
        var _a;
        const prevValue = previousValue || ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.previousValue);
        if (!prevValue)
            return 0;
        return ModelUtils.normalize(((this.value - prevValue) / prevValue) * 100, -100, 100);
    }
    isTargetMet() {
        if (!this.targetValue)
            return false;
        if (this.desiredTrend === Enums_1.TrendDirection.DECREASING) {
            return this.value <= this.targetValue;
        }
        return this.value >= this.targetValue;
    }
    calculateProgress(startValue) {
        var _a;
        if (!this.targetValue)
            return 0;
        const start = startValue || ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.previousValue) || 0;
        const current = this.value;
        if (this.desiredTrend === Enums_1.TrendDirection.DECREASING) {
            if (start <= this.targetValue)
                return 100;
            const range = start - this.targetValue;
            const progress = start - current;
            return ModelUtils.normalize((progress / range) * 100, 0, 100);
        }
        if (this.targetValue <= start)
            return 100;
        const range = this.targetValue - start;
        const progress = current - start;
        return ModelUtils.normalize((progress / range) * 100, 0, 100);
    }
};
exports.BodyMetric = BodyMetric;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BodyMetric.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_1.User)
], BodyMetric.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.BodyArea
    }),
    (0, class_validator_1.IsEnum)(Enums_1.BodyArea),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], BodyMetric.prototype, "bodyArea", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.MetricValueType,
        default: Enums_1.MetricValueType.NUMERIC
    }),
    (0, class_validator_1.IsEnum)(Enums_1.MetricValueType),
    __metadata("design:type", String)
], BodyMetric.prototype, "valueType", void 0);
__decorate([
    (0, typeorm_1.Column)("float"),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], BodyMetric.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.MeasurementUnit,
        default: Enums_1.MeasurementUnit.KILOGRAM
    }),
    (0, class_validator_1.IsEnum)(Enums_1.MeasurementUnit),
    __metadata("design:type", String)
], BodyMetric.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp with time zone" }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], BodyMetric.prototype, "measurementDate", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { nullable: true }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], BodyMetric.prototype, "targetValue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.TrendDirection,
        nullable: true
    }),
    (0, class_validator_1.IsEnum)(Enums_1.TrendDirection),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BodyMetric.prototype, "desiredTrend", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BodyMetricMetadata),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", BodyMetricMetadata)
], BodyMetric.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BodyMetric.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], BodyMetric.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], BodyMetric.prototype, "updatedAt", void 0);
exports.BodyMetric = BodyMetric = __decorate([
    (0, typeorm_1.Entity)("body_metrics"),
    (0, typeorm_1.Check)(`"value" >= 0`)
], BodyMetric);
//# sourceMappingURL=BodyMetric.js.map