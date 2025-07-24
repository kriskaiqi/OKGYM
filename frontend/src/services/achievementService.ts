import api from './api';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  points: number;
  icon: string;
  criteriaType: string;
  criteriaDescription: string;
  progress: {
    current: number;
    required: number;
    unit: string;
  };
  isUnlocked: boolean;
}

export const achievementService = {
  /**
   * Get all achievements with their current status
   */
  getAchievements: async (): Promise<Achievement[]> => {
    try {
      const response = await api.get('/api/achievements');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  },
  
  /**
   * Get Material UI icon component name from achievement icon string
   */
  getIconComponent: (iconName: string): string => {
    // Ensure we have a valid icon name
    if (!iconName) return 'EmojiEvents';
    
    // Return the icon name which can be used with dynamic imports
    // or with the Material UI icon components
    return iconName;
  },
  
  /**
   * Get default icon based on achievement category
   */
  getCategoryIcon: (category: string): string => {
    switch (category) {
      case 'MILESTONE': return 'EmojiEvents';
      case 'CONSISTENCY': return 'LocalFireDepartment';
      case 'PERFORMANCE': return 'FitnessCenter';
      case 'IMPROVEMENT': return 'TrendingUp';
      case 'EXPLORER': return 'Explore';
      case 'CHALLENGE': return 'Flag';
      case 'SOCIAL': return 'People';
      case 'SPECIAL': return 'Star';
      default: return 'EmojiEvents';
    }
  },
  
  /**
   * Calculate progress percentage for an achievement
   */
  calculateProgressPercentage: (achievement: Achievement): number => {
    if (!achievement.progress) return 0;
    
    const { current, required } = achievement.progress;
    if (required <= 0) return 0;
    
    // Cap at 100%
    return Math.min(Math.round((current / required) * 100), 100);
  },
  
  /**
   * Get color based on achievement tier
   */
  getTierColor: (tier: string): string => {
    switch (tier) {
      case 'BRONZE': return '#cd7f32';
      case 'SILVER': return '#A9A9A9';
      case 'GOLD': return '#FFD700';
      case 'PLATINUM': return '#8A2BE2';
      case 'DIAMOND': return '#b9f2ff';
      case 'MASTER': return '#9966CC';
      default: return '#cd7f32'; // Default to bronze
    }
  },
  
  /**
   * Get gradient background for tier
   */
  getTierGradient: (tier: string): string => {
    switch (tier) {
      case 'BRONZE': return 'linear-gradient(135deg, #cd7f32, #e3a951)';
      case 'SILVER': return 'linear-gradient(135deg, #A9A9A9, #D3D3D3)';
      case 'GOLD': return 'linear-gradient(135deg, #FFD700, #FFC107)';
      case 'PLATINUM': return 'linear-gradient(135deg, #8A2BE2, #9370DB)';
      case 'DIAMOND': return 'linear-gradient(135deg, #b9f2ff, #42a5f5)';
      case 'MASTER': return 'linear-gradient(135deg, #9966CC, #673AB7)';
      default: return 'linear-gradient(135deg, #cd7f32, #e3a951)';
    }
  },
  
  /**
   * Get tier-specific styling properties
   */
  getTierStyles: (tier: string, isUnlocked: boolean) => {
    const baseStyles = {
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      opacity: isUnlocked ? 1 : 0.6
    };
    
    // Add additional styles based on tier
    switch (tier) {
      case 'GOLD':
        return {
          ...baseStyles,
          boxShadow: isUnlocked ? '0 6px 12px rgba(255, 215, 0, 0.3)' : baseStyles.boxShadow,
        };
      case 'PLATINUM':
        return {
          ...baseStyles,
          boxShadow: isUnlocked ? '0 6px 12px rgba(138, 43, 226, 0.5)' : baseStyles.boxShadow,
        };
      case 'DIAMOND':
        return {
          ...baseStyles,
          boxShadow: isUnlocked ? '0 6px 12px rgba(185, 242, 255, 0.4)' : baseStyles.boxShadow,
        };
      case 'MASTER':
        return {
          ...baseStyles,
          boxShadow: isUnlocked ? '0 6px 12px rgba(153, 102, 204, 0.4)' : baseStyles.boxShadow,
        };
      default:
        return baseStyles;
    }
  }
};

export default achievementService; 