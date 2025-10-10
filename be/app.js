require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const waitlistRoutes = require('./routes/waitlistRoutes');
const authRoutes = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const qrCodeRoutes = require('./routes/qrCodeRoutes');
const memberRoutes = require('./routes/memberRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const contactRoutes = require('./routes/contactRoutes');
const healthRoutes = require('./routes/healthRoutes');
const superRoutes = require('./routes/superRoutes');

// Import models to ensure they are registered with Mongoose
require('./models/Organization');
require('./models/OrganizationDetails');
require('./models/User');
require('./models/Reward');
require('./models/QRCode');
require('./models/Transaction');
require('./models/Message');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  console.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    ip: req.ip,
    userId: req.user?._id
  });

  // Override res.json to capture and log the response
  const originalJson = res.json;
  res.json = function(body) {
    const responseTime = Date.now() - start;
    console.info('Response sent', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      hasBody: Boolean(body)
    });
    return originalJson.call(this, body);
  };

  next();
});

// Health check endpoint
app.get('/api/test', (req, res) => {
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
app.use('/api/memberships', memberRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/super', superRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.info('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', {
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
const USE_HTTPS = process.env.USE_HTTPS === 'true';

const startServer = async () => {
  try {
    await connectDB();
    
    if (USE_HTTPS) {
      // HTTPS server setup
      const sslDir = path.resolve(__dirname, 'ssl');
      const keyPath = path.join(sslDir, 'localhost.key');
      const certPath = path.join(sslDir, 'localhost.crt');
      
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        const httpsOptions = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath)
        };
        
        https.createServer(httpsOptions, app).listen(PORT, () => {
          console.info(`HTTPS Server is running on port ${PORT}`);
        });
      } else {
        console.error('SSL certificate files not found. Please ensure localhost.key and localhost.crt exist in the ssl/ directory.');
        process.exit(1);
      }
    } else {
      // HTTP server (fallback)
      app.listen(PORT, () => {
        console.info(`HTTP Server is running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();
