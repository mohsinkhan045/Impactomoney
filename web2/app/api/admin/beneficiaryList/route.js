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

// GET Beneficiary List
export async function GET(req) {
    const auth = await authenticateToken(req);
    if (!auth.isValid) {
        return NextResponse.json(responseFormatter(401, auth.message, null, null), { status: 401 });
    }

    await connectDB();
    try {
        const beneficiaries = await User.find({ role: 'Beneficiary' });
        // Extract unique cities from beneficiaries
        const uniqueCities = [...new Set(beneficiaries.map(user => user.city?.trim().toLowerCase()))].filter(Boolean);
        const uniqueCountries = [...new Set(beneficiaries.map(user => user.country?.trim().toLowerCase()))].filter(Boolean);
        return NextResponse.json(responseFormatter(200, 'Beneficiary list retrieved', null,  {
            beneficiaries,
            cities: uniqueCities,
            countries: uniqueCountries,
        }), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseFormatter(500, 'Failed to retrieve beneficiaries', error.message, null), { status: 500 });
    }
}
