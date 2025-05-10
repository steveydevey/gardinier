import axios from 'axios';
import authService from '../../services/auth.service';

// Mock axios
jest.mock('axios');

describe('Auth Service', () => {
  const mockUser = {
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com'
    },
    token: 'mock-token'
  };

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call axios with correct parameters', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      };

      axios.post.mockResolvedValueOnce({ data: mockUser });

      const result = await authService.register(
        userData.username,
        userData.email,
        userData.password,
        userData.name
      );

      expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        name: userData.name
      });
      expect(result).toEqual(mockUser);
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('should not save to localStorage if token is not returned', async () => {
      const responseWithoutToken = {
        data: { user: { username: 'newuser' } }
      };
      axios.post.mockResolvedValueOnce(responseWithoutToken);

      await authService.register('newuser', 'new@example.com', 'password123');

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      const error = new Error('Registration failed');
      axios.post.mockRejectedValueOnce(error);

      await expect(authService.register('newuser', 'new@example.com', 'password123'))
        .rejects.toThrow('Registration failed');
      
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should call axios with correct parameters', async () => {
      axios.post.mockResolvedValueOnce({ data: mockUser });

      const result = await authService.login('testuser', 'password123');

      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'testuser',
        password: 'password123'
      });
      expect(result).toEqual(mockUser);
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    it('should not save to localStorage if token is not returned', async () => {
      const responseWithoutToken = {
        data: { user: { username: 'testuser' } }
      };
      axios.post.mockResolvedValueOnce(responseWithoutToken);

      await authService.login('testuser', 'password123');

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      const error = new Error('Login failed');
      axios.post.mockRejectedValueOnce(error);

      await expect(authService.login('testuser', 'password123'))
        .rejects.toThrow('Login failed');
      
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should remove user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      authService.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from localStorage if exists', () => {
      localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUser));
      
      const result = authService.getCurrentUser();
      
      expect(localStorage.getItem).toHaveBeenCalledWith('user');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user does not exist in localStorage', () => {
      localStorage.getItem.mockReturnValueOnce(null);
      
      const result = authService.getCurrentUser();
      
      expect(result).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if user exists', () => {
      jest.spyOn(authService, 'getCurrentUser').mockReturnValueOnce(mockUser);
      
      const result = authService.isLoggedIn();
      
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', () => {
      jest.spyOn(authService, 'getCurrentUser').mockReturnValueOnce(null);
      
      const result = authService.isLoggedIn();
      
      expect(result).toBe(false);
    });
  });

  describe('getAuthHeader', () => {
    it('should return Authorization header if token exists', () => {
      jest.spyOn(authService, 'getCurrentUser').mockReturnValueOnce(mockUser);
      
      const result = authService.getAuthHeader();
      
      expect(result).toEqual({ Authorization: 'Bearer mock-token' });
    });

    it('should return empty object if token does not exist', () => {
      jest.spyOn(authService, 'getCurrentUser').mockReturnValueOnce(null);
      
      const result = authService.getAuthHeader();
      
      expect(result).toEqual({});
    });

    it('should return empty object if user exists but token is missing', () => {
      jest.spyOn(authService, 'getCurrentUser').mockReturnValueOnce({ user: { id: '1' } });
      
      const result = authService.getAuthHeader();
      
      expect(result).toEqual({});
    });
  });
}); 