const BeneficiaryListRow = ({
    index,
    image,
    beneficiaryName,
    email,
    voucherName,
    voucherType,
    walletAddress,
    amount,
  }) => {
    return (
      <tr className="border-b hover:bg-gray-50 cursor-pointer">
        <td className="py-4 px-5 text-gray-500">{index}</td>
        <td className="py-4 px-5">
          <img
            src={image || ""}
            alt="Voucher"
            className="w-16 h-16 rounded shadow"
          />
        </td>
        <td className="py-4 px-5 text-gray-800 font-semibold">
          {beneficiaryName || "N/A"}
        </td>
        <td className="py-4 px-5 text-gray-500">{email || "N/A"}</td>
        <td className="py-4 px-5 text-gray-800 font-semibold">
          {voucherName || "N/A"}
        </td>
        <td className="py-4 px-5 text-gray-500">{voucherType || "N/A"}</td>
        <td className="py-4 px-5 text-gray-500">{walletAddress || "N/A"}</td>
        <td className="py-4 px-5 text-gray-500">${""}{Number(amount).toFixed(2) || "N/A"}</td>
      </tr>
    );
  };
  
  export default BeneficiaryListRow;
  