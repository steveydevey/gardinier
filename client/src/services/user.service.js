import axios from 'axios';
import authService from './auth.service';

const API_URL = '/api/users/';

// Get user profile
const getProfile = async () => {
  const response = await axios.get(API_URL + 'profile', {
    headers: authService.getAuthHeader()
  });
  return response.data;
};

// Update user profile
const updateProfile = async (profileData) => {
  const response = await axios.put(API_URL + 'profile', profileData, {
    headers: authService.getAuthHeader()
  });
  return response.data;
};

// Get user settings
const getSettings = async () => {
  const user = authService.getCurrentUser();
  if (user && user.user) {
    return { settings: user.user.settings };
  }
  return null;
};

// Update user settings
const updateSettings = async (settingsData) => {
  const response = await axios.put(API_URL + 'settings', settingsData, {
    headers: authService.getAuthHeader()
  });
  return response.data;
};

// Update password
const updatePassword = async (passwordData) => {
  const response = await axios.put(API_URL + 'password', passwordData, {
    headers: authService.getAuthHeader()
  });
  return response.data;
};

const userService = {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  updatePassword
};

export default userService; 