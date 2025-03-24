import { connectDB } from '../../../utils/connectDB';
import RedeemedVoucher from '../../../models/RedeemedVoucher';
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

export async function POST(req) {
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
        const {
            beneficiaryId,
            beneficiaryName,
            beneficiaryEmail,
            serviceProviderId,
            serviceProviderName,
            voucherId
        } = await req.json();

        // Validation
        if (
            !beneficiaryId ||
            !beneficiaryName ||
            !beneficiaryEmail ||
            !serviceProviderId ||
            !serviceProviderName ||
            !voucherId
        ) {
            return NextResponse.json(
                responseFormatter(400, 'All fields are required', null, null),
                { status: 400 }
            );
        }

        console.log("voucherId:", voucherId); // Add this line to check the value

        // Save data to redeemedVouchers collection
        const redeemedVoucher = await RedeemedVoucher.create({
            beneficiaryId,
            beneficiaryName,
            beneficiaryEmail,
            serviceProviderId,
            serviceProviderName,
            voucherId,
            amount
        });

        console.log(redeemedVoucher)
        return NextResponse.json(
            responseFormatter(201, 'Redeemed voucher saved successfully', null, null),
            { status: 201 }
        );
    } catch (error) {
        console.error('Error saving redeemed voucher:', error);
        return NextResponse.json(
            responseFormatter(500, 'Internal Server Error', null, error.message),
            { status: 500 }
        );
    }
}