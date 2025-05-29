import { useEffect, useState, useCallback } from "react";
import Web3 from "web3";
import ABI from "../contract/NFTMarketplaceABI.json";
import { CONTRACT_ADDRESS } from "../constants/contract";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/pinata";

const MAX_FILE_SIZE_MB = 100;

const useMarketplace = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    mediaFile: null,
    mediaType: "",
    price: "",
  });
  const [listedNFTs, setListedNFTs] = useState([]);

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return alert("⚠️ Cần cài MetaMask");
      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const instance = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
      setAccount(accounts[0]);
      setContract(instance);
    };
    init();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
      alert("❌ File vượt quá 100MB");
      return;
    }

    const mediaType = file.type.split("/")[0];
    setForm((prev) => ({
      ...prev,
      mediaFile: file,
      mediaType,
    }));
  };

  const createNFT = async () => {
    const { name, description, mediaFile, mediaType, price } = form;
    if (!contract || !window.ethereum) return alert("⚠️ Chưa kết nối");

    if (!name || !description || !mediaFile || !mediaType) {
      alert("❗ Nhập đầy đủ thông tin");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const sender = accounts[0];

      const mediaURI = await uploadFileToIPFS(mediaFile);
      const metadata = { name, description, mediaURI, type: mediaType };
      const tokenURI = await uploadJSONToIPFS(metadata);

      const tx = await contract.methods
        .createNFT(tokenURI, name, description, mediaURI)
        .send({ from: sender });

      const tokenId = tx.events?.NFTCreated?.returnValues?.tokenId;
      console.log("🎯 Token ID:", tokenId);

      if (price && parseFloat(price) > 0 && tokenId) {
        const weiPrice = web3.utils.toWei(price.toString(), "ether");
        await contract.methods.listNFT(tokenId, weiPrice).send({ from: sender });
        alert("✅ Tạo & niêm yết thành công!");
      } else {
        alert("✅ Tạo NFT thành công!");
      }

      setForm({
        name: "",
        description: "",
        mediaFile: null,
        mediaType: "",
        price: "",
      });

      fetchListings();
    } catch (err) {
      console.error("❌ Lỗi tạo NFT:", err);
      alert("❌ Thất bại khi tạo NFT");
    }
  };

  const listNFT = async (tokenId, price) => {
    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const sender = accounts[0];

      const weiPrice = web3.utils.toWei(price.toString(), "ether");
      const owner = await contract.methods.ownerOf(tokenId).call();

      if (owner.toLowerCase() !== sender.toLowerCase()) {
        return alert("❌ Không phải chủ sở hữu NFT.");
      }

      await contract.methods.listNFT(tokenId, weiPrice).send({ from: sender });
      alert("✅ NFT đã được đăng bán!");
      fetchListings();
    } catch (err) {
      console.error("❌ Lỗi khi list:", err);
      alert("❌ Không thể đăng bán NFT.");
    }
  };

  const buyNFT = async (tokenId) => {
    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const sender = accounts[0];

      const listing = await contract.methods.listings(tokenId).call();
      const price = listing.price;
      const seller = listing.seller;

      if (seller.toLowerCase() === sender.toLowerCase()) {
        return alert("⚠️ Không thể mua NFT của chính bạn.");
      }

      await contract.methods.buyNFT(tokenId).send({
        from: sender,
        value: price,
      });

      alert("🎉 Mua thành công!");
      fetchListings();
    } catch (err) {
      console.error("❌ Lỗi khi mua:", err);
      alert("❌ Giao dịch mua thất bại.");
    }
  };

  const getTokenMetadata = useCallback(
    async (tokenId) => {
      try {
        const uri = await contract.methods.tokenURI(tokenId).call();
        const metadataUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
        const res = await fetch(metadataUrl);
        const data = await res.json();

        return {
          name: data.name,
          description: data.description,
          media: data.mediaURI?.replace("ipfs://", "https://ipfs.io/ipfs/") || "",
          type: data.type,
        };
      } catch {
        return {
          name: "Không rõ",
          description: "Không có mô tả",
          media: "",
          type: "image",
        };
      }
    },
    [contract]
  );

  const fetchListings = useCallback(async () => {
    if (!contract) return;

    try {
      const raw = await contract.methods.getActiveListings().call();
      const result = [];

      for (const item of raw) {
        const meta = await getTokenMetadata(item.tokenId);
        result.push({
          ...item,
          name: meta.name,
          description: meta.description,
          media: meta.media,
          type: meta.type,
        });
      }

      setListedNFTs(result);
    } catch (err) {
      console.error("❌ Không thể lấy danh sách:", err);
    }
  }, [contract, getTokenMetadata]);

  useEffect(() => {
    if (contract) fetchListings();
  }, [contract, fetchListings]);

  return {
    account,
    contract,
    form,
    listedNFTs,
    setForm,
    handleFileChange,
    createNFT,
    listNFT,
    buyNFT,
  };
};

export default useMarketplace;
