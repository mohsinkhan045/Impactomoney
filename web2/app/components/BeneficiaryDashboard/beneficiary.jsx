"use client";

import { useState } from "react";
import Sidebar from "./beneficiarySidebar";
import ChangePasswordPage from "../../(routes)/beneficiary/changePassword/page"
import VoucherListPage from "../../(routes)/beneficiary/voucherList/page"
import BeneficiaryProfile from "../../(routes)/beneficiary/profile/page"
import MyApplication from "../../(routes)/beneficiary/myApplication/page"
import Navbar from "./navbar";

const BeneficairyDashboard = () => {
  const [activeSection, setActiveSection] = useState("voucher-list");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <BeneficiaryProfile />;
      case "change-password":
        return <ChangePasswordPage />;
      case "my-application":
        return <MyApplication />;
      default:
        return (
          <div className="mt-15">
            <VoucherListPage />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="sticky top-0 left-0 right-0 z-10">
        <Navbar setActiveSection={setActiveSection}/>
      </div>

      {/* Main Content */}
      <div className="flex flex-grow ">
        {/* Sidebar */}
        <div className={`md:block ${isSidebarOpen ? "block" : "hidden"}`}>
          <Sidebar setActiveSection={setActiveSection} />
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-auto p-5 bg-gray-100">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default BeneficairyDashboard;