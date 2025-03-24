import React from "react";

const BeneficiaryModal = ({ isOpen, onClose, data, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl w-full h-auto">
        <h2 className="text-2xl font-bold text-center mb-6">
          Distributed Vouchers
        </h2>
        <div className="overflow-y-auto max-h-80">
          {loading ? (
            <p className="text-center">Loading data, please wait...</p>
          ) : data ? (
            <div>
              <br />
              <h2 className="font-semibold" style={{ marginBottom: "10px" }}>
                <strong>Beneficiary Info</strong>
              </h2>
              <div className="border p-4 rounded-lg shadow-sm">
                <p>
                  <strong>Voucher ID:</strong> {data.voucherId}
                </p>
                <p>
                  <strong>Name:</strong> {data.name}
                </p>
                <p>
                  <strong>Email:</strong> {data.email}
                </p>
                <p>
                  <strong>Category:</strong> {data.voucherCategory}
                </p>
                <p>
                  <strong>Amount:</strong> {data.amount}
                </p>
                <p>
                  <strong>City:</strong> {data.city}
                </p>
                <p>
                  <strong>Country:</strong> {data.country}
                </p>
              </div>

              <h2
                className="font-semibold mt-4"
                style={{ marginBottom: "10px", marginTop: "30px" }}
              >
                <strong>Vouchers</strong>
              </h2>
              <ul className="space-y-4">
                {data.vouchers && data.vouchers.length > 0 ? (
                  data.vouchers.map((item) => (
                    <li
                      key={item._id}
                      className="border p-4 rounded-lg shadow-sm"
                    >
                      <p>
                        <strong>Voucher ID:</strong> {item.voucherId}
                      </p>
                      <p>
                        <strong>Issuer:</strong> {item.voucherIssuer}
                      </p>
                      <p>
                        <strong>Type:</strong> {item.voucherType}
                      </p>
                      <p>
                        <strong>Wallet Address:</strong> {item.walletAddress}
                      </p>
                      <p>
                        <strong>Token ID:</strong> {item.tokenId}
                      </p>
                      <p>
                        <strong>Amount:</strong> {item.amount}
                      </p>
                      <p>
                        <strong>Status:</strong> {item.status}
                      </p>
                      <a
                        href={item.metaDataUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View Metadata
                      </a>
                    </li>
                  ))
                ) : (
                  <p>No vouchers available.</p>
                )}
              </ul>
            </div>
          ) : (
            <p className="text-center">No data available.</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-6 bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BeneficiaryModal;
