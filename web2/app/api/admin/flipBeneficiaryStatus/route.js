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

// PUT Flip Status of Beneficiaries or Providers
export async function PUT(req) {
    const auth = await authenticateToken(req);
    if (!auth.isValid) {
        return NextResponse.json(responseFormatter(401, auth.message, null, null), { status: 401 });
    }

    const { type, ids } = await req.json();
    const validTypes = ['beneficiary', 'provider'];

    if (!validTypes.includes(type)) {
        return NextResponse.json(responseFormatter(400, 'Invalid type value', null, null), { status: 400 });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(responseFormatter(400, 'Invalid or empty IDs array', null, null), { status: 400 });
    }

    await connectDB();
    try {
        // Update status for all provided IDs
        const updateResult = await User.updateMany(
            { _id: { $in: ids }, role: type.toLowerCase() },
            { $set: { status: 'issuedVoucher' } }
        );

        if (updateResult.matchedCount === 0) {
            return NextResponse.json(responseFormatter(404, 'No matching users found', null, null), { status: 404 });
        }

        return NextResponse.json(
            responseFormatter(200, `${updateResult.modifiedCount} user(s) updated successfully`, null, null),
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(responseFormatter(500, 'Failed to update status', error.message, null), { status: 500 });
    }
}
