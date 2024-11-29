import axios from "axios";

const API_URL = "http://localhost:3000"; // Replace with your backend URL if different

// Register a new user
export const registerUser = async (username, email, password) => {
  try {
    console.log(username, 'akshay')
    console.log(`${API_URL}/register`, 'url')
    const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
    console.log(response, 'rrrrrr')
    return response.data; // Success response
  } catch (error) {
    throw error.response ? error.response.data : new Error("Server error");
  }
};

// Login a user
export const loginUser = async (email, password) => {
  try {
    console.log('HI')
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    console.log(response, 'response')
    return response.data; // Returns token and other details
  } catch (error) {
    console.log(error, 'error');
    throw error.response ? error.response.data : new Error("Server error");
  }
};
