const Website = require('../models/Website');
const Organization = require('../models/Organization');
const { formatResponse, formatError } = require('../utils/responseFormatter');

// Helper function to generate a URL-friendly code from a name
const generateCode = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Get published website by website code (public endpoint)
exports.getPublicWebsite = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json(formatError('Website code is required'));
    }

    // Find website by code and populate organization with just the code field
    const website = await Website.findOne({ 
      code: code.toLowerCase(),
      isPublished: true // Only return published websites
    }).populate('organization', 'code name');

    if (!website) {
      return res.status(404).json(formatError('Website not found or not published'));
    }

    res.json(formatResponse({
      data: website,
      message: 'Website retrieved successfully'
    }));
  } catch (error) {
    console.error('Error fetching public website:', error);
    res.status(500).json(formatError('Failed to fetch website', error.message));
  }
};

// Get website for the current organization
exports.getWebsite = async (req, res) => {
  try {
    const organizationId = req.user.organization._id || req.user.organization;

    const website = await Website.findOne({ organization: organizationId });

    if (!website) {
      return res.json(formatResponse({
        data: null,
        message: 'No website found for this organization'
      }));
    }

    res.json(formatResponse({
      data: website,
      message: 'Website retrieved successfully'
    }));
  } catch (error) {
    console.error('Error fetching website:', error);
    res.status(500).json(formatError('Failed to fetch website', error.message));
  }
};

// Create website for the current organization
exports.createWebsite = async (req, res) => {
  try {
    const organizationId = req.user.organization._id || req.user.organization;
    const { venueName } = req.body;

    if (!venueName) {
      return res.status(400).json(formatError('Venue name is required'));
    }

    // Check if website already exists
    const existingWebsite = await Website.findOne({ organization: organizationId });
    if (existingWebsite) {
      return res.status(400).json(formatError('Website already exists for this organization'));
    }

    // Generate a unique code from venue name
    let code = generateCode(venueName);
    let counter = 1;
    
    // Ensure code is unique
    while (await Website.findOne({ code })) {
      code = `${generateCode(venueName)}-${counter}`;
      counter++;
    }

    // Create new website with default values
    const website = new Website({
      organization: organizationId,
      venueName: venueName.trim(),
      code,
      title: `Welcome to ${venueName}`,
      subtitle: 'Your favorite local spot for great food and drinks',
      description: 'We are passionate about serving you the best experience. Join our loyalty program to earn rewards with every visit!',
      contactEmail: req.user.email || '',
      phone: '(555) 123-4567',
      address: {
        street: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zip: '12345'
      },
      hours: 'Mon-Fri: 11am-10pm\nSat-Sun: 10am-11pm',
      features: [
        {
          title: 'Loyalty Rewards',
          description: 'Earn points with every visit and redeem for amazing rewards',
          icon: 'mdi:gift'
        },
        {
          title: 'Fresh Ingredients',
          description: 'We use only the finest locally-sourced ingredients',
          icon: 'mdi:leaf'
        },
        {
          title: 'Friendly Service',
          description: 'Our team is dedicated to making your experience memorable',
          icon: 'mdi:heart'
        }
      ],
      announcements: [
        {
          title: 'Welcome!',
          message: 'Join our loyalty program today and start earning rewards!',
          active: true
        }
      ]
    });

    await website.save();

    res.status(201).json(formatResponse({
      data: website,
      message: 'Website created successfully'
    }));
  } catch (error) {
    console.error('Error creating website:', error);
    res.status(400).json(formatError('Failed to create website', error.message));
  }
};

// Update website for the current organization
exports.updateWebsite = async (req, res) => {
  try {
    const organizationId = req.user.organization._id || req.user.organization;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.organization;
    delete updates.createdAt;

    // If code is being updated, validate and ensure uniqueness
    if (updates.code) {
      updates.code = generateCode(updates.code);
      
      // Check if code is already taken by another website
      const existingWebsite = await Website.findOne({ 
        code: updates.code,
        organization: { $ne: organizationId }
      });
      
      if (existingWebsite) {
        return res.status(400).json(formatError('This code is already taken. Please choose a different one.'));
      }
    }

    const website = await Website.findOneAndUpdate(
      { organization: organizationId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!website) {
      return res.status(404).json(formatError('Website not found'));
    }

    res.json(formatResponse({
      data: website,
      message: 'Website updated successfully'
    }));
  } catch (error) {
    console.error('Error updating website:', error);
    res.status(400).json(formatError('Failed to update website', error.message));
  }
};

// Delete website for the current organization
exports.deleteWebsite = async (req, res) => {
  try {
    const organizationId = req.user.organization._id || req.user.organization;

    const website = await Website.findOneAndDelete({ organization: organizationId });

    if (!website) {
      return res.status(404).json(formatError('Website not found'));
    }

    res.json(formatResponse({
      data: null,
      message: 'Website deleted successfully'
    }));
  } catch (error) {
    console.error('Error deleting website:', error);
    res.status(500).json(formatError('Failed to delete website', error.message));
  }
};

// Publish/unpublish website
exports.togglePublish = async (req, res) => {
  try {
    const organizationId = req.user.organization._id || req.user.organization;
    const { isPublished } = req.body;

    const website = await Website.findOneAndUpdate(
      { organization: organizationId },
      { $set: { isPublished: Boolean(isPublished) } },
      { new: true }
    );

    if (!website) {
      return res.status(404).json(formatError('Website not found'));
    }

    res.json(formatResponse({
      data: website,
      message: `Website ${isPublished ? 'published' : 'unpublished'} successfully`
    }));
  } catch (error) {
    console.error('Error toggling website publish status:', error);
    res.status(500).json(formatError('Failed to update publish status', error.message));
  }
};

