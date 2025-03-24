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

export async function POST(req) {
  const auth = await authenticateToken(req);
  if (!auth.isValid) {
    return NextResponse.json(responseFormatter(401, auth.message, null, null), {
      status: 401,
    });
  }

  await connectDB();

  try {
    const {
      purpose,
      category,
      checkedItems,
      institution,
      studentStatus,
      amount,
      currency,
      selectedCity,
      country,
      religion,
      validity,
      startDate,
      subEducationCategory,
    } = await req.json();

    console.log("Received payload:", {
      purpose,
      category,
      amount,
      currency,
      selectedCity,
      country,
      religion,
      checkedItems,
      institution,
      studentStatus,
      validity,
      startDate,
    });

    // Validate required fields and their types
    if (!purpose || typeof purpose !== "string") {
      return NextResponse.json(
        responseFormatter(
          400,
          "Purpose is required and must be a string",
          null,
          null
        ),
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string") {
      return NextResponse.json(
        responseFormatter(
          400,
          "Category is required and must be a string",
          null,
          null
        ),
        { status: 400 }
      );
    }

    if (!amount) {
      return NextResponse.json(
        responseFormatter(
          400,
          "Amount is required and must be a valid number",
          null,
          null
        ),
        { status: 400 }
      );
    }

    // Handle currency validation
    // if (typeof currency === 'string') {
    //   // If currency is already a number (0-3), use it directly
    //   if (currency >= 0 && currency <= 3) {
    //     currencyCode = currency;
    //   } else {
    //     return NextResponse.json(
    //       responseFormatter(400, "Invalid currency code. Must be between 0 and 3.", null, null),
    //       { status: 400 }
    //     );
    //   }
    // } else if (typeof currency === 'string') {
    //   // If currency is a string, map it as before
    // let currencyCode;
    //   switch (currency) {
    //     case "AECoin":
    //       currencyCode = 0;
    //       break;
    //     case "PYUSD":
    //       currencyCode = 1;
    //       break;
    //     case "USDT":
    //       currencyCode = 2;
    //       break;
    //     case "USDC":
    //       currencyCode = 3;
    //       break;
    //     default:
    //       return NextResponse.json(
    //         responseFormatter(400, "Invalid currency provided.", null, null),
    //         { status: 400 }
    //       );
    //   }

    // Initialize dynamic filters
    const filters = {
      role: "Beneficiary",
      status: { $in: ["approved", "funded"] },
      issuedVoucher: false,
      city: selectedCity
        ? { $regex: new RegExp(`^${selectedCity.trim()}$`, "i") }
        : undefined,
      country: country
        ? { $regex: new RegExp(`^${country.trim()}$`, "i") }
        : undefined,
      religion: religion,
      subCategory: category,
      subEducationCategory: subEducationCategory,
      childrenPurpose:
        checkedItems && Array.isArray(checkedItems) && checkedItems.length > 0
          ? { $in: checkedItems }
          : undefined,
    };
    // Remove undefined filters
    Object.keys(filters).forEach(
      (key) => filters[key] === undefined && delete filters[key]
    );

    // else if (purpose === "Religious") {
    //   // Religion-specific logic
    //   filters.voucherCategory = category;
    //   if (religion) {
    //     filters["voucherDetails.religion"] = religion;
    //   }
    // }

    // Non-Children logic
    if (purpose === "Education") {
      // Apply university, college, or school filter based on subEducationCategory
      if (subEducationCategory === "University") {
        filters["voucherDetails.university"] =
          institution && institution !== "All"
            ? institution
            : { $exists: true };
        // Apply student status filters if needed
        if (studentStatus === "High") {
          filters["voucherDetails.cgpa"] = { $gte: 3.5 };
        } else if (studentStatus === "Poor") {
          filters["voucherDetails.cgpa"] = { $lte: 2.0 };
        }
      } else if (subEducationCategory === "College") {
        filters["voucherDetails.college"] =
          institution && institution !== "All"
            ? institution
            : { $exists: true };
      } else if (subEducationCategory === "School") {
        filters["voucherDetails.school"] =
          institution && institution !== "All"
            ? institution
            : { $exists: true };
      }
    } else if (purpose === "Healthcare") {
      filters["voucherDetails.hospital"] =
        institution && institution !== "All" ? institution : { $exists: true };
    } else if (purpose === "Religion") {
      filters["voucherDetails.religion"] =
        institution && institution !== "All" ? institution : { $exists: true };
    }

    // Fetch beneficiaries based on the filters
    const beneficiaries = await User.find(filters);
    console.log("Filtered Beneficiaries", beneficiaries);
    if (!beneficiaries.length) {
      return NextResponse.json(
        responseFormatter(
          404,
          "No beneficiaries found with the specified criteria.",
          null,
          null
        ),
        { status: 404 }
      );
    }

    // Calculate the divided amount
    const totalBeneficiaries = beneficiaries.length;
    const perBeneficiaryAmount = amount / totalBeneficiaries;
    console.log(`Total beneficiaries: ${totalBeneficiaries}`);
    console.log(`Divided amount per beneficiary: ${perBeneficiaryAmount}`);

    // Step 1: Define a mapping of purposes to their respective IPFS hashes
    const purposeToIpfsHashMap = {
      Education: "bafkreiez3k37mw7utcnjbhq7uooywkmkj3pvn3cydrmjtd342sjb3wyhne", //hash for education
      children: "bafkreiemow5odrwbq5v63snapzgfnkejtslg5zxlxj74cinclbsia3eoay", //hash for children
      healthcare: "bafkreihuv56uwtxgd22fduiya5tju563yc2hailhnrfjyqtm3r6s7xayoe", //hash for healthcare
      // Add more purposes as needed in the future
    };
    // Function to get the IPFS hash based on the purpose
    function getIpfsHashForPurpose(purpose) {
      return purposeToIpfsHashMap[purpose.toLowerCase()] || null; // Ensure case insensitivity
    }

    const IpfsHash = getIpfsHashForPurpose(purpose);

    // Get the image URL from pinata
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
    console.log(imageUrl);

    // Now create metadata
    const metadata = {
      voucher_name: `${purpose} Voucher`,
      voucher_issuer: "ImpacttoMoney",
      voucher_type: `${purpose}`,
      category: `${category}`,
      purpose: `${purpose}`,
      metaDataUrl: imageUrl,
      amount: perBeneficiaryAmount,
      currency: currency,
      validity: validity,
      startDate: startDate,
    };
    console.log("MetaData ", metadata);

    // Generate a unique NFT ID for the batch
    const nftId = `NFT-${Date.now()}`; // Example: "NFT-1698765432100"
    console.log("Random ID", nftId);
    // Map beneficiaries and prepare for saving
    const filteredBeneficiaries = beneficiaries.map((beneficiary) => ({
      picture: beneficiary.picture || "https://via.placeholder.com",
      name: beneficiary.name || "",
      email: beneficiary.email || "",
      cnic: beneficiary.cnic || "",
      voucherCategory: beneficiary.voucherCategory || "",
      voucherDetails: beneficiary.voucherDetails || {},
      wallet_address: beneficiary.wallet_address || "",
      phone: beneficiary.phone || "",
      home: beneficiary.home || "Unknown Address",
      city: beneficiary.city || "",
      country: beneficiary.country || "",
      status: beneficiary.status || "unknown",
      voucherId: nftId,
      amount: perBeneficiaryAmount || 0,
      currency: currency,
      metadata: metadata,
      religion: religion,
      subEducationCategory: beneficiary.subEducationCategory,
      checkItems: beneficiary.childrenPurpose || [],
    }));

    console.log(
      "Filtered Beneficiaries:",
      JSON.stringify(filteredBeneficiaries, null, 2)
    );

    const saveResults = [];

    for (const beneficiaryData of filteredBeneficiaries) {
      console.log("beneficiary data", beneficiaryData);
      const beneficiary = new BeneficiaryDetails({
        ...beneficiaryData,
      }); // Create a new instance
      console.log("added amount field", beneficiary);
      try {
        console.log("Beneficiary details before saving ", beneficiaryData);
        const validStatuses = ["approved", "funded", "voucherIssued"];
        if (!validStatuses.includes(beneficiaryData.status)) {
          throw new Error(`Invalid status: ${beneficiaryData.status}`);
        }
        const savedBeneficiary = await beneficiary.save(); // Save beneficiary to the database
        console.log("Beneficiary saved:", savedBeneficiary);
        // const result = await BeneficiaryDetails.findOne({ voucherId: nftId });
        // console.log("Queried beneficiary by voucherId:", result);
        saveResults.push(savedBeneficiary);
      } catch (error) {
        console.error(
          "Error saving beneficiary:",
          error.message,
          "Data:",
          beneficiaryData
        );
        saveResults.push({
          success: false,
          error: error.message,
          data: beneficiaryData,
        });
      }
    }

    return NextResponse.json(
      responseFormatter(
        200,
        "Beneficiaries fetched and saved successfully",
        null,
        {
          matchedCount: beneficiaries.length,
          totalAmount: amount,
          perBeneficiaryAmount,
          saveResults,
          date: new Date(),
        }
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing beneficiaries:", error);
    return NextResponse.json(
      responseFormatter(500, "Internal Server Error", null, error.message),
      { status: 500 }
    );
  }
}
