"use client";

import axios from "axios";
// import { RiLoginCircleFill } from "react-icons/ri";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { AiOutlineEye } from "react-icons/ai"; // Import eye icons
import { AiOutlineEyeInvisible } from "react-icons/ai"; // Import eye icons
import Cookies from "js-cookie"; // Import js-cookie
import dynamic from "next/dynamic";

const RiLoginCircleFill = dynamic(() =>
  import("react-icons/ri").then((mod) => mod.RiLoginCircleFill)
);
const LoginForm = ({ onForgotPassword }) => {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleInputChange = (field, value) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
  
    // Validate inputs and update error messages dynamically
    if (field === "email") {
      if (!emailRegex.test(value)) {
        setMessage("Please enter a valid email.");
      } else {
        setMessage("");
      }
    }
  
    if (field === "password") {
      if (!value) {
        setPasswordError("Password is required");
      } else if (value.length < 6) {
        setPasswordError("Password must be at least 6 characters.");
      } else {
        setPasswordError("");
      }
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!credentials.email || !emailRegex.test(credentials.email)) {
      setMessage("Please enter a valid email.");
      setLoading(false);
      return;
    }
    if (!credentials.password) {
      setPasswordError("Password is required");
      setLoading(false);
      return;
    }
    if (credentials.password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }


    try {
      const res = await axios.post("/api/user/auth/login", credentials, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = res.data;

      if (res.status === 200) {
        const token = data.data.token;
        const userData = data.data.user || data.data.admin;
        // const userRole = data.data.user.role
        // Cookies.set("Role", userRole)
        Cookies.set("authToken", token, { expires: 1 });

        const role = userData.role;
        if (role === "Beneficiary") {
          router.push("/beneficiary");
        } else if (role === "Provider") {
          router.push("/serviceProvider");
        } else if (role === "Admin") {
          router.push("/admin");
        } else {
          console.log("User role not found");
        }
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Email or Password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex  w-full justify-center items-center bg-BgColor h-screen py-8">
      <div
        className="flex flex-col w-full max-w-lg items-center justify-center px-4"
        // style={{
        //   backgroundImage:
        //     "url('https://i.pinimg.com/564x/5e/5f/92/5e5f923d06edf09e1d01285e2a8090f3.jpg')",
        // }}
      >
        <motion.div
          className="bg-white shadow-xl rounded-2xl p-3 w-full max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full flex items-center justify-center mb-3 p-5">
            <div className="w-full max-w-md">
              <div className="flex justify-center items-center flex-col">
                <Image
                  src={"/bg-remove-logo.png"}
                  alt="impact to money logo"
                  width={100}
                  height={0}
                  priority={true}
                />
                <h2 className="text-2xl text-BgColor font-semibold text-center">
                  Let's Get In
                </h2>
                <h2 className="text-3xl text-black font-bold text-center mb-6 flex gap-x-4 items-center justify-center">
                  Login To Your Account
                  <RiLoginCircleFill />
                </h2>
              </div>
              <form
                onSubmit={handleLogin}
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
              >
                <div className="mb-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
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
                <div className="relative">
                <div className="mb-6">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={credentials.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`p-2 my-2 w-full border ${
                      passwordError ? "border-red-500" : "border-gray-300"
                    } rounded-[10px] shadow-sm focus:ring-2 ${
                      passwordError
                        ? "focus:ring-red-500"
                        : "focus:ring-blue-500"
                    }`}
                    
                  />
                  
                  {passwordError && (
                    <p className="text-red-500 text-xs italic">
                      {passwordError}
                    </p>
                  )}
                  <span
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                  </span>
                  
                </div>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center justify-center hover:bg-buttonHover text-white bg-BgColor font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
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
                      "Login"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="inline-block align-baseline font-bold text-sm text-[#183063] hover:text-BgColor"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>

              <div className="text-center mt-3">
                <Link href="/register" className="text-BgColor underline ml-2">
                  Register
                </Link>
                <span className="mx-2">|</span>
                <Link href="/contributor" className="text-BgColor underline">
                  Contributor
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;
