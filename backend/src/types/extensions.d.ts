/**
 * Type extensions for models
 */
import { User } from '../models/User';
import { UserProgress } from '../models/UserProgress';
import { UserActivity } from '../models/UserActivity';
import { MetricTracking } from '../models/MetricTracking';

declare module '../models/User' {
  interface User {
    /**
     * User progress records loaded from relationship
     */
    progress?: UserProgress[];
    
    /**
     * User activity records loaded from relationship
     */
    activity?: UserActivity[];
    
    /**
     * User metric tracking records loaded from relationship
     */
    metrics?: MetricTracking[];
  }
} 