import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { connectDB } from '../../../utils/connectDB';
import User from '../../../models/User';
import responseFormatter from '../../../utils/responseFormatter';

export async function POST(req) {
    await connectDB();
    const { email, code, newPassword } = await req.json();

    // Check if all required fields are provided
    if (!email || !code || !newPassword) {
        return NextResponse.json(
            responseFormatter(400, 'Invalid email or expired code', null, null),
            { status: 400 }
        );
    }

    try {
        const user = await User.findOne({ email });

        if (!user || user.resetCode !== code || Date.now() > user.resetCodeExpiry) {
            return NextResponse.json(
                responseFormatter(400, 'Invalid or expired reset code', null, null),
                { status: 400 }
            );
        }

        // Hash the new password if all checks pass
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetCode = undefined;
        user.resetCodeExpiry = undefined;
        await user.save();

        return NextResponse.json(
            responseFormatter(200, 'Password reset successfully', null, { ok: true }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Reset Password error:', error);
        return NextResponse.json(
            responseFormatter(500, 'Error resetting password', error.message, null),
            { status: 500 }
        );
    }
}
