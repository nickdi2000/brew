const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true
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

organizationSchema.index({ code: 1 }, { unique: true });

//on creation a random 5 digit alpha string is generated
organizationSchema.pre('save', function(next) {
  this.code = Math.random().toString(36).substring(2, 15);
  next();
});


// Update the updatedAt timestamp before saving
organizationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
