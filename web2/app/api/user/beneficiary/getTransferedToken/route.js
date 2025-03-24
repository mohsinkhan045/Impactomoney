import { connectDB } from '../../../utils/connectDB';
import BeneficiaryDetails from '../../../models/IssuedVoucherBeneficiary';
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
    // Authenticate the request
    const auth = await authenticateToken(req);
    if (!auth.isValid) {
        return NextResponse.json(
            responseFormatter(401, auth.message, null, null),
            { status: 401 }
        );
    }

    // Get wallet address from query parameters
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
        // Find beneficiary details with Religion Voucher category for the given wallet address
        const transferedTokens = await BeneficiaryDetails.find({
            wallet_address: walletAddress,
            voucherCategory: 'Religion'
        }).select('-__v');

        if (!transferedTokens.length) {
            return NextResponse.json(
                responseFormatter(404, 'No Religion Voucher transfers found for the provided wallet address', null, null),
                { status: 404 }
            );
        }

        return NextResponse.json(
            responseFormatter(200, 'Religion Voucher transfers retrieved successfully', null, transferedTokens),
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            responseFormatter(500, 'Failed to fetch Religion Voucher transfers', error.message, null),
            { status: 500 }
        );
    }
} 