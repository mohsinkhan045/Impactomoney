/*
---------------------------------------------------
Project:        FundingProject
Date:           Nov 28, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file handles basic registration details.
---------------------------------------------------
*/
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BasicSignupSchema } from "../../../schema/basicSchema";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Import eye icons

function BasicDetails({ nextStep, updateFormData }) {
  const [error, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
  const [localData, setLocalFormData] = useState({
    name: "",
    email: "",
    password: "",
    // confirmpassword: "",
    cnic: "",
    phone: "",
    home: "",
    city:"",
    country:"",
    picture: "",
  });
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false); // State for image upload status
  const [showAlert, setShowAlert] = useState(false); // State for alert dialog

  // Load form data from sessionStorage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem("basicDetailsForm");
    if (savedData) {
      setLocalFormData(JSON.parse(savedData));
    }
  }, []);

  const handleFileUpload = async (e) => {
    const files = e.target.files; // Multiple files selected
    const uploadedUrls = [];
    setIsUploadingImage(true); // Set uploading state to true

    for (let i = 0; i < files.length; i++) {
      const localData = new FormData();
      localData.append("file", files[i]);
      localData.append("upload_preset", "cloudinary-doc-upload"); // Cloudinary preset
      localData.append("cloud_name", `${process.env.NEXT_PUBLIC_CLOUD_NAME}`); // Replace with your Cloudinary cloud name

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: localData,
          }
        );

        const data = await response.json();
        uploadedUrls.push(data.secure_url); // Collect uploaded file URLs
      } catch (error) {
        console.error(`Error uploading file ${files[i].name}:`, error);
      }
    }

    // Update form data with file URLs
    setLocalFormData((prevData) => ({
      ...prevData,
      picture: uploadedUrls, // Add uploaded URLs to localData
    }));

    if (uploadedUrls.length > 0) {
      setIsImageUploaded(true); // Set to true if upload is successful
    } else {
      setIsImageUploaded(false); // Set to false if upload fails
    }
    
    setIsUploadingImage(false); // Set uploading state to false
  };

  // Update sessionStorage whenever the form data changes
  useEffect(() => {
    sessionStorage.setItem("basicDetailsForm", JSON.stringify(localData));
  }, [localData]);
  
  // Real-time Validation
  const validateField = (name, value) => {
    const result = BasicSignupSchema.safeParse({ ...localData, [name]: value });
    if (!result.success) {
      const fieldError = result.error.flatten().fieldErrors[name];
      setErrors((prev) => ({ ...prev, [name]: fieldError ? fieldError[0] : "" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name,value);
    updateFormData(localData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");

    // Step 1: Check if passwords match
    if (localData.password !== localData.confirmpassword) {
      setPasswordError("Passwords do not match!");
      return;
    }
    const result = BasicSignupSchema.safeParse(localData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors); // Update errors state with all validation errors
      return;
    }

    // Show success alert
    setShowAlert(true);
    // Proceed to the next step
    console.log("Form is valid:", result.data);
    updateFormData(result.data);
  };

  const handleContinue = () => {
    setShowAlert(false); // Close the alert
    nextStep(); // Proceed to the next step
  };

  return (
    <div className="flex flex-col w-full justify-center items-center bg-BgColor min-h-screen py-8">
      <motion.div
        className="flex flex-col w-full justify-center items-center bg-BgColor min-h-screen py-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 1.2, delay: 0.5 }}
      >
      <div className="grid md:grid-cols-1  max-w-[7xl] px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
          <div className="flex justify-center flex-col items-center mb-4">
            <Image
              src={"/bg-remove-logo.png"}
              alt="impact to money logo"
              width={200}
              height={0}
            />
            <h1 className="text-3xl  text-black font-bold text-center">
              Let's Get Started
            </h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name and Email Fields */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter name"
                  className={`p-3 my-2 w-full border ${
                    error?.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } rounded-[10px] shadow-sm focus:ring-2`}
                  value={localData.name}
                  onChange={handleChange}
                  required
                />
                {error?.name && (
                  <div className="text-red-500 text-sm">{error.name}</div>
                )}
              </div>
              <div className="w-full">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter email"
                  className={`p-3 my-2 w-full border ${
                    error?.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } rounded-[10px] shadow-sm focus:ring-2`}
                  value={localData.email}
                  onChange={handleChange}
                  required
                />
                {error?.email && (
                  <div className="text-red-500 text-sm">{error.email}</div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* National ID */}
              <div className="w-full">
                <label
                  htmlFor="cnic"
                  className="block text-sm font-medium text-gray-700"
                >
                  National ID<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cnic"
                  name="cnic"
                  placeholder="Enter National ID without dashes"
                  className={`p-3 my-2 w-full border ${
                    error?.cnic ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } rounded-[10px] shadow-sm focus:ring-2`}
                  value={localData.cnic}
                  onChange={handleChange}
                  required
                />
                {error?.cnic && (
                  <div className="text-red-500 text-sm">{error.cnic}</div>
                )}
              </div>
              {/* Phone Number */}
              <div className="w-full">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="Enter Phone Number"
                  className={`p-3 my-2 w-full border ${
                    error?.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } rounded-[10px] shadow-sm focus:ring-2`}
                  value={localData.phone}
                  onChange={handleChange}
                  required
                />
                {error?.phone && (
                  <div className="text-red-500 text-sm">
                    {error.phone}
                  </div>
                )}
              </div>
              {/* Home Address*/}
              <div className="w-full">
                <label
                  htmlFor="home"
                  className="block text-sm font-medium text-gray-700"
                >
                  Home Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="home"
                  name="home"
                  placeholder="Enter Home Address"
                  className={`p-3 my-2 w-full border ${
                    error?.home ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } rounded-[10px] shadow-sm focus:ring-2`}
                  value={localData.home}
                  onChange={handleChange}
                  required
                />
                {error?.home && (
                  <div className="text-red-500 text-sm">
                    {error.home}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full">
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter City Name"
                      className={`p-3 my-2 w-full border ${
                        error?.city
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      } rounded-[10px] shadow-sm focus:ring-2`}
                      value={localData.city}
                      onChange={handleChange}
                      required
                    />
                    {error?.city && (
                      <div className="text-red-500 text-sm">
                        {error.city}
                      </div>
                    )}
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      placeholder="Enter Country Name"
                      className={`p-3 my-2 w-full border ${
                        error?.country
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      } rounded-[10px] shadow-sm focus:ring-2`}
                      value={localData.country}
                      onChange={handleChange}
                      required
                    />
                    {error?.country && (
                      <div className="text-red-500 text-sm">
                        {error.country}
                      </div>
                    )}
                  </div>
                </div>
            {/* Profile Picture */}
            <div>
              <label
                htmlFor="picture"
                className="block text-sm font-medium text-gray-700"
              >
                Profile Picture<span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="picture"
                accept=".jpeg..jpg,.png"
                className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                onChange={handleFileUpload}
                required
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Password Fields */}
              <div className="w-full">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter password"
                    className={`p-3 my-2 w-full border ${
                      error?.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    } rounded-[10px] shadow-sm focus:ring-2`}
                    value={localData.password}
                    onChange={handleChange}
                    required
                  />
                  {error?.password && (
                    <div className="text-red-500 text-sm">
                      {error.password}
                    </div>
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

              <div className="w-full">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmpassword"
                    placeholder="Confirm password"
                    className={`p-3 my-2 w-full border ${
                      passwordError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    } rounded-[10px] shadow-sm focus:ring-2`}
                    value={localData.confirmpassword}
                    onChange={handleChange}
                    required
                  />
                  {passwordError && (
                    <div className="text-red-500 text-sm">{passwordError}</div>
                  )}

                  <span
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible />
                    ) : (
                      <AiOutlineEye />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Step Button */}
           <div className="flex justify-end ">
              <button
                type="submit"
                disabled={!isImageUploaded}
                className={`px-6 py-3 relative group rounded-[10px] ${isImageUploaded ? 'bg-BgColor text-white hover:bg-buttonHover' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Next
              {/* Tooltip for disabled state */}
              {!isImageUploaded && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-sm rounded py-1 px-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:translate-y-1">
                  Upload Image
                </div>
              )}
              {isUploadingImage && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-sm rounded py-1 px-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:translate-y-1">
                  Uploading Image...
                </div>
              )}
              </button>
            </div>
          </form>

          {/* Alert Dialog */}
          {showAlert && (
            <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-3 md:p-6 rounded shadow-lg">
                <h2 className="md:text-lg mb-1 font-bold">Success!</h2>
                <p className="hidden md:flex ">Basic details submitted successfully. Proceed further?</p>
                <p className="md:hidden">Basic details submitted successfully.</p>
                <p className="md:hidden">Proceed further?</p>
                <button
                  onClick={handleContinue}
                  className="mt-4 px-4 py-2 bg-BgColor text-white rounded"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </motion.div>
    </div>
  );
}

export default BasicDetails;
