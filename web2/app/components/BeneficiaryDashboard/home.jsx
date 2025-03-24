"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import VoucherTable from "./nftVouchers";
import { ethers } from "ethers";
import Loading from "../ProviderDashboard/loading";
import StableCoinABI from "../../../app/contract/StableCoin-usdt.json";
import ImpacttoMoneyABI from "../../../app/contract/ImpacttoMoney.json";
import { motion } from 'framer-motion'; // For smooth animations

const BeneficiaryDashboard = () => {
  // State hooks
  const [userData, setUserData] = useState(null);

  const [voucherStatus, setVoucherStatus] = useState("Pending");
  const [showWallet, setShowWallet] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data and providers from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const authToken = Cookies.get("authToken");
        if (!authToken) {
          setError("Unauthorized. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch beneficiary details
        const beneficiaryResponse = await fetch("/api/beneficiary", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const beneficiaryData = await beneficiaryResponse.json();
        console.log(beneficiaryData);
        setUserData(beneficiaryData);
      } catch (err) {
        setError("Error loading data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading or error rendering
  if (loading) {
    return (
      <div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // If userData is still null, render a loading message or return null
  if (!userData) {
    return (
      <p>
        <Loading />
      </p>
    );
  }

  return (
    // <div className="flex flex-col min-h-screen p-4 bg-gray-50">
    <div className="flex flex-col items-center gap-6 p-1 md:px-6 bg-gray-100 animate-fade-in">
       <motion.div
        className="flex flex-col w-full justify-center items-center min-h-screen py-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 1.2, delay: 0.5 }}
      >
      {/* Right section: Voucher Details and Redemption */}
      <div className="flex flex-col items-center justify-center w-full bg-gradient-to-br from-blue-200 to-blue-50 rounded-xl py-4 md:p-6 shadow-lg ">
        {/* My Application Section */}
        <div>
          <h2 className="mb-4 border-b-4 border-BgColor/50 pb-2 text-3xl font-bold text-gray-800 transition-transform hover:scale-110">
            My Application
          </h2>
        </div>
        <div className="mt-6 py-4 flex flex-col justify-center md:w-2/3">
          {/* Voucher Category */}
          <DetailItem
            label="Voucher Category"
            value={userData?.data?.voucherCategory || "N/A"}
          />

          {/* Education Details */}
          {userData?.data?.voucherCategory === "Education" &&
            userData?.data?.voucherDetails && (
              <>
                <DetailItem
                  label="CGPA"
                  value={userData?.data?.voucherDetails.cgpa || "N/A"}
                />
                <DetailItem
                  label="University Name"
                  value={userData?.data?.voucherDetails.university || "N/A"}
                />
                <DetailItem
                  label="Education Purpose"
                  value={userData?.data?.voucherDetails.purpose || "N/A"}
                />
              </>
            )}
          {/* Health Details */}
          {userData?.data?.voucherCategory === "Health" &&
            userData?.data?.voucherDetails && (
              <>
                <DetailItem
                  label="Hospital Name"
                  value={userData?.data?.voucherDetails.hospital || "N/A"}
                />
                <DetailItem
                  label="Disease Name"
                  value={userData?.data?.voucherDetails.disease || "N/A"}
                />
              </>
            )}
          {/* Children Details */}
          {userData?.data?.voucherCategory === "Children" &&
            userData?.data?.voucherDetails && (
              <>
                <DetailItem
                  label="Children's Age"
                  value={userData?.data?.voucherDetails.age || "N/A"}
                />
                <DetailItem
                  label="Guardian Name"
                  value={userData?.data?.voucherDetails.guardian || "N/A"}
                />
                <DetailItem
                  label="Application Purpose"
                  value={
                    userData?.data?.voucherDetails.childrenPurpose.toString() ||
                    "N/A"
                  }
                />
              </>
            )}
          {/* Religion Details */}
          {userData?.data?.voucherCategory === "Religion" &&
            userData?.data?.voucherDetails && (
              <>
                <DetailItem
                  label="Religion Name"
                  value={userData?.data?.voucherDetails.religion || "N/A"}
                />
              </>
            )}

          {/* Application Status */}
          <DetailItem
            label="Application Status"
            value={userData?.data?.status || "N/A"}
          />

          {/* Documents */}
          <div>
            <h3 className="text-gray-800 text-sm font-semibold mb-2">
              Documents:
            </h3>
            {userData?.data?.documents?.length > 0 ? (
              <ul className="space-y-2">
                {userData?.data?.documents?.map((doc, docIndex) => (
                  <li key={docIndex}>
                    <Link
                      href={doc || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 font-medium underline hover:text-amber-700"
                    >
                      Document {docIndex + 1}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No documents available.</p>
            )}
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
};

// Reusable component for displaying details
const DetailItem = ({ label, value }) => (
  <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-2">
    <span className="font-semibold text-lg text-BgColor">{label}:</span>
    <span className="text-gray-700 text-lg">{value || "N/A"}</span>
  </div>
);

export default BeneficiaryDashboard;
