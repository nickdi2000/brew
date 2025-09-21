const Organization = require('../models/Organization');
const User = require('../models/User');
const { formatResponse, formatError } = require('../utils/responseFormatter');

// Get organization for authenticated user
exports.getOrganization = async (req, res) => {
  try {
    // User is already populated from auth middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    if (!user.organization) {
      return res.status(404).json(formatError('No organization associated with this user'));
    }

    res.json(formatResponse({
      data: user.organization,
      message: 'Organization details retrieved successfully'
    }));
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json(formatError('Error fetching organization details', error.message));
  }
};

// Update organization
exports.updateOrganization = async (req, res) => {
  try {
    // User is already populated from auth middleware
    const user = req.user;
    
    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    if (!user.organization) {
      return res.status(404).json(formatError('No organization associated with this user'));
    }

    // Update organization fields
    const updates = {
      name: req.body.name,
      description: req.body.description,
      website: req.body.website,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      updatedAt: new Date()
    };

    // Only update fields that are provided
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const organization = await Organization.findByIdAndUpdate(
      user.organization._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(formatResponse({
      data: organization,
      message: 'Organization updated successfully'
    }));
  } catch (error) {
    console.error('Error updating organization:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json(formatError('Invalid organization data', error.errors));
    }
    res.status(500).json(formatError('Error updating organization details', error.message));
  }
};
