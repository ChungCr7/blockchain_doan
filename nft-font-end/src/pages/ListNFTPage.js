import React, { useEffect, useState, useCallback } from "react";

const ListNFTPage = ({ contract, account, listNFT }) => {
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchOwnedNFTs = useCallback(async () => {
    if (!contract || !account) return;
    setLoading(true);

    try {
      const total = await contract.methods.totalSupply().call();
      const results = [];

      for (let i = 1; i <= total; i++) {
        const owner = await contract.methods.ownerOf(i).call();
        const listing = await contract.methods.listings(i).call();

        if (
          owner.toLowerCase() === account.toLowerCase() &&
          !listing.isListed
        ) {
          const uri = await contract.methods.tokenURI(i).call();
          const metadataUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
          const res = await fetch(metadataUrl);
          const meta = await res.json();

          results.push({
            tokenId: i,
            name: meta.name || "Không tên",
            description: meta.description || "",
            media: meta.mediaURI?.replace("ipfs://", "https://ipfs.io/ipfs/"),
            type: meta.type || "image",
          });
        }
      }

      setOwnedNFTs(results);
    } catch (err) {
      console.error("❌ Lỗi khi fetch NFT:", err);
    } finally {
      setLoading(false);
    }
  }, [contract, account]);

  useEffect(() => {
    fetchOwnedNFTs();
  }, [fetchOwnedNFTs]);

  const handlePriceChange = (e, tokenId) => {
    setPrices((prev) => ({ ...prev, [tokenId]: e.target.value }));
  };

  const handleList = async (tokenId) => {
    const price = prices[tokenId];
    if (!price || parseFloat(price) <= 0) {
      return alert("⚠️ Vui lòng nhập giá hợp lệ.");
    }

    try {
      await listNFT(tokenId, price);
      alert(`✅ NFT #${tokenId} đã được đăng bán.`);
      fetchOwnedNFTs();
    } catch (err) {
      console.error("❌ Lỗi khi đăng bán NFT:", err);
      alert("❌ Không thể đăng bán NFT.");
    }
  };

  const renderMedia = (type, src) => {
    if (type === "image") return <img src={src} alt="" className="w-40 mt-2 rounded" />;
    if (type === "audio") return <audio src={src} controls className="mt-2" />;
    if (type === "video") return <video src={src} controls className="mt-2 w-64" />;
    return null;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto mt-10 text-white">
      <h2 className="text-2xl font-bold mb-4">📦 NFT bạn sở hữu</h2>

      {loading ? (
        <p className="text-center text-gray-400">⏳ Đang tải NFT...</p>
      ) : ownedNFTs.length === 0 ? (
        <p className="text-center text-gray-400">
          😢 Bạn chưa có NFT nào để đăng bán.
        </p>
      ) : (
        ownedNFTs.map((item) => (
          <div key={item.tokenId} className="border rounded-lg p-4 bg-gray-800 shadow">
            <h3 className="text-xl font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-300">{item.description}</p>
            {renderMedia(item.type, item.media)}

            <div className="mt-4 flex items-center space-x-2">
              <input
                type="number"
                step="0.001"
                min="0"
                placeholder="Giá bán (ETH)"
                value={prices[item.tokenId] || ""}
                onChange={(e) => handlePriceChange(e, item.tokenId)}
                className="px-2 py-1 rounded bg-gray-900 text-white border w-32"
              />
              <button
                onClick={() => handleList(item.tokenId)}
                className="bg-yellow-400 text-black px-4 py-1 rounded hover:bg-yellow-500"
              >
                Đăng bán
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ListNFTPage;
