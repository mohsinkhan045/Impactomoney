"use client";
import { useState } from "react";
import Image from "next/image"
import { IoIosArrowBack } from "react-icons/io";


const OtpVerificationForm = ({ setOtpVerified, email, setOtpLocal,handleBack }) => {
  console.log("Received email prop:", email);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!otp) {
      setMessage("OTP is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/forgetPassword/verifyOtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: otp.join("") }),
      });
      const result = await response.json();
      if (response.ok) {
        setOtpLocal(otp.join(""));
        setMessage("OTP verified successfully!");
        setOtpVerified(true);
      } else {
        setMessage(result.message || "Failed to verify OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setMessage("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, index) => {
    const { value } = e.target;

    if (isNaN(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1); // Only allow one character per box
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        document.getElementById(`otp-input-${index - 1}`).focus();
      }
      const newOtp = [...otp];
      newOtp[index] = ""; // Clear the current box
      setOtp(newOtp);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6); // Get only the first 6 characters
    const newOtp = [...otp];

    pastedData.split("").forEach((char, i) => {
      if (!isNaN(char) && i < 6) {
        newOtp[i] = char;
      }
    });

    setOtp(newOtp);

    // Move focus to the last filled box
    const lastIndex = pastedData.length - 1;
    if (lastIndex < 6) {
      document.getElementById(`otp-input-${lastIndex}`).focus();
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center bg-BgColor min-h-screen py-8">
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
      <div className="bg-white p-8 shadow-lg rounded-2xl w-full max-w-md">
        <button
              type="button"
              onClick={handleBack} // Call handleBack on click
              className=" text-gray-700 font-bold  transition duration-300"
            >
              <IoIosArrowBack size={28}/>
            </button>
           
          <div className="flex justify-center">
                <Image
                  src={"/bg-remove-logo.png"}
                  alt="impact to money logo"
                  width={150}
                  height={100}
                  priority={true}
                />
              </div>
          <h2 className="text-2xl font-semibold text-black text-center mb-6">Enter OTP</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center space-x-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`p-2 my-2 w-full border ${
                    message ? "border-red-500" : "border-gray-300"
                  } rounded-[10px] shadow-sm focus:ring-2 ${
                    message ? "focus:ring-red-500" : "focus:ring-blue-500"
                  }`}
                />
                
              ))}
              
            </div>
            {message && (
            <p className="mt-4 text-center text-sm text-red-500">{message}</p>
          )}
            <button
                    type="submit"
                    disabled={loading}
                    className={`w-full hover:bg-buttonHover text-white bg-BgColor font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    } flex justify-center items-center`}
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C6.477 0 0 6.477 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 2.137.835 4.084 2.207 5.493l1.793-1.202z"
                        ></path>
                      </svg>
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                  
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default OtpVerificationForm;
