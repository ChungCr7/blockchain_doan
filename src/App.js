import React, { useEffect, useState, useCallback } from "react";
import Web3 from "web3";
import ABI from "./contract/NFTMarketplaceABI.json";

const CONTRACT_ADDRESS = "0x8df9426e452bbd940227a9f6c10fbadf70955d89";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [form, setForm] = useState({ uri: "", price: "" });
  const [listedNFTs, setListedNFTs] = useState([]);

  // 🧠 Kết nối ví và smart contract
  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const instance = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
      setContract(instance);
    } else {
      alert("Bạn cần cài MetaMask để sử dụng ứng dụng này!");
    }
  };

  // 🖼️ Lấy ảnh từ tokenURI (metadata)
  const getTokenImage = async (tokenId) => {
    try {
      const uri = await contract.methods.tokenURI(tokenId).call();
      const cidUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const res = await fetch(cidUrl);
      const metadata = await res.json();
      return metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
    } catch (e) {
      return null;
    }
  };

  // 📦 Lấy danh sách NFT đang bán + ảnh
  const fetchListings = useCallback(async () => {
    if (!contract) return;
    let temp = [];
    for (let i = 1; i <= 50; i++) {
      try {
        const listing = await contract.methods.getListing(i).call();
        if (listing.tokenId !== "0" && listing.seller !== "0x0000000000000000000000000000000000000000") {
          const image = await getTokenImage(listing.tokenId);
          temp.push({ ...listing, image });
        }
      } catch (e) {
        break;
      }
    }
    setListedNFTs(temp);
  }, [contract, getTokenImage]); // ✅ thêm getTokenImage
  
  // 🧾 Tạo NFT mới
  const createNFT = async () => {
    if (!form.uri || !form.price) {
      alert("Vui lòng nhập đủ tokenURI và giá");
      return;
    }

    const weiPrice = Web3.utils.toWei(form.price, "ether");

    try {
      await contract.methods.createNFT(form.uri, weiPrice).send({ from: account });
      alert("✅ NFT đã được tạo thành công!");
      setForm({ uri: "", price: "" });
      fetchListings();
    } catch (error) {
      console.error(error);
      alert("❌ Có lỗi khi tạo NFT. Kiểm tra lại thông tin!");
    }
  };

  // 💸 Mua NFT
  const buyNFT = async (tokenId, price) => {
    try {
      await contract.methods.buyNFT(tokenId).send({ from: account, value: price });
      alert("🎉 Mua NFT thành công!");
      fetchListings();
    } catch (e) {
      alert("❌ Giao dịch thất bại!");
    }
  };

  // ⏱️ Tự động load danh sách NFT khi đã kết nối contract
  useEffect(() => {
    if (contract) {
      fetchListings();
    }
  }, [contract, fetchListings]);

  // 🖥️ UI
  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      <h1>🛒 NFT Marketplace</h1>
      <p>👛 Địa chỉ ví: <b>{account}</b></p>

      <hr />

      <h2>🎨 Tạo NFT mới</h2>
      <input
        type="text"
        name="uri"
        placeholder="Token URI (ipfs://...)"
        value={form.uri}
        onChange={(e) => setForm({ ...form, uri: e.target.value })}
        style={{ width: 400 }}
      /><br /><br />
      <input
        type="text"
        name="price"
        placeholder="Giá bán (ETH)"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        style={{ width: 200 }}
      /><br /><br />
      <button onClick={createNFT}>🚀 Tạo NFT</button>

      <hr />

      <h2>🖼️ Danh sách NFT đang bán</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {listedNFTs.map((item, index) => (
          <div key={index} style={{ border: "1px solid #ccc", padding: 10, width: 240 }}>
            {item.image && (
              <img
                src={item.image}
                alt={`NFT ${item.tokenId}`}
                style={{ width: "100%", height: 200, objectFit: "cover" }}
              />
            )}
            <p><b>ID:</b> {item.tokenId}</p>
            <p><b>Giá:</b> {item.price ? Web3.utils.fromWei(item.price, "ether") + " ETH" : "Không rõ"}</p>
            <p><b>Người bán:</b> {item.seller?.slice(0, 6)}...</p>
            <button onClick={() => buyNFT(item.tokenId, item.price)}>🛒 Mua NFT</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
