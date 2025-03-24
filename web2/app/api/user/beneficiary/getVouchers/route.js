import { connectDB } from '../../../utils/connectDB';
import Voucher from '../../../models/Voucher';
import responseFormatter from '../../../utils/responseFormatter';
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
export async function GET(req) {
    const auth = await authenticateToken(req);
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('wallet_address');

    if (!walletAddress) {
        return NextResponse.json(
            responseFormatter(400, 'Wallet address is required', null, null),
            { status: 400 }
        );
    }

    await connectDB();

    try {
        // Find vouchers associated with the wallet address
        const vouchers = await Voucher.find({ walletAddress: walletAddress }).select('-__v');

        if (!vouchers.length) {
            return NextResponse.json(
                responseFormatter(404, 'No vouchers found for the provided wallet address', null, null),
                { status: 404 }
            );
        }

        return NextResponse.json(
            responseFormatter(200, 'Vouchers retrieved successfully', null, vouchers),
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            responseFormatter(500, 'Failed to fetch vouchers', error.message, null),
            { status: 500 }
        );
    }
}
