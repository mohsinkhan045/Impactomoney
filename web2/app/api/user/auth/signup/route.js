import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "../../../utils/connectDB";
import User from "../../../models/User";
import responseFormatter from "../../../utils/responseFormatter";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      cnic,
      voucherCategory,
      additionalInfo,
      wallet_address,
      subCategory,
      documents,
      picture,
      home,
      phone,
      city,
      country,
      religion,
      childrenPurpose,
      subReligionCategory,
      subEducationCategory,
    } = body;
    console.log(
      name,
      email,
      password,
      role,
      cnic,
      voucherCategory,
      additionalInfo,
      wallet_address,
      subCategory,
      documents,
      picture,
      home,
      phone,
      city,
      country,
      religion
    );
    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        responseFormatter(409, "Email already registered", null, null),
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      picture: Array.isArray(picture) ? picture[0] : picture,
      phone,
      home,
      city,
      country,
      password: hashedPassword,
      role,
      cnic,
      voucherCategory,
      subCategory,
      voucherDetails: {},
      wallet_address,
      documents,
      religion,
      childrenPurpose,
      subReligionCategory,
      subEducationCategory,
    };

    // Add specific details based on role and voucher category
    if (role === "Beneficiary") {
      if (voucherCategory === "Education") {
        if (subEducationCategory === "university") {
          userData.voucherDetails = {
            university: additionalInfo.university || "",
            cgpa: additionalInfo.cgpa || "",
            purpose: additionalInfo.purpose || "",
          };
        } else if (subEducationCategory === "college") {
          userData.voucherDetails = {
            college: additionalInfo.college || "",
            grades: additionalInfo.grades || "",
            purpose: additionalInfo.purpose || "",
          };
        } else if (subEducationCategory === "school") {
          userData.voucherDetails = {
            school: additionalInfo.school || "",
            grades: additionalInfo.grades || "",
            purpose: additionalInfo.purpose || "",
          };
        } else {
          // Handle unexpected subEducationCategory
          console.warn(
            "Unexpected subEducationCategory:",
            subEducationCategory
          );
          userData.voucherDetails = {};
        }
      } else if (voucherCategory === "Health") {
        userData.voucherDetails = {
          hospital: additionalInfo.hospital || "",
          disease: additionalInfo.disease || "",
          purpose: additionalInfo.purpose || "",
        };
      } else if (voucherCategory === "Children") {
        userData.voucherDetails = {
          age: additionalInfo.age || "",
          guardian: additionalInfo.guardian || "",
          purpose: additionalInfo.purpose || "",
        };
        userData.childrenPurpose = childrenPurpose || [];
      } else if (voucherCategory === "Religion") {
        userData.voucherDetails = {
          religion: additionalInfo.religion || "",
        };
      }
    } else if (role === "Provider") {
      userData.voucherDetails = {
        providerName: additionalInfo.providerName || "",
        city: additionalInfo.city || "",
        country: additionalInfo.country || "",
        subReligionCategory: subReligionCategory || "",
      };
    }
    // Create an instance of the User model
    const newUser = new User(userData);

    // Save the user in the database
    await newUser.save();

    return NextResponse.json(
      responseFormatter(201, "User registered successfully!", null, null),
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      responseFormatter(500, "Registration failed", error.message, null),
      { status: 500 }
    );
  }
}
