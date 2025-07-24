import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Axios instance for API calls
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Make sure config.headers exists and is properly initialized
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log for debugging
      console.log('Adding auth token to request:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor for auth errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for debugging
    console.error('API Error:', error.response?.status, error.response?.data);
    
    // Logout on 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('Unauthorized access detected, redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 