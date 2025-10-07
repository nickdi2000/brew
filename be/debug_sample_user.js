const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Organization = require('./models/Organization');  
const Member = require('./models/Member');
const Reward = require('./models/Reward');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const investigateSampleUser = async () => {
  try {
    console.log('🔍 Investigating sample@brewtokens.com...\n');
    
    // Find the sample user
    const user = await User.findOne({ email: 'sample@brewtokens.com' }).populate('organizations');
    if (!user) {
      console.log('❌ User sample@brewtokens.com not found');
      return;
    }
    
    console.log('👤 User Found:', {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      organizations: user.organizations?.map(org => ({
        id: org._id,
        name: org.name,
        code: org.code
      })) || [],
      organizationField: user.organization
    });
    
    // Get all organizations this user might be associated with
    const orgIds = [];
    if (user.organization) {
      orgIds.push(user.organization);
    }
    if (user.organizations && user.organizations.length > 0) {
      user.organizations.forEach(org => {
        orgIds.push(org._id);
      });
    }
    
    console.log('\n🏢 Organizations to check:', orgIds.map(id => id.toString()));
    
    // Check each organization
    for (const orgId of orgIds) {
      console.log(`\n📊 Checking organization ${orgId}:`);
      
      const org = await Organization.findById(orgId);
      if (!org) {
        console.log(`  ❌ Organization ${orgId} not found in database`);
        continue;
      }
      
      console.log(`  ✅ Organization: ${org.name} (${org.code})`);
      
      // Check members in this organization
      const memberCount = await Member.countDocuments({ organization: orgId });
      console.log(`  👥 Members: ${memberCount}`);
      
      if (memberCount > 0) {
        const sampleMembers = await Member.find({ organization: orgId }).limit(3).select('firstName lastName email points');
        console.log(`  Sample members:`, sampleMembers.map(m => ({
          name: `${m.firstName} ${m.lastName}`,
          email: m.email,
          points: m.points
        })));
      }
      
      // Check rewards in this organization
      const rewardCount = await Reward.countDocuments({ organizationId: orgId });
      console.log(`  🎁 Rewards: ${rewardCount}`);
      
      if (rewardCount > 0) {
        const sampleRewards = await Reward.find({ organizationId: orgId }).limit(3).select('name pointsCost isActive');
        console.log(`  Sample rewards:`, sampleRewards.map(r => ({
          name: r.name,
          cost: r.pointsCost,
          active: r.isActive
        })));
      }
    }
    
    console.log('\n🔍 Summary:');
    console.log(`User has ${orgIds.length} organization(s) associated`);
    
  } catch (error) {
    console.error('Error investigating user:', error);
  }
};

const run = async () => {
  await connectDB();
  await investigateSampleUser();
  mongoose.disconnect();
};

run();