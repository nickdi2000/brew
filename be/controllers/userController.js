const User = require('../models/User');
const { formatResponse, formatError } = require('../utils/responseFormatter');
const axios = require('axios');
const { issueMagicLinkForEmail } = require('../services/magicLoginService');

// Proxy profile pictures to avoid CORS issues
exports.getProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user and get picture URL
    const user = await User.findById(userId);
    if (!user || !user.picture) {
      return res.status(404).json(formatError('Profile picture not found'));
    }

    // Fetch the image from Google
    const response = await axios.get(user.picture, {
      responseType: 'stream'
    });

    // Set appropriate headers
    res.setHeader('Content-Type', response.headers['content-type']);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Pipe the image stream to our response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    res.status(500).json(formatError('Error fetching profile picture'));
  }
};

// Get all admin users for an organization
exports.getOrganizationAdmins = async (req, res) => {
  try {
    const organizationId = req.user.organization._id || req.user.organization;

    // Find all admin users for this organization
    const admins = await User.find({
      organizations: organizationId,
      isAdmin: true
    }).select('-password -refreshToken').sort({ createdAt: 1 });

    res.json(formatResponse({
      data: admins,
      message: 'Admin users retrieved successfully'
    }));
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json(formatError('Failed to fetch admin users', error.message));
  }
};

// Create a new admin user
exports.createAdminUser = async (req, res) => {
  try {
    const organizationId = req.user.organization._id || req.user.organization;
    const { email, firstName, lastName, password, authMethod } = req.body;

    if (!email) {
      return res.status(400).json(formatError('Email is required'));
    }

    // Validate auth method
    const selectedAuthMethod = authMethod || 'magic-link';
    if (!['magic-link', 'set-password'].includes(selectedAuthMethod)) {
      return res.status(400).json(formatError('Invalid authentication method'));
    }

    // If password method is selected, ensure password is provided
    if (selectedAuthMethod === 'set-password' && !password) {
      return res.status(400).json(formatError('Password is required when using set-password method'));
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase().trim() });
    let isNewUser = false;

    if (user) {
      // Check if user is already part of this organization
      const isInOrg = user.organizations.some(org => 
        String(org._id || org) === String(organizationId)
      );

      if (isInOrg) {
        return res.status(400).json(formatError('User is already part of this organization'));
      }

      // Add organization to existing user
      user.organizations.push(organizationId);
      user.isAdmin = true;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      
      // Update password if provided
      if (selectedAuthMethod === 'set-password' && password) {
        user.password = password; // Will be hashed by the pre-save hook
      }
      
      await user.save();
    } else {
      // Create new user
      isNewUser = true;
      const userData = {
        email: email.toLowerCase().trim(),
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        organizations: [organizationId],
        isAdmin: true,
        status: 'active'
      };

      // Add password if provided
      if (selectedAuthMethod === 'set-password' && password) {
        userData.password = password; // Will be hashed by the pre-save hook
      }

      user = new User(userData);
      await user.save();
    }

    // Generate and send magic login link only if magic-link method is selected
    if (selectedAuthMethod === 'magic-link') {
      try {
        const { magicLoginUrl, emailResult } = await issueMagicLinkForEmail({
          email: user.email,
          requestIp: req.ip,
          userAgent: req.headers['user-agent']
        });
        console.log('Generated magic login link for new admin:', magicLoginUrl);
        if (emailResult) {
          console.log('Magic login email sent successfully:', emailResult);
        }
      } catch (emailError) {
        console.error('Error generating/sending magic login link:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log(`Admin user ${user.email} created with password authentication`);
    }

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.status(201).json(formatResponse({
      data: userResponse,
      message: 'Admin user created successfully'
    }));
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(400).json(formatError('Failed to create admin user', error.message));
  }
};

// Update an admin user
exports.updateAdminUser = async (req, res) => {
  try {
    const organizationId = req.user.organization._id || req.user.organization;
    const { id } = req.params;
    const { firstName, lastName } = req.body;

    // Prevent user from updating themselves through this endpoint
    if (String(req.user._id) === String(id)) {
      return res.status(400).json(formatError('Use the profile endpoint to update your own information'));
    }

    // Find the user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    // Check if user is part of this organization
    const isInOrg = user.organizations.some(org => 
      String(org._id || org) === String(organizationId)
    );

    if (!isInOrg) {
      return res.status(403).json(formatError('User is not part of your organization'));
    }

    // Update user fields
    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();

    await user.save();

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    res.json(formatResponse({
      data: userResponse,
      message: 'Admin user updated successfully'
    }));
  } catch (error) {
    console.error('Error updating admin user:', error);
    res.status(500).json(formatError('Failed to update admin user', error.message));
  }
};

// Delete an admin user
exports.deleteAdminUser = async (req, res) => {
  try {
    const organizationId = req.user.organization._id || req.user.organization;
    const { id } = req.params;

    // Prevent user from deleting themselves
    if (String(req.user._id) === String(id)) {
      return res.status(400).json(formatError('You cannot remove yourself'));
    }

    // Find the user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    // Check if user is part of this organization
    const isInOrg = user.organizations.some(org => 
      String(org._id || org) === String(organizationId)
    );

    if (!isInOrg) {
      return res.status(403).json(formatError('User is not part of your organization'));
    }

    // Remove organization from user's organizations array
    user.organizations = user.organizations.filter(org => 
      String(org._id || org) !== String(organizationId)
    );

    // If user has no more organizations, delete the user
    if (user.organizations.length === 0) {
      await User.findByIdAndDelete(id);
    } else {
      // Otherwise just update the organizations array
      await user.save();
    }

    res.json(formatResponse({
      data: null,
      message: 'Admin user removed successfully'
    }));
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json(formatError('Failed to remove admin user', error.message));
  }
};

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
