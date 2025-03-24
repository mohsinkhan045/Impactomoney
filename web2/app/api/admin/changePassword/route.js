import bcrypt from 'bcrypt';
import { connectDB } from '../../utils/connectDB';
import User from '../../models/User';
import responseFormatter from '../../utils/responseFormatter';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Middleware for token authentication
const authenticateToken = async (req) => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return { isValid: false, message: 'Unauthorized' };

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return { isValid: true, user };
    } catch (error) {
        return { isValid: false, message: 'Forbidden' };
    }
};

export async function POST(req) {
    const auth = await authenticateToken(req);
    console.log(auth)

    if (!auth.isValid) {
        return NextResponse.json(responseFormatter(401, auth.message, null, null), { status: 401 });
    }

    await connectDB();  // Ensure database connection
    const { currentPassword, newPassword, confirmPassword } = await req.json();

    // Check if all required fields are provided
    if (!currentPassword || !newPassword || !confirmPassword) {
        return NextResponse.json(
            responseFormatter(400, 'All fields are required', null, null),
            { status: 400 }
        );
    }

    // Validate if new password and confirm password match
    if (newPassword !== confirmPassword) {
        return NextResponse.json(
            responseFormatter(400, 'New password and confirm password do not match', null, null),
            { status: 400 }
        );
    }

    try {
        const userId = auth.user.id;

        // Find the user by their ID
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                responseFormatter(400, 'User not found', null, null),
                { status: 400 }
            );
        }

        // Check if the current password provided is correct
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                responseFormatter(400, 'Current password is incorrect', null, null),
                { status: 400 }
            );
        }

        // Hash the new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return NextResponse.json(
            responseFormatter(200, 'Password updated successfully', null, null),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json(
            responseFormatter(500, 'Error updating password', error.message, null),
            { status: 500 }
        );
    }
}
