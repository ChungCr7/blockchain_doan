import { useEffect, useState, useCallback } from "react";
import Web3 from "web3";
import ABI from "../contract/NFTMarketplaceABI.json";
import { CONTRACT_ADDRESS } from "../constants/contract";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/pinata";

const useMarketplace = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageFile: null,
    price: "",
    type: "image",
  });
  const [listedNFTs, setListedNFTs] = useState([]);

  // Kết nối ví và khởi tạo contract
  useEffect(() => {
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
    connectWallet();
  }, []);

  // Tạo NFT
  const createNFT = async () => {
    const { name, description, price, type, imageFile } = form;

    if (!name || !description || !price || !type || !imageFile) {
      alert("❗ Vui lòng nhập đầy đủ thông tin và chọn file.");
      return;
    }

    try {
      // 1. Upload file lên IPFS
      const mediaURI = await uploadFileToIPFS(imageFile);

      // 2. Tạo metadata
      const metadata = { name, description, mediaURI, type };

      // 3. Upload metadata lên IPFS
      const tokenURI = await uploadJSONToIPFS(metadata);

      // 4. Gọi smart contract
      const web3 = new Web3(window.ethereum);
      const weiPrice = web3.utils.toWei(price, "ether");

      await contract.methods
        .createNFT(tokenURI, name, description, mediaURI, weiPrice)
        .send({ from: account });

      alert("✅ NFT đã được tạo thành công!");

      setForm({
        name: "",
        description: "",
        imageFile: null,
        price: "",
        type: "image",
      });

      fetchListings();
    } catch (err) {
      console.error("❌ Tạo NFT thất bại:", err);
      alert("❌ Giao dịch thất bại.");
    }
  };

  // Lấy metadata từ IPFS
  const getTokenMetadata = useCallback(
    async (tokenId) => {
      try {
        const uri = await contract.methods.tokenURI(tokenId).call();
        const metadataUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
        const res = await fetch(metadataUrl);
        const metadata = await res.json();

        return {
          name: metadata.name || "Không rõ",
          description: metadata.description || "Không có mô tả",
          image: metadata.mediaURI?.replace("ipfs://", "https://ipfs.io/ipfs/") || "",
          type: metadata.type || "image",
        };
      } catch {
        return {
          name: "Không rõ",
          description: "Không có mô tả",
          image: "",
          type: "image",
        };
      }
    },
    [contract]
  );

  // Lấy danh sách NFT
  const fetchListings = useCallback(async () => {
    if (!contract) return;
    const temp = [];

    for (let i = 1; i <= 50; i++) {
      try {
        const listing = await contract.methods.getListing(i).call();

        if (
          listing.tokenId !== "0" &&
          listing.seller !== "0x0000000000000000000000000000000000000000"
        ) {
          const metadata = await getTokenMetadata(listing.tokenId);

          temp.push({
            ...listing,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            type: metadata.type,
          });
        }
      } catch {
        break;
      }
    }

    setListedNFTs(temp);
  }, [contract, getTokenMetadata]);

  // Mua NFT
  const buyNFT = async (tokenId, price) => {
    try {
      await contract.methods.buyNFT(tokenId).send({ from: account, value: price });
      alert("🎉 Mua NFT thành công!");
      fetchListings();
    } catch (err) {
      console.error("❌ Mua thất bại:", err);
      alert("❌ Giao dịch thất bại.");
    }
  };

  useEffect(() => {
    if (contract) fetchListings();
  }, [contract, fetchListings]);

  // ✅ Trả về contract để truyền vào <CreateProduct />
  return {
    account,
    contract,
    form,
    listedNFTs,
    setForm,
    createNFT,
    buyNFT,
  };
};

export default useMarketplace;
