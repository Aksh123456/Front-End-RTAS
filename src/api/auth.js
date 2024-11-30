import axios from "axios";
// require('dotenv').config()

const API_URL = process.env.REACT_APP_API_URL; 

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
    console.log(API_URL, 'url')
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    console.log(response, 'response')
    return response.data; // Returns token and other details
  } catch (error) {
    console.log(error, 'error');
    throw error.response ? error.response.data : new Error("Server error");
  }
};
