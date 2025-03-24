import Admin from '../../../models/Admin';
import { connectDB } from '../../../utils/connectDB';
import responseFormatter from '../../../utils/responseFormatter';
import { NextResponse } from 'next/server';

export async function POST(req) {
    await connectDB();
    const { name, email, password } = await req.json();

    try {
        // Check if the email already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return NextResponse.json(
                responseFormatter(409, 'Email already registered', null, null),
                { status: 409 }
            );
        }

        // Hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new admin
        const newAdmin = new Admin({
            name,
            email,
            password,
        });

        // Save the admin in the database
        await newAdmin.save();

        return NextResponse.json(
            responseFormatter(201, 'Admin registered successfully!', null, null),
            { status: 201 }
        );
    } catch (error) {
        console.error('Admin registration error:', error);
        return NextResponse.json(
            responseFormatter(500, 'Registration failed', error.message, null),
            { status: 500 }
        );
    }
}
