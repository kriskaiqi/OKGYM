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
exports.UserProfileDto = exports.UserStatsUpdateDto = exports.UserStatsDto = exports.UserResponseDto = exports.ChangePasswordDto = exports.UserFilterDto = exports.UserPreferencesDto = exports.UserFitnessProfileDto = exports.UserUpdateDto = exports.UserCreateDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const User_1 = require("../models/User");
const Enums_1 = require("../models/shared/Enums");
class WeightHistoryEntryDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Object)
], WeightHistoryEntryDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], WeightHistoryEntryDto.prototype, "weight", void 0);
class UserCreateDto {
}
exports.UserCreateDto = UserCreateDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    __metadata("design:type", String)
], UserCreateDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'First name must be a string' }),
    (0, class_validator_1.MinLength)(1, { message: 'First name is required' }),
    (0, class_validator_1.MaxLength)(50, { message: 'First name cannot exceed 50 characters' }),
    __metadata("design:type", String)
], UserCreateDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Last name must be a string' }),
    (0, class_validator_1.MinLength)(1, { message: 'Last name is required' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Last name cannot exceed 50 characters' }),
    __metadata("design:type", String)
], UserCreateDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Password cannot exceed 100 characters' }),
    __metadata("design:type", String)
], UserCreateDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(User_1.UserRole, { message: 'Invalid user role' }),
    __metadata("design:type", String)
], UserCreateDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(User_1.UserStatus, { message: 'Invalid user status' }),
    __metadata("design:type", String)
], UserCreateDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Phone number must be a string' }),
    __metadata("design:type", String)
], UserCreateDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UserCreateDto.prototype, "dateOfBirth", void 0);
class UserUpdateDto {
}
exports.UserUpdateDto = UserUpdateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'First name must be a string' }),
    (0, class_validator_1.MinLength)(1, { message: 'First name cannot be empty' }),
    (0, class_validator_1.MaxLength)(50, { message: 'First name cannot exceed 50 characters' }),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Last name must be a string' }),
    (0, class_validator_1.MinLength)(1, { message: 'Last name cannot be empty' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Last name cannot exceed 50 characters' }),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Password cannot exceed 100 characters' }),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(User_1.UserRole, { message: 'Invalid user role' }),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(User_1.UserStatus, { message: 'Invalid user status' }),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Phone number must be a string' }),
    __metadata("design:type", String)
], UserUpdateDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], UserUpdateDto.prototype, "dateOfBirth", void 0);
class UserFitnessProfileDto {
}
exports.UserFitnessProfileDto = UserFitnessProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Age must be a number' }),
    (0, class_validator_1.Min)(1, { message: 'Age must be at least 1' }),
    (0, class_validator_1.Max)(120, { message: 'Age cannot exceed 120' }),
    __metadata("design:type", Number)
], UserFitnessProfileDto.prototype, "age", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Height must be a number' }),
    (0, class_validator_1.Min)(30, { message: 'Height must be at least 30 cm' }),
    (0, class_validator_1.Max)(300, { message: 'Height cannot exceed 300 cm' }),
    __metadata("design:type", Number)
], UserFitnessProfileDto.prototype, "heightCm", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Weight must be a number' }),
    (0, class_validator_1.Min)(20, { message: 'Weight must be at least 20 kg' }),
    (0, class_validator_1.Max)(300, { message: 'Weight cannot exceed 300 kg' }),
    __metadata("design:type", Number)
], UserFitnessProfileDto.prototype, "weightKg", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.Gender, { message: 'Invalid gender value' }),
    __metadata("design:type", String)
], UserFitnessProfileDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.ActivityLevel, { message: 'Invalid activity level' }),
    __metadata("design:type", String)
], UserFitnessProfileDto.prototype, "activityLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Fitness goals must be an array' }),
    (0, class_validator_1.ArrayMinSize)(0, { message: 'Fitness goals array cannot be null' }),
    (0, class_validator_1.ArrayMaxSize)(10, { message: 'Cannot select more than 10 fitness goals' }),
    (0, class_validator_1.IsEnum)(Enums_1.FitnessGoal, { each: true, message: 'Invalid fitness goal' }),
    __metadata("design:type", Array)
], UserFitnessProfileDto.prototype, "fitnessGoals", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.Difficulty, { message: 'Invalid fitness level' }),
    __metadata("design:type", String)
], UserFitnessProfileDto.prototype, "fitnessLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.WorkoutLocation, { message: 'Invalid preferred workout location' }),
    __metadata("design:type", String)
], UserFitnessProfileDto.prototype, "preferredLocation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Exercise preferences must be an array' }),
    (0, class_validator_1.ArrayMinSize)(0, { message: 'Exercise preferences array cannot be null' }),
    (0, class_validator_1.ArrayMaxSize)(10, { message: 'Cannot select more than 10 exercise preferences' }),
    (0, class_validator_1.IsEnum)(Enums_1.ExercisePreference, { each: true, message: 'Invalid exercise preference' }),
    __metadata("design:type", Array)
], UserFitnessProfileDto.prototype, "exercisePreferences", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Target body areas must be an array' }),
    (0, class_validator_1.ArrayMinSize)(0, { message: 'Target body areas array cannot be null' }),
    (0, class_validator_1.ArrayMaxSize)(10, { message: 'Cannot select more than 10 target body areas' }),
    (0, class_validator_1.IsEnum)(Enums_1.BodyArea, { each: true, message: 'Invalid target body area' }),
    __metadata("design:type", Array)
], UserFitnessProfileDto.prototype, "targetBodyAreas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Birth year must be a number' }),
    (0, class_validator_1.Min)(1900, { message: 'Birth year must be at least 1900' }),
    (0, class_validator_1.Max)(new Date().getFullYear(), { message: 'Birth year cannot be in the future' }),
    __metadata("design:type", Number)
], UserFitnessProfileDto.prototype, "birthYear", void 0);
class UserPreferencesDto {
}
exports.UserPreferencesDto = UserPreferencesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.MeasurementUnit, { message: 'Invalid preferred measurement unit' }),
    __metadata("design:type", String)
], UserPreferencesDto.prototype, "preferredUnit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.AppTheme, { message: 'Invalid preferred app theme' }),
    __metadata("design:type", String)
], UserPreferencesDto.prototype, "preferredTheme", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'Notification preferences must be an array' }),
    __metadata("design:type", Array)
], UserPreferencesDto.prototype, "notificationPreferences", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Language must be a string' }),
    __metadata("design:type", String)
], UserPreferencesDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Date of birth must be a string in ISO format' }),
    __metadata("design:type", String)
], UserPreferencesDto.prototype, "dateOfBirth", void 0);
class UserFilterDto {
    static formatQueryParams(query) {
        const formatted = Object.assign({}, query);
        if (query.exercisePreferences && typeof query.exercisePreferences === 'string') {
            formatted.exercisePreferences = query.exercisePreferences.split(',');
        }
        if (query.targetBodyAreas && typeof query.targetBodyAreas === 'string') {
            formatted.targetBodyAreas = query.targetBodyAreas.split(',');
        }
        if (query.fitnessGoals && typeof query.fitnessGoals === 'string') {
            formatted.fitnessGoals = query.fitnessGoals.split(',');
        }
        if (query.includePreferences !== undefined) {
            formatted.includePreferences = query.includePreferences === 'true';
        }
        if (query.includeFitnessGoals !== undefined) {
            formatted.includeFitnessGoals = query.includeFitnessGoals === 'true';
        }
        if (query.limit !== undefined) {
            formatted.limit = parseInt(query.limit, 10);
        }
        if (query.offset !== undefined) {
            formatted.offset = parseInt(query.offset, 10);
        }
        return formatted;
    }
}
exports.UserFilterDto = UserFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(User_1.UserRole),
    __metadata("design:type", String)
], UserFilterDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(User_1.UserStatus),
    __metadata("design:type", String)
], UserFilterDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UserFilterDto.prototype, "searchTerm", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.Gender),
    __metadata("design:type", String)
], UserFilterDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.ActivityLevel),
    __metadata("design:type", String)
], UserFilterDto.prototype, "activityLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.Difficulty),
    __metadata("design:type", String)
], UserFilterDto.prototype, "minimumFitnessLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(Enums_1.FitnessGoal, { each: true }),
    __metadata("design:type", Array)
], UserFilterDto.prototype, "fitnessGoals", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.WorkoutLocation),
    __metadata("design:type", String)
], UserFilterDto.prototype, "preferredLocation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(Enums_1.ExercisePreference, { each: true }),
    __metadata("design:type", Array)
], UserFilterDto.prototype, "exercisePreferences", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(Enums_1.BodyArea, { each: true }),
    __metadata("design:type", Array)
], UserFilterDto.prototype, "targetBodyAreas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserFilterDto.prototype, "includePreferences", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserFilterDto.prototype, "includeFitnessGoals", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UserFilterDto.prototype, "offset", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UserFilterDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserFilterDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ASC', 'DESC']),
    __metadata("design:type", String)
], UserFilterDto.prototype, "sortDirection", void 0);
class ChangePasswordDto {
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Current password must be a string' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'New password must be a string' }),
    (0, class_validator_1.MinLength)(8, { message: 'New password must be at least 8 characters long' }),
    (0, class_validator_1.MaxLength)(100, { message: 'New password cannot exceed 100 characters' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class UserResponseDto {
}
exports.UserResponseDto = UserResponseDto;
class UserStatsDto {
    constructor() {
        this.weightUnit = 'METRIC';
    }
}
exports.UserStatsDto = UserStatsDto;
class UserStatsUpdateDto {
}
exports.UserStatsUpdateDto = UserStatsUpdateDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UserStatsUpdateDto.prototype, "lastWorkoutDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(20),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], UserStatsUpdateDto.prototype, "currentWeight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(20),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], UserStatsUpdateDto.prototype, "startingWeight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WeightHistoryEntryDto),
    __metadata("design:type", Array)
], UserStatsUpdateDto.prototype, "weightHistory", void 0);
class UserProfileDto {
    constructor() {
        this.recentActivities = [];
        this.achievements = [];
        this.fitnessGoals = [];
        this.bodyMetrics = [];
        this.favoriteWorkouts = [];
    }
}
exports.UserProfileDto = UserProfileDto;
__decorate([
    (0, class_transformer_1.Type)(() => UserResponseDto),
    __metadata("design:type", UserResponseDto)
], UserProfileDto.prototype, "user", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => UserStatsDto),
    __metadata("design:type", UserStatsDto)
], UserProfileDto.prototype, "stats", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Array)
], UserProfileDto.prototype, "recentActivities", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Array)
], UserProfileDto.prototype, "achievements", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Array)
], UserProfileDto.prototype, "fitnessGoals", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Array)
], UserProfileDto.prototype, "bodyMetrics", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Type)(() => Object),
    __metadata("design:type", Array)
], UserProfileDto.prototype, "favoriteWorkouts", void 0);
//# sourceMappingURL=UserDto.js.map