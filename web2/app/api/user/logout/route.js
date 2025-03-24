// api/user/logout.js
import InvalidToken from '../../models/InvalidToken';
import responseFormatter from '../../utils/responseFormatter';
import { NextResponse } from 'next/server';

// Function to invalidate token
const invalidateToken = async (token) => {
    const expiredToken = new InvalidToken({ token, expiredAt: Date.now() });
    await expiredToken.save();
};

// User Logout
export async function POST(req) {
    // Extract token from authorization header
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(" ")[1]; // Extract token if authorization header exists
    if (!token) {
        return NextResponse.json(
            responseFormatter(401, 'Authorization token required', null, null),
            { status: 401 }
        );
    }

    try {
        await invalidateToken(token);

        return NextResponse.json(
            responseFormatter(200, 'User logged out successfully', null, null),
            { status: 200 }
        );
    } catch (error) {
        console.error('User logout error:', error);
        return NextResponse.json(
            responseFormatter(500, 'Logout failed', error.message, null),
            { status: 500 }
        );
    }
}
