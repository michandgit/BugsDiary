const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// User schema for authentication and user management
const userSchema = new mongoose.Schema({
  // Use UUID-based ID for consistency with Bug model
  userId: {
    type: String,
    required: true,
    unique: true
  },

  // User identification
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  // Timestamps
  createdAt: {
    type: Date,
    required: true
  },

  updatedAt: {
    type: Date,
    required: true
  }
}, {
  // Disable automatic timestamps since we manage them manually
  timestamps: false,

  // Transform output to exclude sensitive data
  toJSON: {
    transform: function(doc, ret) {
      // Convert dates to ISO strings for API compatibility
      if (ret.createdAt) ret.createdAt = ret.createdAt.toISOString();
      if (ret.updatedAt) ret.updatedAt = ret.updatedAt.toISOString();

      // Remove MongoDB's _id, __v and password from API responses
      delete ret._id;
      delete ret.__v;
      delete ret.password;

      return ret;
    }
  }
});

// Create additional indexes for performance
// Note: userId and email indexes are automatically created by schema unique: true
userSchema.index({ createdAt: -1 });

// Hash password before saving - Modern Mongoose async/await pattern
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return;

  try {
    // Hash password with salt rounds of 12
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    console.log('Password hashed successfully for user:', this.email);
  } catch (error) {
    console.error('Password hashing failed:', error.message);
    throw error; // In modern Mongoose, just throw the error
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Static method to find user by email (for login)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

module.exports = mongoose.model('User', userSchema);