import { connectDB } from "../../utils/connectDB";
import User from "../../models/User";
import responseFormatter from "../../utils/responseFormatter";
import { NextResponse } from "next/server";
import BeneficiaryDetails from "../../models/IssuedVoucherBeneficiary";
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
    return NextResponse.json(responseFormatter(401, auth.message, null, null), { status: 401 });
  }

  await connectDB();

  try {
    // Filter only where isMinted = true AND isTransfered = true
    const vouchers = await BeneficiaryDetails.find({
      isMinted: true,
      isTransfered:true
    });
    const { purpose, category, checkedItems, selectedCity, country, religion , amount} = await req.json();

    console.log("Received payload:", { purpose, category, selectedCity, country, religion, checkedItems, amount });

    // Validate required fields
    if (!purpose || typeof purpose !== "string") {
      return NextResponse.json(responseFormatter(400, "Purpose is required and must be a string", null, null), { status: 400 });
    }
    if (!category || typeof category !== "string") {
      return NextResponse.json(responseFormatter(400, "Category is required and must be a string", null, null), { status: 400 });
    }

    // Initialize dynamic filters
    const filters = {
      role: "Beneficiary",
      status: { $in: ["approved", "funded"] },
      issuedVoucher: false,
      city: selectedCity ? { $regex: new RegExp(`^${selectedCity.trim()}$`, "i") } : undefined,
      country: country ? { $regex: new RegExp(`^${country.trim()}$`, "i") } : undefined,
      religion: religion || undefined,
      subCategory: category,
      childrenPurpose: checkedItems && Array.isArray(checkedItems) && checkedItems.length > 0 ? { $in: checkedItems } : undefined,
    };

    // Remove undefined filters
    Object.keys(filters).forEach((key) => filters[key] === undefined && delete filters[key]);

    console.log(amount)
    // Fetch beneficiaries based on the filters
    const beneficiaries = await User.find(filters);
    console.log("Filtered Beneficiaries:", beneficiaries);
    const totalBeneficiaries = beneficiaries.length;
    const perBeneficiaryAmount = parseInt(amount) / totalBeneficiaries;
    console.log(`Total beneficiaries: ${totalBeneficiaries}`);
    console.log(`Divided amount per beneficiary: ${perBeneficiaryAmount}`);
    if (!beneficiaries.length) {
      return NextResponse.json(responseFormatter(404, "No beneficiaries found with the specified criteria.", null, null), { status: 404 });
    }

    return NextResponse.json(responseFormatter(200, "Beneficiaries filtered successfully", null,  {vouchers,beneficiaries,totalBeneficiaries,perBeneficiaryAmount} ), { status: 200 });
  } catch (error) {
    console.error("Error processing beneficiaries:", error);
    return NextResponse.json(responseFormatter(500, "Internal Server Error", null, error.message), { status: 500 });
  }
}
