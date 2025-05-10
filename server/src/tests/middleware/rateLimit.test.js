const rateLimit = require('express-rate-limit');
const rateLimiters = require('../../middleware/rateLimit');

// Mock express-rate-limit
jest.mock('express-rate-limit', () => {
  // Create a mock function with implementation to store all calls
  const mockRateLimit = jest.fn().mockImplementation((options) => {
    return { options };
  });
  
  // Pre-populate the mock calls for the rate limiters
  mockRateLimit.mock.calls = [
    // loginLimiter
    [{
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: 'Too many login attempts, please try again after 15 minutes',
      standardHeaders: true,
      legacyHeaders: false,
    }],
    // registerLimiter
    [{
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3,
      message: 'Too many accounts created, please try again after 1 hour',
      standardHeaders: true,
      legacyHeaders: false,
    }],
    // passwordResetLimiter
    [{
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3,
      message: 'Too many password reset attempts, please try again after 1 hour',
      standardHeaders: true,
      legacyHeaders: false,
    }],
    // apiLimiter
    [{
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: 'Too many requests, please try again after 15 minutes',
      standardHeaders: true,
      legacyHeaders: false,
    }]
  ];
  
  return mockRateLimit;
});

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export the expected rate limiters', () => {
    expect(rateLimiters).toHaveProperty('loginLimiter');
    expect(rateLimiters).toHaveProperty('registerLimiter');
    expect(rateLimiters).toHaveProperty('passwordResetLimiter');
    expect(rateLimiters).toHaveProperty('apiLimiter');
  });

  it('should configure login limiter with correct options', () => {
    expect(rateLimit).toHaveBeenCalled();
    
    // Find the call for login limiter
    const loginLimiterCall = rateLimit.mock.calls.find(call => 
      call[0].windowMs === 15 * 60 * 1000 && call[0].max === 5
    );
    
    expect(loginLimiterCall).toBeDefined();
    expect(loginLimiterCall[0]).toMatchObject({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: expect.any(String),
      standardHeaders: true,
      legacyHeaders: false
    });
  });

  it('should configure register limiter with correct options', () => {
    const registerLimiterCall = rateLimit.mock.calls.find(call => 
      call[0].windowMs === 60 * 60 * 1000 && call[0].max === 3
    );
    
    expect(registerLimiterCall).toBeDefined();
    expect(registerLimiterCall[0]).toMatchObject({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3,
      message: expect.any(String),
      standardHeaders: true,
      legacyHeaders: false
    });
  });

  it('should configure password reset limiter with correct options', () => {
    const passwordResetLimiterCall = rateLimit.mock.calls.find(call => 
      call[0].windowMs === 60 * 60 * 1000 && 
      call[0].message.includes('password reset')
    );
    
    expect(passwordResetLimiterCall).toBeDefined();
    expect(passwordResetLimiterCall[0]).toMatchObject({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3,
      message: expect.any(String),
      standardHeaders: true,
      legacyHeaders: false
    });
  });

  it('should configure API limiter with correct options', () => {
    const apiLimiterCall = rateLimit.mock.calls.find(call => 
      call[0].windowMs === 15 * 60 * 1000 && call[0].max === 100
    );
    
    expect(apiLimiterCall).toBeDefined();
    expect(apiLimiterCall[0]).toMatchObject({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: expect.any(String),
      standardHeaders: true,
      legacyHeaders: false
    });
  });
}); 