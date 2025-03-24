import { NextResponse } from 'next/server';
import { connectDB } from '../../utils/connectDB';
import User from '../../models/User';
import responseFormatter from '../../utils/responseFormatter';
import sendEmail  from '../../utils/emailUtils'; // Import the email sending function

// Function to generate a random password
const generateRandomPassword = (length = 10) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};

export async function POST(req) {
    try {
        const payload = await req.json(); // Get the payload from the request
        await connectDB();

        // Apply map on the payload and save users in the database
        const userPromises = payload.map(async (data) => {
            const { name, email, role, cnic, voucherCategory, additionalInfo, wallet_address, subCategory, documents, picture, home, phone, city, country, religion, childrenPurpose } = data;

            const password = role === 'Beneficiary' ? generateRandomPassword() : undefined; // Generate random password for beneficiaries

            const userData = {
                name,
                email,
                password, // Set the generated password
                picture: Array.isArray(picture) ? picture[0] : picture,
                phone,
                home,
                city,
                country,
                role,
                cnic,
                voucherCategory,
                subCategory,
                voucherDetails: {},
                wallet_address,
                documents,
                religion,
                childrenPurpose,
                status :"approved"
            };

            // Add specific details based on role and voucher category
            if (role === 'Beneficiary') {
                if (voucherCategory === 'Education') {
                    userData.voucherDetails = {
                        university: additionalInfo.university,
                        cgpa: additionalInfo.cgpa,
                        purpose: additionalInfo.purpose,
                    };
                } else if (voucherCategory === 'Health') {
                    userData.voucherDetails = {
                        hospital: additionalInfo.hospital,
                        disease: additionalInfo.disease
                    };
                } else if (voucherCategory === 'Religion') {
                    userData.voucherDetails = {
                        religion: additionalInfo.religion
                    };
                } else if (voucherCategory === 'Children') {
                    userData.voucherDetails = {
                        age: additionalInfo.age,
                        guardian: additionalInfo.guardian,
                    };
                }
            }
            
            
            // Create an instance of the User model and save it
            const newUser = new User(userData);
            await newUser.save();
            
            // Send email with the password before saving the user
            if (password) {
                const subject = "Your Account Password";
                const text = `Hello ${name},\n\nYour account has been created. Your password is: ${password}\n\nPlease use this password to log in to your account.`;
                await sendEmail(email, subject, text); // Send the email
            }
        });

        // Wait for all user creation promises to resolve
        await Promise.all(userPromises);

        return NextResponse.json(
            responseFormatter(201, 'Users registered successfully!', null, null),
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            responseFormatter(500, 'Registration failed', error.message, null),
            { status: 500 }
        );
    }
}
