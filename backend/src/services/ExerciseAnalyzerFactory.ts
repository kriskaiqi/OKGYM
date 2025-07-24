import { BaseExerciseAnalyzerService } from './BaseExerciseAnalyzer';
import { ExerciseType } from './PythonService';
import { BenchPressAnalyzerService } from './BenchPressAnalyzerService';
import { PushupAnalyzerService } from './PushupAnalyzerService';

/**
 * Factory for creating exercise analyzers
 * This will make it easy to add new exercise types in the future
 */
export class ExerciseAnalyzerFactory {
  private static instance: ExerciseAnalyzerFactory;
  private analyzers: Map<ExerciseType, BaseExerciseAnalyzerService> = new Map();
  
  private constructor() {
    // We don't pre-initialize analyzers to avoid circular dependencies
    // They will be created on-demand in getAnalyzer
  }
  
  public static getInstance(): ExerciseAnalyzerFactory {
    if (!ExerciseAnalyzerFactory.instance) {
      ExerciseAnalyzerFactory.instance = new ExerciseAnalyzerFactory();
    }
    return ExerciseAnalyzerFactory.instance;
  }
  
  public getAnalyzer(exerciseType: ExerciseType): BaseExerciseAnalyzerService {
    const analyzer = this.analyzers.get(exerciseType);
    if (!analyzer) {
      if (exerciseType === 'squat') {
        return this.createSquatAnalyzer();
      }
      else if (exerciseType === 'bicep') {
        return this.createBicepAnalyzer();
      }
      else if (exerciseType === 'lunge') {
        return this.createLungeAnalyzer();
      }
      else if (exerciseType === 'plank') {
        return this.createPlankAnalyzer();
      }
      else if (exerciseType === 'situp') {
        return this.createSitupAnalyzer();
      }
      else if (exerciseType === 'shoulder_press') {
        return this.createShoulderPressAnalyzer();
      }
      else if (exerciseType === 'bench_press') {
        return this.createBenchPressAnalyzer();
      }
      else if (exerciseType === 'pushup') {
        return this.createPushupAnalyzer();
      }
      // In the future, add other exercise types here
      
      throw new Error(`Unsupported exercise type: ${exerciseType}`);
    }
    return analyzer;
  }

  private createSquatAnalyzer(): BaseExerciseAnalyzerService {
    // Import dynamically to avoid circular dependency
    const { SquatAnalyzerService } = require('./SquatAnalyzerService');
    const newAnalyzer = new SquatAnalyzerService();
    this.analyzers.set('squat', newAnalyzer);
    return newAnalyzer;
  }

  private createBicepAnalyzer(): BaseExerciseAnalyzerService {
    // Import dynamically to avoid circular dependency
    const { BicepAnalyzerService } = require('./BicepAnalyzerService');
    const newAnalyzer = new BicepAnalyzerService();
    this.analyzers.set('bicep', newAnalyzer);
    return newAnalyzer;
  }
  
  private createLungeAnalyzer(): BaseExerciseAnalyzerService {
    // Import dynamically to avoid circular dependency
    const { LungeAnalyzerService } = require('./LungeAnalyzerService');
    const newAnalyzer = new LungeAnalyzerService();
    this.analyzers.set('lunge', newAnalyzer);
    return newAnalyzer;
  }
  
  private createPlankAnalyzer(): BaseExerciseAnalyzerService {
    // Import dynamically to avoid circular dependency
    const { PlankAnalyzerService } = require('./PlankAnalyzerService');
    const newAnalyzer = new PlankAnalyzerService();
    this.analyzers.set('plank', newAnalyzer);
    return newAnalyzer;
  }
  
  private createSitupAnalyzer(): BaseExerciseAnalyzerService {
    // Import dynamically to avoid circular dependency
    const { SitupAnalyzerService } = require('./SitupAnalyzerService');
    const newAnalyzer = new SitupAnalyzerService();
    this.analyzers.set('situp', newAnalyzer);
    return newAnalyzer;
  }
  
  private createShoulderPressAnalyzer(): BaseExerciseAnalyzerService {
    // Import dynamically to avoid circular dependency
    const { ShoulderPressAnalyzerService } = require('./ShoulderPressAnalyzerService');
    const newAnalyzer = new ShoulderPressAnalyzerService();
    this.analyzers.set('shoulder_press', newAnalyzer);
    return newAnalyzer;
  }

  private createBenchPressAnalyzer(): BenchPressAnalyzerService {
    const newAnalyzer = new BenchPressAnalyzerService();
    this.analyzers.set('bench_press', newAnalyzer);
    return newAnalyzer;
  }
  
  private createPushupAnalyzer(): PushupAnalyzerService {
    const newAnalyzer = new PushupAnalyzerService();
    this.analyzers.set('pushup', newAnalyzer);
    return newAnalyzer;
  }
} 