// Setup environment variables for testing
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRY = '1h';
process.env.NODE_ENV = 'test';

// Setup global test variables and mocks as needed
global.testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
}; 