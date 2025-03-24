"use client"
import React,{ useState } from 'react';
import { TicketCheck } from 'lucide-react';


// Mock data array with three vouchers
const mockVouchers = [
  {
    _id: '1',
    beneficiary_id: '101',
    amount: 1000,
    expiry_date: new Date('2024-12-31'),
    voucher_type: 'poor',
    status: 'Issued',
    issued_date: new Date('2024-10-10'),
    created_at: new Date('2024-10-05'),
    updated_at: new Date('2024-10-10'),
  },
  {
    _id: '2',
    beneficiary_id: '102',
    amount: 500,
    expiry_date: new Date('2024-11-15'),
    voucher_type: 'Health',
    status: 'Issued',
    issued_date: new Date('2024-09-25'),
    created_at: new Date('2024-09-20'),
    updated_at: new Date('2024-09-25'),
  },
  {
    _id: '3',
    beneficiary_id: '103',
    amount: 750,
    expiry_date: new Date('2024-12-20'),
    voucher_type: 'Education',
    status: 'Issued',
    issued_date: new Date('2024-10-12'),
    created_at: new Date('2024-10-01'),
    updated_at: new Date('2024-10-12'),
  },
];

const voucherTypes = ["Poor", "Religious" , "Education", "Health", "Orphan", "E-Commerce"]
export default function ActiveVouchers() {
  const [selectedType, setSelectedType] = useState('');

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  // Filter vouchers based on the selected type; show all if no type is selected
  const filteredVouchers = selectedType
    ? mockVouchers.filter((voucher) => voucher.voucher_type === selectedType)
    : mockVouchers;

  return (
    <div className="p-6">

    <div className='flex justify-between'>
      <h2 className="text-2xl font-bold mb-4">ACTIVE VOUCHERS</h2>

      {/* Dropdown to select voucher type */}
      <select 
        onChange={handleTypeChange} 
        className="mb-4 p-2 border rounded"
      >
        <option value="">Select a Voucher Type</option>
       {voucherTypes.map((type, index)=>(
        <option key={index} value={type}>{type}</option>
       ))}
        {/* Add other types as necessary */}
      </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
          <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
          <tr>
              {["Voucher ID", "Beneficiary ID", "Amount", "Voucher Type", "Status", "Issued Date","Issued Date", "Created At","Updated At"].map((header) => (
                <th key={header} className="py-3 px-6 text-left">{header}</th>
              ))}
            </tr>
            </thead>
           
          <tbody className="text-gray-600 text-sm font-light">
            {filteredVouchers.map((voucher) => (
              <tr key={voucher._id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">{voucher._id}</td>
                <td className="py-3 px-6 text-left">{voucher.beneficiary_id}</td>
                <td className="py-3 px-6 text-left">${voucher.amount}</td>
                <td className="py-3 px-6 text-left">{voucher.voucher_type}</td>
                <td className="py-3 px-6 text-left">{voucher.status}</td>
                <td className="py-3 px-6 text-left">{voucher.issued_date.toLocaleDateString()}</td>
                <td className="py-3 px-6 text-left">{voucher.expiry_date.toLocaleDateString()}</td>
                <td className="py-3 px-6 text-left">{voucher.created_at.toLocaleDateString()}</td>
                <td className="py-3 px-6 text-left">{voucher.updated_at.toLocaleDateString()}</td>
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
