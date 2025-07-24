import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User, RegisterUserRequest as RegisterData } from '../types/user';

// Types
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => void;
  refreshUserData: () => Promise<User | null>;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => Promise.resolve({} as User),
  register: () => Promise.resolve({}),
  logout: () => {},
  refreshUserData: () => Promise.resolve(null),
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Verify token is valid by fetching profile
          const response = await api.get('/api/auth/profile');
          
          if (response.status === 200) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          } else {
            // Clear invalid token/user
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        // Handle expired token or network errors
        console.error('Error verifying token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Log in a user
   */
  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log('Using API base URL:', api.defaults.baseURL);
      // Make sure we're using the full path including /api
      const response = await api.post('/api/auth/login', { email, password });
      const { user, token } = response.data.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return user;
    } catch (error) {
      console.error('Auth API error:', error);
      throw error;
    }
  };

  /**
   * Register a new user
   */
  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  };

  /**
   * Log out the current user
   */
  const logout = async () => {
    try {
      // Call logout endpoint if available
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear local storage regardless of API success
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Refresh user data from the API
   */
  const refreshUserData = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return null;
      }
      
      // Fetch fresh user data from the API
      const response = await api.get('/api/users/profile');
      
      if (response.status === 200 && response.data?.data) {
        const userData = response.data.data.user;
        
        // Make sure role is preserved
        if (!userData.role && user) {
          userData.role = user.role; // Preserve existing role if not in response
        }
        
        // Ensure userRole is uppercase for consistency
        if (userData.role && typeof userData.role === 'string') {
          userData.role = userData.role.toUpperCase();
        }
        
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userRole', userData.role);
        setUser(userData);
        
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      register, 
      logout,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext); 