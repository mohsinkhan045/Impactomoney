"use client";
import React, { useState } from 'react';
import ActiveVouchers from "./active/page";
import RedeemedVouchers from "./redeemed/page"
import ExpiredVouchers from "./expired/page"
import RevokedVouchers from "./revoked/page"
export default function ManageVouchers() {
   // State to manage the active tab, defaulting to 'Active'
   const [activeTab, setActiveTab] = useState('active');

   // Function to conditionally render content based on the active tab
   const renderContent = () => {
     switch (activeTab) {
       case 'active':
         return <ActiveVouchers />;
       case 'redeemed':
         return <RedeemedVouchers />;
       case 'expired':
         return <ExpiredVouchers />;
       case 'revoked':
         return <RevokedVouchers />;
       
       default:
         return <RedeemedVouchers />;
     }
   };
  return (
    <div className="manage-beneficiary p-5 mt-10 bg-gray-100 ml-7 min-h-screen">
    {/* <h1 className="text-3xl font-bold text-gray-800 mb-6">VOUCHERS</h1> */}
    
    {/* Tab Menu */}
    <div className="tabs flex justify-center space-x-6 mb-4">
      <button
        className={`tab px-11 py-2 rounded-xl tracking-widest font-medium transition-colors 
          ${activeTab === 'active' 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-600 hover:bg-blue-100'
          }`}
        onClick={() => setActiveTab('active')}
      >
        Active
      </button>
      <button
        className={`tab px-11 py-2 rounded-xl tracking-widest font-medium transition-colors 
          ${activeTab === 'redeemed' 
            ? 'bg-green-600 text-white' 
            : 'bg-white text-gray-600 hover:bg-green-100'
          }`}
        onClick={() => setActiveTab('redeemed')}
      >
        Redeemed Vouchers
      </button>
      <button
        className={`tab px-11 py-2 rounded-xl tracking-widest font-medium transition-colors 
          ${activeTab === 'expired' 
            ? 'bg-red-600 text-white' 
            : 'bg-white text-gray-600 hover:bg-red-100'
          }`}
        onClick={() => setActiveTab('expired')}
      >
        Expired Vouchers
      </button>
      <button
        className={`tab px-11 py-2 rounded-xl tracking-widest font-medium transition-colors 
          ${activeTab === 'revoked' 
            ? 'bg-yellow-600 text-white' 
            : 'bg-white text-gray-600 hover:bg-yellow-100'
          }`}
        onClick={() => setActiveTab('revoked')}
      >
        Revoked Vouchers
      </button>
      
    </div>

    {/* Content Area */}
    <div className="content p-6 bg-white rounded-lg shadow-md">
      {renderContent()}
    </div>
  </div>
  )
}
