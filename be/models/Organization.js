const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  bannerImage: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Check if it's a URL or base64 image
        return !v || v.startsWith('http') || v.startsWith('https') || v.startsWith('data:image/');
      },
      message: props => `${props.value} is not a valid image URL or base64 string!`
    }
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
  defaultAwardQrCode: {
    type: String,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true
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

// Optional 1:1 virtual to fetch details on-demand (not included unless populated)
organizationSchema.virtual('details', {
  ref: 'OrganizationDetails',
  localField: '_id',
  foreignField: 'organization',
  justOne: true
});

// Helper function to generate a unique 6-character alphanumeric code
const generateOrganizationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Pre-save hook to generate code and update timestamp
organizationSchema.pre('save', async function(next) {
  try {
    // Generate random code on creation (if not already set)
    if (this.isNew && !this.code) {
      let code;
      let attempts = 0;
      const maxAttempts = 10;
      const Organization = this.constructor;
      
      console.log('Generating organization code...');
      
      // Try to generate a unique code (with retry logic for collisions)
      do {
        code = generateOrganizationCode();
        attempts++;
        
        console.log(`Attempt ${attempts}: Generated code ${code}`);
        
        // Check if this code already exists
        const existingOrg = await Organization.findOne({ code }).exec();
        if (!existingOrg) {
          console.log(`Code ${code} is unique, assigning to organization`);
          this.code = code;
          break;
        }
        
        console.log(`Code ${code} already exists, trying again...`);
        
        if (attempts >= maxAttempts) {
          throw new Error('Failed to generate unique organization code after multiple attempts');
        }
      } while (attempts < maxAttempts);
    }
    
    // Update the updatedAt timestamp
    this.updatedAt = new Date();
    console.log('Organization pre-save complete, code:', this.code);
    next();
  } catch (error) {
    console.error('Organization pre-save error:', error);
    next(error);
  }
});

module.exports = mongoose.model('Organization', organizationSchema);
