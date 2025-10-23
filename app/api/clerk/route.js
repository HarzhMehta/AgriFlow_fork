import { Webhook } from "svix";
import connectDB from "@/config/db";
import User from "@/models/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
    // Use CLERK_SIGNING_SECRET or SIGNING_SECRET for backward compatibility
    const signingSecret = process.env.CLERK_SIGNING_SECRET || process.env.SIGNING_SECRET;

    if (!signingSecret) {
        console.error('❌ Webhook signing secret not found in environment variables!');
        console.error('   Please add CLERK_SIGNING_SECRET to your .env file');
        return new Response('Webhook signing secret not configured', { status: 500 });
    }

    const wh = new Webhook(signingSecret);
    const headerPayload = await headers();

    // svix headers may come in with different casing depending on proxy
    const svixHeaders = {
        'svix-id': headerPayload.get('svix-id') || headerPayload.get('Svix-Id'),
        'svix-timestamp': headerPayload.get('svix-timestamp') || headerPayload.get('Svix-Timestamp'),
        'svix-signature': headerPayload.get('svix-signature') || headerPayload.get('Svix-Signature'),
    };

    let payload;
    try {
        payload = await req.json();
    } catch (err) {
        console.error('❌ Failed to parse webhook body:', err?.message || err);
        return new Response('Invalid webhook payload', { status: 400 });
    }

    const body = JSON.stringify(payload);
    let verified;
    try {
        verified = wh.verify(body, svixHeaders);
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err?.message || err);
        return new Response('Signature verification failed', { status: 401 });
    }

    const { data, type } = verified;

    // Prepare the user data to be saved in the database (defensive checks)
    const primaryEmail = data?.email_addresses?.[0]?.email_address || null;
    const userData = {
        _id: data?.id,
        email: primaryEmail,
        name: `${data?.first_name || ''} ${data?.last_name || ''}`.trim() || data?.full_name || null,
        image: data?.image_url || null,
    };

    try {
        await connectDB();
    } catch (err) {
        console.error('❌ Could not connect to DB in webhook:', err?.message || err);
        return new Response('Database connection error', { status: 500 });
    }

    switch (type) {
        case 'user.created':
            console.log('🔔 Clerk webhook: user.created');
            console.log('   Upserting user:', data.id);
            try {
                // Use upsert so even if webhook routing/order changes we still have a user record
                await User.findOneAndUpdate({ _id: data.id }, { $set: userData, $setOnInsert: { profileCompleted: false, createdAt: new Date() } }, { upsert: true, new: true });
                console.log('✅ User upserted successfully in database:', data.id);
            } catch (error) {
                console.error('❌ Error upserting user in database:', error?.message || error);
                return new Response('DB error on user.create', { status: 500 });
            }
            break;

        case 'user.updated':
            console.log('🔔 Clerk webhook: user.updated');
            console.log('   Updating user:', data.id);
            try {
                await User.findOneAndUpdate({ _id: data.id }, { $set: userData }, { upsert: true, new: true });
                console.log('✅ User updated successfully in database:', data.id);
            } catch (error) {
                console.error('❌ Error updating user in database:', error?.message || error);
                return new Response('DB error on user.update', { status: 500 });
            }
            break;

        case 'user.deleted':
            console.log('🔔 Clerk webhook: user.deleted');
            console.log('   Deleting user:', data.id);
            try {
                await User.findByIdAndDelete(data.id);
                console.log('✅ User deleted successfully from database:', data.id);
            } catch (error) {
                console.error('❌ Error deleting user from database:', error?.message || error);
                return new Response('DB error on user.delete', { status: 500 });
            }
            break;

        default:
            console.log('🔔 Clerk webhook: Unknown event type:', type);
            break;
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ message: 'Event received' }, { status: 200 });
}