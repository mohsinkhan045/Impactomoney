"use client";
import React, { useState, useEffect } from "react";
import Loading from "./loading";
import BeneficiaryListRow from "./beneficiaryRow";
import Cookies from "js-cookie";
const BeneficiaryListTable = () => {
  const [loading, setLoading] = useState(true);
  // const [rederror, setRedError] = useState(null);
  const [redeemedBeneficiary, setRedeemedBeneficiaries] = useState([]); // API response
  const [error, setError] = useState(null);

  const token = Cookies.get("authToken"); // Replace with the actual token

  const fetchRedeemedBeneficiaries = async () => {
    try {
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
        throw new Error(
          data.message || "Failed to fetch Redeemed Beneficiary List"
        );
      }
    
      setRedeemedBeneficiaries(data.data);
    } catch (err) {
     console.log("err", err.message)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedeemedBeneficiaries();
  }, []);


  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  // if (rederror) return <p className="text-red-500">{rederror}</p>;

  // Check if there are no redeemed beneficiaries
if (!redeemedBeneficiary || redeemedBeneficiary.length === 0) {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-700 mt-4">
          No Beneficiary Redeemed
        </h1>
        <p className="text-gray-500 mt-2">
          There are no redeemed beneficiaries for this provider yet.
        </p>
      </div>
    </div>
  );
}
// Static placeholder data
// const staticData = [
//   {
//     id: 1,
//     beneficiaryName: "Syria",
//     beneficiaryEmail: "syria@gmail.com",
//     voucherType: "Children",
//     amount: "50",
//     walletAddress: "0x123...45678",
//     voucherName: "Children Voucher",
//     image: "/bg1.jpg", // Placeholder image path
//   },
// ];

// // Use static data if no redeemed beneficiaries exist
// const dataToDisplay =
//   redeemedBeneficiary || redeemedBeneficiary.length === 0
//     ? staticData
//     : redeemedBeneficiary;



  return (
    <div className="bg-gradient-to-br from-white via-blue-100 to-gray-50 shadow-lg w-full rounded p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-BgColor border-b pb-2">
        Beneficiary List
      </h2>
      <p className="text-md text-gray-800 mb-4">
      {redeemedBeneficiary.length === 0
          ? "No beneficiaries found for this provider. Showing placeholder data:"
          : "Redeemed beneficiaries List."}
      </p>
      <div className="overflow-y-scroll h-3/5">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="text-gray-500 tracking-tight">
            <tr>
              {[
                "#",
                "Image",
                "Beneficiary Name",
                "Email",
                "Voucher Name",
                "Voucher Type",
                "Wallet Address",
                "Amount",
              ].map((header, index) => (
                <th
                  key={index}
                  className="py-3 px-4 text-left border-b-2 border-gray-300 pb-2"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {redeemedBeneficiary.map((beneficiary, index) => (
              <BeneficiaryListRow
                key={beneficiary.id || index}
                index={index + 1}
                beneficiaryName={beneficiary.beneficiaryName}
                email={beneficiary.beneficiaryEmail}
                voucherType={beneficiary.voucherType}
                amount={beneficiary.amount}
                walletAddress={beneficiary.walletAddress}
                voucherName={beneficiary.voucherName}
                image={beneficiary.image}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BeneficiaryListTable;
