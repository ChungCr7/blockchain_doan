import { useEffect, useState, useCallback } from "react";
import Web3 from "web3";
import ABI from "../contract/NFTMarketplaceABI.json";

const CONTRACT_ADDRESS = "0x8df9426e452bbd940227a9f6c10fbadf70955d89";

const useMarketplace = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    price: ""
  });
  const [listedNFTs, setListedNFTs] = useState([]);

  // Kết nối MetaMask và Smart Contract
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

  // Tạo metadata JSON từ thông tin form
  const prepareMetadata = ({ name, description, image }) => {
    return JSON.stringify(
      {
        name,
        description,
        image: image.startsWith("ipfs://") ? image : `ipfs://${image}`
      },
      null,
      2
    );
  };

  // Gửi yêu cầu tạo NFT
  const createNFT = async () => {
    const { name, description, image, price } = form;
    if (!name || !description || !image || !price) {
      alert("❗ Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const metadata = prepareMetadata({ name, description, image });
    const blob = new Blob([metadata], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "metadata.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const cid = prompt("📥 Dán CID của metadata.json sau khi upload lên IPFS Desktop:");
    if (!cid) return;

    const tokenURI = `ipfs://${cid}`;
    const weiPrice = Web3.utils.toWei(price, "ether");

    try {
      await contract.methods.createNFT(tokenURI, weiPrice).send({ from: account });
      alert("✅ NFT đã được tạo thành công!");
      setForm({ name: "", description: "", image: "", price: "" });
      fetchListings();
    } catch (err) {
      console.error(err);
      alert("❌ Giao dịch thất bại.");
    }
  };

  // Lấy metadata (name, description, image) từ IPFS
  const getTokenMetadata = useCallback(async (tokenId) => {
    try {
      const uri = await contract.methods.tokenURI(tokenId).call();
      const metadataUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const res = await fetch(metadataUrl);
      const metadata = await res.json();

      return {
        name: metadata.name || "",
        description: metadata.description || "",
        image: metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || ""
      };
    } catch {
      return {
        name: "",
        description: "",
        image: ""
      };
    }
  }, [contract]);

  // Lấy danh sách NFT đang bán
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
            image: metadata.image
          });
        }
      } catch {
        break;
      }
    }

    setListedNFTs(temp);
  }, [contract, getTokenMetadata]);

  // Gửi yêu cầu mua NFT
  const buyNFT = async (tokenId, price) => {
    try {
      await contract.methods.buyNFT(tokenId).send({ from: account, value: price });
      alert("🎉 Mua NFT thành công!");
      fetchListings();
    } catch {
      alert("❌ Giao dịch thất bại.");
    }
  };

  // Tự động load danh sách NFT sau khi contract sẵn sàng
  useEffect(() => {
    if (contract) fetchListings();
  }, [contract, fetchListings]);

  return {
    account,
    form,
    listedNFTs,
    setForm,
    createNFT,
    buyNFT
  };
};

export default useMarketplace;
