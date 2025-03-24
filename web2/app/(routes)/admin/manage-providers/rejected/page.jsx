/*
---------------------------------------------------
Project:        FundingProject
Date:            Oct 25, 2024
Author:         Mohsin
---------------------------------------------------

Description:
Admin Panel: Manages the service provider Approved application status page
---------------------------------------------------
*/

"use client";
import Loading from "../../../../components/ProviderDashboard/loading";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { BsCalendar2DateFill } from "react-icons/bs";

const Categories = {
  Education: "Education",
  Healthcare: "Health",
  Children: "Children",
  Religion: "Religion",
  Humanitarian: "Humanitarian",
  Crisis: "Crisis",
  Government: "Government",
  E_Com: "E-Com",
};
export default function RejectedServiceProvider() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showDateSort, setShowDateSort] = useState(false);
  const [sortOrder, setSortOrder] = useState("newToOld"); // "newToOld" or "oldToNew"
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Set items per page

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      setError("No token found. Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      fetchBeneficiaries(token);
    }
  }, [router]);

  const fetchBeneficiaries = async (token) => {
    try {
      const response = await fetch("/api/admin/serviceProviderList", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch beneficiaries");
      }

      const data = await response.json();
      console.log(data);
      const approvedBeneficiaries = data.data.providers.filter(
        (Provider) => Provider.status === "rejected"
      );
      setBeneficiaries(approvedBeneficiaries || []);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      setError("Failed to fetch beneficiaries. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategoryFilter = () => setShowCategoryFilter(!showCategoryFilter);
  const toggleDateSort = () => setShowDateSort(!showDateSort);

  // Handle sorting order change
  const handleSortChange = (e) => {
    const order = e.target.value;
    setSortOrder(order);

    const sortedBeneficiaries = [...beneficiaries].sort((a, b) =>
      order === "newToOld"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

    setBeneficiaries(sortedBeneficiaries);
  };
  const filteredBeneficiaries = filter
    ? beneficiaries.filter(
        (Provider) =>
          Provider.voucherCategory &&
          Provider.voucherCategory.toLowerCase() === filter.toLowerCase()
      )
    : beneficiaries;

  // Calculate the current beneficiaries to display
  const indexOfLastBeneficiary = currentPage * itemsPerPage;
  const indexOfFirstBeneficiary = indexOfLastBeneficiary - itemsPerPage;
  const currentBeneficiaries = filteredBeneficiaries.slice(
    indexOfFirstBeneficiary,
    indexOfLastBeneficiary
  );

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );

  return (
    <div className="p-0 md:p-6">
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-col md:flex-row md:justify-between">
        <h2 className="text-2xl font-bold mb-4">Rejected Providers</h2>
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
                "Category",
                "Document",
                "Details",
                "Created_At",
                "Updated_At",
                "Status",
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
            currentBeneficiaries.map((Provider, index) => (
              <tr
                key={Provider._id}
                className="border-b border-gray-200 transition-transform duration-500 hover:border-2 hover:border-blue-500 hover:bg-gray-100"
              >
                <td className="py-1 px-3">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                <td className="py-1 px-3">{Provider.name}</td>
                <td className="py-1 px-3">{Provider.email}</td>
                <td className="py-1 px-3">{Provider.voucherCategory}</td>
                <td className="py-1 px-3">
                  {Provider.documents?.map((doc, docIndex) => (
                    <a
                      key={docIndex}
                      href={doc || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Document {docIndex + 1}
                    </a>
                  ))}
                </td>
                <td className="py-1 px-3">
                  {`ProviderName: ${Provider.voucherDetails.providerName}, City: ${Provider.voucherDetails.city}, Country: ${Provider.voucherDetails.country}`}
                </td>
                <td className="py-1 px-3">
                  {new Date(Provider.createdAt).toLocaleString("en-US", {
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
                <td className="py-1 px-3">
                  {new Date(Provider.updatedAt).toLocaleString("en-US", {
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
                <td className="py-1 px-3 text-red-700 text-lg font-semibold">{Provider.status}</td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredBeneficiaries.length / itemsPerPage) }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={`mx-1 px-3 py-1 rounded-xl ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
