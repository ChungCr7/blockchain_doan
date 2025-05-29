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
      alert("⚠️ Vui lòng kết nối ví trước khi tạo NFT.");
      return;
    }

    const { name, description, mediaFile, mediaType, price } = form;

    if (!name || !description || !mediaFile || !mediaType) {
      alert("❗ Vui lòng nhập đầy đủ thông tin và chọn file.");
      return;
    }

    try {
      setLoading(true);

      // 1. Upload file media lên IPFS
      const mediaURI = await uploadFileToIPFS(mediaFile);

      // 2. Tạo metadata và upload lên IPFS
      const metadata = { name, description, mediaURI, type: mediaType };
      const tokenURI = await uploadJSONToIPFS(metadata);

      // 3. Tạo NFT trên blockchain
      const tx = await contract.methods
        .createNFT(tokenURI, name, description, mediaURI)
        .send({ from: account });

      const tokenId = tx.events?.NFTCreated?.returnValues?.tokenId;
      alert("✅ NFT đã được tạo thành công!");

      // 4. Nếu có giá, tự động niêm yết
      if (price && parseFloat(price) > 0 && tokenId) {
        const web3 = new Web3(window.ethereum);
        const weiPrice = web3.utils.toWei(price.toString(), "ether");

        await contract.methods.listNFT(tokenId, weiPrice).send({ from: account });
        alert("📦 NFT đã được niêm yết thành công!");
      }

      // 5. Reset form
      setForm({
        name: "",
        description: "",
        mediaFile: null,
        mediaType: "",
        price: "",
      });

      if (fetchListings) fetchListings();
    } catch (err) {
      console.error("❌ Lỗi tạo NFT:", err);
      alert("❌ Giao dịch thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-gray-800 p-6 rounded-xl text-white max-w-xl mx-auto">
      <h2 className="text-xl font-bold">🎨 Thêm Sản Phẩm NFT</h2>

      <div>
        <label className="block text-sm">Tên NFT</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-900 rounded mt-1"
          placeholder="VD: Em của ngày hôm nay"
        />
      </div>

      <div>
        <label className="block text-sm">Mô tả</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-900 rounded mt-1"
          placeholder="Mô tả ngắn về sản phẩm"
        />
      </div>

      <div>
        <label className="block text-sm">Chọn file (ảnh / nhạc / video)</label>
        <input
          type="file"
          accept="image/*,audio/*,video/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 bg-gray-900 rounded mt-1 text-white"
        />
      </div>

      <div>
        <label className="block text-sm">Giá bán (ETH) <span className="text-gray-400">(tuỳ chọn, để tự động niêm yết)</span></label>
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-900 rounded mt-1"
          placeholder="0.01"
        />
      </div>

      <button
        onClick={createNFT}
        className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "⏳ Đang xử lý..." : "🚀 Thêm sản phẩm"}
      </button>
    </div>
  );
};

export default CreateProduct;
