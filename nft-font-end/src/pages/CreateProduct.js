import React, { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/pinata";
import Web3 from "web3";

const MAX_FILE_SIZE_MB = 100;

const CreateProduct = ({ form, setForm, contract, account, fetchListings }) => {
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      alert("❌ File vượt quá giới hạn 100MB.");
      return;
    }

    const fileType = file.type.split("/")[0];
    setForm((prev) => ({
      ...prev,
      mediaFile: file,
      mediaType: fileType,
    }));
  };

  const createNFT = async () => {
    if (!contract || !account) {
      alert("⚠️ Vui lòng kết nối ví Trust Wallet (hoặc ví hỗ trợ WalletConnect) trước khi tạo NFT.");
      return;
    }

    const { name, description, mediaFile, mediaType, price } = form;

    if (!name || !description || !mediaFile || !mediaType) {
      alert("❗ Vui lòng nhập đầy đủ thông tin và chọn file media.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Upload file media lên IPFS (Pinata)
      const mediaURI = await uploadFileToIPFS(mediaFile);
      console.log("✅ File IPFS URI:", mediaURI);

      // 2️⃣ Upload metadata JSON lên IPFS
      const metadata = { name, description, mediaURI, type: mediaType };
      const tokenURI = await uploadJSONToIPFS(metadata);
      console.log("✅ Metadata URI:", tokenURI);

      // 3️⃣ Chuyển giá ETH sang Wei (mặc định 0.001 nếu trống)
      const web3 = new Web3(window.ethereum);
      const weiPrice = web3.utils.toWei(
        price && price !== "" ? price.toString() : "0.001",
        "ether"
      );

      // 4️⃣ Gọi smart contract tạo NFT
      const tx = await contract.methods
        .createNFT(tokenURI, name, description, mediaURI, weiPrice)
        .send({ from: account });

      console.log("📦 Transaction:", tx);

      const tokenId = tx.events?.NFTCreated?.returnValues?.tokenId;
      alert(`✅ NFT #${tokenId} đã được tạo thành công!`);

      // 5️⃣ (Tuỳ chọn) Nếu có giá, đã auto-list trong contract rồi nên không cần listNFT nữa
      // Nhưng nếu bạn muốn list lại thủ công, có thể gọi listNFT ở đây.

      // 6️⃣ Reset form sau khi tạo thành công
      setForm({
        name: "",
        description: "",
        mediaFile: null,
        mediaType: "",
        price: "",
      });

      // 7️⃣ Cập nhật danh sách NFT hiển thị ngoài UI
      if (fetchListings) fetchListings();
    } catch (err) {
      console.error("❌ Lỗi khi tạo NFT:", err);
      alert("❌ Giao dịch thất bại! Vui lòng kiểm tra lại Trust Wallet hoặc số dư ví.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-gray-800 p-6 rounded-xl text-white max-w-xl mx-auto shadow-lg">
      <h2 className="text-xl font-bold">🎨 Tạo NFT Mới</h2>

      {/* --- Tên NFT --- */}
      <div>
        <label className="block text-sm font-medium">Tên NFT</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-900 rounded mt-1 text-white"
          placeholder="VD: Em của ngày hôm nay"
        />
      </div>

      {/* --- Mô tả NFT --- */}
      <div>
        <label className="block text-sm font-medium">Mô tả</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-900 rounded mt-1 text-white"
          placeholder="Mô tả ngắn về sản phẩm NFT"
        />
      </div>

      {/* --- File NFT (ảnh, nhạc, video) --- */}
      <div>
        <label className="block text-sm font-medium">
          Chọn file (ảnh / nhạc / video)
        </label>
        <input
          type="file"
          accept="image/*,audio/*,video/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 bg-gray-900 rounded mt-1 text-white"
        />
        {form.mediaFile && (
          <p className="text-green-400 text-sm mt-1">
            📁 Đã chọn: {form.mediaFile.name}
          </p>
        )}
      </div>

      {/* --- Giá NFT --- */}
      <div>
        <label className="block text-sm font-medium">
          Giá bán (ETH){" "}
          <span className="text-gray-400">
            (bắt buộc, NFT sẽ được niêm yết tự động)
          </span>
        </label>
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-900 rounded mt-1 text-white"
          placeholder="0.01"
          type="number"
          step="0.001"
          min="0.001"
        />
      </div>

      {/* --- Nút tạo NFT --- */}
      <button
        onClick={createNFT}
        className="w-full bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "⏳ Đang xử lý..." : "🚀 Tạo NFT ngay"}
      </button>
    </div>
  );
};

export default CreateProduct;
