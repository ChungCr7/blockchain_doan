import React from "react";

const MarketPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📊 Tổng quan thị trường</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Coin nổi bật</h2>
          <ul className="space-y-1 text-sm">
            <li>🟡 BNB — $626.45 (+2.56%)</li>
            <li>🟠 BTC — $102.38K (+3.41%)</li>
            <li>🔵 ETH — $2.21K (+17.25%)</li>
          </ul>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Niêm yết mới</h2>
          <ul className="space-y-1 text-sm">
            <li>🟣 SXT — $0.1446 (+141%)</li>
            <li>🔴 KMNO — $0.0667 (-2.56%)</li>
            <li>🟠 SYRUP — $0.2231 (-0.53%)</li>
          </ul>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Top coin tăng giá</h2>
          <ul className="space-y-1 text-sm">
            <li>🟣 SXT — +141%</li>
            <li>🍯 PNUT — +51%</li>
            <li>🧠 NEIRO — +47%</li>
          </ul>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Giao dịch nhiều nhất</h2>
          <ul className="space-y-1 text-sm">
            <li>BTC — $102K</li>
            <li>ETH — $2.21K</li>
            <li>SOL — $161.89</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
