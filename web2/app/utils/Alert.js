
// "use client";
// import { useEffect, useState } from "react";

// const Alert = ({ message, type, duration = 3000 }) => {
//   const [isVisible, setIsVisible] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(false);
//     }, duration);

//     return () => clearTimeout(timer); // Cleanup the timer on unmount
//   }, [duration]);

//   const alertStyles = {
//     success: "bg-green-100 border-green-500 text-green-700",
//     error: "bg-red-100 border-red-500 text-red-700",
//     info: "bg-blue-100 border-blue-500 text-blue-700",
//     warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
//   };

//   const alertIcons = {
//     success: (
//       <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//         <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm5 7l-6 6-3-3 1.41-1.41L10 10.17l5.59-5.59L15 7z" />
//       </svg>
//     ),
//     error: (
//       <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//         <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V4h2v7z" />
//       </svg>
//     ),
//     info: (
//       <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//         <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V4h2v7z" />
//       </svg>
//     ),
//     warning: (
//       <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//         <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V4h2v7z" />
//       </svg>
//     ),
//   };

//   if (!isVisible) return null; // Don't render the alert if it's not visible

//   return (
//     <div
//       className={`flex items-center p-4 mb-4 border-l-4 ${alertStyles[type]} rounded-2xl`}
//       role="alert"
//     >
//       {alertIcons[type]}
//       <span>{message}</span>
//     </div>
//   );
// };

// export default Alert;





import { useState, useEffect } from "react";
const Alert = ({ message, type, duration = 3000 }) => {
    const [isVisible, setIsVisible] = useState(true);
  
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
  
      return () => clearTimeout(timer); 
    }, [duration]);
  
    const alertStyles = {
      success: "bg-green-100 border-green-500 text-green-700",
      error: "bg-red-100 border-red-500 text-red-700",
      info: "bg-blue-100 border-blue-500 text-blue-700",
      warning: "bg-yellow-100 border-yellow-500 text-yellow-700",
    };
  
    const alertIcons = {
      success: (
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm5 7l-6 6-3-3 1.41-1.41L10 10.17l5.59-5.59L15 7z" />
        </svg>
      ),
      error: (
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V4h2v7z" />
        </svg>
      ),
      info: (
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V4h2v7z" />
        </svg>
      ),
      warning: (
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V4h2v7z" />
        </svg>
      ),
    };
  
    if (!isVisible) return null; 
  
    return (
      <div
        className={`fixed top-4 right-4 flex items-center p-4 mb-4 border-l-4 ${alertStyles[type]} rounded-2xl z-50`}
        role="alert"
      >
        {alertIcons[type]}
        <span>{message}</span>
      </div>
    );
  };
  
  export default Alert;