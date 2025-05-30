import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { WalletContext } from "../context/WalletContext";

const shortenAddress = (addr) => {
  if (!addr) return "";
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

const Navbar = () => {
  const { account, connectWallet } = useContext(WalletContext);

  return (
    <nav className="bg-gray-900 text-white shadow px-6 py-4 flex justify-between items-center fixed top-0 left-0 w-full z-50">
      <Link to="/" className="text-yellow-400 font-bold text-xl">🪙 NFT Market</Link>
      
      <ul className="flex gap-6 text-sm">
        <li><Link to="/" className="hover:text-yellow-300">Trang chủ</Link></li>
        <li><Link to="/create" className="hover:text-yellow-300">Tạo NFT</Link></li>
        <li><Link to="/list" className="hover:text-yellow-300">🛠️ Rao bán NFT</Link></li>
        <li><Link to="/products" className="hover:text-yellow-300">Sản phẩm</Link></li> 
        <li><Link to="/market" className="hover:text-yellow-300">Thị trường</Link></li>
        <li><Link to="/collection" className="hover:text-yellow-300">Bộ sưu tập</Link></li>
        {/* <li><Link to="/history" className="hover:text-yellow-300">📜 Lịch sử giao dịch</Link></li> */}
      </ul>

      <div className="flex items-center gap-3">
        {account ? (
          <span className="bg-yellow-400 text-black px-4 py-1 rounded font-mono text-sm">
            {shortenAddress(account)}
          </span>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-yellow-400 text-black px-4 py-1 rounded hover:bg-yellow-500"
          >
            🔗 Kết nối ví
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
