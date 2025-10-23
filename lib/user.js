import connectDB from "@/config/db";
import User from "@/models/User";

/**
 * Get user profile from database
 * @param {string} userId - Clerk user ID
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserProfile(userId) {
  if (!userId) return null;

  await connectDB();
  return await User.findById(userId);
}

/**
 * Build user context string for AI prompts
 * @param {Object} userProfile - User profile object
 * @returns {string} Formatted user context
 */
export function buildUserContext(userProfile) {
  if (!userProfile || !userProfile.profileCompleted) {
    return '';
  }

  return `\n\n[User Profile]
Farmer: ${userProfile.username || 'Unknown'}
Location: ${userProfile.location || 'Not specified'}
Field Size: ${userProfile.fieldSize || 'Not specified'}
Crops: ${userProfile.cropsGrown && userProfile.cropsGrown.length > 0 ? userProfile.cropsGrown.join(', ') : 'Not specified'}
Climate: ${userProfile.climate || 'Not specified'}

Note: Provide advice tailored to this farmer's location, crops, and climate conditions.`;
}

/**
 * Get search enhancement terms from user profile
 * @param {Object} userProfile - User profile object
 * @returns {string} Additional search terms
 */
export function getSearchEnhancementTerms(userProfile) {
  if (!userProfile || !userProfile.profileCompleted) {
    return '';
  }

  let terms = '';
  if (userProfile.location) {
    terms += ` ${userProfile.location}`;
  }
  if (userProfile.cropsGrown && userProfile.cropsGrown.length > 0) {
    terms += ` ${userProfile.cropsGrown.join(' ')}`;
  }
  if (userProfile.climate) {
    terms += ` ${userProfile.climate} climate`;
  }

  return terms;
}
