"use client";
import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Loading from "../../../../components/ProviderDashboard/loading";
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
export default function ActiveServiceProvider() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showDateSort, setShowDateSort] = useState(false);
  const [sortOrder, setSortOrder] = useState("newToOld"); // "newToOld" or "oldToNew"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Set the number of items per page
  const router = useRouter();

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
        (Provider) => Provider.status === "new"
      );
      setBeneficiaries(approvedBeneficiaries || []);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      setError("Failed to fetch beneficiaries. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const token = Cookies.get("authToken");
    if (!token) {
      alert("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      const response = await fetch(`/api/admin/flipStatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          type: "Provider",
          status: newStatus,
          // Include voucherDetails if necessary for role validation
          voucherDetails: {
            /* Add specific details based on role here */
          },
        }),
      });

      if (response.ok) {
        alert(`Provider with ID ${id} has been ${newStatus}.`);
        fetchBeneficiaries(token);
      } else {
        const errorData = await response.json();
        console.error(`Error updating status to ${newStatus}:`, errorData);
        alert(
          `Failed to update status of Provider with ID ${id}: ${
            errorData.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error(`Status update to ${newStatus} failed:`, error);
      alert("An error occurred while updating the status.");
    }
  };

  const handleApprove = (id) => handleStatusUpdate(id, "approved");
  const handleReject = (id) => handleStatusUpdate(id, "rejected");

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

  const totalPages = Math.ceil(filteredBeneficiaries.length / itemsPerPage);
  const paginatedBeneficiaries = filteredBeneficiaries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        <h2 className="text-2xl font-bold mb-4 mt-2">New Provider</h2>
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
                "National ID",
                "Wallet ID",
                "Category",
                "Document",
                "Details",
                "Created_At",
                "Updated_At",
                "Status",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="py-3 px-4 text-left border-b-2 border-gray-300 text-black"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="text-gray-600 text-sm font-light">
            {paginatedBeneficiaries.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-4 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              paginatedBeneficiaries.map((Provider, index) => (
                <tr
                  key={Provider._id}
                  className="border-b border-gray-200 transition-transform duration-500 hover:border-2  hover:bg-gray-100"
                >
                  <td className="py-1 px-3">{index + 1}</td>{" "}
                  {/* Displaying incremental index */}
                  <td className="py-1 px-3">{Provider.name}</td>
                  <td className="py-1 px-3">{Provider.email}</td>
                  <td className="py-1 px-3">{Provider.cnic}</td>
                  <td className="py-1 px-3">{Provider.wallet_address}</td>
                  <td className="py-1 px-3">{Provider.voucherCategory}</td>
                  <td className="py-1 px-3">
                    {Provider.documents?.map((doc, docIndex) => (
                      <Link
                        key={docIndex}
                        href={doc || ""}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Document {docIndex + 1}
                      </Link>
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
                  <td
                    className={`py-1 px-3 text-blue-700 text-lg font-semibold`}
                  >
                    {Provider.status}
                  </td>
                  <td className="py-1 px-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleApprove(Provider._id)}
                        className="text-green-500 hover:scale-110"
                      >
                        <Check />
                      </button>
                      <button
                        onClick={() => handleReject(Provider._id)}
                        className="text-red-500 hover:scale-110"
                      >
                        <X />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-300 px-4 py-2 rounded-xl disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-4 py-2 rounded-xl disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
