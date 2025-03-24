"use client";
import React, { useEffect, useState } from "react";
import TableRow from "./issuedVoucherTableRow";
import Cookies from "js-cookie";
import { ethers } from "ethers";
import Loading from "../ProviderDashboard/loading";
import StableCoinABI from "../../contract/StableCoin-usdt.json";
import UAUSDStableCoinABI from "../../contract/StableCoin-uausd.json";
import USDCStableCoinABI from "../../contract/StableCoin-usdc.json";
import PAYPALStableCoinABI from "../../contract/StableCoin-paypal.json";
import ImpacttoMoneyABI from "../../contract/ImpacttoMoney.json";
import BeneficiaryModal from "./BeneficiaryModal";
import Image from "next/image";
const IssuedVoucherBeneficiaries = () => {
  const [checkedRows, setCheckedRows] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [itemsPerPage] = useState(10); // Items per page
  const [provider, setProvider] = useState(null);
  const [impacttoMoneyContract, setImpacttoMoneyContract] = useState(null);
  const [stableCoinContracts, setStableCoinContracts] = useState({});
  const [currentStableCoinContract, setCurrentStableCoinContract] =
    useState(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState({
    amount: "",
    wallet_address: [],
    currency: "",
    id: "",
  });
  const [batchMintData, setBatchMintData] = useState({
    walletAddresses: [],
    amount: 0,
    currency: 0,
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVoucherId, setSelectedVoucherId] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [filteredData, setFilteredData] = useState(data);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState("");

  const [cities, setCities] = useState([]);

  const handleRowClick = async (rowData) => {
    setSelectedWalletAddress(rowData.walletAddress);
    setIsModalOpen(true);
    setLoading(true);

    try {
      const response = await fetch(
        `/api/user/beneficiary/getVouchers?wallet_address=${rowData.walletAddress}`
      );
      const result = await response.json();
      if (response.ok) {
        const combinedData = {
          ...rowData,
          vouchers: result.data,
        };
        setModalData(combinedData);
      } else {
        console.error(result.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching beneficiary details:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  const handleCheckboxChange = (voucherId) => {
    setCheckedRows((prevCheckedRows) => ({
      ...prevCheckedRows,
      [voucherId]: !prevCheckedRows[voucherId], // Toggle true/false
    }));
  };

  // Extract unique voucher IDs for dropdown
  const voucherIds = ["All", ...new Set(data.map((item) => item.voucherId))];
  useEffect(() => {
    let filtered = data;
    filtered = filtered.filter((item) => item.voucherCategory !== "Religion");
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (item) => item.voucherCategory === selectedCategory
      );
    }
    if (selectedVoucherId !== "All") {
      filtered = filtered.filter(
        (item) => item.voucherId === selectedVoucherId
      );
    }
    if (selectedCountry !== "All") {
      filtered = filtered.filter((item) => item.country === selectedCountry);
    }
    if (selectedCity !== "All") {
      filtered = filtered.filter((item) => item.city === selectedCity);
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page whenever filters change
  }, [selectedCategory, selectedVoucherId, data]);

  // Function to handle Mint NFT action
  const handleSingleMintNFT = async (beneficiaryData) => {
    console.log("Minting NFT for:", beneficiaryData);

    // Update selectedBeneficiary state, ensuring wallet_address is an array
    setSelectedBeneficiary((prevState) => ({
      ...prevState,
      amount: beneficiaryData.amount,
      wallet_address: [beneficiaryData.wallet_address],
      currency: beneficiaryData.currency,
      id: beneficiaryData.id,
    }));

    console.log(
      "Wallet Addresses Array:",
      beneficiaryData.wallet_address,
      "Amount:",
      beneficiaryData.amount,
      "Currency:",
      parseInt(beneficiaryData.currency)
    );

    try {
      handleMinting();
    } catch (error) {
      console.error("Error during minting process:", error);
    } finally {
      setLoading(false);
    }
  };
  // Handle Click Function
  const handleBatchMint = () => {
    if (filteredData.length === 0) {
      alert("No beneficiaries found for batch minting.");
      return;
    }

    // Extract Wallet Addresses, Amount & Currency
    const walletAddresses = filteredData.map((item) => item.wallet_address);
    const amount = filteredData[0].amount; // Any one beneficiary's amount
    const currency = filteredData[0].currency;

    // Save to state
    setBatchMintData({
      walletAddresses,
      amount,
      currency,
    });

    console.log("Batch Mint Data:", {
      walletAddresses,
      amount,
      currency,
    });

    try {
      handleNFTMinting();
    } catch (error) {
      console.log("Error in Batch Minting");
    }
  };

  const token = Cookies.get("authToken");
  // Set the current stable coin contract when stableCoinContracts changes
  useEffect(() => {
    const selectedContract =
      stableCoinContracts[parseInt(selectedBeneficiary.currency)];
    if (selectedContract) {
      setCurrentStableCoinContract(selectedContract);
    }
  }, [stableCoinContracts]); // Dependency ensures it only runs when stableCoinContracts updates

  // Check if MetaMask is connected
  const isMetaMaskConnected = async () => {
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  };

  // Load Ethereum provider and contracts
  useEffect(() => {
    const loadProvider = async () => {
      try {
        if (!window.ethereum) {
          throw new Error("MetaMask is not installed.");
        }

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
        setCurrentStableCoinContract(contracts[0]); // Default to USDT

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
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/getIssuedVouchers", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (response.ok) {
          setData(result.data);
          console.log("Result Data insid API call ",result.data)

          // Extract unique cities from the fetched data
          const uniqueCities = [
            ...new Set(result.data.map((item) => item.city)),
          ];
          setCities(uniqueCities);
        } else {
          setError(result.message || "Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching beneficiary details:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleToggleRevoke = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/user/beneficiary/voucher/${id}`, {
        // Use backticks for the URL
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use backticks for template literals
        },
        body: JSON.stringify({ revoked: !currentStatus }), // Toggle status
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          `Voucher ${currentStatus ? "restored" : "revoked"} successfully!`
        ); // Use backticks for template literals
        // Refresh the table or update the local state to reflect changes
      } else {
        alert(result.message || "Failed to update voucher.");
      }
    } catch (error) {
      console.error("Error toggling revoked status:", error);
      alert("An error occurred while updating the voucher.");
    }
  };

  // Mint NFTs for beneficiaries
  const mintNFT = async (wa, amount, currencyValue) => {
    try {
      if (!wa || wa.length < 1 || !amount) {
        alert("At least one wallet address and voucher amount are required.");
        return;
      }

      if (!impacttoMoneyContract) {
        throw new Error("ImpactToMoney contract is not initialized.");
      }

      if (!currentStableCoinContract) {
        throw new Error("Stable coin contract is not set.");
      }

      console.log("Single Minting Initiated");
      console.log(
        "Amount:",
        amount,
        "Wallet Addresses:",
        wa,
        "Currency Value:",
        currencyValue
      );

      console.log("Minting Initiated");
      console.log(
        "Amount:",
        amount,
        "Wallet Addresses:",
        wa,
        "Currency Value:",
        currencyValue
      );

      const mintAmount = ethers.utils.parseUnits(amount.toString());
      // Calculate Amount for Single or Batch Minting
      let totalAmount =
        wa.length > 1
          ? ethers.utils.parseUnits(amount.toString()).mul(wa.length)
          : ethers.utils.parseUnits(amount.toString());

      // Add extra 1 unit to avoid precision issues in batch minting
      if (wa.length > 1) {
        // Calculate total value for batch minting
        let totalValue = amount * wa.length;
        totalValue++;
        const totalValueString = totalValue.toFixed(18); // Convert to string with 18 decimals
        const parsedAmount = ethers.utils.parseEther(totalValueString);
        console.log("Parse Ether (Parsed):", parsedAmount);
      }

      console.log("Total Minting Amount:", totalAmount.toString());

      console.log("Minting Initiated with:", {
        walletAddresses: wa,
        amount: totalAmount.toString(),
        currency: currencyValue,
      });

      // Whitelist beneficiaries
      const whitelistTx = await impacttoMoneyContract.whitelistBeneficiaries(
        wa
      );
      await whitelistTx.wait();
      alert("Beneficiaries whitelisted successfully!");

      // Check MetaMask connection
      const isConnected = await isMetaMaskConnected();
      if (!isConnected) {
        alert("Please connect your MetaMask wallet first.");
        return;
      }

      // Fetch the connected MetaMask wallet address
      const [owner] = await provider.listAccounts(); // Owner's wallet address
      console.log("Connected Owner Address:", owner);

      // Check current allowance for the owner's address
      const currentAllowance = await currentStableCoinContract.allowance(
        owner,
        process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS
      );

      console.log("Current Allowance:", currentAllowance.toString());

      // Approve total amount if allowance is insufficient
      if (currentAllowance.lt(totalAmount)) {
        const approveTx = await currentStableCoinContract.approve(
          process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS,
          totalAmount
        );
        await approveTx.wait();
        alert("Stable coin transfer approved successfully!");
      } else {
        console.log("Sufficient allowance already granted.");
      }

      console.log(
        "Minting NFTs for:",
        wa,
        "Total Amount:",
        totalAmount.toString(),
        "Currency:",
        currencyValue
      );

      // Mint NFTs
      const mintTx = await impacttoMoneyContract.donateAndMint(
        wa,
        mintAmount,
        currencyValue
      );
      await mintTx.wait();
      alert("NFTs minted successfully!");
    } catch (error) {
      console.error("Error minting NFTs:", error);
      alert("Error minting NFTs: " + error.message);
    }
  };

  console.log("Selected Data for single minting ", selectedBeneficiary);
  const handleMinting = async () => {
    try {
      console.log("Single Data ", {
        amount: selectedBeneficiary.amount,
        walletAddress: selectedBeneficiary.wallet_address,
        currency: parseInt(selectedBeneficiary.currency),
      });
      await mintNFT(
        selectedBeneficiary.wallet_address,
        selectedBeneficiary.amount,
        parseInt(selectedBeneficiary.currency)
      );
    } catch (error) {
      console.log("Error minting single NFT", error.message);
    }
  };
  const handleNFTMinting = async () => {
    try {
      console.log("Batch Data ", {
        amount: batchMintData.amount,
        walletAddress: batchMintData.walletAddresses,
        currency: parseInt(batchMintData.currency),
      });
      await mintNFT(
        batchMintData.walletAddresses,
        batchMintData.amount,
        parseInt(batchMintData.currency)
      );
    } catch (error) {
      console.log("Error minting Batch NFT", error.message);
    }
  };

  // Minting process
  // const handleSubmit = async () => {
  //   if (!walletAddresses.length || !voucherAmount[0]) {
  //     alert("Wallet addresses and voucher amounts are required.");
  //     return;
  //   }

  //   setLoading(true);
  //   alert("Minting process started. Please wait...");

  //   try {
  //     await mintNFT(walletAddresses, voucherAmount[0], 2);
  //   } catch (error) {
  //     console.error("Error during minting process:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  console.log("checkCode", checkedRows);
  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  // if (error) return <div>Error: {error}</div>;

  return (
    <div className="md:pt-10">
      <div className=" p-0 md:p-2 mt-4 md:mt-10 ">
        <div className="flex flex-col gap-2 md:flex-row justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Issued Beneficiaries List
            </h1>
            <p className="text-gray-600 mb-6">
              Mint the NFT to the beneficiaries below
            </p>
            {/* Filters */}
           
          </div>
          {/* <div>
        <button
        className="bg-yellow-500 rounded text-xl text-black px-5"
        onClick={handleBatchMint}
        >Batch Mint</button>
      </div> */}
        </div>
        {/* 
        {error && <div className="text-red-500">{error}</div>}
        {data.length === 0 && !loading && !error && (
          <div className="text-gray-500">No records found.</div>
        )} */}
 <div className="flex flex-col md:flex-row gap-2 w-full border-collapse shadow-lg bg-gradient-to-br from-white via-blue-300 to-gray-50 rounded-tl-xl rounded-tr-xl overflow-hidden p-3">
            {/* Category Filter */}
            <div className="flex-1 p-3">
              <label htmlFor="categoryFilter" className="mr-2">
                Filter by Category:
              </label>
              <select
                id="categoryFilter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="All">All</option>
                <option value="Education">Education</option>
                <option value="Health">Health</option>
                <option value="Children">Children</option>
              </select>
            </div>
            {/* Country Filter */}
            <div className="flex-1 p-3">
              <label htmlFor="countryFilter" className="mr-2">
                Filter by Country:
              </label>
              <select
                id="countryFilter"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="All">All</option>
                <option value="Palestine">Palestine</option>
                <option value="Pakistan">Pakistan</option>
                <option value="Turkey">Turkey</option>
              </select>
            </div>
            {/* City Filter */}
            <div className="flex-1 p-3">
              <label htmlFor="cityFilter" className="mr-2">
                Filter by City:
              </label>
              <select
                id="cityFilter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              >
                <option value="All">All</option>
                <option value="Gaza">Gaza</option>
                <option value="Gaza City">Gaza City</option>
                <option value="Nablus">Nablus</option>
                <option value="Ramallah">Ramallah</option>
              </select>
            </div>
            {/* Voucher ID Filter */}
            <div className="flex-1 p-3">
              <label htmlFor="voucherIdFilter" className="mr-2">
                Filter by Voucher ID:
              </label>
              <select
                id="voucherIdFilter"
                value={selectedVoucherId}
                onChange={(e) => setSelectedVoucherId(e.target.value)}
                className="border rounded px-2 py-1 w-full"
              >
                {voucherIds.map((id, index) => (
                  <option key={index} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        <div className="overflow-x-auto mt-10">
       
          <table className="table-auto w-full border-collapse shadow-lg bg-white rounded-xl overflow-hidden mt-2">
            <thead className="bg-gray-200">
              <tr>
                {[
                  "Voucher ID",
                  "Picture",
                  "Name",
                  "Email",
                  "Voucher Category",
                  "Voucher Value",
                  "City",
                  "Country",
                  "",
                ].map((header, index) => (
                  <th
                    className="py-3 px-4 text-left border-b-2 border-gray-300 text-black"
                    key={index}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={20} className="py-4 text-center text-gray-500">
                    No record available.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={item._id}
                    voucherId={item.voucherId}
                    picture={item.picture}
                    name={item.name}
                    email={item.email}
                    voucherCategory={item.voucherCategory}
                    currency={item.currency}
                    amount={item.amount}
                    city={item.city}
                    country={item.country}
                    walletAddress={item.wallet_address}
                    onRowClick={handleRowClick}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-xl ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-xl ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Next
          </button>
        </div>
        <BeneficiaryModal
          isOpen={isModalOpen}
          onClose={closeModal}
          data={modalData}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default IssuedVoucherBeneficiaries;

// Initialize the data array for storing wallet addresses and token IDs
// const dataArray = [];

// for (let address of wa) {
//   console.log(address);
//   // Fetch the tokenIds associated with the wallet address from the smart contract
//   const tokenId = await impacttoMoneyContract.beneficiaryTokenId(address);
//   console.log("line 385 me token id hun", tokenId.toString());

//   const dataObject = {
//     token_id: tokenId ? tokenId.toString() : null, // Only store the last tokenId
//     wallet_address: address,
//   };
//   console.log("line 396 data object", dataObject);

//   // Add this object to the dataArray
//   dataArray.push(dataObject);
// }

// Prepare the final JSON payload to send to the API
// const finalJson = {
//   metadata: metadata, // Directly use the provided metadata object
//   data: dataArray,
// };

// console.log(finalJson);

// Send the final JSON to the API endpoint
// const response = await fetch("/api/admin/createVouchers", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: Bearer ${authToken}, // Assuming token is stored in Cookies
//   },
//   body: JSON.stringify(finalJson),
// });

// const data = await response.json();

// if (response.ok) {
//   setMessage(data.message || "Successfully updated the statuses.");
// } else {
//   setMessage(data.message || "An error occurred.");
// }
