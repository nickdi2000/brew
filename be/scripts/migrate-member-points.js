/**
 * Migration script for cleaning up Member.points field
 * 
 * This script helps migrate from the dual point tracking system (Member.points + Transaction aggregation)
 * to a single source of truth using only transaction aggregation.
 * 
 * Usage:
 * - Run with --audit to check current inconsistencies
 * - Run with --sync to sync Member.points with transaction balances
 * - Run with --cleanup to remove Member.points field (destructive)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Member = require('../models/Member');
const Transaction = require('../models/Transaction');
const Organization = require('../models/Organization');

class MemberPointsMigrator {
  constructor() {
    this.stats = {
      totalMembers: 0,
      inconsistentMembers: 0,
      syncedMembers: 0,
      errors: 0,
      organizations: new Set()
    };
  }

  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URL);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }

  async calculateTransactionBalance(memberId, organizationId) {
    const [result] = await Transaction.aggregate([
      { 
        $match: { 
          member: new mongoose.Types.ObjectId(memberId), 
          organization: new mongoose.Types.ObjectId(organizationId) 
        } 
      },
      { $group: { _id: null, balance: { $sum: '$amount' } } }
    ]);
    
    return result?.balance || 0;
  }

  async auditMemberPoints() {
    console.log('🔍 Auditing member points consistency...\n');
    
    const members = await Member.find({}).populate('organization', 'name code');
    this.stats.totalMembers = members.length;
    
    const inconsistencies = [];
    
    for (const member of members) {
      try {
        if (!member.organization) {
          console.warn(`⚠️  Member ${member._id} has no organization`);
          continue;
        }

        this.stats.organizations.add(member.organization._id.toString());
        
        const transactionBalance = await this.calculateTransactionBalance(
          member._id, 
          member.organization._id
        );
        
        const memberPoints = member.points || 0;
        const difference = Math.abs(transactionBalance - memberPoints);
        
        if (difference > 0.01) { // Allow for minor floating point differences
          this.stats.inconsistentMembers++;
          inconsistencies.push({
            memberId: member._id,
            organizationName: member.organization.name,
            organizationCode: member.organization.code,
            memberPoints,
            transactionBalance,
            difference
          });
          
          console.log(`❌ Inconsistency found:`);
          console.log(`   Member ID: ${member._id}`);
          console.log(`   Organization: ${member.organization.name} (${member.organization.code})`);
          console.log(`   Member.points: ${memberPoints}`);
          console.log(`   Transaction balance: ${transactionBalance}`);
          console.log(`   Difference: ${difference}\n`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing member ${member._id}:`, error.message);
        this.stats.errors++;
      }
    }
    
    this.printAuditSummary(inconsistencies);
    return inconsistencies;
  }

  async syncMemberPoints() {
    console.log('🔄 Syncing Member.points with transaction balances...\n');
    
    const members = await Member.find({});
    let syncedCount = 0;
    
    for (const member of members) {
      try {
        if (!member.organization) {
          console.warn(`⚠️  Skipping member ${member._id} - no organization`);
          continue;
        }
        
        const transactionBalance = await this.calculateTransactionBalance(
          member._id, 
          member.organization
        );
        
        if (member.points !== transactionBalance) {
          console.log(`🔄 Syncing member ${member._id}: ${member.points} → ${transactionBalance}`);
          
          member.points = transactionBalance;
          await member.save();
          syncedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error syncing member ${member._id}:`, error.message);
        this.stats.errors++;
      }
    }
    
    console.log(`\n✅ Sync complete: ${syncedCount} members updated`);
    this.stats.syncedMembers = syncedCount;
  }

  async cleanupMemberPointsField() {
    console.log('🗑️  WARNING: This will permanently remove the Member.points field!');
    console.log('   Make sure you have backups and have thoroughly tested the transaction system.');
    
    // Add a safety check
    const confirm = process.env.CONFIRM_CLEANUP;
    if (confirm !== 'YES_REMOVE_MEMBER_POINTS') {
      console.log('❌ Cleanup aborted. Set CONFIRM_CLEANUP=YES_REMOVE_MEMBER_POINTS to proceed.');
      return;
    }
    
    // Remove the points field from all Member documents
    const result = await Member.updateMany(
      {},
      { $unset: { points: 1 } }
    );
    
    console.log(`✅ Removed points field from ${result.modifiedCount} member documents`);
    
    // TODO: Update the Member model schema to remove the points field
    console.log('📝 Remember to update the Member model schema to remove the points field definition');
  }

  printAuditSummary(inconsistencies) {
    console.log('📊 AUDIT SUMMARY');
    console.log('================');
    console.log(`Total members: ${this.stats.totalMembers}`);
    console.log(`Organizations: ${this.stats.organizations.size}`);
    console.log(`Inconsistent members: ${this.stats.inconsistentMembers}`);
    console.log(`Errors: ${this.stats.errors}`);
    
    if (inconsistencies.length > 0) {
      const totalDifference = inconsistencies.reduce((sum, item) => sum + Math.abs(item.difference), 0);
      const avgDifference = totalDifference / inconsistencies.length;
      
      console.log(`Total point differences: ${totalDifference.toFixed(2)}`);
      console.log(`Average difference: ${avgDifference.toFixed(2)}`);
      
      // Group by organization
      const orgStats = {};
      inconsistencies.forEach(item => {
        const org = item.organizationName;
        if (!orgStats[org]) {
          orgStats[org] = { count: 0, totalDiff: 0 };
        }
        orgStats[org].count++;
        orgStats[org].totalDiff += Math.abs(item.difference);
      });
      
      console.log('\nInconsistencies by organization:');
      Object.entries(orgStats).forEach(([org, stats]) => {
        console.log(`  ${org}: ${stats.count} members, ${stats.totalDiff.toFixed(2)} total difference`);
      });
    }
    
    console.log('\n📋 RECOMMENDED ACTIONS:');
    if (this.stats.inconsistentMembers === 0) {
      console.log('✅ No inconsistencies found. System is ready for Member.points field cleanup.');
    } else {
      console.log('❌ Inconsistencies found. Run with --sync to fix them before cleanup.');
    }
  }
}

async function main() {
  const migrator = new MemberPointsMigrator();
  await migrator.connect();
  
  try {
    const args = process.argv.slice(2);
    
    if (args.includes('--audit')) {
      await migrator.auditMemberPoints();
    } else if (args.includes('--sync')) {
      await migrator.syncMemberPoints();
    } else if (args.includes('--cleanup')) {
      await migrator.cleanupMemberPointsField();
    } else {
      console.log('Usage:');
      console.log('  node migrate-member-points.js --audit     # Check for inconsistencies');
      console.log('  node migrate-member-points.js --sync      # Sync Member.points with transactions');
      console.log('  node migrate-member-points.js --cleanup   # Remove Member.points field (destructive)');
      console.log('\nRecommended workflow:');
      console.log('  1. Run --audit to identify issues');
      console.log('  2. Run --sync to fix inconsistencies');
      console.log('  3. Test the system thoroughly');
      console.log('  4. Run --cleanup to remove the deprecated field');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrator.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = MemberPointsMigrator;