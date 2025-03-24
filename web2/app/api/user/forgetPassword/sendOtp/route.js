import crypto from 'crypto';
import { NextResponse } from 'next/server';
import sendEmail from "../../../utils/emailUtils"
import { connectDB } from '../../../utils/connectDB';
import User from '../../../models/User';
import responseFormatter from '../../../utils/responseFormatter';

export async function POST(req) {
    // Connect to the database
    await connectDB();
    const { email } = await req.json();
    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                responseFormatter(404, 'User not found', null, null),
                { status: 404 }
            );
        }

        // Generate reset code and expiry
        const resetCode = crypto.randomInt(100000, 999999).toString();
        const resetCodeExpiry = Date.now() + 15 * 60 * 1000;

        // Set reset code and expiry on user document
        user.resetCode = resetCode;
        user.resetCodeExpiry = resetCodeExpiry;
        await user.save();

        // Send email with reset code
        await sendEmail(
            email,
            'Password Reset Code',
            `Your password reset code is: ${resetCode}. This code will expire in 15 minutes.`
        );

        return NextResponse.json(
            responseFormatter(200, 'Password reset code sent', null, null),
            { status: 200 }
        );
    } catch (error) {
        console.error('Forgot Password error:', error);
        return NextResponse.json(
            responseFormatter(500, 'Error sending reset code', error.message, null),
            { status: 500 }
        );
    }
}
