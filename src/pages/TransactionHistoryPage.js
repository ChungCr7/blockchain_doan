// src/pages/TransactionHistoryPage.js
import React, { useEffect, useState } from "react";
// import Web3 from "web3";
import { ipfsToHttp } from "../utils/media"; // bạn có thể tạo file media.js nếu chưa có

const TransactionHistoryPage = ({ listedNFTs, account, contract }) => {
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [createdNFTs, setCreatedNFTs] = useState([]);

  useEffect(() => {
    if (!account || !contract || !listedNFTs.length) return;

    const fetchHistory = async () => {
      const owned = [];
      const created = [];

      for (const item of listedNFTs) {
        try {
          const owner = await contract.methods.ownerOf(item.tokenId).call();

          if (owner.toLowerCase() === account.toLowerCase()) {
            owned.push(item);
          }

          if (item.seller.toLowerCase() === account.toLowerCase()) {
            created.push(item);
          }
        } catch (err) {
          console.error("Error tokenId:", item.tokenId, err);
        }
      }

      setOwnedNFTs(owned);
      setCreatedNFTs(created);
    };

    fetchHistory();
  }, [account, contract, listedNFTs]);

  return (
    <div className="text-white p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📜 Lịch sử giao dịch</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">🎁 NFT bạn đã mua</h3>
        {ownedNFTs.length === 0 ? (
          <p className="text-gray-400">Bạn chưa mua NFT nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ownedNFTs.map((nft) => (
              <div key={nft.tokenId} className="bg-gray-800 p-4 rounded-xl">
                <img
                  src={ipfsToHttp(nft.image)}
                  alt={nft.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <p><b>{nft.name}</b></p>
                <p className="text-sm text-gray-400">{nft.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">🖌️ NFT bạn đã tạo</h3>
        {createdNFTs.length === 0 ? (
          <p className="text-gray-400">Bạn chưa tạo NFT nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {createdNFTs.map((nft) => (
              <div key={nft.tokenId} className="bg-gray-800 p-4 rounded-xl">
                <img
                  src={ipfsToHttp(nft.image)}
                  alt={nft.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <p><b>{nft.name}</b></p>
                <p className="text-sm text-gray-400">{nft.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
