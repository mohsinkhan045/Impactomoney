"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import Loading from "../../../../components/ProviderDashboard/loading";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { BsCalendar2DateFill } from "react-icons/bs";
const Categories = {
  Education: "Education",
  Healthcare: "Health",
  Children:"Children",
  Religion:"Religion",
  Humanitarian:"Humanitarian",
  Crisis:"Crisis",
  Government:"Government",
  E_Com:"E-Com"
};

// Create a memoized row component
const BeneficiaryRow = React.memo(({ beneficiary, index, getVoucherDetails }) => (
  <tr className="border-b border-gray-200 transition-transform duration-500  hover:border-2  hover:bg-gray-100">
    <td className="py-1 px-3">{index + 1}</td>
    <td className="py-1 px-3">{beneficiary.name}</td>
    <td className="py-1 px-3">{beneficiary.email}</td>
    {/* <td className="py-1 px-3">{beneficiary.cnic}</td> */}
    <td className="py-1 px-3">{beneficiary.wallet_address}</td>
    <td className="py-1 px-3">{beneficiary.voucherCategory}</td>
    {/* <td className="py-1 px-3">
      {beneficiary?.documents?.map((doc, docIndex) => (
        <Link
          key={docIndex}
          href={doc || ""}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-700 transition duration-200"
        >
          Document {docIndex + 1}
        </Link>
      ))}
    </td> */}
    <td className="py-1 px-3">
      {getVoucherDetails(beneficiary)}
    </td>
    <td className="py-1 px-3">
      {new Date(beneficiary.createdAt).toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      })}
    </td>
    {/* <td className="py-1 px-3">
      {new Date(beneficiary.updatedAt).toLocaleString("en-US", {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      })}
    </td> */}
    <td className="py-1 px-3 text-green-700 text-lg font-semibold">{beneficiary?.status}</td>
  </tr>
));

export default function ApprovedBeneficiary() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // Number of rows per page
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showDateSort, setShowDateSort] = useState(false);
  const [sortOrder, setSortOrder] = useState("newToOld"); // "newToOld" or "oldToNew"
  const router = useRouter();

  // Memoize fetchBeneficiaries function since it's used in useEffect
  const fetchBeneficiaries = useCallback(async (token) => {
    try {
      const response = await fetch("/api/admin/beneficiaryList", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch beneficiaries");
      }

      const data = await response.json();
      const approvedBeneficiaries = data.data.beneficiaries.filter(
        (beneficiary) => beneficiary.status === "approved"
      );
      setBeneficiaries(approvedBeneficiaries || []);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      setError("Failed to fetch beneficiaries. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any props or state

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      setError("No token found. Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      fetchBeneficiaries(token);
    }
  }, [fetchBeneficiaries, router]);

  const toggleCategoryFilter = () => setShowCategoryFilter(!showCategoryFilter);
  const toggleDateSort = () => setShowDateSort(!showDateSort);

  // Memoize sorting function to prevent unnecessary recalculations
  const handleSortChange = useCallback((e) => {
    const order = e.target.value;
    setSortOrder(order);

    setBeneficiaries(prev => 
      [...prev].sort((a, b) =>
        order === "newToOld"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt)
      )
    );
  }, []);

  // Memoize filtered beneficiaries to prevent recalculation on every render
  const filteredBeneficiaries = useMemo(() => 
    filter
      ? beneficiaries.filter(
          (beneficiary) =>
            beneficiary.voucherCategory &&
            beneficiary.voucherCategory.toLowerCase() === filter.toLowerCase()
        )
      : beneficiaries,
    [beneficiaries, filter]
  );

  // Calculate the current beneficiaries to display
  const indexOfLastBeneficiary = currentPage * rowsPerPage;
  const indexOfFirstBeneficiary = indexOfLastBeneficiary - rowsPerPage;
  const currentBeneficiaries = filteredBeneficiaries.slice(indexOfFirstBeneficiary, indexOfLastBeneficiary);

  // Calculate total pages
  const totalPages = Math.ceil(filteredBeneficiaries.length / rowsPerPage);

  // Function to handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Memoize getVoucherDetails function
  const getVoucherDetails = useCallback((beneficiary) => {
    switch (beneficiary.voucherCategory) {
      case "Education":
        return `University: ${beneficiary?.voucherDetails?.university}, CGPA: ${beneficiary?.voucherDetails?.cgpa}`;
      case "Health":
        return `Disease: ${beneficiary?.voucherDetails?.disease}, Hospital: ${beneficiary?.voucherDetails?.hospital}`;
      case "Children":
        return `Children's Age: ${beneficiary?.voucherDetails?.age}, Guardian's Name: ${beneficiary?.voucherDetails?.guardian}`;
      case "Religion":
        return `Religion: ${beneficiary?.voucherDetails?.religion}`;
      default:
        return "No additional details available";
    }
  }, []);

  if (loading) return <div><Loading /></div>;

  return (
    <div className="p-0 md:p-6">
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-col md:flex-row md:justify-between">
        <h2 className="text-2xl font-bold mb-4">Approved Beneficiaries</h2>
        <div className="flex items-center gap-3">
                 <label className="font-medium">Filter by Category:</label>
                 <span className="ml-2 cursor-pointer relative">
                   <BiSolidCategoryAlt onClick={() => toggleCategoryFilter()} />
                   {showCategoryFilter && (
                     <div className="absolute bg-white shadow-md rounded mt-2">
                       <select
                         value={filter}
                         onChange={(e) => {
                           setFilter(e.target.value);
                           toggleCategoryFilter();
                         }}
                         className="border rounded p-1"
                       >
                         <option value="">All Categories</option>
                         {Object.values(Categories).map((category) => (
                           <option key={category} value={category}>
                             {category}
                           </option>
                         ))}
                       </select>
                     </div>
                   )}
                 </span>
       
                 <div className="flex items-center">
                   <label className="mr-2 font-medium">Sort by Date:</label>
                   <span className="ml-2 cursor-pointer relative">
                     <BsCalendar2DateFill size={18} onClick={() => toggleDateSort()} />
                     {showDateSort && (
                       <div className="absolute bg-white shadow-md rounded  mt-2">
                         <select
                           value={sortOrder}
                           onChange={(e) => {
                             handleSortChange(e);
                             toggleDateSort();
                           }}
                           className="border rounded p-1"
                         >
                           <option value="newToOld">Newest First</option>
                           <option value="oldToNew">Oldest First</option>
                         </select>
                       </div>
                     )}
                   </span>
                 </div>
               </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-scroll">
        <table className="table-auto w-full border-collapse shadow-lg bg-white rounded-xl overflow-hidden">
          <thead className="bg-gray-200 ">
            <tr>
              {[
                "ID",
                "Name",
                "Email",
                // "National ID",
                "Wallet ID",
                "Category",
                // "Document",
                "Details",
                "Created_At",
                // "Updated_At",
                "Status"
              ].map((header) => (
                <th key={header} className="py-6 px-4 text-left border-b-2 border-gray-300 text-black">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-gray-600 text-sm font-light">
          {currentBeneficiaries?.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-4 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
            currentBeneficiaries.map((beneficiary, index) => (
              <BeneficiaryRow
                key={beneficiary._id}
                beneficiary={beneficiary}
                index={index + indexOfFirstBeneficiary} // Adjust index for display
                getVoucherDetails={getVoucherDetails}
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
          className="bg-blue-500 text-white px-4 py-2 rounded-xl disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-blue-500 text-white px-4 py-2 rounded-xl disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
