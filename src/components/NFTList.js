import React, { useState } from "react";
import Web3 from "web3";

const NFTList = ({ listedNFTs, buyNFT }) => {
  const [selected, setSelected] = useState(null);

  const toggleDetail = (tokenId) => {
    if (selected === tokenId) {
      setSelected(null);
    } else {
      setSelected(tokenId);
    }
  };

  return (
    <>
      <h2>🖼️ Danh sách NFT đang bán</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {listedNFTs.map((item, index) => (
          <div
            key={index}
            onClick={() => toggleDetail(item.tokenId)}
            style={{
              border: "1px solid #ccc",
              padding: 10,
              width: 240,
              cursor: "pointer",
              boxShadow: selected === item.tokenId ? "0 0 10px purple" : "none"
            }}
          >
            {item.image && (
              <img
                src={item.image}
                alt={`NFT ${item.tokenId}`}
                style={{ width: "100%", height: 200, objectFit: "cover" }}
              />
            )}
            <p><b>🌸 Tên:</b> {item.name}</p>

            {selected === item.tokenId && (
              <>
                <p><b>💰 Giá:</b> {Web3.utils.fromWei(item.price, "ether")} ETH</p>
                <p><b>📄 Mô tả:</b> {item.description}</p>
                <p><b>👤 Người bán:</b> {item.seller?.slice(0, 6)}...</p>
                <button onClick={(e) => {
                  e.stopPropagation();
                  buyNFT(item.tokenId, item.price);
                }}>
                  🛒 Mua NFT
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default NFTList;
