const Reward = require('../models/Reward');
const Transaction = require('../models/Transaction');
const Member = require('../models/Member');
const { formatResponse, formatError } = require('../utils/responseFormatter');
const logger = require('../utils/logger');

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
    logger.error('Get rewards error:', { error: error.message, stack: error.stack });
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
    logger.error('Get reward error:', { error: error.message, stack: error.stack });
    res.status(500).json(formatError('Failed to retrieve reward', error.message));
  }
};

// Create reward
exports.createReward = async (req, res) => {
  try {
    logger.info('Creating reward - Auth debug:', {
      user: req.user,
      organizationId: req.user?.organizationId,
      headers: req.headers,
      body: req.body
    });

    if (!req.user) {
      logger.error('No user found in request');
      return res.status(401).json(formatError('User not authenticated'));
    }

    if (!req.user.organizationId) {
      logger.error('No organizationId found in user:', req.user);
      return res.status(400).json(formatError('User has no organization ID'));
    }

    const reward = new Reward({
      ...req.body,
      organizationId: req.user.organizationId
    });

    logger.info('Attempting to save reward:', {
      rewardData: reward.toObject(),
      organizationId: reward.organizationId
    });

    await reward.save();

    logger.info('Reward saved successfully:', reward.toObject());

    res.status(201).json(formatResponse({
      data: reward,
      message: 'Reward created successfully'
    }));
  } catch (error) {
    logger.error('Create reward error:', { error: error.message, stack: error.stack });
    res.status(500).json(formatError('Failed to create reward', error.message));
  }
};

// Redeem a reward
exports.redeemReward = async (req, res) => {
  try {
    // Diagnostic logging for incoming request context
    logger.info('[Rewards] Redeem request received', {
      path: req.originalUrl,
      method: req.method,
      params: req.params,
      query: req.query,
      headers: {
        'x-organization-id': req.headers['x-organization-id'] || null,
        'x-membership-id': req.headers['x-membership-id'] || null,
        authorization: req.headers.authorization ? 'present' : 'absent'
      },
      resolvedUser: req.user
        ? {
            userId: req.user._id || null,
            organizationId: req.user.organizationId || null,
            membershipId: req.user.membershipId || null
          }
        : null
    });
    // Get the reward and verify it exists
    const reward = await Reward.findOne({
      _id: req.params.id,
      organizationId: req.user.organizationId
    });

    if (!reward) {
      logger.warn('[Rewards] Reward not found for redemption', {
        rewardId: req.params.id,
        organizationId: req.user.organizationId
      });
      return res.status(404).json(formatError('Reward not found'));
    }

    // Verify reward is available
    if (!reward.isAvailable) {
      logger.warn('[Rewards] Reward not available', {
        rewardId: reward._id,
        isActive: reward.isActive,
        isExpired: reward.isExpired,
        isOutOfStock: reward.isOutOfStock
      });
      return res.status(400).json(formatError('Reward is not available'));
    }

    // Check quantity if applicable
    if (reward.quantity !== null && reward.quantity <= 0) {
      logger.warn('[Rewards] Reward out of stock', {
        rewardId: reward._id,
        quantity: reward.quantity
      });
      return res.status(400).json(formatError('Reward is out of stock'));
    }

    // Check expiration if applicable
    if (reward.expiresAt && new Date(reward.expiresAt) < new Date()) {
      logger.warn('[Rewards] Reward expired', {
        rewardId: reward._id,
        expiresAt: reward.expiresAt
      });
      return res.status(400).json(formatError('Reward has expired'));
    }

    // Get current member points
    const membershipId = req.body.membershipId || req.user.membershipId;
    const membership = await Member.findOne({
      _id: membershipId,
      organization: req.user.organizationId
    });

    if (!membership) {
      logger.warn('[Rewards] Membership not found for redemption', {
        membershipId,
        organizationId: req.user.organizationId,
        requestBody: req.body
      });
      return res.status(404).json(formatError('Membership not found'));
    }

    // Check if member has enough points
    if (membership.points < reward.pointsCost) {
      logger.warn('[Rewards] Insufficient points for redemption', {
        membershipId: membership._id,
        memberPoints: membership.points,
        pointsRequired: reward.pointsCost
      });
      return res.status(400).json(formatError('Insufficient points'));
    }

    // Create transaction record
    const transaction = new Transaction({
      member: membershipId, // Use the same membership ID we validated above
      organization: req.user.organizationId,
      type: 'redeem',
      method: 'redemption',
      amount: -reward.pointsCost,
      reward: reward._id,
      metadata: {
        rewardName: reward.name,
        pointsCost: reward.pointsCost,
        memberId: membershipId // Add for audit trail
      }
    });

    // Update member points
    membership.points -= reward.pointsCost;

    // Update reward quantity if applicable
    if (reward.quantity !== null) {
      reward.quantity -= 1;
    }

    // Save all changes
    await Promise.all([
      transaction.save(),
      membership.save(),
      reward.quantity !== null ? reward.save() : Promise.resolve()
    ]);

    logger.info('[Rewards] Redemption completed', {
      rewardId: reward._id,
      membershipId: membership._id,
      organizationId: req.user.organizationId,
      pointsDeducted: reward.pointsCost,
      newMemberPoints: membership.points,
      newRewardQuantity: reward.quantity
    });

    res.json(formatResponse({
      success: true,
      message: 'Reward redeemed successfully'
    }));
  } catch (error) {
    logger.error('Redeem reward error:', { error: error.message, stack: error.stack });
    res.status(500).json(formatError('Failed to redeem reward', error.message));
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
    logger.error('Update reward error:', { error: error.message, stack: error.stack });
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
    logger.error('Delete reward error:', { error: error.message, stack: error.stack });
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
    logger.error('Update reward quantity error:', { error: error.message, stack: error.stack });
    res.status(500).json(formatError('Failed to update reward quantity', error.message));
  }
};