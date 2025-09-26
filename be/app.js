require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./utils/logger');
const userRoutes = require('./routes/userRoutes');
const waitlistRoutes = require('./routes/waitlistRoutes');
const authRoutes = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const qrCodeRoutes = require('./routes/qrCodeRoutes');
const logRoutes = require('./routes/logRoutes');
const memberRoutes = require('./routes/memberRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Import models to ensure they are registered with Mongoose
require('./models/Organization');
require('./models/User');
require('./models/Reward');
require('./models/QRCode');
require('./models/Transaction');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log the incoming request
  logger.logRequest(req);

  // Override res.json to capture and log the response
  const originalJson = res.json;
  res.json = function(body) {
    const responseTime = Date.now() - start;
    logger.logResponse(req, res, body, { responseTime });
    return originalJson.call(this, body);
  };

  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'BrewTokens! The API is healthy.' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/qr-codes', qrCodeRoutes);
app.use('/api/log', logRoutes);
app.use('/api/memberships', memberRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?._id
  });
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();
