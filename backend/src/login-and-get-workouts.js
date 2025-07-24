// Script to perform login and fetch workouts with the obtained token
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3001/api';

// User credentials (use the credentials of a real user in the DB)
const credentials = {
  email: 'leesweekee030507@gmail.com',
  password: 'password123' // Try a common test password
};

async function main() {
  try {
    // Step 1: Login and get token
    console.log('Attempting to login with credentials...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, credentials);
    
    if (!loginResponse.data || !loginResponse.data.token) {
      console.error('Login failed or no token received:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('Login successful! Token received:', token.substring(0, 20) + '...');
    
    // Step 2: Fetch workouts with the token
    console.log('\nFetching workouts with the token...');
    const workoutsResponse = await axios.get(`${API_URL}/workouts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Workouts API Response Status:', workoutsResponse.status);
    console.log('Workouts Response:', JSON.stringify(workoutsResponse.data, null, 2));
    
    // Check if workouts were returned
    if (workoutsResponse.data && workoutsResponse.data.workoutPlans) {
      console.log(`Found ${workoutsResponse.data.workoutPlans.length} workout plans`);
    } else if (workoutsResponse.data && workoutsResponse.data.data) {
      console.log(`Found ${workoutsResponse.data.data.length} workout plans`);
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

// Run the script
main(); 