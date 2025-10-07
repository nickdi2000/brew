const express = require('express');
const router = express.Router();
const { formatResponse } = require('../utils/responseFormatter');
const Organization = require('../models/Organization');
const User = require('../models/User');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      services: {
        api: 'running',
        auth: 'running'
      }
    };

    // Test database connectivity
    const orgCount = await Organization.countDocuments();
    const userCount = await User.countDocuments();
    
    health.stats = {
      organizations: orgCount,
      users: userCount
    };

    res.json(formatResponse({
      data: health,
      message: 'System health check passed'
    }));
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected'
    });
  }
});

// Detailed diagnostics endpoint (for debugging)
router.get('/diagnostics', async (req, res) => {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    // Database diagnostics
    try {
      const organizations = await Organization.find().select('_id name code').limit(5);
      const users = await User.find().select('_id email organizations').limit(5);
      
      diagnostics.database = {
        status: 'connected',
        sampleOrganizations: organizations.map(org => ({
          id: org._id,
          name: org.name,
          code: org.code
        })),
        sampleUsers: users.map(user => ({
          id: user._id,
          email: user.email,
          organizationCount: user.organizations?.length || 0
        }))
      };
    } catch (dbError) {
      diagnostics.database = {
        status: 'error',
        error: dbError.message
      };
    }

    res.json(formatResponse({
      data: diagnostics,
      message: 'Diagnostics completed'
    }));
  } catch (error) {
    console.error('Diagnostics failed:', error);
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;