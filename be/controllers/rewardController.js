const Reward = require('../models/Reward');
const Transaction = require('../models/Transaction');
const Member = require('../models/Member');
const { formatResponse, formatError } = require('../utils/responseFormatter');
const transactionService = require('../services/transactionService');

// Get rewards list with pagination and filters
exports.getRewards = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {
      organizationId: req.user.organizationId
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) {
      query.type = type;
    }

    if (typeof isActive === 'string') {
      query.isActive = isActive.toLowerCase() === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query
    const [rewards, total] = await Promise.all([
      Reward.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Reward.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json(formatResponse({
      data: {
        rewards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: totalPages
        }
      },
      message: 'Rewards retrieved successfully'
    }));
  } catch (error) {
    console.error('Get rewards error:', { error: error.message, stack: error.stack });
    res.status(500).json(formatError('Failed to retrieve rewards', error.message));
  }
};

// Get single reward
exports.getReward = async (req, res) => {
  try {
    const reward = await Reward.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!reward) {
      return res.status(404).json(formatError('Reward not found'));
    }

    res.json(formatResponse({
      data: reward,
      message: 'Reward retrieved successfully'
    }));
  } catch (error) {
    console.error('Get reward error:', { error: error.message, stack: error.stack });
    res.status(500).json(formatError('Failed to retrieve reward', error.message));
  }
};

// Create reward
exports.createReward = async (req, res) => {
  try {
    console.info('Creating reward - Auth debug:', {
      user: req.user,
      organizationId: req.user?.organizationId,
      headers: req.headers,
      body: req.body
    });

    if (!req.user) {
      console.error('No user found in request');
      return res.status(401).json(formatError('User not authenticated'));
    }

    if (!req.user.organizationId) {
      console.error('No organizationId found in user:', req.user);
      return res.status(400).json(formatError('User has no organization ID'));
    }

    const reward = new Reward({
      ...req.body,
      organizationId: req.user.organizationId
    });

    console.info('Attempting to save reward:', {
      rewardData: reward.toObject(),
      organizationId: reward.organizationId
    });

    await reward.save();

    console.info('Reward saved successfully:', reward.toObject());

    res.status(201).json(formatResponse({
      data: reward,
      message: 'Reward created successfully'
    }));
  } catch (error) {
    console.error('Create reward error:', { error: error.message, stack: error.stack });
    res.status(500).json(formatError('Failed to create reward', error.message));
  }
};

// Redeem a reward - Uses transactionService for atomic, consistent operations
exports.redeemReward = async (req, res) => {
  try {
    // Defensive validation of required parameters
    if (!req.params?.id) {
      console.warn('[Rewards] Missing reward ID in redemption request');
      return res.status(400).json(formatError('Reward ID is required'));
    }

    if (!req.user?.organizationId) {
      console.warn('[Rewards] Missing organization context in redemption request', {
        user: req.user,
        headers: req.headers
      });
      return res.status(400).json(formatError('Organization context required'));
    }

    // Extract and validate membership ID
    const membershipId = req.body?.membershipId || req.user?.membershipId;
    if (!membershipId) {
      console.warn('[Rewards] No membership ID available for redemption', {
        requestBody: req.body,
        userMembershipId: req.user?.membershipId
      });
      return res.status(400).json(formatError('Membership ID required for redemption'));
    }

    // Diagnostic logging for incoming request context
    console.info('[Rewards] Processing redemption request', {
      rewardId: req.params.id,
      membershipId,
      organizationId: req.user.organizationId,
      userId: req.user._id,
      requestSource: req.body?.membershipId ? 'body' : 'user_context'
    });

    // Use the robust transactionService.redeemReward which handles:
    // - Atomic database transactions
    // - Proper balance validation using aggregated transactions
    // - Reward availability checks
    // - Concurrent redemption protection
    const result = await transactionService.redeemReward({
      memberId: membershipId,
      organizationId: req.user.organizationId,
      rewardId: req.params.id,
      performedBy: req.user._id,
      metadata: {
        ...req.body?.metadata,
        redemptionSource: 'reward_portal',
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      }
    });

    console.info('[Rewards] Redemption completed successfully', {
      rewardId: req.params.id,
      membershipId,
      organizationId: req.user.organizationId,
      pointsDeducted: result.transaction.amount,
      newBalance: result.balance,
      transactionId: result.transaction._id
    });

    // Return consistent response format
    res.json(formatResponse({
      data: {
        success: true,
        transaction: result.transaction,
        newBalance: result.balance,
        membershipId,
        rewardId: req.params.id
      },
      message: 'Reward redeemed successfully'
    }));

  } catch (error) {
    // Comprehensive error logging with context
    console.error('[Rewards] Redemption failed', {
      error: error.message,
      stack: error.stack,
      rewardId: req.params?.id,
      membershipId: req.body?.membershipId || req.user?.membershipId,
      organizationId: req.user?.organizationId,
      userId: req.user?._id,
      timestamp: new Date().toISOString()
    });

    // Return appropriate error status based on error type
    let statusCode = 500;
    if (error.message.includes('not found') || error.message.includes('Member not found')) {
      statusCode = 404;
    } else if (
      error.message.includes('Insufficient points') ||
      error.message.includes('not available') ||
      error.message.includes('out of stock') ||
      error.message.includes('expired')
    ) {
      statusCode = 400;
    }

    res.status(statusCode).json(formatError(
      error.message || 'Failed to redeem reward',
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    ));
  }
};

// Update reward
exports.updateReward = async (req, res) => {
  try {
    const reward = await Reward.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.user.organizationId
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!reward) {
      return res.status(404).json(formatError('Reward not found'));
    }

    res.json(formatResponse({
      data: reward,
      message: 'Reward updated successfully'
    }));
  } catch (error) {
    console.error('Update reward error:', { error: error.message, stack: error.stack });
    res.status(500).json(formatError('Failed to update reward', error.message));
  }
};

// Delete reward
exports.deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!reward) {
      return res.status(404).json(formatError('Reward not found'));
    }

    res.json(formatResponse({
      data: reward,
      message: 'Reward deleted successfully'
    }));
  } catch (error) {
    console.error('Delete reward error:', { error: error.message, stack: error.stack });
    res.status(500).json(formatError('Failed to delete reward', error.message));
  }
};

// Update reward quantity
exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;

    const reward = await Reward.findOneAndUpdate(
      {
        _id: req.params.id,
        organizationId: req.user.organizationId
      },
      { quantity },
      { new: true, runValidators: true }
    );

    if (!reward) {
      return res.status(404).json(formatError('Reward not found'));
    }

    res.json(formatResponse({
      data: reward,
      message: 'Reward quantity updated successfully'
    }));
  } catch (error) {
    console.error('Update reward quantity error:', { error: error.message, stack: error.stack });
    res.status(500).json(formatError('Failed to update reward quantity', error.message));
  }
};