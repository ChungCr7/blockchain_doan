import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-yellow-400 mb-4">
          🪙 Chào mừng đến với NFT Marketplace
        </h1>
        <p className="text-lg text-gray-300 mb-6">
          Nền tảng tạo, mua và bán NFT với trải nghiệm dễ dàng, bảo mật và minh bạch.
        </p>

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

        <div className="mt-12 text-sm text-gray-500">
          <p>
            Kết nối ví MetaMask để bắt đầu trải nghiệm toàn diện với sàn giao dịch NFT của bạn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
