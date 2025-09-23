const Reward = require('../models/Reward');
const { formatResponse, formatError } = require('../utils/responseFormatter');

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
    console.error('Get rewards error:', error);
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
    console.error('Get reward error:', error);
    res.status(500).json(formatError('Failed to retrieve reward', error.message));
  }
};

// Create reward
exports.createReward = async (req, res) => {
  try {
    console.log('Creating reward - Auth debug:', {
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

    console.log('Attempting to save reward:', {
      rewardData: reward.toObject(),
      organizationId: reward.organizationId
    });

    await reward.save();

    console.log('Reward saved successfully:', reward.toObject());

    res.status(201).json(formatResponse({
      data: reward,
      message: 'Reward created successfully'
    }));
  } catch (error) {
    console.error('Create reward error:', error);
    res.status(500).json(formatError('Failed to create reward', error.message));
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
    console.error('Update reward error:', error);
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
    console.error('Delete reward error:', error);
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
    console.error('Update reward quantity error:', error);
    res.status(500).json(formatError('Failed to update reward quantity', error.message));
  }
};