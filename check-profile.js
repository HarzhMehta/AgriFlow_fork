/**
 * Quick check script to see your current profile status
 * 
 * Usage:
 * 1. Make sure you're logged in to the app
 * 2. In browser console, run: console.log(document.cookie)
 * 3. Find your user ID or just run this after getting it from /api/user/profile
 * 
 * OR just check in MongoDB directly
 */

import connectDB from './config/db.js';
import User from './models/User.js';

const userId = process.argv[2];

if (!userId) {
  console.error('❌ Please provide a user ID');
  console.log('Usage: node check-profile.js YOUR_CLERK_USER_ID');
  process.exit(1);
}

async function checkProfile() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected\n');

    console.log(`🔍 Looking up user: ${userId}\n`);
    const user = await User.findById(userId);

    if (!user) {
      console.log('❌ USER NOT FOUND\n');
      process.exit(1);
    }

    console.log('✅ USER FOUND\n');
    console.log('📋 User Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email || '❌ MISSING'}`);
    console.log(`   Name: ${user.name || '❌ MISSING'}`);
    console.log(`   Username: ${user.username || '❌ NOT SET'}`);
    console.log(`   Location: ${user.location || '❌ NOT SET'}`);
    console.log(`   Field Size: ${user.fieldSize || '❌ NOT SET'}`);
    console.log(`   Crops Grown: ${user.cropsGrown?.length ? user.cropsGrown.join(', ') : '❌ NOT SET'}`);
    console.log(`   Climate: ${user.climate || '❌ NOT SET'}`);
    console.log(`   Profile Completed Flag: ${user.profileCompleted || false}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check if profile is actually complete
    const checks = {
      'Email': Boolean(user.email),
      'Name': Boolean(user.name),
      'Username': Boolean(user.username),
      'Location': Boolean(user.location),
      'Field Size': Boolean(user.fieldSize),
      'Crops (at least 1)': user.cropsGrown?.length > 0,
      'Climate': Boolean(user.climate),
      'Profile Completed Flag': user.profileCompleted === true
    };

    console.log('🔍 Profile Completeness Check:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    Object.entries(checks).forEach(([field, isComplete]) => {
      console.log(`   ${isComplete ? '✅' : '❌'} ${field}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const allComplete = Object.values(checks).every(v => v === true);
    
    if (allComplete) {
      console.log('🎉 PROFILE IS COMPLETE!');
      console.log('   User should be able to access chatbot without being redirected to onboarding.\n');
    } else {
      console.log('⚠️  PROFILE IS INCOMPLETE!');
      console.log('   User will be redirected to onboarding page to fill missing information.\n');
      
      console.log('Missing fields:');
      Object.entries(checks).forEach(([field, isComplete]) => {
        if (!isComplete) {
          console.log(`   • ${field}`);
        }
      });
      console.log();
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkProfile();
