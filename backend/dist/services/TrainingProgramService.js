"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainingProgramService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const TrainingProgram_1 = require("../models/TrainingProgram");
const Enums_1 = require("../models/shared/Enums");
const mockTrainingPrograms = [
    {
        id: 1,
        name: "6-Week Beginner Strength Foundation",
        description: "A comprehensive program designed for beginners to build a solid foundation in strength training. This program gradually introduces fundamental movements and progressively increases intensity.",
        difficulty: TrainingProgram_1.ProgramLevel.BEGINNER,
        category: TrainingProgram_1.ProgramCategory.STRENGTH,
        durationWeeks: 6,
        workoutsPerWeek: 3,
        estimatedMinutesPerWorkout: 45,
        imageUrl: "https://example.com/images/beginner-strength.jpg",
        tags: ["beginner", "strength", "foundation"],
        isPublished: true,
        enrollmentCount: 325,
        completionCount: 178,
        rating: 4.7,
        ratingCount: 156,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
            equipment: ["Dumbbells", "Resistance Bands", "Exercise Mat"],
            prerequisites: ["No prior experience needed", "Basic mobility"],
            expectedResults: ["Increased strength in major muscle groups", "Improved form", "Better understanding of basic exercises"],
            weeklyBreakdown: {
                1: "Introduction to basic movements and proper form",
                2: "Focus on building consistency and slight weight progression",
                3: "Introduction to supersets and compound movements",
                4: "Increasing volume and intensity",
                5: "Advanced techniques and time under tension",
                6: "Peak week with maximum intensity before deload"
            }
        }
    },
    {
        id: 2,
        name: "12-Week Body Transformation",
        description: "A comprehensive program combining strength training, hypertrophy, and conditioning designed to transform your body composition. Perfect for intermediate trainees looking to build muscle and reduce body fat.",
        difficulty: TrainingProgram_1.ProgramLevel.INTERMEDIATE,
        category: TrainingProgram_1.ProgramCategory.HYPERTROPHY,
        durationWeeks: 12,
        workoutsPerWeek: 4,
        estimatedMinutesPerWorkout: 60,
        imageUrl: "https://example.com/images/body-transformation.jpg",
        tags: ["transformation", "hypertrophy", "conditioning"],
        isPublished: true,
        enrollmentCount: 512,
        completionCount: 289,
        rating: 4.8,
        ratingCount: 245,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
            equipment: ["Dumbbells", "Barbell", "Bench", "Pull-up Bar"],
            prerequisites: ["6+ months of consistent training", "Familiarity with basic exercises"],
            expectedResults: ["Increased muscle mass", "Reduced body fat", "Improved overall physique"],
            weeklyBreakdown: {
                1: "Assessment and foundation building",
                2: "Upper/lower body split with moderate intensity",
                3: "Focus on progressive overload",
                4: "Introduction of drop sets and intensity techniques",
                5: "Increased volume phase",
                6: "Strength focus with lower reps, higher weight",
                7: "Hypertrophy focus with moderate reps",
                8: "Introduction of circuit training for conditioning",
                9: "Peak volume week",
                10: "Intensity techniques and advanced methods",
                11: "Strength peak week",
                12: "Deload and final assessment"
            }
        }
    },
    {
        id: 3,
        name: "8-Week Fat Loss Accelerator",
        description: "An intensive program designed to maximize fat loss while preserving lean muscle mass. Combines HIIT, metabolic resistance training, and strategic cardio for optimal results.",
        difficulty: TrainingProgram_1.ProgramLevel.ADVANCED,
        category: TrainingProgram_1.ProgramCategory.WEIGHT_LOSS,
        durationWeeks: 8,
        workoutsPerWeek: 5,
        estimatedMinutesPerWorkout: 50,
        imageUrl: "https://example.com/images/fat-loss.jpg",
        tags: ["fat loss", "conditioning", "hiit"],
        isPublished: true,
        enrollmentCount: 428,
        completionCount: 187,
        rating: 4.5,
        ratingCount: 163,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
            equipment: ["Full Gym Access", "Cardio Equipment"],
            prerequisites: ["Moderate fitness level", "No injuries"],
            expectedResults: ["Significant fat loss", "Improved conditioning", "Enhanced metabolic rate"],
            weeklyBreakdown: {
                1: "Baseline establishment and metabolic activation",
                2: "Introduction to circuit training and HIIT",
                3: "Increased intensity and reduced rest periods",
                4: "Peak intensity week with maximum calorie burn",
                5: "Introduction of complexes and cardio acceleration",
                6: "Strategic deload with active recovery",
                7: "Final push with maximum intensity methods",
                8: "Peak week and measurements"
            }
        }
    }
];
const mockWorkoutSchedules = {
    1: [
        { workoutPlanId: 1, weekNumber: 1, dayOfWeek: "MONDAY", notes: "Focus on form and technique" },
        { workoutPlanId: 2, weekNumber: 1, dayOfWeek: "WEDNESDAY", notes: "Light intensity to build foundation" },
        { workoutPlanId: 3, weekNumber: 1, dayOfWeek: "FRIDAY", notes: "Full body workout with basic movements" },
        { workoutPlanId: 1, weekNumber: 2, dayOfWeek: "MONDAY", notes: "Increase weight slightly if form is good" },
        { workoutPlanId: 2, weekNumber: 2, dayOfWeek: "WEDNESDAY", notes: "Focus on mind-muscle connection" },
        { workoutPlanId: 3, weekNumber: 2, dayOfWeek: "FRIDAY", notes: "Try to increase reps or weight from last week" },
        { workoutPlanId: 4, weekNumber: 3, dayOfWeek: "MONDAY", notes: "Introduction to supersets" },
        { workoutPlanId: 5, weekNumber: 3, dayOfWeek: "WEDNESDAY", notes: "Focus on compound movements" },
        { workoutPlanId: 6, weekNumber: 3, dayOfWeek: "FRIDAY", notes: "Full body workout with increased intensity" },
        { workoutPlanId: 4, weekNumber: 4, dayOfWeek: "MONDAY", adjustments: { intensity: 110 } },
        { workoutPlanId: 5, weekNumber: 4, dayOfWeek: "WEDNESDAY", adjustments: { sets: 4, reps: 12 } },
        { workoutPlanId: 6, weekNumber: 4, dayOfWeek: "FRIDAY", notes: "Push yourself but maintain proper form" },
        { workoutPlanId: 1, weekNumber: 5, dayOfWeek: "MONDAY", adjustments: { intensity: 120 } },
        { workoutPlanId: 2, weekNumber: 5, dayOfWeek: "WEDNESDAY", adjustments: { intensity: 120 } },
        { workoutPlanId: 3, weekNumber: 5, dayOfWeek: "FRIDAY", adjustments: { intensity: 120 } },
        { workoutPlanId: 4, weekNumber: 6, dayOfWeek: "MONDAY", notes: "Peak intensity, give it your all" },
        { workoutPlanId: 5, weekNumber: 6, dayOfWeek: "WEDNESDAY", notes: "Focus on maximum effort" },
        { workoutPlanId: 6, weekNumber: 6, dayOfWeek: "FRIDAY", notes: "Final workout of the program, max effort!" }
    ],
    2: [
        { workoutPlanId: 1, weekNumber: 1, dayOfWeek: "MONDAY", notes: "Upper body focus" },
        { workoutPlanId: 3, weekNumber: 1, dayOfWeek: "TUESDAY", notes: "Lower body focus" },
        { workoutPlanId: 2, weekNumber: 1, dayOfWeek: "THURSDAY", notes: "Push exercises" },
        { workoutPlanId: 4, weekNumber: 1, dayOfWeek: "FRIDAY", notes: "Pull exercises" },
        { workoutPlanId: 5, weekNumber: 2, dayOfWeek: "MONDAY", notes: "Chest and triceps" },
        { workoutPlanId: 6, weekNumber: 2, dayOfWeek: "TUESDAY", notes: "Back and biceps" },
        { workoutPlanId: 3, weekNumber: 2, dayOfWeek: "THURSDAY", notes: "Legs and shoulders" },
        { workoutPlanId: 4, weekNumber: 2, dayOfWeek: "FRIDAY", notes: "Full body conditioning" },
        { workoutPlanId: 1, weekNumber: 3, dayOfWeek: "MONDAY", adjustments: { intensity: 110 } },
        { workoutPlanId: 3, weekNumber: 3, dayOfWeek: "TUESDAY", adjustments: { intensity: 110 } },
        { workoutPlanId: 2, weekNumber: 3, dayOfWeek: "THURSDAY", adjustments: { intensity: 110 } },
        { workoutPlanId: 4, weekNumber: 3, dayOfWeek: "FRIDAY", adjustments: { intensity: 110 } }
    ],
    3: [
        { workoutPlanId: 1, weekNumber: 1, dayOfWeek: "MONDAY", notes: "Full body HIIT" },
        { workoutPlanId: 2, weekNumber: 1, dayOfWeek: "TUESDAY", notes: "Upper body focus + cardio" },
        { workoutPlanId: 3, weekNumber: 1, dayOfWeek: "WEDNESDAY", isRestDay: true, notes: "Active recovery - light walking" },
        { workoutPlanId: 4, weekNumber: 1, dayOfWeek: "THURSDAY", notes: "Lower body focus + cardio" },
        { workoutPlanId: 5, weekNumber: 1, dayOfWeek: "FRIDAY", notes: "Circuit training" },
        { workoutPlanId: 6, weekNumber: 2, dayOfWeek: "MONDAY", notes: "High intensity circuit" },
        { workoutPlanId: 1, weekNumber: 2, dayOfWeek: "TUESDAY", adjustments: { intensity: 110, duration: 60 } },
        { workoutPlanId: 2, weekNumber: 2, dayOfWeek: "WEDNESDAY", isRestDay: true, notes: "Active recovery - light walking" },
        { workoutPlanId: 3, weekNumber: 2, dayOfWeek: "THURSDAY", adjustments: { intensity: 110, duration: 60 } },
        { workoutPlanId: 4, weekNumber: 2, dayOfWeek: "FRIDAY", notes: "Metabolic conditioning" }
    ]
};
const mockEnrollments = [
    {
        id: 1,
        user: { id: 1 },
        program: { id: 1 },
        status: Enums_1.EnrollmentStatus.ACTIVE,
        currentWeek: 3,
        completedWorkouts: 6,
        startDate: new Date(new Date().setDate(new Date().getDate() - 14)),
        completionDate: undefined,
        userRating: undefined,
        userFeedback: undefined,
        progress: {
            workoutHistory: {
                "W1D1": { completed: true, completionDate: new Date(new Date().setDate(new Date().getDate() - 14)), rating: 4, difficulty: 3 },
                "W1D2": { completed: true, completionDate: new Date(new Date().setDate(new Date().getDate() - 12)), rating: 4, difficulty: 3 },
                "W1D3": { completed: true, completionDate: new Date(new Date().setDate(new Date().getDate() - 10)), rating: 5, difficulty: 4 },
                "W2D1": { completed: true, completionDate: new Date(new Date().setDate(new Date().getDate() - 7)), rating: 4, difficulty: 4 },
                "W2D2": { completed: true, completionDate: new Date(new Date().setDate(new Date().getDate() - 5)), rating: 3, difficulty: 5 },
                "W2D3": { completed: true, completionDate: new Date(new Date().setDate(new Date().getDate() - 3)), rating: 4, difficulty: 4 }
            },
            weeklyNotes: {
                1: "Great first week! Feeling motivated.",
                2: "Second week was more challenging but I'm seeing progress."
            }
        },
        createdAt: new Date(new Date().setDate(new Date().getDate() - 14)),
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 3))
    }
];
class TrainingProgramService {
    async getAllPrograms() {
        logger_1.default.info('Getting all training programs');
        return mockTrainingPrograms;
    }
    async getProgramById(id) {
        logger_1.default.info(`Getting training program with ID: ${id}`);
        const program = mockTrainingPrograms.find(p => p.id === id);
        if (!program) {
            throw new Error('Training program not found');
        }
        return program;
    }
    async getProgramWorkouts(programId) {
        logger_1.default.info(`Getting workouts for program with ID: ${programId}`);
        const schedule = mockWorkoutSchedules[programId];
        if (!schedule) {
            throw new Error('Workout schedule not found for this program');
        }
        return schedule;
    }
    async createProgram(programData) {
        logger_1.default.info('Creating new training program', programData);
        const newId = Math.max(...mockTrainingPrograms.map(p => p.id)) + 1;
        const newProgram = Object.assign(Object.assign({}, programData), { id: newId, createdAt: new Date(), updatedAt: new Date(), enrollmentCount: 0, completionCount: 0, rating: 0, ratingCount: 0 });
        mockTrainingPrograms.push(newProgram);
        return newProgram;
    }
    async updateProgram(id, programData) {
        logger_1.default.info(`Updating training program with ID: ${id}`, programData);
        const index = mockTrainingPrograms.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('Training program not found');
        }
        mockTrainingPrograms[index] = Object.assign(Object.assign(Object.assign({}, mockTrainingPrograms[index]), programData), { id, updatedAt: new Date() });
        return mockTrainingPrograms[index];
    }
    async deleteProgram(id) {
        logger_1.default.info(`Deleting training program with ID: ${id}`);
        const index = mockTrainingPrograms.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error('Training program not found');
        }
        mockTrainingPrograms.splice(index, 1);
    }
    async addWorkoutToProgram(programId, workoutData) {
        logger_1.default.info(`Adding workout to program with ID: ${programId}`, workoutData);
        if (!mockWorkoutSchedules[programId]) {
            mockWorkoutSchedules[programId] = [];
        }
        mockWorkoutSchedules[programId].push(workoutData);
        return workoutData;
    }
    async updateProgramWorkout(programId, weekNumber, dayOfWeek, workoutData) {
        logger_1.default.info(`Updating workout for program ID: ${programId}, week: ${weekNumber}, day: ${dayOfWeek}`, workoutData);
        if (!mockWorkoutSchedules[programId]) {
            throw new Error('Program workout schedule not found');
        }
        const index = mockWorkoutSchedules[programId].findIndex(workout => workout.weekNumber === weekNumber && workout.dayOfWeek === dayOfWeek);
        if (index === -1) {
            throw new Error('Workout not found in the program schedule');
        }
        mockWorkoutSchedules[programId][index] = Object.assign(Object.assign({}, mockWorkoutSchedules[programId][index]), workoutData);
        return mockWorkoutSchedules[programId][index];
    }
    async enrollUserInProgram(userId, programId) {
        logger_1.default.info(`Enrolling user ${userId} in program ${programId}`);
        const program = mockTrainingPrograms.find(p => p.id === programId);
        if (!program) {
            throw new Error('Training program not found');
        }
        const existingEnrollment = mockEnrollments.find(e => e.user.id === userId && e.program.id === programId && e.status === Enums_1.EnrollmentStatus.ACTIVE);
        if (existingEnrollment) {
            throw new Error('User is already enrolled in this program');
        }
        const newEnrollment = {
            id: mockEnrollments.length + 1,
            user: { id: userId },
            program: { id: programId },
            status: Enums_1.EnrollmentStatus.ACTIVE,
            currentWeek: 1,
            completedWorkouts: 0,
            startDate: new Date(),
            progress: {
                workoutHistory: {},
                weeklyNotes: {}
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        mockEnrollments.push(newEnrollment);
        const programIndex = mockTrainingPrograms.findIndex(p => p.id === programId);
        if (programIndex !== -1) {
            mockTrainingPrograms[programIndex].enrollmentCount += 1;
        }
        return newEnrollment;
    }
    async getUserEnrollments(userId) {
        logger_1.default.info(`Getting enrollments for user ${userId}`);
        return mockEnrollments.filter(e => e.user.id === userId);
    }
    async updateEnrollmentProgress(enrollmentId, progressData) {
        logger_1.default.info(`Updating enrollment progress for enrollment ${enrollmentId}`, progressData);
        const index = mockEnrollments.findIndex(e => e.id === enrollmentId);
        if (index === -1) {
            throw new Error('Enrollment not found');
        }
        mockEnrollments[index] = Object.assign(Object.assign(Object.assign({}, mockEnrollments[index]), progressData), { updatedAt: new Date() });
        return mockEnrollments[index];
    }
    async completeWorkout(enrollmentId, week, day, completionData) {
        var _a;
        logger_1.default.info(`Marking workout as completed for enrollment ${enrollmentId}, week ${week}, day ${day}`, completionData);
        const index = mockEnrollments.findIndex(e => e.id === enrollmentId);
        if (index === -1) {
            throw new Error('Enrollment not found');
        }
        const workoutKey = `W${week}D${day}`;
        const enrollment = mockEnrollments[index];
        if (!enrollment.progress.workoutHistory) {
            enrollment.progress.workoutHistory = {};
        }
        enrollment.progress.workoutHistory[workoutKey] = Object.assign({ completed: true, completionDate: new Date() }, completionData);
        enrollment.completedWorkouts += 1;
        enrollment.updatedAt = new Date();
        const programId = enrollment.program.id;
        const workoutsInWeek = ((_a = mockWorkoutSchedules[programId]) === null || _a === void 0 ? void 0 : _a.filter(w => w.weekNumber === week)) || [];
        const workoutsCompletedInWeek = Object.keys(enrollment.progress.workoutHistory)
            .filter(key => key.startsWith(`W${week}`) && enrollment.progress.workoutHistory[key].completed)
            .length;
        if (workoutsCompletedInWeek >= workoutsInWeek.length && enrollment.currentWeek === week) {
            enrollment.currentWeek += 1;
            const program = mockTrainingPrograms.find(p => p.id === programId);
            if (program && enrollment.currentWeek > program.durationWeeks) {
                enrollment.status = Enums_1.EnrollmentStatus.COMPLETED;
                enrollment.completionDate = new Date();
                const programIndex = mockTrainingPrograms.findIndex(p => p.id === programId);
                if (programIndex !== -1) {
                    mockTrainingPrograms[programIndex].completionCount += 1;
                }
            }
        }
        return enrollment;
    }
    async rateProgram(enrollmentId, rating, feedback) {
        logger_1.default.info(`Rating program for enrollment ${enrollmentId}: ${rating}/5`);
        const index = mockEnrollments.findIndex(e => e.id === enrollmentId);
        if (index === -1) {
            throw new Error('Enrollment not found');
        }
        const enrollment = mockEnrollments[index];
        enrollment.userRating = rating;
        if (feedback) {
            enrollment.userFeedback = feedback;
        }
        enrollment.updatedAt = new Date();
        const programId = enrollment.program.id;
        const programIndex = mockTrainingPrograms.findIndex(p => p.id === programId);
        if (programIndex !== -1) {
            const program = mockTrainingPrograms[programIndex];
            const totalRatingPoints = program.rating * program.ratingCount + rating;
            program.ratingCount += 1;
            program.rating = totalRatingPoints / program.ratingCount;
        }
        return enrollment;
    }
}
exports.TrainingProgramService = TrainingProgramService;
//# sourceMappingURL=TrainingProgramService.js.map