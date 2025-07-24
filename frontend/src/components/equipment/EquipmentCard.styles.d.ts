import { ChipProps, BoxProps } from '@mui/material';
import { ExerciseDifficulty } from '../../types/exercise';

export const StyledCard: React.ComponentType<any>;
export const StyledCardActionArea: React.ComponentType<any>;
export const StyledCardMedia: React.ComponentType<any>;
export const CompactCardMedia: React.ComponentType<any>;
export const MediaOverlay: React.ComponentType<any>;
export const DifficultyChip: React.ComponentType<{ difficulty: ExerciseDifficulty } & ChipProps>;
export const CategoryChip: React.ComponentType<{ category: string } & ChipProps>;
export const CardTitle: React.ComponentType<BoxProps>;
export const CardDescription: React.ComponentType<BoxProps>;
export const ChipsContainer: React.ComponentType<BoxProps>;
export const MetadataContainer: React.ComponentType<BoxProps>;
export const MetadataItem: React.ComponentType<BoxProps>; 