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
exports.AIModelConfiguration = exports.AIModelType = void 0;
const typeorm_1 = require("typeorm");
const ExerciseSpecificAnalysis_1 = require("./ExerciseSpecificAnalysis");
var AIModelType;
(function (AIModelType) {
    AIModelType["SKLEARN"] = "SKLEARN";
    AIModelType["DEEP_LEARNING"] = "DEEP_LEARNING";
})(AIModelType || (exports.AIModelType = AIModelType = {}));
let AIModelConfiguration = class AIModelConfiguration {
};
exports.AIModelConfiguration = AIModelConfiguration;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], AIModelConfiguration.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ExerciseSpecificAnalysis_1.ExerciseAnalysisType,
        nullable: false
    }),
    (0, typeorm_1.Index)("idx_model_config_exercise_type"),
    __metadata("design:type", String)
], AIModelConfiguration.prototype, "exerciseType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: AIModelType,
        nullable: false
    }),
    (0, typeorm_1.Index)("idx_model_config_model_type"),
    __metadata("design:type", String)
], AIModelConfiguration.prototype, "modelType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: false }),
    __metadata("design:type", Object)
], AIModelConfiguration.prototype, "modelParameters", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: false }),
    __metadata("design:type", Object)
], AIModelConfiguration.prototype, "analysisRules", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], AIModelConfiguration.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    (0, typeorm_1.Index)("idx_model_config_active"),
    __metadata("design:type", Boolean)
], AIModelConfiguration.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], AIModelConfiguration.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], AIModelConfiguration.prototype, "updatedAt", void 0);
exports.AIModelConfiguration = AIModelConfiguration = __decorate([
    (0, typeorm_1.Entity)("ai_model_configuration"),
    (0, typeorm_1.Index)("idx_model_config_type", ["exerciseType", "modelType"])
], AIModelConfiguration);
//# sourceMappingURL=AIModelConfiguration.js.map