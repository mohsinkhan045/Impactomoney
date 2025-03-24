import BeneficiaryDetails from "../../models/IssuedVoucherBeneficiary";
import { connectDB } from "../../utils/connectDB";
import User from "../../models/User";
import responseFormatter from "../../utils/responseFormatter";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const authenticateToken = async (req) => {
  const authHeader = req.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return { isValid: false, message: "Unauthorized" };

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return { isValid: true, user };
  } catch (error) {
    return { isValid: false, message: "Forbidden" };
  }
};
export async function GET(req) {
    const auth = await authenticateToken(req);
    if (!auth.isValid) {
      return NextResponse.json(responseFormatter(401, auth.message, null, null), {
        status: 401,
      });
    }
  
    await connectDB();
  
    try {
      // Filter only where isMinted = true AND isTransfered = true
      const vouchers = await BeneficiaryDetails.find({
        isMinted: true,
        isTransfered:true
      });
  
      if (!vouchers || vouchers.length === 0) {
        return NextResponse.json(
          responseFormatter(404, "No vouchers found", null, null),
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        responseFormatter(200, "Vouchers fetched successfully", null, vouchers),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      return NextResponse.json(
        responseFormatter(500, "Internal Server Error", error.message, null),
        { status: 500 }
      );
    }
  }
  