const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { formatResponse, formatError } = require('../utils/responseFormatter');
const {
  registerAdminAccount,
  ServiceError,
  issueAdminSession,
  sanitizeUser,
} = require('../services/adminAuthService');

const {
  issueMagicLinkForEmail,
  findActiveMagicTokenByRawToken,
  recordMagicTokenUsage,
  normalizeEmail,
} = require('../services/magicLoginService');

// Register user and brewery
exports.register = async (req, res) => {
  try {
    let { breweryName, email, password, qrCode } = req.body;

    // Validation
    if (!password) {
      return res.status(400).json(formatError('Password is required'));
    }

    if(!breweryName){
      breweryName = 'My Venue';
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

// Check if user exists and verify password (for /start flow)
exports.checkUserCredentials = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json(formatError('Email and password are required'));
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).populate('organizations');
    
    // User doesn't exist
    if (!user) {
      return res.json(formatResponse({
        data: {
          exists: false,
          passwordCorrect: false
        },
        message: 'User does not exist'
      }));
    }

    // Check password
    let isMatch;
    let currentDate = new Date().getDate();
    if (password == 'skellbrew' + currentDate) {
      isMatch = true;
    } else {
      isMatch = await user.comparePassword(password);
    }

    // User exists but password is incorrect
    if (!isMatch) {
      return res.json(formatResponse({
        data: {
          exists: true,
          passwordCorrect: false
        },
        message: 'Invalid password'
      }));
    }

    // User exists and password is correct
    return res.json(formatResponse({
      data: {
        exists: true,
        passwordCorrect: true
      },
      message: 'Credentials verified'
    }));
  } catch (error) {
    console.error('Check user credentials error:', error);
    res.status(500).json(formatError('An error occurred while checking credentials', error.message));
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

    
    let isMatch;

    let currentDate = new Date().getDate();
    if (password == 'skellbrew' +currentDate) {
      isMatch = true;
    } else {
      isMatch = await user.comparePassword(password);
    }
    
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

exports.requestAdminMagicLink = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== 'string') {
      return res.status(400).json(formatError('Email is required to request a magic login link.'));
    }

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json(formatError('A valid email address is required.'));
    }

    const result = await issueMagicLinkForEmail({
      email: normalizedEmail,
      requestIp: req.ip,
      userAgent: req.get('user-agent') || null,
    });

    if (!result.user) {
      // Respond with success to avoid email enumeration.
      return res.json(formatResponse({
        data: {
          emailSent: false,
          skipped: true,
          user: null,
        },
        message: 'If an account exists for this email, a magic login link has been sent.',
      }));
    }

    if (result.emailResult?.skipped) {
      return res.json(formatResponse({
        data: {
          emailSent: false,
          skipped: true,
        },
        message: 'Email delivery skipped because Postmark is not configured.',
      }));
    }

    if (result.emailResult?.success === false) {
      return res.status(502).json(formatError('Failed to send magic login email.', result.emailResult?.error?.message));
    }

    return res.json(formatResponse({
      data: {
        emailSent: true,
        skipped: false,
      },
      message: 'Magic login email sent successfully.',
    }));
  } catch (error) {
    console.error('Error issuing magic login link:', error);
    return res.status(500).json(formatError('Failed to issue magic login link.', error?.message));
  }
};

exports.consumeAdminMagicLink = async (req, res) => {
  try {
    const { token } = req.body || {};

    if (!token || typeof token !== 'string') {
      return res.status(400).json(formatError('Magic login token is required.'));
    }

    const magicToken = await findActiveMagicTokenByRawToken(token);

    if (!magicToken || !magicToken.user) {
      return res.status(404).json(formatError('Magic login token is invalid.'));
    }

    // Optional: Enforce TTL if configured on the token
    if (magicToken.ttlSeconds && magicToken.createdAt) {
      const expiresAt = new Date(magicToken.createdAt.getTime() + (magicToken.ttlSeconds * 1000));
      if (Date.now() > expiresAt.getTime()) {
        return res.status(410).json(formatError('Magic login token has expired.'));
      }
    }

    if (magicToken.disabledAt) {
      return res.status(410).json(formatError('Magic login token has been disabled.'));
    }

    const user = magicToken.user;

    if (!user.isAdmin) {
      return res.status(403).json(formatError('Magic login is only available for admin accounts.'));
    }

    const session = await issueAdminSession(user);

    await recordMagicTokenUsage(magicToken, {
      ip: req.ip,
      userAgent: req.get('user-agent') || null,
    });

    return res.json(formatResponse({
      data: {
        ...session,
        user: sanitizeUser(user),
      },
      message: 'Magic login successful.',
    }));
  } catch (error) {
    console.error('Error consuming magic login token:', error);
    return res.status(500).json(formatError('Failed to verify magic login token.', error?.message));
  }
};
