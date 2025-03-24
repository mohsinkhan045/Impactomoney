import { connectDB } from "../../utils/connectDB";
import responseFormatter from "../../utils/responseFormatter";
import BeneficiaryDetails from "../../models/IssuedVoucherBeneficiary";
import User from "../../models/User";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    const { ids } = await req.json();

    // Ensure ids is an array
    const voucherIds = Array.isArray(ids) ? ids : [ids];

     // Update isTransfered in BeneficiaryDetails
     const updatedToken = await BeneficiaryDetails.updateMany(
      { _id: { $in: voucherIds } },
      { $set: { isTransfered: true } },
      { session }
    );

    // Update transferCount in User
    const updatedTokenCount = await User.updateMany(
      { _id: { $in: voucherIds } }, // Ensure this matches correct User model field
      { $inc: { transferCount: 1 } },
      { session }
    );

    if (updatedToken.modifiedCount === 0 && updatedTokenCount.modifiedCount === 0) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        responseFormatter(404, "No token found for the given IDs", null, null),
        { status: 404 }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json(
      responseFormatter(
        200,
        `Successfully marked ${updatedToken.modifiedCount} tokens as transferred and updated ${updatedTokenCount.modifiedCount} users.`,
        null,
        { updatedToken, updatedTokenCount }
      ),
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error marking voucher as minted:", error);
    return NextResponse.json(
      responseFormatter(500, "Internal Server Error", null, error.message),
      { status: 500 }
    );
  }
}
