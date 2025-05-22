import React, { useState } from "react";
import Web3 from "web3";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/pinata";

const CreateProduct = ({ form, setForm, contract }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setForm({ ...form, imageFile: e.target.files[0] }); // đồng bộ với useMarketplace
  };

  const createNFT = async () => {
    if (!contract) {
      alert("⚠️ Hợp đồng chưa sẵn sàng. Vui lòng thử lại sau.");
      return;
    }

    const { name, description, price, type, imageFile } = form;
    if (!name || !description || !price || !type || !imageFile) {
      alert("❗ Vui lòng nhập đầy đủ thông tin và chọn file.");
      return;
    }

    try {
      setLoading(true);

      // 1. Upload file gốc (ảnh/nhạc/chứng chỉ)
      const mediaURI = await uploadFileToIPFS(imageFile);

      // 2. Tạo metadata và upload lên IPFS
      const metadata = { name, description, mediaURI, type };
      const tokenURI = await uploadJSONToIPFS(metadata);

      // 3. Chuyển đổi ETH sang Wei
      const web3 = new Web3(window.ethereum);
      const weiPrice = web3.utils.toWei(price, "ether");

      // 4. Gọi smart contract
      await contract.methods
        .createNFT(tokenURI, name, description, mediaURI, weiPrice)
        .send({ from: window.ethereum.selectedAddress });

      alert("✅ NFT đã được tạo thành công!");

      // Reset form
      setForm({
        name: "",
        description: "",
        imageFile: null,
        price: "",
        type: "image",
      });
      setFile(null);
    } catch (err) {
      console.error("❌ Lỗi tạo NFT:", err);
      alert("❌ Giao dịch thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-gray-800 p-6 rounded-xl text-white">
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
        <label className="block text-sm">Chọn file nội dung (ảnh/nhạc/chứng chỉ)</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full px-3 py-2 bg-gray-900 rounded mt-1 text-white"
        />
      </div>

      <div>
        <label className="block text-sm">Giá bán (ETH)</label>
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-900 rounded mt-1"
          placeholder="0.01"
        />
      </div>

      <div>
        <label className="block text-sm">Loại sản phẩm</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-900 rounded mt-1"
        >
          <option value="">-- Chọn loại NFT --</option>
          <option value="image">🖼️ Tranh kỹ thuật số</option>
          <option value="audio">🎵 Âm nhạc</option>
          <option value="certificate">📜 Chứng chỉ số</option>
        </select>
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
