const Member = require('../models/Member');
const Reward = require('../models/Reward');
const { formatResponse, formatError } = require('../utils/responseFormatter');

// Get admin overview stats for the current organization
exports.getOverview = async (req, res) => {
  try {
    const organizationId = req.user?.organization?._id || req.user?.organizationId || req.organizationId;
    if (!organizationId) {
      return res.status(400).json(formatError('Organization context is required'));
    }

    const [totalMembers, activeRewards] = await Promise.all([
      Member.countDocuments({ organization: organizationId }),
      Reward.countDocuments({ organizationId, isActive: true })
    ]);

    // Placeholders for future implementation
    const pointsIssued = 0;
    const redemptions = 0;

    return res.json(formatResponse({
      data: {
        totalMembers,
        activeRewards,
        pointsIssued,
        redemptions
      },
      message: 'Dashboard overview retrieved successfully'
    }));
  } catch (error) {
    return res.status(500).json(formatError('Failed to fetch dashboard overview', error.message));
  }
};


