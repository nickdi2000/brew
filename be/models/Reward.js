const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  pointsCost: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['product', 'service', 'discount', 'experience'],
    required: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  base64Image: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  redemptionInstructions: {
    type: String,
    trim: true
  },
  termsAndConditions: {
    type: String,
    trim: true
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

// Virtual fields
rewardSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

rewardSchema.virtual('isOutOfStock').get(function() {
  if (this.quantity === null) return false;
  return this.quantity <= 0;
});

rewardSchema.virtual('isAvailable').get(function() {
  return this.isActive && !this.isExpired && !this.isOutOfStock;
});

// Update the updatedAt timestamp on save
rewardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Configure virtuals in JSON/Object output
rewardSchema.set('toJSON', { virtuals: true });
rewardSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Reward', rewardSchema);