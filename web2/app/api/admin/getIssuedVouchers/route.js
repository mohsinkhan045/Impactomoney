import { connectDB } from '../../utils/connectDB';
import responseFormatter from '../../utils/responseFormatter';
import jwt from 'jsonwebtoken';
import BeneficiaryDetails from '../../models/IssuedVoucherBeneficiary';
import { NextResponse } from 'next/server';

// Helper function to authenticate token
const authenticateToken = async (req) => {
  const authHeader = req.headers.get("authorization");
  console.log('Authorization Header:', authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log('Extracted Token:', token);
  if (!token) return { isValid: false, message: "Unauthorized" };

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return { isValid: true, user };
  } catch (error) {
    return { isValid: false, message: "Forbidden" };
  }
};


// GET API handler
export async function GET(req) {
    const auth = await authenticateToken(req);
    if (!auth.isValid) {
      return NextResponse.json(responseFormatter(401, auth.message, null, null), {
        status: 401,
      });
    }

    const userId = auth.user._id; // Extract user ID from the token
    const { searchParams } = new URL(req.url);
    const isExpiredParam = searchParams.get("isExpired"); 


    await connectDB(); // Connect to the database

    try {
        // Fetch the beneficiary details
        const beneficiaries = await BeneficiaryDetails.find({ id: userId ,isMinted:false});

        if (!beneficiaries || beneficiaries.length === 0) {
            return NextResponse.json(
                responseFormatter(404, 'No pending vouchers found for this user', null, null),
                { status: 404 }
            );
        }

        const today = new Date();

   
        const filteredBeneficiaries = beneficiaries.filter(beneficiary => {
          const validityDate = new Date(beneficiary.metadata.validity);
          return isExpiredParam === 'true' ? validityDate <= today : validityDate > today; er
        });
    
        if (filteredBeneficiaries.length === 0) {
          const message = isExpiredParam === 'true' ? 'No expired vouchers found for this user' : 'No valid vouchers found for this user';
          return NextResponse.json(
            responseFormatter(404, message, null, null),
            { status: 404 }
          );
        }
    


        return NextResponse.json(
            responseFormatter(200, 'Data retrieved successfully', null, filteredBeneficiaries),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching beneficiary details:', error);
        return NextResponse.json(
            responseFormatter(500, 'Internal Server Error', null, error.message),
            { status: 500 }
        );
    }
}

