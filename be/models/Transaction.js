const mongoose = require('mongoose');

// Transaction model captures all point movements for a member in an organization.
// Positive amounts add points (earn/accrual), negative amounts subtract points (redemption/adjustment).
// type: 'earn' | 'redeem' | 'adjust' provides semantic meaning for activity feeds and reporting.
const transactionSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
    index: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  // Positive to add points, negative to deduct points
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: (v) => typeof v === 'number' && Number.isFinite(v) && v !== 0,
      message: 'Amount must be a non-zero finite number'
    }
  },
  // Categorization of the transaction
  type: {
    type: String,
    enum: ['earn', 'redeem', 'adjust'],
    required: true
  },
  // Method of how the transaction occurred
  method: {
    type: String,
    enum: ['manual', 'qr_scan', 'redemption', 'system', 'promotion'],
    required: true
  },
  // Optional linkage to a reward for redemptions
  reward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    default: null
  },
  // Optional user who performed/recorded the transaction (e.g., staff admin)
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Free-form metadata for audit and details
  metadata: {
    type: Object,
    default: {}
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

transactionSchema.index({ member: 1, organization: 1, createdAt: -1 });

transactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);


