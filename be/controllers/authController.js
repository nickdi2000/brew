const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const QRCode = require('../models/QRCode');
const Transaction = require('../models/Transaction');
const Reward = require('../models/Reward');
const { formatResponse, formatError } = require('../utils/responseFormatter');

// Helper function to generate a unique QR code string
const generateQRCodeString = () => Math.random().toString(36).substring(2, 10).toUpperCase();

// Helper function to create a default rewards QR code for new organizations
const createDefaultQRCode = async (organizationId, organizationName) => {
  try {
    const qrCode = await QRCode.create({
      organization: organizationId,
      code: generateQRCodeString(),
      name: 'Earn 100 Points!',
      points: 100,
      isActive: true,
      expiresAt: null // No expiration for the default reward
    });
    console.log(`✅ Created default QR code for ${organizationName}:`, qrCode.code);
    return qrCode;
  } catch (error) {
    console.error(`❌ Failed to create default QR code for ${organizationName}:`, error);
    throw error;
  }
};

// Helper function to create a default "Free Point!" reward for new organizations
const createDefaultReward = async (organizationId, organizationName) => {
  try {
    const reward = await Reward.create({
      name: 'Free Point!',
      description: 'Redeem 1000 points for a free point reward!',
      pointsCost: 1000,
      type: 'product',
      isActive: true,
      organizationId,
      redemptionInstructions: 'Show this reward to the staff to redeem.',
      termsAndConditions: 'No cash value. Cannot be combined with other offers.'
    });
    console.log(`✅ Created default reward for ${organizationName}`);
    return reward;
  } catch (error) {
    console.error(`❌ Failed to create default reward for ${organizationName}:`, error);
    throw error;
  }
};

// Register user and brewery
exports.register = async (req, res) => {
  try {
    const { breweryName, email, password, qrCode } = req.body;

    // Validation
    if (!breweryName || !password) {
      return res.status(400).json(formatError('Brewery name and password are required'));
    }

    if (password.length < 6) {
      return res.status(400).json(formatError('Password must be at least 6 characters long'));
    }

    // Only check for existing user if email is provided (not in onboarding case)
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json(formatError('A user with this email already exists'));
      }
    }

    // Check if brewery name is already taken
    const existingOrganization = await Organization.findOne({ name: breweryName });
    if (existingOrganization) {
      return res.status(400).json(formatError('A brewery with this name already exists'));
    }

    // Generate a unique organization code
    const generateOrganizationCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Generate unique organization code
    let organizationCode;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      organizationCode = generateOrganizationCode();
      attempts++;
      
      const existingOrg = await Organization.findOne({ code: organizationCode });
      if (!existingOrg) {
        break;
      }
      
      if (attempts >= maxAttempts) {
        return res.status(500).json(formatError('Failed to generate unique organization code'));
      }
    } while (attempts < maxAttempts);

    console.log(`Generated organization code: ${organizationCode}`);

    // Create organization (brewery)
    const organization = new Organization({
      name: breweryName,
      email: email, // Use the same email for the brewery initially
      description: `${breweryName} - A cool brewery, if I've ever seen one`,
      code: organizationCode
    });
    await organization.save();
    console.log(`✅ Created organization: ${organization.name} with code: ${organization.code}`);

    // Create QR code and default reward for the new brewery
    let defaultQRCode = null;
    let defaultReward = null;
    try {
      if (qrCode) {
        // Create QR code with provided code
        defaultQRCode = await QRCode.create({
          organization: organization._id,
          code: qrCode,
          name: 'Earn 100 Points!',
          points: 100,
          isActive: true,
          expiresAt: null
        });
        console.log(`✅ Created QR code with provided code for ${organization.name}:`, defaultQRCode.code);
      } else {
        // Create default QR code
        defaultQRCode = await createDefaultQRCode(organization._id, organization.name);
      }
    } catch (qrError) {
      // Log the error but don't fail registration if QR code creation fails
      console.error('Warning: Failed to create QR code during registration:', qrError);
    }
    try {
      defaultReward = await createDefaultReward(organization._id, organization.name);
    } catch (rewardError) {
      // Log the error but don't fail registration if reward creation fails
      console.error('Warning: Failed to create default reward during registration:', rewardError);
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName: breweryName.split(' ')[0], // Use first word of brewery name as first name
      lastName: 'Admin', // Default last name
      isAdmin: true, // Make the brewery owner an admin
      organizations: [organization._id]
    });
    await user.save();

    // Generate access token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        organization: organization._id,
        organizations: [organization._id]
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
    res.status(201).json(formatResponse({
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
          organizations: [{
            id: organization._id,
            name: organization.name
          }]
        },
        organization: {
          id: organization._id,
          name: organization.name,
          code: organization.code,
          description: organization.description
        },
        defaultQRCode: defaultQRCode ? {
          id: defaultQRCode._id,
          code: defaultQRCode.code,
          name: defaultQRCode.name,
          points: defaultQRCode.points
        } : null,
        defaultReward: defaultReward ? {
          id: defaultReward._id,
          name: defaultReward.name,
          description: defaultReward.description,
          pointsCost: defaultReward.pointsCost
        } : null
      },
      message: `Registration successful! Welcome to BrewTokens! ${defaultQRCode ? 'Your first QR code has been created' : ''}${defaultQRCode && defaultReward ? ' and' : ''}${defaultReward ? ' a "Free Point!" reward is ready for your members' : ''}.`
    }));
  } catch (error) {
    console.error('Registration error:', error);
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