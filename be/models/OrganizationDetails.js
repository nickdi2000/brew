const mongoose = require('mongoose');

// One-to-one details for an Organization. Intentionally separate so it's not returned
// with normal Organization queries unless explicitly requested.
const organizationDetailsSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    unique: true
  },
  // Flexible container for marketing/extended metadata. Keep schema permissive.
  marketing: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  social: {
    website: { type: String, default: null },
    instagram: { type: String, default: null },
    facebook: { type: String, default: null },
    twitter: { type: String, default: null },
    tiktok: { type: String, default: null }
  },
  contact: {
    phone: { type: String, default: null },
    addressLine1: { type: String, default: null },
    addressLine2: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    postalCode: { type: String, default: null },
    country: { type: String, default: null }
  },
  settings: {
    theme: { type: String, default: 'light' },
    primaryColor: { type: String, default: '#0ea5e9' }
  },
  // Marketing attribution and invitation metadata
  invitationCode: { type: String, default: null },
  utmSource: { type: String, default: null },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

organizationDetailsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('OrganizationDetails', organizationDetailsSchema);


