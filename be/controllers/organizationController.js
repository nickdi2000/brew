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

    // Handle URLs separately from base64
    if (imageData.startsWith('http')) {
      // Validate URL format
      try {
        new URL(imageData);
      } catch (e) {
        console.error('Invalid image URL format:', e);
        return res.status(400).json(formatError('Invalid image URL format'));
      }
    } else {
      // Validate base64 image
      if (!imageData.startsWith('data:image/')) {
        console.error('Invalid image format: Image data must start with data:image/');
        return res.status(400).json(formatError('Invalid image format. Must be base64 image data or URL'));
      }

      // Extract mime type and validate
      const mimeType = imageData.split(';')[0].split(':')[1];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(mimeType)) {
        console.error(`Invalid image type: ${mimeType}. Allowed types:`, allowedTypes);
        return res.status(400).json(formatError(`Invalid image type. Allowed types: ${allowedTypes.join(', ')}`));
      }

      // Check base64 size (5MB limit)
      const base64Data = imageData.split(',')[1];
      const sizeInBytes = Buffer.from(base64Data, 'base64').length;
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (sizeInBytes > maxSize) {
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        console.error(`Image too large: ${sizeInMB}MB. Max size: 5MB`);
        return res.status(400).json(formatError(`Image too large (${sizeInMB}MB). Maximum size is 5MB`));
      }
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
    console.error('Error uploading banner image:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json(formatError('Invalid image data', error.errors));
    }
    
    // Handle specific error types
    switch(error.name) {
      case 'URIError':
        return res.status(400).json(formatError('Invalid image URL format'));
      case 'RangeError':
        return res.status(400).json(formatError('Image data too large or malformed'));
      default:
        return res.status(500).json(formatError('Error uploading banner image', error.message));
    }
  }
};
