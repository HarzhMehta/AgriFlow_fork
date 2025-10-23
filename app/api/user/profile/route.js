import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET user profile
export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User not authenticated",
            });
        }

        await connectDB();
        const user = await User.findById(userId);
        
        if (!user) {
            console.log(`User not found: ${userId}`);
            return NextResponse.json({
                success: false,
                message: "User not found",
            });
        }

        console.log(`Profile check for ${userId}:`, {
            username: user.username,
            location: user.location,
            fieldSize: user.fieldSize,
            cropsGrown: user.cropsGrown,
            climate: user.climate,
            profileCompleted: user.profileCompleted
        });

        // Determine if profile is actually complete
        // Profile is complete if user has filled in all required fields
        const isProfileComplete = Boolean(
            user.profileCompleted === true &&
            user.username &&
            user.location &&
            user.fieldSize &&
            user.cropsGrown?.length > 0 &&
            user.climate
        );

        console.log(`🔍 Profile completeness check:`, {
            profileCompletedFlag: user.profileCompleted,
            hasUsername: Boolean(user.username),
            hasLocation: Boolean(user.location),
            hasFieldSize: Boolean(user.fieldSize),
            hasCrops: user.cropsGrown?.length > 0,
            hasClimate: Boolean(user.climate),
            finalDecision: isProfileComplete ? '✅ COMPLETE' : '❌ INCOMPLETE'
        });

        return NextResponse.json({
            success: true,
            data: {
                username: user.username || null,
                location: user.location || null,
                fieldSize: user.fieldSize || null,
                cropsGrown: user.cropsGrown || [],
                climate: user.climate || null,
                profileCompleted: isProfileComplete
            }
        });
    } catch (error) {
        console.error("Profile GET error:", error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        });
    }
}

// POST/UPDATE user profile
export async function POST(req) {
    console.log('🔵 POST /api/user/profile - Request received');
    
    try {
        const { userId } = getAuth(req);
        console.log('🔵 Auth check - userId:', userId);
        
        if (!userId) {
            console.log('❌ No userId found - user not authenticated');
            return NextResponse.json({
                success: false,
                message: "User not authenticated",
            }, { status: 401 });
        }

        let body;
        try {
            body = await req.json();
            console.log('🔵 Request body parsed:', body);
        } catch (parseErr) {
            console.error('❌ Failed to parse request body:', parseErr);
            return NextResponse.json({
                success: false,
                message: "Invalid request body",
                error: parseErr.message
            }, { status: 400 });
        }

        const { username, location, fieldSize, cropsGrown, climate } = body;

        console.log('🔵 Updating profile for user:', userId);
        console.log('🔵 Profile data:', { username, location, fieldSize, cropsGrown, climate });

        await connectDB();
        
        // First, try to find the user
        let user = await User.findById(userId);

        // If user isn't found yet (webhook timing), create a minimal base user doc so we can continue
        if (!user) {
            console.warn('⚠️ User not found in database. Creating fallback base user to avoid timing race with webhook:', userId);
            try {
                // Fetch user data from Clerk to get email and name
                console.log('🔵 Fetching user data from Clerk...');
                const client = await clerkClient();
                const clerkUser = await client.users.getUser(userId);
                
                const userData = {
                    _id: userId,
                    email: clerkUser.emailAddresses[0]?.emailAddress || `${userId}@temp.com`,
                    name: clerkUser.fullName || clerkUser.firstName || 'User',
                    image: clerkUser.imageUrl || null,
                    createdAt: new Date(),
                    profileCompleted: false
                };
                
                console.log('🔵 Creating fallback user with Clerk data:', { email: userData.email, name: userData.name });
                
                user = await User.findOneAndUpdate(
                    { _id: userId },
                    { $setOnInsert: userData },
                    { upsert: true, new: true }
                );
                console.log('✅ Fallback base user created:', userId);
            } catch (err) {
                console.error('❌ Failed to create fallback user:', err?.message || err);
                console.error('❌ Error details:', err);
                return NextResponse.json({ 
                    success: false, 
                    message: 'Failed to create base user. Please refresh the page and try again.' 
                }, { status: 500 });
            }
        }

        // Check if user is missing required fields (email, name) and fill them from Clerk
        if (!user.email || !user.name) {
            console.warn('⚠️ User exists but missing required fields. Fetching from Clerk...');
            try {
                const client = await clerkClient();
                const clerkUser = await client.users.getUser(userId);
                
                if (!user.email) {
                    user.email = clerkUser.emailAddresses[0]?.emailAddress || `${userId}@temp.com`;
                    console.log('🔵 Set email:', user.email);
                }
                if (!user.name) {
                    user.name = clerkUser.fullName || clerkUser.firstName || 'User';
                    console.log('🔵 Set name:', user.name);
                }
                if (!user.image) {
                    user.image = clerkUser.imageUrl || null;
                }
            } catch (err) {
                console.error('❌ Failed to fetch Clerk user data:', err?.message || err);
                // Continue anyway with fallback values
                user.email = user.email || `${userId}@temp.com`;
                user.name = user.name || 'User';
            }
        }

        // Update the user profile
        user.username = username;
        user.location = location;
        user.fieldSize = fieldSize;
        user.cropsGrown = Array.isArray(cropsGrown) ? cropsGrown : [];
        user.climate = climate;
        user.profileCompleted = true;

        await user.save();

        console.log('✅ Profile updated successfully:', user._id);

        const successResponse = {
            success: true,
            message: "Profile updated successfully",
            data: {
                username: user.username,
                location: user.location,
                fieldSize: user.fieldSize,
                cropsGrown: user.cropsGrown,
                climate: user.climate,
                profileCompleted: user.profileCompleted
            }
        };
        
        console.log('✅ Returning success response:', successResponse);
        return NextResponse.json(successResponse, { status: 200 });
    } catch (error) {
        console.error("❌ Profile POST error (caught in top-level catch):", error);
        console.error("❌ Error stack:", error.stack);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to save profile',
            error: error.message 
        }, { status: 500 });
    }
}
