import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { connectDB } from '../../../utils/connectDB';
import User from '../../../models/User';
import responseFormatter from '../../../utils/responseFormatter';
import { NextResponse } from 'next/server';

// Function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export async function POST(req) {
    const { email, password } = await req.json();
    await connectDB();
    
    try {
        // Checking if user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found with email:", email);
            return NextResponse.json(responseFormatter(400, 'Invalid credentials', null, null), { status: 400 });
        }

        // Checking if password matches
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.log("Password mismatch for user:", email);
            return NextResponse.json(responseFormatter(400, 'Invalid password', null, null), { status: 400 });
        }

        // Generating JWT token if login succeeds
        const token = generateToken(user);
        
        console.log("Token generated:", token);

        // User details to return
        const userDetails = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            cnic: user.cnic,
            religion: user.religion,
            voucherCategory: user.voucherCategory,
            voucherDetails: user.voucherDetails,
            subEducationCategory: user.subEducationCategory,
            created_at: user.created_at,
            wallet_address: user.wallet_address,
            status: user.status
        };

        return NextResponse.json(responseFormatter(200, 'Login successful', null, { token, user: userDetails }), { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(responseFormatter(500, 'Login error', error.message, null), { status: 500 });
    }
}
