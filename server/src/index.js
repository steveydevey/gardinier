const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// Import middleware
const { apiLimiter } = require('./middleware/rateLimit');

// Import user service to initialize test users
const { initializeUsers } = require('./utils/userService');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Apply rate limiting to all requests
app.use(apiLimiter);

// Route middlewares
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Gardinier API' });
});

// Connect to MongoDB (use memory server for now)
const startServer = async () => {
  try {
    // Initialize the test user
    console.log('Initializing test user...');
    await initializeUsers();
    
    console.log('Server starting...');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Test user "trav" with password "hamster" is available for login.`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer(); 