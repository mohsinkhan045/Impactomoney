"use client";
import React, { useState } from "react";
import ActiveServiceProvider from "./active/page"; // Update these imports as needed
import ApprovedServiceProvider from "./approved/page";
import RejectedServiceProvider from "./rejected/page";
import BlackListedServiceProvider from "./blacklisted/page";
import AddServiceProviderForm from "../../../components/AdminDashboard/AddServiceProvider";

export default function ManageServiceProvider({ activeTabs = "all" }) {
  // State to manage the active tab, defaulting to 'active'
  const [activeTab, setActiveTab] = useState(
    activeTabs === "all" ? "active" : activeTabs
  );

  // Function to conditionally render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "active":
        return <ActiveServiceProvider />;
      case "approved":
        return <ApprovedServiceProvider />;
      case "rejected":
        return <RejectedServiceProvider />;
      case "blacklisted":
        return <BlackListedServiceProvider />;
      case "addProvider":
        return (
          <AddServiceProviderForm
            onClose={() => setActiveTab("active")} // Close form and return to Active tab
            onSubmit={() => {
              setActiveTab("active"); // Return to Active tab after submission
              alert("Service added");
            }}
          />
        );
      default:
        return <ActiveServiceProvider />;
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
            activeTab === "blacklisted"
              ? "bg-zinc-600 text-white border-zinc-600"
              : "bg-white text-gray-600 hover:bg-zinc-100 border-black"
          }`}
          onClick={() => setActiveTab("blacklisted")}
        >
          Black Listed
        </button>
        <button
          className={`tab py-3 px-8 sm:px-12 md:px-16 rounded-xl tracking-widest font-medium transition-colors text-sm border ${
            activeTab === "addProvider"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-orange-400 text-white hover:bg-blue-100 border-black"
          }`}
          onClick={() => setActiveTab("addProvider")}
        >
          Add Service Provider
        </button>
      </div>

      {/* Content Area */}
      <div className="content ">{renderContent()}</div>
    </div>
  );
}
