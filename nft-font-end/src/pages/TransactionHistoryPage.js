import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { ipfsToHttp } from "../utils/media";

const TransactionHistoryPage = ({ contract }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!contract || !window.ethereum) return;

      try {
        const web3 = new Web3(window.ethereum);
        const events = await contract.getPastEvents("NFTSale", {
          fromBlock: 0,
          toBlock: "latest",
        });

        const mapped = await Promise.all(
          events.map(async (event) => {
            const { tokenId, buyer, price } = event.returnValues;

            const tokenURI = await contract.methods.tokenURI(tokenId).call();
            const listing = await contract.methods.listings(tokenId).call();
            const res = await fetch(ipfsToHttp(tokenURI));
            const meta = await res.json();
            const block = await web3.eth.getBlock(event.blockNumber);
            const time = new Date(block.timestamp * 1000).toLocaleString();

            return {
              tokenId,
              name: meta.name,
              media: ipfsToHttp(meta.mediaURI),
              type: meta.type || "image",
              description: meta.description,
              price: Web3.utils.fromWei(price.toString(), "ether") + " ETH",
              buyer,
              seller: listing.seller,
              time,
            };
          })
        );

        setTransactions(mapped.reverse());
      } catch (err) {
        console.error("❌ Lỗi lấy lịch sử giao dịch:", err);
      }
    };

    fetchHistory();
  }, [contract]);

  return (
    <div className="text-white max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6 text-center">📜 Lịch sử giao dịch NFT</h2>

      {transactions.length === 0 ? (
        <p className="text-center text-gray-400">Chưa có giao dịch nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-700 text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="py-2 px-3 border border-gray-700">🕒 Thời gian</th>
                <th className="py-2 px-3 border border-gray-700">🖼️ Hình</th>
                <th className="py-2 px-3 border border-gray-700">🆔 Token</th>
                <th className="py-2 px-3 border border-gray-700">🌸 Tên</th>
                <th className="py-2 px-3 border border-gray-700">💰 Giá</th>
                <th className="py-2 px-3 border border-gray-700">👤 Người bán</th>
                <th className="py-2 px-3 border border-gray-700">🛒 Người mua</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={index} className="bg-gray-900 hover:bg-gray-800 transition">
                  <td className="py-2 px-3 border border-gray-700 text-gray-400">{tx.time}</td>
                  <td className="py-2 px-3 border border-gray-700">
                    {tx.type === "image" && (
                      <img src={tx.media} alt={tx.name} className="w-16 h-16 object-cover rounded" />
                    )}
                    {tx.type === "video" && (
                      <video src={tx.media} className="w-16 h-16 object-cover rounded" />
                    )}
                  </td>
                  <td className="py-2 px-3 border border-gray-700 text-center">{tx.tokenId}</td>
                  <td className="py-2 px-3 border border-gray-700">{tx.name}</td>
                  <td className="py-2 px-3 border border-gray-700">{tx.price}</td>
                  <td className="py-2 px-3 border border-gray-700 break-all">{tx.seller}</td>
                  <td className="py-2 px-3 border border-gray-700 break-all">{tx.buyer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
