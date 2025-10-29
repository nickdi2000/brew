const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false,
    default: null
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    default: 'Points QR Code'
  },
  points: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: ''
  },
  printed: {
    type: Boolean,
    default: false
  },
  qrContent: {
    type: String,
    default: ''
  },
  expiresAt: {
    type: Date,
    default: null
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

function computeDefaultContent(doc) {
  const points = Number.isFinite(doc.points) ? doc.points : 0;
  if (doc.organization) {
    return `POINTS:${points}:${doc.code}`;
  }
  return doc.code;
}

qrCodeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (!this.qrContent) {
    this.qrContent = computeDefaultContent(this);
  }
  next();
});

qrCodeSchema.virtual('value').get(function() {
  return this.qrContent || computeDefaultContent(this);
});

qrCodeSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    if (!ret.qrContent) {
      ret.qrContent = computeDefaultContent(ret);
    }
    if (ret.value === undefined) {
      ret.value = ret.qrContent;
    }
    return ret;
  }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);


