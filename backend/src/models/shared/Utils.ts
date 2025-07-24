import { TIME_CONSTANTS, CALCULATION_CONSTANTS } from './Constants';

/**
 * Common utility functions for models
 */

/**
 * Check if a cache is still valid based on timestamp
 * @param timestamp Timestamp to check
 * @param maxAgeMinutes Maximum age in minutes for valid cache
 * @returns boolean indicating if cache is still valid
 */
export function isCacheValid(timestamp: Date, maxAgeMinutes: number = 60): boolean {
    const ageInMinutes = (Date.now() - timestamp.getTime()) / (60 * 1000);
    return ageInMinutes < maxAgeMinutes;
}

/**
 * Create a deep copy of an object
 * @param obj Object to copy
 * @returns Deep copy of the object
 */
export function deepCopy<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime()) as any;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => deepCopy(item)) as any;
    }
    
    const copy = {} as T;
    
    Object.keys(obj).forEach(key => {
        copy[key as keyof T] = deepCopy(obj[key as keyof T]);
    });
    
    return copy;
}

/**
 * Calculate the duration between two dates in minutes
 * @param start Start date
 * @param end End date
 * @returns Duration in minutes
 */
export function getDurationMinutes(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / (60 * 1000);
}

/**
 * Scale a number within a specified range
 * @param value Value to scale
 * @param fromMin Minimum of source range
 * @param fromMax Maximum of source range
 * @param toMin Minimum of target range
 * @param toMax Maximum of target range
 * @returns Scaled value
 */
export function scaleValue(
    value: number, 
    fromMin: number, 
    fromMax: number, 
    toMin: number, 
    toMax: number
): number {
    // Handle edge cases
    if (fromMax === fromMin) return toMin;
    if (value <= fromMin) return toMin;
    if (value >= fromMax) return toMax;
    
    // Calculate scaled value
    const fromRange = fromMax - fromMin;
    const toRange = toMax - toMin;
    const scaledValue = ((value - fromMin) / fromRange) * toRange + toMin;
    
    return scaledValue;
}

/**
 * Normalize a value to 0-1 range
 * @param value Value to normalize
 * @param min Minimum value
 * @param max Maximum value
 * @returns Normalized value between 0 and 1
 */
export function normalize(value: number, min: number, max: number): number {
    return scaleValue(value, min, max, 0, 1);
}

/**
 * Calculate the mean of an array of numbers
 * @param values Array of numbers
 * @returns Mean value
 */
export function mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Format a duration in seconds to a readable string
 * @param seconds Duration in seconds
 * @returns Formatted string (e.g., "1h 30m" or "45s")
 */
export function formatDuration(seconds: number): string {
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

/**
 * Generate a random ID string
 * @param length Length of the ID
 * @returns Random ID string
 */
export function generateId(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Calculate volume load (weight * reps * sets)
 * @param weight Weight in kg/lbs
 * @param reps Number of repetitions
 * @param sets Number of sets
 * @returns Total volume load
 */
export function calculateVolumeLoad(weight: number, reps: number, sets: number): number {
    return weight * reps * sets;
}

/**
 * Calculate workout density (volume per minute)
 * @param volume Total volume load
 * @param durationMinutes Duration in minutes
 * @returns Density score
 */
export function calculateDensity(volume: number, durationMinutes: number): number {
    if (durationMinutes <= 0) return 0;
    return volume / durationMinutes;
}

/**
 * Calculate estimated workout completion time in minutes
 * @param estimatedDuration Base duration estimate
 * @param warmupIncluded Whether warmup is included
 * @param cooldownIncluded Whether cooldown is included
 * @param exercises Array of exercises with rest times and sets
 * @param workoutStructure Optional workout structure with rest times
 * @returns Total estimated time in minutes
 */
export function calculateWorkoutTime(
    estimatedDuration: number,
    warmupIncluded: boolean = false,
    cooldownIncluded: boolean = false,
    exercises: { restTime: number, sets: number }[] = [],
    workoutStructure?: { 
        restBetweenExercises?: number, 
        restBetweenSets?: number, 
        totalSets?: number 
    }
): number {
    let totalTime = estimatedDuration;

    // Add standard times for warmup and cooldown if included
    if (warmupIncluded) totalTime += TIME_CONSTANTS.STANDARD_WARMUP_MINUTES;
    if (cooldownIncluded) totalTime += TIME_CONSTANTS.STANDARD_COOLDOWN_MINUTES;

    // Calculate rest time based on exercise configurations
    let totalRestTime = 0;
    
    // If workoutStructure defines rest times, use those
    if (workoutStructure) {
        const { restBetweenExercises, restBetweenSets, totalSets } = workoutStructure;
        
        if (restBetweenExercises) 
            totalRestTime += (exercises.length || 1) * (restBetweenExercises / 60); // Convert seconds to minutes
            
        if (restBetweenSets && totalSets) 
            totalRestTime += totalSets * (restBetweenSets / 60); // Convert seconds to minutes
    } 
    // Otherwise calculate from individual exercise rest times
    else if (exercises.length > 0) {
        totalRestTime = exercises.reduce((total, exercise) => {
            return total + ((exercise.restTime * exercise.sets) / 60); // Convert seconds to minutes
        }, 0);
    }
    
    totalTime += totalRestTime;
    totalTime = Math.ceil(totalTime); // Round up to nearest minute

    return totalTime;
}

/**
 * Calculate total time for an exercise (in seconds)
 * @param sets Number of sets
 * @param repetitions Number of repetitions (if rep-based)
 * @param duration Duration in seconds (if duration-based)
 * @param restTime Rest time between sets in seconds
 * @param tempo Optional tempo object with eccentric, pause, concentric, pauseAtTop values
 * @returns Total time including rest in seconds
 */
export function calculateExerciseTime(
    sets: number,
    repetitions: number = 0,
    duration: number = 0,
    restTime: number = TIME_CONSTANTS.DEFAULT_REST_TIME_SECONDS,
    tempo?: { eccentric?: number, pause?: number, concentric?: number, pauseAtTop?: number }
): number {
    let timePerSet = 0;
    
    // If it's a duration-based exercise
    if (duration > 0) {
        timePerSet = duration;
    }
    // If it's a rep-based exercise, estimate time (3 seconds per rep as a default)
    else if (repetitions > 0) {
        timePerSet = repetitions * TIME_CONSTANTS.DEFAULT_SECONDS_PER_REP;
        
        // Adjust for custom tempo if available
        if (tempo) {
            const { eccentric, pause, concentric, pauseAtTop } = tempo;
            const tempoTotal = (eccentric || 0) + (pause || 0) + (concentric || 0) + (pauseAtTop || 0);
            
            if (tempoTotal > 0) {
                timePerSet = repetitions * tempoTotal;
            }
        }
    }
    // Default time if no other info
    else {
        timePerSet = TIME_CONSTANTS.DEFAULT_EXERCISE_DURATION_SECONDS;
    }
    
    // Add rest time between sets
    const totalRestTime = (sets - 1) * restTime;
    
    return (timePerSet * sets) + totalRestTime;
}

/**
 * Calculate workout intensity based on various factors
 * @param difficulty Workout difficulty level
 * @param workoutCategory Workout category
 * @param workoutStructure Optional workout structure with work-to-rest ratio and volume
 * @param equipmentCount Number of equipment items needed
 * @param exercises Optional array of exercises with RPE values
 * @returns Intensity score between 0 and 1
 */
export function calculateWorkoutIntensity(
    difficulty: string,
    workoutCategory: string,
    workoutStructure?: { 
        workToRestRatio?: number, 
        totalSets?: number, 
        totalReps?: number 
    },
    equipmentCount: number = 0,
    exercises: { intensity?: { rateOfPerceivedExertion?: number } }[] = []
): number {
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

    const difficultyFactor = factors.difficulty[difficulty as keyof typeof factors.difficulty] || 0.5;
    const typeFactor = factors.type[workoutCategory as keyof typeof factors.type] || 0.5;
    let intensity = (difficultyFactor + typeFactor) / 2;

    // Adjust for workout structure
    if (workoutStructure) {
        if (workoutStructure.workToRestRatio) {
            intensity *= (1 + workoutStructure.workToRestRatio * CALCULATION_CONSTANTS.WORK_TO_REST_INTENSITY_FACTOR);
        }
        if (workoutStructure.totalSets && workoutStructure.totalReps) {
            const volumeIntensity = Math.min(
                (workoutStructure.totalSets * workoutStructure.totalReps) / CALCULATION_CONSTANTS.VOLUME_INTENSITY_DIVISOR,
                CALCULATION_CONSTANTS.MAX_VOLUME_INTENSITY_CONTRIBUTION
            );
            intensity += volumeIntensity;
        }
    }

    // Adjust for equipment complexity
    if (equipmentCount > 0) {
        intensity += CALCULATION_CONSTANTS.EQUIPMENT_COMPLEXITY_FACTOR * 
                    Math.min(equipmentCount, CALCULATION_CONSTANTS.MAX_EQUIPMENT_COMPLEXITY_COUNT);
    }

    // Consider individual exercise intensities
    if (exercises.length > 0) {
        const avgRPE = exercises.reduce((sum, ex) => {
            return sum + (ex.intensity?.rateOfPerceivedExertion || 0);
        }, 0) / exercises.length;
        
        if (avgRPE > 0) {
            const normalizedRPE = normalize(avgRPE, 1, 10);
            // Blend with current intensity
            intensity = (intensity + normalizedRPE) / 2;
        }
    }

    // Ensure proper range
    return normalize(intensity, 0, 1);
}

/**
 * Calculate exercise complexity based on various factors
 * @param level Difficulty level
 * @param types Array of exercise types
 * @param equipmentCount Number of equipment options
 * @param movementPattern Movement pattern
 * @param form Form details with muscles, execution points, and safety cautions
 * @returns Complexity score between 0 and 1
 */
export function calculateExerciseComplexity(
    level: string,
    types: string[],
    equipmentCount: number = 0,
    movementPattern: string = '',
    form: { 
        muscles: { secondary?: any[] }, 
        execution: { keyPoints?: any[] }, 
        safety: { cautions?: any[] } 
    } = { muscles: {}, execution: {}, safety: {} }
): number {
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

    // Base complexity from level
    const levelFactor = factors.level[level as keyof typeof factors.level] || 0.5;

    // Add complexity from types
    const typeComplexity = Math.max(...types.map(t => (factors.type as Record<string, number>)[t] || 0));
    let complexity = (levelFactor + typeComplexity) / 2;

    // Adjust for equipment requirements
    if (equipmentCount > 0) {
        complexity += CALCULATION_CONSTANTS.EQUIPMENT_COMPLEXITY_FACTOR * 
                     Math.min(equipmentCount, CALCULATION_CONSTANTS.MAX_EQUIPMENT_COMPLEXITY_COUNT);
    }

    // Adjust for movement pattern complexity
    if (movementPattern === 'ROTATION' || movementPattern === 'CORE') {
        complexity += 0.1;
    }

    // Adjust for form requirements
    const formComplexity = (
        (form.muscles.secondary?.length || 0) * CALCULATION_CONSTANTS.SECONDARY_MUSCLES_COMPLEXITY_FACTOR +
        (form.execution.keyPoints?.length || 0) * CALCULATION_CONSTANTS.KEY_POINTS_COMPLEXITY_FACTOR +
        (form.safety.cautions?.length || 0) * CALCULATION_CONSTANTS.CAUTIONS_COMPLEXITY_FACTOR
    );
    complexity += formComplexity;

    // Ensure clean range handling
    return normalize(complexity, 0, 2);
}

/**
 * Scale exercise intensity based on a factor
 * @param currentWeight Current weight (if applicable)
 * @param currentReps Current repetitions (if applicable)
 * @param currentDuration Current duration in seconds (if applicable)
 * @param currentRestTime Current rest time in seconds
 * @param factor Scaling factor (1.0 = no change, <1.0 = easier, >1.0 = harder)
 * @returns Updated exercise configuration
 */
export function scaleExerciseIntensity(
    currentWeight: number | undefined, 
    currentReps: number, 
    currentDuration: number,
    currentRestTime: number,
    factor: number
): { 
    weight?: number; 
    repetitions?: number; 
    duration?: number; 
    restTime: number 
} {
    if (factor === 1.0) {
        return { 
            weight: currentWeight, 
            repetitions: currentReps, 
            duration: currentDuration, 
            restTime: currentRestTime 
        };
    }
    
    const result: { 
        weight?: number; 
        repetitions?: number; 
        duration?: number; 
        restTime: number 
    } = {
        restTime: Math.max(15, Math.round(currentRestTime / factor))
    };
    
    // Scale weight if present
    if (currentWeight !== undefined) {
        result.weight = Math.max(0, Math.round(currentWeight * factor * 10) / 10);
    }
    
    // Scale reps if present
    if (currentReps > 0) {
        result.repetitions = Math.max(1, Math.round(currentReps * factor));
    }
    
    // Scale duration if present
    if (currentDuration > 0) {
        result.duration = Math.max(5, Math.round(currentDuration * factor));
    }
    
    return result;
}

/**
 * Scale exercise volume based on a factor
 * @param currentSets Current number of sets
 * @param currentReps Current repetitions (if applicable)
 * @param currentDuration Current duration in seconds (if applicable)
 * @param factor Scaling factor (1.0 = no change, <1.0 = less volume, >1.0 = more volume)
 * @returns Updated exercise configuration
 */
export function scaleExerciseVolume(
    currentSets: number,
    currentReps: number,
    currentDuration: number,
    factor: number
): { 
    sets?: number;
    repetitions?: number;
    duration?: number;
} {
    if (factor === 1.0) {
        return {};
    }
    
    const result: {
        sets?: number;
        repetitions?: number;
        duration?: number;
    } = {};
    
    // Adjust sets first
    const newSets = Math.max(1, Math.round(currentSets * factor));
    if (newSets !== currentSets) {
        result.sets = newSets;
    }
    
    // If we're reducing volume significantly and already at minimum sets,
    // also reduce repetitions or duration
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

/**
 * Calculate drop sets based on a given exercise intensity
 * @param originalWeight The starting weight (if any)
 * @param originalReps The starting repetitions
 * @param originalRestTime The starting rest time in seconds
 * @param dropCount Number of drop sets to generate (default: 1)
 * @param intensityReduction Factor to reduce intensity by for each drop set (default: 0.8)
 * @returns Array of drop set configurations
 */
export function calculateDropSets(
    originalWeight: number | undefined,
    originalReps: number,
    originalRestTime: number,
    dropCount: number = 1,
    intensityReduction: number = 0.8
): Array<{
    weight?: number;
    repetitions: number;
    restTime: number;
}> {
    // Define the array with explicit type to avoid 'never' type issues
    const dropSets: Array<{
        weight?: number;
        repetitions: number;
        restTime: number;
    }> = [];
    
    let currentIntensity = 1.0;
    
    for (let i = 1; i <= dropCount; i++) {
        currentIntensity *= intensityReduction;
        
        // Create drop set with required properties
        const dropSet = {
            repetitions: originalReps,
            restTime: Math.floor(originalRestTime * 0.5)
        };
        
        // Apply the intensity reduction to the appropriate parameter
        if (originalWeight !== undefined) {
            // Add weight property only if original weight exists
            const reducedWeight = Math.max(0, Math.round(originalWeight * currentIntensity * 10) / 10);
            dropSets.push({
                ...dropSet,
                weight: reducedWeight
            });
        } else {
            // If no weight, adjust reps instead
            dropSets.push({
                ...dropSet,
                repetitions: Math.max(1, Math.round(originalReps * (1 + (1 - currentIntensity))))
            });
        }
    }
    
    return dropSets;
}

/**
 * Get progression values for an exercise based on progression strategy
 * @param strategy Progression strategy type
 * @param currentWeight Current weight (if weight-based)
 * @param currentReps Current repetitions (if rep-based)
 * @param currentSets Current sets
 * @param currentDuration Current duration (if duration-based)
 * @param currentRestTime Current rest time
 * @param progressionRate Optional custom progression rate
 * @returns Updated values for the progressed exercise
 */
export function getExerciseProgression(
    strategy: string = 'auto',
    currentWeight?: number,
    currentReps: number = 0,
    currentSets: number = 0,
    currentDuration: number = 0,
    currentRestTime: number = 0,
    progressionRate?: number
): {
    weight?: number;
    repetitions?: number;
    sets?: number;
    duration?: number;
    restTime?: number;
} {
    // If auto, determine the best progression based on exercise type
    let actualStrategy = strategy;
    if (strategy === 'auto') {
        if (currentWeight !== undefined && currentWeight > 0) {
            actualStrategy = 'weight';
        } else if (currentReps > 0) {
            actualStrategy = 'reps';
        } else if (currentDuration > 0) {
            actualStrategy = 'duration';
        } else {
            actualStrategy = 'sets';
        }
    }
    
    // Apply the specific progression strategy
    switch (actualStrategy) {
        case 'weight':
            if (currentWeight === undefined) return {};
            return {
                weight: currentWeight + (progressionRate || 2.5)
            };
            
        case 'reps':
            if (currentReps <= 0) return {};
            // Increase by 5-10% rounded to nearest integer
            const increase = Math.max(1, Math.round(currentReps * 0.1));
            return {
                repetitions: currentReps + increase
            };
            
        case 'sets':
            return {
                sets: currentSets + 1
            };
            
        case 'duration':
            if (currentDuration <= 0) return {};
            // Increase by 10-20% rounded to nearest 5 seconds
            const durationIncrease = Math.max(5, Math.round((currentDuration * 0.15) / 5) * 5);
            return {
                duration: currentDuration + durationIncrease
            };
            
        case 'rest_reduction':
            if (currentRestTime <= 30) return {}; // Don't reduce rest below 30 seconds
            // Reduce by 5-10 seconds
            const reduction = Math.min(currentRestTime - 30, 10);
            return {
                restTime: currentRestTime - reduction
            };
            
        default:
            return {};
    }
}

/**
 * Generate exercise regression (easier version) using intensity and volume scaling
 * @param weight Current weight (if applicable)
 * @param reps Current repetitions
 * @param duration Current duration
 * @param sets Current sets
 * @param restTime Current rest time
 * @returns Configuration for an easier version
 */
export function generateExerciseRegression(
    weight: number | undefined,
    reps: number,
    duration: number,
    sets: number,
    restTime: number
): {
    weight?: number;
    repetitions?: number;
    duration?: number;
    sets?: number;
    restTime: number;
} {
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

/**
 * Generate exercise progression (harder version) using intensity and volume scaling
 * @param weight Current weight (if applicable)
 * @param reps Current repetitions
 * @param duration Current duration
 * @param sets Current sets
 * @param restTime Current rest time
 * @returns Configuration for a harder version
 */
export function generateExerciseProgression(
    weight: number | undefined,
    reps: number,
    duration: number,
    sets: number,
    restTime: number
): {
    weight?: number;
    repetitions?: number;
    duration?: number;
    sets?: number;
    restTime: number;
} {
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