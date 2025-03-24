"use client";
import React, { useState } from "react";
import Image from "next/image";

const TableRow = ({
  voucherId,
  name,
  email,
  voucherCategory,
  picture,
  amount,
  city,
  country,
  currency,
  onMintNFT,
  onRevokeVoucher,
  isChecked,
  showCheckbox,
  walletAddress,
  onRowClick,
  onCheckboxChange = () => {},
}) => {
  const [isProcessed, setIsProcessed] = useState(false); // Initially false

  const handleStatusChange = () => {
    setIsProcessed(true); // Set row as "Processed"

    if (onMintNFT) {
      onMintNFT(voucherId); // Call the minting function
    }

    if (isChecked) {
      onCheckboxChange(voucherId, true); // Notify parent component
    }
    if (onRevokeVoucher) {
      onRevokeVoucher(voucherId); // Notify parent component
    }
  };

  

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

  return (
    <tr
      className="border-b h-24 hover:bg-gray-100 transition-colors text-center"
      onClick={() => onRowClick && onRowClick({
        voucherId,
        name,
        email,
        voucherCategory,
        picture,
        amount,
        city,
        country,
        currency,
        walletAddress,
      })}
    >
      <td className="px-4 py-2">{voucherId}</td>
      <td className="px-4 py-2">
        <div className="w-16 h-16 overflow-hidden mx-auto">
          <Image
            src={picture}
            alt={`${name}'s picture`}
            width={50}
            height={50}
            className="object-cover"
          />
        </div>
      </td>
      <td className="px-4 py-2 text-left">{name}</td>
      <td className="px-4 py-2 text-left">{email}</td>
      <td className="px-4 py-2">{voucherCategory}</td>
      <td className="px-4 py-2">
        <div className="flex items-center justify-center gap-2">
          {getCurrencyIcon(currency) && (
            <div className="w-6 h-6  flex items-center justify-center">
              <Image
                src={getCurrencyIcon(currency)}
                alt="Currency Icon"
                width={24}
                height={24}
                className="object-contain rounded-full"
              />
            </div>
          )}
          <span>{amount.toFixed(2)}</span>
        </div>
      </td>
      <td className="px-4 py-2">{city}</td>
      <td className="px-4 py-2">{country}</td>

      {/* Status Button and onMintNFT function invokation*/}
      {onMintNFT && (
        <td className="px-4 py-2">
          <button
            onClick={handleStatusChange}
            className="bg-green-600 text-white px-4 py-1 rounded-xl shadow hover:bg-green-700 transition"
          >
            {voucherCategory==="Religion"?"Transfer Token":"Distribute Voucher"}
          </button>
        </td>
      )}

      {/* Checkbox Column */}
      {onCheckboxChange && (
        <td className="px-4 py-2">
          {showCheckbox && ( // Conditionally render checkbox
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onCheckboxChange(voucherId)}
            />
          )}
        </td>
      )}
     
    </tr>
  );
};

export default TableRow;
