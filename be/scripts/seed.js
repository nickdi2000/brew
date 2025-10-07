require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Member = require('../models/Member');

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

    // Create GORDON organization for demo/testing
    const gordonOrgUpdate = {
      $set: {
        name: 'Gordon\'s Brewery',
        description: 'A craft brewery with amazing rewards!',
        website: 'https://gordonsbrewery.example.com',
        email: 'info@gordonsbrewery.example.com',
        updatedAt: now
      },
      $setOnInsert: {
        code: 'GORDON',
        createdAt: now
      }
    };

    const gordonOrg = await Organization.findOneAndUpdate(
      { code: 'GORDON' },
      gordonOrgUpdate,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );
    console.log('Upserted Gordon organization');

    // Create demo membership for sample@brewtokens.com user in Gordon organization
    const demoUser = await User.findOne({ email: 'sample@brewtokens.com' });
    if (demoUser) {
      // Add Gordon organization to user's organizations if not already there
      if (!demoUser.organizations.includes(gordonOrg._id)) {
        demoUser.organizations.push(gordonOrg._id);
        await demoUser.save();
      }

      // Create or update membership
      const existingMembership = await Member.findOne({ 
        user: demoUser._id, 
        organization: gordonOrg._id 
      });

      if (!existingMembership) {
        await Member.create({
          user: demoUser._id,
          organization: gordonOrg._id,
          role: 'member',
          status: 'active',
          points: 100
        });
        console.log('Created demo membership for sample@brewtokens.com in Gordon organization');
      } else {
        console.log('Demo membership already exists for sample@brewtokens.com in Gordon organization');
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
