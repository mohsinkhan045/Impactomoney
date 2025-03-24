"use client";
import React, { useEffect, useState } from "react";
import DistributedVoucherTableRow from "./voucherTableRow";
import Cookies from "js-cookie";
import Loading from "../ProviderDashboard/loading";
import {ethers} from "ethers";
import ImpacttoMoneyABI from "../../contract/ImpacttoMoney.json";

const DistributedVouchers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRevoked , setIsRevoke]= useState(false)
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [itemsPerPage] = useState(10); // Items per page
  const [message, setMessage] = useState(""); // Items per page
  const [impacttoMoneyContract, setImpacttoMoneyContract] = useState(null);
  const [provider, setProvider] = useState(null);
  
 

  const token = Cookies.get("authToken");
  const setMessageWithTimeout = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 5000); // Clear message after 3 seconds
  };

  useEffect(() => {
    const loadProvider = async () => {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      const tempSigner = tempProvider.getSigner();
      // const stableCoin = new ethers.Contract(
      //   process.env.NEXT_PUBLIC_STABLE_COIN_CONTRACT_ADDRESS,
      //   StableCoinABI.abi,
      //   tempSigner
      // );
      const impacttoMoney = new ethers.Contract(
        process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS,
        ImpacttoMoneyABI.abi,
        tempSigner
      );
      // setStableCoinContract(stableCoin);
      setImpacttoMoneyContract(impacttoMoney);
    };
    loadProvider();
  }, []);

  // Fetch beneficiary data from API
  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/distributedVoucher", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });


        const result = await response.json();
        if (response.ok) {
          setData(result.data);
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

  

  // Calculate pagination with filtered data
  const activeVouchers = data.filter(voucher => voucher.status === "active");
  // Calculate pagination
  const totalPages = Math.ceil(activeVouchers.length / itemsPerPage);
  const paginatedData = activeVouchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  const handleRevoke = async (voucherId,walletAddress) => {
    console.log("voucherId", voucherId, walletAddress)
    try {
      setLoading(true);
      setMessageWithTimeout(""); // Clear previous messages

  
      const response = await fetch("/api/user/beneficiary/voucher", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({voucherId}),
      });
      
  
      console.log("after response console", response)
      const data = await response.json();
      console.log("revoked data" , data)
      if (!response.ok) {
        setMessageWithTimeout(`Error: ${data.message || "Something went wrong"}`);
        return;
      }

  
      // Success: Update state
      setIsRevoke(data.data.revoked);
      
      //  revokevouxher integeration
      const tx = await impacttoMoneyContract.revokeVoucher(voucherId,walletAddress);
      await tx.wait();
      setMessageWithTimeout("Voucher successfully revoked!");
      
      
    }
     catch (error) {
      console.error("Error revoking voucher:", error);
      // setMessageWithTimeout("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

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
        <div>
          <h1 className="text-2xl font-bold mb-2">Distributed Vouchers List</h1>
          <p className="text-gray-600 mb-6">
          Here is the list of  Vouchers distributed to the beneficiries.
          </p>
        </div>
        
      </div>

      <div className="overflow-x-auto">

      {/* ✅ Display Success/Error Messages */}
      {message && (
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded mb-4">
          {message}
        </div>
      )}
        <table className="table-auto w-full border-collapse shadow-lg bg-white rounded-xl overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              {[
                "Voucher ID",
                "Voucher Name",
                "Voucher Type",
                "Wallet Address",
                "Token ID",
                "Voucher Value",
                "NFT Voucher",
                "Status",
                "Actions",
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
            paginatedData.map((voucher, index) => (
             <DistributedVoucherTableRow
             key={index}
             voucherId={voucher.voucherId}
             voucherName={voucher.voucherName}
             voucherIssuer={voucher.voucherIssuer}
             voucherType={voucher.voucherType}
             walletAddress={voucher.walletAddress}
             tokenId={voucher.tokenId}
             amount={voucher.amount}
             metaDataUrl={voucher.metaDataUrl}
             status={voucher.status}
             revoked={voucher.revoked}
             onRevokeVoucher={()=>{
                handleRevoke(voucher.voucherId, voucher.walletAddress);
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
          className={`px-4 py-2  rounded-xl  ${
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
          className={`px-4 py-2  rounded-xl  ${
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

export default DistributedVouchers;
