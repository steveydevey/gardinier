const jwt = require('jsonwebtoken');

// Default values in case environment variables are not set
const DEFAULT_SECRET = 'garden_tracker_secret_token';
const DEFAULT_EXPIRY = '7d';

// Generate JWT token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  const expiry = process.env.JWT_EXPIRY || DEFAULT_EXPIRY;
  
  return jwt.sign({ id: userId }, secret, { expiresIn: expiry });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
    const decoded = jwt.verify(token, secret);
    return { valid: true, expired: false, data: decoded };
  } catch (error) {
    return {
      valid: false,
      expired: error.name === 'TokenExpiredError',
      data: null
    };
  }
};

module.exports = {
  generateToken,
  verifyToken
}; 