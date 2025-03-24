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
    const { purpose, category, institution, amount, currency, selectedCity, country,subReligionCategory } = await req.json();
    console.log(
      "API payload",
      category,
      purpose,
      institution,
      amount,
      currency,
      selectedCity,
      country
    );

    // Validate required fields
    if (!purpose && !category) {
      return NextResponse.json(
        responseFormatter(
          400,
          "Purpose and category are required fields.",
          null,
          null
        ),
        { status: 400 }
      );
    }

    // Initialize dynamic filters
    const filters = {
      role: "Provider",
      status: { $in: ["approved", "funded"] },
      city: selectedCity ? { $regex: new RegExp(`^${selectedCity.trim()}$`, 'i') } : undefined,
      country: country ? { $regex: new RegExp(`^${country.trim()}$`, 'i') } : undefined
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    // Adjust filters based on purpose and category
    switch (purpose) {
      case "Children":
        // For Children, show all approved providers
        filters["voucherDetails.providerName"] =
          institution && institution !== "All"
            ? institution
            : { $exists: true };
        break;

      case "Education":
        // For Education (Education)
        filters.voucherCategory = "Education";
        filters["voucherDetails.providerName"] =
          institution && institution !== "All"
            ? institution
            : { $exists: true };
        break;

      case "Healthcare":
        // For Healthcare (Health)
        filters.voucherCategory = "Health";
        filters["voucherDetails.providerName"] =
          institution && institution !== "All"
            ? institution
            : { $exists: true };
        break;
      case "Children":
        // For Healthcare (Health)
        filters.voucherCategory = "Children";
        filters["voucherDetails.providerName"] =
          institution && institution !== "All"
            ? institution
            : { $exists: true };
        break;

      case "Religious":
        // For Religious (Religion)
        filters.voucherCategory = "Religion";
        filters.subReligionCategory = subReligionCategory
        filters["voucherDetails.providerName"] =
          institution && institution !== "All"
            ? institution
            : { $exists: true };
        break;

      default:
        return NextResponse.json(
          responseFormatter(400, "Invalid purpose or category.", null, null),
          { status: 400 }
        );
    }

    console.log("Final Filters:", filters);

    // Fetch providers based on the filters
    const providers = await User.find(filters);

    if (!providers.length) {
      return NextResponse.json(
        responseFormatter(
          404,
          "No providers found with the specified criteria.",
          null,
          null
        ),
        { status: 404 }
      );
    }

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
