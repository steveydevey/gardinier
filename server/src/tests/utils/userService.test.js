const userService = require('../../utils/userService');
const bcrypt = require('bcryptjs');

// Mock bcrypt for testing
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('mockedSalt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

describe('User Service', () => {
  beforeEach(async () => {
    // Initialize with test user before each test
    await userService.initializeUsers();
  });

  describe('initializeUsers', () => {
    it('should initialize test user with trav username', async () => {
      const users = await userService.initializeUsers();
      expect(users.length).toBe(1);
      expect(users[0].username).toBe('trav');
      expect(users[0].password).toBe('hashedPassword');
    });
  });

  describe('findByUsername', () => {
    it('should find user by username', () => {
      const user = userService.findByUsername('trav');
      expect(user).toBeDefined();
      expect(user.username).toBe('trav');
    });

    it('should return undefined for non-existent user', () => {
      const user = userService.findByUsername('nonexistent');
      expect(user).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should find user by id', () => {
      const user = userService.findById('1');
      expect(user).toBeDefined();
      expect(user.id).toBe('1');
    });

    it('should return undefined for non-existent id', () => {
      const user = userService.findById('999');
      expect(user).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      };

      const newUser = await userService.createUser(userData);
      
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 'mockedSalt');
      
      expect(newUser).toBeDefined();
      expect(newUser.username).toBe(userData.username);
      expect(newUser.email).toBe(userData.email);
      // Password should not be returned
      expect(newUser.password).toBeUndefined();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const user = userService.findByUsername('trav');
      const result = await userService.verifyPassword(user, 'hamster');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('hamster', user.password);
      expect(result).toBe(true);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users without passwords', () => {
      const users = userService.getAllUsers();
      
      expect(users.length).toBeGreaterThan(0);
      // Check that no user has a password property
      users.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });
  });

  describe('updateUser', () => {
    it('should update user data', () => {
      const updateData = {
        profile: {
          name: 'Updated Name',
          location: {
            zone: '8a'
          }
        }
      };
      
      const updatedUser = userService.updateUser('1', updateData);
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser.profile.name).toBe('Updated Name');
      expect(updatedUser.profile.location.zone).toBe('8a');
      expect(updatedUser.password).toBeUndefined();
    });

    it('should return null for non-existent user id', () => {
      const result = userService.updateUser('999', { profile: { name: 'Test' }});
      expect(result).toBeNull();
    });
  });
}); 