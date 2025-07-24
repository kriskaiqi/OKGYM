// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001/api'  // Match backend port from .env
    : '/api');  // Use proxy in production 