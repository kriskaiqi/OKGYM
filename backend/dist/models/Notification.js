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
exports.Notification = exports.NotificationChannel = exports.NotificationStatus = exports.NotificationPriority = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var NotificationType;
(function (NotificationType) {
    NotificationType["WORKOUT_REMINDER"] = "WORKOUT_REMINDER";
    NotificationType["WORKOUT_COMPLETED"] = "WORKOUT_COMPLETED";
    NotificationType["WORKOUT_MISSED"] = "WORKOUT_MISSED";
    NotificationType["WORKOUT_RECOMMENDATION"] = "WORKOUT_RECOMMENDATION";
    NotificationType["ACHIEVEMENT_EARNED"] = "ACHIEVEMENT_EARNED";
    NotificationType["ACHIEVEMENT_PROGRESS"] = "ACHIEVEMENT_PROGRESS";
    NotificationType["GOAL_REMINDER"] = "GOAL_REMINDER";
    NotificationType["GOAL_MILESTONE"] = "GOAL_MILESTONE";
    NotificationType["GOAL_ACHIEVED"] = "GOAL_ACHIEVED";
    NotificationType["PROGRAM_REMINDER"] = "PROGRAM_REMINDER";
    NotificationType["PROGRAM_MILESTONE"] = "PROGRAM_MILESTONE";
    NotificationType["PROGRAM_COMPLETED"] = "PROGRAM_COMPLETED";
    NotificationType["SYSTEM_ANNOUNCEMENT"] = "SYSTEM_ANNOUNCEMENT";
    NotificationType["SYSTEM_MAINTENANCE"] = "SYSTEM_MAINTENANCE";
    NotificationType["FEATURE_RELEASE"] = "FEATURE_RELEASE";
    NotificationType["PROFILE_INCOMPLETE"] = "PROFILE_INCOMPLETE";
    NotificationType["STREAK_REMINDER"] = "STREAK_REMINDER";
    NotificationType["INACTIVITY_REMINDER"] = "INACTIVITY_REMINDER";
    NotificationType["CUSTOM"] = "CUSTOM";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "LOW";
    NotificationPriority["MEDIUM"] = "MEDIUM";
    NotificationPriority["HIGH"] = "HIGH";
    NotificationPriority["URGENT"] = "URGENT";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "PENDING";
    NotificationStatus["DELIVERED"] = "DELIVERED";
    NotificationStatus["READ"] = "READ";
    NotificationStatus["FAILED"] = "FAILED";
    NotificationStatus["CANCELLED"] = "CANCELLED";
})(NotificationStatus || (exports.NotificationStatus = NotificationStatus = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["IN_APP"] = "IN_APP";
    NotificationChannel["PUSH"] = "PUSH";
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["SMS"] = "SMS";
    NotificationChannel["ALL"] = "ALL";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false, onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_1.User)
], Notification.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: NotificationType,
        default: NotificationType.SYSTEM_ANNOUNCEMENT
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: NotificationPriority,
        default: NotificationPriority.MEDIUM
    }),
    __metadata("design:type", String)
], Notification.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: NotificationStatus,
        default: NotificationStatus.PENDING
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Notification.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: NotificationChannel,
        default: NotificationChannel.IN_APP
    }),
    __metadata("design:type", String)
], Notification.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Notification.prototype, "scheduledFor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "deliveredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "actionUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "actionLabel", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Notification.prototype, "relatedEntityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Notification.prototype, "relatedEntityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isDismissible", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "hasExpiration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "created_at" }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: "updated_at" }),
    __metadata("design:type", Date)
], Notification.prototype, "updatedAt", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)("notifications")
], Notification);
//# sourceMappingURL=Notification.js.map