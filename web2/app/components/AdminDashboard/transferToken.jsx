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

const TransferToken = () => {
  const [checkedRows, setCheckedRows] = useState([]);
  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [itemsPerPage] = useState(10); // Items per page
  const [provider, setProvider] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [impacttoMoneyContract, setImpacttoMoneyContract] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVoucherId, setSelectedVoucherId] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");
  const [filteredData, setFilteredData] = useState(data);
  const [stableCoinContracts, setStableCoinContracts] = useState({});
  const [Currency, setCurrency] = useState(0);
  const [currentStableCoinContract, setCurrentStableCoinContract] =
    useState(stableCoinContracts[Currency]); // Set default to the first contract
  const [selectedBeneficiary, setSelectedBeneficiary] = useState({
    id: "",
    category: "",
    metadata: {},
    amount: "",
    wallet_address: [],
    currency: "",
  });

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert({ message: "", type: "" });
    }, 5000);
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
    //     console.log("Selected Currency:", Currency);
    //     console.log("Current Stable Coin Contract:", contracts[Currency]);
    //      // Set current stable coin contract based on Currency state
    //   if (contracts[Currency]) {
    //     setCurrentStableCoinContract(contracts[Currency]);
    //   }

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
  // console.log("selectedBeneficiary", selectedBeneficiary);
  // console.log("batchMintData", batchMintCurrency);

  // Watch for Currency change and update the contract
useEffect(() => {
    if (stableCoinContracts[Currency]) {
        console.log("Selected Currency:", Currency);
        console.log("Current Stable Coin Contract:", stableCoinContracts[Currency]);
      setCurrentStableCoinContract(stableCoinContracts[Currency]);
    }
  }, [Currency, stableCoinContracts]); 
  const handleCheckboxChange = (
    id, // MongoDB _id
    category,
    metadata,
    walletAddress,
    amount,
    currency
  ) => {
    setCheckedRows((prevCheckedRows) => {
      if (!Array.isArray(prevCheckedRows)) {
        prevCheckedRows = [];
      }

      const isSelected = prevCheckedRows.some((row) => row.id === id);

      if (isSelected) {
        return prevCheckedRows.filter((row) => row.id !== id);
      } else {
        return [
          ...prevCheckedRows,
          {
            id,
            category,
            metadata,
            walletAddress,
            amount,
            currency,
          },
        ];
      }
    });
  };

  const setMessageWithTimeout = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 5000); // Clear message after 3 seconds
  };

  // Extract unique voucher IDs for dropdown
  const voucherIds = ["All", ...new Set(data.map((item) => item.voucherId))];
  useEffect(() => {
    let filtered = data.filter((item)=>item.isTransfered!= true);
    // console.log("check data", data)
    // console.log("filteredmmmmm", filtered)
    filtered = filtered.filter((item) => item.voucherCategory == "Religion");
    // if (selectedCategory !== "All") {
    //   filtered = filtered.filter(
    //     (item) => item.voucherCategory === selectedCategory
    //   );
    // }
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
  }, [
    selectedCategory,
    selectedVoucherId,
    selectedCity,
    selectedCountry,
    data,
  ]);

  const handleSingleMintNFT = async (beneficiaryData) => {
    setSelectedBeneficiary(beneficiaryData)
    setCurrency(parseInt(beneficiaryData.currency))
    try {
      await tranferToken(
        [beneficiaryData.id], // ids array
        // beneficiaryData.voucherCategory, // category
        // beneficiaryData.metadata, // metadata
        [beneficiaryData.wallet_address], // wallet addresses array
        beneficiaryData.amount, // amount
        parseInt(beneficiaryData.currency) // currency
    );
    
    } catch (error) {
      console.error("Error during minting process:", error);
    }
  };

  const handleBatchMint = async () => {
    if (checkedRows.length === 0) {
      alert("No beneficiaries found for batch minting.");
      return;
    }

    const validRows = checkedRows.filter((item) => item.walletAddress);

    if (validRows.length === 0) {
      alert("No valid wallet addresses found for batch minting.");
      return;
    }

    const ids = validRows.map((item) => item.id);
    const walletAddresses = validRows.map((item) => item.walletAddress);
    const category = validRows[0].category;
    const metadata = validRows[0].metadata;
    const amount = validRows[0].amount;
    const currency = validRows[0].currency;
    setCurrency(currency)
    try {
      await tranferToken(
        ids, // ids array
        // category, // category
        // metadata, // metadata
        walletAddresses, // wallet addresses array
        amount, // amount
        parseInt(currency) // currency
      );
    } catch (error) {
      console.log("Error in Batch Minting", error.message);
    }
  };

  const token = Cookies.get("authToken");
  // Set the current stable coin contract when stableCoinContracts changes
//   console.log("SelectedBeneficiary for single mint", selectedBeneficiary.currency)
//   useEffect(() => {
//     const selectedContract =
//     // stableCoinContracts[0]
//       stableCoinContracts[parseInt(selectedBeneficiary.currency)];
//     console.log("selectedContract for single mint", selectedContract);
//     if (selectedContract) {
//       setCurrentStableCoinContract([selectedContract]);
//     }
//   }, [stableCoinContracts,currentStableCoinContract, selectedBeneficiary]);
//   console.log("SelectedBeneficiary for batch mint", batchMintCurrency)
//   useEffect(() => {
//     const currencyForBatchMint =
//       stableCoinContracts[parseInt(batchMintCurrency)];
//     console.log("selectedContract for batch mint", currencyForBatchMint);
//     if (currencyForBatchMint) {
//       setCurrentStableCoinContract([currencyForBatchMint]);
//     }
//   }, [currentStableCoinContract]);

  // Check if MetaMask is connected
  const isMetaMaskConnected = async () => {
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  };


  // Fetch beneficiary data from API
  useEffect(() => {
    const fetchData = async (isExpired) => {
      try {
        const response = await fetch(`/api/admin/getIssuedVouchers?isExpired=${isExpired}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (response.ok) {
          setData(result.data);
          // console.log("resulttttttt", result)
          // console.log("data", data);
          // console.log("result.data isisisis", typeof(result.data))
          
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




// useEffect(() => {
//   const fetchData = async (isExpired) => {
//     try {
//       const response = await fetch(`/api/admin/getIssuedVouchers?isExpired=${!isExpired}`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const result = await response.json();
//       if (response.ok) {
//         setData(result.data); // Set the filtered data directly from the API
//         console.log("Filtered vouchers:", result.data);
//         console.log("setData",  setData(result.data));
//       } else {
//         setError(result.message || "Failed to fetch data");
//       }
//     } catch (err) {
//       console.error("Error fetching beneficiary details:", err);
//       setError("An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchData(false); // Call with false to get valid vouchers, or true for expired vouchers
// }, [token]);

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
  const tranferToken = async (ids, wa, amount, currencyValue) => {
    
    try {
      if (!wa || wa.length < 1 || !amount) {
        showAlert("At least one wallet address and voucher amount are required.", "warning");
        return;
      }
      if (!impacttoMoneyContract) {
        throw new Error("ImpactToMoney contract is not initialized.");
      }
      if (!stableCoinContracts[currencyValue]) {
        console.log("Current contract" , stableCoinContracts[currencyValue])
        throw new Error("Stable coin contract is not set.");
      }

      setTransactionStatus("Initiating transaction...");
      console.log("Transfer Initiated", { ids,amount, wa, currencyValue, currentStableCoinContract });

      const mintAmount = ethers.utils.parseUnits(amount.toString());
      let totalAmount = wa.length > 1 ? ethers.utils.parseUnits(amount.toString()).mul(wa.length) : mintAmount;
      const isConnected = await isMetaMaskConnected();
      if (!isConnected) {
        showAlert("Please connect your MetaMask wallet first.", "error");
        return;
      }
      const [owner] = await provider.listAccounts();

      try {
        setTransactionStatus("Checking allowance...");
        const currentAllowance = await stableCoinContracts[currencyValue].allowance(
          owner,
          process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS
        );

        if (currentAllowance.lt(totalAmount)) {
          setTransactionStatus("Waiting for approval transaction...");

          const approveTx = await stableCoinContracts[currencyValue].approve(
            process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS,
            totalAmount
          );

          try {
            await approveTx.wait();
            // setMessageWithTimeout(
            //   "Stable coin transfer approved successfully!"
            // );
            showAlert("Stable coin transfer approved successfully!", "success");
          } catch (error) {
            if (error.code === 4001) {
              // setMessageWithTimeout("Transaction was rejected by user.");
              showAlert("Transaction was rejected by user.", "error");
              return;
            }
            throw error;
          }
        }

        setTransactionStatus("Processing transfers...");
        // for (let wallet of wa) {
          try {
            console.log("Wallet Address", wa);
            // setTransactionStatus(
            //   `Transferring to ${wallet.slice(0, 6)}...${wallet.slice(0, 6)}`
            // );
            const tx = await stableCoinContracts[currencyValue].batchTransferEqual(
              wa,
              mintAmount
            );

            setTransactionStatus("Waiting for confirmation...");
            const receipt = await tx.wait();

            if (receipt) {
              // setMessageWithTimeout("Tokens transferred successfully!");
              showAlert("Tokens transferred successfully!", "success");
            } else {
              throw new Error("Transaction failed");
            }
          } catch (error) {
            if (error.code === 4001) {
              // setMessageWithTimeout("Transaction was cancelled by admin.");
              showAlert("Transaction was cancelled by admin.", "error");
              return;
            }
            throw error;
          }
        // }

        setTransactionStatus("All transfers completed successfully!");
        // setActiveSection("redirect-to-distribu/te");
      } catch (error) {
        if (error.code === 4001) {
          // setMessageWithTimeout("Transaction was cancelled by admin.");
          showAlert("Transaction was cancelled by admin.", "error");
        } else if (error.code === -32603) {
          // setMessageWithTimeout("Insufficient funds for transfer.");
          showAlert("Insufficient funds for transfer.", "error");
        } else {
          // setMessageWithTimeout(`Transaction failed: ${error.message}`);
          showAlert(`Transaction failed`, "error");
        }
        console.error("Transaction error:", error);
      }
    } catch (error) {
      console.error("Error Transferring Tokens:", error);
      showAlert(`Error: ${error.message}`, "error");
    } finally {
      setTransactionStatus("");
    }

    // Mark vouchers as minted
    const markMintedResponse = await fetch("/api/admin/markTokenTransfered", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids }),
    });

    if (!markMintedResponse.ok) {
      throw new Error("Failed to mark token as transfered");
    }

  };
  // Mint NFTs for beneficiaries
//   const mintNFT = async (
//     ids,
//     category,
//     metadata,
//     walletAddresses,
//     amount,
//     currencyValue
//   ) => {
//     try {
//       if (!walletAddresses || walletAddresses.length < 1 || !amount) {
//         alert("At least one wallet address and voucher amount are required.");
//         return;
//       }

//       if (!impacttoMoneyContract) {
//         throw new Error("ImpactToMoney contract is not initialized.");
//       }

//       if (!currentStableCoinContract) {
//         throw new Error("Stable coin contract is not set.");
//       }

//       console.log("Minting Initiated", {
//         ids,
//         category,
//         metadata,
//         walletAddresses,
//         amount,
//         currencyValue,
//       });

//       const mintAmount = ethers.utils.parseUnits(amount.toString());

//       const startDateTimestamp = Math.floor(new Date(metadata.startDate).getTime() / 1000); // Convert to seconds
//       const expiryDateTimestamp = Math.floor(new Date(metadata.validity).getTime() / 1000); // Convert to seconds

//       // Calculate total amount for batch minting
//       let totalAmount =
//         walletAddresses.length > 1
//           ? ethers.utils
//               .parseUnits(amount.toString())
//               .mul(walletAddresses.length)
//           : mintAmount;

//       console.log("Total Minting Amount:", totalAmount.toString());

//       // Check MetaMask connection
//       const isConnected = await isMetaMaskConnected();
//       if (!isConnected) {
//         alert("Please connect your MetaMask wallet first.");
//         return;
//       }
      
//       // Whitelist beneficiaries for NFT minting
//       console.log("Whitelisting Beneficiaries...");
//       const whitelistTx = await impacttoMoneyContract.whitelistBeneficiaries(
//         walletAddresses
//       );
//       await whitelistTx.wait();
//       alert("Beneficiaries whitelisted successfully!");

//       // Fetch the connected MetaMask wallet address
//       const [owner] = await provider.listAccounts();
//       console.log("Connected Owner Address:", owner);
//       // console.log("Currency Value", currencyValue)

//       // // Check current allowance for stablecoin transfer
//       // const currentAllowance = await currentStableCoinContract.allowance(
//       //   owner,
//       //   process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS
//       // );

//       // console.log("Current Allowance:", currentAllowance.toString());

//       // Approve total amount if allowance is insufficient
//       // if (currentAllowance.lt(totalAmount)) {
        
//         const approveTx = await currentStableCoinContract.approve(
//           process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS,
//           totalAmount
//         );
//         console.log("wait")
//         await approveTx.wait();
//         alert("Stable coin transfer approved successfully!");
//       // } else {
//       //   console.log("Sufficient allowance already granted.");
//       // }


//       // Mint NFTs
//       console.log("Minting NFTs... ");
//       console.log(walletAddresses, mintAmount, currencyValue);
//       const mintTx = await impacttoMoneyContract.donateAndMint(
//         walletAddresses,
//         mintAmount,
//         currencyValue,
//         startDateTimestamp,
//         expiryDateTimestamp
//       );
//       const mintReceipt = await mintTx.wait();
//       console.log("Minting confirmed, receipt:", mintReceipt);

//       // Mark vouchers as minted
//       const markMintedResponse = await fetch("/api/admin/markVoucherMinted", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ ids }),
//       });

//       if (!markMintedResponse.ok) {
//         throw new Error("Failed to mark vouchers as minted");
//       }

//       // Initialize the data array for storing wallet addresses and token IDs
//       const dataArray = [];

//       for (let address of walletAddresses) {
//         console.log(address);
//         // Fetch the tokenIds associated with the wallet address from the smart contract
//         const tokenId = await impacttoMoneyContract.beneficiaryTokenId(address);
//         console.log("line 385 me token id hun", tokenId.toString());

//         const dataObject = {
//           token_id: tokenId ? tokenId.toString() : null, // Only store the last tokenId
//           wallet_address: address,
//         };
//         console.log("line 396 data object", dataObject);

//         // Add this object to the dataArray
//         dataArray.push(dataObject);
//       }

//       // Prepare the final JSON payload to send to the API
//       const finalJson = {
//         metadata: metadata, // Directly use the provided metadata object
//         data: dataArray,
//       };

//       console.log(finalJson);

//       // Send the final JSON to the API endpoint
//       const response = await fetch("/api/admin/createVouchers", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`, // Assuming token is stored in Cookies
//         },
//         body: JSON.stringify(finalJson),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setMessageWithTimeout(
//           data.message || "Successfully updated the statuses."
//         );
//       } else {
//         setMessageWithTimeout(data.message || "An error occurred.");
//       }

//       alert("NFTs minted successfully!");
//     } catch (error) {
//       console.error("Error minting NFTs:", error);
//     }
//   };


  if (loading)
    
    return (
      <div>
        <Loading />
      </div>
    );

  return (
    <div className="md:pt-10">
      <div className="p-0 md:p-2 mt-4 md:mt-10">
        <div className="flex flex-col gap-2 md:flex-row justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">Token Transfer</h1>
            <p className="text-gray-600 mb-6">
              Transfer Token to the beneficiaries below
            </p>
          </div>
          <div className="p-2">
            <button
              className="bg-yellow-500 rounded-xl text-black p-3"
              onClick={handleBatchMint}
            >
              Batch Transfer
            </button>
          </div>
        </div>
{/* Filters */}
<div className="flex flex-col md:flex-row gap-2 w-full border-collapse shadow-lg bg-gradient-to-br from-white via-blue-300 to-gray-50 rounded-tl-xl rounded-tr-xl overflow-hidden p-3">
            {/* Category Filter */}
            {/* <div className="flex-1 p-3">
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
            </div> */}
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
                  "Token ID",
                  "Picture",
                  "Name",
                  "Email",
                  "Voucher Category",
                  "Voucher Value",
                  "City",
                  "Country",
                  "Actions",
                  " ",
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
                    onMintNFT={() =>
                      handleSingleMintNFT({
                        id: item._id,
                        voucherCategory: item.voucherCategory,
                        metadata: item.metadata,
                        wallet_address: item.wallet_address,
                        amount: item.amount,
                        currency: item.currency,
                      })
                    }
                    showCheckbox={selectedVoucherId !== "All"}
                    isChecked={checkedRows.some((row) => row.id === item._id)}
                    onCheckboxChange={() => {
                      handleCheckboxChange(
                        item._id, // id
                        item.voucherCategory, // category
                        item.metadata, // metadata
                        item.wallet_address, // walletAddress
                        item.amount, // amount
                        item.currency // currency
                      );
                    }}
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
      </div>
    </div>
  );
};

export default TransferToken;