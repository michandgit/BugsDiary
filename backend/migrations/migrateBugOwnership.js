#!/usr/bin/env node

/**
 * Bug Ownership Migration Script
 *
 * This script migrates existing bugs with null userId values to the first user
 * (admin user) in the database to establish proper user-bug ownership.
 *
 * Usage:
 *   node migrations/migrateBugOwnership.js [--dry-run]
 *
 * Options:
 *   --dry-run    Preview changes without applying them
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Bug = require('../models/Bug');
const User = require('../models/User');
const { connectDB } = require('../config/database');

const isDryRun = process.argv.includes('--dry-run');

async function migrateBugOwnership() {
  console.log('🔧 Starting Bug Ownership Migration...');
  console.log(`📋 Mode: ${isDryRun ? 'DRY RUN (no changes will be made)' : 'LIVE MIGRATION'}`);

  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');

    // Step 1: Count orphaned bugs
    console.log('\n📊 Analyzing existing data...');
    const orphanedBugsCount = await Bug.countDocuments({
      $or: [
        { userId: null },
        { userId: { $exists: false } },
        { userId: '' }
      ]
    });

    console.log(`📦 Found ${orphanedBugsCount} orphaned bugs`);

    if (orphanedBugsCount === 0) {
      console.log('✅ No orphaned bugs found. Migration not needed.');
      process.exit(0);
    }

    // Step 2: Find admin user (first user created)
    console.log('\n👤 Finding admin user...');
    const adminUser = await User.findOne().sort({ createdAt: 1 });

    if (!adminUser) {
      console.error('❌ ERROR: No users found in database!');
      console.log('💡 Please create at least one user account before running migration.');
      process.exit(1);
    }

    console.log(`👑 Admin user found: ${adminUser.name} (${adminUser.email})`);
    console.log(`🆔 Admin userId: ${adminUser.userId}`);

    // Step 3: Get sample of orphaned bugs for preview
    const sampleOrphanedBugs = await Bug.find({
      $or: [
        { userId: null },
        { userId: { $exists: false } },
        { userId: '' }
      ]
    }).limit(5).select('id title createdAt userId');

    console.log('\n📋 Sample orphaned bugs that will be migrated:');
    sampleOrphanedBugs.forEach(bug => {
      console.log(`  - ${bug.title} (ID: ${bug.id}, Created: ${bug.createdAt})`);
    });

    if (isDryRun) {
      console.log('\n🔍 DRY RUN COMPLETED');
      console.log(`📊 Summary: ${orphanedBugsCount} bugs would be assigned to admin user`);
      console.log(`👤 Target admin: ${adminUser.name} (${adminUser.userId})`);
      console.log('💡 Run without --dry-run to apply changes');
      process.exit(0);
    }

    // Step 4: Perform migration (if not dry run)
    console.log('\n🔄 Starting migration...');

    const migrationResult = await Bug.updateMany(
      {
        $or: [
          { userId: null },
          { userId: { $exists: false } },
          { userId: '' }
        ]
      },
      {
        $set: {
          userId: adminUser.userId,
          updatedAt: new Date()
        }
      }
    );

    console.log(`✅ Migration completed successfully!`);
    console.log(`📊 Updated ${migrationResult.modifiedCount} bugs`);
    console.log(`👤 All orphaned bugs now belong to: ${adminUser.name}`);

    // Step 5: Verification
    console.log('\n🔍 Verifying migration...');
    const remainingOrphanedBugs = await Bug.countDocuments({
      $or: [
        { userId: null },
        { userId: { $exists: false } },
        { userId: '' }
      ]
    });

    if (remainingOrphanedBugs === 0) {
      console.log('✅ Verification passed: No orphaned bugs remaining');
    } else {
      console.warn(`⚠️  Warning: ${remainingOrphanedBugs} bugs still have null userId`);
    }

    // Step 6: Generate migration report
    const totalBugsCount = await Bug.countDocuments();
    const adminBugsCount = await Bug.countDocuments({ userId: adminUser.userId });

    console.log('\n📊 Migration Report:');
    console.log(`  Total bugs in database: ${totalBugsCount}`);
    console.log(`  Bugs owned by admin: ${adminBugsCount}`);
    console.log(`  Migration timestamp: ${new Date().toISOString()}`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔧 Full error:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n📪 Database connection closed');
  }
}

// Run migration
if (require.main === module) {
  migrateBugOwnership()
    .then(() => {
      console.log('🎉 Migration process completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { migrateBugOwnership };