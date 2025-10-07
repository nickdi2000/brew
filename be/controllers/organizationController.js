const Organization = require('../models/Organization');
const OrganizationDetails = require('../models/OrganizationDetails');
const Member = require('../models/Member');
const Reward = require('../models/Reward');
const Transaction = require('../models/Transaction');
const QRCode = require('../models/QRCode');
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
    const organization = await Organization.findById(user.organization._id).lean();
    if (!organization) {
      return res.status(404).json(formatError('Organization not found'));
    }

    const organizationId = organization._id;

    const [totalMembers, activeRewards, pointsIssued, redemptions, awardQRCodes] = await Promise.all([
      Member.countDocuments({ organization: organizationId }).catch(() => 0),
      Reward.countDocuments({ organizationId, isActive: true }).catch(() => 0),
      Transaction.aggregate([
        { $match: { organization: organizationId, amount: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => (result[0]?.total) || 0).catch(() => 0),
      Transaction.aggregate([
        { $match: { organization: organizationId, amount: { $lt: 0 } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => Math.abs(result[0]?.total || 0)).catch(() => 0),
      QRCode.find({ organization: organizationId, isActive: true })
        .select('_id code name points isActive')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .catch(() => [])
    ]);

    const stats = [
      {
        id: 'totalMembers',
        label: 'Total Members',
        value: Number.isFinite(totalMembers) ? totalMembers : 0
      },
      {
        id: 'activeRewards',
        label: 'Active Rewards',
        value: Number.isFinite(activeRewards) ? activeRewards : 0
      },
      {
        id: 'pointsIssued',
        label: 'Points Issued',
        value: Number.isFinite(pointsIssued) ? pointsIssued : 0
      },
      {
        id: 'redemptions',
        label: 'Redemptions',
        value: Number.isFinite(redemptions) ? redemptions : 0
      }
    ];

    res.json(formatResponse({
      data: {
        ...organization,
        stats,
        awardQRCodes
      },
      message: 'Organization details retrieved successfully'
    }));
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json(formatError('Error fetching organization details', error.message));
  }
};

// Get details (1:1) for organization by code (public read)
exports.getOrganizationDetailsByCode = async (req, res) => {
  try {
    const { code } = req.params;
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json(formatError('Organization code is required'));
    }

    const codeRegex = new RegExp(`^${code.trim().replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, 'i');
    const organization = await Organization.findOne({ code: codeRegex }).select('_id code name');
    if (!organization) {
      return res.status(404).json(formatError('Organization not found'));
    }

    const details = await OrganizationDetails.findOne({ organization: organization._id }).lean();
    return res.json(formatResponse({
      data: details || null,
      message: 'Organization details retrieved successfully'
    }));
  } catch (error) {
    console.error('Error fetching organization details by code:', error);
    return res.status(500).json(formatError('Error fetching organization details by code', error.message));
  }
};

// Get details for authenticated user's organization
exports.getOrganizationDetails = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.organization) {
      return res.status(404).json(formatError('No organization associated with this user'));
    }

    const details = await OrganizationDetails.findOne({ organization: user.organization._id }).lean();
    return res.json(formatResponse({
      data: details || null,
      message: 'Organization details retrieved successfully'
    }));
  } catch (error) {
    console.error('Error fetching organization details:', error);
    return res.status(500).json(formatError('Error fetching organization details', error.message));
  }
};

// Upsert details for authenticated user's organization
exports.upsertOrganizationDetails = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.organization) {
      return res.status(404).json(formatError('No organization associated with this user'));
    }

    const payload = req.body || {};
    const organizationId = user.organization._id;

    const updated = await OrganizationDetails.findOneAndUpdate(
      { organization: organizationId },
      {
        $set: {
          organization: organizationId,
          marketing: payload.marketing,
          social: payload.social,
          contact: payload.contact,
          settings: payload.settings,
          // Accept both camelCase and snake_case inputs from clients
          invitationCode: payload.invitationCode || payload.invitation_code || null,
          utmSource: payload.utmSource || payload.utm_source || null,
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    return res.json(formatResponse({
      data: updated,
      message: 'Organization details saved successfully'
    }));
  } catch (error) {
    console.error('Error upserting organization details:', error);
    return res.status(500).json(formatError('Error saving organization details', error.message));
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

    // If code is being updated, check for duplicates first
    if (updates.code) {
      const trimmedCode = updates.code.trim().toUpperCase();
      const existingOrg = await Organization.findOne({ 
        code: trimmedCode,
        _id: { $ne: user.organization._id } // Exclude current organization
      });
      
      if (existingOrg) {
        return res.status(400).json(formatError(
          `Organization code "${trimmedCode}" is already taken. Please choose a different code.`
        ));
      }
      
      // Update the code to the trimmed uppercase version
      updates.code = trimmedCode;
    }

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
    
    // Handle MongoDB duplicate key error (in case it still occurs)
    if (error.code === 11000 && error.keyPattern?.code) {
      const duplicateValue = error.keyValue?.code;
      return res.status(400).json(formatError(
        `Organization code "${duplicateValue}" is already taken. Please choose a different code.`
      ));
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json(formatError('Invalid organization data', error.errors));
    }
    
    res.status(500).json(formatError('Error updating organization details', error.message));
  }
};

// Upload banner image
exports.uploadBannerImage = async (req, res) => {
  try {
    console.log('📸 Banner image upload started');
    console.log('Request user:', req.user ? { id: req.user._id, hasOrg: !!req.user.organization } : 'No user');
    console.log('Request body keys:', Object.keys(req.body));
    
    const user = req.user;
    
    if (!user) {
      console.error('❌ No user found in request');
      return res.status(401).json(formatError('Authentication required'));
    }

    if (!user.organization) {
      console.error('❌ No organization associated with user:', user._id);
      return res.status(404).json(formatError('No organization associated with this user'));
    }

    const { imageData } = req.body;
    if (!imageData) {
      console.error('❌ No imageData in request body');
      return res.status(400).json(formatError('No image data provided'));
    }

    console.log('Image data type:', typeof imageData);
    console.log('Image data starts with:', imageData.substring(0, 50));

    let validatedImageData = imageData;

    // Handle URLs separately from base64
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      console.log('🌐 Processing image URL');
      // Validate URL format
      try {
        new URL(imageData);
        console.log('✅ Valid URL format');
      } catch (e) {
        console.error('❌ Invalid image URL format:', e.message);
        return res.status(400).json(formatError('Invalid image URL format'));
      }
    } else if (imageData.startsWith('data:image/')) {
      console.log('📷 Processing base64 image data');
      
      try {
        // Extract mime type and validate
        const headerPart = imageData.split(',')[0]; // data:image/png;base64
        const dataPart = imageData.split(',')[1]; // actual base64 data
        
        if (!headerPart || !dataPart) {
          console.error('❌ Malformed base64 image data - missing header or data part');
          return res.status(400).json(formatError('Malformed base64 image data'));
        }
        
        const mimeType = headerPart.split(';')[0].split(':')[1];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!allowedTypes.includes(mimeType)) {
          console.error(`❌ Invalid image type: ${mimeType}. Allowed types:`, allowedTypes);
          return res.status(400).json(formatError(`Invalid image type. Allowed types: ${allowedTypes.join(', ')}`));
        }

        console.log(`✅ Valid image type: ${mimeType}`);

        // Check base64 size (10MB limit to match frontend)
        let sizeInBytes;
        try {
          sizeInBytes = Buffer.from(dataPart, 'base64').length;
        } catch (bufferError) {
          console.error('❌ Invalid base64 data:', bufferError.message);
          return res.status(400).json(formatError('Invalid base64 image data'));
        }
        
        const maxSize = 10 * 1024 * 1024; // 10MB to match frontend limit
        
        if (sizeInBytes > maxSize) {
          const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
          console.error(`❌ Image too large: ${sizeInMB}MB. Max size: 10MB`);
          return res.status(400).json(formatError(`Image too large (${sizeInMB}MB). Maximum size is 10MB`));
        }
        
        console.log(`✅ Image size valid: ${(sizeInBytes / (1024 * 1024)).toFixed(2)}MB`);
      } catch (processingError) {
        console.error('❌ Error processing base64 image:', processingError.message);
        return res.status(400).json(formatError('Error processing image data'));
      }
    } else {
      console.error('❌ Invalid image format: Must start with data:image/ or http(s)://');
      return res.status(400).json(formatError('Invalid image format. Must be base64 image data starting with "data:image/" or a valid HTTP URL'));
    }

    console.log('🔄 Updating organization banner image...');
    
    // Update only the banner image field
    let organization;
    try {
      organization = await Organization.findByIdAndUpdate(
        user.organization._id,
        { 
          $set: { 
            bannerImage: validatedImageData,
            updatedAt: new Date()
          } 
        },
        { new: true, runValidators: true }
      );
      
      if (!organization) {
        console.error('❌ Organization not found after update');
        return res.status(404).json(formatError('Organization not found'));
      }
      
      console.log('✅ Organization banner image updated successfully');
    } catch (updateError) {
      console.error('❌ Database update error:', {
        error: updateError.message,
        name: updateError.name,
        code: updateError.code
      });
      
      if (updateError.name === 'ValidationError') {
        const validationMessages = Object.values(updateError.errors).map(err => err.message);
        return res.status(400).json(formatError('Image validation failed: ' + validationMessages.join(', ')));
      }
      
      throw updateError; // Re-throw to be caught by outer catch
    }

    console.log('🎉 Banner image upload completed successfully');
    res.json(formatResponse({
      data: { bannerImage: organization.bannerImage },
      message: 'Banner image uploaded successfully'
    }));
    
  } catch (error) {
    console.error('💥 Unexpected error in uploadBannerImage:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Handle specific error types with more descriptive messages
    if (error.name === 'ValidationError') {
      const validationMessages = Object.values(error.errors || {}).map(err => err.message).join(', ');
      return res.status(400).json(formatError('Validation failed: ' + validationMessages));
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json(formatError('Invalid organization ID'));
    }
    
    switch(error.name) {
      case 'URIError':
        return res.status(400).json(formatError('Invalid image URL format'));
      case 'RangeError':
        return res.status(400).json(formatError('Image data too large or malformed'));
      case 'TypeError':
        return res.status(400).json(formatError('Invalid image data format'));
      default:
        return res.status(500).json(formatError('Internal server error while uploading banner image'));
    }
  }
};
