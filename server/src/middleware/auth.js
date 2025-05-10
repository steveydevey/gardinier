const { verifyToken } = require('../utils/jwtUtils');
const { findById } = require('../utils/userService');

// Auth middleware to protect routes
const auth = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');
  
  // Check if no token
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided' });
  }
  
  // Get the token part
  const token = authHeader.split(' ')[1];
  
  // Verify token
  const { valid, expired, data } = verifyToken(token);
  
  if (!valid) {
    if (expired) {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  // Find user
  const user = findById(data.id);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  
  // Add user to request object (without password)
  const { password, ...userWithoutPassword } = user;
  req.user = userWithoutPassword;
  
  // Proceed to next middleware
  next();
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  // Convert string to array if only one role
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    // Check if auth middleware has run
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user's role is in the allowed roles
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    
    // User authorized, proceed
    next();
  };
};

module.exports = {
  auth,
  authorize
}; 