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
    return <p className="text-center text-gray-400">❌ Không tìm thấy sản phẩm.</p>;
  }

  const isImage = (url) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes("Qm");

  const isAudio = (url) =>
    /\.(mp3|wav|ogg)$/i.test(url) || url.includes("audio");

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-xl text-white">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-yellow-300 hover:underline"
      >
        ⬅️ Quay lại
      </button>

      <h2 className="text-2xl font-bold mb-4">📦 Chi tiết sản phẩm</h2>

      {isImage(product.image) ? (
        <img
          src={product.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
          alt={product.name}
          className="w-full h-64 object-cover rounded mb-4 cursor-pointer hover:opacity-90"
          onClick={() =>
            window.open(
              product.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
              "_blank"
            )
          }
        />
      ) : isAudio(product.image) ? (
        <audio
          controls
          className="w-full mb-4"
          src={product.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
        >
          Trình duyệt không hỗ trợ audio
        </audio>
      ) : (
        <div className="w-full h-64 bg-gray-700 rounded mb-4 flex items-center justify-center">
          📁 Tệp không hỗ trợ xem trước
        </div>
      )}

      <p><b>🌸 Tên:</b> {product.name}</p>
      <p><b>📄 Mô tả:</b> {product.description}</p>
      <p><b>💰 Giá:</b> {Web3.utils.fromWei(product.price, "ether")} ETH</p>
      <p><b>👤 Người bán:</b> {product.seller}</p>

      <button
        onClick={() => buyNFT(product.tokenId, product.price)}
        className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500"
      >
        🛒 Mua NFT
      </button>
    </div>
  );
};

export default ProductDetailPage;
