const express = require('express');
const userService = require('../services/userService');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /auth/signup
 * Register a new user account
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required'
      });
    }

    // Create user
    const user = await userService.createUser({
      name,
      email,
      password
    });

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);

    // Handle specific error types
    if (error.message.includes('email already exists')) {
      return res.status(409).json({
        error: 'A user with this email already exists'
      });
    }

    if (error.message.includes('Validation failed')) {
      return res.status(400).json({
        error: error.message
      });
    }

    if (error.message.includes('Password must be at least')) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to create user account'
    });
  }
});

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Authenticate user
    const user = await userService.authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed'
    });
  }
});

/**
 * GET /auth/me
 * Get current authenticated user information
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // User is already attached to req by authenticateToken middleware
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Failed to get user information'
    });
  }
});

/**
 * PUT /auth/me
 * Update current authenticated user information
 */
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Update user
    const updatedUser = await userService.updateUser(req.user.userId, {
      name,
      email
    });

    if (!updatedUser) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);

    if (error.message.includes('Email already exists')) {
      return res.status(409).json({
        error: 'This email is already in use'
      });
    }

    if (error.message.includes('Validation failed')) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to update user'
    });
  }
});

/**
 * GET /auth/health
 * Health check for auth service
 */
router.get('/health', async (req, res) => {
  try {
    const dbHealthy = await userService.healthCheck();

    res.json({
      status: dbHealthy ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      service: 'authentication',
      database: {
        healthy: dbHealthy
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'authentication',
      error: 'Health check failed'
    });
  }
});

module.exports = router;