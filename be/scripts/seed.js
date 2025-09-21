require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Organization.deleteMany({});
    console.log('Cleared existing data');

    // Create organization
    const organization = await Organization.create({
      name: 'BrewTokens Admin'
    });
    console.log('Created organization');

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'sample@brewtokens.com',
      password: 'Password123!',
      organization: organization._id,
      isAdmin: true
    });

    console.log('Created admin user');
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
