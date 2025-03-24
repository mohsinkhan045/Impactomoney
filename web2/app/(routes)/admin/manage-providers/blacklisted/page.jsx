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
import React, { useState } from 'react';

// Mock data array with service provider details
const mockProviders = [
  {
    _id: '1',
    user_id: '201',
    category: 'Healthcare',
    email: 'healthcare@example.com',
    hospital_name: 'General Hospital',
    application_status: 'Approved',
    created_at: new Date('2024-05-20'),
    updated_at: new Date('2024-09-10'),
  },
  {
    _id: '2',
    user_id: '202',
    category: 'Education',
    email: 'education@example.com',
    university_name: 'Oxford University',
    application_status: 'Approved',
    created_at: new Date('2024-06-15'),
    updated_at: new Date('2024-07-05'),
  },
  {
    _id: '3',
    user_id: '203',
    category: 'Food',
    email: 'food@example.com',
    application_status: 'Approved',
    created_at: new Date('2024-03-18'),
    updated_at: new Date('2024-04-02'),
  },
  {
    _id: '4',
    user_id: '204',
    category: 'Refugees',
    email: 'refugees@example.com',
    application_status: 'Approved',
    created_at: new Date('2024-07-10'),
    updated_at: new Date('2024-08-05'),
  },
  {
    _id: '5',
    user_id: '205',
    category: 'Poor',
    email: 'humanitarian@example.com',
    application_status: 'Approved',
    created_at: new Date('2024-08-20'),
    updated_at: new Date('2024-09-01'),
  },
];
const voucherTypes = ["Poor", "Religious" , "Education", "Health", "Orphan", "E-Commerce"]


export default function BlackListedServiceProvider() {
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // Filter providers based on the selected category; show all if no category is selected
  const filteredProviders = selectedCategory
    ? mockProviders.filter((provider) => provider.category === selectedCategory)
    : mockProviders;

  return (
    <div className="p-0 md:p-6">
      <div className='flex flex-col md:flex-row md:justify-between'>
      <h2 className="text-2xl font-bold mb-4">Blacklisted Providers</h2>
      
      {/* Dropdown to select category */}
      <select 
        onChange={handleCategoryChange} 
        className="mb-4 p-3 border rounded-xl"
      >
        <option value="">Select a Category</option>
        {voucherTypes.map((type, index)=>(
        <option key={index} value={type}>{type}</option>
       ))}
      </select>
      </div>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="table-auto w-full border-collapse shadow-lg bg-white rounded-xl overflow-hidden">
          <thead className="bg-gray-200 ">
            <tr>
              {["ID", "User ID", "Category", "Email","Details", "Created At", "Updated At","Status"].map((header) => (
                <th key={header} className="py-4 px-4 text-left border-b-2 border-gray-300 text-black">{header}</th>
              ))}

            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
          {filteredProviders?.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-4 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
            filteredProviders.map((provider) => (
              <tr key={provider._id} className="border-b border-gray-200 hover:bg-gray-100">

                <td className="py-3 px-6 text-left">{provider._id}</td>
                <td className="py-3 px-6 text-left">{provider.user_id}</td>
                <td className="py-3 px-6 text-left">{provider.category}</td>
                <td className="py-3 px-6 text-left">{provider.email}</td>
                <td className="py-3 px-6 text-left">
                { `ProviderName: ${provider.voucherDetails?.providerName}, City: ${provider.voucherDetails?.city}, Country: ${provider.voucherDetails?.country}`
                  }
                </td>
                <td className="py-3 px-6 text-left">{provider.created_at.toLocaleDateString()}</td>
                <td className="py-3 px-6 text-left">{provider.updated_at.toLocaleDateString()}</td>
                <td className="py-3 px-6 text-left">{"blacklisted"}</td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
