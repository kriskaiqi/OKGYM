// Script to register a new user and test the workflow
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3001/api';

// New user registration data with timestamp to ensure unique email
const timestamp = new Date().getTime();
const newUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `testuser${timestamp}@example.com`,
  password: 'Password123!',
  confirmPassword: 'Password123!'
};

async function main() {
  try {
    // Step 1: Register a new user
    console.log('Registering a new user...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, newUser);
    
    // Log the entire registration response to understand its structure
    console.log('Registration response structure:', JSON.stringify(registerResponse.data, null, 2));
    
    // Extract token from registration response if available
    let token = null;
    if (registerResponse.data && registerResponse.data.token) {
      token = registerResponse.data.token;
      console.log('Registration successful! Token received from registration:', token.substring(0, 20) + '...');
    } 
    else if (registerResponse.data && registerResponse.data.success) {
      console.log('Registration successful but no token received. Proceeding to login.');
      
      // Step 2: Login with the new user
      console.log('\nLogging in with the new user...');
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: newUser.email,
        password: newUser.password
      });
      
      // Log the entire login response to understand its structure
      console.log('Login response structure:', JSON.stringify(loginResponse.data, null, 2));
      
      // Try to extract token from different possible locations in the response
      if (loginResponse.data && loginResponse.data.token) {
        token = loginResponse.data.token;
      } 
      else if (loginResponse.data && loginResponse.data.data && loginResponse.data.data.token) {
        token = loginResponse.data.data.token;
      }
      
      if (token) {
        console.log('Login successful! Token received:', token.substring(0, 20) + '...');
      } else {
        console.error('Login successful but no token found in response.');
        return;
      }
    } else {
      console.error('Registration failed:', registerResponse.data);
      return;
    }
    
    if (!token) {
      console.error('No token received from either registration or login.');
      return;
    }
    
    // Step 3: Fetch workouts with the token
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