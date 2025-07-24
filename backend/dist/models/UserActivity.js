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
exports.UserActivity = exports.ActivityPlatform = exports.ActivityType = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var ActivityType;
(function (ActivityType) {
    ActivityType["LOGIN"] = "LOGIN";
    ActivityType["LOGOUT"] = "LOGOUT";
    ActivityType["VIEW_WORKOUT"] = "VIEW_WORKOUT";
    ActivityType["COMPLETE_WORKOUT"] = "COMPLETE_WORKOUT";
    ActivityType["CREATE_WORKOUT"] = "CREATE_WORKOUT";
    ActivityType["SAVE_WORKOUT"] = "SAVE_WORKOUT";
    ActivityType["RATE_WORKOUT"] = "RATE_WORKOUT";
    ActivityType["VIEW_EXERCISE"] = "VIEW_EXERCISE";
    ActivityType["UPDATE_PROFILE"] = "UPDATE_PROFILE";
    ActivityType["SET_GOAL"] = "SET_GOAL";
    ActivityType["ACHIEVE_GOAL"] = "ACHIEVE_GOAL";
    ActivityType["EARN_ACHIEVEMENT"] = "EARN_ACHIEVEMENT";
    ActivityType["ENROLL_PROGRAM"] = "ENROLL_PROGRAM";
    ActivityType["COMPLETE_PROGRAM"] = "COMPLETE_PROGRAM";
    ActivityType["SEARCH"] = "SEARCH";
    ActivityType["UPDATE_SCHEDULE"] = "UPDATE_SCHEDULE";
    ActivityType["UPDATE_METRICS"] = "UPDATE_METRICS";
    ActivityType["SHARE_CONTENT"] = "SHARE_CONTENT";
    ActivityType["VIEW_ANALYTICS"] = "VIEW_ANALYTICS";
    ActivityType["CREATE_EQUIPMENT"] = "CREATE_EQUIPMENT";
    ActivityType["OTHER"] = "OTHER";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var ActivityPlatform;
(function (ActivityPlatform) {
    ActivityPlatform["WEB"] = "WEB";
    ActivityPlatform["ANDROID"] = "ANDROID";
    ActivityPlatform["IOS"] = "IOS";
    ActivityPlatform["DESKTOP"] = "DESKTOP";
    ActivityPlatform["API"] = "API";
})(ActivityPlatform || (exports.ActivityPlatform = ActivityPlatform = {}));
let UserActivity = class UserActivity {
};
exports.UserActivity = UserActivity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserActivity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_1.User)
], UserActivity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ActivityType,
        default: ActivityType.OTHER
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], UserActivity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ActivityPlatform,
        default: ActivityPlatform.WEB
    }),
    __metadata("design:type", String)
], UserActivity.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], UserActivity.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], UserActivity.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], UserActivity.prototype, "context", void 0);
exports.UserActivity = UserActivity = __decorate([
    (0, typeorm_1.Entity)("user_activities")
], UserActivity);
//# sourceMappingURL=UserActivity.js.map