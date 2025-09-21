const User = require('../models/User');
const { formatResponse, formatError } = require('../utils/responseFormatter');

// Get all members for an organization
exports.getOrganizationMembers = async (req, res) => {
  try {
    const organizationId = req.user.organization;
    const { status, membershipLevel, search, sort = 'lastName', order = 'asc', page = 1, limit = 10 } = req.query;

    // Build query
    const query = { organization: organizationId };
    if (status) query.status = status;
    if (membershipLevel) query.membershipLevel = membershipLevel;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const members = await User.find(query)
      .select('-password')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json(formatResponse({
      data: {
        members,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Members retrieved successfully'
    }));
  } catch (error) {
    res.status(500).json(formatError('Failed to fetch members', error.message));
  }
};

// Get member details
exports.getMemberDetails = async (req, res) => {
  try {
    const organizationId = req.user.organization;
    const member = await User.findOne({
      _id: req.params.id,
      organization: organizationId
    }).select('-password');

    if (!member) {
      return res.status(404).json(formatError('Member not found'));
    }

    res.json(formatResponse({
      data: member,
      message: 'Member details retrieved successfully'
    }));
  } catch (error) {
    res.status(500).json(formatError('Failed to fetch members', error.message));
  }
};

// Create new member
exports.createMember = async (req, res) => {
  try {
    const organizationId = req.user.organization;
    const memberData = {
      ...req.body,
      organization: organizationId,
      isAdmin: false // Ensure new members can't be admins
    };

    const member = new User(memberData);
    await member.save();

    // Remove password from response
    const memberResponse = member.toObject();
    delete memberResponse.password;

    res.status(201).json(formatResponse({
      data: memberResponse,
      message: 'Member created successfully'
    }));
  } catch (error) {
    res.status(400).json(formatError('Failed to create member', error.message));
  }
};

// Update member
exports.updateMember = async (req, res) => {
  try {
    const organizationId = req.user.organization;
    const updates = { ...req.body };
    
    // Prevent updating critical fields
    delete updates.organization;
    delete updates.isAdmin;
    delete updates.password; // Password updates should be handled separately

    const member = await User.findOneAndUpdate(
      { _id: req.params.id, organization: organizationId },
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!member) {
      return res.status(404).json(formatError('Member not found'));
    }

    res.json(formatResponse({
      data: member,
      message: 'Member details retrieved successfully'
    }));
  } catch (error) {
    res.status(400).json(formatError('Failed to create member', error.message));
  }
};

// Update member status
exports.updateMemberStatus = async (req, res) => {
  try {
    const organizationId = req.user.organization;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json(formatError('Invalid status'));
    }

    const member = await User.findOneAndUpdate(
      { _id: req.params.id, organization: organizationId },
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!member) {
      return res.status(404).json(formatError('Member not found'));
    }

    res.json(formatResponse({
      data: member,
      message: 'Member details retrieved successfully'
    }));
  } catch (error) {
    res.status(400).json(formatError('Failed to create member', error.message));
  }
};

// Update member points
exports.updateMemberPoints = async (req, res) => {
  try {
    const organizationId = req.user.organization;
    const { points, operation = 'add' } = req.body;

    if (typeof points !== 'number' || points < 0) {
      return res.status(400).json(formatError('Invalid points value'));
    }

    const updateOperation = operation === 'subtract' 
      ? { $inc: { points: -points } }
      : { $inc: { points: points } };

    const member = await User.findOneAndUpdate(
      { _id: req.params.id, organization: organizationId },
      updateOperation,
      { new: true, runValidators: true }
    ).select('-password');

    if (!member) {
      return res.status(404).json(formatError('Member not found'));
    }

    res.json(formatResponse({
      data: member,
      message: 'Member details retrieved successfully'
    }));
  } catch (error) {
    res.status(400).json(formatError('Failed to create member', error.message));
  }
};

// Delete member
exports.deleteMember = async (req, res) => {
  try {
    const organizationId = req.user.organization;
    const member = await User.findOneAndDelete({
      _id: req.params.id,
      organization: organizationId,
      isAdmin: false // Prevent deleting admin users
    });

    if (!member) {
      return res.status(404).json(formatError('Member not found'));
    }

    res.json(formatResponse({
      data: null,
      message: 'Member deleted successfully'
    }));
  } catch (error) {
    res.status(500).json(formatError('Failed to fetch members', error.message));
  }
};
