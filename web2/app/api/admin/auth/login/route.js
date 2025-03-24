import Admin from '../../../models/Admin';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectDB } from '../../../utils/connectDB';
import responseFormatter from '../../../utils/responseFormatter';
import { NextResponse } from 'next/server';

// Function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: 'Admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
};
export async function POST(req) {
    console.log("POST /api/admin/auth/login route called");
    await connectDB();
    const { email, password } = await req.json();
    console.log("Request data:", { email, password });

    try {
        // Find admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return NextResponse.json(
                responseFormatter(404, 'Admin not found', null, null),
                { status: 404 }
            );
        }

        // Check if the password matches
        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        if (!isPasswordMatch) {
            return NextResponse.json(
                responseFormatter(401, 'Invalid password', null, null),
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken(admin);

        return NextResponse.json(
            responseFormatter(200, 'Login successful', null, { token, admin: { name: admin.name, email: admin.email, status: admin.status } }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json(
            responseFormatter(500, 'Login failed', error.message, null),
            { status: 500 }
        );
    }
}
