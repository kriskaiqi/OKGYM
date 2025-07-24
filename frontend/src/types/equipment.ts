import { ExerciseDifficulty, MuscleGroup } from './exercise';

// Equipment categories based on the backend EquipmentCategory enum
export enum EquipmentCategory {
  BARBELLS = 'BARBELLS',
  DUMBBELLS = 'DUMBBELLS',
  KETTLEBELLS = 'KETTLEBELLS',
  MACHINES = 'MACHINES',
  CABLES = 'CABLES',
  BODYWEIGHT = 'BODYWEIGHT',
  ACCESSORIES = 'ACCESSORIES',
  CARDIO = 'CARDIO',
  RACKS = 'RACKS',
  BENCHES = 'BENCHES',
  RESISTANCE_BANDS = 'RESISTANCE_BANDS',
  SPECIALTY = 'SPECIALTY'
}

// Cost tier enum
export enum CostTier {
  BUDGET = 'BUDGET',
  MID_RANGE = 'MID_RANGE',
  PREMIUM = 'PREMIUM',
  LUXURY = 'LUXURY'
}

// Space requirement enum
export enum SpaceRequirement {
  MINIMAL = 'MINIMAL', 
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  EXTENSIVE = 'EXTENSIVE'
}

// Interface for equipment
export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: EquipmentCategory;
  muscleGroupsTargeted: MuscleGroup[];
  difficulty: ExerciseDifficulty;
  costTier: CostTier;
  spaceRequired: SpaceRequirement;
  imageUrl?: string;
  videoUrl?: string;
  manufacturer?: string;
  purchaseUrl?: string;
  estimatedPrice?: number;
  createdAt: string;
  updatedAt: string;
  
  // Additional specifications
  specifications?: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    material?: string;
    color?: string;
    adjustable?: boolean;
    maxUserWeight?: number;
    warranty?: string;
    features?: string[];
    accessories?: string[];
    assembly?: {
      required: boolean;
      difficulty: number;
      estimatedTime: number;
    };
  };
  
  // Alternative equipment options
  alternatives?: {
    homeMade?: string[];
    budget?: string[];
    premium?: string[];
    similar?: string[];
  };
}

// Interface for equipment filter options
export interface EquipmentFilterOptions {
  category?: EquipmentCategory;
  muscleGroup?: MuscleGroup;
  difficulty?: ExerciseDifficulty;
  costTier?: CostTier;
  spaceRequired?: SpaceRequirement;
  manufacturer?: string;
  search?: string;
  priceRange?: { min?: number; max?: number };
  page?: number;
  limit?: number;
} 