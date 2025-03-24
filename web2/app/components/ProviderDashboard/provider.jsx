"use client";

import { useState } from "react";
import Sidebar from "./providerSidebar";
import ServiceProviderDashboard from "./home";
import BeneficiaryList from "../../(routes)/serviceProvider/beneficiary-list/page";
import ChangePasswordPage from "../../(routes)/serviceProvider/changePassword/page";
import ProviderDetail from "../../(routes)/serviceProvider/provider-detail/page";
import ProviderProfile from "../../(routes)/serviceProvider/profile/page";
import { Menu } from "lucide-react";
import Navbar from "./providerNavbar";

const ProviderDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "serviceProvider":
        return <ServiceProviderDashboard />;
      case "profile":
        return <ProviderProfile />;
      case "change-password":
        return <ChangePasswordPage />;
      case "provider-detail":
        return <ProviderDetail />;
      default:
        return (
          <div className="mt-15">
            <BeneficiaryList />
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

export default ProviderDashboard;