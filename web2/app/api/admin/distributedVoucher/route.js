import { connectDB } from "../../utils/connectDB";
import Voucher from "../../models/Voucher";;
import { NextResponse } from "next/server";
import responseFormatter from "../../utils/responseFormatter";
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
    const vouchers = await Voucher.find();

    if (!vouchers || vouchers.length === 0) {
      return NextResponse.json(
        responseFormatter(404, "No vouchers found", null, null),
        { status: 404 }
      );
    }

    const data = vouchers
    return NextResponse.json(
      responseFormatter(200, "Vouchers fetched successfully", null, data),
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
