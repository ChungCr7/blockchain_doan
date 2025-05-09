import React, { useState } from "react";
import Web3 from "web3";

const isImage = (url) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
const isAudio = (url) => /\.(mp3|wav|ogg)$/i.test(url);

const NFTList = ({ listedNFTs, buyNFT }) => {
  const [selected, setSelected] = useState(null);

  const toggleDetail = (tokenId) => {
    setSelected(selected === tokenId ? null : tokenId);
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">🖼️ Danh sách NFT đang bán</h2>
      <div className="flex flex-wrap gap-4">
        {listedNFTs.map((item, index) => (
          <div
            key={index}
            onClick={() => toggleDetail(item.tokenId)}
            className={`bg-gray-800 text-white p-4 rounded-xl w-60 cursor-pointer transition shadow ${
              selected === item.tokenId ? "ring-2 ring-purple-400" : ""
            }`}
          >
            {item.image ? (
              isImage(item.image) ? (
                <img
                  src={item.image}
                  alt={`NFT ${item.tokenId}`}
                  className="w-full h-36 object-cover rounded mb-2"
                />
              ) : isAudio(item.image) ? (
                <audio controls className="w-full mb-2">
                  <source src={item.image} />
                  Trình duyệt không hỗ trợ âm thanh
                </audio>
              ) : (
                <div className="w-full h-36 bg-gray-700 flex items-center justify-center text-sm text-gray-400 rounded mb-2">
                  📁 Tệp không hỗ trợ xem trước
                </div>
              )
            ) : (
              <div className="w-full h-36 bg-gray-700 rounded mb-2" />
            )}

            <p><b>🌸 Tên:</b> {item.name || "Không rõ"}</p>

            {selected === item.tokenId && (
              <div className="mt-2 space-y-1 text-sm">
                <p><b>💰 Giá:</b> {Web3.utils.fromWei(item.price, "ether")} ETH</p>
                <p><b>📄 Mô tả:</b> {item.description || "Không có mô tả"}</p>
                <p><b>👤 Người bán:</b> {item.seller?.slice(0, 6)}...</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    buyNFT(item.tokenId, item.price);
                  }}
                  className="mt-2 bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500"
                >
                  🛒 Mua NFT
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default NFTList;
