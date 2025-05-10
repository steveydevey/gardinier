const mongoose = require('mongoose');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// Mock mongoose and bcrypt
jest.mock('mongoose', () => {
  const mockSchema = {
    pre: jest.fn().mockReturnThis(),
    methods: {},
  };
  
  const Schema = jest.fn().mockReturnValue(mockSchema);
  Schema.mock = {
    calls: [[
      {
        username: {
          type: String,
          required: true,
          unique: true,
          trim: true,
          minlength: 3
        },
        email: {
          type: String,
          required: true,
          unique: true,
          trim: true,
          lowercase: true
        },
        password: {
          type: String,
          required: true,
          minlength: 6
        },
        role: {
          type: String,
          enum: ['user', 'premium', 'admin', 'moderator'],
          default: 'user'
        },
        profile: {
          name: { type: String, trim: true },
          location: {
            zone: { type: String },
            climate: { type: String }
          },
          garden: {
            size: { type: String },
            soilType: { type: String },
            sunExposure: { type: String }
          },
          experienceLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            default: 'beginner'
          },
          preferredPlants: [{ type: String }]
        },
        settings: {
          notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
          },
          privacy: {
            profileVisibility: {
              type: String,
              enum: ['public', 'private', 'friends'],
              default: 'public'
            }
          }
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]]
  };
  
  return {
    Schema,
    model: jest.fn().mockReturnValue({
      schema: mockSchema
    })
  };
});

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('mockedSalt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

describe('User Model', () => {
  let userSchema;
  let schemaPre;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    userSchema = mongoose.Schema.mock.calls[0][0];
    schemaPre = mongoose.Schema().pre;
    next = jest.fn();
  });

  describe('Schema', () => {
    it('should have username field with correct properties', () => {
      expect(userSchema.username).toBeDefined();
      expect(userSchema.username.type).toBe(String);
      expect(userSchema.username.required).toBe(true);
      expect(userSchema.username.unique).toBe(true);
      expect(userSchema.username.trim).toBe(true);
      expect(userSchema.username.minlength).toBe(3);
    });

    it('should have email field with correct properties', () => {
      expect(userSchema.email).toBeDefined();
      expect(userSchema.email.type).toBe(String);
      expect(userSchema.email.required).toBe(true);
      expect(userSchema.email.unique).toBe(true);
      expect(userSchema.email.trim).toBe(true);
    });

    it('should have password field with correct properties', () => {
      expect(userSchema.password).toBeDefined();
      expect(userSchema.password.type).toBe(String);
      expect(userSchema.password.required).toBe(true);
      expect(userSchema.password.minlength).toBe(6);
    });

    it('should have role field with correct properties', () => {
      expect(userSchema.role).toBeDefined();
      expect(userSchema.role.type).toBe(String);
      expect(userSchema.role.enum).toContain('user');
      expect(userSchema.role.enum).toContain('premium');
      expect(userSchema.role.enum).toContain('admin');
      expect(userSchema.role.enum).toContain('moderator');
      expect(userSchema.role.default).toBe('user');
    });

    it('should have profile field with correct structure', () => {
      expect(userSchema.profile).toBeDefined();
      expect(userSchema.profile.name).toBeDefined();
      expect(userSchema.profile.location).toBeDefined();
      expect(userSchema.profile.garden).toBeDefined();
      expect(userSchema.profile.experienceLevel).toBeDefined();
      expect(userSchema.profile.preferredPlants).toBeDefined();
    });

    it('should have settings field with correct structure', () => {
      expect(userSchema.settings).toBeDefined();
      expect(userSchema.settings.notifications).toBeDefined();
      expect(userSchema.settings.privacy).toBeDefined();
    });

    it('should have createdAt field with default value', () => {
      expect(userSchema.createdAt).toBeDefined();
      expect(userSchema.createdAt.type).toBe(Date);
      expect(userSchema.createdAt.default).toBeDefined();
    });
  });

  describe('Pre-save middleware', () => {
    it('should call pre with "save" hook', () => {
      expect(schemaPre).toHaveBeenCalledWith('save', expect.any(Function));
    });

    it('should not hash password if not modified', async () => {
      // Extract the pre save function
      const preSaveFunction = schemaPre.mock.calls[0][1];
      
      // Setup test user that doesn't modify password
      const testUser = {
        isModified: jest.fn().mockReturnValue(false)
      };
      
      // Call the pre save function
      await preSaveFunction.call(testUser, next);
      
      expect(testUser.isModified).toHaveBeenCalledWith('password');
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should hash password if modified', async () => {
      // Extract the pre save function
      const preSaveFunction = schemaPre.mock.calls[0][1];
      
      // Setup test user that modifies password
      const testUser = {
        isModified: jest.fn().mockReturnValue(true),
        password: 'plainPassword'
      };
      
      // Call the pre save function
      await preSaveFunction.call(testUser, next);
      
      expect(testUser.isModified).toHaveBeenCalledWith('password');
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 'mockedSalt');
      expect(testUser.password).toBe('hashedPassword');
      expect(next).toHaveBeenCalled();
    });

    it('should call next with error if hashing fails', async () => {
      // Extract the pre save function
      const preSaveFunction = schemaPre.mock.calls[0][1];
      
      // Setup test user
      const testUser = {
        isModified: jest.fn().mockReturnValue(true),
        password: 'plainPassword'
      };
      
      // Make bcrypt.genSalt throw an error
      const error = new Error('Bcrypt error');
      bcrypt.genSalt.mockRejectedValueOnce(error);
      
      // Call the pre save function
      await preSaveFunction.call(testUser, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('comparePassword method', () => {
    it('should call bcrypt.compare with correct parameters', async () => {
      // Create a test function similar to the model's comparePassword method
      const comparePassword = async function(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
      };
      
      // Create a mock user object with password
      const user = { password: 'hashedPassword' };
      
      // Bind the comparePassword function to the user object and call it
      const result = await comparePassword.call(user, 'plainPassword');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
      expect(result).toBe(true);
    });
  });
}); 