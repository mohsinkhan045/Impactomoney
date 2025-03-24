/*
---------------------------------------------------
Project:        FundingProject
Date:           Nov 28, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file handles Registration role based details.
---------------------------------------------------
*/
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
import React, { useState, useEffect } from "react";
import { SignupSchema } from "../../../schema/roleScheme";
import Image from "next/image";
import { motion } from "framer-motion"; // For smooth animations
import { Terminal } from "lucide-react";
import {
  childrenChecklist,
  Categories,
  ReligionOptions,
} from "../../utils/dropdown-checklist";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../@/components/ui/alert";

const SubEducationCategories = {
  university: "University",
  college: "College",
  school: "School",
};

function RoleBasedDetails({ prevStep, formData, updateFormData }) {
  const router = useRouter();
  const [validatedData, setValidatedData] = useState({});
  
  const [localData, setLocalFormData] = useState({
    ...formData, // Initialize with shared form data
    role: formData.role || "",
    voucherCategory: formData.voucherCategory || "",
    subCategory: formData.subCategory || "All",
    childrenPurpose: formData.voucherDetails?.childrenPurpose || [],
    subEducationCategory: formData?.subEducationCategory || "",
    subReligionCategory: formData?.subReligionCategory || "",
    documents: formData.documents || [],
    wallet_address: formData.wallet_address || "",
    additionalInfo: {
      providerName: formData.voucherDetails?.providerName || "",
      city: formData.voucherDetails?.city || "",
      country: formData.voucherDetails?.country || "",
      university: formData.voucherDetails?.university || "",
      college: formData.voucherDetails?.college || "",
      school: formData.voucherDetails?.school || "",
      cgpa: formData.voucherDetails?.cgpa || "",
      purpose: formData.voucherDetails?.purpose || "",
      hospital: formData.voucherDetails?.hospital || "",
      disease: formData.voucherDetails?.disease || "",
      age: formData.voucherDetails?.age || "",
      guardian: formData.voucherDetails?.guardian || "",
      religion: formData?.voucherDetails?.religion || "",
      grades: formData.voucherDetails?.grades || "",
    },
  });
  const [error, setErrors] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [showAlert, setShowAlert] = useState(false); // State for alert dialog

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const localFormData = new FormData();
      localFormData.append("file", files[i]);
      localFormData.append("upload_preset", "cloudinary-doc-upload");
      localFormData.append(
        "cloud_name",
        `${process.env.NEXT_PUBLIC_CLOUD_NAME}`
      );

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: localFormData,
          }
        );

        const data = await response.json();
        uploadedUrls.push(data.secure_url);
      } catch (error) {
        console.error(`Error uploading file ${files[i].name}:`, error);
      }
    }

    setLocalFormData((prevData) => ({
      ...prevData,
      documents: [...prevData.documents, ...uploadedUrls],
    }));
    updateFormData({
      ...localData,
      documents: [...localData.documents, ...uploadedUrls],
    });
  };
  console.log("Local Data", localData);

  const validateField = (formData) => {
    if (!SignupSchema) {
      console.error(
        "SignupSchema is undefined. Ensure it is imported correctly."
      );
      return;
    }

    // Clone the existing data to avoid direct mutation
    let tempData = JSON.parse(JSON.stringify(formData));

    console.log("Validating data: ", tempData);

    // Perform validation
    const result = SignupSchema.safeParse(tempData);

    if (!result.success) {
      console.log("Validation failed:", result.error);

      // Extract nested field errors
      const fieldErrors = result.error.flatten().fieldErrors;
      let formattedErrors = {};

      // Recursive function to handle nested errors
      const processErrors = (errors, prefix = "") => {
        for (const key in errors) {
          const fullPath = prefix ? `${prefix}.${key}` : key;

          if (Array.isArray(errors[key])) {
            formattedErrors[fullPath] = errors[key][0]; // Store first error message
          } else if (typeof errors[key] === "object" && errors[key] !== null) {
            processErrors(errors[key], fullPath);
          }
        }
      };

      processErrors(fieldErrors);

      // Update the error state with formatted errors
      setErrors(formattedErrors);
      console.error("Validation Errors: ", formattedErrors);
      return false; // Indicate validation failed
    } else {
      // Clear errors if validation succeeds
      setErrors({});
      setValidatedData(result.data); // Store validated data
      console.log("Validation successful:", result.data);
      return true; // Indicate validation passed
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let updatedData = { ...localData };

    if (name === "childrenPurpose") {
      let updatedPurpose = localData.childrenPurpose || [];

      if (value === "Any") {
        updatedPurpose = checked ? ["Any"] : [];
      } else {
        if (checked) {
          updatedPurpose.push(value);
        } else {
          updatedPurpose = updatedPurpose.filter((item) => item !== value);
        }
      }

      updatedData.childrenPurpose = updatedPurpose;
    } else if (name === "religion") {
      updatedData.religion = value;
      updatedData.additionalInfo.religion = value;
    } else if (name === "subEducationCategory") {
      updatedData.subEducationCategory = value;
    } else if (name === "subReligionCategory") {
      updatedData.subReligionCategory = value;
    } else if (localData.additionalInfo && name in localData.additionalInfo) {
      updatedData.additionalInfo[name] = value;
    } else {
      updatedData[name] = value;
    }

    setLocalFormData(updatedData);
    updateFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate before submission
    const isValid = validateField(localData);

    if (!isValid) {
      console.log("Fix errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      const finalData = { ...localData };

 
      if (!localData.subReligionCategory || localData.subReligionCategory.trim() === "") {
        delete finalData.subReligionCategory;
      }
  
      if (!localData.subEducationCategory || localData.subEducationCategory.trim() === "") {
        delete finalData.subEducationCategory;
      }

      const response = await fetch("/api/user/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData), // Use finalData here
      });

      const data = await response.json();
      if (response.ok) {
        // Show success alert
        setShowAlert(true);
      } else if (data.status === 409) {
        setMessage(data.message);
      } else if (
        data.error.includes(
          "E11000 duplicate key error collection: test.users index: wallet_address_1 dup key:"
        )
      ) {
        setMessage("Wallet Address already registered");
      } else if (
        status === 500 ||
        data.error.includes(
          "querySrv ECONNREFUSED _mongodb._tcp.impacttomoney.qwhe9.mongodb.net"
        )
      ) {
        setMessage("Check your internet Connection");
      }
    } catch (error) {
      setErrors("Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setShowAlert(false); // Close the alert
    // alert("Registered successfully");
    router.push("/login");
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
        <div className="grid md:grid-cols-1 w-full max-w-7xl justify-items-center px-4">
          <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl">
            <div className="flex justify-center flex-col items-center mb-4">
              <Image
                src={"/bg-remove-logo.png"}
                alt="impact to money logo"
                width={200}
                height={0}
              />
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className={`p-3 my-2 w-full border ${
                      error?.role
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } rounded-[10px] shadow-sm focus:ring-2`}
                    value={localData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Provider">Service Provider</option>
                    <option value="Beneficiary">Beneficiary</option>
                  </select>
                  {error?.role && (
                    <div className="text-red-500 text-sm">{error.role}</div>
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
                    className={`p-3 my-2 w-full border ${
                      error?.voucherCategory
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } rounded-[10px] shadow-sm focus:ring-2`}
                    value={localData.voucherCategory}
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
                  {error?.voucherCategory && (
                    <div className="text-red-500 text-sm">
                      {error.voucherCategory}
                    </div>
                  )}
                </div>
              </div>
              {/* Conditional Fields for Provider */}
              {localData.role === "Provider" && (
                <>
                  <div>
                    <label
                      htmlFor="providerName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Provider<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="providerName"
                      placeholder="Enter Provider Name"
                      className={`p-3 my-2 w-full border ${
                        error["additionalInfo.providerName"]
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      } rounded-[10px] shadow-sm focus:ring-2`}
                      value={localData.additionalInfo.providerName}
                      onChange={handleChange}
                      required
                    />
                    {error["additionalInfo.providerName"] && (
                      <div className="text-red-500 text-sm">
                        {error["additionalInfo.providerName"]}
                      </div>
                    )}
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
                          error["additionalInfo.city"]
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        } rounded-[10px] shadow-sm focus:ring-2`}
                        value={localData.additionalInfo.city}
                        onChange={handleChange}
                        required
                      />
                      {error["additionalInfo.city"] && (
                        <div className="text-red-500 text-sm">
                          {error["additionalInfo.city"]}
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
                          error["additionalInfo.country"]
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        } rounded-[10px] shadow-sm focus:ring-2`}
                        value={localData.additionalInfo.country}
                        onChange={handleChange}
                        required
                      />
                      {error["additionalInfo.country"] && (
                        <div className="text-red-500 text-sm">
                          {error["additionalInfo.country"]}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {localData.role === "Provider" &&
                localData.voucherCategory === "Religion" && (
                  <div>
                    <label
                      htmlFor="subReligionCategory"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Sub Religion Category
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subReligionCategory"
                      name="subReligionCategory"
                      className={`p-3 my-2 w-full border ${
                        error["subReligionCategory"]
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      } rounded-[10px] shadow-sm focus:ring-2`}
                      value={localData.subReligionCategory}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Sub Religion Category</option>
                      <option value="Mosque">Mosque</option>
                      <option value="Church">Church</option>
                      <option value="Temple">Temple</option>
                      <option value="Any Specific Institution">
                        Any Specific Institution
                      </option>
                    </select>
                    {error["subReligionCategory"] && (
                      <div className="text-red-500 text-sm">
                        {error["subReligionCategory"]}
                      </div>
                    )}
                  </div>
                )}

              {localData.role === "Beneficiary" && (
                <>
                  <div>
                    <label
                      htmlFor="religion"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Select Religion<span className="text-red-500">*</span>
                    </label>
                    <select
                      id="religion"
                      name="religion"
                      className={`p-3 my-2 w-full border ${
                        error["additionalInfo.religion"]
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      } rounded-[10px] shadow-sm focus:ring-2`}
                      value={localData.additionalInfo.religion || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Religion</option>
                      {Object.entries(ReligionOptions).map(([key, value]) => (
                        <option key={key} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                    {error["additionalInfo.religion"] && (
                      <div className="text-red-500 text-sm">
                        {error["additionalInfo.religion"]}
                      </div>
                    )}
                  </div>
                  {/* General for all */}
                  <div>
                    <label
                      htmlFor="childrenPurpose"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Choose Purpose<span className="text-red-500">*</span>
                    </label>
                    <div className="p-3 my-2 w-full md:flex md:gap-2 border rounded-[10px] shadow-sm">
                      {Object.entries(childrenChecklist).map(([key, value]) => (
                        <div key={key} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id={key}
                            name="childrenPurpose"
                            value={value}
                            checked={localData.childrenPurpose.includes(value)}
                            onChange={(e) => handleChange(e, key)}
                            className={`mr-2 ${
                              error["childrenPurpose"]
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            }`}
                            disabled={
                              localData.childrenPurpose.includes("Any") &&
                              key !== "Any"
                            }
                          />
                          <label
                            htmlFor={key}
                            className="text-sm text-gray-700"
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                    {error["additionalInfo.childrenPurpose"] && (
                      <div className="text-red-500 text-sm">
                        {error["additionalInfo.childrenPurpose"]}
                      </div>
                    )}
                  </div>

                  <select
                    value={localData.subCategory}
                    onChange={handleChange}
                    name="subCategory"
                    className="border-gray-300 p-3 my-2 w-full border rounded-[10px] shadow-sm focus:ring-2"
                  >
                    <option>Select Sub-Category</option>
                    <option value="All">All</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Food">Food</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Emotional Abuse">Emotional Abuse</option>
                    <option value="Sexual Abuse">Sexual Abuse</option>
                    <option value="Special Needs">Special Needs</option>
                  </select>

                  {localData.role === "Beneficiary" &&
                    localData.voucherCategory === Categories.Education && (
                      <>
                        <div>
                          <label
                            htmlFor="subEducationCategory"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Sub Education Category
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="subEducationCategory"
                            name="subEducationCategory"
                            className={`p-3 my-2 w-full border ${
                              error["subEducationCategory"]
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            } rounded-[10px] shadow-sm focus:ring-2`}
                            value={localData.subEducationCategory}
                            onChange={handleChange}
                            required
                          >
                            <option value="">
                              Select Sub Education Category
                            </option>
                            <option value="university">University</option>
                            <option value="college">College</option>
                            <option value="school">School</option>
                          </select>
                          {error["subEducationCategory"] && (
                            <div className="text-red-500 text-sm">
                              {error["subEducationCategory"]}
                            </div>
                          )}
                        </div>

                        {/* Conditionally render university, college, or school input */}
                        {localData.subEducationCategory === "university" && (
                          <div>
                            <label
                              htmlFor="university"
                              className="block text-sm font-medium text-gray-700"
                            >
                              University Name
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="university"
                              placeholder="Enter University Name"
                              className={`p-3 my-2 w-full border ${
                                error["additionalInfo.university"]
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-gray-300 focus:ring-blue-500"
                              } rounded-[10px] shadow-sm focus:ring-2`}
                              value={localData.additionalInfo.university}
                              onChange={handleChange}
                              required
                            />
                            {error["additionalInfo.university"] && (
                              <div className="text-red-500 text-sm">
                                {error["additionalInfo.university"]}
                              </div>
                            )}
                          </div>
                        )}

                        {localData.subEducationCategory === "college" && (
                          <div>
                            <label
                              htmlFor="college"
                              className="block text-sm font-medium text-gray-700"
                            >
                              College Name
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="college"
                              placeholder="Enter College Name"
                              className={`p-3 my-2 w-full border ${
                                error["additionalInfo.college"]
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-gray-300 focus:ring-blue-500"
                              } rounded-[10px] shadow-sm focus:ring-2`}
                              value={localData.additionalInfo.college}
                              onChange={handleChange}
                              required
                            />
                            {error["additionalInfo.college"] && (
                              <div className="text-red-500 text-sm">
                                {error["additionalInfo.college"]}
                              </div>
                            )}
                          </div>
                        )}

                        {localData.subEducationCategory === "school" && (
                          <div>
                            <label
                              htmlFor="school"
                              className="block text-sm font-medium text-gray-700"
                            >
                              School Name<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="school"
                              placeholder="Enter School Name"
                              className={`p-3 my-2 w-full border ${
                                error["additionalInfo.school"]
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-gray-300 focus:ring-blue-500"
                              } rounded-[10px] shadow-sm focus:ring-2`}
                              value={localData.additionalInfo.school}
                              onChange={handleChange}
                              required
                            />
                            {error["additionalInfo.school"] && (
                              <div className="text-red-500 text-sm">
                                {error["additionalInfo.school"]}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Conditionally render CGPA or Grades input */}
                        {localData.subEducationCategory === "university" && (
                          <div>
                            <label
                              htmlFor="cgpa"
                              className="block text-sm font-medium text-gray-700"
                            >
                              CGPA<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              name="cgpa"
                              placeholder="Enter CGPA"
                              className={`p-3 my-2 w-full border ${
                                error["additionalInfo.cgpa"]
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-gray-300 focus:ring-blue-500"
                              } rounded-[10px] shadow-sm focus:ring-2`}
                              value={localData.additionalInfo.cgpa}
                              onChange={handleChange}
                              required
                            />
                            {error["additionalInfo.cgpa"] && (
                              <div className="text-red-500 text-sm">
                                {error["additionalInfo.cgpa"]}
                              </div>
                            )}
                          </div>
                        )}

                        {(localData.subEducationCategory === "college" ||
                          localData.subEducationCategory === "school") && (
                          <div>
                            <label
                              htmlFor="grades"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Grades<span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="grades"
                              placeholder="Enter Grades"
                              className={`p-3 my-2 w-full border ${
                                error["additionalInfo.grades"]
                                  ? "border-red-500 focus:ring-red-500"
                                  : "border-gray-300 focus:ring-blue-500"
                              } rounded-[10px] shadow-sm focus:ring-2`}
                              value={localData.additionalInfo.grades}
                              onChange={handleChange}
                              required
                            />
                            {error["additionalInfo.grades"] && (
                              <div className="text-red-500 text-sm">
                                {error["additionalInfo.grades"]}
                              </div>
                            )}
                          </div>
                        )}

                        <div>
                          <label
                            htmlFor="purpose"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Education Purpose
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="purpose"
                            className={`p-3 my-2 w-full border ${
                              error["additionalInfo.purpose"]
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            } rounded-[10px] shadow-sm focus:ring-2`}
                            value={localData.additionalInfo.purpose}
                            onChange={handleChange}
                            required
                          >
                            <option value="" disabled>
                              Select Purpose
                            </option>
                            <option value="Poor">Need Based</option>
                            <option value="High">High Achiever</option>
                            <option value="Both">Both</option>
                          </select>
                          {error["additionalInfo.purpose"] && (
                            <div className="text-red-500 text-sm">
                              {error["additionalInfo.purpose"]}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                  {localData.voucherCategory === Categories.Healthcare && (
                    <div className="flex flex-col md:flex-row gap-4">
                      {["disease", "hospital"].map((field) => (
                        <div className="w-full" key={field}>
                          <label
                            htmlFor={field}
                            className="block text-sm font-medium text-gray-700"
                          >
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name={field}
                            placeholder={`Enter ${
                              field.charAt(0).toUpperCase() + field.slice(1)
                            }`}
                            className={`p-3 my-2 w-full border ${
                              error[`additionalInfo.${field}`]
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            } rounded-[10px] shadow-sm focus:ring-2`}
                            value={localData.additionalInfo[field]}
                            onChange={handleChange}
                            required
                          />
                          {error[`additionalInfo.${field}`] && (
                            <div className="text-red-500 text-sm">
                              {error[`additionalInfo.${field}`]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {localData.voucherCategory === Categories.Children && (
                    <div className="flex flex-col md:flex-row gap-4">
                      {["age", "guardian"].map((field) => (
                        <div className="w-full" key={field}>
                          <label
                            htmlFor={field}
                            className="block text-sm font-medium text-gray-700"
                          >
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name={field}
                            placeholder={`Enter ${
                              field.charAt(0).toUpperCase() + field.slice(1)
                            }`}
                            className={`p-3 my-2 w-full border ${
                              error[`additionalInfo.${field}`]
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:ring-blue-500"
                            } rounded-[10px] shadow-sm focus:ring-2`}
                            value={localData.additionalInfo[field]}
                            onChange={handleChange}
                            required
                          />
                          {error[`additionalInfo.${field}`] && (
                            <div className="text-red-500 text-sm">
                              {error[`additionalInfo.${field}`]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div>
                <label
                  htmlFor="document"
                  className="block text-sm font-medium text-gray-700"
                >
                  Document<span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="documents"
                  accept=".pdf,.jpg,.png"
                  className="p-3 my-2 w-full border border-gray-300 rounded-[10px] shadow-sm focus:ring-2 focus:ring-blue-500"
                  onChange={handleFileUpload}
                  multiple
                  required
                />
              </div>

              {/* Wallet address input field */}
              <div>
                <label
                  htmlFor="wallet_address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Wallet Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="wallet_address"
                  placeholder="Enter Wallet Address"
                  className={`p-3 my-2 w-full border ${
                    error?.wallet_address
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } rounded-[10px] shadow-sm focus:ring-2`}
                  onChange={handleChange}
                  value={localData.wallet_address}
                  required
                />
                {error?.wallet_address && (
                  <div className="text-red-500 text-sm">
                    {error.wallet_address}
                  </div>
                )}
              </div>

              {message && (
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Check Again!</AlertTitle>
                  <AlertDescription className="text-red-500">
                    {message}
                  </AlertDescription>
                </Alert>
              )}
              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  // className="px-6 py-3 bg-gray-600 text-white rounded-[10px] hover:bg-gray-700"
                >
                  <IoIosArrowBack size={34} />
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex items-center justify-center hover:bg-buttonHover text-white bg-BgColor font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
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
                    "Submit"
                  )}
                </button>
              </div>
            </form>
            {/* Alert Dialog */}
            {showAlert && (
              <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white md:w-full md:max-w-md w-full max-w-xs flex items-center justify-center flex-col px-5 md:px-12 p-3 rounded shadow-lg">
                  <h2 className="text-lg font-bold">Success!</h2>
                  <p>Login your Account</p>
                  <button
                    onClick={handleContinue}
                    className="mt-4 md:px-4 px-3 p-1 md:py-2 bg-BgColor text-white rounded"
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

export default RoleBasedDetails;
