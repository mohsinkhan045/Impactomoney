"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ethers } from "ethers";
import StableCoinABI from "../../contract/StableCoin-usdt.json";
import UAUSDStableCoinABI from "../../contract/StableCoin-uausd.json";
import USDCStableCoinABI from "../../contract/StableCoin-usdc.json";
import PAYPALStableCoinABI from "../../contract/StableCoin-paypal.json";

const Navbar = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState(null);
  const [usdc, setUsdc] = useState(0);
  const [stableCoinContract, setStableCoinContract] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const loadProviderAndContract = async () => {
      try {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);
  
        const tempSigner = tempProvider.getSigner();
        // const stableCoinusdt = new ethers.Contract(
        //   process.env.NEXT_PUBLIC_STABLE_COIN_USDT_CONTRACT_ADDRESS,
        //   StableCoinABI.abi,
        //   tempSigner
        // );
        // const stableCoinuausd = new ethers.Contract(
        //   process.env.NEXT_PUBLIC_STABLE_COIN_UAUSD_CONTRACT_ADDRESS,
        //   UAUSDStableCoinABI.abi,
        //   tempSigner
        // );
        const stableCoinusdc = new ethers.Contract(
          process.env.NEXT_PUBLIC_STABLE_COIN_USDC_CONTRACT_ADDRESS,
          USDCStableCoinABI.abi,
          tempSigner
        );
        // const stableCoinpaypal = new ethers.Contract(
        //   process.env.NEXT_PUBLIC_STABLE_COIN_PAYPALUSDT_CONTRACT_ADDRESS,
        //   PAYPALStableCoinABI.abi,
        //   tempSigner
        // );
        
        // setStableCoinContract(stableCoinuausd);
        // setStableCoinContract(stableCoinusdt);
        // setStableCoinContract(stableCoinpaypal);
        setStableCoinContract(stableCoinusdc);
      } catch (error) {
        console.error("Error initializing contract:", error);
      }
    };

    loadProviderAndContract();
  }, []);

  // console.log("This is stable coin contract address",stableCoinContract)
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!stableCoinContract) return;
      console.log("Contract or Provider not initialized.");

      try {
    const signer = provider.getSigner();
    const address = await signer.getAddress(); // Dynamically fetch connected wallet
    console.log("Connected Wallet Address:", address);

    const balance = await stableCoinContract.balanceOf(address);
    console.log("Raw Balance:", balance.toString());

    const formattedBalance = ethers.utils.formatUnits(balance, 18);
    console.log("Formatted Balance:", formattedBalance);
    
    console.log("USDT Balance:", formattedBalance);
    setUsdc(formattedBalance);
      } catch (error) {
        console.error("Error fetching USDT balance:", error);
      }
    };

    if (stableCoinContract) {
      fetchTokenBalance();
    }
  }, [stableCoinContract]);
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

  return (
    <nav className="bg-blue-200 text-black shadow-md px-5 sticky z-50 top-0 w-full">
      <div className="flex items-center justify-between p-2">
        {/* Left - Logo */}
        <div className="flex items-center">
          <Image
            src={"/bg-remove-logo.png"}
            alt={"logo"}
            width={100}
            height={40}
            className="w-full max-w-md rounded-full"
          />
        </div>

        {/* Right - Profile Icon */}
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold flex items-center gap-1">Wallet Balance: {Number(usdc).toFixed(2)} USD </p>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center"
          >
            <Image
              src={"/removedbg.png"}
              alt="Profile Icon"
              width={48}
              height={48}
              className="rounded-full"
            />
          </button>

          {/* Dropdown */}
    {showMenu && (
      <div className="absolute right-0 top-20  bg-white bg-opacity-95 shadow-lg rounded-xl p-4 w-48 z-50">
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
          <span>{isConnected ? "Connected" : "Connect Wallet"}</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full text-left px-2 p-2 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
