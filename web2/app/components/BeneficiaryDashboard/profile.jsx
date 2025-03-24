/*
---------------------------------------------------
Project:        FundingProject
Date:           Dec 01, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file display Beneficiary profile component.
---------------------------------------------------
*/
"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { IoIosArrowBack } from "react-icons/io";
import Image from "next/image";
import { motion } from 'framer-motion'; // For smooth animations

import { useRouter } from "next/navigation";
import Loading from "../ProviderDashboard/loading";
import { IoIosEye, IoIosEyeOff } from "react-icons/io"; // Make sure to import these icons if you're using them.

function BeneficiaryProfile() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  // const [isEditing, setIsEditing] = useState(false); // Toggles edit mode
  // const [updatedData, setUpdatedData] = useState({}); // Stores updated form data

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setUpdatedData((prev) => ({ ...prev, [name]: value }));
  // };

  const authToken = Cookies.get("authToken");
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!authToken) {
          setError("Unauthorized. Please log in.");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/beneficiary", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data. Please try again.");
        }

        const data = await response.json();
        setUserData(data.data);
        console.log(data.data)
      } catch (err) {
        setError(err.message || "Error loading data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Ensure this dependency array is empty to avoid infinite renders.

  // Loading or error rendering
  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!userData) {
    return <p>No data available</p>;
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
        <div className="flex flex-col items-center justify-center w-full bg-gradient-to-br from-blue-200 to-blue-50 rounded-xl py-4 md:p-6 shadow-lg ">
          {/* Profile Picture */}
          <div className="flex justify-center items-center h-full">
            <div className="w-24 h-24 md:w-28 md:h-28 overflow-hidden rounded-full border-4 border-blue-400 shadow-md">
              <Image
                src={userData.picture || "/profile.jpg"}
                alt="Profile Picture"
                width={112}
                height={112}
                className="object-cover h-full flex items-center"
              />
            </div>
          </div>

          {/* Right Side - User Details */}
          <div className="mt-4 md:mt-6 flex flex-col justify-center md:w-2/3">
            {/* User Info */}
            <div className="py-1 w-full flex flex-col md:flex-row gap-2 md:justify-between justify-center items-center">
              <h2 className="text-xl md:text-3xl font-bold text-gray-800 transition-transform hover:scale-110">
                {userData.name}
              </h2>
              {/* <div className="items-center">
                <span className="text-gray-800">
                  {showWallet
                    ? userData.wallet_address
                    : "***************"}
                </span>
                <button
                  onClick={() => setShowWallet(!showWallet)}
                  className="ml-2 text-black"
                >
                  {showWallet ? (
                    <IoIosEyeOff size={20} />
                  ) : (
                    <IoIosEye size={20} />
                  )}
                </button>
              </div> */}
            </div>
            {/* Details Section */}
            <div className="space-y-2 md:space-y-4 text-lg">
              <div className="flex flex-col md:flex-row  md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-full md:w-40">Email:</span>
                <span className="text-gray-600">{userData.email}</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-full md:w-40">National ID:</span>
                <span className="text-gray-600">{userData.cnic}</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-full md:w-40">Wallet ID:</span>
                <span className="text-gray-600 text-sm md:text-base">{(userData.wallet_address).slice(0,20)}...</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-full md:w-40">Home Address:</span>
                <span className="text-gray-600 truncate">{userData.home}</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-full md:w-40">City:</span>
                <span className="text-gray-600 truncate">{userData.city}</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-full md:w-40">Country:</span>
                <span className="text-gray-600 truncate">{userData.country}</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-full md:w-40">Phone Number:</span>
                <span className="text-gray-600 truncate">{userData.phone}</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-full md:w-40">Category:</span>
                <span className="text-gray-600">{userData.voucherCategory}</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                <span className="font-medium text-gray-700 w-full md:w-40">Role:</span>
                <span className="text-gray-600">{userData.role}</span>
              </div>
            </div>

            {/* Actions Section */}
            {/* <div className="mt-6 text-left">
              <button
                onClick={() => {
                  console.log("Setting editing mode to true");
                  setIsEditing(true);
                }}
                className="px-6 py-2 bg-BgColor text-white font-medium rounded-xl shadow-md hover:bg-buttonHover hover:scale-105 transition duration-300 "
              >
                Edit Profile
              </button>
            </div> */}
            {/* Edit Modal */}
            {/* {isEditing && (
              
                <Dialog
                  open={isEditing}
                  onOpenChange={() => setIsEditing(true)}
                  // className="fixed inset-0 z-50 flex justify-center items-center"
                >
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        Edit Profile {console.log(isEditing)}
                      </DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when
                        you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {[ 
                        "name", 
                        "email", 
                        "cnic", 
                        "home", 
                        "phone", 
                        "voucherCategory", 
                      ].map((field) => (
                        <div key={field}>
                          <Label className="block font-medium text-gray-700 capitalize">
                            {field}:
                          </Label>
                          <Input
                            id={field}
                            name={field}
                            value={updatedData[field] || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                    <DialogFooter>
                      <Button type="button" onClick={updateProfile}>
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              
            )} */}
          </div>
        </div>
        </motion.div>
      </div>
    
  );
}

export default BeneficiaryProfile;
