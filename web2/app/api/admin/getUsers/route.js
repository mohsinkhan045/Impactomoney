import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import User from '../../models/User'
import responseFormatter from '../../utils/responseFormatter';
import { connectDB } from '../../utils/connectDB';

export async function POST(req) {
    // Connect to the database
    await connectDB();

    // Extract Bearer token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(responseFormatter(401, 'Authorization header missing or invalid', null, null), { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    try {
        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the requester is an admin
        if (decodedToken.role !== 'Admin') {
            return NextResponse.json(responseFormatter(403, 'Access denied', null, null), { status: 403 });
        }

        // Get the requested user role from the request body
        const { type } = await req.json();
        console.log(type);
        // Validate role type
        if (!type || (type !== 'Beneficiary' && type !== 'Provider')) {
            return NextResponse.json(responseFormatter(400, 'Invalid user type specified', null, null), { status: 400 });
        }

        // Fetch all users with the specified role
        const users = await User.find({ role: type }).select(
            '_id name email role cnic voucherCategory voucherDetails created_at wallet_address updatedAt status createdAt voucherDetails'
        );

        // Return the users list based on the role type
        return NextResponse.json(responseFormatter(200, `${type}s retrieved successfully`, null, users), { status: 200 });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(responseFormatter(500, 'Error fetching users', error.message, null), { status: 500 });
    }
}
