// /*
// ---------------------------------------------------
// Project:        FundingProject
// Date:           Oct 21, 2024
// Author:         Mohsin
// ---------------------------------------------------

// Description:
// Managing the service provider dashboard.
// ---------------------------------------------------
// */

"use client";
import Link from "next/link";

import React, { useState, useEffect } from "react"; // Import useState
// import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Loading from "./loading"
import { motion } from 'framer-motion'; // For smooth animations
const ServiceProviderDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("service-provider");
  const [userData, setUserData] = useState(null); // Set userData to mock provider data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

      setUserData(data.data); // Beneficiary details set in state
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchServiceProvider();
  }, []);
  

  // Loading or error rendering
  if (loading) {
    return <div><Loading /></div>;
  }

  if (error) {
    return <div className="flex justify-center items-center text-3xl h-screen font-bold text-black">{error}</div>;
  }

  // If userData is still null, render a loading message or return null
  if (!userData) {
    return <p><Loading /></p>;
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 px-6 bg-gray-100 animate-fade-in">
       <motion.div
    className="flex flex-col w-full justify-center items-center min-h-screen py-8"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 1.2, delay: 0.5 }}
  >
            {/* Left Side - Profile Section */}
            <div className="flex flex-col items-center justify-center w-full bg-gradient-to-br from-blue-200 to-blue-50 rounded-xl p-6 shadow-lg transition-transform duration-300 hover:scale-95">
              <div>
                <h1 className="mb-4  border-b-4 border-BgColor/50 pb-2 text-3xl font-bold text-gray-800 transition-transform hover:scale-110">Provider Detail</h1>
              </div>
    
              {/* Right Side - User Details */}
              <div className="mt-6 py-4 flex flex-col justify-center md:w-2/3">
              
                {/* Details Section */}
                <div className="space-y-4 text-lg">
                  <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                    <span className="font-medium text-gray-700 w-40">Provider Name:</span>
                    <span className="text-gray-600">{userData.voucherDetails.providerName || "N/A"}</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                    <span className="font-medium text-gray-700 w-40">
                      Provider City:
                    </span>
                    <span className="text-gray-600">{userData.voucherDetails.city || "N/A"}</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                    <span className="font-medium text-gray-700 w-40">
                    Provider Country:
                    </span>
                    <span className="text-gray-600 truncate">
                      {userData.voucherDetails.country || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:justify-between md:gap-4">
                    <span className="font-medium text-gray-700 w-40">
                    Documents:
                    </span>
                    <span className="text-gray-600 flex gap-3">{userData.documents.map((doc, index) => (
            <Link
              key={index}
              href={doc || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium underline transition duration-200"
            >
              Document {index + 1}
              
            </Link>
          ))}</span>
                  </div>
                  
                </div>
              </div>
             
            </div>
            </motion.div>
          </div>
          );
        };
    // <div className="flex flex-col items-center gap-6 p-4 px-6 bg-gray-100 animate-fade-in">
    // <div className="flex flex-col items-center justify-center w-full bg-gradient-to-br from-blue-200 to-blue-50 rounded-xl p-6 shadow-lg transition-transform duration-300 hover:scale-95">
    //   <div>
    //      <h2 className="text-3xl font-semibold text-gray-700 border-b-4 border-blue-400 inline-block pb-3 shadow-sm">
    //     Provider Details
    //   </h2>
    //   </div>
     
    
  
    {/* Detail Items */}
  //   <div className="space-y-6">
  //     <DetailItem
  //       label="Provider Name"
  //       value={userData.voucherDetails.providerName || "N/A"}
  //     />
  //     <DetailItem
  //       label="Provider City"
  //       value={userData.voucherDetails.city || "N/A"}
  //     />
  //     <DetailItem
  //       label="Provider Country"
  //       value={userData.voucherDetails.country || "N/A"}
  //     />
  
  //     {/* Documents Section */}
  //     <div className="flex flex-col py-4">
  //       <span className="font-semibold text-gray-700 text-lg mb-3">
  //         Documents:
  //       </span>
  //       <div className="flex flex-col space-y-3">
  //         {userData.documents.map((doc, index) => (
  //           <Link
  //             key={index}
  //             href={doc || ""}
  //             target="_blank"
  //             rel="noopener noreferrer"
  //             className="text-blue-600 hover:text-blue-800 font-medium underline transition duration-200"
  //           >
  //             Document {index + 1}
  //           </Link>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  //   </div>
    
  // </div>
  
     

  
// Reusable component for displaying details
const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center mb-1">
    <span className="font-semibold text-blue-800">{label}:</span>
    <span className="text-gray-800 hover:underline hover:underline-offset-3 transition-transform hover:scale-95">
      {value || "N/A"}
    </span>
  </div>
);

export default ServiceProviderDashboard;
