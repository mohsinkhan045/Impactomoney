import React from 'react';

// Mock data array with three redeemed vouchers
const mockRedeemedVouchers = [
  {
    _id: '1',
    voucher_id: 'v001',
    service_provider_id: 'sp101',
    beneficiary_id: 'b101',
    redeemed_amount: 1000,
    redeemed_date: new Date('2024-09-15'),
  },
  {
    _id: '2',
    voucher_id: 'v002',
    service_provider_id: 'sp102',
    beneficiary_id: 'b102',
    redeemed_amount: 500,
    redeemed_date: new Date('2024-10-01'),
  },
  {
    _id: '3',
    voucher_id: 'v003',
    service_provider_id: 'sp103',
    beneficiary_id: 'b103',
    redeemed_amount: 750,
    redeemed_date: new Date('2024-09-30'),
  },
];

export default function RedeemedVouchers() {
  return (
    <div className="p-6">
{/* <<<<<<< HEAD */}
      <h2 className="text-2xl font-bold mb-4">Redeemed Vouchers</h2>

      {/* Wrapper around the table */}
      <div className="overflow-y-auto">
        <table className="table-auto w-full border-collapse bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <tr>
              {["Redeemed Voucher ID", "Voucher ID", "Service Provider ID", "Beneficiary ID", "Redeemed Amount" , "Redeemed Date"].map((header)=>(
                <th key={header} className="py-3 px-6 text-left">{header}</th>
              ))}
              </tr>
             
          </thead>
          {/* <tr>
              {["Index", "User ID", "Category", "Details", "Created At", "Updated At"].map((header) => (
                <th key={header} className="py-3 px-6 text-left">{header}</th>
              ))}
            </tr>  */}

          {/* Add a scrollable wrapper only around the tbody */}
          <tbody className="text-gray-600 text-sm font-light">
            {mockRedeemedVouchers.map((voucher) => (
              <tr key={voucher._id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 ">{voucher._id}</td>
                <td className="py-3 px-6 ">{voucher.voucher_id}</td>
                <td className="py-3 px-6 ">{voucher.service_provider_id}</td>
                <td className="py-3 px-6 ">{voucher.beneficiary_id}</td>
                <td className="py-3 px-6 ">${voucher.redeemed_amount}</td>
                <td className="py-3 px-6 ">{voucher.redeemed_date.toLocaleDateString()}</td>
{/* =======
      <h2 className="text-2xl font-bold mb-4">REDEEMED VOUCHERS</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Redeemed Voucher ID</th>
              <th className="py-3 px-6 text-left">Voucher ID</th>
              <th className="py-3 px-6 text-left">Service Provider ID</th>
              <th className="py-3 px-6 text-left">Beneficiary ID</th>
              <th className="py-3 px-6 text-left">Redeemed Amount</th>
              <th className="py-3 px-6 text-left">Redeemed Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {mockRedeemedVouchers.map((redeemedVoucher) => (
              <tr key={redeemedVoucher._id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">{redeemedVoucher._id}</td>
                <td className="py-3 px-6 text-left">{redeemedVoucher.voucher_id}</td>
                <td className="py-3 px-6 text-left">{redeemedVoucher.service_provider_id}</td>
                <td className="py-3 px-6 text-left">{redeemedVoucher.beneficiary_id}</td>
                <td className="py-3 px-6 text-left">${redeemedVoucher.redeemed_amount}</td>
                <td className="py-3 px-6 text-left">{redeemedVoucher.redeemed_date.toLocaleDateString()}</td>
>>>>>>> 064dbd0d1e8dd77870a47fbc27f0161f6eb5859a */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}