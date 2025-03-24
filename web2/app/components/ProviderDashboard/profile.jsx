/*
---------------------------------------------------
Project:        FundingProject
Date:           Dec 01, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file display Service provider profile component.
---------------------------------------------------
*/
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { IoIosEye, IoIosEyeOff, IoIosArrowBack } from "react-icons/io"; // Import eye and down icons
import Image from "next/image";
import Loading from "./loading";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion'; // For smooth animations

function Profile() {
  const router = useRouter();
  const [showWallet, setShowWallet] = useState(false); // State to toggle wallet address visibility
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [isEditing, setIsEditing] = useState(false); // Toggles edit mode
  // const [updatedData, setUpdatedData] = useState({}); // Stores updated form data

  const token = Cookies.get("authToken");

  const fetchServiceProvider = async () => {
    try {
      const response = await fetch("/api/serviceProvider", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch Provider details");
      }
      setUserData(data.data); // provider details set in state
      console.log(data.data)
    } catch (err) {
      setError(err.message);
      alert(error)
    } finally {
      setLoading(false);
    }
  };

  // Update profile API call
  // const updateProfile = async () => {
  //   try {
  //     const response = await fetch("/api/user/updateProfile", {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(updatedData), // Send updated data
  //     });

  //     const data = await response.json();
  //     if (!response.ok) {
  //       throw new Error(data.message || "Failed to update profile");
  //     }
  //     alert("Profile updated successfully!");
  //     setUserData({ ...userData, ...updatedData }); // Update state with new data
  //     setIsEditing(false); // Close edit modal
  //   } catch (err) {
  //     alert(`Error updating profile: ${err.message}`);
  //   }
  // };

  // Handle input changes in edit modal
  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setUpdatedData({ ...updatedData, [name]: value });
  // };

  useEffect(() => {
    fetchServiceProvider();
  }, []);

  // Loading or error rendering
  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  return (
    
      <div className="flex flex-col gap-4 md:gap-6 md:p-4 md:px-6 bg-gray-100 animate-fade-in">
         <motion.div
    className="flex flex-col w-full justify-center items-center min-h-screen py-8"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 1.2, delay: 0.5 }}
  >
        {/* Left Side - Profile Section */}
        <div className="flex flex-col items-center justify-center w-full bg-gradient-to-br from-blue-200 to-blue-50 rounded-xl py-4 md:p-6 shadow-lg">
          {/* Profile Picture */}
          <div className="w-24 h-24 md:w-28 md:h-28 overflow-hidden rounded-full border-4 border-blue-400 shadow-md">
            <Image
              src={userData.picture || "/profile.jpg"}
              alt="Profile Picture"
              width={112}
                height={112}
                className="object-cover h-full flex items-center"
            />
          </div>

          {/* Right Side - User Details */}
          <div className="mt-4 md:mt-6 flex flex-col justify-center md:w-2/3">
            {/* User Info */}
            <div className="py-1 w-full flex justify-between items-center">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800 transition-transform hover:scale-110">
                {userData.name}
              </h2>
            </div>
            {/* Details Section */}
            <div className="space-y-2 md:space-y-4 text-lg">
              <div className="flex flex-col md:flex-row  md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-40">Email:</span>
                <span className="text-gray-600">{userData.email}</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-40">
                  National ID:
                </span>
                <span className="text-gray-600">{userData.cnic}</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-40">
                 Wallet ID:
                </span>
                <span className="text-gray-600 text-sm md:text-base">{(userData.wallet_address).slice(0,20)}...</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-40">
                  Home Address:
                </span>
                <span className="text-gray-600 truncate">
                  {(userData.home).slice(0,24)}...
                </span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-40">
                  City:
                </span>
                <span className="text-gray-600 truncate">
                  {userData.city}
                </span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-40">
                  Country:
                </span>
                <span className="text-gray-600 truncate">
                  {userData.country}
                </span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-40">Phone:</span>
                <span className="text-gray-600">{userData.phone}</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-40">
                  Voucher Category:
                </span>
                <span className="text-gray-600">{userData.voucherCategory}</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-40">Role:</span>
                <span className="text-gray-600">{userData.role}</span>
              </div>
              
            </div>
          </div>
         
        </div>
        </motion.div>
      </div>
   
  );
}

export default Profile;
