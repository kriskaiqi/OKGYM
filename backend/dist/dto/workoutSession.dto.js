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
exports.SubmitSessionFeedbackDto = exports.CompleteExerciseDto = exports.UpdateSessionStatusDto = exports.SkipExerciseDto = exports.RecordExerciseCompletionDto = exports.GetUserSessionsDto = exports.StartSessionDto = void 0;
const class_validator_1 = require("class-validator");
const Enums_1 = require("../models/shared/Enums");
class StartSessionDto {
}
exports.StartSessionDto = StartSessionDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Workout Plan ID is required' }),
    (0, class_validator_1.ValidateIf)(o => typeof o.workoutPlanId === 'string'),
    (0, class_validator_1.IsString)({ message: 'Workout Plan ID must be a string or number' }),
    (0, class_validator_1.ValidateIf)(o => typeof o.workoutPlanId === 'number'),
    (0, class_validator_1.IsNumber)({}, { message: 'Workout Plan ID must be a string or number' }),
    __metadata("design:type", Object)
], StartSessionDto.prototype, "workoutPlanId", void 0);
class GetUserSessionsDto {
}
exports.GetUserSessionsDto = GetUserSessionsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Enums_1.SessionStatus),
    __metadata("design:type", String)
], GetUserSessionsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetUserSessionsDto.prototype, "startDateMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetUserSessionsDto.prototype, "startDateMax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetUserSessionsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GetUserSessionsDto.prototype, "offset", void 0);
class RecordExerciseCompletionDto {
}
exports.RecordExerciseCompletionDto = RecordExerciseCompletionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RecordExerciseCompletionDto.prototype, "repetitions", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RecordExerciseCompletionDto.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], RecordExerciseCompletionDto.prototype, "formScore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordExerciseCompletionDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RecordExerciseCompletionDto.prototype, "setNumber", void 0);
class SkipExerciseDto {
}
exports.SkipExerciseDto = SkipExerciseDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SkipExerciseDto.prototype, "reason", void 0);
class UpdateSessionStatusDto {
}
exports.UpdateSessionStatusDto = UpdateSessionStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(Enums_1.SessionStatus),
    __metadata("design:type", String)
], UpdateSessionStatusDto.prototype, "status", void 0);
class CompleteExerciseDto {
}
exports.CompleteExerciseDto = CompleteExerciseDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CompleteExerciseDto.prototype, "repetitions", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CompleteExerciseDto.prototype, "weight", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CompleteExerciseDto.prototype, "formScore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteExerciseDto.prototype, "notes", void 0);
class SubmitSessionFeedbackDto {
}
exports.SubmitSessionFeedbackDto = SubmitSessionFeedbackDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], SubmitSessionFeedbackDto.prototype, "difficultyRating", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitSessionFeedbackDto.prototype, "feedback", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], SubmitSessionFeedbackDto.prototype, "focusAreas", void 0);
//# sourceMappingURL=workoutSession.dto.js.map