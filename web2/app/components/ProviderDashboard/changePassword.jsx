/*
---------------------------------------------------
Project:        FundingProject
Date:           Dec 01, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file handles the change password.
---------------------------------------------------
*/
"use client";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Import eye icons
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Loading from "./loading";
import { motion } from 'framer-motion'; // For smooth animations

function ChangePassword() {
  const [loading, setLoading] = useState(false);
  const [adminData, setAdminData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const token = Cookies.get("authToken"); // Get token from cookies
  const router = useRouter();

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility({
      ...passwordVisibility,
      [field]: !passwordVisibility[field],
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true)
    if (adminData.newPassword !== adminData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("/api/admin/changePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the token from cookies
        },
        body: JSON.stringify(adminData),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Password changed successfully");
        setAdminData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setLoading(false)
        // router.push("/service-provider/profile")
        console.log(data);
      }
      // else {
      //   alert(data.message);
      //   setMessage(data.message);
      // }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    }
  };

  return (
    <motion.div
className="flex flex-col w-full justify-center items-center min-h-screen py-8"
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
transition={{ duration: 1.2, delay: 0.5 }}
>
  
      <div className="p-5 w-full max-w-lg flex justify-center  bg-gradient-to-br from-white via-blue-100 to-gray-50 rounded-xl mt-3 border shadow-md border-gray-300">
        <div className="mt-8 space-y-6">
          <h2 className="text-3xl font-extrabold text-BgColor mb-6 text-center">
            Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={
                    passwordVisibility.currentPassword ? "text" : "password"
                  }
                  value={adminData.currentPassword}
                  onChange={(e) =>
                    setAdminData({
                      ...adminData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full p-4 border border-gray-300 rounded-3xl focus:border-blue-600 outline-none transition duration-200"
                   placeholder="Current Password"
                />
                <span
                  className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-800"
                  onClick={() => togglePasswordVisibility("currentPassword")}
                >
                  {passwordVisibility.currentPassword? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                </span>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisibility.newPassword ? "text" : "password"}
                  value={adminData.newPassword}
                  onChange={(e) =>
                    setAdminData({ ...adminData, newPassword: e.target.value })
                  }
                  className="w-full p-4 border border-gray-300 rounded-3xl focus:border-blue-600 outline-none transition duration-200"
                  placeholder="New Password"
                />
                <span
                  className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-800"
                  onClick={() => togglePasswordVisibility("newPassword")}
                >
                  {passwordVisibility.newPassword ? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                </span>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={
                    passwordVisibility.confirmPassword ? "text" : "password"
                  }
                  value={adminData.confirmPassword}
                  onChange={(e) =>
                    setAdminData({
                      ...adminData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full p-4 border border-gray-300 rounded-3xl focus:border-blue-600 outline-none transition duration-200"
                  placeholder="Confirm New Password"
                />
                <span
                  className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-800"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                >
                  {passwordVisibility.confirmPassword? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white p-4 rounded-3xl hover:bg-blue-700 ${loading 
                ? <div><Loading /></div>
                : "bg-BgColor text-white hover:bg-buttonHover focus:ring-4 focus:ring-blue-300"
              }`}>
              Change Password
            </button>
          </form>

          {/* Success/Error Message */}
          {/* {message && (
          <p className="mt-4 text-center text-sm text-red-500">{message}</p>
        )} */}
        </div>
      </div>
        </motion.div>
    
  );
}

export default ChangePassword;
