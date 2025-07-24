"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCacheValid = isCacheValid;
exports.deepCopy = deepCopy;
exports.getDurationMinutes = getDurationMinutes;
exports.scaleValue = scaleValue;
exports.normalize = normalize;
exports.mean = mean;
exports.formatDuration = formatDuration;
exports.generateId = generateId;
exports.calculateVolumeLoad = calculateVolumeLoad;
exports.calculateDensity = calculateDensity;
exports.calculateWorkoutTime = calculateWorkoutTime;
exports.calculateExerciseTime = calculateExerciseTime;
exports.calculateWorkoutIntensity = calculateWorkoutIntensity;
exports.calculateExerciseComplexity = calculateExerciseComplexity;
exports.scaleExerciseIntensity = scaleExerciseIntensity;
exports.scaleExerciseVolume = scaleExerciseVolume;
exports.calculateDropSets = calculateDropSets;
exports.getExerciseProgression = getExerciseProgression;
exports.generateExerciseRegression = generateExerciseRegression;
exports.generateExerciseProgression = generateExerciseProgression;
const Constants_1 = require("./Constants");
function isCacheValid(timestamp, maxAgeMinutes = 60) {
    const ageInMinutes = (Date.now() - timestamp.getTime()) / (60 * 1000);
    return ageInMinutes < maxAgeMinutes;
}
function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepCopy(item));
    }
    const copy = {};
    Object.keys(obj).forEach(key => {
        copy[key] = deepCopy(obj[key]);
    });
    return copy;
}
function getDurationMinutes(start, end) {
    return (end.getTime() - start.getTime()) / (60 * 1000);
}
function scaleValue(value, fromMin, fromMax, toMin, toMax) {
    if (fromMax === fromMin)
        return toMin;
    if (value <= fromMin)
        return toMin;
    if (value >= fromMax)
        return toMax;
    const fromRange = fromMax - fromMin;
    const toRange = toMax - toMin;
    const scaledValue = ((value - fromMin) / fromRange) * toRange + toMin;
    return scaledValue;
}
function normalize(value, min, max) {
    return scaleValue(value, min, max, 0, 1);
}
function mean(values) {
    if (values.length === 0)
        return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
}
function formatDuration(seconds) {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        const remainingSeconds = Math.round(seconds % 60);
        return remainingSeconds > 0
            ? `${minutes}m ${remainingSeconds}s`
            : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
}
function generateId(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
function calculateVolumeLoad(weight, reps, sets) {
    return weight * reps * sets;
}
function calculateDensity(volume, durationMinutes) {
    if (durationMinutes <= 0)
        return 0;
    return volume / durationMinutes;
}
function calculateWorkoutTime(estimatedDuration, warmupIncluded = false, cooldownIncluded = false, exercises = [], workoutStructure) {
    let totalTime = estimatedDuration;
    if (warmupIncluded)
        totalTime += Constants_1.TIME_CONSTANTS.STANDARD_WARMUP_MINUTES;
    if (cooldownIncluded)
        totalTime += Constants_1.TIME_CONSTANTS.STANDARD_COOLDOWN_MINUTES;
    let totalRestTime = 0;
    if (workoutStructure) {
        const { restBetweenExercises, restBetweenSets, totalSets } = workoutStructure;
        if (restBetweenExercises)
            totalRestTime += (exercises.length || 1) * (restBetweenExercises / 60);
        if (restBetweenSets && totalSets)
            totalRestTime += totalSets * (restBetweenSets / 60);
    }
    else if (exercises.length > 0) {
        totalRestTime = exercises.reduce((total, exercise) => {
            return total + ((exercise.restTime * exercise.sets) / 60);
        }, 0);
    }
    totalTime += totalRestTime;
    totalTime = Math.ceil(totalTime);
    return totalTime;
}
function calculateExerciseTime(sets, repetitions = 0, duration = 0, restTime = Constants_1.TIME_CONSTANTS.DEFAULT_REST_TIME_SECONDS, tempo) {
    let timePerSet = 0;
    if (duration > 0) {
        timePerSet = duration;
    }
    else if (repetitions > 0) {
        timePerSet = repetitions * Constants_1.TIME_CONSTANTS.DEFAULT_SECONDS_PER_REP;
        if (tempo) {
            const { eccentric, pause, concentric, pauseAtTop } = tempo;
            const tempoTotal = (eccentric || 0) + (pause || 0) + (concentric || 0) + (pauseAtTop || 0);
            if (tempoTotal > 0) {
                timePerSet = repetitions * tempoTotal;
            }
        }
    }
    else {
        timePerSet = Constants_1.TIME_CONSTANTS.DEFAULT_EXERCISE_DURATION_SECONDS;
    }
    const totalRestTime = (sets - 1) * restTime;
    return (timePerSet * sets) + totalRestTime;
}
function calculateWorkoutIntensity(difficulty, workoutCategory, workoutStructure, equipmentCount = 0, exercises = []) {
    const factors = {
        difficulty: {
            'BEGINNER': 0.3,
            'INTERMEDIATE': 0.6,
            'ADVANCED': 0.9,
            'ELITE': 1.0
        },
        type: {
            'RECOVERY': 0.2,
            'FLEXIBILITY': 0.3,
            'CARDIO': 0.5,
            'ENDURANCE': 0.6,
            'CIRCUIT': 0.7,
            'STRENGTH': 0.8,
            'HYPERTROPHY': 0.85,
            'HIIT': 0.85,
            'POWER': 0.9,
            'SPORT_SPECIFIC': 0.95,
            'SKILL': 0.7,
            'FULL_BODY': 0.8,
            'UPPER_BODY': 0.7,
            'LOWER_BODY': 0.7,
            'PUSH': 0.6,
            'PULL': 0.6,
            'LEGS': 0.7,
            'CORE': 0.5
        }
    };
    const difficultyFactor = factors.difficulty[difficulty] || 0.5;
    const typeFactor = factors.type[workoutCategory] || 0.5;
    let intensity = (difficultyFactor + typeFactor) / 2;
    if (workoutStructure) {
        if (workoutStructure.workToRestRatio) {
            intensity *= (1 + workoutStructure.workToRestRatio * Constants_1.CALCULATION_CONSTANTS.WORK_TO_REST_INTENSITY_FACTOR);
        }
        if (workoutStructure.totalSets && workoutStructure.totalReps) {
            const volumeIntensity = Math.min((workoutStructure.totalSets * workoutStructure.totalReps) / Constants_1.CALCULATION_CONSTANTS.VOLUME_INTENSITY_DIVISOR, Constants_1.CALCULATION_CONSTANTS.MAX_VOLUME_INTENSITY_CONTRIBUTION);
            intensity += volumeIntensity;
        }
    }
    if (equipmentCount > 0) {
        intensity += Constants_1.CALCULATION_CONSTANTS.EQUIPMENT_COMPLEXITY_FACTOR *
            Math.min(equipmentCount, Constants_1.CALCULATION_CONSTANTS.MAX_EQUIPMENT_COMPLEXITY_COUNT);
    }
    if (exercises.length > 0) {
        const avgRPE = exercises.reduce((sum, ex) => {
            var _a;
            return sum + (((_a = ex.intensity) === null || _a === void 0 ? void 0 : _a.rateOfPerceivedExertion) || 0);
        }, 0) / exercises.length;
        if (avgRPE > 0) {
            const normalizedRPE = normalize(avgRPE, 1, 10);
            intensity = (intensity + normalizedRPE) / 2;
        }
    }
    return normalize(intensity, 0, 1);
}
function calculateExerciseComplexity(level, types, equipmentCount = 0, movementPattern = '', form = { muscles: {}, execution: {}, safety: {} }) {
    var _a, _b, _c;
    const factors = {
        level: {
            'BEGINNER': 0.25,
            'INTERMEDIATE': 0.5,
            'ADVANCED': 0.75,
            'ELITE': 1
        },
        type: {
            'STRENGTH_ISOLATION': 0.3,
            'STRENGTH_COMPOUND': 0.6,
            'CARDIO': 0.4,
            'HIIT': 0.6,
            'PLYOMETRIC': 0.8,
            'FLEXIBILITY': 0.3,
            'BALANCE': 0.7,
            'CIRCUIT': 0.5,
            'POWER': 0.8,
            'SKILL_POWER': 0.9
        }
    };
    const levelFactor = factors.level[level] || 0.5;
    const typeComplexity = Math.max(...types.map(t => factors.type[t] || 0));
    let complexity = (levelFactor + typeComplexity) / 2;
    if (equipmentCount > 0) {
        complexity += Constants_1.CALCULATION_CONSTANTS.EQUIPMENT_COMPLEXITY_FACTOR *
            Math.min(equipmentCount, Constants_1.CALCULATION_CONSTANTS.MAX_EQUIPMENT_COMPLEXITY_COUNT);
    }
    if (movementPattern === 'ROTATION' || movementPattern === 'CORE') {
        complexity += 0.1;
    }
    const formComplexity = ((((_a = form.muscles.secondary) === null || _a === void 0 ? void 0 : _a.length) || 0) * Constants_1.CALCULATION_CONSTANTS.SECONDARY_MUSCLES_COMPLEXITY_FACTOR +
        (((_b = form.execution.keyPoints) === null || _b === void 0 ? void 0 : _b.length) || 0) * Constants_1.CALCULATION_CONSTANTS.KEY_POINTS_COMPLEXITY_FACTOR +
        (((_c = form.safety.cautions) === null || _c === void 0 ? void 0 : _c.length) || 0) * Constants_1.CALCULATION_CONSTANTS.CAUTIONS_COMPLEXITY_FACTOR);
    complexity += formComplexity;
    return normalize(complexity, 0, 2);
}
function scaleExerciseIntensity(currentWeight, currentReps, currentDuration, currentRestTime, factor) {
    if (factor === 1.0) {
        return {
            weight: currentWeight,
            repetitions: currentReps,
            duration: currentDuration,
            restTime: currentRestTime
        };
    }
    const result = {
        restTime: Math.max(15, Math.round(currentRestTime / factor))
    };
    if (currentWeight !== undefined) {
        result.weight = Math.max(0, Math.round(currentWeight * factor * 10) / 10);
    }
    if (currentReps > 0) {
        result.repetitions = Math.max(1, Math.round(currentReps * factor));
    }
    if (currentDuration > 0) {
        result.duration = Math.max(5, Math.round(currentDuration * factor));
    }
    return result;
}
function scaleExerciseVolume(currentSets, currentReps, currentDuration, factor) {
    if (factor === 1.0) {
        return {};
    }
    const result = {};
    const newSets = Math.max(1, Math.round(currentSets * factor));
    if (newSets !== currentSets) {
        result.sets = newSets;
    }
    if (factor < 0.8 && newSets === 1 && currentSets === 1) {
        if (currentReps > 0) {
            result.repetitions = Math.max(1, Math.round(currentReps * factor));
        }
        if (currentDuration > 0) {
            result.duration = Math.max(5, Math.round(currentDuration * factor));
        }
    }
    return result;
}
function calculateDropSets(originalWeight, originalReps, originalRestTime, dropCount = 1, intensityReduction = 0.8) {
    const dropSets = [];
    let currentIntensity = 1.0;
    for (let i = 1; i <= dropCount; i++) {
        currentIntensity *= intensityReduction;
        const dropSet = {
            repetitions: originalReps,
            restTime: Math.floor(originalRestTime * 0.5)
        };
        if (originalWeight !== undefined) {
            const reducedWeight = Math.max(0, Math.round(originalWeight * currentIntensity * 10) / 10);
            dropSets.push(Object.assign(Object.assign({}, dropSet), { weight: reducedWeight }));
        }
        else {
            dropSets.push(Object.assign(Object.assign({}, dropSet), { repetitions: Math.max(1, Math.round(originalReps * (1 + (1 - currentIntensity)))) }));
        }
    }
    return dropSets;
}
function getExerciseProgression(strategy = 'auto', currentWeight, currentReps = 0, currentSets = 0, currentDuration = 0, currentRestTime = 0, progressionRate) {
    let actualStrategy = strategy;
    if (strategy === 'auto') {
        if (currentWeight !== undefined && currentWeight > 0) {
            actualStrategy = 'weight';
        }
        else if (currentReps > 0) {
            actualStrategy = 'reps';
        }
        else if (currentDuration > 0) {
            actualStrategy = 'duration';
        }
        else {
            actualStrategy = 'sets';
        }
    }
    switch (actualStrategy) {
        case 'weight':
            if (currentWeight === undefined)
                return {};
            return {
                weight: currentWeight + (progressionRate || 2.5)
            };
        case 'reps':
            if (currentReps <= 0)
                return {};
            const increase = Math.max(1, Math.round(currentReps * 0.1));
            return {
                repetitions: currentReps + increase
            };
        case 'sets':
            return {
                sets: currentSets + 1
            };
        case 'duration':
            if (currentDuration <= 0)
                return {};
            const durationIncrease = Math.max(5, Math.round((currentDuration * 0.15) / 5) * 5);
            return {
                duration: currentDuration + durationIncrease
            };
        case 'rest_reduction':
            if (currentRestTime <= 30)
                return {};
            const reduction = Math.min(currentRestTime - 30, 10);
            return {
                restTime: currentRestTime - reduction
            };
        default:
            return {};
    }
}
function generateExerciseRegression(weight, reps, duration, sets, restTime) {
    const intensityChanges = scaleExerciseIntensity(weight, reps, duration, restTime, 0.8);
    const volumeChanges = scaleExerciseVolume(sets, reps, duration, 0.9);
    return {
        weight: intensityChanges.weight,
        repetitions: volumeChanges.repetitions !== undefined ?
            volumeChanges.repetitions :
            intensityChanges.repetitions,
        duration: volumeChanges.duration !== undefined ?
            volumeChanges.duration :
            intensityChanges.duration,
        sets: volumeChanges.sets,
        restTime: intensityChanges.restTime
    };
}
function generateExerciseProgression(weight, reps, duration, sets, restTime) {
    const intensityChanges = scaleExerciseIntensity(weight, reps, duration, restTime, 1.1);
    const volumeChanges = scaleExerciseVolume(sets, reps, duration, 1.05);
    return {
        weight: intensityChanges.weight,
        repetitions: volumeChanges.repetitions !== undefined ?
            volumeChanges.repetitions :
            intensityChanges.repetitions,
        duration: volumeChanges.duration !== undefined ?
            volumeChanges.duration :
            intensityChanges.duration,
        sets: volumeChanges.sets,
        restTime: intensityChanges.restTime
    };
}
//# sourceMappingURL=Utils.js.map