const { auth, authorize } = require('../../middleware/auth');
const { verifyToken } = require('../../utils/jwtUtils');
const { findById } = require('../../utils/userService');

// Mock dependencies
jest.mock('../../utils/jwtUtils', () => ({
  verifyToken: jest.fn()
}));

jest.mock('../../utils/userService', () => ({
  findById: jest.fn()
}));

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup request, response, and next function
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('auth middleware', () => {
    it('should return 401 if no authorization header', () => {
      req.header.mockReturnValue(null);

      auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header format is incorrect', () => {
      req.header.mockReturnValue('InvalidFormat');

      auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
      req.header.mockReturnValue('Bearer invalid_token');
      verifyToken.mockReturnValue({ valid: false, expired: false, data: null });

      auth(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith('invalid_token');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is expired', () => {
      req.header.mockReturnValue('Bearer expired_token');
      verifyToken.mockReturnValue({ valid: false, expired: true, data: null });

      auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token expired, please login again' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found', () => {
      req.header.mockReturnValue('Bearer valid_token');
      verifyToken.mockReturnValue({ valid: true, expired: false, data: { id: '999' } });
      findById.mockReturnValue(null);

      auth(req, res, next);

      expect(findById).toHaveBeenCalledWith('999');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should set user on request and call next if valid', () => {
      req.header.mockReturnValue('Bearer valid_token');
      verifyToken.mockReturnValue({ valid: true, expired: false, data: { id: '1' } });
      findById.mockReturnValue({
        id: '1',
        username: 'testuser',
        password: 'hashed_password',
        role: 'user'
      });

      auth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('1');
      expect(req.user.password).toBeUndefined(); // Password should be removed
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    beforeEach(() => {
      // Setup req with user for authorize tests
      req.user = {
        id: '1',
        username: 'testuser',
        role: 'user'
      };
    });

    it('should call next if no roles specified', () => {
      const authorizeMiddleware = authorize();
      authorizeMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next if user has required role', () => {
      const authorizeMiddleware = authorize('user');
      authorizeMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should call next if user has one of required roles', () => {
      const authorizeMiddleware = authorize(['admin', 'user', 'moderator']);
      authorizeMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', () => {
      const authorizeMiddleware = authorize('admin');
      authorizeMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user not attached to request', () => {
      delete req.user;
      const authorizeMiddleware = authorize('user');
      authorizeMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 