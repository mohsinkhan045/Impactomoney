"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IssuedVoucherBeneficiaries from "./issuedVoucherBeneficiaries";
import { ethers } from "ethers";
import Image from "next/image";
import StableCoinABI from "../../contract/StableCoin-usdt.json";
import UAUSDStableCoinABI from "../../contract/StableCoin-uausd.json";
import USDCStableCoinABI from "../../contract/StableCoin-usdc.json";
import PAYPALStableCoinABI from "../../contract/StableCoin-paypal.json";
import ImpacttoMoneyABI from "../../contract/ImpacttoMoney.json";
import Cookies from "js-cookie";
import axios from "axios";
import Alert from "../../utils/Alert";
import {
  childrenChecklist,
  ReligionOptions,
} from "../../utils/dropdown-checklist";

export default function DonateSection({ onTabChange, setActiveSection }) {
  const router = useRouter();
  const [vouchers, setVouchers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [selectedReligion, setSelectedReligion] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [message, setMessage] = useState("");
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState("");
  const [institution, setInstitution] = useState("");
  const [studentStatus, setStudentStatus] = useState("");
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [serviceProviderLists, setServiceProviderLists] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [country, setCountry] = useState("");
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [matchCount, setMatchCount] = useState(0);
  const [voucherData, setVoucherData] = useState([]);
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState(null);
  const [currency, setSelectedCurrency] = useState(2);
  const [stableCoinContracts, setStableCoinContracts] = useState({});
  const [impacttoMoneyContract, setImpacttoMoneyContract] = useState(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [currentStableCoinContract, setCurrentStableCoinContract] = useState(2);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [subEducationCategory, setSubEducationCategory] = useState("");
  const [balances, setBalances] = useState({});
  const [isAmountValid, setIsAmountValid] = useState(false);
  const [selectedWallets, setSelectedWallets] = useState({});

  const setMessageWithTimeout = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert({ message: "", type: "" });
    }, 5000);
  };

  const tokens = [
    { value: 2, label: "USDT", abi: StableCoinABI.abi },
    { value: 3, label: "USDC", abi: USDCStableCoinABI.abi },
    { value: 0, label: "AECoin", abi: UAUSDStableCoinABI.abi },
    { value: 1, label: "PYUSD", abi: PAYPALStableCoinABI.abi },
  ];

  const handleAmountChange = (e) => {
    const enteredAmount = e.target.value;
    setAmount(enteredAmount);
    if (currency && balances[currency] !== undefined) {
      setIsAmountValid(enteredAmount <= balances[currency]);
    }
  };

  const handleCurrencyChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedCurrency(selectedValue);
    if (amount && balances[selectedValue] !== undefined) {
      setIsAmountValid(amount <= balances[selectedValue]);
    }
    const selectedContract = stableCoinContracts[selectedValue];
    if (selectedContract) {
      setCurrentStableCoinContract(selectedContract);
    }
  };

  const authToken = Cookies.get("authToken");
  const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
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

  useEffect(() => {
    const loadProvider = async () => {
      try {
        setStableCoinContracts(contracts);
        setCurrentStableCoinContract(contracts[2]);
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

  useEffect(() => {
    const fetchBalances = async () => {
      if (!tempSigner) return;
      const address = await tempSigner.getAddress();
      const newBalances = {};
      for (const [token, contract] of Object.entries(contracts)) {
        const balance = await contract.balanceOf(address);
        newBalances[token] = parseFloat(ethers.utils.formatUnits(balance, 18));
      }
      setBalances(newBalances);
    };
    fetchBalances();
  }, [tempSigner]);

  const handleCheckboxChange = (value, isChecked) => {
    setCheckedItems((prev) =>
      isChecked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };
  const handleCheckboxChangeReligion = (wallet, stats) => {
    setSelectedWallets((prev) => {
      const updatedWallets = { ...prev };
      if (updatedWallets[wallet]) {
        delete updatedWallets[wallet]; // Deselect if already selected
      } else {
        updatedWallets[wallet] = stats; // Select wallet and save its data
      }
      return updatedWallets;
    });
  };

  const isEthereumExists = () =>
    typeof window !== "undefined" && window.ethereum;

  const checkMetaMaskConnection = async () => {
    if (isEthereumExists()) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setIsConnected(accounts && accounts.length > 0);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error("Error checking connection:", err);
        showAlert("Failed to check MetaMask connection.", "error");
      }
    }
  };

  useEffect(() => {
    checkMetaMaskConnection();
  }, []);

  useEffect(() => {
    const fetchCities_Countries = async () => {
      try {
        const response = await fetch("/api/admin/beneficiaryList", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const result = await response.json();
        if (response.ok) {
          setCities(
            result.data.cities.map(
              (city) =>
                city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()
            )
          );
          setCountries(
            result.data.countries.map(
              (country) =>
                country.charAt(0).toUpperCase() + country.slice(1).toLowerCase()
            )
          );
        } else {
          console.error("Failed to fetch cities:", result.message);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };
    fetchCities_Countries();
  }, [authToken]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        const result = await response.json();
        console.log("Raw API Response:", result);

        if (!result.data?.providers) {
          console.error("No providers data in response");
          setServiceProviderLists([]);
          return;
        }

        let filteredProviders = [];

        // Filter providers based on category and approval status
        if (purpose === "Education") {
          filteredProviders = result.data.providers.filter(
            (provider) =>
              provider.status === "approved" ||
              ("funded" && provider.voucherCategory === "Education")
          );
        } else if (purpose === "Health") {
          filteredProviders = result.data.providers.filter(
            (provider) =>
              provider.status === "approved" ||
              ("funded" && provider.voucherCategory === "Health")
          );
        }
        console.log("Filtered Providers:", filteredProviders);

        setServiceProviderLists(filteredProviders);
      } catch (error) {
        console.error("Error fetching service providers:", error);
      }
    };
    fetchData();
  }, [category]);

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value);
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  const isMetaMaskConnected = async () => {
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      showAlert("Admin please connect your wallet", "error");
      return;
    } else if (
      !purpose ||
      !category ||
      !amount ||
      !selectedCity ||
      !startDate ||
      !expiryDate
    ) {
      showAlert(
        "Please complete all fields before issuing the voucher.",
        "warning"
      );
      return;
    }

    await Imagefetched();

    setLoading(false);
  };
  const handleSubmit2 = async () => {
    if (!isConnected) {
      showAlert("Admin please connect your wallet", "error");
      return;
    } else if (
      !purpose ||
      !category ||
      !amount ||
      !selectedCity ||
      !startDate ||
      !expiryDate
    ) {
      showAlert(
        "Please complete all fields before issuing the voucher.",
        "warning"
      );
      return;
    }

    await fetchEligibleBeneficiaries();

    setLoading(false);
  };
  // const authToken = Cookies.get("authToken");
  const fetchEligibleBeneficiaries = async () => {
    try {
      const response = await fetch("/api/admin/issuedToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`, // Token for authentication
        },
        body: JSON.stringify({
          purpose,
          category,
          checkedItems,
          amount,
          currency,
          selectedCity,
          country,
          religion: selectedReligion,
          validity: expiryDate,
          startDate: startDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch beneficiaries");
      }

      const data = await response.json();
      console.log("Beneficiaries Data:", data);
      setVoucherData(data.data.beneficiaries); // Updating frontend state
      setVouchers(data.data.vouchers || []);
      calculateUserStats(
        data.data.beneficiaries || [],
        data.data.vouchers || []
      );
      console.log("Beneficiaries ", data.data.beneficiaries);
      console.log("Vouchers ", data.data.vouchers);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
    }
  };

  const calculateUserStats = (beneficiaries, vouchers) => {
    const stats = {};

    // Loop through each beneficiary
    beneficiaries.forEach((beneficiary) => {
      const wallet = beneficiary.wallet_address;

      // Find all vouchers related to this wallet
      const relatedVouchers = vouchers.filter(
        (voucher) => voucher.wallet_address === wallet
      );

      // Initialize stats
      stats[wallet] = {
        mintedCount: 0,
        transferredCount: 0,
        priority: "🔴 Low",
      };

      // Count Minted & Transferred
      relatedVouchers.forEach((voucher) => {
        if (voucher.isMinted) {
          stats[wallet].mintedCount += 1;
        }
        if (voucher.isTransfered) {
          stats[wallet].transferredCount += 1;
        }
      });

      // Calculate total count (minted + transferred)
      const totalCount =
        stats[wallet].mintedCount + stats[wallet].transferredCount;

      // Assign Priority
      if (totalCount >= 0 && totalCount <= 2) {
        stats[wallet].priority = "🟢 High";
      } else if (totalCount > 2 && totalCount <= 5) {
        stats[wallet].priority = "🟠 Medium";
      } else {
        stats[wallet].priority = "🔴 Low";
      }
    });

    setUserStats(stats);
  };

  const Imagefetched = async () => {
    setMessageWithTimeout("");
    setLoading(true);
    try {
      const responseBeneficiaries = await fetch("/api/admin/issuedVoucher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          purpose,
          category,
          institution,
          studentStatus,
          checkedItems,
          amount,
          currency,
          selectedCity,
          country,
          religion: selectedReligion,
          validity: expiryDate,
          startDate: startDate,
          subEducationCategory,
        }),
      });
      const data = await responseBeneficiaries.json();
      if (!responseBeneficiaries.ok) {
        showAlert(`Error: ${data.message || "Something went wrong"}`, "error");
        return;
      }
      if (data.status === 404) {
        showAlert(
          "No beneficiaries found for the selected criteria.",
          "warning"
        );
        return;
      }
      if (data.status === 400) {
        showAlert(`Validation Error: ${data.message}`, "warning");
        return;
      }
      setVoucherData(data.data.saveResults);
      setMatchCount(data.data.matchedCount);
      // if (purpose === "Religion") {
      //   onTabChange("transfer-token");
      // const wa = data.data.saveResults.map((entry) => entry.wallet_address);
      // if (wa.length === 0) {
      //   showAlert("No valid wallet addresses found for the selected beneficiaries.", "warning");
      //   return;
      // }
      // const perBeneficiaryAmount = amount / wa.length;
      // await tranferToken(wa, perBeneficiaryAmount, currency);

      const formData = new FormData();
      formData.append("file", image);
      const purposeToIpfsHashMap = {
        education:
          "bafkreiez3k37mw7utcnjbhq7uooywkmkj3pvn3cydrmjtd342sjb3wyhne",
        children: "bafkreiemow5odrwbq5v63snapzgfnkejtslg5zxlxj74cinclbsia3eoay",
        healthcare:
          "bafkreihuv56uwtxgd22fduiya5tju563yc2hailhnrfjyqtm3r6s7xayoe",
      };
      const getIpfsHashForPurpose = (purpose) =>
        purposeToIpfsHashMap[purpose.toLowerCase()] || null;
      const IpfsHash = getIpfsHashForPurpose(purpose);
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
      const metadata = {
        voucher_name: `${purpose} Voucher`,
        voucher_issuer: "ImpacttoMoney",
        voucher_type: `${purpose}`,
        category: `${category}`,
        purpose: `${purpose}`,
        metaDataUrl: imageUrl,
        amount: data.data.perBeneficiaryAmount,
        currency: currency,
      };
      const metadataResponse = await axios.post(
        `https://api.pinata.cloud/pinning/pinJSONToIPFS`,
        metadata,
        {
          headers: {
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
            pinata_secret_api_key:
              process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
          },
        }
      );
      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataResponse.data.IpfsHash}`;
      let currencyCode;
      switch (currency) {
        case 0:
          currencyCode = "AECoin";
          break;
        case 1:
          currencyCode = "PAYPAL USDT";
          break;
        case 2:
          currencyCode = "USDT";
          break;
        case 3:
          currencyCode = "USDC";
          break;
        default:
          currencyCode = "undefined";
      }
      if (data.status === 200) {
        await updateMetadata(metadataUrl);
        showAlert(
          "Voucher Issued Successfully and Metadata updated",
          "success"
        );
        showAlert(
          `Total Number of Beneficiaries: ${data.data.matchedCount}, each beneficiary will get ${data.data.perBeneficiaryAmount} ${currencyCode}`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error uploading image or metadata:", error);
      showAlert("An unexpected error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateMetadata = async (metadataUrl) => {
    try {
      if (!impacttoMoneyContract) {
        showAlert("Contract is not initialized.", "error");
        return;
      }
      const tx = await impacttoMoneyContract.updateMetadataURI(metadataUrl);
      const txReciept = await tx.wait();
      if (txReciept.status == 1) {
        showAlert("Metadata updated successfully!", "success");
        onTabChange("distribute-voucher");
      }
    } catch (error) {
      console.error("Error updating metadata:", error);
      showAlert("Error updating metadata.", "error");
    }
  };

  // const tranferToken = async (wa, amount, currencyValue) => {
  //   try {
  //     if (!wa || wa.length < 1 || !amount) {
  //       showAlert("At least one wallet address and voucher amount are required.", "warning");
  //       return;
  //     }
  //     if (!impacttoMoneyContract) {
  //       throw new Error("ImpactToMoney contract is not initialized.");
  //     }
  //     if (!currentStableCoinContract) {
  //       throw new Error("Stable coin contract is not set.");
  //     }

  //     setTransactionStatus("Initiating transaction...");
  //     console.log("Transfer Initiated", { amount, wa, currencyValue });

  //     const mintAmount = ethers.utils.parseUnits(amount.toString());
  //     let totalAmount = wa.length > 1 ? ethers.utils.parseUnits(amount.toString()).mul(wa.length) : mintAmount;
  //     const isConnected = await isMetaMaskConnected();
  //     if (!isConnected) {
  //       showAlert("Please connect your MetaMask wallet first.", "error");
  //       return;
  //     }
  //     const [owner] = await provider.listAccounts();

  //     try {
  //       setTransactionStatus("Checking allowance...");
  //       const currentAllowance = await currentStableCoinContract.allowance(
  //         owner,
  //         process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS
  //       );

  //       if (currentAllowance.lt(totalAmount)) {
  //         setTransactionStatus("Waiting for approval transaction...");

  //         const approveTx = await currentStableCoinContract.approve(
  //           process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS,
  //           totalAmount
  //         );

  //         try {
  //           await approveTx.wait();
  //           // setMessageWithTimeout(
  //           //   "Stable coin transfer approved successfully!"
  //           // );
  //           showAlert("Stable coin transfer approved successfully!", "success");
  //         } catch (error) {
  //           if (error.code === 4001) {
  //             // setMessageWithTimeout("Transaction was rejected by user.");
  //             showAlert("Transaction was rejected by user.", "error");
  //             return;
  //           }
  //           throw error;
  //         }
  //       }

  //       setTransactionStatus("Processing transfers...");
  //       // for (let wallet of wa) {
  //         try {
  //           console.log("Wallet Address", wa);
  //           // setTransactionStatus(
  //           //   `Transferring to ${wallet.slice(0, 6)}...${wallet.slice(0, 6)}`
  //           // );
  //           const tx = await currentStableCoinContract.batchTransferEqual(
  //             wa,
  //             mintAmount
  //           );

  //           setTransactionStatus("Waiting for confirmation...");
  //           const receipt = await tx.wait();

  //           if (receipt) {
  //             // setMessageWithTimeout("Tokens transferred successfully!");
  //             showAlert("Tokens transferred successfully!", "success");
  //           } else {
  //             throw new Error("Transaction failed");
  //           }
  //         } catch (error) {
  //           if (error.code === 4001) {
  //             // setMessageWithTimeout("Transaction was cancelled by admin.");
  //             showAlert("Transaction was cancelled by admin.", "error");
  //             return;
  //           }
  //           throw error;
  //         }
  //       // }

  //       setTransactionStatus("All transfers completed successfully!");
  //       // setActiveSection("redirect-to-distribu/te");
  //     } catch (error) {
  //       if (error.code === 4001) {
  //         // setMessageWithTimeout("Transaction was cancelled by admin.");
  //         showAlert("Transaction was cancelled by admin.", "error");
  //       } else if (error.code === -32603) {
  //         // setMessageWithTimeout("Insufficient funds for transfer.");
  //         showAlert("Insufficient funds for transfer.", "error");
  //       } else {
  //         // setMessageWithTimeout(`Transaction failed: ${error.message}`);
  //         showAlert(`Transaction failed`, "error");
  //       }
  //       console.error("Transaction error:", error);
  //     }
  //   } catch (error) {
  //     console.error("Error Transferring Tokens:", error);
  //     showAlert(`Error: ${error.message}`, "error");
  //   } finally {
  //     setTransactionStatus("");
  //   }
  // };

  const handleStartDateChange = (e) => {
    const inputDate = new Date(e.target.value);
    const today = new Date();
    if (inputDate < today) {
      const todayString = today.toISOString().split("T")[0];
      e.target.value = todayString;
      setStartDate(todayString);
    } else {
      setStartDate(e.target.value);
    }
  };

  const handleExpiryDateChange = (e) => {
    const inputDate = new Date(e.target.value);
    const startDateValue = new Date(startDate);
    if (inputDate < startDateValue) {
      showAlert(
        "Expiry date must be greater than or equal to the start date.",
        "error"
      );
      e.target.value = "";
      setExpiryDate("");
    } else {
      setExpiryDate(e.target.value);
    }
  };

  // console.log("Checked Beneficiary Data ",selectedWallets)
  return (
    <div className="px-2 py-10 w-full max-w-lg flex justify-center mx-auto bg-gradient-to-br from-white via-gray-100 to-gray-50 rounded-xl md:mt-10 border border-gray-300">
      <div className="mt-8 space-y-6">
        <h3 className="text-3xl font-extrabold text-BgColor mb-6 text-center">
          Individual Voucher Criteria
        </h3>
        {alert.message && (
          <Alert message={alert.message} type={alert.type} duration={5000} />
        )}
        <div className="space-y-4">
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="block w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-xl"
          >
            <option value="">Select Purpose</option>
            <option value="Education">Education</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Religion">Religion</option>
            <option value="Children">Children</option>
          </select>
          <select
            value={country}
            onChange={handleCountryChange}
            className="block w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-xl"
          >
            <option value="">Select Country</option>
            {countries.map((country, index) => (
              <option key={index} value={country}>
                {country}
              </option>
            ))}
          </select>
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="block w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-xl"
          >
            <option value="">Select City</option>
            {cities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
          {purpose === "Education" && (
            <select
              value={subEducationCategory}
              onChange={(e) => setSubEducationCategory(e.target.value)}
              className="block w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-xl"
            >
              <option value="">Select Sub-Education Category</option>
              <option value="University">University</option>
              <option value="School">School</option>
              <option value="College">College</option>
            </select>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="start-date" className="block text-gray-700">
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                min={new Date().toISOString().split("T")[0]}
                className="block w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-xl"
              />
            </div>
            <div>
              <label htmlFor="expiry-date" className="block text-gray-700">
                Expiry Date
              </label>
              <input
                id="expiry-date"
                type="date"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                min={startDate}
                disabled={!startDate}
                className="block w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-xl"
              />
            </div>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="block w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-xl"
          >
            <option value="">Select Sub-Category</option>
            <option value="All">All</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Children">Children</option>
            <option value="Food">Food</option>
            <option value="Shelter">Shelter</option>
            <option value="Emotional Abuse">Emotional Abuse</option>
            <option value="Sexual Abuse">Sexual Abuse</option>
            <option value="Special Needs">Special Needs</option>
          </select>
          <select
            value={selectedReligion}
            onChange={(e) => setSelectedReligion(e.target.value)}
            className="block w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 mt-4 rounded-xl"
          >
            <option value="">Select Religion</option>
            {Object.entries(ReligionOptions).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
          <div className="p-3 my-2 w-full flex gap-4 flex-wrap">
            {Object.entries(childrenChecklist).map(([key, value]) => (
              <div
                key={key}
                className="w-full md:w-1/2 lg:w-1/3 flex items-center gap-2 mb-2"
              >
                <input
                  type="checkbox"
                  id={key}
                  name="childrenPurpose"
                  value={value}
                  checked={checkedItems.includes(value)}
                  onChange={(e) =>
                    handleCheckboxChange(value, e.target.checked)
                  }
                  className="w-4 h-4"
                  disabled={checkedItems.includes("Any") && key !== "Any"}
                />
                <label htmlFor={key} className="text-sm text-gray-700 flex-1">
                  {value}
                </label>
              </div>
            ))}
          </div>
          {(purpose === "Education" || purpose === "Healthcare") && (
            <select
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="block w-full border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-xl"
            >
              <option value="">Select Institution</option>
              {serviceProviderLists.length > 0 ? (
                serviceProviderLists.map((provider) => (
                  <option
                    key={provider._id}
                    value={provider.voucherDetails.providerName}
                  >
                    {provider.voucherDetails.providerName || "N/A"}
                  </option>
                ))
              ) : (
                <option value="">No Providers Available</option>
              )}
              <option value="All">All</option>
            </select>
          )}
          {purpose === "Education" && (
            <select
              value={studentStatus}
              onChange={(e) => setStudentStatus(e.target.value)}
              className="block w-full border border-gray-300 p-3 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-xl"
            >
              <option value="">Select Student Status</option>
              <option value="High">High Achieving Students</option>
              <option value="Poor">Poor Students</option>
              <option value="Both">Both</option>
            </select>
          )}
          {category && purpose && (
            <div className="flex space-x-2">
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter Amount"
                className="block w-full border border-gray-300 p-3 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-xl"
              />
              {amount && isAmountValid && (
                <span className="text-green-500 flex items-center">✔</span>
              )}
              <div className="relative w-[200px]">
                <div className="relative flex items-center text-sm border border-gray-300 px-2 py-3 rounded bg-white focus-within:ring-2 focus-within:ring-indigo-400 rounded-xl">
                  <select
                    value={currency || ""}
                    onChange={handleCurrencyChange}
                    className="w-full bg-transparent text-sm focus:outline-none appearance-none"
                  >
                    <option disabled>Select Token</option>
                    {tokens.map((token) => (
                      <option
                        key={token.value}
                        value={token.value}
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
          {amount && !isAmountValid && (
            <span className="text-red-500">Insufficient funds</span>
          )}
        </div>
        {transactionStatus && (
          <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded">
            {transactionStatus}
          </div>
        )}
        {message && (
          <div
            className={`mt-4 p-3 rounded ${
              message.includes("Error") ||
              message.includes("cancelled") ||
              message.includes("rejected")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}
        {purpose !== "Religion" && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full text-lg font-bold py-3 transition-all duration-300 rounded-xl ${
              loading
                ? "bg-BgColor text-white cursor-not-allowed"
                : "bg-BgColor text-white hover:bg-buttonHover focus:ring-4 focus:ring-blue-300"
            }`}
          >
            {loading
              ? purpose === "Religion"
                ? "Transferring..."
                : "Issuing..."
              : "Confirm and Issue"}
          </button>
        )}

        {purpose === "Religion" && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleSubmit2}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Show Eligible Beneficiaries
            </button>

            {/* Beneficiary List */}
            <div className="mt-4 bg-white shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Eligible Beneficiaries
              </h3>
              <ul className="mt-4 bg-white shadow-md rounded-lg p-4">
                {Object.keys(userStats).length > 0 ? (
                  Object.entries(userStats)
                    .sort(([, a], [, b]) => {
                      const priorityOrder = {
                        "🔴 Low": 0,
                        "🟠 Medium": 1,
                        "🟢 High": 2,
                      };
                      return (
                        priorityOrder[a.priority] - priorityOrder[b.priority]
                      );
                    })
                    .map(([wallet, stats]) => (
                      <li
                        key={wallet}
                        className="border-b py-2 flex items-center gap-2"
                      >
                        {/* Checkbox to select wallet */}
                        <input
                          type="checkbox"
                          checked={!!selectedWallets[wallet]}
                          onChange={() =>
                            handleCheckboxChangeReligion(wallet, stats)
                          }
                        />
                        <div>
                          <p>
                            <strong>Wallet:</strong> {wallet}
                          </p>
                          <p>
                            <strong>Minted Count:</strong> {stats.mintedCount}
                          </p>
                          <p>
                            <strong>Transferred Count:</strong>{" "}
                            {stats.transferredCount}
                          </p>
                          <p>
                            <strong>Priority:</strong> {stats.priority}
                          </p>
                        </div>
                      </li>
                    ))
                ) : (
                  <p>No eligible vouchers found.</p>
                )}
              </ul>
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
