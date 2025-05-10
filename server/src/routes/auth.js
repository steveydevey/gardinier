const express = require('express');
const router = express.Router();

const { 
  findByUsername, 
  createUser, 
  verifyPassword,
  initializeUsers 
} = require('../utils/userService');
const { generateToken } = require('../utils/jwtUtils');
const { auth } = require('../middleware/auth');
const { 
  loginLimiter, 
  registerLimiter, 
  passwordResetLimiter 
} = require('../middleware/rateLimit');

// Initialize test users when server starts
(async () => {
  await initializeUsers();
})();

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    // Simple validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check for existing user
    if (findByUsername(username)) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create user
    const user = await createUser({ username, email, password, name });
    
    // Generate JWT
    const token = generateToken(user.id);
    
    // Return user and token
    res.status(201).json({
      user,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    // Check for existing user
    const user = findByUsername(username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await verifyPassword(user, password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = generateToken(user.id);
    
    // Return user and token (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', passwordResetLimiter, (req, res) => {
  // This would typically send a password reset email
  // For now, just return a success message
  res.json({ message: 'Password reset email sent' });
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, (req, res) => {
  // User is already attached to request in auth middleware
  res.json({ user: req.user });
});

module.exports = router; 