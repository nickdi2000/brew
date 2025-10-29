const QRCode = require('../models/QRCode');
const Organization = require('../models/Organization');
const { formatResponse, formatError } = require('../utils/responseFormatter');

// Generate a simple unique code
const generateCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

exports.list = async (req, res) => {
  try {
    const orgId = req.user?.organization?._id || req.organizationId;
    const items = orgId ? await QRCode.find({ organization: orgId }).sort({ createdAt: -1 }) : [];
    // Include organization info to help FE initialize
    let organization = req.user?.organizations?.find?.(o => String(o._id) === String(orgId)) || null;
    if (!organization && orgId) {
      organization = await Organization.findById(orgId).lean().exec();
    }
    res.json(formatResponse({ data: { items, organization }, message: 'QR codes fetched' }));
  } catch (e) {
    res.status(500).json(formatError('Failed to fetch QR codes', e.message));
  }
};

exports.create = async (req, res) => {
  try {
    const orgId = req.user?.organization?._id;
    if (!orgId) {
      return res.status(400).json(formatError('Organization context is required to create QR codes'));
    }

    const {
      points = 0,
      expiresAt = null,
      isActive = true,
      name,
      printed = false,
      type = '',
      qrContent
    } = req.body;
    const code = generateCode();
    const doc = await QRCode.create({ 
      organization: orgId, 
      code, 
      points, 
      expiresAt, 
      isActive,
      printed,
      type,
      qrContent,
      name: name || `${points} Points QR Code` // Use points value in default name
    });
    res.json(formatResponse({ data: doc, message: 'QR code created' }));
  } catch (e) {
    res.status(500).json(formatError('Failed to create QR code', e.message));
  }
};

exports.update = async (req, res) => {
  try {
    const orgId = req.user.organization._id;
    const { id } = req.params;
    const { points, expiresAt, isActive, code } = req.body;
    
    // Build update object - only include fields that are provided
    const updateFields = {};
    if (points !== undefined) updateFields.points = points;
    if (expiresAt !== undefined) updateFields.expiresAt = expiresAt;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (code !== undefined) updateFields.code = code;
    
    const doc = await QRCode.findOneAndUpdate(
      { _id: id, organization: orgId },
      { $set: updateFields },
      { new: true }
    );
    
    if (!doc) return res.status(404).json(formatError('QR code not found'));
    res.json(formatResponse({ data: doc, message: 'QR code updated' }));
  } catch (e) {
    res.status(500).json(formatError('Failed to update QR code', e.message));
  }
};

exports.remove = async (req, res) => {
  try {
    const orgId = req.user.organization._id;
    const { id } = req.params;
    const doc = await QRCode.findOneAndDelete({ _id: id, organization: orgId });
    if (!doc) return res.status(404).json(formatError('QR code not found'));
    res.json(formatResponse({ data: { id }, message: 'QR code deleted' }));
  } catch (e) {
    res.status(500).json(formatError('Failed to delete QR code', e.message));
  }
};

exports.redeem = async (req, res) => {
  try {
    console.log('Redeem request body:', req.body);
    const { id } = req.params;
    const { memberId, organizationCode, code } = req.body;

    // Validate required fields
    if (!memberId || !organizationCode || !code) {
      return res.status(400).json(formatError('Member ID, organization code, and QR code are required'));
    }

    // Import Organization model
    const Organization = require('../models/Organization');

    // Find organization by code (case-insensitive)
    const codeRegex = new RegExp(`^${organizationCode.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const organization = await Organization.findOne({ code: codeRegex });
    if (!organization) {
      return res.status(404).json(formatError('Organization not found'));
    }

    // Find the QR code
    const qrCode = await QRCode.findById(id);
    if (!qrCode) {
      return res.status(404).json(formatError('QR code not found'));
    }

    // Verify the QR code belongs to the organization
    if (String(qrCode.organization) !== String(organization._id)) {
      return res.status(403).json(formatError('QR code does not belong to this organization'));
    }

    // Verify the code matches
    if (qrCode.code !== code) {
      return res.status(400).json(formatError('Invalid QR code'));
    }

    // Check if QR code is active
    if (!qrCode.isActive) {
      return res.status(400).json(formatError('QR code is not active'));
    }

    // Check if QR code has expired
    if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
      return res.status(400).json(formatError('QR code has expired'));
    }

    // Import Transaction and Member models
    const Transaction = require('../models/Transaction');
    const Member = require('../models/Member');

    // Verify member exists and belongs to the organization
    const member = await Member.findOne({ 
      _id: memberId, 
      organization: organization._id 
    });
    if (!member) {
      return res.status(404).json(formatError('Member not found or does not belong to this organization'));
    }

    // Create transaction record
    const transaction = await Transaction.create({
      member: memberId,
      organization: organization._id,
      amount: qrCode.points,
      type: 'earn',
      method: 'qr_scan',
      metadata: {
        qrCodeId: qrCode._id,
        qrCodeName: qrCode.name,
        description: qrCode.name ? `QR code scan: ${qrCode.name}` : `Scanned ${qrCode.points} points QR code`
      }
    });

    // Update member's total points
    const updatedMember = await Member.findByIdAndUpdate(
      memberId,
      { $inc: { points: qrCode.points } },
      { new: true }
    );

    res.json(formatResponse({
      data: {
        transaction,
        points: qrCode.points,
        qrCode: qrCode.name,
        memberPoints: updatedMember.points
      },
      message: `Successfully awarded ${qrCode.points} points`
    }));

  } catch (e) {
    res.status(500).json(formatError('Failed to redeem QR code', e.message));
  }
};

exports.lookup = async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return res.status(400).json(formatError('QR code is required'));
    }
    
    const trimmedCode = code.trim().toUpperCase();
    console.log('Looking up QR code:', trimmedCode);
    
    // Find the QR code
    const qrCode = await QRCode.findOne({ code: trimmedCode });
    if (!qrCode) {
      return res.status(404).json(formatError('QR code not found'));
    }
    
    // Check if QR code is active
    if (!qrCode.isActive) {
      return res.status(400).json(formatError('QR code is not active'));
    }
    
    // Check if QR code has expired
    if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
      return res.status(400).json(formatError('QR code has expired'));
    }
    
    // Get organization information
    const organization = await Organization.findById(qrCode.organization);
    if (!organization) {
      return res.status(404).json(formatError('Organization not found'));
    }
    
    console.log('QR code lookup successful:', {
      qrCodeId: qrCode._id,
      organizationId: organization._id,
      organizationCode: organization.code,
      organizationName: organization.name
    });
    
    res.json(formatResponse({
      data: {
        qrCode: {
          _id: qrCode._id,
          code: qrCode.code,
          name: qrCode.name,
          points: qrCode.points,
          isActive: qrCode.isActive,
          expiresAt: qrCode.expiresAt
        },
        organization: {
          _id: organization._id,
          code: organization.code,
          name: organization.name,
          description: organization.description,
          bannerImage: organization.bannerImage
        }
      },
      message: 'QR code found successfully'
    }));
    
  } catch (e) {
    console.error('QR code lookup error:', e);
    res.status(500).json(formatError('Failed to lookup QR code', e.message));
  }
};
