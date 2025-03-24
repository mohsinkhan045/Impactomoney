"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "./Sidebar";
import Image from "next/image";
import NFT from "../../(routes)/admin/Distribute-NFT/page";
import { Menu } from "lucide-react";
import Navbar from "./adminNavbar";
import {
  Activity,
  Users,
  Briefcase,
  FileText,
  CheckCircle,
  CircleDivide,
  BadgeDollarSign,
  BadgePercent
} from "lucide-react";
import IssuedVoucherBeneficiaries from "./issuedVoucherBeneficiaries";
import DistributeVouchers from "./distributeVoucher";
import TransferToken from "./transferToken";
import DistributedVouchers from "./distributedVouchers";
import Temp from "./temp";
import ExpiredVouchers from "./expiredVoucher";
import ManageBeneficiary from "../../(routes)/admin/manage-beneficiary/page";
import ManageVouchers from "../../(routes)/admin/manage-vouchers/page";
import ManageServiceProviders from "../../(routes)/admin/manage-providers/page";
import Settings from "../../(routes)/admin/admin-setting/page";
import Cookies from "js-cookie";
import { ethers } from "ethers";
import StableCoinABI from "../../contract/StableCoin-usdt.json";
import UAUSDStableCoinABI from "../../contract/StableCoin-uausd.json";
import USDCStableCoinABI from "../../contract/StableCoin-usdc.json";
import PAYPALStableCoinABI from "../../contract/StableCoin-paypal.json";
import RevokedVouchers from "./revokedVouchers";
import DonateSection from "./DonationSection";
import React from "react";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState(3);
  const [provider, setProvider] = useState(null);
  const [tokenContracts, setTokenContracts] = useState({});
  const [balances, setBalances] = useState({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  });
  const [currentDate, setCurrentDate] = useState('');

  // Add useEffect to set the date on client side
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  // Memoize the token value since it's used in multiple places
  const token = useMemo(() => Cookies.get("authToken"), []);

  const handleTabChange =(tab)=>{
    setActiveSection(tab)
  }
  // Memoize the tokens array since it's static
  const tokens = useMemo(() => [
    {
      value: 3,
      label: "USDC",
      image: "https://res.cloudinary.com/db3yy1i0j/image/upload/v1738168179/USDC_vdxvv8.svg",
    },
    {
      value: 2,
      label: "USDT",
      image: "https://res.cloudinary.com/db3yy1i0j/image/upload/v1738168111/usdt_joqq4c.png",
    },
    {
      value: 1,
      label: "PYUSD",
      image: "https://res.cloudinary.com/db3yy1i0j/image/upload/v1738168145/paypalUsd_hzu2wn.png",
    },
    {
      value: 0,
      label: "AECoin",
      image: "https://res.cloudinary.com/db3yy1i0j/image/upload/v1738171111/images_1_fu6vn6.jpg",
    },
  ], []);


  // Memoize fetchStatistics since it's used in useEffect
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed fetching statistics");

      const data = await response.json();
      setStats({
        newBeneficiariesCount: data.status.data.newBeneficiariesCount,
        approvedBeneficiariesCount: data.status.data.approvedBeneficiariesCount,
        newServiceProvidersCount: data.status.data.newServiceProvidersCount,
        approvedServiceProvidersCount: data.status.data.approvedServiceProvidersCount,
        activeVouchersCount: data.status.data.activeVouchersCount,
        redeemedVouchersCount: data.status.data.redeemedVouchersCount,
        voucherTypeTotals: data.status.data.voucherTypeTotals,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }, [token]);

  // Update useEffect to use memoized fetchStatistics
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Memoize loadProviderAndContract since it's used in useEffect
  const loadProviderAndContract = useCallback(async () => {
    try {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);

      const tempSigner = tempProvider.getSigner();

      const contracts = {
        2: new ethers.Contract(
          process.env.NEXT_PUBLIC_STABLE_COIN_USDT_CONTRACT_ADDRESS,
          StableCoinABI.abi,
          tempSigner
        ),
        3: new ethers.Contract(
          process.env.NEXT_PUBLIC_STABLE_COIN_USDC_CONTRACT_ADDRESS,
          USDCStableCoinABI.abi,
          tempSigner
        ),
        0: new ethers.Contract(
          process.env.NEXT_PUBLIC_STABLE_COIN_UAUSD_CONTRACT_ADDRESS,
          UAUSDStableCoinABI.abi,
          tempSigner
        ),
        1: new ethers.Contract(
          process.env.NEXT_PUBLIC_STABLE_COIN_PAYPALUSDT_CONTRACT_ADDRESS,
          PAYPALStableCoinABI.abi,
          tempSigner
        ),
      };

      setTokenContracts(contracts);
    } catch (error) {
      console.error("Error initializing contracts:", error);
    }
  }, []);

  // Update useEffect to use memoized loadProviderAndContract
  useEffect(() => {
    loadProviderAndContract();
  }, [loadProviderAndContract]);

  // Memoize fetchBalances since it's used in useEffect
  const fetchBalances = useCallback(async () => {
    if (!provider || !Object.keys(tokenContracts).length) return;

    try {
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      const newBalances = {};

      for (const [token, contract] of Object.entries(tokenContracts)) {
        const balance = await contract.balanceOf(address);
        newBalances[token] = parseFloat(ethers.utils.formatUnits(balance, 18));
      }

      setBalances(newBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  }, [provider, tokenContracts]);

  // Update useEffect to use memoized fetchBalances
  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const [stats, setStats] = useState({
    newBeneficiariesCount: 0,
    approvedBeneficiariesCount: 0,
    newServiceProvidersCount: 0,
    approvedServiceProvidersCount: 0,
    activeVouchersCount: 0,
    redeemedVouchersCount: 0,
    voucherTypeTotals: {},
  });

  const renderSection = useCallback(() => {
    switch (activeSection) {
      case "manage-beneficiary":
        return <ManageBeneficiary activeTabs="all" />;
      case "manage-vouchers":
        return <ManageVouchers />;
      case "manage-providers":
        return <ManageServiceProviders activeTabs="all" />;
      case "donate-voucher":
        return <NFT onTabChange={handleTabChange}/>;
      case "issued-voucher":
        return <IssuedVoucherBeneficiaries />;
      case "distribute-voucher":
        return <DistributeVouchers />;
      case "transfer-token":
        return <TransferToken />;
      case "distributed-voucher":
        return <DistributedVouchers />;
      case "temp":
        return <Temp/>;
      case "revoked-voucher":
        return <RevokedVouchers />;
      case "expired-voucher":
        return <ExpiredVouchers />;
      case "setting":
        return <Settings />;
      case "new-beneficiaries-list":
        return <ManageBeneficiary activeTabs="active" />;
      case "approved-beneficiaries-list":
        return <ManageBeneficiary activeTabs="approved" />;
      case "new-service-providers-list":
        return <ManageServiceProviders activeTabs="active" />;
      case "approved-service-providers-list":
        return <ManageServiceProviders activeTabs="approved" />;
      case "funded-beneficiaries-list":
        return <ManageBeneficiary activeTabs="funded" />;
      default:
        return (
          <div className="md:mt-20">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Last updated: {currentDate}
                </span>
              </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* New Beneficiaries Card */}
              <div
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-500 cursor-pointer transform hover:-translate-y-1"
                onClick={() => setActiveSection("new-beneficiaries-list")}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      New Beneficiaries
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {stats.newBeneficiariesCount}
                    </h2>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Activity className="text-blue-500 h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-blue-500">
                  <span>View details</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Approved Beneficiaries Card */}
              <div
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-green-500 cursor-pointer transform hover:-translate-y-1"
                onClick={() => setActiveSection("approved-beneficiaries-list")}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Approved Beneficiaries
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {stats.approvedBeneficiariesCount}
                    </h2>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Users className="text-green-500 h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-500">
                  <span>View details</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Service Provider Stats */}
              <div
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-yellow-500 cursor-pointer transform hover:-translate-y-1"
                onClick={() => setActiveSection("new-service-providers-list")}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      New Service Providers
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {stats.newServiceProvidersCount}
                    </h2>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <Briefcase className="text-yellow-500 h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-yellow-500">
                  <span>View details</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Approved Service Providers Card */}
              <div
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-teal-500 cursor-pointer transform hover:-translate-y-1"
                onClick={() => setActiveSection("approved-service-providers-list")}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Approved Service Providers
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {stats.approvedServiceProvidersCount}
                    </h2>
                  </div>
                  <div className="p-3 bg-teal-50 rounded-lg">
                    <CheckCircle className="text-teal-500 h-6 w-6" />
                  </div>
                </div>
                <div className="flex items-center text-sm text-teal-500">
                  <span>View details</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* Wallet Balance Card */}
              <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Wallet Balance</p>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {balances[selectedToken]?.toFixed(2)}
                    </h2>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <BadgePercent className="text-purple-500 h-6 w-6" />
                  </div>
                </div>

                {/* Token Selector */}
                <div className="mt-2">
                  <div className="relative w-full max-w-[200px]">
                    <div className="relative flex items-center text-md border border-gray-200 px-3 py-2 rounded-lg bg-gray-50">
                      {selectedToken && (
                        <Image
                          src={
                            tokens.find(
                              (token) => token.value === Number(selectedToken)
                            )?.image || ""
                          }
                          alt={
                            tokens.find(
                              (token) => token.value === Number(selectedToken)
                            )?.label || ""
                          }
                          width={20}
                          height={20}
                          className="mr-2"
                        />
                      )}
                      <select
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className="w-full bg-transparent text-gray-700 font-medium focus:outline-none appearance-none"
                      >
                        {tokens.map((token) => (
                          <option key={token.value} value={token.value}>
                            {token.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voucher Stats */}
              <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-pink-500">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Active Vouchers
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {stats.activeVouchersCount}
                    </h2>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-lg">
                    <CheckCircle className="text-pink-500 h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Redeemed Vouchers
                    </p>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {stats.redeemedVouchersCount}
                    </h2>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <CircleDivide className="text-orange-500 h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher Type Totals Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Voucher Distribution by Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(stats.voucherTypeTotals).map(
                  ([type, amount]) => (
                    <div
                      key={type}
                      className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-indigo-500"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">
                            {type} Vouchers
                          </p>
                          <h2 className="text-3xl font-bold text-gray-800">
                            ${Number(amount).toFixed(2)}
                          </h2>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg">
                          <BadgeDollarSign className="text-indigo-500 h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm text-gray-500">
                          Total amount distributed
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Wallet Balance by Category Section */}
<div className="mt-8">
  <h2 className="text-xl font-semibold text-gray-800 mb-4">
    Wallet Balance by Category
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Object.entries({
      Education: 21500,
      Health: 9800,
      Religion: 97000,
      Children: 80000,
    }).map(([category, balance]) => (
      <div
        key={category}
        className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-green-500"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">{category} Wallet</p>
            <h2 className="text-3xl font-bold text-gray-800">
              ${Number(balance).toFixed(2)}
            </h2>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <BadgeDollarSign className="text-green-500 h-6 w-6" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-sm text-gray-500">Total wallet balance</div>
        </div>
      </div>
    ))}
  </div>
</div>
          </div>
        );
    }
  }, [activeSection, stats, balances, selectedToken, currentDate, tokens]);

  return (
    <div>
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="flex flex-col min-h-screen md:flex-row">
        <div className="md:hidden bg-BgColor text-white p-3 top-0 sticky z-10 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Funders</h1>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div className={`md:flex ${isSidebarOpen ? "block" : "hidden"} block`}>
          <Sidebar setActiveSection={setActiveSection} />
        </div>

        <div className="flex-grow overflow-scroll p-5 bg-gray-100">
          {activeSection === "redirect-to-distribute" && (
            <DonateSection onTabChange={setActiveSection} />
          )}
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

// Wrap the component with React.memo for shallow prop comparison
export default React.memo(AdminDashboard);
