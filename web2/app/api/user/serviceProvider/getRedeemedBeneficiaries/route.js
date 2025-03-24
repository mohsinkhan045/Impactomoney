import { connectDB } from '../../../utils/connectDB';
import responseFormatter from '../../../utils/responseFormatter';
import jwt from 'jsonwebtoken';
import RedeemedVoucher from '../../../models/RedeemedVoucher';
import Voucher from '../../../models/Voucher';
import { NextResponse } from 'next/server';

const authenticateToken = async (req) => {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return { isValid: false, message: 'Unauthorized: Missing Token' };

        const user = jwt.verify(token, process.env.JWT_SECRET);
        return { isValid: true, user };
    } catch (error) {
        console.error("JWT Authentication Error:", error);
        return { isValid: false, message: 'Forbidden: Invalid Token' };
    }
};

export async function GET(req) {
    try {
        const auth = await authenticateToken(req);
        if (!auth.isValid) {
            return NextResponse.json(
                responseFormatter(401, auth.message, null, null),
                { status: 401 }
            );
        }

        const userId = auth.user.id; // Extract user ID from token

        await connectDB();

        // Fetch Redeemed Vouchers
        const redeemedVouchers = await RedeemedVoucher.aggregate([
            {
                $match: { serviceProviderId: userId },
            },
            {
                $lookup: {
                    from: 'vouchers', 
                    localField: 'voucherId', 
                    foreignField: '_id', 
                    as: 'voucherDetails',
                },
            },
            {
                $unwind: '$voucherDetails',
            },
            {
                $project: {
                    id: '$_id',
                    beneficiaryName: 1,
                    beneficiaryEmail: 1,
                    amount: '$amount',
                    voucherType: '$voucherDetails.voucherType',
                    walletAddress: '$voucherDetails.walletAddress',
                    voucherName: '$voucherDetails.voucherName',
                    image: '$voucherDetails.metaDataUrl',
                },
            },
        ]);

        if (!redeemedVouchers || redeemedVouchers.length === 0) {
            return NextResponse.json(
                responseFormatter(404, 'No beneficiaries found for this provider', null, null),
                { status: 404 }
            );
        }

        return NextResponse.json(
            responseFormatter(200, 'Data retrieved successfully', null, redeemedVouchers),
            { status: 200 }
        );

    } catch (error) {
        console.error('Database/API Error:', error);
        return NextResponse.json(
            responseFormatter(500, 'Internal Server Error', null, error.message),
            { status: 500 }
        );
    }
}
