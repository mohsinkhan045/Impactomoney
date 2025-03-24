"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import StableCoinABI from "../../contract/StableCoin-usdt.json";
import UAUSDStableCoinABI from "../../contract/StableCoin-uausd.json";
import USDCStableCoinABI from "../../contract/StableCoin-usdc.json";
import PAYPALStableCoinABI from "../../contract/StableCoin-paypal.json";
import ImpacttoMoneyABI from "../../contract/ImpacttoMoney.json";
import Cookies from "js-cookie";
import Alert from "../../utils/Alert";

export default function InstitutionComponent() {
  const [isDonateOpen, setDonateOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [country, setCountry] = useState("");
  const [institution, setInstitution] = useState("");
  const [subEducationCategory, setSubEducationCategory] = useState("");
  const [subReligionCategory, setSubReligionCategory] = useState("");
  const [amount, setAmount] = useState();
  const [serviceProviderLists, setServiceProviderLists] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedToken, setSelectedToken] = useState("");
  const [voucherData, setVoucherData] = useState([]);
  const [matchCount, setMatchCount] = useState(0);
  const [provider, setProvider] = useState(null);
  const [currency, setSelectedCurrency] = useState(0); // Default to USDT
  const [currentStableCoinContract, setCurrentStableCoinContract] =
    useState(null);
  const [stableCoinContracts, setStableCoinContracts] = useState({});
  const [impacttoMoneyContract, setImpacttoMoneyContract] = useState(null);

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert({ message: "", type: "" });
    }, 5000); // Clear alert after 5 seconds
  };

  const resetForm = () => {
    setPurpose("");
    setCategory("");
    setSelectedCity("");
    setCountry("");
    setInstitution("");
    setAmount("");
    setSelectedCurrency(0);
    setServiceProviderLists([]);
  };

  const tokens = [
    { value: 2, label: "USDT", abi: StableCoinABI.abi }, // Base currency
    { value: 3, label: "USDC", abi: USDCStableCoinABI.abi },
    { value: 0, label: "AECoin", abi: UAUSDStableCoinABI.abi },
    { value: 1, label: "PYUSD", abi: PAYPALStableCoinABI.abi },
  ];

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleCurrencyChange = (e) => {
    const selectedLabel = e.target.value;
    // console.log("Selected Currency:", selectedLabel);

    // Find the selected token object based on its label
    const selectedToken = tokens.find((token) => token.label === selectedLabel);

    if (selectedToken) {
      setSelectedCurrency(selectedToken.value); // Update currency state
      // console.log("Currency Code:", selectedToken.value);

      // Set the current stable coin contract using the token value
      const selectedContract = stableCoinContracts[selectedToken.value];
      // console.log("Selected Contract:", selectedContract);

      if (selectedContract) {
        setCurrentStableCoinContract(selectedContract); // Update contract state
      } else {
        console.error("No contract found for selected currency!");
      }
    } else {
      console.error("Invalid token selected!");
    }
  };

  // Load Ethereum provider and contracts on component mount
  useEffect(() => {
    const loadProvider = async () => {
      try {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);

        const tempSigner = tempProvider.getSigner();

        const contracts = {
          2: new ethers.Contract(
            process.env.NEXT_PUBLIC_STABLE_COIN_USDT_CONTRACT_ADDRESS,
            StableCoinABI.abi,
            tempSigner
          ),
          3: new ethers.Contract(
            process.env.NEXT_PUBLIC_STABLE_COIN_USDC_CONTRACT_ADDRESS,
            USDCStableCoinABI.abi,
            tempSigner
          ),
          0: new ethers.Contract(
            process.env.NEXT_PUBLIC_STABLE_COIN_UAUSD_CONTRACT_ADDRESS,
            UAUSDStableCoinABI.abi,
            tempSigner
          ),
          1: new ethers.Contract(
            process.env.NEXT_PUBLIC_STABLE_COIN_PAYPALUSDT_CONTRACT_ADDRESS,
            PAYPALStableCoinABI.abi,
            tempSigner
          ),
        };

        setStableCoinContracts(contracts);
        setCurrentStableCoinContract(contracts[currency]); // Default to USDT

        const impacttoMoney = new ethers.Contract(
          process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS,
          ImpacttoMoneyABI.abi,
          tempSigner
        );
        setImpacttoMoneyContract(impacttoMoney);
      } catch (error) {
        console.error("Error initializing contracts:", error);
      }
    };

    loadProvider();
  }, []);

  // Check if MetaMask is connected
  const isMetaMaskConnected = async () => {
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  };

  // Handle the Donate button click
  const handleDonateClick = () => {
    setDonateOpen(true);
  };

  // Fetch approved Providers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = Cookies.get("authToken");
        if (!authToken) {
          // alert("Unauthorized. Please log in.");
          showAlert("Unauthorized. Please log in.", "error");
          return;
        }

        const response = await fetch("/api/admin/serviceProviderList", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setCities(
            data.data.cities.map(
              (city) =>
                city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()
            )
          );
          setCountries(
            data.data.countries.map(
              (country) =>
                country.charAt(0).toUpperCase() + country.slice(1).toLowerCase()
            )
          );
        } else {
          console.error("Failed to fetch cities:", data.message);
        }

        let filteredProviders = [];

        // // For Children category, show all approved providers regardless of voucher category
        // if (category === "Children") {
        //   filteredProviders = data.data.providers.filter(
        //     (serviceProvider) => serviceProvider.status === "approved"
        //   );
        // }
        // // For other categories, filter by both approved status and matching voucher category
        // else {
        filteredProviders = data.data.providers.filter(
          (serviceProvider) =>
            serviceProvider.status === "approved" &&
            serviceProvider.voucherCategory === category
        );
        // }

        setServiceProviderLists(filteredProviders);
      } catch (error) {
        console.error("Error fetching service providers:", error);
      }
    };

    fetchData();
  }, [category]);
  // Minting process
  const handleSubmit = async () => {
    // if (!walletAddresses.length || !voucherAmount[0]) {
    //   alert("Wallet addresses and voucher amounts are required.");
    //   return;
    // }

    setLoading(true);
    // alert("Transfering process started. Please wait...");
    showAlert("Transfer process started. Please wait...", "info");

    try {
      await TransferToProvider();
      resetForm();
    } catch (error) {
      console.error("Error during transfering process:", error);
      showAlert("Error during transfer process: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  //call transfer function from the smart contract
  const TransferToProvider = async () => {
    // console.log("minting started");
    try {
      // console.log(
      //   "Purpose: ",
      //   purpose,
      //   "selectedCity: ",
      //   selectedCity,
      //   "Country: ",
      //   country,
      //   "Category: ",
      //   category,
      //   "Institution: ",
      //   institution,
      //   "Currency",
      //   currency,
      //   "Amount",
      //   amount
      // );

      // Now, make the request to your API to get the beneficiaries
      const authToken = Cookies.get("authToken");
      const responseProvider = await fetch("/api/admin/providerDonation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          purpose,
          category,
          institution,
          amount,
          currency,
          selectedCity,
          country,
          // subEducationCategory,
          subReligionCategory,
        }),
      });
      const data = await responseProvider.json();

      // Check for error status first
      if (data.status === 404) {
        // alert(data.message);
        showAlert(data.message, "warning");
        return;
      }

      // Only process data if the response was successful
      if (responseProvider.ok) {
        setVoucherData(data.data.data);
        setMatchCount(data.data.matchedCount);
        // console.log("Vouchers Data", data.data.data);
        // console.log("matched count", data.data.matchedCount);

        const wa = data.data.data.map((provider) => provider.wallet_address);
        if (!impacttoMoneyContract) {
          // alert("Contract is not initialized.");
          showAlert("Contract is not initialized.", "error");

          return;
        }
        // console.log(
        //   "Wallet Addresses",
        //   wa,
        //   "Per Voucher Amount",
        //   amount,
        //   "Currency",
        //   currency
        // );
        // Proceed to mint NFT, passing wallet addresses
        await transferToken(wa, amount, currency);
      }
    } catch (error) {
      console.error("Error Minting :", error);
      showAlert("Error Minting: " + error.message, "error");
    }
  };

  // Mint NFTs for beneficiaries
  const transferToken = async (wa, amount, currencyValue) => {
    try {
      if (!wa || wa.length === 0 || !amount) {
        // alert("At least one wallet address and voucher amount are required.");
        showAlert(
          "At least one wallet address and voucher amount are required.",
          "warning"
        );
        return;
      }

      //  if (!impacttoMoneyContract) {
      //    throw new Error("ImpactToMoney contract is not initialized.");
      //  }

      if (!currentStableCoinContract) {
        throw new Error("Stable coin contract is not set.");
      }

      // console.log("current stable coin", currentStableCoinContract);
      // console.log("Token Transfer Initiated");
      // console.log(
      //   "Amount:",
      //   amount,
      //   "Wallet Addresses:",
      //   wa,
      //   "Currency Value:",
      //   currencyValue
      // );

      // Check MetaMask connection
      const isConnected = await isMetaMaskConnected();
      if (!isConnected) {
        // alert("Please connect your MetaMask wallet first.");
        showAlert("Please connect your MetaMask wallet first.", "error");
        return;
      }

      // console.log("THIS IS  AMOUNT 1", amount);
      // Calculate total value for batch minting
      // const totalValueString = amount.toFixed(18); // Convert to string with 18 decimals
      const parsedAmount = ethers.utils.parseUnits(amount);
      // console.log("Parse Ether (Parsed):", parsedAmount);

      // Fetch the connected MetaMask wallet address
      const [owner] = await provider.listAccounts(); // Owner's wallet address
      // console.log("Connected Owner Address:", owner);

      // Check current allowance for the owner's address
      const currentAllowance = await currentStableCoinContract.allowance(
        owner, // Correct owner address
        process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS
      );

      // console.log("Current Allowance:", currentAllowance.toString());

      // console.log("THIS IS PARSED AMOUNT 2", parsedAmount);
      // Approve total value if allowance is insufficient
      if (currentAllowance.lt(parsedAmount)) {
        const approveTx = await currentStableCoinContract.approve(
          process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS,
          parsedAmount
        );
        await approveTx.wait();
        // alert("Stable coin transfer approved successfully!");
        showAlert("Stable coin transfer approved successfully!", "success");
      } else {
        console.log("Sufficient allowance already granted.");
      }

      try {
        const tx = await currentStableCoinContract.batchTransferEqual(wa, parsedAmount); // Replace `wa` and `amount` with actual values
        console.log("Transaction sent, waiting for confirmation... ");
        const receipt = await tx.wait(); // Wait for the transaction to be mined
        console.log("Transaction confirmed:", receipt);
        // alert("Transfered token successful");
        showAlert("Transferred token successfully!", "success");
      } catch (error) {
        console.error("Error sending transaction:", error.message);
        // showAlert("Error sending transaction: " + error.message, "error");
      }
    } catch (error) {
      console.error("Error Transfering Token:", error);
      // alert("Error minting NFTs: " + error.message);
      showAlert("Error Transfering Token: ", "error");
    }
  };
  const isFormComplete = purpose && category;
  return (
    <div className="px-2 py-10 w-full max-w-lg mx-auto flex justify-center  bg-gradient-to-br from-white via-gray-100 to-gray-50 rounded-xl mt-3 border border-gray-300">
      <div className="mt-8 space-y-6">
        <h3 className="text-3xl font-extrabold text-BgColor mb-6 text-center">
          Institution Voucher Criteria
        </h3>

        {alert.message && (
          <Alert message={alert.message} type={alert.type} duration={5000} />
        )}

        <div className="space-y-4">
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="block w-full border border-gray-300 p-3 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select Purpose</option>
            <option value="Education">Education</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Religious">Religion</option>
            <option value="Children">Children</option>
          </select>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="block w-full border border-gray-300 p-3 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select Country</option>
            {countries.map((country, index) => (
              <option key={index} value={country}>
                {country}
              </option>
            ))}
          </select>

          {/* City Selection - Only Palestine Cities */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="block w-full border border-gray-300 p-3 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select City</option>
            {cities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* Update category options based on selected purpose */}
          {purpose && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full border border-gray-300 p-3 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Category</option>
              {purpose === "Education" && (
                <option value="Education">Education</option>
              )}
              {purpose === "Healthcare" && (
                <option value="Health">Medical</option>
              )}
              {purpose === "Religious" && (
                <option value="Religion">Religion</option>
              )}
              {purpose === "Children" && (
                <option value="Children">Children</option>
              )}
            </select>
          )}

          {/* <div className="p-3">
        <label htmlFor="categoryFilter" className="mr-2">Filter by Country:</label>
        <select
          id="categoryFilter"
          // value={selectedCategory}
          // onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="All">All</option>
          <option value="Education">Paletine</option>
          <option value="Health">Pakistan</option>
          <option value="Children">Turkey</option>
        </select>
      </div> */}
          {/* <div className="p-3">
        <label htmlFor="categoryFilter" className="mr-2">Filter by City:</label>
        <select
          id="categoryFilter"
          // value={selectedCategory}
          // onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="All">All</option>
          <option value="Education">Gaza</option>
          <option value="Health">Lahore</option>
          <option value="Children">Istanbul</option>
        </select>
      </div> */}

          {/* {purpose === "Education" && (
            <select
              value={subEducationCategory}
              onChange={(e) => setSubEducationCategory(e.target.value)}
              className="block w-full border border-gray-300 p-3 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Sub-Education Category</option>
              <option value="University">University</option>
              <option value="College">College</option>
              <option value="School">School</option>
            </select>
          )} */}

          
{purpose === "Religious" &&  (
            <select
              value={subReligionCategory}
              onChange={(e) => setSubReligionCategory(e.target.value)}
              className="block w-full border border-gray-300 p-3 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Sub Religion Category</option>
                <option value="Mosque">Mosque</option>
                <option value="Church">Church</option>
                <option value="Temple">Temple</option>
                <option value="Any Specific Institution">
                  Any Specific Institution
                </option>
            </select>
          )}

      
          {purpose && (
            <select
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="block w-full border border-gray-300 p-3 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Institution</option>
              {serviceProviderLists.length > 0 ? (
                serviceProviderLists.map((provider) => (
                  <option
                    key={provider._id}
                    value={provider.voucherDetails?.providerName}
                  >
                    {provider.voucherDetails?.providerName || "N/A"}
                  </option>
                ))
              ) : (
                <option value="">No Providers Available</option>
              )}
            </select>
          )}

          {purpose && (
            <div className="flex space-x-2">
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter Amount"
                className="block w-full border border-gray-300 p-3 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {/* Token Dropdown */}
              <div className="relative w-[200px]">
                <div className="relative  flex items-center text-sm border border-gray-300 px-2 py-3 rounded-xl bg-white focus-within:ring-2 focus-within:ring-indigo-400">
                  {/* Dropdown Select */}
                  <select
                    value={
                      tokens.find((token) => token.value === currency)?.label ||
                      ""
                    }
                    onChange={handleCurrencyChange}
                    className="w-full bg-transparent text-sm focus:outline-none appearance-none"
                  >
                    <option disabled value="">
                      Select Token
                    </option>
                    {tokens.map((token) => (
                      <option
                        key={token.value}
                        value={token.label}
                        className="text-sm"
                      >
                        {token.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full text-lg font-bold py-3 transition-all duration-300 rounded-xl ${
            loading
              ? "bg-BgColor text-white cursor-not-allowed"
              : "bg-BgColor text-white hover:bg-buttonHover focus:ring-4 focus:ring-blue-300"
          }`}
        >
          {loading ? "Transfering..." : "Confirm and Transfer"}
        </button>
      </div>
    </div>
  );
}
