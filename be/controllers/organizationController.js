const Organization = require('../models/Organization');
const User = require('../models/User');
const { formatResponse, formatError } = require('../utils/responseFormatter');

// Get organization by public code (public endpoint)
exports.getOrganizationByCode = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json(formatError('Organization code is required'));
    }

    // Case-insensitive exact match
    const codeRegex = new RegExp(`^${code.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const organization = await Organization.findOne({ code: codeRegex });

    if (!organization) {
      return res.status(404).json(formatError('Organization not found'));
    }

    return res.json(formatResponse({
      data: organization,
      message: 'Organization retrieved successfully'
    }));
  } catch (error) {
    console.error('Error fetching organization by code:', error);
    return res.status(500).json(formatError('Error fetching organization by code', error.message));
  }
};

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

    // Get full organization details
    const organization = await Organization.findById(user.organization._id);
    if (!organization) {
      return res.status(404).json(formatError('Organization not found'));
    }

    res.json(formatResponse({
      data: organization,
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
      code: req.body.code,
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

// Upload banner image
exports.uploadBannerImage = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user || !user.organization) {
      return res.status(404).json(formatError('No organization associated with this user'));
    }

    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json(formatError('No image data provided'));
    }

    // Validate image data format
    if (!imageData.startsWith('data:image/') && !imageData.startsWith('http')) {
      return res.status(400).json(formatError('Invalid image format. Must be base64 image data or URL'));
    }

    // Update only the banner image field
    const organization = await Organization.findByIdAndUpdate(
      user.organization._id,
      { $set: { bannerImage: imageData } },
      { new: true, runValidators: true }
    );

    res.json(formatResponse({
      data: { bannerImage: organization.bannerImage },
      message: 'Banner image uploaded successfully'
    }));
  } catch (error) {
    console.error('Error uploading banner image:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json(formatError('Invalid image data', error.errors));
    }
    res.status(500).json(formatError('Error uploading banner image', error.message));
  }
};
