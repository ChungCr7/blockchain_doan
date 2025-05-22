import React from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import { ipfsToHttp } from "../utils/ipfs";

const isImage = (url) =>
  /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes("Qm");
const isAudio = (url) =>
  /\.(mp3|wav|ogg)$/i.test(url) || url.includes("audio");

const ProductPage = ({ listedNFTs, buyNFT }) => {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">🛍️ Danh sách NFT đang bán</h2>

      {listedNFTs.length === 0 ? (
        <p className="text-gray-400">😔 Chưa có NFT nào được niêm yết.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {listedNFTs.map((item, index) => (
            <div
              key={index}
              className="bg-gray-800 text-white p-4 rounded-xl w-60 shadow"
            >
              {item.image ? (
                isImage(item.image) ? (
                  <img
                    src={ipfsToHttp(item.image)}
                    alt={`NFT ${item.tokenId}`}
                    className="w-full h-36 object-cover rounded mb-2"
                  />
                ) : isAudio(item.image) ? (
                  <audio
                    controls
                    className="w-full mb-2"
                    src={ipfsToHttp(item.image)}
                  >
                    Trình duyệt không hỗ trợ audio
                  </audio>
                ) : (
                  <div className="w-full h-36 bg-gray-700 rounded flex items-center justify-center text-sm text-gray-400 mb-2">
                    📁 Tệp không hỗ trợ xem trước
                  </div>
                )
              ) : (
                <div className="w-full h-36 bg-gray-700 rounded mb-2" />
              )}

              <p><b>🌸 Tên:</b> {item.name || "Không rõ"}</p>
              <p><b>💰 Giá:</b> {Web3.utils.fromWei(item.price, "ether")} ETH</p>
              <p><b>👤 Bán bởi:</b> {item.seller?.slice(0, 6)}...{item.seller?.slice(-4)}</p>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => buyNFT(item.tokenId, item.price)}
                  className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500 text-sm"
                >
                  🛒 Mua NFT
                </button>
                <button
                  onClick={() => navigate(`/products/${item.tokenId}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                >
                  🔍 Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPage;
