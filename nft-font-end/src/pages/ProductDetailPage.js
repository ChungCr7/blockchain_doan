import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Web3 from "web3";
import { ipfsToHttp } from "../utils/ipfs";

const ProductDetailPage = ({ listedNFTs, buyNFT, account }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = listedNFTs.find((item) => item.tokenId.toString() === id);

  if (!product) {
    return (
      <div className="text-center text-white mt-10">
        ❌ Không tìm thấy sản phẩm.
      </div>
    );
  }

  const mediaUrl = ipfsToHttp(product.media || "");
  const isImage = product.type === "image";
  const isAudio = product.type === "audio";
  const isVideo = product.type === "video";

  const renderMedia = () => {
    if (!product.media) {
      return (
        <div className="w-full h-64 bg-gray-700 rounded mb-4 flex items-center justify-center">
          ❌ Không có media
        </div>
      );
    }

    if (isImage) {
      return (
        <img
          src={mediaUrl}
          alt={product.name}
          className="w-full h-64 object-cover rounded mb-4 cursor-pointer hover:opacity-90"
          onClick={() => window.open(mediaUrl, "_blank")}
        />
      );
    }

    if (isAudio) {
      return (
        <audio controls className="w-full mb-4">
          <source src={mediaUrl} type="audio/mpeg" />
          Trình duyệt không hỗ trợ audio.
        </audio>
      );
    }

    if (isVideo) {
      return (
        <video controls className="w-full h-64 rounded mb-4 object-cover">
          <source src={mediaUrl} type="video/mp4" />
          Trình duyệt không hỗ trợ video.
        </video>
      );
    }

    return (
      <div className="w-full h-64 bg-gray-700 rounded mb-4 flex items-center justify-center">
        📁 Không hỗ trợ xem trước
      </div>
    );
  };

  const handleBuy = async () => {
    if (!account) {
      alert("⚠️ Vui lòng kết nối ví trước khi mua NFT.");
      return;
    }

    if (product.seller?.toLowerCase() === account.toLowerCase()) {
      alert("⚠️ Bạn không thể mua NFT của chính mình.");
      return;
    }

    try {
      console.log("🧾 Mua NFT:", {
        tokenId: product.tokenId,
        price: Web3.utils.fromWei(product.price.toString(), "ether") + " ETH",
      });

      await buyNFT(product.tokenId);
      alert("🎉 Mua NFT thành công!");
    } catch (err) {
      console.error("❌ Giao dịch thất bại:", err);
      alert("❌ Giao dịch mua thất bại!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-6 mt-8 rounded-xl text-white shadow-lg">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-yellow-300 hover:underline"
      >
        ⬅️ Quay lại
      </button>

      <h2 className="text-2xl font-bold mb-4">📦 Chi tiết sản phẩm</h2>

      {renderMedia()}

      <div className="space-y-2">
        <p>
          <b>🌸 Tên:</b> {product.name || "Không rõ"}
        </p>
        <p>
          <b>📄 Mô tả:</b> {product.description || "Không có mô tả"}
        </p>
        <p>
          <b>💰 Giá:</b> {Web3.utils.fromWei(product.price.toString(), "ether")} ETH
        </p>
        <p>
          <b>👤 Người bán:</b>{" "}
          <span className="break-all">
            {product.seller || "Không rõ"}
          </span>
        </p>
        <p>
          <b>🔖 Loại:</b>{" "}
          {product.type === "image"
            ? "🖼️ Tranh kỹ thuật số"
            : product.type === "audio"
            ? "🎵 Âm nhạc"
            : product.type === "video"
            ? "🎞️ Video"
            : "📜 Chứng chỉ số"}
        </p>
      </div>

      <button
        onClick={handleBuy}
        className="mt-6 w-full bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500 font-semibold"
      >
        🛒 Mua NFT
      </button>
    </div>
  );
};

export default ProductDetailPage;
