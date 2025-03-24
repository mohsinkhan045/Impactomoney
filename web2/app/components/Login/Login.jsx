/*
---------------------------------------------------
Project:        FundingProject
Date:           Oct 18, 2024
Revised Date:   Oct 21, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file handles Login Function with forget password (otp,new password) functionality.
---------------------------------------------------
*/
"use client";
import { useState } from "react";
import LoginForm from "./LoginForm";
import RequestEmailForm from "./ForgotPassword/RequestEmailForm";
import OtpVerificationForm from "./ForgotPassword/OtpVerificationForm";
import ResetPasswordForm from "./ForgotPassword/ResetPasswordForm";
 
const Login = () => {
  const [forgotPasswordFlow, setForgotPasswordFlow] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [email, setEmailLocal] = useState("");
  const [otp, setOtpLocal] = useState(""); // New state to store the OTP

  const handleForgotPasswordClick = () => setForgotPasswordFlow(true);

  const handleBack = () => {
    if (otpVerified) {
      setOtpVerified(false); // Go back to OTP step
    } else if (otpSent) {
      setOtpSent(false); // Go back to email step
    } else {
      setForgotPasswordFlow(false); // Go back to login form
    }
  };

  const handlePasswordReset = () => {
    console.log("OTP and Email:", otp, email);
    setForgotPasswordFlow(false);
    setOtpSent(false);
    setOtpVerified(false);
  };

  return (
    <>
      {!forgotPasswordFlow ? (
        <LoginForm onForgotPassword={handleForgotPasswordClick} />
      ) : otpVerified ? (
        <ResetPasswordForm
          onPasswordReset={handlePasswordReset}
          email={email}
          otp={otp}
          handleBack={handleBack} // Pass handleBack
        /> // Pass OTP to ResetPasswordForm
      ) : otpSent ? (
        <OtpVerificationForm
        setOtpVerified={setOtpVerified} 
        email={email} 
        setOtpLocal={setOtpLocal}
        handleBack={handleBack} // Pass handleBack
        /> // Pass setOtp to OtpVerificationForm
      ) : (
        <RequestEmailForm
          setOtpSent={setOtpSent}
          setEmailLocal={setEmailLocal}
          handleBack={handleBack} // Pass handleBack
        />
      )}
    </>
  );
};

export default Login;
