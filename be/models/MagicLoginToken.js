const mongoose = require('mongoose');

const magicLoginTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: undefined,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    lastUsedIp: {
      type: String,
      default: null,
    },
    lastUsedUserAgent: {
      type: String,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    ttlSeconds: {
      type: Number,
      default: null,
    },
    disabledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

magicLoginTokenSchema.index({ user: 1 });
magicLoginTokenSchema.index({ disabledAt: 1 });

module.exports = mongoose.model('MagicLoginToken', magicLoginTokenSchema);

