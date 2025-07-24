// Test script to check workout API with JWT token
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Configuration
const JWT_SECRET = 'default-development-secret-do-not-use-in-production'; // Replace with your actual JWT secret
const API_URL = 'http://localhost:3001/api';

async function main() {
  try {
    // Create a test JWT token
    const token = createTestToken();
    console.log('Created test token:', token);

    // Try to fetch workouts with the token
    console.log('Attempting to fetch workouts...');
    const workoutsResponse = await fetchWorkouts(token);
    
    console.log('API Response Status:', workoutsResponse.status);
    console.log('Workouts Response:', JSON.stringify(workoutsResponse.data, null, 2));
    
    // Check if workouts were returned
    if (workoutsResponse.data && workoutsResponse.data.workoutPlans) {
      console.log(`Found ${workoutsResponse.data.workoutPlans.length} workout plans`);
    } else {
      console.log('No workout plans found or unexpected response structure');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

function createTestToken() {
  // Create a test user payload with a real user ID from the database
  const payload = {
    id: '9baaa945-c450-4734-b01f-790fd7816ffd',  // Kris Lee user ID
    email: 'leesweekee030507@gmail.com',
    role: 'USER',  // Make sure to use the exact role from the database
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
  };
  
  // Sign the token
  return jwt.sign(payload, JWT_SECRET);
}

async function fetchWorkouts(token) {
  // Make API request with token
  return axios.get(`${API_URL}/workouts`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

// Run the script
main(); 