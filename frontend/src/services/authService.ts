import axios from 'axios';
import { 
  User, 
  RegisterUserRequest, 
  LoginRequest, 
  AuthResponse,
  UpdateUserProfileRequest,
  ChangePasswordRequest
} from '../types/user';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

/**
 * Helper function to get current user from localStorage
 */
const getCurrentUserFromStorage = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

/**
 * Service for authentication and user-related API calls
 */
export const authService = {
  /**
   * Register a new user
   */
  register: async (userData: RegisterUserRequest): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      // Save token to local storage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  /**
   * Login a user
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      // Save token to local storage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userRole', response.data.user.role);
      }
      return response.data;
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  },

  /**
   * Get the current user
   */
  getCurrentUser: (): User | null => {
    return getCurrentUserFromStorage();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * Check if user is an admin
   */
  isAdmin: (): boolean => {
    return localStorage.getItem('userRole') === 'ADMIN';
  },

  /**
   * Get user profile
   */
  getUserProfile: async (): Promise<User> => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData: UpdateUserProfileRequest): Promise<User> => {
    try {
      const response = await axios.put(`${API_URL}/users/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update the stored user data
      const currentUser = getCurrentUserFromStorage();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Change user password
   */
  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    try {
      await axios.post(`${API_URL}/users/change-password`, passwordData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}; 