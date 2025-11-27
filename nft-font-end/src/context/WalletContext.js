// src/context/WalletContext.js
import React, { createContext, useEffect, useState } from "react";
import Web3 from "web3";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [web3, setWeb3] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const _web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        setWeb3(_web3);
      } catch (error) {
        console.error("❌ Kết nối ví thất bại:", error);
      }
    } else {
      alert("⚠️ Vui lòng cài đặt Trust Wallet hoặc ví hỗ trợ WalletConnect!");
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <WalletContext.Provider value={{ account, web3, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
