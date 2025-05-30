import React from "react";

const Section = ({ title, items }) => (
  <div className="bg-gray-800 p-4 rounded-xl shadow">
    <h2 className="font-semibold mb-2 text-white">{title}</h2>
    <ul className="space-y-1 text-sm text-gray-300">
      {items.map((item, idx) => (
        <li key={idx}>
          {item.symbol} — {item.price}
          {item.change && (
            <span
              className={`ml-1 ${
                item.change.startsWith("-") ? "text-red-500" : "text-green-400"
              }`}
            >
              ({item.change})
            </span>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const MarketTable = ({ tokens }) => (
  <div className="mt-10 bg-gray-800 p-4 rounded-xl shadow">
    <h2 className="text-xl font-semibold text-white mb-4">
      🏆 Top token theo vốn hóa thị trường
    </h2>
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="border-b border-gray-600 text-gray-400 uppercase text-xs">
          <tr>
            <th className="px-4 py-2">Tên</th>
            <th className="px-4 py-2">Giá</th>
            <th className="px-4 py-2">24h Thay đổi</th>
            <th className="px-4 py-2">KL 24h</th>
            <th className="px-4 py-2">Vốn hóa</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-700 hover:bg-gray-700/40"
            >
              <td className="px-4 py-2 font-medium text-white">
                {token.name} <span className="text-gray-400">({token.fullName})</span>
              </td>
              <td className="px-4 py-2">{token.price}</td>
              <td className={`px-4 py-2 ${token.change.startsWith("-") ? "text-red-500" : "text-green-400"}`}>
                {token.change}
              </td>
              <td className="px-4 py-2">{token.volume}</td>
              <td className="px-4 py-2">{token.marketCap}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MarketPage = () => {
  const featuredCoins = [
    { symbol: "BNB", price: "$675.55", change: "-1.98%" },
    { symbol: "BTC", price: "$106.00K", change: "-1.71%" },
    { symbol: "ETH", price: "$2.63K", change: "-2.79%" },
  ];

  const newListings = [
    { symbol: "SOPH", price: "$0.05561", change: "-13.38%" },
    { symbol: "HUMA", price: "$0.05171", change: "-0.19%" },
    { symbol: "USD1", price: "$1.00", change: "-0.02%" },
  ];

  const topGainers = [
    { symbol: "WCT", price: "$1.21", change: "+32.78%" },
    { symbol: "TRB", price: "$62.16", change: "+29.50%" },
    { symbol: "CATI", price: "$0.143", change: "+17.21%" },
  ];

  const topVolume = [
    { symbol: "BTC", price: "$106.00K" },
    { symbol: "ETH", price: "$2.63K" },
    { symbol: "SOL", price: "$166.92" },
  ];

  const topTokens = [
    {
      name: "BTC",
      fullName: "Bitcoin",
      price: "$106,000.00",
      change: "-1.71%",
      volume: "$55.31B",
      marketCap: "$2.10T",
    },
    {
      name: "ETH",
      fullName: "Ethereum",
      price: "$2,633.00",
      change: "-2.79%",
      volume: "$27.30B",
      marketCap: "$318.87B",
    },
    {
      name: "USDT",
      fullName: "TetherUS",
      price: "$1.00",
      change: "-0.03%",
      volume: "$131.14B",
      marketCap: "$152.99B",
    },
    {
      name: "BNB",
      fullName: "BNB",
      price: "$675.66",
      change: "-1.98%",
      volume: "$1.94B",
      marketCap: "$95.53B",
    },
    {
      name: "SOL",
      fullName: "Solana",
      price: "$166.99",
      change: "-3.17%",
      volume: "$3.45B",
      marketCap: "$87.13B",
    },
    {
      name: "XRP",
      fullName: "XRP",
      price: "$2.24",
      change: "-1.94%",
      volume: "$2.47B",
      marketCap: "$131.58B",
    },
  ];

  return (
    <div className="space-y-6 px-4 py-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold">📊 Tổng quan thị trường</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Section title="Coin nổi bật" items={featuredCoins} />
        <Section title="Niêm yết mới" items={newListings} />
        <Section title="Top coin tăng giá" items={topGainers} />
        <Section title="Giao dịch nhiều nhất" items={topVolume} />
      </div>

      <MarketTable tokens={topTokens} />
    </div>
  );
};

export default MarketPage;
