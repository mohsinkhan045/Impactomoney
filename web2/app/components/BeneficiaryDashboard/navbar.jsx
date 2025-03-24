/*
---------------------------------------------------
Project:        FundingProject
Date:           Dec 01, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file handles the beneficiary navbar.
---------------------------------------------------
*/
"use client";
import Image from "next/image";
import Cookies from "js-cookie";
import { TiThMenu } from "react-icons/ti";
import { IoMdLogOut } from "react-icons/io";
import { LayoutDashboard, Users, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "../../../lib/utils"; // Assuming this is a utility function for class names
import { AiOutlineMenu } from "react-icons/ai"; // Import menu icon
const Navbar = ({ setActiveSection }) => {
  const pathname = usePathname(); // Get the current pathname
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Manage dropdown state
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [redeemedAmount, setRedeemedAmount] = useState(0); // Static amount initially
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state for fetching
  const [walletAddress, setWalletAddress] = useState(null);
  const [totalVoucherAmount, setTotalVoucherAmount] = useState(0); // For Navbar
  const [totalTransferredAmount, setTotalTransferredAmount] = useState(0);
  const [voucherCategory, setVoucherCategory] = useState("");
  const dropdownRef = useRef(null); // To track dropdown element
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const handleProfileClick = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const isEthereumExists = () =>
    typeof window !== "undefined" && window.ethereum;

  const checkMetaMaskConnection = async () => {
    if (isEthereumExists()) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        console.error("Error checking connection:", err);
        setError("Failed to check MetaMask connection.");
      }
    }
  };

  const connect = async () => {
    setError("");

    if (!isEthereumExists()) {
      setError("Please install MetaMask.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      } else {
        setError("No accounts found.");
      }
    } catch (err) {
      setError("Failed to connect MetaMask.");
      console.error("Connection error:", err);
    }
  };

  useEffect(() => {
    if (!account) {
      setShowMenu(false);
    }
  }, [account]);

  useEffect(() => {
    checkMetaMaskConnection();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const authToken = Cookies.get("authToken");
  useEffect(() => {
    const fetchBeneficiaryData = async () => {
      try {
        const response = await fetch("/api/beneficiary", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }); // Replace with your API endpoint

        const data = await response.json();

        if (response.ok) {
          setWalletAddress(data.data.wallet_address); // Assuming the wallet address is in the response
          setVoucherCategory(data.data.voucherCategory);
          console.log("Wallet Address fetched:", data.data.wallet_address);
        } else {
          console.error("Failed to fetch beneficiary data:", data.message);
        }
      } catch (error) {
        console.error("An unexpected error occurred:", error.message);
      }
    };

    fetchBeneficiaryData();
  }, []); // Runs once on mount

  const fetchData = async (walletAddress) => {
    const authToken = Cookies.get("authToken");
    try {
      if (voucherCategory === "Religion") {
        const response = await fetch(
          `/api/user/beneficiary/getTransferedToken?wallet_address=${walletAddress}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        const data = await response.json();
        if (response.ok) {
          const activeTokens = data.data.filter(
            (token) => token.status === "approved"
          );
          const total = activeTokens.reduce(
            (sum, token) => sum + token.amount,
            0
          );
          setTotalTransferredAmount(total);
        } else {
          console.error("Failed to fetch transferred tokens:", data.message);
        }
      } else {
        const response = await fetch(
          `/api/user/beneficiary/getVouchers?wallet_address=${walletAddress}`
        );
        const data = await response.json();
        if (response.ok) {
          const activeVouchers = data.data.filter(
            (voucher) => voucher.status === "active"
          );
          const total = activeVouchers.reduce(
            (sum, voucher) => sum + voucher.amount,
            0
          );
          setTotalVoucherAmount(total);
        } else {
          console.error("Failed to fetch vouchers:", data.message);
        }
      }
    } catch (error) {
      console.error(
        "An unexpected error occurred while fetching data:",
        error.message
      );
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchData(walletAddress);
    }
  }, [walletAddress, voucherCategory]);

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        console.error("Token not found in cookies.");
        return;
      }

      const response = await fetch("/api/user/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Attach token from cookies
        },
      });

      if (response.ok) {
        Cookies.remove("authToken"); // Remove token cookie
        Cookies.remove("userData"); // Clear any other saved data
        router.push("/login"); // Redirect to login page
      } else {
        console.error("Logout failed:", await response.json());
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Handle MetaMask wallet connection
  const handleWalletClick = async () => {
    try {
      if (!window.ethereum) {
        alert("Ethereum provider not found.");
        return;
      }
      await connect(); // Use the connect method from the useWallet hook
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return (
    <header className="bg-blue-200 shadow-lg p-2 sticky top-0 z-10">
      <nav className="flex justify-between items-center px-2">
        {/* Logo */}
        <div className="">
          <Image
            src={"/bg-remove-logo.png"}
            alt={"logo"}
            width={100}
            height={50}
            className="w-full  rounded-full"
          />
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Redeemed Amount Display */}
          <div className="text-gray-800 text-sm  md:font-semibold">
            {loading
              ? "Loading..."
              : voucherCategory === "Religion"
              ? `Total Transferred Amount: $ ${Number(
                  totalTransferredAmount
                ).toFixed(2)}`
              : `Total Voucher Amount: $ ${Number(totalVoucherAmount).toFixed(
                  2
                )}`}
          </div>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <AiOutlineMenu size={30} />
          </button>

          {/* Profile Icon and Dropdown */}
          <div className="relative hidden md:flex">
            {/* Profile Icon */}
            <button className="focus:outline-none" onClick={handleProfileClick}>
              <Image
                src="/metamask.png"
                alt="Profile Icon"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-blue-600 shadow-md object-cover"
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-16 bg-white bg-opacity-95 shadow-lg rounded-xl p-4 w-48 z-50 transition-all duration-300 ease-in-out">
                <ul className="text-gray-700">
                  <li className="py-2">
                    <button
                      onClick={async () => {
                        if (!account) {
                          await connect();
                        }
                        setShowMenu(!showMenu);
                      }}
                      className={`w-full text-left flex items-center px-2 py-2 rounded-lg ${
                        account ? "bg-green-100" : "bg-orange-100"
                      } hover:bg-orange-200 transition duration-200`}
                    >
                      <Image
                        src={"/metamask.png"}
                        alt="MetaMask"
                        width={15}
                        height={15}
                        className="mr-2"
                      />
                      {account ? "Connected" : "Connect Wallet"}
                    </button>
                  </li>

                  <li className="py-2 ">
                    <button
                      className="w-full text-left flex text-lg hover:bg-red-200 transition duration-200 text-red-600 items-center px-2 py-2 rounded-lg"
                      onClick={handleLogout}
                    >
                      < IoMdLogOut  className="text-purple-500 mr-2" />
                      Logout
                    </button>
                    </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-BgColor    shadow-lg p-4 z-20 top-16 md:hidden">
          <ul className="text-white">
            <li className="py-2">
              <button
                onClick={async () => {
                  if (!account) {
                    await connect();
                  }
                  setIsMobileMenuOpen(false); // 👈 Menu Auto-Close
                }}
                className={`flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg ${
                  account ? "bg-green-100 text-black" : "bg-orange-100 text-black"
                } hover:bg-orange-200 transition duration-200`}
              >
                <Image
                  src={"/metamask.png"}
                  alt="MetaMask"
                  width={15}
                  height={15}
                  className="mr-2"
                />
                {account ? "Connected" : "Connect Wallet"}
              </button>
            </li>

            {/* Always display other sidebar options */}
            <li className="py-2">
              <button
                onClick={() => {
                  setActiveSection("voucher-list");
                  setIsMobileMenuOpen(false); // 👈 Menu Auto-Close
                }}
                className={"flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition"}
              >
                <LayoutDashboard className="h-5 w-5 mr-3 text-blue-500" />
                Voucher List
              </button>
            </li>
            <li className="py-2">
              <button
                onClick={() => {
                  setActiveSection("profile");
                  setIsMobileMenuOpen(false); // 👈 Menu Auto-Close
                }}
                className=" flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition"
              >
                <Users className="h-5 w-5 mr-3 text-violet-500" />
                Profile
              </button>
            </li>
            <li className="py-2">
              <button
                onClick={() => {
                  setActiveSection("my-application");
                  setIsMobileMenuOpen(false); // 👈 Menu Auto-Close
                }}
                className=" flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition"
              >
                <Users className="h-5 w-5 mr-3 text-emerald-700" />
                My Application
              </button>
            </li>
            <li className="py-2">
              <button
                onClick={() => {
                  setActiveSection("change-password");
                  setIsMobileMenuOpen(false); // 👈 Menu Auto-Close
                }}
                className=" flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition"
              >
                <TiThMenu className="h-5 w-5 mr-3 text-emerald-700" />
                Change Password
              </button>
            </li>
            <li className="py-2">
              <button
                className=" flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-white/10 rounded-lg transition"
                onClick={handleLogout}
              >
                <IoMdLogOut className="h-5 w-5 mr-3 text-purple-500" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
