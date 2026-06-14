const Bug = require('../models/Bug');
const { v4: uuidv4 } = require('uuid');

class BugService {
  /**
   * Get all bugs - replaces readBugs()
   * @returns {Array} Array of all bugs
   */
  async getAllBugs() {
    try {
      const bugs = await Bug.find({}).lean();
      return bugs.map(this._transformBug);
    } catch (error) {
      console.error('Error getting all bugs:', error);
      throw new Error('Failed to retrieve bugs');
    }
  }

  /**
   * Get all bugs for a specific user
   * @param {string} userId - User ID to filter bugs
   * @returns {Array} Array of user's bugs
   */
  async getBugsByUserId(userId) {
    try {
      if (!userId) {
        return [];
      }

      const bugs = await Bug.find({ userId }).lean();
      return bugs.map(this._transformBug);
    } catch (error) {
      console.error('Error getting bugs for user:', error);
      throw new Error('Failed to retrieve user bugs');
    }
  }

  /**
   * Get single bug by ID
   * @param {string} id - Bug ID
   * @returns {Object|null} Bug object or null if not found
   */
  async getBugById(id) {
    try {
      if (!id) {
        return null;
      }

      const bug = await Bug.findOne({ id }).lean();
      return bug ? this._transformBug(bug) : null;
    } catch (error) {
      console.error('Error getting bug by ID:', error);
      throw new Error('Failed to retrieve bug');
    }
  }

  /**
   * Get single bug by ID for a specific user
   * @param {string} id - Bug ID
   * @param {string} userId - User ID to verify ownership
   * @returns {Object|null} Bug object or null if not found or not owned by user
   */
  async getBugByIdAndUserId(id, userId) {
    try {
      if (!id || !userId) {
        return null;
      }

      const bug = await Bug.findOne({ id, userId }).lean();
      return bug ? this._transformBug(bug) : null;
    } catch (error) {
      console.error('Error getting bug by ID and user ID:', error);
      throw new Error('Failed to retrieve bug');
    }
  }

  /**
   * Create new bug - requires authenticated user
   * @param {Object} bugData - Bug data from request
   * @param {string} userId - User ID for bug ownership (required)
   * @returns {Object} Created bug object
   */
  async createBug(bugData, userId) {
    try {
      // Validate userId is provided and not empty
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('userId is required and must be a valid non-empty string');
      }

      const now = new Date();

      const newBug = new Bug({
        id: uuidv4(), // Generate UUID like current implementation
        title: bugData.title,
        description: bugData.description,
        errorMessage: bugData.errorMessage || '',
        solution: bugData.solution || '',
        reason: bugData.reason || '',
        tags: bugData.tags || [],
        status: bugData.status || 'Unsolved',
        date: now,
        createdAt: now,
        updatedAt: now,
        userId: userId.trim() // Associate bug with user (trimmed)
      });

      const savedBug = await newBug.save();
      console.log(`Bug created successfully: ${savedBug.id} for user: ${userId}`);
      return this._transformBug(savedBug.toObject());
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        console.error('Duplicate bug ID:', error);
        throw new Error('Bug ID already exists');
      }

      if (error.name === 'ValidationError') {
        // Mongoose validation error (including userId required validation)
        console.error('Bug validation failed:', error.message);
        throw new Error(`Validation failed: ${error.message}`);
      }

      console.error('Error creating bug:', error);
      throw error; // Re-throw to preserve original error details
    }
  }

  /**
   * Update existing bug - requires user ownership verification
   * @param {string} id - Bug ID
   * @param {Object} updateData - Updated bug data
   * @param {string} userId - User ID to verify ownership (required)
   * @returns {Object|null} Updated bug object or null if not found/access denied
   */
  async updateBug(id, updateData, userId) {
    try {
      if (!id) {
        throw new Error('Bug ID is required');
      }

      // Validate userId is provided and not empty
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('userId is required for bug updates');
      }

      const updateFields = {
        title: updateData.title,
        description: updateData.description,
        errorMessage: updateData.errorMessage || '',
        solution: updateData.solution || '',
        reason: updateData.reason || '',
        tags: updateData.tags || [],
        status: updateData.status || 'Unsolved',
        updatedAt: new Date()
      };

      // Always include userId for ownership verification
      const query = { id, userId: userId.trim() };

      const updatedBug = await Bug.findOneAndUpdate(
        query,
        updateFields,
        { new: true, runValidators: true }
      ).lean();

      if (!updatedBug) {
        // Log ownership violation attempt for security monitoring
        console.warn(`Bug update denied - ID: ${id}, User: ${userId} (bug not found or access denied)`);
        return null;
      }

      console.log(`Bug updated successfully: ${id} by user: ${userId}`);
      return this._transformBug(updatedBug);
    } catch (error) {
      if (error.name === 'ValidationError') {
        console.error('Bug update validation failed:', error.message);
        throw new Error(`Validation failed: ${error.message}`);
      }

      console.error('Error updating bug:', error);
      throw error; // Re-throw to preserve original error details
    }
  }

  /**
   * Delete bug by ID - requires user ownership verification
   * @param {string} id - Bug ID
   * @param {string} userId - User ID to verify ownership (required)
   * @returns {boolean} True if deleted, false if not found/access denied
   */
  async deleteBug(id, userId) {
    try {
      if (!id) {
        throw new Error('Bug ID is required');
      }

      // Validate userId is provided and not empty
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('userId is required for bug deletion');
      }

      // Always include userId for ownership verification
      const query = { id, userId: userId.trim() };

      const result = await Bug.deleteOne(query);
      const deleted = result.deletedCount > 0;

      if (deleted) {
        console.log(`Bug deleted successfully: ${id} by user: ${userId}`);
      } else {
        // Log ownership violation attempt for security monitoring
        console.warn(`Bug deletion denied - ID: ${id}, User: ${userId} (bug not found or access denied)`);
      }

      return deleted;
    } catch (error) {
      console.error('Error deleting bug:', error);
      throw error; // Re-throw to preserve original error details
    }
  }

  /**
   * Database health check
   * @returns {boolean} True if database is connected
   */
  async healthCheck() {
    try {
      // Simple query to test database connectivity
      await Bug.findOne().limit(1);
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Transform bug object to match existing API format
   * Converts MongoDB dates to ISO strings for API compatibility
   * @private
   */
  _transformBug(bug) {
    return {
      id: bug.id,
      title: bug.title,
      description: bug.description,
      errorMessage: bug.errorMessage,
      solution: bug.solution,
      reason: bug.reason,
      tags: bug.tags,
      status: bug.status,
      date: bug.date instanceof Date ? bug.date.toISOString() : bug.date,
      createdAt: bug.createdAt instanceof Date ? bug.createdAt.toISOString() : bug.createdAt,
      updatedAt: bug.updatedAt instanceof Date ? bug.updatedAt.toISOString() : bug.updatedAt,
      userId: bug.userId
    };
  }

  /**
   * Count total bugs (utility method)
   * @returns {number} Total number of bugs
   */
  async getBugCount() {
    try {
      return await Bug.countDocuments();
    } catch (error) {
      console.error('Error counting bugs:', error);
      return 0;
    }
  }
}

module.exports = new BugService();