import React from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import { ipfsToHttp } from "../utils/ipfs";

const ProductPage = ({ listedNFTs, buyNFT, account }) => {
  const navigate = useNavigate();

  const renderMedia = (type, mediaUrl, tokenId) => {
    const src = ipfsToHttp(mediaUrl || "");

    if (!mediaUrl) {
      return (
        <div className="w-full h-36 bg-gray-700 rounded flex items-center justify-center text-sm text-gray-400 mb-2">
          ❌ Không có media
        </div>
      );
    }

    switch (type) {
      case "image":
        return (
          <img
            src={src}
            alt={`NFT ${tokenId}`}
            className="w-full h-36 object-cover rounded mb-2"
          />
        );
      case "audio":
        return (
          <audio controls className="w-full mb-2">
            <source src={src} type="audio/mpeg" />
            Trình duyệt không hỗ trợ audio.
          </audio>
        );
      case "video":
        return (
          <video controls className="w-full h-36 rounded mb-2 object-cover">
            <source src={src} type="video/mp4" />
            Trình duyệt không hỗ trợ video.
          </video>
        );
      default:
        return (
          <div className="w-full h-36 bg-gray-700 rounded flex items-center justify-center text-sm text-gray-400 mb-2">
            📁 Không hỗ trợ xem trước
          </div>
        );
    }
  };

  const handleBuy = async (item) => {
    if (!account) {
      alert("⚠️ Vui lòng kết nối ví trước khi mua NFT.");
      return;
    }

    if (item.seller?.toLowerCase() === account.toLowerCase()) {
      alert("⚠️ Bạn không thể mua NFT của chính mình.");
      return;
    }

    try {
      console.log("🧾 Thực hiện mua NFT:", {
        tokenId: item.tokenId,
        price: Web3.utils.fromWei(item.price.toString(), "ether") + " ETH",
      });

      await buyNFT(item.tokenId);
      alert("🎉 Mua NFT thành công!");
    } catch (err) {
      console.error("❌ Giao dịch mua thất bại:", err);
      alert("❌ Giao dịch mua thất bại!");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">🛍️ Danh sách NFT đang bán</h2>

      {listedNFTs.length === 0 ? (
        <p className="text-gray-400">😔 Hiện chưa có NFT nào được niêm yết.</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {listedNFTs.map((item) => (
            <div
              key={item.tokenId}
              className="bg-gray-800 text-white p-4 rounded-xl w-60 shadow"
            >
              {renderMedia(item.type, item.media, item.tokenId)}

              <p><b>🌸 Tên:</b> {item.name || "Không rõ"}</p>
              <p>
                <b>💰 Giá:</b>{" "}
                {item.price
                  ? `${Web3.utils.fromWei(item.price.toString(), "ether")} ETH`
                  : "Không rõ"}
              </p>
              <p>
                <b>👤 Bán bởi:</b>{" "}
                {item.seller
                  ? `${item.seller.slice(0, 6)}...${item.seller.slice(-4)}`
                  : "Không rõ"}
              </p>

              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleBuy(item)}
                  className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500 text-sm"
                >
                  🛒 Mua NFT
                </button>
                <button
                  onClick={() => navigate(`/products/${item.tokenId}`)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                >
                  🔍 Chi tiết
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
