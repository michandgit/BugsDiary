const express = require('express');
const cors = require('cors');
require('dotenv').config();

// MongoDB setup
const { connectDB, isConnected } = require('./config/database');
const bugService = require('./services/bugService');
const { databaseErrorMiddleware } = require('./utils/errorHandler');

// Authentication setup
const authRoutes = require('./routes/auth');
const { authenticateToken, validateJWTConfig, errorLogger } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize MongoDB connection and validate configuration
async function initializeDatabase() {
  try {
    await connectDB();
    console.log('Database connection established');

    // Validate JWT configuration
    validateJWTConfig();
    console.log('JWT configuration validated');
  } catch (error) {
    console.error('Failed to initialize application:', error.message);
    throw error;
  }
}

// Auth Routes (public)
app.use('/api/auth', authRoutes);

// Routes (protected)

// GET all bugs (protected)
app.get('/api/bugs', authenticateToken, async (req, res) => {
  try {
    const bugs = await bugService.getBugsByUserId(req.user.userId);
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read bugs' });
  }
});

// GET single bug by ID (protected)
app.get('/api/bugs/:id', authenticateToken, async (req, res) => {
  try {
    const bug = await bugService.getBugByIdAndUserId(req.params.id, req.user.userId);
    if (!bug) {
      return res.status(404).json({ error: 'Bug not found' });
    }
    res.json(bug);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read bug' });
  }
});

// POST new bug (protected)
app.post('/api/bugs', authenticateToken, async (req, res) => {
  try {
    const { title, description, errorMessage, solution, reason, tags, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const newBug = await bugService.createBug({
      title,
      description,
      errorMessage,
      solution,
      reason,
      tags,
      status
    }, req.user.userId);

    res.status(201).json(newBug);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bug' });
  }
});

// PUT update bug (protected)
app.put('/api/bugs/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, errorMessage, solution, reason, tags, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const updatedBug = await bugService.updateBug(req.params.id, {
      title,
      description,
      errorMessage,
      solution,
      reason,
      tags,
      status
    }, req.user.userId);

    if (!updatedBug) {
      return res.status(404).json({ error: 'Bug not found or access denied' });
    }

    res.json(updatedBug);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bug' });
  }
});

// DELETE bug (protected)
app.delete('/api/bugs/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await bugService.deleteBug(req.params.id, req.user.userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Bug not found or access denied' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete bug' });
  }
});

// Health check with database connectivity
app.get('/api/health', async (req, res) => {
  try {
    const dbHealthy = await bugService.healthCheck();

    res.json({
      status: dbHealthy ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      database: {
        connected: isConnected(),
        healthy: dbHealthy
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        healthy: false
      },
      error: 'Database health check failed'
    });
  }
});

// Add enhanced error handling middleware
app.use(errorLogger);           // Log detailed error information
app.use(databaseErrorMiddleware); // Original database error handler

// Start server with database initialization
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Bug Diary Backend running on port ${PORT}`);
      console.log(`Database: ${isConnected() ? 'Connected' : 'Disconnected'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();