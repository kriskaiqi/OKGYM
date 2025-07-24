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
exports.UserProgress = exports.ProgressTrend = exports.ProgressType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const MetricTracking_1 = require("./MetricTracking");
var ProgressType;
(function (ProgressType) {
    ProgressType["STRENGTH"] = "STRENGTH";
    ProgressType["ENDURANCE"] = "ENDURANCE";
    ProgressType["FLEXIBILITY"] = "FLEXIBILITY";
    ProgressType["BODY_COMPOSITION"] = "BODY_COMPOSITION";
    ProgressType["WEIGHT"] = "WEIGHT";
    ProgressType["SKILL"] = "SKILL";
    ProgressType["WORKOUT_VOLUME"] = "WORKOUT_VOLUME";
    ProgressType["CONSISTENCY"] = "CONSISTENCY";
    ProgressType["NUTRITION"] = "NUTRITION";
    ProgressType["SLEEP"] = "SLEEP";
    ProgressType["CUSTOM"] = "CUSTOM";
})(ProgressType || (exports.ProgressType = ProgressType = {}));
var ProgressTrend;
(function (ProgressTrend) {
    ProgressTrend["IMPROVING"] = "IMPROVING";
    ProgressTrend["MAINTAINING"] = "MAINTAINING";
    ProgressTrend["DECLINING"] = "DECLINING";
    ProgressTrend["PLATEAU"] = "PLATEAU";
    ProgressTrend["INCONSISTENT"] = "INCONSISTENT";
})(ProgressTrend || (exports.ProgressTrend = ProgressTrend = {}));
let UserProgress = class UserProgress {
};
exports.UserProgress = UserProgress;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserProgress.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.Index)("idx_fk_userprogress_user"),
    __metadata("design:type", User_1.User)
], UserProgress.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid"),
    (0, typeorm_1.Index)("idx_userprogress_user_id"),
    __metadata("design:type", String)
], UserProgress.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => MetricTracking_1.MetricTracking, {
        nullable: true,
        onDelete: "CASCADE",
        cascade: true
    }),
    (0, typeorm_1.JoinColumn)({ name: "metric_tracking_id" }),
    (0, typeorm_1.Index)("idx_fk_userprogress_metric"),
    __metadata("design:type", MetricTracking_1.MetricTracking)
], UserProgress.prototype, "metricTracking", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { nullable: true }),
    (0, typeorm_1.Index)("idx_userprogress_metric_id"),
    __metadata("design:type", String)
], UserProgress.prototype, "metric_tracking_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ProgressType,
        default: ProgressType.CUSTOM
    }),
    (0, typeorm_1.Index)("idx_userprogress_type"),
    __metadata("design:type", String)
], UserProgress.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar"),
    (0, typeorm_1.Index)("idx_userprogress_metric_name"),
    __metadata("design:type", String)
], UserProgress.prototype, "metricName", void 0);
__decorate([
    (0, typeorm_1.Column)("date"),
    (0, typeorm_1.Index)("idx_userprogress_date"),
    __metadata("design:type", Date)
], UserProgress.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)("float"),
    __metadata("design:type", Number)
], UserProgress.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserProgress.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, typeorm_1.Index)("idx_userprogress_exercise"),
    __metadata("design:type", String)
], UserProgress.prototype, "exerciseId", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { nullable: true }),
    __metadata("design:type", Number)
], UserProgress.prototype, "baseline", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { nullable: true }),
    __metadata("design:type", Number)
], UserProgress.prototype, "target", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { default: 0 }),
    __metadata("design:type", Number)
], UserProgress.prototype, "percentChange", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ProgressTrend,
        nullable: true
    }),
    __metadata("design:type", String)
], UserProgress.prototype, "trend", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], UserProgress.prototype, "previousDate", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { nullable: true }),
    __metadata("design:type", Number)
], UserProgress.prototype, "previousValue", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], UserProgress.prototype, "relatedMetrics", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], UserProgress.prototype, "context", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], UserProgress.prototype, "analysis", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserProgress.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserProgress.prototype, "updatedAt", void 0);
exports.UserProgress = UserProgress = __decorate([
    (0, typeorm_1.Entity)("user_progress"),
    (0, typeorm_1.Index)("idx_userprogress_metric_date", ["metricName", "date"]),
    (0, typeorm_1.Index)("idx_userprogress_type_user", ["type", "user_id"])
], UserProgress);
//# sourceMappingURL=UserProgress.js.map