import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// DEBUG endpoint - Get raw user data from database
export async function GET(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({
                error: "Not authenticated"
            }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(userId).lean(); // .lean() gives plain object
        
        if (!user) {
            return NextResponse.json({
                error: "User not found",
                userId
            }, { status: 404 });
        }

        // Return EVERYTHING to see what's actually in the database
        return NextResponse.json({
            userId,
            rawData: user,
            checks: {
                hasProfileCompletedFlag: user.profileCompleted === true,
                hasUsername: Boolean(user.username),
                usernameValue: user.username,
                hasLocation: Boolean(user.location),
                locationValue: user.location,
                hasFieldSize: Boolean(user.fieldSize),
                fieldSizeValue: user.fieldSize,
                hasCropsGrown: Array.isArray(user.cropsGrown) && user.cropsGrown.length > 0,
                cropsGrownValue: user.cropsGrown,
                hasClimate: Boolean(user.climate),
                climateValue: user.climate
            }
        }, { status: 200 });
        
    } catch (error) {
        console.error("Debug endpoint error:", error);
        return NextResponse.json({ 
            error: error.message 
        }, { status: 500 });
    }
}
