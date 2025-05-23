import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Web3 from "web3";

const ProductDetailPage = ({ listedNFTs, buyNFT }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = listedNFTs.find(
    (item) => item.tokenId.toString() === id
  );

  if (!product) {
    return (
      <div className="text-center text-white mt-10">
        ❌ Không tìm thấy sản phẩm.
      </div>
    );
  }

  // Kiểm tra định dạng tệp để render đúng
  const isImage = (url) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || product.type === "image";

  const isAudio = (url) =>
    /\.(mp3|wav|ogg)$/i.test(url) || product.type === "audio";

  // Chuyển IPFS URI sang HTTP gateway
  const getIpfsUrl = (ipfsUrl) =>
    ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-6 mt-8 rounded-xl text-white shadow-lg">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-yellow-300 hover:underline"
      >
        ⬅️ Quay lại
      </button>

      <h2 className="text-2xl font-bold mb-4">📦 Chi tiết sản phẩm</h2>

      {/* Render media */}
      {isImage(product.image) ? (
        <img
          src={getIpfsUrl(product.image)}
          alt={product.name}
          className="w-full h-64 object-cover rounded mb-4 cursor-pointer hover:opacity-90"
          onClick={() => window.open(getIpfsUrl(product.image), "_blank")}
        />
      ) : isAudio(product.image) ? (
        <audio
          controls
          className="w-full mb-4"
          src={getIpfsUrl(product.image)}
        >
          Trình duyệt không hỗ trợ audio
        </audio>
      ) : (
        <div className="w-full h-64 bg-gray-700 rounded mb-4 flex items-center justify-center">
          📁 Tệp không hỗ trợ xem trước
        </div>
      )}

      {/* Thông tin sản phẩm */}
      <div className="space-y-2">
        <p>
          <b>🌸 Tên:</b> {product.name}
        </p>
        <p>
          <b>📄 Mô tả:</b> {product.description}
        </p>
        <p>
          <b>💰 Giá:</b> {Web3.utils.fromWei(product.price, "ether")} ETH
        </p>
        <p>
          <b>👤 Người bán:</b>{" "}
          <span className="break-all">{product.seller}</span>
        </p>
        <p>
          <b>🔖 Loại:</b>{" "}
          {product.type === "image"
            ? "🖼️ Tranh kỹ thuật số"
            : product.type === "audio"
            ? "🎵 Âm nhạc"
            : "📜 Chứng chỉ số"}
        </p>
      </div>

      {/* Nút mua */}
      <button
        onClick={() => buyNFT(product.tokenId, product.price)}
        className="mt-6 w-full bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500 font-semibold"
      >
        🛒 Mua NFT
      </button>
    </div>
  );
};

export default ProductDetailPage;
