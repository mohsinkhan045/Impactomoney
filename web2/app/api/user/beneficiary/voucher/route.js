import { connectDB } from "../../../utils/connectDB";
import Voucher from "../../../models/Voucher";
import { NextResponse } from "next/server";
import responseFormatter from "../../../utils/responseFormatter";
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

export async function PATCH(req) {
  const auth = await authenticateToken(req);
  if (!auth.isValid) {
    return NextResponse.json(responseFormatter(401, auth.message, null, null), {
      status: 401,
    });
  }

  await connectDB();

  try {
    const { voucherId } = await req.json(); // Extract voucherId from request body

    if (!voucherId) {
      return NextResponse.json(
        responseFormatter(400, "Voucher ID is required", null, null),
        { status: 400 }
      );
    }

    // Find the voucher by voucherId
    const voucher = await Voucher.findOne({ voucherId });

    if (!voucher) {
      return NextResponse.json(
        responseFormatter(404, "Voucher not found", null, null),
        { status: 404 }
      );
    }

    // Toggle the `revoked` status
    voucher.revoked = !voucher.revoked;
    await voucher.save();

    return NextResponse.json(
      responseFormatter(200, "Voucher updated successfully", null, { revoked: voucher.revoked }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating voucher:", error);
    return NextResponse.json(
      responseFormatter(500, "Internal server error", null, error.message),
      { status: 500 }
    );
  }
}
