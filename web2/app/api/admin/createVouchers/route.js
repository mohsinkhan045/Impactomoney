import { connectDB } from '../../utils/connectDB';
import Voucher from '../../models/Voucher';
import User from '../../models/User';
import responseFormatter from '../../utils/responseFormatter';
import { NextResponse } from 'next/server';
import  sendEmail  from '../../utils/emailUtils';
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

export async function POST(req) {
    const auth = await authenticateToken(req);
    if (!auth.isValid) {
        return NextResponse.json(responseFormatter(401, auth.message, null, null), { status: 401 });
    }

    const { metadata, data } = await req.json();

    if (!metadata || !Array.isArray(data) || data.length === 0) {
        return NextResponse.json(responseFormatter(400, 'Invalid metadata or wallet data', null, null), { status: 400 });
    }

    await connectDB();

    try {
        const walletAddresses = data.map(entry => entry.wallet_address);
        console.log(walletAddresses);

        const users = await User.find({ wallet_address: { $in: walletAddresses } });

        if (users.length === 0) {
            return NextResponse.json(
                responseFormatter(404, 'No users found for the provided wallet addresses', null, null),
                { status: 404 }
            );
        }

        const beneficiaries = users.filter(user => user.role === 'Beneficiary');
        if (beneficiaries.length === 0) {
            return NextResponse.json(
                responseFormatter(403, 'No beneficiaries found in the provided wallet addresses', null, null),
                { status: 403 }
            );
        }

        // Save vouchers
        const voucherPromises = data.map(async entry => {
            const { token_id, wallet_address } = entry;
            console.log(token_id, wallet_address)
            const amount = parseFloat(metadata.amount);
            console.log(amount)
            if (isNaN(amount)) {
                throw new Error('Invalid amount format');
            }

            const voucher = new Voucher({
                metaDataUrl: metadata.metaDataUrl,
                voucherId: token_id,
                voucherName: metadata.voucher_name,
                voucherIssuer: metadata.voucher_issuer,
                voucherType: metadata.voucher_type,
                walletAddress: wallet_address,
                tokenId: token_id,
                currencyChoice:metadata.currency,
                amount,
            });

            console.log(voucher)
            await voucher.save();
        });

        await Promise.all(voucherPromises);

        // Update user statuses and send emails
        const statusUpdatePromises = beneficiaries.map(async user => {
            user.status = 'funded';
            await user.save();

            await sendEmail(
                user.email,
                'Voucher Issued',
                `Dear ${user.name}, a voucher with token ID ${user.tokenId} has been issued and added to your wallet.`
            );
        });

        await Promise.all(statusUpdatePromises);

        return NextResponse.json(
            responseFormatter(200, 'Vouchers saved, statuses updated, and emails sent successfully', null, null),
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            responseFormatter(500, 'Failed to save vouchers and update statuses', error.message, null),
            { status: 500 }
        );
    }

}