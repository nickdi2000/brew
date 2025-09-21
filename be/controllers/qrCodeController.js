const QRCode = require('../models/QRCode');
const { formatResponse, formatError } = require('../utils/responseFormatter');

// Generate a simple unique code
const generateCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

exports.list = async (req, res) => {
  try {
    const orgId = req.user.organization._id;
    const items = await QRCode.find({ organization: orgId }).sort({ createdAt: -1 });
    res.json(formatResponse({ data: items, message: 'QR codes fetched' }));
  } catch (e) {
    res.status(500).json(formatError('Failed to fetch QR codes', e.message));
  }
};

exports.create = async (req, res) => {
  try {
    const orgId = req.user.organization._id;
    const { points = 0, expiresAt = null, isActive = true } = req.body;
    const code = generateCode();
    const doc = await QRCode.create({ organization: orgId, code, points, expiresAt, isActive });
    res.json(formatResponse({ data: doc, message: 'QR code created' }));
  } catch (e) {
    res.status(500).json(formatError('Failed to create QR code', e.message));
  }
};

exports.update = async (req, res) => {
  try {
    const orgId = req.user.organization._id;
    const { id } = req.params;
    const { points, expiresAt, isActive } = req.body;
    const doc = await QRCode.findOneAndUpdate(
      { _id: id, organization: orgId },
      { $set: { points, expiresAt, isActive } },
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


