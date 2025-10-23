/**
 * Diagnostic script to check if user exists in MongoDB
 * 
 * Usage:
 * 1. Get your Clerk user ID from browser console (while logged in):
 *    console.log(document.cookie) // Look for __session
 *    OR check the network tab when loading /api/user/profile
 * 
 * 2. Run this script:
 *    node diagnose-user.js YOUR_CLERK_USER_ID
 * 
 * Example:
 *    node diagnose-user.js user_2xxxxxxxxxxxxx
 */

import connectDB from './config/db.js';
import User from './models/User.js';

const userId = process.argv[2];

if (!userId) {
  console.error('❌ Please provide a user ID');
  console.log('Usage: node diagnose-user.js YOUR_CLERK_USER_ID');
  console.log('Example: node diagnose-user.js user_2xxxxxxxxxxxxx');
  process.exit(1);
}

async function diagnoseUser() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    console.log(`🔍 Searching for user: ${userId}\n`);
    const user = await User.findById(userId);

    if (!user) {
      console.log('❌ USER NOT FOUND IN DATABASE\n');
      console.log('This means the Clerk webhook has not created the user yet.\n');
      console.log('Possible reasons:');
      console.log('1. Clerk webhook is not configured');
      console.log('2. Clerk webhook failed to execute');
      console.log('3. Database connection issue during webhook');
      console.log('4. User ID is incorrect\n');
      
      console.log('To fix:');
      console.log('1. Check Clerk Dashboard → Webhooks for recent events');
      console.log('2. Verify webhook URL: https://your-domain.com/api/clerk');
      console.log('3. Check server logs for webhook errors');
      console.log('4. Manually create user (see PROFILE_CREATION_ERROR_FIX.md)\n');
      
      // List all users to help debug
      const allUsers = await User.find({}).select('_id name email').limit(10);
      console.log(`📋 Recent users in database (${allUsers.length} shown):`);
      allUsers.forEach(u => {
        console.log(`   - ${u._id} (${u.name}, ${u.email})`);
      });
      
    } else {
      console.log('✅ USER FOUND IN DATABASE\n');
      console.log('User Details:');
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username || '(not set)'}`);
      console.log(`   Location: ${user.location || '(not set)'}`);
      console.log(`   Field Size: ${user.fieldSize || '(not set)'}`);
      console.log(`   Crops Grown: ${user.cropsGrown?.length ? user.cropsGrown.join(', ') : '(not set)'}`);
      console.log(`   Climate: ${user.climate || '(not set)'}`);
      console.log(`   Profile Completed: ${user.profileCompleted || false}`);
      console.log(`   Created At: ${user.createdAt}`);
      console.log(`   Updated At: ${user.updatedAt}\n`);
      
      if (user.profileCompleted) {
        console.log('✅ Profile is already completed');
      } else {
        console.log('⚠️  Profile is not completed yet');
        console.log('   User should see the onboarding page');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

diagnoseUser();
