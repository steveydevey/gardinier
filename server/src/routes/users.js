const express = require('express');
const router = express.Router();

const { 
  findById, 
  updateUser, 
  getAllUsers 
} = require('../utils/userService');
const { auth, authorize } = require('../middleware/auth');

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, (req, res) => {
  res.json({ profile: req.user.profile });
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, (req, res) => {
  try {
    const { name, location, garden, experienceLevel, preferredPlants } = req.body;
    
    // Create profile update object
    const profileUpdate = {
      profile: {
        ...req.user.profile,
        name: name || req.user.profile.name,
        location: {
          ...req.user.profile.location,
          ...(location || {})
        },
        garden: {
          ...req.user.profile.garden,
          ...(garden || {})
        },
        experienceLevel: experienceLevel || req.user.profile.experienceLevel,
        preferredPlants: preferredPlants || req.user.profile.preferredPlants
      }
    };
    
    // Update user
    const updatedUser = updateUser(req.user.id, profileUpdate);
    
    // Return updated profile
    res.json({ profile: updatedUser.profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', auth, (req, res) => {
  try {
    const { notifications, privacy } = req.body;
    
    // Create settings update object
    const settingsUpdate = {
      settings: {
        ...req.user.settings,
        notifications: {
          ...req.user.settings.notifications,
          ...(notifications || {})
        },
        privacy: {
          ...req.user.settings.privacy,
          ...(privacy || {})
        }
      }
    };
    
    // Update user
    const updatedUser = updateUser(req.user.id, settingsUpdate);
    
    // Return updated settings
    res.json({ settings: updatedUser.settings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/password
// @desc    Change password
// @access  Private
router.put('/password', auth, (req, res) => {
  try {
    // Note: For now, this is a placeholder since we're using hardcoded users
    // In a real app, we would verify the old password before changing it
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/all
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/all', [auth, authorize('admin')], (req, res) => {
  try {
    const users = getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 