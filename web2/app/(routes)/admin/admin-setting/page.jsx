"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { ethers } from "ethers";
// import StableCoinABI from "../../../contract/StableCoin.json";
import UAUSDStableCoinABI from "../../../contract/StableCoin-uausd.json";
import Alert from "../../../utils/Alert";

const AdminSettings = () => {
  const [adminData, setAdminData] = useState({
    metamaskAddress: "0x8903a503327757A9FbeAcbB1ba1AbF9fF1E70971",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 
  const [showWallet, setShowWallet] = useState(false);

  const [usdt, setUsdt] = useState(0);

  const [provider, setProvider] = useState(null);
  const [stableCoinContract, setStableCoinContract] = useState(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const setMessageWithTimeout = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 5000); // Clear message after 3 seconds
  };
  // Load Ethereum provider and contracts on component mount
  useEffect(() => {
    const loadProviderAndContract = async () => {
      try {
        // Initialize the Ethereum provider
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);

        // Get the signer (the wallet that will interact with the contract)
        const tempSigner = tempProvider.getSigner();

        // Initialize the contract
        // const stableCoin = new ethers.Contract(
        //   process.env.NEXT_PUBLIC_STABLE_COIN_CONTRACT_ADDRESS,
        //   StableCoinABI.abi,
        //   tempSigner
        // );
        const uauscStableCoin = new ethers.Contract(
          process.env.NEXT_PUBLIC_STABLE_COIN_CONTRACT_ADDRESS,
          UAUSDStableCoinABI.abi,
          tempSigner
        );

        // setStableCoinContract(stableCoin); // Save contract to state
        setStableCoinContract(uauscStableCoin); // Save contract to state
      } catch (error) {
        console.error("Error initializing contract:", error);
      }
    };

    loadProviderAndContract();
  }, []);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!stableCoinContract) {
        // Prevent running if contract is not initialized
        console.log("Contract is not initialized yet.");
        return;
      }

      try {
        // Specify the address you want to check (replace with the desired address)
        const address = "0x8903a503327757A9FbeAcbB1ba1AbF9fF1E70971";

        // Call the balanceOf function of the contract
        const balance = await stableCoinContract.balanceOf(address);

        // Convert the balance from BigNumber to a readable format
        const formattedBalance = ethers.utils.formatUnits(balance, 18); // Assuming 18 decimals for USDT

        // Update the state with the formatted balance
        setUsdt(formattedBalance);

        console.log("USDT Balance:", formattedBalance); // Log the balance
      } catch (error) {
        console.error("Error fetching USDT balance:", error);
      }
    };

    // Call the fetchTokenBalance function if the contract is available
    if (stableCoinContract) {
      fetchTokenBalance();
    }
  }, [stableCoinContract]);

  const token = Cookies.get("authToken"); // Get token from cookies
  const router = useRouter();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (adminData.newPassword !== adminData.confirmPassword) {
      setMessage("Passwords do not match!");
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch("/api/admin/changePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the token from cookies
        },
        body: JSON.stringify({
          currentPassword: adminData.currentPassword,
          newPassword: adminData.newPassword,
          confirmPassword: adminData.confirmPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Password changed successfully.");
        setMessageType("success");
      } else {
        alert(data.message);
        setMessageWithTimeout(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred");
      setMessageType("error");
    }
  };

  return (
    <div className="container mx-auto md:mt-10 md:p-5 p-0  mt-2  bg-gray-100 min-h-screen items-center flex flex-col">
      <h1 className="text-4xl  font-bold mb-8 text-center text-gray-800 mt-10">
        Admin Settings
      </h1>

      {message && <Alert message={message} type={messageType} duration={5000}  />}

      {/* MetaMask Wallet Section */}
      <section className="w-full mb-8 p-6 max-w-2xl bg-gradient-to-br from-white via-blue-100 to-gray-50 rounded-2xl mt-3 border  ">
        <h2 className="text-3xl font-semibold mb-4 text-gray-700">
          MetaMask Wallet
        </h2>
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Admin Wallet Address:{" "}
            <span className="font-mono">
              {showWallet ? adminData.metamaskAddress : "***************"}
            </span>
          </p>
          <button onClick={() => setShowWallet(!showWallet)}>
            {showWallet ?  <IoIosEye size={20} /> : <IoIosEyeOff size={20} />}
          </button>
        </div>
      </section>

      <section className="w-full max-w-2xl  bg-gradient-to-br from-white via-blue-100 to-gray-50 shadow-md rounded-2xl p-6 border border-gray-200 mt-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Current Password"
              className="w-full p-4 border border-gray-300 rounded-3xl focus:border-blue-600 outline-none transition duration-200"
              value={adminData.currentPassword}
              onChange={(e) =>
                setAdminData({ ...adminData, currentPassword: e.target.value })
              }
            />
            <button
              type="button"
              className="absolute right-4 top-5"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <IoIosEye size={20} />
              ) : (
                <IoIosEyeOff size={20} />
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full p-4 border border-gray-300 rounded-3xl focus:border-blue-600 outline-none transition duration-200"
              value={adminData.newPassword}
              onChange={(e) =>
                setAdminData({ ...adminData, newPassword: e.target.value })
              }
            />
            <button
              type="button"
              className="absolute right-4 top-5"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <IoIosEye size={20} />
              ) : (
                <IoIosEyeOff size={20} />
              )}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              className="w-full p-4 border border-gray-300 rounded-3xl focus:border-blue-600 outline-none transition duration-200"
              value={adminData.confirmPassword}
              onChange={(e) =>
                setAdminData({ ...adminData, confirmPassword: e.target.value })
              }
            />
            <button
              type="button"
              className="absolute right-4 top-5"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <IoIosEye size={20} />
              ) : (
                <IoIosEyeOff size={20} />
              )}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-4 rounded-3xl hover:bg-blue-700"
          >
            Change Password
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminSettings;


