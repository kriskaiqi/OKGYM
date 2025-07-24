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
exports.UserEquipment = exports.EquipmentLocation = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Enums_1 = require("./shared/Enums");
var EquipmentLocation;
(function (EquipmentLocation) {
    EquipmentLocation["HOME"] = "HOME";
    EquipmentLocation["GYM"] = "GYM";
    EquipmentLocation["OFFICE"] = "OFFICE";
    EquipmentLocation["OUTDOOR"] = "OUTDOOR";
    EquipmentLocation["TRAVEL"] = "TRAVEL";
    EquipmentLocation["OTHER"] = "OTHER";
})(EquipmentLocation || (exports.EquipmentLocation = EquipmentLocation = {}));
let UserEquipment = class UserEquipment {
};
exports.UserEquipment = UserEquipment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserEquipment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "user_id" }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", User_1.User)
], UserEquipment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar"),
    __metadata("design:type", String)
], UserEquipment.prototype, "equipmentName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: Enums_1.EquipmentCategory,
        default: Enums_1.EquipmentCategory.ACCESSORIES
    }),
    __metadata("design:type", String)
], UserEquipment.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: EquipmentLocation,
        default: EquipmentLocation.HOME
    }),
    __metadata("design:type", String)
], UserEquipment.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UserEquipment.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserEquipment.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserEquipment.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], UserEquipment.prototype, "specifications", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    __metadata("design:type", String)
], UserEquipment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], UserEquipment.prototype, "purchaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)("float", { nullable: true }),
    __metadata("design:type", Number)
], UserEquipment.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], UserEquipment.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)("jsonb", { nullable: true }),
    __metadata("design:type", Object)
], UserEquipment.prototype, "usageStats", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserEquipment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserEquipment.prototype, "updatedAt", void 0);
exports.UserEquipment = UserEquipment = __decorate([
    (0, typeorm_1.Entity)("user_equipment"),
    (0, typeorm_1.Unique)(["user", "equipmentName", "location"])
], UserEquipment);
//# sourceMappingURL=UserEquipment.js.map