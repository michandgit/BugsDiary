const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

/**
 * JWT Authentication Middleware with Enhanced Error Handling
 * Verifies JWT token and adds user to request object
 */
const authenticateToken = async (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15); // Simple request ID for tracing

  try {
    console.log(`[AUTH:${requestId}] Starting authentication for ${req.method} ${req.path}`);

    // Validate that 'next' is a function (debug the reported issue)
    if (typeof next !== 'function') {
      const error = new Error('Middleware error: next is not a function');
      error.middlewareContext = {
        requestId,
        route: `${req.method} ${req.path}`,
        nextType: typeof next,
        nextValue: next
      };
      console.error(`[AUTH:${requestId}] CRITICAL ERROR: next is not a function`, error.middlewareContext);
      throw error;
    }

    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log(`[AUTH:${requestId}] Token present: ${!!token}, Auth header: ${!!authHeader}`);

    if (!token) {
      console.log(`[AUTH:${requestId}] Authentication failed: No token provided`);
      return res.status(401).json({
        error: 'Access token required',
        code: 'TOKEN_MISSING',
        requestId
      });
    }

    // Verify token
    console.log(`[AUTH:${requestId}] Verifying JWT token...`);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[AUTH:${requestId}] Token decoded successfully for userId: ${decoded.userId}`);

    // Get user from database with enhanced error handling
    console.log(`[AUTH:${requestId}] Fetching user from database...`);
    let user;
    try {
      user = await userService.getUserById(decoded.userId);
    } catch (dbError) {
      console.error(`[AUTH:${requestId}] Database error during user lookup:`, {
        error: dbError.message,
        userId: decoded.userId,
        errorType: dbError.name,
        code: dbError.code
      });

      // Handle specific database errors
      if (dbError.name === 'MongoTimeoutError' || dbError.code === 'ETIMEDOUT') {
        return res.status(503).json({
          error: 'Database temporarily unavailable',
          code: 'DATABASE_TIMEOUT',
          requestId
        });
      }

      if (dbError.name === 'MongoNetworkError') {
        return res.status(503).json({
          error: 'Database connection failed',
          code: 'DATABASE_CONNECTION_ERROR',
          requestId
        });
      }

      // Generic database error
      return res.status(500).json({
        error: 'Authentication service temporarily unavailable',
        code: 'DATABASE_ERROR',
        requestId
      });
    }

    if (!user) {
      console.warn(`[AUTH:${requestId}] User not found for userId: ${decoded.userId}`);
      return res.status(401).json({
        error: 'Invalid token - user not found',
        code: 'USER_NOT_FOUND',
        requestId
      });
    }

    console.log(`[AUTH:${requestId}] User authenticated successfully: ${user.name} (${user.email})`);

    // Add user to request object
    req.user = user;
    req.requestId = requestId; // Add request ID for downstream logging

    const duration = Date.now() - startTime;
    console.log(`[AUTH:${requestId}] Authentication completed successfully in ${duration}ms`);

    // Call next with error handling
    try {
      next();
    } catch (nextError) {
      console.error(`[AUTH:${requestId}] Error calling next():`, {
        error: nextError.message,
        nextType: typeof next,
        stack: nextError.stack
      });
      throw nextError;
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[AUTH:${requestId}] Authentication failed after ${duration}ms:`, {
      error: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });

    // Handle JWT-specific errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token format',
        code: 'INVALID_TOKEN',
        requestId
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        requestId,
        expiredAt: error.expiredAt
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        error: 'Token not active yet',
        code: 'TOKEN_NOT_ACTIVE',
        requestId
      });
    }

    // Handle the specific "next is not a function" error
    if (error.message.includes('next is not a function')) {
      console.error(`[AUTH:${requestId}] MIDDLEWARE CHAIN ERROR:`, error.middlewareContext);
      return res.status(500).json({
        error: 'Server middleware configuration error',
        code: 'MIDDLEWARE_ERROR',
        requestId
      });
    }

    // Generic authentication error
    return res.status(500).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
      requestId
    });
  }
};

/**
 * Optional Authentication Middleware
 * Adds user to request if valid token is provided, but doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userService.getUserById(decoded.userId);

    req.user = user || null;
    next();
  } catch (error) {
    // For optional auth, continue without user if token is invalid
    req.user = null;
    next();
  }
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    userId: user.userId,
    email: user.email
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRATION || '7d',
    issuer: 'bug-diary',
    subject: user.userId
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Async Error Wrapper for Route Handlers
 * Catches unhandled promise rejections and passes them to error middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  const requestId = req.requestId || 'unknown';
  console.log(`[ASYNC:${requestId}] Wrapping async handler for ${req.method} ${req.path}`);

  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error(`[ASYNC:${requestId}] Unhandled async error in route handler:`, {
      error: error.message,
      route: `${req.method} ${req.path}`,
      stack: error.stack
    });

    // Pass error to Express error middleware
    next(error);
  });
};

/**
 * Enhanced Error Logging Middleware
 * Logs detailed error information for debugging
 */
const errorLogger = (error, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  console.error(`[ERROR:${requestId}] Express error handler triggered:`, {
    error: error.message,
    name: error.name,
    route: `${req.method} ${req.path}`,
    user: req.user ? req.user.userId : 'unauthenticated',
    stack: error.stack
  });
  next(error);
};

/**
 * Validate required environment variables for JWT
 */
const validateJWTConfig = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.warn('WARNING: JWT_SECRET should be at least 32 characters long for security');
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  generateToken,
  validateJWTConfig,
  asyncHandler,
  errorLogger
};