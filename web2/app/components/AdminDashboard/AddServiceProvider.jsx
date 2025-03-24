/*
---------------------------------------------------
Project:        FundingProject
Date:           Nov 7, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file holds the Form to add a service provider.
---------------------------------------------------
*/

import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Import eye icons
import { SignupSchema } from "../../../schema/roleScheme";
import Alert from "../../utils/Alert";

const Categories = {
  All: "All",
  Education: "Education",
  Healthcare: "Health",
  Children: "Children",
  Religion: "Religion",
  Humanitarian: "Humanitarian",
  Crisis: "Crisis",
  Government: "Government",
  E_Com: "E-Com",
};

export default function AddServiceProviderForm({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    cnic: "",
    phone: "",
    home: "",
    city: "",
    country: "",
    voucherCategory: "",
    additionalInfo: { providerName: "", city: "", country: "" },
    wallet_address: "",
    documents: [],
  });
  const [message, setMessage] = useState("");
  // const [error, setError] = useState({});
  const [alert, setAlert] = useState({ message: "", type: "" }); // State for alert
  const [error, setError] = useState({});

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert({ message: "", type: "" });
    }, 5000); // Clear alert after 5 seconds
  };
  // const [showPassword, setShowPassword] = useState(false); // State for password visibility
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
  // const [purpose, setPurpose] = useState("Need Based")

  const setMessageWithTimeout = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 5000); // Clear message after 3 seconds
  };

  const validateFormData = (data) => {
    const result = SignupSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setError(fieldErrors);
      return false;
    }
    setError({});
    return true;
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.additionalInfo) {
      setFormData((prevData) => ({
        ...prevData,
        role: "Provider",
        additionalInfo: {
          ...prevData.additionalInfo,
          [name]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        role: "Provider",
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmpassword) {
      setPasswordError("Passwords do not match!");
      return;
    }

    setPasswordError(""); // Clear error if passwords match

    // Validate form data
    if (!validateFormData(formData)) {
      return; // Stop submission if validation fails
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        // setMessageWithTimeout(data.message);
        showAlert(data.message, "success");
        showAlert("Provider Added", "success");
        // alert("Provider Added");
        onClose();
        // router.push("/login"); // Redirect to the login page instead of the dashboard
      } else {
        // setMessageWithTimeout(data.message);
        showAlert(data.message, "error");
      }
    } catch (error) {
      // setMessageWithTimeout("Registration failed!");
      showAlert("Registration failed!", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className=" mt-10 flex items-center justify-center ">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-3xl w-full ">
        <h2 className="text-2xl font-bold  text-center mb-6 mt-4">Add Service Provider</h2>

        {alert.message && (
          <Alert message={alert.message} type={alert.type} duration={5000}   />
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="border p-3 mb-4 w-full rounded-xl"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {error.name && <p className="text-red-500 text-sm">{error.name}</p>}
            </div>
            <div>
              <label className="block mb-2">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="border p-3 rounded-xl mb-4 w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />
               {error.email && <p className="text-red-500 text-sm">{error.email}</p>}
            </div>
            <div>
              <label className="block mb-2">
                National ID<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cnic"
                placeholder="without dashes"
                className="border p-3 rounded-xl mb-4 w-full"
                value={formData.cnic}
                onChange={handleChange}
                required
              />
              {error.cnic && <p className="text-red-500 text-sm">{error.cnic}</p>}
            </div>
            <div>
              <label className="block mb-2">
                Mobile Number<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                className="border p-3 rounded-xl mb-4 w-full"
                value={formData.phone}
                onChange={handleChange}
                required
              />
               {error.phone && <p className="text-red-500 text-sm">{error.phone}</p>}
            </div>
            <div>
              <label className="block mb-2">
                Home Address<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="home"
                placeholder="Home Address"
                className="border p-3 rounded-xl mb-4 w-full"
                value={formData.home}
                onChange={handleChange}
                required
              />
             {error.home && <p className="text-red-500 text-sm">{error.home}</p>}
            </div>

            {/* <div>
              <label  className="block mb-2">
                City Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="generalcity"
                placeholder=" City Name"
                className="border p-2 mb-4 w-full"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-full">
              <label  className="block mb-2">
                Country Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="generalcountry"
                placeholder="Country Name"
                className="border p-2 mb-4 w-full"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div> */}

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block mb-2">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter password"
                  className="border p-3 rounded-xl mb-4 w-full"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </span>
              </div>
              {error.password && <p className="text-red-500 text-sm">{error.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block mb-2">
                Confirm Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmpassword"
                  placeholder="Confirm password"
                  className="border p-3 rounded-xl mb-4 w-full"
                  value={formData.confirmpassword}
                  onChange={handleChange}
                  required
                />
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
              {error.confirmpassword && <p className="text-red-500 text-sm">{error.confirmpassword}</p>}
            </div>
            <div>
              <label htmlFor="providerName" className="block mb-2">
                Provider Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="providerName"
                placeholder="Provider Name"
                className="border p-3 rounded-xl mb-4 w-full"
                value={formData.additionalInfo.providerName}
                onChange={handleChange}
                required
              />
               {error.additionalInfo?.providerName && <p className="text-red-500 text-sm">{error.additionalInfo.providerName}</p>}
            </div>
            <div>
              <label className="block mb-2">
                Service Provider City<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                placeholder="Provider City"
                className="border p-3 rounded-xl mb-4 w-full"
                value={formData.additionalInfo.city}
                onChange={handleChange}
                required
              />
                {error.additionalInfo?.city && <p className="text-red-500 text-sm">{error.additionalInfo.city}</p>}
            </div>
            <div>
              <label className="block mb-2">
                Service Provider Country<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                placeholder="Provider Country"
                className="border p-3 rounded-xl mb-4 w-full"
                value={formData.additionalInfo.country}
                onChange={handleChange}
                required
              />
              {error.additionalInfo?.country && <p className="text-red-500 text-sm">{error.additionalInfo.country}</p>}
            </div>
            <div>
              <label className="block mb-2">
                Category<span className="text-red-500">*</span>
              </label>
              <select
                name="voucherCategory"
                className="border p-3 rounded-xl mb-4 w-full"
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
              {error.voucherCategory && <p className="text-red-500 text-sm">{error.voucherCategory}</p>}
            </div>
          </div>

          <label className="block mb-2">
            Legal Document (PDF or Image)<span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            name="legal_document"
            accept=".pdf,image/*"
            className="border p-3 rounded-xl mb-4 w-full"
            onChange={handleFileUpload}
            required
            multiple
          />

          {/* <label className="block mb-2">Application Status</label>
        <select
          name="application_status"
          className="border p-2 mb-4 w-full"
          value={formData.application_status}
          onChange={handleChange}
        >
          <option value="Active">Active</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Blacklisted">Blacklisted</option>
        </select> */}

          <div>
            <label htmlFor="wallet_address">
              Wallet Address<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="wallet_address"
              className="border p-3 rounded-xl mb-4 w-full"
              onChange={handleChange}
              value={formData.wallet_address}
              required
            />
              {error.wallet_address && <p className="text-red-500 text-sm">{error.wallet_address}</p>}
          </div>
          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-3 rounded-2xl bg-gray-500 text-white"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-2xl"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Provider"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
