"use client";

import React, { useState } from "react";
import ActiveBeneficiary from "./active/page";
import ApprovedBeneficiary from "./approved/page";
import RejectedBeneficiary from "./rejected/page";
import FundedBeneficiary from "./funded/page";
import AddBeneficiaryForm from "../../../components/AdminDashboard/AddBeneficiary";

export default function ManageBeneficiary({ activeTabs = "all" }) {
  // State to manage the active tab, defaulting to 'Active'
  const [activeTab, setActiveTab] = useState(
    activeTabs === "all" ? "active" : activeTabs
  );

  // Function to conditionally render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "active":
        return <ActiveBeneficiary />;
      case "approved":
        return <ApprovedBeneficiary />;
      case "rejected":
        return <RejectedBeneficiary />;
      case "funded":
        return <FundedBeneficiary />;
      case "addBeneficiary":
        return (
          <AddBeneficiaryForm
            onClose={() => setActiveTab("active")} 
            onSubmit={() => {
              setActiveTab("active"); // Go back to 'Active' tab
              alert("Beneficiary added");
            }}
          />
        );
      default:
        return <ActiveBeneficiary />;
    }
  };

  return (
    <div className=" px-2 md:px-5 py-14 mt-0  md:mt-10 bg-gray-100 min-h-screen">
      {/* Tab Menu */}
      <div className="tabs flex flex-wrap justify-center md:justify-between gap-4 md:gap-6 mb-4">
        <button
          className={`tab py-3 px-8 sm:px-12 md:px-16 rounded-xl tracking-widest font-medium transition-colors text-sm border ${
            activeTab === "active"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 hover:bg-blue-100 border-black"
          }`}
          onClick={() => setActiveTab("active")}
        >
          New
        </button>
        <button
          className={`tab py-3 px-8 sm:px-12 md:px-16 rounded-xl tracking-widest font-medium transition-colors text-sm border ${
            activeTab === "approved"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-600 hover:bg-green-100 border-black"
          }`}
          onClick={() => setActiveTab("approved")}
        >
          Approved
        </button>
        <button
          className={`tab py-3 px-8 sm:px-12 md:px-16 rounded-xl tracking-widest font-medium transition-colors text-sm border ${
            activeTab === "rejected"
              ? "bg-red-600 text-white border-red-600"
              : "bg-white text-gray-600 hover:bg-red-100 border-black"
          }`}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected
        </button>
        <button
          className={`tab py-3 px-8 sm:px-12 md:px-16 rounded-xl tracking-widest font-medium transition-colors text-sm border ${
            activeTab === "funded"
              ? "bg-yellow-600 text-white border-yellow-600"
              : "bg-white text-gray-600 hover:bg-yellow-100 border-black"
          }`}
          onClick={() => setActiveTab("funded")}
        >
          Funded
        </button>
        <button
          className={`tab py-3 px-8 sm:px-12 md:px-16 rounded-xl tracking-widest font-medium transition-colors text-sm border ${
            activeTab === "addBeneficiary"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-orange-400 text-white hover:bg-blue-100 border-black"
          }`}
          onClick={() => setActiveTab("addBeneficiary")}
        >
          Add Beneficiary
        </button>
        
      </div>

      {/* Content Area */}
      <div className="content">{renderContent()}</div>
    </div>
  );
}
