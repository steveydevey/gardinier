const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/users');
const userService = require('../../utils/userService');

// Mock dependencies
jest.mock('../../utils/userService');

// Create a standard and alternative mock for auth middleware
const standardAuthMock = {
  auth: (req, res, next) => {
    // Simulate authenticated user
    req.user = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      profile: {
        name: 'Test User',
        location: {
          zone: '7b',
          climate: 'temperate'
        },
        garden: {
          size: 'medium',
          soilType: 'loam',
          sunExposure: 'partial'
        },
        experienceLevel: 'intermediate',
        preferredPlants: ['tomato', 'basil']
      },
      settings: {
        notifications: {
          email: true,
          push: true
        },
        privacy: {
          profileVisibility: 'public'
        }
      }
    };
    next();
  },
  authorize: (roles) => (req, res, next) => {
    // Only allow admins to access routes with admin role check
    if (roles.includes('admin') && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  }
};

// Admin auth mock (bypass role check)
const adminAuthMock = {
  auth: standardAuthMock.auth,
  authorize: () => (req, res, next) => next() // Allow access regardless of role
};

// Set default mock
jest.mock('../../middleware/auth', () => standardAuthMock);

describe('User Routes', () => {
  let app;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup express app
    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);

    // Mock userService functions
    userService.findById.mockReturnValue({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'user',
      profile: {
        name: 'Test User',
        location: { zone: '7b', climate: 'temperate' },
        garden: { size: 'medium', soilType: 'loam', sunExposure: 'partial' },
        experienceLevel: 'intermediate',
        preferredPlants: ['tomato', 'basil']
      },
      settings: {
        notifications: { email: true, push: true },
        privacy: { profileVisibility: 'public' }
      }
    });

    userService.updateUser.mockImplementation((id, userData) => {
      if (id === '1') {
        return {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          ...userData
        };
      }
      return null;
    });

    userService.getAllUsers.mockReturnValue([
      {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      },
      {
        id: '2',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin'
      }
    ]);
  });

  describe('GET /profile', () => {
    it('should return user profile', async () => {
      const res = await request(app).get('/api/users/profile');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('profile');
      expect(res.body.profile).toHaveProperty('name', 'Test User');
      expect(res.body.profile.location).toHaveProperty('zone', '7b');
      expect(res.body.profile.garden).toHaveProperty('size', 'medium');
    });
  });

  describe('PUT /profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        location: {
          zone: '8a',
          climate: 'arid'
        },
        preferredPlants: ['cucumber', 'tomato', 'lettuce']
      };

      const res = await request(app)
        .put('/api/users/profile')
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('profile');
      expect(userService.updateUser).toHaveBeenCalledWith('1', expect.objectContaining({
        profile: expect.objectContaining({
          name: 'Updated Name',
          location: expect.objectContaining({
            zone: '8a',
            climate: 'arid'
          }),
          preferredPlants: ['cucumber', 'tomato', 'lettuce']
        })
      }));
    });

    it('should handle server errors', async () => {
      // Force an error by rejecting the updateUser promise
      userService.updateUser.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .put('/api/users/profile')
        .send({ name: 'New Name' });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Server error');
    });
  });

  describe('PUT /settings', () => {
    it('should update user settings', async () => {
      const updateData = {
        notifications: {
          email: false,
          push: true
        },
        privacy: {
          profileVisibility: 'private'
        }
      };

      const res = await request(app)
        .put('/api/users/settings')
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('settings');
      expect(userService.updateUser).toHaveBeenCalledWith('1', expect.objectContaining({
        settings: expect.objectContaining({
          notifications: expect.objectContaining({
            email: false,
            push: true
          }),
          privacy: expect.objectContaining({
            profileVisibility: 'private'
          })
        })
      }));
    });

    it('should handle server errors', async () => {
      userService.updateUser.mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const res = await request(app)
        .put('/api/users/settings')
        .send({ notifications: { email: false } });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message', 'Server error');
    });
  });

  describe('PUT /password', () => {
    it('should return success message (placeholder functionality)', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .send({
          oldPassword: 'oldpassword',
          newPassword: 'newpassword'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Password updated successfully');
    });
  });

  describe('GET /all', () => {
    it('should forbid non-admin users from accessing all users', async () => {
      // The mock auth middleware is set up to reject non-admins
      const res = await request(app).get('/api/users/all');

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Forbidden');
    });

    it('should return all users for admin users (with admin mock override)', async () => {
      // Temporarily replace the auth middleware with the admin version
      jest.resetModules();
      jest.mock('../../middleware/auth', () => adminAuthMock);
      
      // Reload the route module with the new mock
      const adminRoutes = require('../../routes/users');
      
      // Create a new app instance with the new route module
      const adminApp = express();
      adminApp.use(express.json());
      adminApp.use('/api/users', adminRoutes);

      const res = await request(adminApp).get('/api/users/all');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(res.body.users).toHaveLength(2);
      expect(res.body.users[0]).toHaveProperty('username', 'testuser');
      expect(res.body.users[1]).toHaveProperty('username', 'admin');
    });
  });
}); 