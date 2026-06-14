const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

class UserService {
  /**
   * Create a new user account
   * @param {Object} userData - User registration data
   * @returns {Object} Created user object (without password)
   */
  async createUser(userData) {
    try {
      const { name, email, password } = userData;

      // Check if user with email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Validate input
      if (!name || !email || !password) {
        throw new Error('Name, email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const now = new Date();

      const newUser = new User({
        userId: uuidv4(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password, // Will be hashed by pre-save middleware
        createdAt: now,
        updatedAt: now
      });

      const savedUser = await newUser.save();
      return this._transformUser(savedUser.toObject());
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyValue)[0];
        if (field === 'email') {
          throw new Error('User with this email already exists');
        } else if (field === 'userId') {
          throw new Error('User ID already exists');
        }
        throw new Error('Duplicate user data');
      }

      if (error.name === 'ValidationError') {
        // Mongoose validation error
        const messages = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${messages.join(', ')}`);
      }

      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object|null} User object if authenticated, null otherwise
   */
  async authenticateUser(email, password) {
    try {
      if (!email || !password) {
        return null;
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return null;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return null;
      }

      return this._transformUser(user.toObject());
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  }

  /**
   * Get user by userId
   * @param {string} userId - User ID
   * @returns {Object|null} User object or null if not found
   */
  async getUserById(userId) {
    try {
      if (!userId) {
        return null;
      }

      const user = await User.findOne({ userId }).lean();
      return user ? this._transformUser(user) : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null if not found
   */
  async getUserByEmail(email) {
    try {
      if (!email) {
        return null;
      }

      const user = await User.findByEmail(email);
      return user ? this._transformUser(user.toObject()) : null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Update user information
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object|null} Updated user object or null if not found
   */
  async updateUser(userId, updateData) {
    try {
      if (!userId) {
        return null;
      }

      const { name, email } = updateData;
      const updateFields = {
        updatedAt: new Date()
      };

      if (name) updateFields.name = name.trim();
      if (email) updateFields.email = email.toLowerCase().trim();

      const updatedUser = await User.findOneAndUpdate(
        { userId },
        updateFields,
        { new: true, runValidators: true }
      ).lean();

      return updatedUser ? this._transformUser(updatedUser) : null;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Email already exists');
      }

      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${messages.join(', ')}`);
      }

      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Database health check
   * @returns {boolean} True if database is connected
   */
  async healthCheck() {
    try {
      // Simple query to test database connectivity
      await User.findOne().limit(1);
      return true;
    } catch (error) {
      console.error('User service health check failed:', error);
      return false;
    }
  }

  /**
   * Get total user count (utility method)
   * @returns {number} Total number of users
   */
  async getUserCount() {
    try {
      return await User.countDocuments();
    } catch (error) {
      console.error('Error counting users:', error);
      return 0;
    }
  }

  /**
   * Transform user object to match API format
   * Ensures no password data is exposed
   * @private
   */
  _transformUser(user) {
    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
      updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt
    };
  }
}

module.exports = new UserService();