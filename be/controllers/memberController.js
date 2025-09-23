const Organization = require('../models/Organization');
const Member = require('../models/Member');
const { formatResponse, formatError } = require('../utils/responseFormatter');

// Get current user's membership for an organization by its public code
exports.getMembershipByCode = async (req, res) => {
  try {
    const user = req.user;
    const { code } = req.params;

    if (!user) {
      return res.status(401).json(formatError('Not authenticated'));
    }

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json(formatError('Organization code is required'));
    }

    const codeRegex = new RegExp(`^${code.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const organization = await Organization.findOne({ code: codeRegex });
    if (!organization) {
      return res.status(404).json(formatError('Organization not found'));
    }

    const membership = await Member.findOne({ user: user._id, organization: organization._id });

    return res.json(formatResponse({
      data: membership ? {
        id: membership._id,
        organization: membership.organization,
        role: membership.role,
        status: membership.status,
        points: membership.points
      } : null,
      message: 'Membership lookup successful'
    }));
  } catch (error) {
    console.error('Error fetching membership by code:', error);
    return res.status(500).json(formatError('Error fetching membership by code', error.message));
  }
};


