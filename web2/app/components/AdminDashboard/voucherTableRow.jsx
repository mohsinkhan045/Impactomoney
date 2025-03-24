"use client";
import React, { useState } from "react";
import Link from "next/link";

const DistributedVoucherTableRow = ({
  voucherId,
  voucherName,
  voucherType,
  walletAddress,
  tokenId,
  amount,
  metaDataUrl,
  status,
  revoked,
  onRevokeVoucher,
}) => {
  const [isRevoked, setIsRevoked] = useState(revoked); // Track revocation status

  // Handle revocation logic
  const handleRevokeClick = (voucherId) => {
    if (onRevokeVoucher) {
      onRevokeVoucher(voucherId); // Call revoke function
      setIsRevoked(true); // Update UI state
    }
  };

  // Get currency icon (Dummy logic; replace as needed)
  //   const getCurrencyIcon = (voucherType) => {
  //     switch (voucherType.toLowerCase()) {
  //       case "education":
  //         return "https://res.cloudinary.com/db3yy1i0j/image/upload/v1738171111/images_1_fu6vn6.jpg";
  //       case "healthcare":
  //         return "https://res.cloudinary.com/db3yy1i0j/image/upload/v1738168145/paypalUsd_hzu2wn.png";
  //       case "children":
  //         return "https://res.cloudinary.com/db3yy1i0j/image/upload/v1738168111/usdt_joqq4c.png";
  //       default:
  //         return null;
  //     }
  //   };

  return (
    <tr
      className={`border-b h-24 text-center transition-colors ${
        isRevoked ? "bg-red-100" : "hover:bg-gray-100"
      }`}
    >
      <td className="px-4 py-2">{voucherId}</td>
      <td className="px-4 py-2">{voucherName}</td>
      <td className="px-4 py-2">{voucherType}</td>
      <td className="px-4 py-2">{walletAddress}</td>
      <td className="px-4 py-2">{tokenId}</td>
      <td className="px-4 py-2">{amount}</td>
      {metaDataUrl && (
        <td className="px-4 py-2">
          <Link
            href={metaDataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Metadata
          </Link>
        </td>
      )}

      <td className="px-4 py-2">{status}</td>

      {/* Revoke Button */}
      {onRevokeVoucher && (
        <td className="px-4 py-2">
          {!isRevoked ? (
            <button
              onClick={() => {
                handleRevokeClick(voucherId);
              }}
              className="bg-green-600 text-white px-4 py-1 rounded-xl shadow hover:bg-green-700 transition"
            >
              Revoke
            </button>
          ) : (
            <span className="text-red-600 font-bold">Revoked</span>
          )}
        </td>
      )}
    </tr>
  );
};

export default DistributedVoucherTableRow;
