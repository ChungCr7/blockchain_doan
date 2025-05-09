import React from "react";

const NFTForm = ({ form, setForm, createNFT }) => {
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-4 bg-gray-800 p-6 rounded-xl text-white">
      <h2 className="text-xl font-bold">🎨 Tạo NFT mới</h2>

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
        <label className="block text-sm">CID của nội dung IPFS</label>
        <input
          name="image"
          value={form.image}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-gray-900 rounded mt-1"
          placeholder="Vui lòng nhập mã CID của sản phẩm"
        />
        <p className="text-xs text-gray-400 mt-1">
          Chỉ cần dán mã CID (không cần thêm <code>ipfs://</code>)
        </p>
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
        className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500"
      >
        🚀 Tạo NFT
      </button>
    </div>
  );
};

export default NFTForm;
