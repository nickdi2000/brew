const Organization = require('../models/Organization');
const User = require('../models/User');
const QRCode = require('../models/QRCode');
const { formatResponse, formatError } = require('../utils/responseFormatter');
const generateCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();
const { sendAdminWelcomeEmail } = require('../services/postmarkService');

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

const sanitizeQRCode = (doc) => ({
  _id: String(doc._id),
  id: String(doc._id),
  organizationId: doc.organization ? String(doc.organization) : null,
  code: doc.code,
  name: doc.name,
  points: doc.points,
  isActive: doc.isActive,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  expiresAt: doc.expiresAt,
  printed: doc.printed,
  type: doc.type,
  qrContent: doc.qrContent,
  value: doc.qrContent || doc.code,
  organization: doc.organization ? String(doc.organization) : null
});

exports.getUnassignedQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find({ organization: null }).sort({ createdAt: -1 }).lean();
    return res.json(
      formatResponse({
        data: qrCodes.map(sanitizeQRCode),
        message: 'Unassigned QR codes retrieved successfully'
      })
    );
  } catch (error) {
    console.error('Error fetching unassigned QR codes:', error);
    return res.status(500).json(formatError('Failed to fetch unassigned QR codes', error.message));
  }
};

exports.createUnassignedQRCode = async (req, res) => {
  try {
    const {
      points = 0,
      expiresAt = null,
      isActive = true,
      name,
      printed = false,
      type = '',
      qrContent,
      code
    } = req.body || {};

    const payload = {
      organization: null,
      code: code || generateCode(),
      points,
      expiresAt,
      isActive,
      printed,
      type,
      qrContent,
      name: name || `${points} Points QR Code`
    };

    const doc = await QRCode.create(payload);
    return res.json(formatResponse({ data: sanitizeQRCode(doc.toObject()), message: 'Unassigned QR code created' }));
  } catch (error) {
    console.error('Error creating unassigned QR code:', error);
    const message = error?.code === 11000
      ? 'QR code already exists with this code value'
      : 'Failed to create unassigned QR code';
    return res.status(500).json(formatError(message, error.message));
  }
};

exports.updateUnassignedQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      points,
      expiresAt,
      isActive,
      name,
      printed,
      type,
      qrContent,
      code,
      organization
    } = req.body || {};

    const updateFields = {};
    if (points !== undefined) updateFields.points = points;
    if (expiresAt !== undefined) updateFields.expiresAt = expiresAt;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (name !== undefined) updateFields.name = name;
    if (printed !== undefined) updateFields.printed = printed;
    if (type !== undefined) updateFields.type = type;
    if (qrContent !== undefined) updateFields.qrContent = qrContent;
    if (code !== undefined) updateFields.code = code;
    if (organization !== undefined) updateFields.organization = organization || null;

    const match = {
      _id: id,
    };

    if (organization === undefined) {
      match.organization = null;
    }

    const doc = await QRCode.findOneAndUpdate(
      match,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!doc) {
      return res.status(404).json(formatError('Unassigned QR code not found'));
    }

    return res.json(formatResponse({ data: sanitizeQRCode(doc.toObject()), message: 'Unassigned QR code updated' }));
  } catch (error) {
    console.error('Error updating unassigned QR code:', error);
    const message = error?.code === 11000
      ? 'QR code already exists with this code value'
      : 'Failed to update unassigned QR code';
    return res.status(500).json(formatError(message, error.message));
  }
};

exports.deleteUnassignedQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await QRCode.findOneAndDelete({ _id: id, organization: null });

    if (!doc) {
      return res.status(404).json(formatError('Unassigned QR code not found'));
    }

    return res.json(formatResponse({ data: { id }, message: 'Unassigned QR code deleted' }));
  } catch (error) {
    console.error('Error deleting unassigned QR code:', error);
    return res.status(500).json(formatError('Failed to delete unassigned QR code', error.message));
  }
};

exports.getOrganizationDetails = async (req, res) => {
  try {
    const { organizationId } = req.params;

    if (!organizationId) {
      return res.status(400).json(formatError('Organization ID is required'));
    }

    const organization = await Organization.findById(organizationId).lean();

    if (!organization) {
      return res.status(404).json(formatError('Organization not found'));
    }

    // Import models needed for stats
    const Member = require('../models/Member');
    const Reward = require('../models/Reward');
    const Transaction = require('../models/Transaction');

    // Get statistics for the organization
    const [
      totalMembers,
      activeMembers,
      totalRewards,
      activeRewards,
      totalQRCodes,
      activeQRCodes,
      pointsIssued,
      pointsRedeemed,
      totalTransactions
    ] = await Promise.all([
      Member.countDocuments({ organization: organizationId }).catch(() => 0),
      Member.countDocuments({ organization: organizationId, status: 'active' }).catch(() => 0),
      Reward.countDocuments({ organizationId }).catch(() => 0),
      Reward.countDocuments({ organizationId, isActive: true }).catch(() => 0),
      QRCode.countDocuments({ organization: organizationId }).catch(() => 0),
      QRCode.countDocuments({ organization: organizationId, isActive: true }).catch(() => 0),
      Transaction.aggregate([
        { $match: { organization: organizationId, amount: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => (result[0]?.total) || 0).catch(() => 0),
      Transaction.aggregate([
        { $match: { organization: organizationId, amount: { $lt: 0 } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => Math.abs(result[0]?.total || 0)).catch(() => 0),
      Transaction.countDocuments({ organization: organizationId }).catch(() => 0)
    ]);

    // Get admin users for the organization
    const User = require('../models/User');
    const admins = await User.find({ 
      isAdmin: true, 
      organizations: organizationId 
    })
      .select('_id email firstName lastName createdAt')
      .sort({ createdAt: 1 })
      .lean()
      .catch(() => []);

    const stats = {
      members: {
        total: Number.isFinite(totalMembers) ? totalMembers : 0,
        active: Number.isFinite(activeMembers) ? activeMembers : 0
      },
      rewards: {
        total: Number.isFinite(totalRewards) ? totalRewards : 0,
        active: Number.isFinite(activeRewards) ? activeRewards : 0
      },
      qrCodes: {
        total: Number.isFinite(totalQRCodes) ? totalQRCodes : 0,
        active: Number.isFinite(activeQRCodes) ? activeQRCodes : 0
      },
      points: {
        issued: Number.isFinite(pointsIssued) ? pointsIssued : 0,
        redeemed: Number.isFinite(pointsRedeemed) ? pointsRedeemed : 0
      },
      transactions: {
        total: Number.isFinite(totalTransactions) ? totalTransactions : 0
      }
    };

    return res.json(
      formatResponse({
        data: {
          organization,
          stats,
          admins
        },
        message: 'Organization details retrieved successfully'
      })
    );
  } catch (error) {
    console.error('Error fetching organization details for super admin:', error);
    return res.status(500).json(
      formatError('Failed to fetch organization details', error.message)
    );
  }
};

exports.sendWelcomeEmail = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { adminEmail, adminFirstName, adminLastName } = req.body || {};

    if (!organizationId) {
      return res.status(400).json(formatError('Organization ID is required to send welcome email'));
    }

    if (!adminEmail) {
      return res.status(400).json(formatError('Admin email is required to send welcome email'));
    }

    const organization = await Organization.findById(organizationId).lean();

    if (!organization) {
      return res.status(404).json(formatError('Organization not found'));
    }

    const { success, skipped, error } = await sendAdminWelcomeEmail({
      toEmail: adminEmail,
      organizationName: organization.name,
      adminFirstName,
      adminLastName,
      loginEmail: adminEmail,
    });

    if (skipped) {
      return res.json(
        formatResponse({
          data: { skipped: true },
          message: 'Postmark not configured. Email not sent.'
        })
      );
    }

    if (!success) {
      const responseError = error?.message || 'Failed to send welcome email';
      return res.status(500).json(formatError(responseError));
    }

    return res.json(
      formatResponse({
        data: {
          organizationId: organization._id,
          adminEmail
        },
        message: 'Welcome email sent successfully'
      })
    );
  } catch (error) {
    console.error('Failed to send welcome email via super admin:', error);
    return res.status(500).json(
      formatError('Failed to send welcome email', error.message)
    );
  }
};

