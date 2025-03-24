"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

const { ethereum } = typeof window !== "undefined" ? window : {};

const WalletContext = createContext({
  account: undefined,
  error: undefined,
  connect: () => {},
  disconnect: () => {},
});

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  const isEthereumExists = () => {
    if (!ethereum) {
      return false;
    }
    return true;
  };

  const checkWalletConnect = async () => {
    if (isEthereumExists()) {
      try {
        const accounts = await ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null); // No account connected
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const connect = async () => {
    setError("");
    if (isEthereumExists()) {
      try {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (err) {
        setError(err.message);
      }
    } else {
      setError("Please Install MetaMask.");
    }
  };

  const disconnect = () => {
    setAccount(null);
    setError(null); // Optionally clear any errors upon disconnect
  };

  useEffect(() => {
    checkWalletConnect();

    // Listen for account change (in case the user changes account in MetaMask)
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    };

    // Listen for network change
    const handleNetworkChanged = (networkId) => {
      console.log("Network changed to:", networkId);
      // Handle network change logic here if needed
    };

    // Adding event listeners
    if (ethereum) {
      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleNetworkChanged);
    }

    // Cleanup listeners on component unmount
    return () => {
      if (ethereum) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleNetworkChanged);
      }
    };
  }, []);

  return (
    <WalletContext.Provider value={{ account, connect, disconnect, error }}>
      {children}
    </WalletContext.Provider>
  );
};

const useWallet = () => useContext(WalletContext);

export default useWallet;
