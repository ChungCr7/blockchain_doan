import React, { useEffect, useState } from "react";
import { ipfsToHttp } from "../utils/media";
import Web3 from "web3";

const TransactionHistoryPage = ({ contract }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!contract) return;

      try {
        const web3 = new Web3(window.ethereum);
        const events = await contract.getPastEvents("NFTSale", {
          fromBlock: 0,
          toBlock: "latest",
        });

        const mapped = await Promise.all(
          events.map(async (event) => {
            const { tokenId, buyer, price } = event.returnValues;

            const listing = await contract.methods.listings(tokenId).call();
            const uri = await contract.methods.tokenURI(tokenId).call();
            const res = await fetch(ipfsToHttp(uri));
            const meta = await res.json();

            const block = await web3.eth.getBlock(event.blockNumber);
            const time = new Date(block.timestamp * 1000).toLocaleString();

            return {
              tokenId,
              name: meta.name,
              description: meta.description,
              media: ipfsToHttp(meta.mediaURI),
              type: meta.type || "image",
              price: Web3.utils.fromWei(price, "ether") + " ETH",
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
    <div className="text-white max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">📜 Lịch sử giao dịch NFT</h2>

      {transactions.length === 0 ? (
        <p className="text-center text-gray-400">Chưa có giao dịch nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transactions.map((tx) => (
            <div key={tx.tokenId} className="bg-gray-800 p-4 rounded-xl shadow">
              {tx.type === "image" && (
                <img src={tx.media} alt={tx.name} className="w-full h-40 object-cover rounded mb-2" />
              )}
              {tx.type === "audio" && (
                <audio controls className="w-full mb-2">
                  <source src={tx.media} type="audio/mpeg" />
                </audio>
              )}
              {tx.type === "video" && (
                <video controls className="w-full h-40 object-cover rounded mb-2">
                  <source src={tx.media} type="video/mp4" />
                </video>
              )}

              <p className="font-bold text-lg mb-1">{tx.name}</p>
              <p className="text-sm text-gray-300">{tx.description}</p>
              <p className="text-sm mt-2">💰 <b>Giá:</b> {tx.price}</p>
              <p className="text-sm">👤 <b>Người bán:</b> {tx.seller}</p>
              <p className="text-sm">🛒 <b>Người mua:</b> {tx.buyer}</p>
              <p className="text-sm text-gray-400">🕒 {tx.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
