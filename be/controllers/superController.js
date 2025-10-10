const Organization = require('../models/Organization');
const User = require('../models/User');
const { formatResponse, formatError } = require('../utils/responseFormatter');

const sanitizeOrganization = (organization, user) => {
  return {
    id: organization._id,
    name: organization.name,
    code: organization.code,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
    firstAdmin: user
      ? {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt
        }
      : null
  };
};

exports.getOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({})
      .sort({ createdAt: -1 })
      .lean();

    if (!organizations || organizations.length === 0) {
      return res.json(
        formatResponse({
          data: [],
          message: 'No organizations found'
        })
      );
    }

    const organizationIds = organizations.map((org) => org._id);

    const users = await User.aggregate([
      { $match: { isAdmin: true, organizations: { $in: organizationIds } } },
      { $unwind: '$organizations' },
      { $match: { organizations: { $in: organizationIds } } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: '$organizations',
          user: { $first: '$$ROOT' }
        }
      }
    ]);

    const userMap = users.reduce((acc, item) => {
      acc[item._id.toString()] = item.user;
      return acc;
    }, {});

    const payload = organizations.map((organization) => {
      const user = userMap[organization._id.toString()] || null;
      return sanitizeOrganization(organization, user);
    });

    return res.json(
      formatResponse({
        data: payload,
        message: 'Organizations retrieved successfully'
      })
    );
  } catch (error) {
    console.error('Error fetching organizations for super admin:', error);
    return res.status(500).json(
      formatError('Failed to fetch organizations for super admin', error.message)
    );
  }
};

