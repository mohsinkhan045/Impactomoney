"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

const Temp = () => {
  const [vouchers, setVouchers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const authToken = Cookies.get("authToken");
        const response = await fetch("/api/admin/temp", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch vouchers");
        }

        setVouchers(data.data || []);
        calculateUserStats(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const calculateUserStats = (vouchers) => {
    const stats = {};

    vouchers.forEach((voucher) => {
      const wallet = voucher.wallet_address;
      if (!stats[wallet]) {
        stats[wallet] = { mintedCount: 0, transferredCount: 0, priority: "" };
      }

      if (voucher.isMinted) {
        stats[wallet].mintedCount += 1;
      }

      if (voucher.isTransfered) {
        stats[wallet].transferredCount += 1;
      }

      // Calculate total count (minted + transferred)
      const totalCount = stats[wallet].mintedCount + stats[wallet].transferredCount;

      // Assign priority based on count
      if (totalCount >= 0 && totalCount <= 2) {
        stats[wallet].priority = "🟢 High";
      } else if (totalCount > 2 && totalCount <= 5) {
        stats[wallet].priority = "🟠 Medium";
      } else {
        stats[wallet].priority = "🔴 Low";
      }
    });

    setUserStats(stats);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">Vouchers</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <ul className="mt-4 bg-white shadow-md rounded-lg p-4">
          {Object.keys(userStats).length > 0 ? (
            Object.entries(userStats).map(([wallet, stats]) => (
              <li key={wallet} className="border-b py-2">
                <p><strong>Wallet:</strong> {wallet}</p>
                <p><strong>Minted Count:</strong> {stats.mintedCount}</p>
                <p><strong>Transferred Count:</strong> {stats.transferredCount}</p>
                <p><strong>Priority:</strong> {stats.priority}</p>
              </li>
            ))
          ) : (
            <p>No eligible vouchers found.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Temp;
