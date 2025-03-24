import { connectDB } from "../../utils/connectDB";
import responseFormatter from "../../utils/responseFormatter";
import BeneficiaryDetails from "../../models/IssuedVoucherBeneficiary";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const { ids } = await req.json();

    // Ensure ids is an array
    const voucherIds = Array.isArray(ids) ? ids : [ids];

    const updatedVoucher = await BeneficiaryDetails.updateMany(
      { _id: { $in: voucherIds } },
      { $set: { isMinted: true } }
    );

    if (updatedVoucher.modifiedCount === 0) {
      return NextResponse.json(
        responseFormatter(404, "No vouchers found for the given IDs", null, null),
        { status: 404 }
      );
    }

    return NextResponse.json(
      responseFormatter(
        200,
        `Successfully marked ${updatedVoucher.modifiedCount} vouchers as minted`,
        null,
        updatedVoucher
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking voucher as minted:", error);
    return NextResponse.json(
      responseFormatter(500, "Internal Server Error", null, error.message),
      { status: 500 }
    );
  }
}
