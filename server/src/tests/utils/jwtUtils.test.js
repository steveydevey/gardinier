const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../../utils/jwtUtils');

// Mock jwt module
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_token'),
  verify: jest.fn()
}));

describe('JWT Utils', () => {
  beforeEach(() => {
    // Clear all mock implementations before each test
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a token for a user id', () => {
      const userId = '123';
      const token = generateToken(userId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: userId },
        expect.any(String),
        { expiresIn: expect.any(String) }
      );
      expect(token).toBe('mock_token');
    });

    it('should use environment variables for secret and expiry if available', () => {
      const originalEnv = { ...process.env };
      process.env.JWT_SECRET = 'test_secret_key';
      process.env.JWT_EXPIRY = '2h';

      generateToken('123');

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '123' },
        'test_secret_key',
        { expiresIn: '2h' }
      );

      // Restore original env
      process.env = originalEnv;
    });
  });

  describe('verifyToken', () => {
    it('should return valid token data when verification succeeds', () => {
      const mockDecodedData = { id: '123', iat: 1616160328, exp: 1616246728 };
      jwt.verify.mockReturnValueOnce(mockDecodedData);

      const result = verifyToken('valid_token');

      expect(jwt.verify).toHaveBeenCalledWith('valid_token', expect.any(String));
      expect(result).toEqual({
        valid: true,
        expired: false,
        data: mockDecodedData
      });
    });

    it('should return invalid, expired=true when token has expired', () => {
      const tokenExpiredError = new Error('jwt expired');
      tokenExpiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementationOnce(() => {
        throw tokenExpiredError;
      });

      const result = verifyToken('expired_token');

      expect(result).toEqual({
        valid: false,
        expired: true,
        data: null
      });
    });

    it('should return invalid result for other verification errors', () => {
      const genericError = new Error('invalid token');
      genericError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementationOnce(() => {
        throw genericError;
      });

      const result = verifyToken('invalid_token');

      expect(result).toEqual({
        valid: false,
        expired: false,
        data: null
      });
    });
  });
}); 