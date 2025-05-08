import React from "react";

const NFTForm = ({ form, setForm, createNFT }) => (
  <>
    <h2>🎨 Tạo NFT mới</h2>

    <input
      type="text"
      placeholder="Tên NFT"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      style={{ width: 400 }}
    /><br /><br />

    <textarea
      placeholder="Mô tả NFT"
      value={form.description}
      onChange={(e) => setForm({ ...form, description: e.target.value })}
      style={{ width: 400, height: 80 }}
    /><br /><br />

    <input
      type="text"
      placeholder="CID hình ảnh (không cần ipfs://)"
      value={form.image}
      onChange={(e) => setForm({ ...form, image: e.target.value })}
      style={{ width: 400 }}
    /><br /><br />

    <input
      type="text"
      placeholder="Giá bán (ETH)"
      value={form.price}
      onChange={(e) => setForm({ ...form, price: e.target.value })}
      style={{ width: 200 }}
    /><br /><br />

    <button onClick={createNFT}>🚀 Tạo NFT</button>
  </>
);

export default NFTForm;
