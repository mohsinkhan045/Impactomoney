/*
---------------------------------------------------
Project:        FundingProject
Date:             Oct 21, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file handles the Donation form (Contributor panel).
---------------------------------------------------
*/
"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion'; // For smooth animations

// Donation Form Component
const DonationForm = () => {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [beneficiary, setBeneficiary] = useState('Select the option to distribute Ether');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = (e) => {
    e.preventDefault();

    // Set loading state to true when the form is being submitted
    setLoading(true);
    setSubmitted(true);

    // Simulating form submission delay
    setTimeout(() => {
      alert('Donation form submitted successfully!');
      // Reset the form
      setName('');
      setOrganization('');
      setBeneficiary('Healthcare');
      setDescription('');
      setAmount('');
      setSubmitted(false);
      setLoading(false); // Turn off loading after form submission
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gray-200">
      {/* Donation Form */}
      <motion.div
        className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 1.2, delay: 0.5 }}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-center text-blue-600 mb-4 sm:mb-6">Make a Donation</h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Name Input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <label className="block text-sm font-medium text-gray-700">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </motion.div>

          {/* Organization Input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <label className="block text-sm font-medium text-gray-700">Your Organization</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your organization name"
            />
          </motion.div>

          {/* Beneficiary Dropdown */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <label className="block text-sm font-medium text-gray-700">Select Beneficiary</label>
            <select
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Select the option to distribute Ether</option>
              <option value="Healthcare">Healthcare</option>
              <option value="University">University</option>
              <option value="Food">Food</option>
            </select>
          </motion.div>

          {/* Amount Input (in ETH) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <label className="block text-sm font-medium text-gray-700">Donation Amount (ETH)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter donation amount in ETH"
            />
          </motion.div>

          {/* Description Input */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a message or description for your donation"
              rows={4}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={submitted || loading}
            className={`w-full px-3 sm:px-4 py-2 text-white font-semibold rounded-lg focus:outline-none ${
              submitted || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } transition-all duration-300 ease-in-out`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            {loading ? 'Submitting...' : 'Submit Donation'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default DonationForm;

