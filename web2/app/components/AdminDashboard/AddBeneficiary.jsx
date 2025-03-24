import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import InstructionsModal from "./InstructionsModal";
import { ethers } from "ethers";
import ImpacttoMoneyABI from "../../contract/ImpacttoMoney.json";
import Alert from "../../utils/Alert";

const AddBeneficiaryForm = ({ onClose, onSubmit }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDataVerified, setIsDataVerified] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(true);
  const [alert, setAlert] = useState({ message: "", type: "" });

  const [impacttoMoneyContract, setImpacttoMoneyContract] = useState(null);

  useEffect(() => {
    const loadContract = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_IMPACT_TO_MONEY_CONTRACT_ADDRESS,
          ImpacttoMoneyABI.abi,
          signer
        );
        setImpacttoMoneyContract(contract);
      } else {
        console.error("Ethereum provider not found. Please install MetaMask.");
      }
    };

    loadContract();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      if (
        fileType === "text/csv" ||
        fileType ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        fileType === "application/vnd.ms-excel"
      ) {
        setFile(selectedFile);
        setError("");
        setIsDataVerified(false);
      } else {
        setError("Please upload a valid CSV or Excel file.");
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setIsDataVerified(false);
  };

  const verifyData = async (parsedData) => {
    for (const user of parsedData) {
      if (!user.name || !user.email || !user.role) {
        throw new Error("Missing required fields in the data.");
      }
      if (!user.voucherCategory || !user.subCategory || !user.wallet_address) {
        throw new Error(
          "Missing required fields: voucherCategory, subCategory, or wallet_address."
        );
      }
      if (!user.city || !user.country) {
        throw new Error(
          "Missing required fields in additionalInfo: city, or country."
        );
      }

      // Validate CGPA
      if (
        user.cgpa !== undefined &&
        user.cgpa !== "" &&
        (isNaN(user.cgpa) || Number(user.cgpa) < 0.0 || Number(user.cgpa) > 4.0)
      ) {
        throw new Error("CGPA must be a decimal number between 0.0 and 4.0.");
      }
    }
    return true;
  };

  const handleVerifyData = async () => {
    if (!file) {
      setError("Please select a file to verify.");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet).map((user) => ({
        ...user,
        wallet_address: String(user.wallet_address),
      }));

      await verifyData(parsedData);
      setIsDataVerified(true);
      showAlert("Data verified successfully!", "success");

      // Whitelist each beneficiary
      const walletAddresses = parsedData.map((user) => user.wallet_address);
      if (impacttoMoneyContract) {
        const tx = await impacttoMoneyContract.whitelistBeneficiaries(
          walletAddresses
        );
        await tx.wait();
        showAlert("Beneficiaries whitelisted successfully!", "success");
      } else {
        showAlert("Impact to Money contract is not initialized.", "error");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(error.message);
      showAlert(error.message, "error");
      setIsDataVerified(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const parsedData = XLSX.utils.sheet_to_json(worksheet);

      const transformedData = parsedData.map((user) => ({
        name: user.name,
        email: user.email,
        role: user.role,
        cnic: user.cnic,
        voucherCategory: user.voucherCategory,
        additionalInfo: {
          university: user.university || null,
          college: user.college || null,
          school: user.school || null ,
          grade: user.grade || null,
          cgpa: user.cgpa || null,
          purpose: user.purpose || null,
          hospital: user.hospital || null,
          disease: user.disease || null,
        },
        wallet_address:
          typeof user.wallet_address === "number"
            ? user.wallet_address.toString()
            : user.wallet_address,
        subCategory: user.subCategory,
        subEducationCategory: user.subEducationCategory || null, 
        picture: user.picture,
        home: user.home,
        phone: user.phone,
        city: user.city,
        country: user.country,
        religion: user.religion,
        childrenPurpose: user.childrenPurpose || null,
      }));

      const response = await fetch("/api/admin/csvData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        throw new Error("Failed to register users");
      }

      const result = await response.json();
      showAlert(result.message, "success");
      onSubmit();
    } catch (error) {
      console.error("Error:", error);
      showAlert(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert({ message: "", type: "" });
    }, 5000); // Clear alert after 5 seconds
  };
  return (
    <div className="mt-10 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-3xl w-full">
        {alert.message && (
          <Alert message={alert.message} type={alert.type} duration={5000} />
        )}
        <h2 className="text-2xl font-bold text-center mb-6 mt-4">
          Add Beneficiary
        </h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!file ? (
            <>
              <label className="block mb-2">
                Upload CSV or Excel File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".csv, .xls, .xlsx"
                onChange={handleFileChange}
                className="border p-3 rounded-xl mb-4 w-full"
                required
              />
            </>
          ) : (
            <div className="mb-4">
              <p className="text-gray-700">Selected File: {file.name}</p>
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded-xl"
                onClick={handleRemoveFile}
              >
                Remove File
              </button>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded-xl"
              onClick={onClose}
            >
              Cancel
            </button>

            {!isDataVerified ? (
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded-xl"
                onClick={handleVerifyData}
                disabled={loading || !file}
              >
                Verify Data
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl"
                disabled={loading}
              >
                {loading ? "Addding..." : "Add Beneficiary"}
              </button>
            )}
          </div>
        </form>
      </div>

      <InstructionsModal
        isOpen={isInstructionsModalOpen}
        onClose={() => setIsInstructionsModalOpen(false)}
      ></InstructionsModal>
    </div>
  );
};

export default AddBeneficiaryForm;
