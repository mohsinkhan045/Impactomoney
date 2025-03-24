import { connectDB } from '../../../utils/connectDB';
import Voucher from '../../../models/Voucher'; // Import the Voucher model
import responseFormatter from '../../../utils/responseFormatter';
import { NextResponse } from 'next/server'; 
import jwt from 'jsonwebtoken';

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

export async function PUT(req) {
    const auth = await authenticateToken(req);
    if (!auth.isValid) {
        return NextResponse.json(
            responseFormatter(401, auth.message, null, null),
            { status: 401 }
        );
    }

    await connectDB();

    try {
        // Parse the request body
        const { voucherId , amount} = await req.json();

        // Validation
        if (!voucherId) {
            return NextResponse.json(
                responseFormatter(400, 'Voucher ID is required', null, null),
                { status: 400 }
            );
        }

        // Update the voucher status to "redeemed"
        const updatedVoucher = await Voucher.findByIdAndUpdate(
            voucherId,
            { status: 'Partially Redeemed' },
            {amount:amount},
            { new: true } // Return the updated document
        );

        if (!updatedVoucher) {
            return NextResponse.json(
                responseFormatter(404, 'Voucher not found', null, null),
                { status: 404 }
            );
        }

        return NextResponse.json(
            responseFormatter(200, 'Voucher status updated successfully', updatedVoucher, null),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating voucher status:', error);
        return NextResponse.json(
            responseFormatter(500, 'Internal Server Error', null, error.message),
            { status: 500 }
        );
    }
} 