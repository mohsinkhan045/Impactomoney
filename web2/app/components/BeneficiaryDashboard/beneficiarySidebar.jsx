"use client";
import { useState } from "react";
import { TiThMenu } from "react-icons/ti";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa"; // Import arrow icons
import { cn } from "../../../lib/utils"; // Assuming this is a utility function for class names
import { LayoutDashboard, Users, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const Sidebar = ({ setActiveSection }) => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname(); // Get the current pathname

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <div className="bg-BgColor h-full  w-full md:w-auto ">
      <div
        className={`flex flex-col ${
          isOpen ? "w-64" : "w-16" // Adjust width when open/closed
        } transition-all duration-300 text-white h-full`}
      >
        {/* Toggle Sidebar Button at the Top  */}
        <button
          onClick={toggleSidebar}
          className=" hidden md:flex items-center justify-between p-3 w-full text-white hover:bg-white/10 rounded-lg transition mb-4"
        >
          {isOpen ? (
            <>
              <TiThMenu size={24} />
              <FaChevronLeft size={16} className="ml-auto" />
            </>
          ) : (
            <>
              <TiThMenu size={24} />
              <FaChevronRight size={16} className="ml-auto" />{" "}
              {/* Right arrow */}
            </>
          )}
        </button>

        {/* Sidebar Menu Items */}
        <div className="space-y-4 py-4 flex flex-col ">
          <div className="px-3 py-2 flex-1">
            <div className="space-y-1">
              {/* Dashboard Button */}
              <button
                onClick={() => {
                  setActiveSection("voucher-list");
                  // setIsOpen(false);
                }} // Removed toggleSidebar here
                className={cn(
                  "text-sm flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                  pathname === "/serviceProvider/beneficiary-list" // Adjust active state
                    ? "text-white bg-white/10"
                    : "text-white"
                )}
              >
                {isOpen && (
                  <LayoutDashboard className="h-5 w-5 mr-3 text-blue-500" />
                )}
                {isOpen && "Voucher List"}
              </button>

              {/* Manage Beneficiaries */}
              <button
                onClick={() => {
                  setActiveSection("profile");
                  // setIsOpen(false);
                }} // Removed toggleSidebar here
                className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg transition"
              >
                {isOpen && <Users className="h-5 w-5 mr-3 text-violet-500" />}
                {isOpen && "Profile"}
              </button>
              {/* Manage Beneficiaries */}
              {/* <button
                onClick={() => {
                  setActiveSection("serviceProvider");
                  // setIsOpen(false);
                }} // Removed toggleSidebar here
                className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg transition"
              >
                {isOpen && <Users className="h-5 w-5 mr-3 text-violet-500" />}
                {isOpen && "Service Provider"}
              </button> */}

              {/* Manage Providers */}
              <button
                onClick={() => {
                  setActiveSection("my-application");
                  // setIsOpen(false);
                }} // Removed toggleSidebar here
                className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg transition"
              >
                {isOpen && <Users className="h-5 w-5 mr-3 text-emerald-700" />}
                {isOpen && "My Applicaiton"}
              </button>

              {/* Distribute NFT Button */}
              <button
                onClick={() => {
                  setActiveSection("change-password");
                  // setIsOpen(false); // Optionally, toggle the sidebar here if needed
                }}
                className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg transition"
              >
                {isOpen && (
                  <TiThMenu className="h-5 w-5 mr-3 text-emerald-700" />
                )}
                {isOpen && "Change Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

