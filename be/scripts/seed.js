require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    const now = new Date();

    // Upsert organization using code as unique identifier
    const organizationUpdate = {
      $set: {
        name: 'BrewTokens Admin',
        description: 'The official BrewTokens rewards program',
        website: 'https://brewtokens.com',
        email: 'support@brewtokens.com',
        updatedAt: now
      },
      $setOnInsert: {
        code: 'brewtokens',
        createdAt: now
      }
    };

    const organization = await Organization.findOneAndUpdate(
      { code: 'brewtokens' },
      organizationUpdate,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );
    console.log('Upserted organization');

    // Upsert admin user
    let admin = await User.findOne({ email: 'sample@brewtokens.com' }).populate('organizations');

    if (!admin) {
      admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'sample@brewtokens.com',
        password: 'Password123!',
        organizations: [organization._id],
        isAdmin: true
      });
      console.log('Created admin user');
    } else {
      admin.firstName = 'Admin';
      admin.lastName = 'User';
      admin.password = 'Password123!';
      admin.isAdmin = true;
      admin.updatedAt = now;

      if (!Array.isArray(admin.organizations)) {
        admin.organizations = [];
      }

      const orgIdString = String(organization._id);
      const uniqueOrgIds = new Map();

      // Maintain other organizations but ensure uniqueness
      admin.organizations.forEach(orgId => {
        uniqueOrgIds.set(String(orgId), orgId);
      });

      uniqueOrgIds.set(orgIdString, organization._id);

      // Place the seeded organization first, followed by the rest
      admin.organizations = [organization._id, ...Array.from(uniqueOrgIds.values())
        .filter(orgId => String(orgId) !== orgIdString)];

      console.log('Updated admin user');
    }

    await admin.save();

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
