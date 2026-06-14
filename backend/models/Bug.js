const mongoose = require('mongoose');

// Bug schema that preserves all existing JSON fields
const bugSchema = new mongoose.Schema({
  // Preserve existing UUID-based ID for API compatibility
  id: {
    type: String,
    required: true,
    unique: true
  },

  // Required fields (from current validation)
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true,
    trim: true
  },

  // Optional fields with defaults matching current implementation
  errorMessage: {
    type: String,
    default: ''
  },

  solution: {
    type: String,
    default: ''
  },

  reason: {
    type: String,
    default: ''
  },

  tags: {
    type: [String],
    default: []
  },

  status: {
    type: String,
    default: 'Unsolved',
    enum: ['Solved', 'Unsolved'] // Based on existing data
  },

  // Date fields - preserve existing behavior
  date: {
    type: Date,
    required: true
  },

  createdAt: {
    type: Date,
    required: true
  },

  updatedAt: {
    type: Date,
    required: true
  },

  // User ownership - required for data integrity
  userId: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        // Validate that userId is not empty string
        return value && value.trim().length > 0;
      },
      message: 'userId must be a valid non-empty string'
    }
  }
}, {
  // Disable automatic timestamps since we manage them manually
  timestamps: false,

  // Transform output to match existing API format
  toJSON: {
    transform: function(doc, ret) {
      // Convert dates back to ISO strings for API compatibility
      if (ret.date) ret.date = ret.date.toISOString();
      if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
      if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();

      // Remove MongoDB's _id and __v from API responses
      delete ret._id;
      delete ret.__v;

      return ret;
    }
  }
});

// Create indexes for performance
// Note: id index is automatically created by schema unique: true
bugSchema.index({ userId: 1, createdAt: -1 }); // For user-specific queries
bugSchema.index({ status: 1 });
bugSchema.index({ tags: 1 });

// Text index for search functionality
bugSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  reason: 'text'
});

module.exports = mongoose.model('Bug', bugSchema);