const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    unique: true
  },
  venueName: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    match: /^[a-z0-9-]+$/
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  subtitle: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    zip: { type: String, trim: true, default: '' }
  },
  hours: {
    type: String,
    trim: true,
    default: ''
  },
  features: [{
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true, default: '' }
  }],
  announcements: [{
    title: { type: String, trim: true },
    message: { type: String, trim: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  }],
  socialLinks: {
    facebook: { type: String, trim: true, default: '' },
    instagram: { type: String, trim: true, default: '' },
    twitter: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' }
  },
  hero: {
    type: { type: String, enum: ['preset', 'custom'], default: 'preset' },
    value: { type: String, default: 'hero-standard.png' }
  },
  theme: {
    primaryColor: { type: String, default: '#F59E0B' },
    secondaryColor: { type: String, default: '#1F2937' },
    accentColor: { type: String, default: '#EF4444' }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
websiteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Website', websiteSchema);

