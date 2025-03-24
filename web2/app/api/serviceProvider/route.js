import { connectDB } from '../utils/connectDB';
import User from '../models/User';
import responseFormatter from '../utils/responseFormatter';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Middleware for token authentication
const authenticateToken = async (req) => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return { isValid: false, message: 'Unauthorized' };

    try {
        // Decode and verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure the token contains 'id' in the payload
        if (!decodedToken || !decodedToken.id) {
            return { isValid: false, message: 'Invalid token structure, missing user.id' };
        }

        return { isValid: true, user: decodedToken };  // Pass the user object extracted from the token
    } catch (error) {
        console.log("Token Verification Error:", error);
        return { isValid: false, message: 'Forbidden' };
    }
};

// GET PROVIDER's own details
export async function GET(req) {
    // Authenticate the token first
    const auth = await authenticateToken(req);

    if (!auth.isValid) {
        return NextResponse.json(responseFormatter(401, auth.message, null, null), { status: 401 });
    }

    // Connect to the database
    await connectDB();

    try {
        const userId = auth.user.id;  // Use 'id' from the token payload (instead of '_id')

        // Check if the userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(responseFormatter(400, 'Invalid User ID', null, null), { status: 400 });
        }

        // Fetch the beneficiary from the database using the userId
        const provider = await User.findById(userId).select('-password');  // Exclude password field

        // If no beneficiary is found, return a 404 error
        if (!provider) {
            return NextResponse.json(responseFormatter(404, 'Service Proivder not found', null, null), { status: 404 });
        }

        // Return the beneficiary details if found
        return NextResponse.json(responseFormatter(200, 'Service Provider details retrieved', null, provider), { status: 200 });
    } catch (error) {
        // If any error occurs, return a 500 error
        console.log("Error retrieving service provider:", error);  // Log the error
        return NextResponse.json(responseFormatter(500, 'Failed to retrieve service provider details', error.message, null), { status: 500 });
    }
}
