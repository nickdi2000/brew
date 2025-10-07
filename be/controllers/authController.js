const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { formatResponse, formatError } = require('../utils/responseFormatter');
const { registerAdminAccount, ServiceError } = require('../services/adminAuthService');

// Register user and brewery
exports.register = async (req, res) => {
  try {
    const { breweryName, email, password, qrCode } = req.body;

    // Validation
    if (!breweryName || !password) {
      return res.status(400).json(formatError('Brewery name and password are required'));
    }

    if (password && password.length < 6) {
      return res.status(400).json(formatError('Password must be at least 6 characters long'));
    }

    try {
      const { payload, message } = await registerAdminAccount({
        breweryName,
        email,
        password,
        qrCode
      });

      res.status(201).json(formatResponse({
        data: payload,
        message
      }));
      return;
    } catch (serviceError) {
      if (serviceError instanceof ServiceError) {
        return res.status(serviceError.status).json(formatError(serviceError.message, serviceError.meta));
      }

      if (serviceError?.code === 11000) {
        if (serviceError.keyPattern?.name) {
          return res.status(400).json(formatError(
            `A brewery with the name "${serviceError.keyValue?.name}" already exists. Please choose a different name.`
          ));
        }
        if (serviceError.keyPattern?.code) {
          return res.status(400).json(formatError(
            `Organization code "${serviceError.keyValue?.code}" is already taken. Please try registration again.`
          ));
        }
        if (serviceError.keyPattern?.email) {
          return res.status(400).json(formatError(
            `A user with the email "${serviceError.keyValue?.email}" already exists.`
          ));
        }
        return res.status(400).json(formatError('This information is already taken. Please try with different details.'));
      }

      console.error('Registration error:', serviceError);
      return res.status(500).json(formatError('An error occurred during registration', serviceError.message));
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key errors with user-friendly messages
    if (error.code === 11000) {
      if (error.keyPattern?.name) {
        return res.status(400).json(formatError(
          `A brewery with the name "${error.keyValue?.name}" already exists. Please choose a different name.`
        ));
      }
      if (error.keyPattern?.code) {
        return res.status(400).json(formatError(
          `Organization code "${error.keyValue?.code}" is already taken. Please try registration again.`
        ));
      }
      if (error.keyPattern?.email) {
        return res.status(400).json(formatError(
          `A user with the email "${error.keyValue?.email}" already exists.`
        ));
      }
      // Generic duplicate key error
      return res.status(400).json(formatError('This information is already taken. Please try with different details.'));
    }
    
    res.status(500).json(formatError('An error occurred during registration', error.message));
  }
};

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

    // Determine primary organization (first one by convention)
    const primaryOrgId = (user.organizations && user.organizations.length > 0)
      ? (user.organizations[0]._id || user.organizations[0])
      : null;

    // Generate access token with explicit organization set to user's primary org
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        organization: primaryOrgId,
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
        organizationId: primaryOrgId,
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

    // Determine primary organization (first one by convention)
    const primaryOrgId = (user.organizations && user.organizations.length > 0)
      ? (user.organizations[0]._id || user.organizations[0])
      : null;

    // Generate new access token (include organization to keep client/middleware in sync)
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        organization: primaryOrgId,
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
        refreshTokenExpiresAt,
        organizationId: primaryOrgId
      },
      message: 'Token refreshed successfully'
    }));
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json(formatError('An error occurred while refreshing token', error.message));
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    const userFromToken = req.user;
    if (!userFromToken) {
      return res.status(404).json(formatError('User not found'));
    }

    // Fetch the user model from database to use Mongoose methods
    const user = await User.findById(userFromToken._id);
    if (!user) {
      return res.status(404).json(formatError('User not found in database'));
    }

    // Clear the refresh token from the user
    user.refreshToken = null;
    user.refreshTokenExpiresAt = null;
    await user.save();

    res.json(formatResponse({
      data: null,
      message: 'Logout successful'
    }));
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(formatError('An error occurred during logout', error.message));
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

    // Get recent transactions for each membership
    const membershipTransactions = await Promise.all(
      memberships.map(async (membership) => {
        const transactions = await Transaction.find({ member: membership._id })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean();
        return {
          ...membership.toObject(),
          recentTransactions: transactions
        };
      })
    );

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
          memberships: membershipTransactions.map(m => ({
            _id: m._id,
            organization: m.organization,
            role: m.role,
            status: m.status,
            points: m.points,
            avatar: m.avatar,
            recentTransactions: m.recentTransactions
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
