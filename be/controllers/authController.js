const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { formatResponse, formatError } = require('../utils/responseFormatter');

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).populate('organizations');
    if (!user) {
      return res.status(401).json(formatError('Invalid credentials'));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(formatError('Invalid credentials'));
    }

    // Generate access token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        organization: user.organization, // Include single organization
        organizations: user.organizations.map(org => org._id)
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token and its expiry
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);
    
    user.refreshToken = refreshToken;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
    await user.save();

    // Return user info and token
    res.json(formatResponse({
      data: {
        token,
        refreshToken,
        refreshTokenExpiresAt,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          organizations: user.organizations.map(org => ({
            id: org._id,
            name: org.name
          })),
          sso: user.sso ? {
            provider: user.sso.provider,
            google: user.sso.google ? {
              id: user.sso.google.id,
              email: user.sso.google.email,
              name: user.sso.google.name,
              picture: user.sso.google.picture
            } : null,
            linkedAt: user.sso.linkedAt,
            lastLoginAt: user.sso.lastLoginAt
          } : null
        }
      },
      message: 'Login successful'
    }));
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json(formatError('An error occurred during login', error.message));
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json(formatError('Refresh token is required'));
    }

    // Find user by refresh token
    const user = await User.findOne({ 
      refreshToken,
      refreshTokenExpiresAt: { $gt: new Date() }
    }).populate('organizations');

    if (!user) {
      return res.status(401).json(formatError('Invalid or expired refresh token'));
    }

    // Generate new access token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        organizations: user.organizations.map(org => org._id)
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update refresh token and expiry
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);
    
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiresAt = refreshTokenExpiresAt;
    await user.save();

    res.json(formatResponse({
      data: {
        token,
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt
      },
      message: 'Token refreshed successfully'
    }));
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json(formatError('An error occurred while refreshing token', error.message));
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // User is attached by authenticateToken middleware and already has organizations populated
    const user = req.user;
    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    // Include per-organization membership roles for this user
    const Member = require('../models/Member');
    const memberships = await Member.find({ user: user._id }).select('organization role status points avatar');

    res.json(formatResponse({
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          organizations: user.organizations.map(org => ({
            id: org._id,
            name: org.name
          })),
          memberships: memberships.map(m => ({
            organization: m.organization,
            role: m.role,
            status: m.status,
            points: m.points,
            avatar: m.avatar
          })),
          sso: user.sso ? {
            provider: user.sso.provider,
            google: user.sso.google ? {
              id: user.sso.google.id,
              email: user.sso.google.email,
              name: user.sso.google.name,
              picture: user.sso.google.picture
            } : null,
            linkedAt: user.sso.linkedAt,
            lastLoginAt: user.sso.lastLoginAt
          } : null
        }
      },
      message: 'User details retrieved successfully'
    }));
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json(formatError('An error occurred while fetching user data', error.message));
  }
};