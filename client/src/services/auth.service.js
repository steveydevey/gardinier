import axios from 'axios';

const API_URL = '/api/auth/';

// Register user
const register = async (username, email, password, name) => {
  const response = await axios.post(API_URL + 'register', {
    username,
    email,
    password,
    name
  });
  
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Login user
const login = async (username, password) => {
  const response = await axios.post(API_URL + 'login', {
    username,
    password
  });
  
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get current user
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// Check if user is logged in
const isLoggedIn = () => {
  const user = getCurrentUser();
  return !!user;
};

// Get auth header
const getAuthHeader = () => {
  const user = getCurrentUser();
  
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isLoggedIn,
  getAuthHeader
};

export default authService; 