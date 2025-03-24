/*
---------------------------------------------------
Project:        FundingProject
Date:           Nov 28, 2024
Author:         Naimal
---------------------------------------------------

Description:
This file handles Registration components display.
---------------------------------------------------
*/
"use client";
import React, { useState } from "react";
import BasicDetails from "./basicDetails";
import RoleBasedDetails from "./roleBasedDetails";

 
const HandleComponentChange = () => {
  const [step, setStep] = useState(1); // Track the current step
  const [formData, setFormData] = useState({});
  const updateFormData = (newData) => {
    setFormData({ ...formData, ...newData });
    console.log("Updated Form Data:", { ...formData, ...newData }); // Debugging
  };
  
  // Handle navigation between steps
  // Increment step
  const nextStep = () => {
    console.log("Moving to the next step"); // Debug
  setStep((prevStep) => {
    console.log("Previous Step:", prevStep); // Debug
    const newStep = prevStep + 1;
    console.log("New Step:", newStep); // Debug
    console.log("Current form data",formData)
    return newStep;
  })};

  // Decrement step
  const prevStep = () => {
    console.log("Going back to the previous step"); // Debug
    setStep((prevStep) => prevStep - 1);
    console.log("Current form data from role component",formData)
    
  };
  
  return (
    <div className="w-full  bg-white">
      {step === 1 && (
        <BasicDetails
          nextStep={nextStep}
          updateFormData={updateFormData}
          />
      )}
      {step === 2 && (
        <RoleBasedDetails
        prevStep={prevStep}
        formData={formData}
        updateFormData={updateFormData}
        />
      )}
      {/* {step === 1 && <div>current step {step}
        Basic Details Component</div>}
      {step === 2 && <div>
        current step {step}
        Role Based Details Component</div>}
      <button onClick={nextStep}>Next</button>
    <button onClick={prevStep}>Previous</button> */}
    </div>
  );
};

export default HandleComponentChange;
