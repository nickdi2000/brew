const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    comments: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      userAgent: {
        type: String,
      },
      ipAddress: {
        type: String,
      },
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', MessageSchema);

