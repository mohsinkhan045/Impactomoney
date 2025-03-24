/*
---------------------------------------------------
Project:        FundingProject
Date:           Dec 01, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file holds the NFT Vouchers.
---------------------------------------------------
*/
import React, { useState, useEffect } from "react";
import Image from "next/image";
import ImpacttoMoneyABI from "../../contract/ImpacttoMoney.json";
import Loading from "../ProviderDashboard/loading";
import { ethers } from "ethers";
import Cookies from "js-cookie";

const VoucherTable = ({ wallet_address, id, name, email, voucherCategory }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const fetchVouchers = async () => {
      console.log("wallet address is ", wallet_address);
      console.log("id is", id);
      console.log("name is ", name);
      console.log("email is ", email);
      try {
        let response;
        const authToken = Cookies.get("authToken");

        if (voucherCategory === "Religion") {
          response = await fetch(
            `/api/user/beneficiary/getTransferedToken?wallet_address=${wallet_address}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
        } else {
          response = await fetch(
            `/api/user/beneficiary/getVouchers?wallet_address=${wallet_address}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
        }

        const data = await response.json();
        if (response.status === 404) {
          setVouchers([]);
          setMessage("No vouchers found");
          return;
        }

        console.log("beneficiary data fetched", data);

        if (response.ok) {
          setVouchers(data);
          console.log(data);
        } else {
          setError(data.message || "Failed to fetch vouchers.");
          setMessage(data.message);
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, [wallet_address, id, name, email, voucherCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const authToken = Cookies.get("authToken");
        if (!authToken) {
          setError("Unauthorized. Please log in.");
          setLoading(false);
          return;
        }

        const providersResponse = await fetch(
          "/api/admin/serviceProviderList",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const providersData = await providersResponse.json();
        const approvedBeneficiaries = providersData.data.providers.filter(
          (Provider) => Provider.status === "approved"
        );
        console.log(providersData);
        setProviders(approvedBeneficiaries || []);
      } catch (err) {
        setError("Error loading data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <p>
        <Loading />
      </p>
    );
  if (error) return <p className="text-red-500">{error.message}</p>;

  if (!vouchers || !vouchers.data || vouchers.data.length === 0) {
    return (
      <div className="flex justify-center items-center pt-5">
        <h1 className="text-2xl font-bold">
          {voucherCategory === "Religion" ? (
            "No Token Issued"
          ) : (
            <div className="flex items-center flex-col gap-3">
              <p>No Voucher Issued</p>
              <p className="text-base text-gray-700 ">Your Voucher list is currently empty.</p>
            </div>
          )}
        </h1>
      </div>
    );
  }

  return (
    <div className="md:p-6">
      <h2 className="text-2xl font-bold mb-4 text-BgColor border-b pb-2">
        {voucherCategory === "Religion"
          ? vouchers.length === 1
            ? "Your Token"
            : "Your Tokens"
          : vouchers.length === 1
          ? "Your Voucher"
          : "Your Vouchers"}
      </h2>
      <p className="text-md text-gray-800 mb-4">
        {voucherCategory === "Religion"
          ? "Use your token details below to redeem your Education."
          : "Import your NFT using the contract address and token ID below."}
      </p>
      <div className="overflow-y-scroll h-3/5">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead className="text-gray-500 tracking-tight">
            <tr>
              {voucherCategory === "Religion" ? (
                <>
                  <th className="py-3 px-4 text-left border-b-2 border-gray-300 pb-2">#</th>
                  <th className="py-3 px-4 text-left border-b-2 border-gray-300 pb-2">Education Type</th>
                  <th className="py-3 px-4 text-left border-b-2 border-gray-300 pb-2">Wallet Address</th>
                  <th className="py-3 px-4 text-left border-b-2 border-gray-300 pb-2">Currency</th>
                  <th className="py-3 px-4 text-left border-b-2 border-gray-300 pb-2">Amount</th>
                </>
              ) : (
                <>
                  {[
                    "#",
                    "Image",
                    "Token ID",
                    "Voucher Name",
                    "Voucher Type",
                    "Wallet Address",
                    "Amount",
                    "Status",
                    "Action",
                  ].map((header, index) => (
                    <th key={index} className="py-3 px-4 text-left border-b-2 border-gray-300 pb-2">
                      {header}
                    </th>
                  ))}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {vouchers?.data?.map((voucher, index) => (
              <VoucherRow
                key={index}
                index={index + 1}
                image={
                  voucherCategory === "Religion"
                    ? voucher?.metadata?.metaDataUrl
                    : voucher.metaDataUrl
                }
                tokenId={
                  voucherCategory === "Religion"
                    ? voucher.voucherId
                    : voucher.tokenId
                }
                voucherId={voucher._id}
                voucherName={
                  voucherCategory === "Religion"
                    ? voucher?.metadata?.voucher_name
                    : voucher?.voucherName
                }
                voucherType={
                  voucherCategory === "Religion"
                    ? voucher?.metadata?.voucher_type
                    : voucher?.voucherType
                }
                walletAddress={
                  voucherCategory === "Religion"
                    ? voucher?.wallet_address
                    : voucher?.walletAddress
                }
                beneficiaryId={id}
                currency={
                  voucherCategory === "Religion"
                    ? voucher?.currency
                    : voucher.currencyChoice
                }
                beneficiaryName={name}
                beneficiaryEmail={email}
                amount={voucher.amount}
                status={voucher.status}
                providers={providers}
                revoked={voucher.revoked}
                voucherCategory={voucher?.voucherCategory}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoucherTable;

const VoucherRow = ({
  index,
  image,
  tokenId,
  voucherId,
  voucherName,
  voucherType,
  walletAddress,
  beneficiaryId,
  beneficiaryName,
  beneficiaryEmail,
  amount,
  status,
  revoked,
  currency,
  providers,
  voucherCategory,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerWalletAddress, setProviderWalletAddress] = useState("");
  const [serviceProviderId, setServiceProviderId] = useState("");
  const [serviceProviderName, setServiceProviderName] = useState("");
  const [provider, setProvider] = useState(null);
  const [impacttoMoneyContract, setImpacttoMoneyContract] = useState(null);
  const [redeemAmount, setRedeemAmount] = useState(""); // New state for redeem amount

  const getCurrencyIcon = (currency) => {
    const parsedCurrency = Number(currency);
    switch (parsedCurrency) {
      case 0:
        return "https://res.cloudinary.com/db3yy1i0j/image/upload/v1738171111/images_1_fu6vn6.jpg";
      case 1:
        return "https://res.cloudinary.com/db3yy1i0j/image/upload/v1738168145/paypalUsd_hzu2wn.png";
      case 2:
        return "https://res.cloudinary.com/db3yy1i0j/image/upload/v1738168111/usdt_joqq4c.png";
      case 3:
        return "https://res.cloudinary.com/db3yy1i0j/image/upload/v1738168179/USDC_vdxvv8.svg";
      default:
        return null;
    }
  };

  useEffect(() => {
    const loadProvider = async () => {
      try {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);

        const tempSigner = tempProvider.getSigner();

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

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleProviderChange = (e) => {
    const providerId = e.target.value;
    const selected = providers.find((provider) => provider._id === providerId);
    setSelectedProvider(selected);
    if (selected) {
      setProviderWalletAddress(selected.wallet_address);
      setServiceProviderId(selected._id);
      setServiceProviderName(selected.name);
    }
  };

  const isMetaMaskConnected = async () => {
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  };

  const handleVoucherRedemption = async () => {
    console.log(
      "bene wallet ",
      walletAddress,
      "provider wallet ",
      providerWalletAddress,
      "token id ",
      tokenId,
      "currency",
      currency
    );
    try {
      const isConnected = await isMetaMaskConnected();
      if (!isConnected) {
        alert("Please connect your MetaMask wallet first.");
        return;
      }

      const authToken = Cookies.get("authToken");
      if (!authToken) {
        alert("Unauthorized. Please log in.");
        return;
      }

      if (!impacttoMoneyContract) {
        alert("ITM Contract is not initialized.");
        return;
      }

      const checkWhiteList = await impacttoMoneyContract.whitelistedBeneficiaries(walletAddress);
      console.log("checkWhiteList", checkWhiteList);

      // Update the voucher amount in the database
      const updatedAmount = Number(amount) - Number(redeemAmount);
      const response = await fetch("/api/user/beneficiary/updateVoucherAmount", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          voucherId,
          amount: updatedAmount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Error updating voucher amount:", data);
        alert("Failed to update voucher amount.");
        return;
      }

      const tx = await impacttoMoneyContract.redeem(
        walletAddress,
        tokenId,
        providerWalletAddress,
        redeemAmount // Pass the redeem amount to the blockchain function
      );
      const redeemReciept = await tx.wait();
      console.log("Redeem receipt:", redeemReciept);

      // New API call to create redeemed voucher
      const redeemResponse = await fetch("/api/user/beneficiary/redeemVoucher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          beneficiaryId,
          beneficiaryName,
          beneficiaryEmail,
          serviceProviderId,
          serviceProviderName,
          voucherId,
          redeemAmount,
          redeemAmount // Include redeem amount in the request
        }),
      });

      const redeemData = await redeemResponse.json();
      console.log(redeemData);
      if (redeemResponse.ok) {
        alert("Voucher successfully redeemed!");
      } else {
        console.error("Error redeeming voucher:", redeemData);
      }
    } catch (err) {
      alert(err);
    }
    setDropdownVisible(false);
  };

  return (
    <>
      <tr className="border-b rounded hover:bg-gray-50 cursor-pointer">
        <td className="py-4 px-5 text-gray-500">{index}</td>
        {voucherCategory === "Religion" ? (
          <>
            <td className="py-4 px-5 text-gray-800 font-semibold">{voucherType || "N/A"}</td>
            <td className="py-4 px-5 text-gray-500">{walletAddress || "N/A"}</td>
            <td className="py-4 px-5 text-gray-500">
              {currency ? (
                <img
                  src={getCurrencyIcon(currency)}
                  alt="Currency Icon"
                  className="w-6 h-6 inline-block"
                />
              ) : (
                "N/A"
              )}
            </td>
            <td className="py-4 px-5 text-gray-500">{Number(amount).toFixed(2) || "N/A"}</td>
          </>
        ) : (
          <>
            <td className="py-4 px-5 flex gap-3 items-center">
              <Image
                src={image || "/placeholder-image.png"}
                alt="Voucher"
                width={100}
                height={100}
                className="rounded shadow"
              />
            </td>
            <td className="py-4 px-5 text-gray-800 font-semibold">{tokenId || "N/A"}</td>
            <td className="py-4 px-5 text-gray-800 font-semibold">{voucherName || "N/A"}</td>
            <td className="py-4 px-5 text-gray-500">{voucherType || "N/A"}</td>
            <td className="py-4 px-5 text-gray-500">{walletAddress || "N/A"}</td>
            <td className="py-4 px-5 text-gray-500">{Number(amount).toFixed(2) || "N/A"}</td>
            <td className="py-4 px-5">
              <span className={`${status === "active" ? "text-green-500" : "text-gray-400"}`}>
                {status}
              </span>
            </td>
            <td className="py-4 px-5">
              {revoked ? (
                <div className="relative group">
                  <button className="py-1 px-3 rounded bg-gray-400 text-white cursor-not-allowed">Revoked</button>
                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-sm py-1 px-2 rounded shadow-lg -top-8 left-1/2 transform -translate-x-1/2 w-48 text-center">
                    Voucher is revoked by admin, you cannot redeem it
                  </div>
                </div>
              ) : (
                <button
                  className={`py-1 px-3 rounded ${
                    status === "active"
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={status === "redeemed"}
                  onClick={toggleDropdown}
                >
                  {status === "active" ? "Redeem" : "Redeemed"}
                </button>
              )}
            </td>
          </>
        )}
      </tr>

      {dropdownVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="p-6 bg-white rounded-lg shadow-md w-11/12 max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Redeem Your Voucher</h2>
            <select
              value={selectedProvider?._id || ""}
              onChange={handleProviderChange}
              className="w-full p-2 border rounded-md text-gray-700"
            >
              <option value="">Select Provider</option>
              {Array.isArray(providers) && providers.length > 0 ? (
                providers.map((provider) => (
                  <option key={provider._id} value={provider._id}>
                    {provider.name}
                  </option>
                ))
              ) : (
                <option>No providers available</option>
              )}
            </select>

            {walletAddress && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700">Beneficiary Wallet Address:</h3>
                <p className="text-sm text-gray-600">{walletAddress}</p>
              </div>
            )}

            {providerWalletAddress && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700">Provider Wallet Address:</h3>
                <p className="text-sm text-gray-600">{providerWalletAddress}</p>
              </div>
            )}

            <div className="mt-4">
              <label className="font-medium text-gray-700">Redeem Amount:</label>
              <input
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                className="w-full p-2 border rounded-md text-gray-700"
                placeholder="Enter amount to redeem"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDropdownVisible(false)}
                className="px-4 py-2 rounded-lg shadow bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleVoucherRedemption}
                className="px-4 py-2 rounded-lg shadow bg-green-500 text-white hover:bg-green-600"
                disabled={!selectedProvider || !redeemAmount}
              >
                Redeem Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
