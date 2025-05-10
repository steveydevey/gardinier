const bcrypt = require('bcryptjs');

// In-memory user storage for development/testing
let users = [];

// Initialize with test user
const initializeUsers = async () => {
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('hamster', salt);
  
  // Clear users array
  users = [];
  
  // Add our test user "trav" with password "hamster"
  users.push({
    id: '1',
    username: 'trav',
    email: 'trav@example.com',
    password: hashedPassword,
    role: 'user',
    profile: {
      name: 'Trav',
      location: {
        zone: '7b',
        climate: 'temperate'
      },
      garden: {
        size: 'medium',
        soilType: 'loam',
        sunExposure: 'partial'
      },
      experienceLevel: 'intermediate',
      preferredPlants: ['tomato', 'basil', 'lettuce']
    },
    settings: {
      notifications: {
        email: true,
        push: true
      },
      privacy: {
        profileVisibility: 'public'
      }
    },
    createdAt: new Date()
  });
  
  console.log('Test user initialized:', users[0].username);
  return users;
};

// Find user by their username
const findByUsername = (username) => {
  return users.find(user => user.username === username);
};

// Find user by their ID
const findById = (id) => {
  return users.find(user => user.id === id);
};

// Create a new user
const createUser = async (userData) => {
  // Generate a new ID
  const id = (users.length + 1).toString();
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  
  // Create new user
  const newUser = {
    id,
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
    role: 'user',
    profile: {
      name: userData.name || '',
      location: {
        zone: '',
        climate: ''
      },
      garden: {
        size: '',
        soilType: '',
        sunExposure: ''
      },
      experienceLevel: 'beginner',
      preferredPlants: []
    },
    settings: {
      notifications: {
        email: true,
        push: true
      },
      privacy: {
        profileVisibility: 'public'
      }
    },
    createdAt: new Date()
  };
  
  // Add to users array
  users.push(newUser);
  
  // Return without password
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Verify password
const verifyPassword = async (user, password) => {
  return await bcrypt.compare(password, user.password);
};

// Get all users (for admin purposes)
const getAllUsers = () => {
  return users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

// Update user
const updateUser = (id, userData) => {
  const index = users.findIndex(user => user.id === id);
  if (index === -1) return null;
  
  // Update user data excluding password
  users[index] = {
    ...users[index],
    ...userData,
    // Don't overwrite these fields directly
    password: users[index].password,
    id: users[index].id
  };
  
  // Return without password
  const { password, ...userWithoutPassword } = users[index];
  return userWithoutPassword;
};

module.exports = {
  initializeUsers,
  findByUsername,
  findById,
  createUser,
  verifyPassword,
  getAllUsers,
  updateUser
}; 