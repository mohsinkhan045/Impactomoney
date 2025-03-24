"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SignupSchema } from "../../../schema/roleScheme";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Import eye icons

const Categories = {
  Education: "education",
  Healthcare: "health",
};

const Signup = () => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmpassword: "",
    role: "",
    cnic: "",
    mobileNumber: "",
    homeAddress: "",
    profile_pic: "",
    voucherCategory: "",
    additionalInfo: {
      providerName: "",
      city: "",
      country: "",
      university: "",
      cgpa: "",
      purpose: "",
      hospital: "",
      disease: "",
    },
    documents: [], // Add documents here
    wallet_address: "",
  });
  const [message, setMessage] = useState("");
  const [showWallet, setShowWallet] = useState(false); // Manage wallet hover state
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.additionalInfo) {
      setFormData((prevData) => ({
        ...prevData,
        additionalInfo: {
          ...prevData.additionalInfo,
          [name]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files; // Multiple files selected
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("upload_preset", "cloudinary-doc-upload"); // Cloudinary preset
      formData.append("cloud_name", `${process.env.NEXT_PUBLIC_CLOUD_NAME}`); // Replace with your Cloudinary cloud name

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        uploadedUrls.push(data.secure_url); // Collect uploaded file URLs
        console.log(data.secure_url);
      } catch (error) {
        console.error(`Error uploading file ${files[i].name}:`, error);
      }
    }

    // Update form data with file URLs
    setFormData((prevData) => ({
      ...prevData,
      documents: uploadedUrls, // Add uploaded URLs to formData
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data with Zod
    const result = SignupSchema.safeParse(formData);
    console.log(result.data);
    if (!result.success) {
      // Show validation errors
      // const errors = result.error.errors.map((err) => err.message).join(", ");
      // Recursive function to flatten nested errors
      const formattedErrors = result.error.format();
      const flattenErrors = (errors, parentKey = "") => {
        const flatErrors = {};

        for (const key in errors) {
          const fullKey = parentKey ? `${parentKey}.${key}` : key;

          if (errors[key]?._errors?.length) {
            // Assign the first error message
            flatErrors[fullKey] = errors[key]._errors[0];
          } else {
            // Recursively process nested keys
            Object.assign(flatErrors, flattenErrors(errors[key], fullKey));
          }
        }

        return flatErrors;
      };

      const fieldErrors = flattenErrors(formattedErrors);

      // Set errors in state
      setMessage(fieldErrors);
      console.log(fieldErrors); // For debugging
      return;
    }
    // Check if passwords match
    if (formData.password !== formData.confirmpassword) {
      setPasswordError("Passwords do not match!");
      return;
    }
    if (!formData.wallet_address) {
      alert("Please connect your Metamask wallet before registering.");
      return;
    }

    setPasswordError(""); // Clear error if passwords match
    setLoading(true);

    try {
      const response = await fetch("/api/user/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        alert("Registered successfully");
        router.push("/login"); // Redirect to the login page instead of the dashboard
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full justify-center items-center bg-BgColor min-h-screen py-8">
      <div className="grid md:grid-cols-1  max-w-[7xl] px-4">
        <motion.div
          className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
          <form className="space-y-4">
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
                  className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {message?.name && (
                  <div className="text-red-500 text-sm">{message.name}</div>
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
                  className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {message?.email && (
                  <div className="text-red-500 text-sm">{message.email}</div>
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
                  placeholder="Enter National ID"
                  className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.cnic}
                  onChange={handleChange}
                  required
                />
                {message?.cnic && (
                  <div className="text-red-500 text-sm">{message.cnic}</div>
                )}
              </div>
              {/* Phone Number */}
              <div className="w-full">
                <label
                  htmlFor="mobileNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="mobileNumber"
                  name="mobileNumber"
                  placeholder="Enter Phone Number"
                  className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                />
                {message?.mobileNumber && (
                  <div className="text-red-500 text-sm">
                    {message.mobileNumber}
                  </div>
                )}
              </div>
              {/* Home Address*/}
              <div className="w-full">
                <label
                  htmlFor="homeAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Home Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="homeAddress"
                  name="homeAddress"
                  placeholder="Enter Home Address"
                  className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.homeAddress}
                  onChange={handleChange}
                  required
                />
                {message?.homeAddress && (
                  <div className="text-red-500 text-sm">
                    {message.homeAddress}
                  </div>
                )}
              </div>
            </div>
            {/* Profile Picture */}
            <div>
              <label
                htmlFor="profile_pic"
                className="block text-sm font-medium text-gray-700"
              >
                Profile Picture<span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="profile_pic"
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
                    className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {message?.password && (
                    <div className="text-red-500 text-sm">
                      {message.password}
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
                    className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                    value={formData.confirmpassword}
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
            <div className="flex flex-col md:flex-row gap-4">
              {/* Role Selection */}
              <div className="w-full">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Role<span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Provider">Service Provider</option>
                  <option value="Beneficiary">Beneficiary</option>
                </select>
                {message?.role && (
                  <div className="text-red-500 text-sm">{message.role}</div>
                )}
              </div>

              {/* Voucher Category - for both Beneficiary and Provider */}
              <div className="w-full">
                <label
                  htmlFor="voucherCategory"
                  className="block text-sm font-medium text-gray-700"
                >
                  Voucher Category<span className="text-red-500">*</span>
                </label>
                <select
                  id="voucherCategory"
                  name="voucherCategory"
                  className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                  value={formData.voucherCategory}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {Object.values(Categories).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {message?.voucherCategory && (
                  <div className="text-red-500 text-sm">
                    {message.voucherCategory}
                  </div>
                )}
              </div>
            </div>
            {/* Conditional Fields for Provider */}
            {formData.role === "Provider" && (
              <>
                <div>
                  <label
                    htmlFor="providerName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Provider Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="providerName"
                    placeholder="Enter Provider Name"
                    className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                    value={formData.additionalInfo.providerName}
                    onChange={handleChange}
                    required
                  />
                  {message?.additionalInfo?.providerName && (
                    <div className="text-red-500 text-sm">
                      {message.additionalInfo.providerName}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="city">City Name:</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter City Name"
                    className="p-[1.5px] my-2 w-full border-gray-300 rounded-md shadow-sm focus:outline-none ring-1 ring-gray-300"
                    value={formData.additionalInfo.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="country">Country Name:</label>
                  <input
                    type="text"
                    name="country"
                    placeholder="Enter Country Name"
                    className="p-[1.5px] my-2 w-full border-gray-300 rounded-md shadow-sm focus:outline-none ring-1 ring-gray-300"
                    value={formData.additionalInfo.country}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            {/* Conditional Fields for Beneficiary based on Voucher Category */}
            {formData.role === "Beneficiary" &&
              formData.voucherCategory === Categories.Education && (
                <>
                  <div>
                    <label htmlFor="universityName">University Name:</label>
                    <input
                      type="text"
                      name="university"
                      placeholder="Enter University"
                      className="p-[1.5px] my-2 w-full border-gray-300 rounded-md shadow-sm focus:outline-none ring-1 ring-gray-300"
                      value={formData.additionalInfo.university}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="Cgpa">Cgpa:</label>
                    <input
                      type="text"
                      name="cgpa"
                      placeholder="Enter CGPA"
                      className="p-[1.5px] my-2 w-full border-gray-300 rounded-md shadow-sm focus:outline-none ring-1 ring-gray-300"
                      value={formData.additionalInfo.cgpa}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="EducationPurpose"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Education Purpose<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="purpose"
                      className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                      value={formData.additionalInfo.purpose}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select Purpose
                      </option>
                      <option value="Need Based">Need Based</option>
                      <option value="High Achiever">High Achiever</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                </>
              )}

            {formData.role === "Beneficiary" &&
              formData.voucherCategory === Categories.Healthcare && (
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full">
                    <label
                      htmlFor="disease"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Disease<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="disease"
                      placeholder="Enter Disease"
                      className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                      value={formData.additionalInfo.disease}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Hospital Name</label>
                    <input
                      type="text"
                      name="hospital"
                      placeholder="Enter Hospital name"
                      className="border p-2 mb-4 w-full"
                      value={formData.additionalInfo.hospital}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              )}

            {formData.role === "Beneficiary" &&
              formData.voucherCategory === Categories.Refugees && (
                <>
                  <div>
                    <label htmlFor="mosqueOrChurchName">
                      Mosque or Church Name:
                    </label>
                    <input
                      type="text"
                      name="hospital"
                      placeholder="Enter Hospital Name"
                      className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                      value={formData.additionalInfo.hospital}
                      onChange={handleChange}
                      required
                    />
                    {message?.additionalInfo?.hospital && (
                      <div className="text-red-500 text-sm">
                        {message.additionalInfo.hospital}
                      </div>
                    )}
                  </div>
                </>
              )}
            <div>
              <label htmlFor="document">Document:</label>
              <input
                type="file"
                name="documents"
                accept=".pdf,.jpg,.png"
                className="p-[1.5px] my-2 w-full border-gray-300 rounded-md shadow-sm focus:outline-none ring-1 ring-gray-300"
                onChange={handleFileUpload}
                multiple
                required
              />
            </div>
            <div>
              <label htmlFor="wallet_address">Wallet Address:</label>
              <input
                type="text"
                name="wallet_address"
                placeholder="Enter Wallet Address"
                className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                value={formData.wallet_address}
                required
              />
              {message?.wallet_address && (
                <div className="text-red-500 text-sm">
                  {message.wallet_address}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-BgColor text-white font-semibold rounded-[10px] shadow-lg hover:bg-buttonHover"
              >
                {isLoading ? <span>Submitting...</span> : <span>Submit</span>}
              </button>
            </div>
          </form>
          {/* </div> */}
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
