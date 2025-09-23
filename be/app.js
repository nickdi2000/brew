require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const waitlistRoutes = require('./routes/waitlistRoutes');
const authRoutes = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const qrCodeRoutes = require('./routes/qrCodeRoutes');
const logRoutes = require('./routes/logRoutes');
const memberRoutes = require('./routes/memberRoutes');

// Import models to ensure they are registered with Mongoose
require('./models/Organization');
require('./models/User');
require('./models/Reward');
require('./models/QRCode');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
