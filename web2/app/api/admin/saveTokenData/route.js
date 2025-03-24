import ProviderDetails from "../../models/IssuedVoucherProvider";
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

export async function POST(req) {
  const auth = await authenticateToken(req);
  if (!auth.isValid) {
    return NextResponse.json(responseFormatter(401, auth.message, null, null), {
      status: 401,
    });
  }

  await connectDB();

  try {
    const { purpose, category, amount, currency, selectedCity, country,subReligionCategory } = await req.json();
    

   

    return NextResponse.json(
      responseFormatter(200, "Providers fetched successfully", null, {
        matchedCount: providers.length,
        data: providers,
        date: new Date(), 
      }),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      responseFormatter(500, "Internal Server Error", null, error.message),
      { status: 500 }
    );
  }
}
