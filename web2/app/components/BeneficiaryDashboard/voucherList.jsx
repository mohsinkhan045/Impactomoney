"use client"
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import VoucherTable from "./nftVouchers";
import Loading from "../ProviderDashboard/loading"
function VoucherList() {
     const [userData, setUserData] = useState(null);
     const [loading, setLoading] = useState(true);
       const [error, setError] = useState(null);
     
      // Fetch user data and providers from API
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
    
            // Fetch beneficiary details
            const beneficiaryResponse = await fetch("/api/beneficiary", {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            });
            const beneficiaryData = await beneficiaryResponse.json();
            console.log(beneficiaryData);
            setUserData(beneficiaryData);
    
          } catch (err) {
            setError("Error loading data. Please try again later.");
            console.error(err);
          } finally {
            setLoading(false);
          }
        };
    
        fetchData();
    
      }, []);

      if (loading) {
        return <div><Loading /></div>;
      }
    
      if (error) {
        return <div className="text-red-500">{error}</div>;
      }
    
      // If userData is still null, render a loading message or return null
      if (!userData) {
        return <p><Loading /></p>;
      }
    
  return (
    <div>
         {/* Voucher Section */}
  <VoucherTable 
  wallet_address={userData?.data?.wallet_address} 
  id={userData?.data?._id}
  name={userData?.data?.name}
  email={userData?.data?.email}
  voucherCategory= {userData?.data?.voucherCategory}
/>
    </div>
  )
}

export default VoucherList