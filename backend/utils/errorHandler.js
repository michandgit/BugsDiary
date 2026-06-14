/**
 * Error handling utilities for MongoDB operations
 * Maintains API compatibility with existing error responses
 */

/**
 * Handle MongoDB connection errors
 * @param {Error} error - MongoDB connection error
 * @returns {Object} Standardized error response
 */
const handleConnectionError = (error) => {
  console.error('MongoDB Connection Error:', error.message);

  return {
    status: 500,
    message: 'Database connection failed',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
};

/**
 * Handle invalid ObjectId errors
 * @param {Error} error - Invalid ObjectId error
 * @returns {Object} Standardized error response
 */
const handleInvalidIdError = (error) => {
  console.error('Invalid ID Error:', error.message);

  return {
    status: 400,
    message: 'Invalid ID format',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
};

/**
 * Handle duplicate key errors (11000)
 * @param {Error} error - Duplicate key error
 * @returns {Object} Standardized error response
 */
const handleDuplicateError = (error) => {
  console.error('Duplicate Key Error:', error.message);

  // Extract field name from error message
  const field = Object.keys(error.keyPattern || {})[0] || 'field';

  return {
    status: 409,
    message: `Duplicate ${field} already exists`,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
};

/**
 * Handle validation errors
 * @param {Error} error - Mongoose validation error
 * @returns {Object} Standardized error response
 */
const handleValidationError = (error) => {
  console.error('Validation Error:', error.message);

  const errors = Object.values(error.errors || {}).map(err => err.message);

  return {
    status: 400,
    message: 'Validation failed',
    errors: errors,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
};

/**
 * Handle timeout errors
 * @param {Error} error - Timeout error
 * @returns {Object} Standardized error response
 */
const handleTimeoutError = (error) => {
  console.error('Database Timeout:', error.message);

  return {
    status: 503,
    message: 'Database operation timed out',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
};

/**
 * Handle cast errors (invalid data types)
 * @param {Error} error - Cast error
 * @returns {Object} Standardized error response
 */
const handleCastError = (error) => {
  console.error('Cast Error:', error.message);

  return {
    status: 400,
    message: `Invalid ${error.path}: ${error.value}`,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
};

/**
 * Main error handler that routes different error types
 * @param {Error} error - Any error from MongoDB operations
 * @returns {Object} Standardized error response
 */
const handleDatabaseError = (error) => {
  // Handle different types of MongoDB/Mongoose errors
  if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
    return handleConnectionError(error);
  }

  if (error.name === 'CastError') {
    return handleCastError(error);
  }

  if (error.name === 'ValidationError') {
    return handleValidationError(error);
  }

  if (error.code === 11000 || error.name === 'MongoServerError') {
    return handleDuplicateError(error);
  }

  if (error.name === 'MongoNetworkTimeoutError' || error.name === 'MongoTimeoutError') {
    return handleTimeoutError(error);
  }

  // Generic error for unknown types
  console.error('Unknown Database Error:', error.message);

  return {
    status: 500,
    message: 'Database operation failed',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
};

/**
 * Express error middleware for database errors
 * Maintains compatibility with existing error response format
 */
const databaseErrorMiddleware = (error, req, res, next) => {
  const errorResponse = handleDatabaseError(error);

  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Full Error Stack:', error.stack);
  }

  // Send response in the same format as current implementation
  res.status(errorResponse.status).json({
    error: errorResponse.message
  });
};

/**
 * Check if error is a MongoDB connection issue
 * @param {Error} error - Error to check
 * @returns {boolean} True if connection error
 */
const isConnectionError = (error) => {
  return error.name === 'MongoNetworkError' ||
         error.name === 'MongoServerSelectionError' ||
         error.message?.includes('connection');
};

/**
 * Check if error is a timeout issue
 * @param {Error} error - Error to check
 * @returns {boolean} True if timeout error
 */
const isTimeoutError = (error) => {
  return error.name === 'MongoNetworkTimeoutError' ||
         error.name === 'MongoTimeoutError' ||
         error.message?.includes('timeout');
};

/**
 * Check if error is a duplicate key issue
 * @param {Error} error - Error to check
 * @returns {boolean} True if duplicate error
 */
const isDuplicateError = (error) => {
  return error.code === 11000 || error.name === 'MongoServerError';
};

module.exports = {
  handleDatabaseError,
  handleConnectionError,
  handleInvalidIdError,
  handleDuplicateError,
  handleValidationError,
  handleTimeoutError,
  handleCastError,
  databaseErrorMiddleware,
  isConnectionError,
  isTimeoutError,
  isDuplicateError
};