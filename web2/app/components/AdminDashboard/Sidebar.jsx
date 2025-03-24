"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TiThMenu } from "react-icons/ti";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa"; // Import arrow icons
import { cn } from "../../../lib/utils"; // Assuming this is a utility function for class names
import { LayoutDashboard, Users, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { BadgeDollarSign } from "lucide-react";
import Cookies from "js-cookie";
import { ethers } from "ethers";
import Image from "next/image";
import StableCoinABI from "../../contract/StableCoin-usdt.json";
import UAUSDStableCoinABI from "../../contract/StableCoin-uausd.json";
import USDCStableCoinABI from "../../contract/StableCoin-usdc.json";
import PAYPALStableCoinABI from "../../contract/StableCoin-paypal.json";

const Sidebar = ({ setActiveSection }) => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState(null);
  const [usdt, setUsdt] = useState(0);
  const [stableCoinContract, setStableCoinContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); // State to track the active tab
  const pathname = usePathname(); // Get the current pathname

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  useEffect(() => {
    const loadProviderAndContract = async () => {
      try {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);

        const tempSigner = tempProvider.getSigner();
        const stableCoinusdt = new ethers.Contract(
          process.env.NEXT_PUBLIC_STABLE_COIN_USDT_CONTRACT_ADDRESS,
          StableCoinABI.abi,
          tempSigner
        );
        const stableCoinuausd = new ethers.Contract(
          process.env.NEXT_PUBLIC_STABLE_COIN_UAUSD_CONTRACT_ADDRESS,
          UAUSDStableCoinABI.abi,
          tempSigner
        );
        const stableCoinusdc = new ethers.Contract(
          process.env.NEXT_PUBLIC_STABLE_COIN_USDC_CONTRACT_ADDRESS,
          USDCStableCoinABI.abi,
          tempSigner
        );
        const stableCoinpaypal = new ethers.Contract(
          process.env.NEXT_PUBLIC_STABLE_COIN_PAYPALUSDT_CONTRACT_ADDRESS,
          PAYPALStableCoinABI.abi,
          tempSigner
        );

        setStableCoinContract(stableCoinuausd);
        setStableCoinContract(stableCoinusdt);
        setStableCoinContract(stableCoinpaypal);
        setStableCoinContract(stableCoinusdc);
      } catch (error) {
        console.error("Error initializing contract:", error);
      }
    };

    loadProviderAndContract();
  }, []);
  const router = useRouter();

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

  const handleLogout = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        console.error("Token not found in cookies.");
        return;
      }

      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        Cookies.remove("authToken");
        Cookies.remove("userData");
        setAccount(null);
        setIsConnected(false);
        setShowMenu(false);
        router.push("/login");
      } else {
        console.error("Logout failed:", await response.json());
      }
    } catch (error) {
      console.error("Error logging out:", error);
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
  const handleTabClick = (tab) => {
    setActiveTab(tab); // Update the active tab
    setActiveSection(tab); // Set the active section
    // setIsOpen(false); // Close the sidebar on mobile
  };

  return (
    <div className="bg-BgColor md:pt-20 w-full md:w-auto">
      <div
        className={`flex flex-col ${
          isOpen ? "w-64" : "w-16" // Adjust width when open/closed
        } transition-all duration-300 text-white h-full`}
      >
        {/* Toggle Sidebar Button at the Top  */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex items-center justify-between p-3 w-full text-white hover:bg-white/10 rounded-lg transition"
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

        {/* MetaMask Connection Button */}
        <div className="md:hidden w-full flex  items-start justify-center p-3">
          <button
            onClick={isConnected ? null : connect}
            className={`w-full border-b rounded-xl text-left border-gray-500 pb-2 p-2 flex items-center ${
              isConnected ? "bg-green-200" : "bg-orange-200"
            } hover:bg-orange-300`}
            disabled={isConnected}
          >
            <Image
              src={"/metamask.png"}
              alt="metamask logo"
              width={24}
              height={24}
              className="flex items-center mr-2"
            />
            <span>{isConnected ? "Connected" : "Connect Wallet"}</span>
          </button>
      
        </div>

        {/* Sidebar Menu Items */}
        <div className="space-y-4 py-3 flex flex-col">
          <div className="px-3 py-2 flex-1">
            <div className="space-y-1">
              {/* Dashboard Button */}
              <button
                onClick={() => handleTabClick("dashboard")}
                className={cn(
                  "text-sm flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-xl transition",
                  activeTab === "dashboard"
                    ? "bg-white/10 text-white rounded-xl"
                    : "text-white"
                )}
              >
                {isOpen && (
                  <LayoutDashboard className="h-5 w-5 mr-3 text-blue-500" />
                )}
                {isOpen && "Dashboard"}
              </button>

              {/* Manage Beneficiaries */}
              <button
                onClick={() => handleTabClick("manage-beneficiary")}
                className={cn(
                  "flex items-center w-full p-3 hover:bg-white/10 rounded-xl transition",
                  activeTab === "manage-beneficiary"
                    ? "bg-white/10 text-white rounded-xl"
                    : "text-white"
                )}
              >
                {isOpen && <Users className="h-5 w-5 mr-3 text-violet-500" />}
                {isOpen && "Beneficiaries"}
              </button>

              {/* Manage Providers */}
              <button
                onClick={() => handleTabClick("manage-providers")}
                className={cn(
                  "flex items-center w-full p-3 hover:bg-white/10 rounded-xl transition",
                  activeTab === "manage-providers"
                    ? "bg-white/10 text-white rounded-xl"
                    : "text-white"
                )}
              >
                {isOpen && <Users className="h-5 w-5 mr-3 text-emerald-700" />}
                {isOpen && "Service Providers"}
              </button>

              {/* Distribute NFT Button */}
              <button
                onClick={() => handleTabClick("donate-voucher")}
                className={cn(
                  "flex items-center w-full p-3 hover:bg-white/10 rounded-xl transition",
                  activeTab === "donate-voucher"
                    ? "bg-white/10 text-white rounded-xl"
                    : "text-white"
                )}
              >
                {isOpen && (
                  <TiThMenu className="h-5 w-5 mr-3 text-emerald-700" />
                )}
                {isOpen && "Issue Vouchers"}
              </button>

              {/* Issued Vouchers Beneficiary Button */}
              <button
                onClick={() => handleTabClick("issued-voucher")}
                className={cn(
                  "flex items-center w-full p-3 hover:bg-white/10 rounded-xl transition",
                  activeTab === "issued-voucher"
                    ? "bg-white/10 text-white rounded-xl"
                    : "text-white"
                )}
              >
                {isOpen && (
                  <BadgeDollarSign className="h-5 w-5 mr-3 text-yellow-700" />
                )}
                {isOpen && "Issued Vouchers"}
              </button>

              {/* Other buttons follow the same pattern */}
              <button
                onClick={() => handleTabClick("distribute-voucher")}
                className={cn(
                  "flex items-center w-full p-3 hover:bg-white/10 rounded-xl transition",
                  activeTab === "distribute-voucher"
                    ? "bg-white/10 text-white rounded-xl"
                    : "text-white"
                )}
              >
                {isOpen && (
                  <BadgeDollarSign className="h-5 w-5 mr-3 text-yellow-700" />
                )}
                {isOpen && "Distribute Vouchers"}
              </button>
              {/* Other buttons follow the same pattern */}
              <button
                onClick={() => handleTabClick("transfer-token")}
                className={cn(
                  "flex items-center w-full p-3 hover:bg-white/10 rounded-xl transition",
                  activeTab === "transfer-token"
                    ? "bg-white/10 text-white rounded-xl"
                    : "text-white"
                )}
              >
                {isOpen && (
                  <BadgeDollarSign className="h-5 w-5 mr-3 text-yellow-700" />
                )}
                {isOpen && "Transfer Token"}
              </button>
              {/* Other buttons follow the same pattern */}
              <button
                onClick={() => handleTabClick("temp")}
                className={cn(
                  "flex items-center w-full p-3 hover:bg-white/10 rounded-xl transition",
                  activeTab === "temp"
                    ? "bg-white/10 text-white rounded-xl"
                    : "text-white"
                )}
              >
                {isOpen && (
                  <BadgeDollarSign className="h-5 w-5 mr-3 text-yellow-700" />
                )}
                {isOpen && "Temp"}
              </button>

              <button
                onClick={() => handleTabClick("distributed-voucher")}
                className={cn(
                  "flex items-center w-full p-3 hover:bg-white/10 rounded-xl transition",
                  activeTab === "distributed-voucher"
                    ? "bg-white/10 text-white rounded-xl"
                    : "text-white"
                )}
              >
                {isOpen && (
                  <BadgeDollarSign className="h-5 w-5 mr-3 text-yellow-700" />
                )}
                {isOpen && "Distributed Vouchers"}
              </button>

              <button
                onClick={() => handleTabClick("expired-voucher")}
                className={cn(
                  "flex items-center w-full p-3 hover:bg-white/10 rounded-xl transition",
                  activeTab === "expired-voucher"
                    ? "bg-white/10 text-white rounded-xl"
                    : "text-white"
                )}
              >
                {isOpen && (
                  <BadgeDollarSign className="h-5 w-5 mr-3 text-yellow-700" />
                )}
                {isOpen && "Expired Vouchers"}
              </button>
              <button
                onClick={() => handleTabClick("revoked-voucher")}
                className={cn(
                  "flex items-center w-full p-3 hover:bg-white/10 rounded-xl transition",
                  activeTab === "revoked-voucher"
                    ? "bg-white/10 text-white rounded-xl"
                    : "text-white"
                )}
              >
                {isOpen && (
                  <BadgeDollarSign className="h-5 w-5 mr-3 text-yellow-700" />
                )}
                {isOpen && "Revoked Vouchers"}
              </button>

              {/* Settings Button */}
              <button
                onClick={() => handleTabClick("setting")}
                className={cn(
                  "flex items-center w-full p-3 hover:bg-white/10 rounded-xl transition",
                  activeTab === "setting"
                    ? "bg-white/10 text-white rounded-xl"
                    : "text-white"
                )}
              >
                {isOpen && (
                  <Settings className="h-5 w-5 mr-3 text-violet-500" />
                )}
                {isOpen && "Settings"}
              </button>

             
            </div>
          </div>
        </div>
        {/* Logout Button at the Bottom */}
        <div className="md:hidden flex items-center justify-center p-3">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 text-white hover:bg-white/10 rounded-xl transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
