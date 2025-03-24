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


// GET Service Provider List
export async function GET(req) {
    const auth = await authenticateToken(req);
    if (!auth.isValid) {
        return NextResponse.json(responseFormatter(401, auth.message, null, null), { status: 401 });
    }

    await connectDB();
    try {
        // Fetch service providers, excluding the 'password' field
        const providers = await User.find({ role: 'Provider' }).select('-password');
        // / Extract unique cities using Map.get() method
        const uniqueCities = [...new Set(providers
            .filter(provider => provider.voucherDetails && provider.voucherDetails.get('city'))
            .map(provider => {
                const city = provider.voucherDetails.get('city').trim().toLowerCase();
                console.log("Mapped city:", city);
                return city;
            })
        )];
        const uniqueCountries = [...new Set(providers
            .filter(provider => provider.voucherDetails && provider.voucherDetails.get('country'))
            .map(provider => {
                const country = provider.voucherDetails.get('country').trim().toLowerCase();
                console.log("Mapped country:", country);
                return country;
            })
        )];
  console.log("Final unique cities:", uniqueCities);
        return NextResponse.json(responseFormatter(200, 'Service provider list retrieved', null, {
            providers,
            cities: uniqueCities,
            countries: uniqueCountries,
        }), { status: 200 });
    } catch (error) {
        return NextResponse.json(responseFormatter(500, 'Failed to retrieve service providers', error.message, null), { status: 500 });
    }
}
