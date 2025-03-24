"use client";
import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import Image from "next/image";

const RequestEmailForm = ({ setOtpSent, setEmailLocal, handleBack }) => {
  const [email, setEmail] = useState(""); // Local email state for the form
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // Email regex for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email) {
      setMessage("Email is required.");
      setLoading(false);
      return;
    }

    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/forgetPassword/sendOtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      console.log(result);
      if (response.ok) {
        setMessage("OTP has been sent to your email!");
        setEmailLocal(email); // Set email in the parent component state
        setOtpSent(true);
      } else {
        setMessage(result.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setMessage("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Clear error message if the input becomes valid
    if (emailRegex.test(value)) {
      setMessage(""); // Clear the error message
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center bg-BgColor min-h-screen ">
      <div className="w-full flex items-center justify-center ">
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
                <h2 className="text-2xl font-semibold text-center mb-6">
                  Forget Password
                </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={handleInputChange}
                className={`p-2 my-2 w-full border ${
                  message ? "border-red-500" : "border-gray-300"
                } rounded-[10px] shadow-sm focus:ring-2 ${
                  message ? "focus:ring-red-500" : "focus:ring-blue-500"
                }`}
              />
              {message && (
                <p className="text-red-500 text-xs italic">{message}</p>
              )}
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
                  className="animate-spin h-5 w-5 mr-2 text-white text-center"
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
                "Send OTP"
              )}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestEmailForm;
