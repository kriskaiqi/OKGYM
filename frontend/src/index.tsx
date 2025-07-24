import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';

// Clean up any oversized cookies to prevent 431 errors
const clearBrowserData = () => {
  try {
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('Browser data cleared to prevent 431 errors');
  } catch (error) {
    console.error('Error clearing browser data:', error);
  }
};

// Function to safely mount the React application
const mountReactApp = () => {
  try {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      console.error('Root element not found in the DOM. Check your index.html file.');
      return;
    }
    
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error mounting React application:', error);
  }
};

// Check if cookies are too large and clear if necessary
const cookies = document.cookie;
if (cookies.length > 4000) {
  console.warn('Cookies are too large, clearing to prevent 431 errors');
  clearBrowserData();
}

// Ensure DOM is fully loaded before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountReactApp);
} else {
  mountReactApp();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 