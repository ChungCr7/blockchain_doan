import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { ipfsToHttp } from "../utils/ipfs";

const CollectionPage = ({ account, contract, listNFT }) => {
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const fetchOwnedNFTs = async () => {
      if (!contract || !account) return;

      try {
        const total = await contract.methods.totalSupply().call();
        const temp = [];

        for (let i = 1; i <= total; i++) {
          const owner = await contract.methods.ownerOf(i).call();
          if (owner.toLowerCase() === account.toLowerCase()) {
            const uri = await contract.methods.tokenURI(i).call();
            const url = ipfsToHttp(uri);
            const res = await fetch(url);
            const meta = await res.json();
            const listing = await contract.methods.listings(i).call();

            temp.push({
              tokenId: i,
              name: meta.name,
              description: meta.description,
              media: ipfsToHttp(meta.mediaURI),
              type: meta.type,
              isListed: listing.isListed,
              price: listing.price,
            });
          }
        }

        setOwnedNFTs(temp);
      } catch (err) {
        console.error("❌ Không thể tải danh sách NFT:", err);
      }
    };

    fetchOwnedNFTs();
  }, [contract, account]);

  const handlePriceChange = (e, tokenId) => {
    setPrices((prev) => ({ ...prev, [tokenId]: e.target.value }));
  };

  const handleList = async (tokenId) => {
    const price = prices[tokenId];
    if (!price || parseFloat(price) <= 0) {
      return alert("⚠️ Vui lòng nhập giá hợp lệ.");
    }

    try {
      await listNFT(tokenId, price);
      alert(`✅ NFT #${tokenId} đã được đăng bán lại.`);
    } catch (err) {
      console.error("❌ Lỗi khi đăng bán lại:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">🎨 Bộ sưu tập của bạn</h2>

      {ownedNFTs.length === 0 ? (
        <p className="text-center text-gray-400">Bạn chưa sở hữu NFT nào.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {ownedNFTs.map((item) => (
            <div key={item.tokenId} className="bg-gray-800 rounded-xl p-4 shadow">
              {item.type === "image" && (
                <img src={item.media} alt={item.name} className="w-full h-40 object-cover rounded mb-2" />
              )}
              {item.type === "audio" && <audio src={item.media} controls className="w-full mb-2" />}
              {item.type === "video" && <video src={item.media} controls className="w-full h-40 rounded mb-2" />}
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-300 mb-2">{item.description}</p>

              {!item.isListed ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Giá ETH"
                    value={prices[item.tokenId] || ""}
                    onChange={(e) => handlePriceChange(e, item.tokenId)}
                    className="w-24 px-2 py-1 rounded bg-gray-900 border text-white"
                  />
                  <button
                    onClick={() => handleList(item.tokenId)}
                    className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500 text-sm"
                  >
                    Đăng bán lại
                  </button>
                </div>
              ) : (
                <p className="text-green-400 text-sm mt-2">
                  ✅ Đã niêm yết: {Web3.utils.fromWei(item.price, "ether")} ETH
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionPage;
