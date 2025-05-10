import axios from 'axios';
import userService from '../../services/user.service';
import authService from '../../services/auth.service';

jest.mock('axios');
jest.mock('../../services/auth.service');

describe('User Service', () => {
  const mockAuthHeader = { Authorization: 'Bearer test-token' };
  const mockUser = { 
    user: { 
      id: '1', 
      username: 'testuser',
      settings: { theme: 'dark', notifications: true }
    },
    token: 'test-token'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authService.getAuthHeader.mockReturnValue(mockAuthHeader);
  });

  describe('getProfile', () => {
    it('should call axios with correct parameters', async () => {
      const mockProfileData = { id: '1', name: 'Test User', email: 'test@example.com' };
      axios.get.mockResolvedValueOnce({ data: mockProfileData });

      const result = await userService.getProfile();

      expect(axios.get).toHaveBeenCalledWith('/api/users/profile', {
        headers: mockAuthHeader
      });
      expect(result).toEqual(mockProfileData);
    });

    it('should handle errors properly', async () => {
      const error = new Error('Failed to fetch profile');
      axios.get.mockRejectedValueOnce(error);

      await expect(userService.getProfile()).rejects.toThrow('Failed to fetch profile');
    });
  });

  describe('updateProfile', () => {
    it('should call axios with correct parameters', async () => {
      const profileData = { name: 'Updated Name', email: 'updated@example.com' };
      const mockResponse = { ...profileData, id: '1' };
      axios.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await userService.updateProfile(profileData);

      expect(axios.put).toHaveBeenCalledWith('/api/users/profile', profileData, {
        headers: mockAuthHeader
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors properly', async () => {
      const profileData = { name: 'Updated Name' };
      const error = new Error('Failed to update profile');
      axios.put.mockRejectedValueOnce(error);

      await expect(userService.updateProfile(profileData)).rejects.toThrow('Failed to update profile');
    });
  });

  describe('getSettings', () => {
    it('should return settings from current user', async () => {
      authService.getCurrentUser.mockReturnValueOnce(mockUser);

      const result = await userService.getSettings();

      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(result).toEqual({ settings: mockUser.user.settings });
    });

    it('should return null if no user is found', async () => {
      authService.getCurrentUser.mockReturnValueOnce(null);

      const result = await userService.getSettings();

      expect(result).toBeNull();
    });
  });

  describe('updateSettings', () => {
    it('should call axios with correct parameters', async () => {
      const settingsData = { theme: 'light', notifications: false };
      const mockResponse = { settings: settingsData };
      axios.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await userService.updateSettings(settingsData);

      expect(axios.put).toHaveBeenCalledWith('/api/users/settings', settingsData, {
        headers: mockAuthHeader
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors properly', async () => {
      const settingsData = { theme: 'light' };
      const error = new Error('Failed to update settings');
      axios.put.mockRejectedValueOnce(error);

      await expect(userService.updateSettings(settingsData)).rejects.toThrow('Failed to update settings');
    });
  });

  describe('changePassword', () => {
    it('should call axios with correct parameters', async () => {
      const oldPassword = 'oldPassword123';
      const newPassword = 'newPassword123';
      const mockResponse = { message: 'Password updated successfully' };
      axios.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await userService.changePassword(oldPassword, newPassword);

      expect(axios.put).toHaveBeenCalledWith(
        '/api/users/password',
        { oldPassword, newPassword },
        { headers: mockAuthHeader }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors properly', async () => {
      const error = new Error('Failed to change password');
      axios.put.mockRejectedValueOnce(error);

      await expect(userService.changePassword('old', 'new')).rejects.toThrow('Failed to change password');
    });
  });
}); 