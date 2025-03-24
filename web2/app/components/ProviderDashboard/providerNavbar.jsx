/*
---------------------------------------------------
Project:        FundingProject
Date:           Dec 01, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file handles the provider navbar.
---------------------------------------------------
*/
"use client";
import Image from "next/image";
import Cookies from "js-cookie";
import StableCoinABI from "../../contract/StableCoin-usdt.json";
import UAUSDStableCoinABI from "../../contract/StableCoin-uausd.json";
import USDCStableCoinABI from "../../contract/StableCoin-usdc.json";
import PAYPALStableCoinABI from "../../contract/StableCoin-paypal.json";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { IoMdLogOut } from "react-icons/io";
import { TiThMenu} from "react-icons/ti";
import { LayoutDashboard, Users, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { cn } from "../../../lib/utils"; // Assuming this is a utility function for class names
import { AiOutlineMenu } from "react-icons/ai"; // Import menu icon

const Navbar = ({ setActiveSection }) => {
  const pathname = usePathname(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [redeemedAmount, setRedeemedAmount] = useState(0); // Static amount initially
  const [totalBalance, setTotalBalance] = useState(0); // Total Balance (Wallet + Redeemed)
  const [loading, setLoading] = useState(false); // Add loading state for fetching
  const [stableCoinContract, setStableCoinContract] = useState(null);
  const [seletedCoin, setSelectedCoin] = useState(3);
  const [provider, setProvider] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const router = useRouter();

  const token = Cookies.get("authToken");

  // Add the formatting function at component scope
  const formatVerySmallNumber = (num) => {
    if (num === 0) return "0.00";
    if (num < 0.00001) {
      // Convert to string and remove trailing zeros
      return num.toFixed(18).replace(/\.?0+$/, "");
    }
    // For regular numbers, use standard formatting
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
      
    });
    
  };
  

  // Handle Profile Dropdown Toggle
  const handleProfileClick = () => {
    setIsDropdownOpen((prev) => !prev);
  };
  const stableCoins = [
    {
      name: "USDT",
      address: process.env.NEXT_PUBLIC_STABLE_COIN_USDT_CONTRACT_ADDRESS,
      abi: StableCoinABI.abi,
    },
    {
      name: "USDC",
      address: process.env.NEXT_PUBLIC_STABLE_COIN_USDC_CONTRACT_ADDRESS,
      abi: USDCStableCoinABI.abi,
    },
    {
      name: "PYUSD",
      address: process.env.NEXT_PUBLIC_STABLE_COIN_PAYPALUSDT_CONTRACT_ADDRESS,
      abi: PAYPALStableCoinABI.abi,
    },
    {
      name: "AECoin",
      address: process.env.NEXT_PUBLIC_STABLE_COIN_UAUSD_CONTRACT_ADDRESS,
      abi: UAUSDStableCoinABI.abi,
    },
  ];

  useEffect(() => {
    const loadProviderAndContract = async () => {
      try {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);
        const tempSigner = tempProvider.getSigner();
        const balances = []; // Array to store balances

        console.log("🔄 Checking stable coins...");

        for (const coin of stableCoins) {
          console.log(`⏳ Fetching contract for: ${coin.name}`);

          // Create contract instance
          const contract = new ethers.Contract(
            coin.address,
            coin.abi,
            tempSigner
          );
          console.log(`✅ Contract loaded for ${coin.name}:`, contract);

          // Get user wallet address
          const userAddress = await tempSigner.getAddress();
          console.log(`👤 User Address: ${userAddress}`);

          // Fetch balance
          const userBalance = await contract.balanceOf(userAddress);
          const formattedBalance = ethers.utils.formatUnits(userBalance, 18);
          console.log(`💰 ${coin.name} Balance: ${formattedBalance}`);
          balances.push(Number(formattedBalance));

          // Fix BigNumber comparison
          if (userBalance.gt(0)) {
            // .gt() is used for BigNumber comparison
            console.log(`🎯 Selecting ${coin.name} as the active stable coin`);
            setStableCoinContract(contract);
            setSelectedCoin(coin.name);
          }
        }

        // Sum up all balances and set the total wallet balance
        const totalBalance = balances.reduce(
          (sum, balance) => sum + balance,
          0
        );
        setWalletBalance(totalBalance);
      } catch (error) {
        console.error("❌ Error initializing contract:", error);
      }
    };

    loadProviderAndContract();
  }, []);

  const fetchRedeemedAmount = async () => {
    setLoading(true); // Set loading to true before the API call
    try {
      if (!token) {
        console.error("No auth token found.");
        setRedeemedAmount(null);
        return;
      }
      const response = await fetch(
        "/api/user/serviceProvider/getRedeemedBeneficiaries",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch Redeemed balance");
      }

      // Ensure the data has the expected structure
      if (Array.isArray(data.data)) {
        const totalAmount = data.data.reduce(
          (sum, beneficiary) => sum + (beneficiary.amount || 0),
          0
        );
        console.log("Total redeemed amount:", totalAmount);
        setRedeemedAmount(totalAmount); // Set the total redeemed amount
      } else {
        console.error("Unexpected data format:", data);
      }
    } catch (error) {
      setRedeemedAmount(0); // Set the total redeemed amount
      console.error("Error fetching redeemed amount:", error.message);
    } finally {
      setLoading(false); // Stop loading after API call
    }
  };

  useEffect(() => {
    fetchRedeemedAmount();
  }, [redeemedAmount]);
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
  // Connect MetaMask Wallet
  const connect = async () => {
    if (!isEthereumExists()) {
      alert("Please install MetaMask.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        checkMetaMaskConnection(accounts[0]);
      } else {
        setError("No accounts found.");
      }
    } catch (err) {
      setError("Failed to connect MetaMask.");
      console.error("Connection error:", err);
    }
  };

  // Fetch Redeemed Amount and Wallet Connection on Load
  useEffect(() => {
    fetchRedeemedAmount();
    if (isEthereumExists()) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          checkMetaMaskConnection(accounts[0]);
        }
      });
    }
  }, []);
  // Fetch Total Balance (Wallet + Redeemed)
  useEffect(() => {
    if (isConnected) {
      // Debug logs
      console.log("Wallet Balance:", walletBalance, typeof walletBalance);
      console.log("Redeemed Amount:", redeemedAmount, typeof redeemedAmount);

      // Ensure both values are proper numbers
      const walletValue = parseFloat(walletBalance) || 0;
      const redeemedValue = parseFloat(redeemedAmount) || 0;
      
      const totalUSD = walletValue + redeemedValue;
      console.log("Calculated Total:", totalUSD);

      // Only format if we have a valid number
      if (!isNaN(totalUSD)) {
        const formattedTotal = formatVerySmallNumber(totalUSD);
        console.log("Formatted Total:", formattedTotal);
        setTotalBalance(totalUSD);
      } else {
        console.error("Invalid total calculation:", { walletBalance, redeemedAmount });
        setTotalBalance(0);
      }
    }
  }, [walletBalance, redeemedAmount, isConnected]);

  const handleLogout = async () => {
    try {
      if (!token) {
        console.error("Token not found in cookies.");
        return;
      }

      const response = await fetch("/api/user/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Attach token from cookies if saved there
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

  return (
    <header className="bg-blue-200 shadow-lg p-2 sticky top-0 z-10">
      <nav className="flex justify-between items-center px-4">
        {/* Left side logo */}
        <div className="flex items-center">
          <Image
            src={"/bg-remove-logo.png"}
            alt={"logo"}
            width={100}
            height={50}
            className="w-full max-w-md rounded-full"
          />
        </div>

        {/* Redeemed Amount and Profile Section */}
        <div className="flex items-center space-x-4">
          {/* Redeemed Amount Display */}
          <div className="text-gray-800 font-semibold">
            {loading
              ? "Loading..."
              : `Balance: $ ${
                  totalBalance
                    ? formatVerySmallNumber(Number(totalBalance))
                    : "0.00"
                }`}
          </div>
           {/* Mobile Menu Button */}
           <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <AiOutlineMenu size={30} />
          </button>

          {/* Profile Section */}
          <div className="relative hidden md:flex">
            <button
              className="flex items-center focus:outline-none"
              onClick={handleProfileClick}
            >
              <Image
                src="/metamask.png"
                alt="Profile Picture"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-blue-600 shadow-md object-cover"
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-16 bg-white shadow-lg rounded-xl p-4 w-48">
                <ul className="py-1 text-gray-700">
                  <li className="py-2">
                    <button
                      onClick={isConnected ? null : connect}
                      className={`w-full border-b text-left border-gray-500 pb-2 p-2 flex items-center ${
                        isConnected ? "bg-green-200" : "bg-orange-200"
                      } hover:bg-orange-300`}
                      disabled={isConnected}
                    >
                      <Image
                        src={"/metamask.png"}
                        alt="metamask logo"
                        width={24}
                        height={24}
                        className="flex items-center"
                      />
                      <span>
                        {isConnected ? "Connected" : "Connect Wallet"}
                      </span>
                    </button>
                    </li>
                    <li className="py-2">
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
        <div className="fixed inset-0 bg-BgColor   shadow-lg p-4 z-20 top-16 md:hidden">
          <ul className="text-white">
            <li className="py-2">
              <button
                onClick={async () => {
                  if (!account) {
                    await connect();
                  }
                  setIsMobileMenuOpen(false); // 👈 Menu Auto-Close
                }}
                className={`flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg ${account ? "bg-green-200 text-black" : "bg-orange-100 text-black"
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
                  setActiveSection("beneficiary-list");
                  setIsMobileMenuOpen(false); // 👈 Menu Auto-Close
                }}
                className={
                  "flex p-3 w-full justify-start font-medium cursor-pointer  hover:bg-white/10 rounded-lg transition"}
              >
                <LayoutDashboard className="h-5 w-5 mr-3 text-blue-500 "/>
                Beneficiary List
              </button>
            </li>
            <li className="py-2">
              <button
                onClick={() => {
                  setActiveSection("profile");
                  setIsMobileMenuOpen(false); // 👈 Menu Auto-Close
                }}
                className="flex p-3 w-full justify-start font-medium cursor-pointer  hover:bg-white/10 rounded-lg transition"
              >
                <Users className="h-5 w-5 mr-3 text-violet-500" />
                Profile
              </button>
            </li>
            <li className="py-2">
              <button
                onClick={() => {
                  setActiveSection("change-password");
                  setIsMobileMenuOpen(false); // 👈 Menu Auto-Close
                }}
                className="flex p-3 w-full justify-start font-medium cursor-pointer  hover:bg-white/10 rounded-lg transition"
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
