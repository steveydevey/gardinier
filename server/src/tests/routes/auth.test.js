const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');
const userService = require('../../utils/userService');
const jwtUtils = require('../../utils/jwtUtils');

// Mock dependencies
jest.mock('../../utils/userService');
jest.mock('../../utils/jwtUtils');
jest.mock('../../middleware/auth', () => ({
  auth: (req, res, next) => {
    req.user = {
      id: '1',
      username: 'testuser',
      role: 'user'
    };
    next();
  }
}));
jest.mock('../../middleware/rateLimit', () => ({
  loginLimiter: (req, res, next) => next(),
  registerLimiter: (req, res, next) => next(),
  passwordResetLimiter: (req, res, next) => next()
}));

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup express app
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);

    // Mock userService functions
    userService.findByUsername.mockImplementation(username => {
      if (username === 'existing') {
        return {
          id: '1',
          username: 'existing',
          email: 'existing@example.com',
          password: 'hashedPassword'
        };
      }
      return null;
    });

    userService.createUser.mockImplementation(userData => ({
      id: '2',
      username: userData.username,
      email: userData.email,
      role: 'user'
    }));

    userService.verifyPassword.mockImplementation((user, password) => {
      return password === 'correctpassword';
    });

    userService.initializeUsers.mockResolvedValue([]);

    // Mock JWT functions
    jwtUtils.generateToken.mockReturnValue('mocktoken');
  });

  describe('POST /register', () => {
    it('should return 400 if username already exists', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existing',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'User already exists');
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser'
          // Missing email and password
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Please enter all fields');
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('should create user and return token on successful registration', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token', 'mocktoken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('username', userData.username);
      expect(res.body.user).toHaveProperty('email', userData.email);
      
      expect(userService.createUser).toHaveBeenCalledWith(userData);
      expect(jwtUtils.generateToken).toHaveBeenCalled();
    });
  });

  describe('POST /login', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          // Missing username and password
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Please enter all fields');
    });

    it('should return 400 if user does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return 400 if password is incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'existing',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should return user and token on successful login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'existing',
          password: 'correctpassword'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token', 'mocktoken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('username', 'existing');
      expect(res.body.user).not.toHaveProperty('password');
      
      expect(userService.verifyPassword).toHaveBeenCalled();
      expect(jwtUtils.generateToken).toHaveBeenCalled();
    });
  });

  describe('POST /forgot-password', () => {
    it('should return success message', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'user@example.com'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Password reset email sent');
    });
  });

  describe('GET /user', () => {
    it('should return authenticated user', async () => {
      const res = await request(app)
        .get('/api/auth/user');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('username', 'testuser');
    });
  });
}); 