import { NextResponse } from 'next/server';
import { connectDB } from '../../../utils/connectDB';
import User from '../../../models/User';
import responseFormatter from '../../../utils/responseFormatter';


export async function POST(req) {
    await connectDB();
    const { email, code } = await req.json();
    try {
        const user = await User.findOne({ email });
        if (!user || user.resetCode !== code || Date.now() > user.resetCodeExpiry) {
            return NextResponse.json(responseFormatter(400, 'Invalid or expired code', null, null), { status: 400 });
        }

        return NextResponse.json(responseFormatter(200, 'Code verified successfully', null, null), { status: 200 });
    } catch (error) {
        console.error('Verify Reset Code error:', error);
        return NextResponse.json(responseFormatter(500, 'Error verifying code', error.message,), { status: 500 });
    }
}
 