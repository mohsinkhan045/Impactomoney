/*
---------------------------------------------------
Project:        FundingProject
Date:           Oct 26, 2024
Author:         Faizan
---------------------------------------------------

Description:
Utility for Sending Emails
---------------------------------------------------
*/

import { createTransport } from 'nodemailer';

// Function to send email
const sendEmail = async (to, subject, text) => {
    const transporter = createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const mailOptions = {
        from: '"OTP Alert" <immuhammadfaizan@gmail.com>',
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error('Error sending email: ' + error.message);
    }
};

export default  sendEmail 
