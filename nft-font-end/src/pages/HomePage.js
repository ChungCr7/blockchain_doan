import React, { useContext } from "react";
import { WalletContext } from "../context/WalletContext";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { account, connectWallet } = useContext(WalletContext);

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-yellow-400 mb-4">
          🪙 Chào mừng đến với NFT Marketplace
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          Nền tảng tạo, mua và bán NFT với trải nghiệm dễ dàng, bảo mật và minh bạch.
        </p>

        {account ? (
          <p className="text-green-400 mb-4">✅ Đã kết nối ví: {account}</p>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 mb-4"
          >
            🔗 Kết nối ví MetaMask
          </button>
        )}

        <div className="flex justify-center gap-6 mt-8">
          <Link
            to="/create"
            className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500"
          >
            🚀 Tạo NFT
          </Link>
          <Link
            to="/market"
            className="border border-yellow-400 text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 hover:text-black"
          >
            🔍 Khám phá thị trường
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
