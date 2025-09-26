const Organization = require('../models/Organization');
const Member = require('../models/Member');
const { formatResponse, formatError } = require('../utils/responseFormatter');

// Get all members for the organization
exports.getMembers = async (req, res) => {
  try {
    console.log('📋 getMembers called with:', {
      query: req.query,
      user: req.user?._id,
      organization: req.user?.organization
    });

    const { page = 1, limit = 10, search = '', status = '', membershipLevel = '', sort = 'lastName', order = 'asc' } = req.query;
    const user = req.user;

    if (!user?.organization) {
      return res.status(400).json(formatError('User must be associated with an organization'));
    }

    // Build query
    const query = { organization: user.organization };
    if (status) query.status = status;
    if (membershipLevel) query.membershipLevel = membershipLevel;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

    // Execute query with pagination
    const [members, total] = await Promise.all([
      Member.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'email'),
      Member.countDocuments(query)
    ]);

    const formattedMembers = members.map(member => ({
      _id: member._id,
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.user?.email || '',
      status: member.status || 'inactive',
      membershipLevel: member.membershipLevel || 'bronze',
      points: member.points || 0,
      lastVisit: member.lastVisit || null
    }));

    return res.json(formatResponse({
      data: {
        members: formattedMembers,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Members retrieved successfully'
    }));
  } catch (error) {
    console.error('Error fetching members:', error);
    return res.status(500).json(formatError('Error fetching members', error.message));
  }
};

// Get a specific member
exports.getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user?.organization) {
      return res.status(400).json(formatError('User must be associated with an organization'));
    }

    const member = await Member.findOne({ _id: id, organization: user.organization }).populate('user', 'email');
    if (!member) {
      return res.status(404).json(formatError('Member not found'));
    }

    return res.json(formatResponse({
      data: {
        _id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.user.email,
        status: member.status,
        membershipLevel: member.membershipLevel,
        points: member.points,
        lastVisit: member.lastVisit
      },
      message: 'Member retrieved successfully'
    }));
  } catch (error) {
    console.error('Error fetching member:', error);
    return res.status(500).json(formatError('Error fetching member', error.message));
  }
};

// Create a new member
exports.createMember = async (req, res) => {
  try {
    const { firstName, lastName, email, status = 'active', membershipLevel = 'bronze' } = req.body;
    const user = req.user;

    if (!user?.organization) {
      return res.status(400).json(formatError('User must be associated with an organization'));
    }

    // Create new member
    const member = new Member({
      firstName,
      lastName,
      organization: user.organization,
      status,
      membershipLevel,
      points: 0
    });

    await member.save();

    return res.status(201).json(formatResponse({
      data: {
        _id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        status: member.status,
        membershipLevel: member.membershipLevel,
        points: member.points
      },
      message: 'Member created successfully'
    }));
  } catch (error) {
    console.error('Error creating member:', error);
    return res.status(500).json(formatError('Error creating member', error.message));
  }
};

// Update a member
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, status, membershipLevel, points } = req.body;
    const user = req.user;

    if (!user?.organization) {
      return res.status(400).json(formatError('User must be associated with an organization'));
    }

    const member = await Member.findOneAndUpdate(
      { _id: id, organization: user.organization },
      { firstName, lastName, status, membershipLevel, points },
      { new: true }
    ).populate('user', 'email');

    if (!member) {
      return res.status(404).json(formatError('Member not found'));
    }

    return res.json(formatResponse({
      data: {
        _id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.user.email,
        status: member.status,
        membershipLevel: member.membershipLevel,
        points: member.points,
        lastVisit: member.lastVisit
      },
      message: 'Member updated successfully'
    }));
  } catch (error) {
    console.error('Error updating member:', error);
    return res.status(500).json(formatError('Error updating member', error.message));
  }
};

// Delete a member
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!user?.organization) {
      return res.status(400).json(formatError('User must be associated with an organization'));
    }

    const member = await Member.findOneAndDelete({ _id: id, organization: user.organization });
    if (!member) {
      return res.status(404).json(formatError('Member not found'));
    }

    return res.json(formatResponse({
      data: { _id: id },
      message: 'Member deleted successfully'
    }));
  } catch (error) {
    console.error('Error deleting member:', error);
    return res.status(500).json(formatError('Error deleting member', error.message));
  }
};

// Update member status
exports.updateMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (!user?.organization) {
      return res.status(400).json(formatError('User must be associated with an organization'));
    }

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json(formatError('Invalid status value'));
    }

    const member = await Member.findOneAndUpdate(
      { _id: id, organization: user.organization },
      { status },
      { new: true }
    ).populate('user', 'email');

    if (!member) {
      return res.status(404).json(formatError('Member not found'));
    }

    return res.json(formatResponse({
      data: {
        _id: member._id,
        status: member.status
      },
      message: 'Member status updated successfully'
    }));
  } catch (error) {
    console.error('Error updating member status:', error);
    return res.status(500).json(formatError('Error updating member status', error.message));
  }
};

// Update member points
exports.updateMemberPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points, operation = 'add' } = req.body;
    const user = req.user;

    if (!user?.organization) {
      return res.status(400).json(formatError('User must be associated with an organization'));
    }

    if (typeof points !== 'number' || points < 0) {
      return res.status(400).json(formatError('Points must be a positive number'));
    }

    if (!['add', 'subtract', 'set'].includes(operation)) {
      return res.status(400).json(formatError('Invalid operation'));
    }

    let updateQuery;
    if (operation === 'add') {
      updateQuery = { $inc: { points } };
    } else if (operation === 'subtract') {
      updateQuery = { $inc: { points: -points } };
    } else {
      updateQuery = { $set: { points } };
    }

    const member = await Member.findOneAndUpdate(
      { _id: id, organization: user.organization },
      updateQuery,
      { new: true }
    ).populate('user', 'email');

    if (!member) {
      return res.status(404).json(formatError('Member not found'));
    }

    // Ensure points don't go negative
    if (member.points < 0) {
      member.points = 0;
      await member.save();
    }

    return res.json(formatResponse({
      data: {
        _id: member._id,
        points: member.points
      },
      message: 'Member points updated successfully'
    }));
  } catch (error) {
    console.error('Error updating member points:', error);
    return res.status(500).json(formatError('Error updating member points', error.message));
  }
};

// Get current user's membership for an organization by its public code
exports.getMembershipByCode = async (req, res) => {
  try {
    const user = req.user; // May be null for public access
    const { code } = req.params;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json(formatError('Organization code is required'));
    }

    const codeRegex = new RegExp(`^${code.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const organization = await Organization.findOne({ code: codeRegex });
    if (!organization) {
      return res.status(404).json(formatError('Organization not found'));
    }

    // If no user is authenticated, return null (public access)
    if (!user) {
      return res.json(formatResponse({
        data: null,
        message: 'No authenticated user - public access'
      }));
    }

    const membership = await Member.findOne({ user: user._id, organization: organization._id })
      .populate('user', 'email picture');

    return res.json(formatResponse({
      data: membership ? {
        id: membership._id,
        organization: membership.organization,
        role: membership.role,
        status: membership.status,
        points: membership.points,
        user: {
          email: membership.user?.email,
          picture: membership.user?.picture
        }
      } : null,
      message: 'Membership lookup successful'
    }));
  } catch (error) {
    console.error('Error fetching membership by code:', error);
    return res.status(500).json(formatError('Error fetching membership by code', error.message));
  }
};

