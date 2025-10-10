const Organization = require('../models/Organization');
const Member = require('../models/Member');
const transactionService = require('../services/transactionService');
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

    // Verify the organization exists
    const Organization = require('../models/Organization');
    const organization = await Organization.findById(user.organization._id || user.organization);
    if (!organization) {
      console.error('❌ Organization not found for user:', user._id, 'org ID:', user.organization._id || user.organization);
      return res.status(404).json(formatError('Organization not found. Please contact support.'));
    }

    console.log('✅ Organization verified:', organization.name, 'ID:', organization._id);

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

    // Extract organization ID properly (handle both object and string cases)
    let organizationId;
    if (typeof user.organization === 'string') {
      organizationId = user.organization;
    } else if (user.organization?._id) {
      // Handle case where _id might be an ObjectId object
      organizationId = String(user.organization._id);
    } else {
      console.error('[getMembers] Cannot extract organization ID from:', user.organization);
      return res.status(400).json(formatError('Invalid organization context'));
    }
    
    // Get transaction-based point balances for all members for consistency
    const memberBalances = await Promise.all(
      members.map(member => 
        transactionService.getBalance(member._id, organizationId)
          .catch(err => {
            console.warn('Failed to get balance for member', {
              memberId: member._id,
              organizationId,
              error: err.message
            });
            return 0; // Fallback to 0 if balance calculation fails
          })
      )
    );

    const formattedMembers = members.map((member, index) => ({
      _id: member._id,
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.user?.email || '',
      status: member.status || 'inactive',
      membershipLevel: member.membershipLevel || 'bronze',
      points: memberBalances[index], // Use transaction-calculated balance
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

    // Extract organization ID properly (handle both object and string cases)
    console.log('[DEBUG] user.organization structure:', {
      organization: user.organization,
      type: typeof user.organization,
      hasId: !!user.organization?._id,
      id: user.organization?._id,
      isString: typeof user.organization === 'string'
    });
    
    // Robust organization ID extraction that handles ObjectId objects
    let organizationId;
    if (typeof user.organization === 'string') {
      organizationId = user.organization;
    } else if (user.organization?._id) {
      // Handle case where _id might be an ObjectId object
      organizationId = String(user.organization._id);
    } else {
      console.error('[DEBUG] Cannot extract organization ID from:', user.organization);
      return res.status(400).json(formatError('Invalid organization context'));
    }
    
    console.log('[DEBUG] extracted organizationId:', organizationId, 'type:', typeof organizationId);
    
    // Get transaction-based balance for consistency
    const currentBalance = await transactionService.getBalance(member._id, organizationId);

    return res.json(formatResponse({
      data: {
        _id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.user.email,
        status: member.status,
        membershipLevel: member.membershipLevel,
        points: currentBalance, // Use transaction-calculated balance
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

// Update member points - Uses transactionService for consistency and audit trail
exports.updateMemberPoints = async (req, res) => {
  try {
    const { id } = req.params;
    const { points, operation = 'add' } = req.body;
    const user = req.user;

    // Defensive validation
    if (!user?.organization) {
      console.warn('[Member] Missing organization context for points update', { user });
      return res.status(400).json(formatError('User must be associated with an organization'));
    }

    if (!id) {
      return res.status(400).json(formatError('Member ID is required'));
    }

    if (typeof points !== 'number' || points < 0) {
      return res.status(400).json(formatError('Points must be a positive number'));
    }

    if (!['add', 'subtract', 'set'].includes(operation)) {
      return res.status(400).json(formatError('Invalid operation. Must be: add, subtract, or set'));
    }

    // Verify member exists in organization
    const member = await Member.findOne({
      _id: id,
      organization: user.organization
    }).populate('user', 'email');

    if (!member) {
      console.warn('[Member] Member not found for points update', {
        memberId: id,
        organizationId: user.organization
      });
      return res.status(404).json(formatError('Member not found'));
    }

    // Extract organization ID properly (handle both object and string cases)
    let organizationId;
    if (typeof user.organization === 'string') {
      organizationId = user.organization;
    } else if (user.organization?._id) {
      // Handle case where _id might be an ObjectId object
      organizationId = String(user.organization._id);
    } else {
      console.error('[updateMemberPoints] Cannot extract organization ID from:', user.organization);
      return res.status(400).json(formatError('Invalid organization context'));
    }

    // Get current balance using transaction aggregation
    const currentBalance = await transactionService.getBalance(id, organizationId);
    
    let transactionAmount;
    let transactionType;
    
    if (operation === 'add') {
      transactionAmount = points;
      transactionType = 'adjust';
    } else if (operation === 'subtract') {
      transactionAmount = -points;
      transactionType = 'adjust';
      // Prevent negative balances
      if (currentBalance + transactionAmount < 0) {
        return res.status(400).json(formatError(
          `Insufficient points. Current balance: ${currentBalance}, attempted deduction: ${points}`
        ));
      }
    } else { // operation === 'set'
      transactionAmount = points - currentBalance;
      transactionType = 'adjust';
      // Prevent setting negative balances
      if (points < 0) {
        return res.status(400).json(formatError('Cannot set negative point balance'));
      }
    }

    // Only create transaction if there's actually a change
    if (transactionAmount === 0) {
      return res.json(formatResponse({
        data: {
          _id: member._id,
          points: currentBalance,
          message: 'No change required'
        },
        message: 'Member points unchanged'
      }));
    }

    console.info('[Member] Processing points update', {
      memberId: id,
      operation,
      points,
      currentBalance,
      transactionAmount,
      performedBy: user._id
    });

    // Create transaction for audit trail and consistency
    await transactionService.accruePoints({
      memberId: id,
      organizationId: organizationId,
      amount: transactionAmount,
      type: transactionType,
      method: 'manual',
      performedBy: user._id,
      metadata: {
        operation,
        requestedPoints: points,
        previousBalance: currentBalance,
        adminAction: true,
        timestamp: new Date().toISOString()
      }
    });

    // Get new balance after transaction
    const newBalance = await transactionService.getBalance(id, organizationId);

    console.info('[Member] Points updated successfully', {
      memberId: id,
      previousBalance: currentBalance,
      newBalance,
      transactionAmount,
      performedBy: user._id
    });

    return res.json(formatResponse({
      data: {
        _id: member._id,
        points: newBalance,
        previousPoints: currentBalance,
        change: transactionAmount
      },
      message: 'Member points updated successfully'
    }));

  } catch (error) {
    console.error('[Member] Error updating member points:', {
      error: error.message,
      stack: error.stack,
      memberId: req.params?.id,
      operation: req.body?.operation,
      points: req.body?.points,
      organizationId: req.user?.organization,
      performedBy: req.user?._id
    });
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
        points: await transactionService.getBalance(membership._id, organization._id),
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

// Get current user's membership for an organization by organization ID
exports.getMembershipByOrganization = async (req, res) => {
  try {
    const user = req.user;
    const { organizationId } = req.params;

    if (!user) {
      return res.status(401).json(formatError('Authentication required'));
    }

    if (!organizationId) {
      return res.status(400).json(formatError('Organization ID is required'));
    }

    // Verify organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json(formatError('Organization not found'));
    }

    // Find the user's membership in this organization
    const membership = await Member.findOne({ 
      user: user._id, 
      organization: organizationId 
    })
    .populate('user', 'email picture')
    .populate('organization', 'name code');

    if (!membership) {
      return res.status(404).json(formatError('Membership not found for this organization'));
    }

    const balance = await transactionService.getBalance(membership._id, organizationId);
    const { transactions: recentTransactions } = await transactionService.listTransactions(
      membership._id,
      organizationId,
      { limit: 10 }
    );

    return res.json(formatResponse({
      data: {
        _id: membership._id,
        organization: membership.organization,
        role: membership.role,
        status: membership.status,
        points: balance,
        user: {
          email: membership.user?.email,
          picture: membership.user?.picture
        },
        recentTransactions,
        createdAt: membership.createdAt,
        updatedAt: membership.updatedAt
      },
      message: 'Membership retrieved successfully'
    }));
  } catch (error) {
    console.error('Error fetching membership by organization:', error);
    return res.status(500).json(formatError('Error fetching membership by organization', error.message));
  }
};

