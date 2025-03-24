// import { NextResponse } from 'next/server';
// import jwt from 'jsonwebtoken';
// import User from '../../models/User';
// import Voucher from '../../models/Voucher';
// import responseFormatter from '../../utils/responseFormatter';
// import { connectDB } from '../../utils/connectDB';

// export async function GET(req) {
//     try {
//         // Connect to the database
//         await connectDB();

//         // Get and verify the token from headers
//         const token = req.headers.get('authorization')?.split(' ')[1];
//         if (!token) {
//             return NextResponse.json(
//                 responseFormatter({
//                     statusCode: 401,
//                     message: 'Unauthorized: No token provided',
//                 }),
//                 { status: 401 }
//             );
//         }

//         // Verify and decode token
//         let decoded;
//         try {
//             decoded = jwt.verify(token, process.env.JWT_SECRET);
//         } catch (error) {
//             return NextResponse.json(
//                 responseFormatter({
//                     statusCode: 401,
//                     message: 'Unauthorized: Invalid token',
//                 }),
//                 { status: 401 }
//             );
//         }

//         // Role check for admin access
//         if (decoded.role !== 'Admin') {
//             return NextResponse.json(
//                 responseFormatter({
//                     statusCode: 403,
//                     message: 'Forbidden: Admin access only',
//                 }),
//                 { status: 403 }
//             );
//         }

//         // Count user and voucher statistics
//         const [
//             newBeneficiariesCount,
//             approvedBeneficiariesCount,
//             newServiceProvidersCount,
//             approvedServiceProvidersCount,
//             activeVouchersCount,
//             redeemedVouchersCount
//         ] = await Promise.all([
//             // For new beneficiaries (status = true)
//             User.countDocuments({ role: 'Beneficiary', status: true }),

//             // For approved beneficiaries (status = false)
//             User.countDocuments({ role: 'Beneficiary', status: false }),

//             // For new service providers (status = true)
//             User.countDocuments({ role: 'Provider', status: true }),

//             // For approved service providers (status = false)
//             User.countDocuments({ role: 'Provider', status: false }),

//             // Count active vouchers
//             Voucher.countDocuments({ status: 'active' }),

//             // Count redeemed vouchers
//             Voucher.countDocuments({ status: 'redeemed' })
//         ]);

//         // Successful response with counts
//         return NextResponse.json(
//             responseFormatter({
//                 statusCode: 200,
//                 message: 'Counts retrieved successfully',
//                 data: {
//                     newBeneficiariesCount,
//                     approvedBeneficiariesCount,
//                     newServiceProvidersCount,
//                     approvedServiceProvidersCount,
//                     activeVouchersCount,
//                     redeemedVouchersCount
//                 }
//             }),
//             { status: 200 }
//         );
//     } catch (error) {
//         console.error('Error retrieving counts:', error);
//         return NextResponse.json(
//             responseFormatter({
//                 statusCode: 500,
//                 message: 'Failed to retrieve counts',
//                 error: error.message
//             }),
//             { status: 500 }
//         );
//     }
// }



import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import Voucher from '../../models/Voucher';
import responseFormatter from '../../utils/responseFormatter';
import { connectDB } from '../../utils/connectDB';

export async function GET(req) {
    try {
        // Connect to the database
        await connectDB();

        // Get and verify the token from headers
        const token = req.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                responseFormatter({
                    statusCode: 401,
                    message: 'Unauthorized: No token provided',
                }),
                { status: 401 }
            );
        }

        // Verify and decode token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return NextResponse.json(
                responseFormatter({
                    statusCode: 401,
                    message: 'Unauthorized: Invalid token',
                }),
                { status: 401 }
            );
        }

        // Role check for admin access
        if (decoded.role !== 'Admin') {
            return NextResponse.json(
                responseFormatter({
                    statusCode: 403,
                    message: 'Forbidden: Admin access only',
                }),
                { status: 403 }
            );
        }

        // Get voucher type totals along with existing counts
        const [
            newBeneficiariesCount,
            approvedBeneficiariesCount,
            newServiceProvidersCount,
            approvedServiceProvidersCount,
            activeVouchersCount,
            redeemedVouchersCount,
            voucherAmounts
        ] = await Promise.all([
            User.countDocuments({ role: 'Beneficiary', status: 'new' }),
            User.countDocuments({ role: 'Beneficiary', status: 'approved' }),
            User.countDocuments({ role: 'Provider', status: 'new' }),
            User.countDocuments({ role: 'Provider', status: 'approved' }),
            Voucher.countDocuments({ status: 'active' }),
            Voucher.countDocuments({ status: 'redeemed' }),
            // New aggregation for voucher amounts by type
            Voucher.aggregate([
                {
                    $group: {
                        _id: '$voucherType',
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ])
        ]);

        // Convert aggregation result to a more readable format
        const voucherTypeTotals = voucherAmounts.reduce((acc, item) => {
            acc[item._id] = item.totalAmount;
            return acc;
        }, {});

        // Successful response with counts and voucher type totals
        return NextResponse.json(
            responseFormatter({
                statusCode: 200,
                message: 'Counts retrieved successfully',
                data: {
                    newBeneficiariesCount,
                    approvedBeneficiariesCount,
                    newServiceProvidersCount,
                    approvedServiceProvidersCount,
                    activeVouchersCount,
                    redeemedVouchersCount,
                    voucherTypeTotals
                }
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error retrieving counts:', error);
        return NextResponse.json(
            responseFormatter({
                statusCode: 500,
                message: 'Failed to retrieve counts',
                error: error.message
            }),
            { status: 500 }
        );
    }
}
