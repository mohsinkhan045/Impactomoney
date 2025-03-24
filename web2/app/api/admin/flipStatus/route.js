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


// PUT Flip Status of Beneficiary and Provider
export async function PUT(req) {
    const auth = await authenticateToken(req);
    if (!auth.isValid) {
        return NextResponse.json(responseFormatter(401, auth.message, null, null), { status: 401 });
    }

    const { type, id, status } = await req.json();
    const allowedStatuses = type === 'beneficiary'
        ? ['new', 'approved', 'rejected', 'funded', "voucherIssued"]
        : ['new', 'approved', 'rejected', 'black-listed'];

    if (!allowedStatuses.includes(status)) {
        return NextResponse.json(responseFormatter(400, 'Invalid status value', null, null), { status: 400 });
    }

    await connectDB();
    try {
        const user = await User.findById(id);
        if (!user || user.role.toLowerCase() !== type.toLowerCase()) {
            return NextResponse.json(responseFormatter(404, 'User not found or invalid type', null, null), { status: 404 });
        }

        user.status = status;
        await user.save();
        return NextResponse.json(responseFormatter(200, 'Status updated successfully', null, null), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseFormatter(500, 'Failed to update status', error.message, null), { status: 500 });
    }
}