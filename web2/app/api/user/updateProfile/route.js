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

// PUT - Update user profile
export async function PUT(req) {
    const auth = await authenticateToken(req);
    if (!auth.isValid) {
        return NextResponse.json(responseFormatter(401, auth.message, null, null), { status: 401 });
    }

    // Destructure the new user details from the request body
    const {
        name,
        email,
        cnic,
        home,
        phone,
        voucherCategory,
        picture
    } = await req.json();

    // Check for required fields based on the user's role
    if (!name || !email || !home || !phone) {
        return NextResponse.json(
            responseFormatter(400, 'Name, email, home, and phone are required.', null, null),
            { status: 400 }
        );
    }

    // Validate voucher category if user is Beneficiary
    if (auth.user.role === 'Beneficiary' && !voucherCategory) {
        return NextResponse.json(
            responseFormatter(400, 'Voucher category is required for Beneficiary role.', null, null),
            { status: 400 }
        );
    }

    await connectDB(); // Ensure database connection

    try {
        const user = await User.findById(auth.user._id); // Find the user by their ID
        if (!user) {
            return NextResponse.json(responseFormatter(404, 'User not found', null, null), { status: 404 });
        }

        // Update the user profile with the new details
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.home = home || user.home;
        user.cnic = cnic || user.cnic; // National ID update (if available)
        user.voucherCategory = voucherCategory || user.voucherCategory; // Update voucher category for Beneficiary role
        user.picture = picture || user.picture; // Profile photo update

        // Save the updated user document
        await user.save();

        return NextResponse.json(
            responseFormatter(200, 'Profile updated successfully', null, user),
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            responseFormatter(500, 'Failed to update profile', error.message, null),
            { status: 500 }
        );
    }
}
