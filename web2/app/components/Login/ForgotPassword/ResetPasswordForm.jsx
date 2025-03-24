"use client";
import { IoIosArrowBack } from "react-icons/io";
import { useState } from "react";
import Image from "next/image"


const ResetPasswordForm = ({ onPasswordReset, email, otp, setOtp,handleBack }) => {
  console.log("Receiving email and otp:", email, setOtp);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!newPassword) {
      setMessage("New password is required.");
      setLoading(false);
      return;
    }

    // Log the data being sent to the backend
    console.log("Reset Password Request Data:", { email, code: otp, newPassword });  // otp is used here

    try {
      const response = await fetch("/api/user/forgetPassword/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code:  otp, newPassword }),  // otp is used here
      });

      const result = await response.json();
      console.log("Response from Reset Password API:", result);

      if (response.ok) {
        setMessage("Password reset successfully!");
        setTimeout(() => {
          onPasswordReset(); // Trigger parent function to reset flow
        }, 2000);
      } else {
        setMessage(result.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center bg-BgColor min-h-screen py-8">
      {/* <div
        className="w-1/2 hidden md:block bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://i.pinimg.com/564x/5e/5f/92/5e5f923d06edf09e1d01285e2a8090f3.jpg')",
        }}
      ></div> */}

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
          <h2 className="text-2xl font-semibold text-center mb-6">Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`p-2 my-2 w-full border ${
                  message ? "border-red-500" : "border-gray-300"
                } rounded-[10px] shadow-sm focus:ring-2 ${
                  message ? "focus:ring-red-500" : "focus:ring-blue-500"
                }`}
                required
                
              />
              {message && <p className="text-red-500 text-xs italic">{message}</p>}
            </div>
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
                      "Reset Password"
                    )}
                  </button>
                
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
